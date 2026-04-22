<?php

namespace App\Http\Controllers;

use App\Enums\VMSessionStatus;
use App\Events\VMSessionActivated;
use App\Events\VMSessionCreated;
use App\Http\Requests\CreateVMSessionRequest;
use App\Http\Requests\ExtendVMSessionRequest;
use App\Http\Requests\TerminateVMSessionRequest;
use App\Http\Resources\VMSessionResource;
use App\Jobs\TerminateVMJob;
use App\Models\ProxmoxNode;
use App\Models\VMSession;
use App\Repositories\VMSessionRepository;
use App\Services\ExtendSessionService;
use App\Services\GuacamoleClientInterface;
use App\Services\ProxmoxClient;
use App\Services\QuotaService;
use App\Services\VMSessionCleanupService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

/**
 * Controller for VM session API endpoints.
 */
class VMSessionController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct(
        private readonly VMSessionRepository $sessionRepository,
        private readonly VMSessionCleanupService $cleanupService,
        private readonly ExtendSessionService $extendSessionService,
        private readonly QuotaService $quotaService,
    ) {}

    /**
     * Get all sessions for the authenticated user.
     * Returns Inertia page for browser requests, JSON for XHR.
     */
    public function index(Request $request): JsonResponse|InertiaResponse
    {
        // Lazy expiration: mark overdue sessions before listing so the
        // frontend always sees correct statuses without queue:work.
        $this->cleanupService->expireOverdueSessions();

        $sessions = $this->sessionRepository->findByUser($request->user());

        if ($request->wantsJson()) {
            return response()->json([
                'data' => VMSessionResource::collection($sessions),
            ]);
        }

        return Inertia::render('sessions/index');
    }

    /**
     * Create a new VM session.
     *
     * Validates quotas before provisioning. Uses provided duration or falls back
     * to the configured default.
     */
    public function store(CreateVMSessionRequest $request): JsonResponse
    {
        $durationMinutes = $request->getDurationMinutes();

        try {
            // always create a session for the supplied existing VM
            $node = ProxmoxNode::findOrFail($request->validated('node_id'));
            $serverId = $node->proxmox_server_id;

            Log::info('Creating session for existing VM', [
                'user_id' => $request->user()->id,
                'vmid' => $request->validated('vmid'),
                'node_id' => $node->id,
                'duration_minutes' => $durationMinutes,
            ]);

            $this->quotaService->assertAllowedToCreate($request->user(), $durationMinutes);

            // Determine protocol order: explicit param, connection preference override,
            // or fallback default (rdp) to avoid null values that would break the resource.
            $protocol = $request->validated('protocol')
                ?? $request->validated('connection_preference_protocol')
                ?? 'rdp';

            $sessionData = [
                'user_id' => $request->user()->id,
                'proxmox_server_id' => $serverId,
                'node_id' => $node->id,
                'vm_id' => $request->validated('vmid'),
                'status' => VMSessionStatus::PENDING,
                'protocol' => $protocol,
                'connection_profile_name' => $request->validated('connection_preference_profile'),
                'expires_at' => now()->addMinutes($durationMinutes),
                'credentials' => array_filter([
                    'username' => $request->validated('username'),
                    'password' => $request->validated('password'),
                ]),
                'return_snapshot' => $request->validated('return_snapshot'),
            ];

            $session = $this->sessionRepository->create($sessionData);

            Log::info('Session record created, activating synchronously', [
                'session_id' => $session->id,
                'expires_at' => $session->expires_at->toIso8601String(),
            ]);

            event(new VMSessionCreated($session));

            // VMSessionActivated listener runs synchronously — starts VM, resolves
            // IP, creates Guacamole connection, and marks session ACTIVE.  If it
            // fails, the session is marked FAILED and an exception propagates here.
            event(new VMSessionActivated($session));

            // Reload to pick up changes made by the listener
            $session->refresh();

            return response()->json(new VMSessionResource($session), 201);
        } catch (\Exception $e) {
            Log::warning('Failed to create VM session', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json(
                [
                    'message' => 'Cannot create session',
                    'error' => $e->getMessage(),
                ],
                422
            );
        }
    }

    /**
     * List available snapshots for a session's VM.
     *
     * Only returns snapshots if the session has a VM provisioned on a node.
     * Only the session owner (or an admin) may list snapshots.
     */
    public function snapshots(Request $request, string $sessionId): JsonResponse
    {
        $session = VMSession::with(['node', 'proxmoxServer'])->findOrFail($sessionId);

        if ($session->user_id !== $request->user()->id) {
            Gate::authorize('admin-only');
        }

        // Cannot list snapshots without a provisioned VM
        if (! $session->vm_id || ! $session->proxmoxServer || ! $session->node) {
            return response()->json(['data' => []], 200);
        }

        try {
            $client = new ProxmoxClient($session->proxmoxServer);
            $snapshots = $client->listSnapshots($session->node->name, $session->vm_id);

            return response()->json(['data' => $snapshots], 200);
        } catch (\Exception $e) {
            Log::warning('Failed to list VM snapshots', [
                'session_id' => $session->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json(['data' => [], 'message' => 'Could not retrieve snapshots'], 200);
        }
    }

    /**
     * Get a specific session.
     * Returns Inertia page for browser requests, JSON for XHR.
     *
     * @throws AuthorizationException
     */
    public function show(Request $request, string $sessionId): JsonResponse|InertiaResponse|
    RedirectResponse
    {
        $session = VMSession::findOrFail($sessionId);

        // Ensure user can only see their own sessions
        if ($session->user_id !== $request->user()->id) {
            Gate::authorize('admin-only');
        }

        // Lazy expiration: if session is past its expiry but still marked
        // active/pending/provisioning, expire it now so the user sees the
        // correct state without needing a queue worker.
        $isTimeExpired = $session->expires_at && $session->expires_at->isPast();
        if ($isTimeExpired && in_array($session->status, [
            VMSessionStatus::ACTIVE,
            VMSessionStatus::PENDING,
            VMSessionStatus::PROVISIONING,
        ], true)) {
            // Best-effort Guacamole cleanup on lazy expiration
            if ($session->guacamole_connection_id) {
                try {
                    app(GuacamoleClientInterface::class)
                        ->deleteConnection((string) $session->guacamole_connection_id);
                } catch (\Throwable $e) {
                    Log::warning('Lazy expiration: failed to delete Guacamole connection', [
                        'session_id' => $session->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
            $session->update([
                'status' => VMSessionStatus::EXPIRED,
                'guacamole_connection_id' => null,
            ]);
            $session->refresh();
        }

        $isEnded = in_array($session->status, [
            VMSessionStatus::EXPIRED,
            VMSessionStatus::TERMINATED,
            VMSessionStatus::FAILED,
        ], true);

        if ($isEnded) {
            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Session is no longer available',
                ], 404);
            }

            return redirect()->route('dashboard')
                ->with('error', 'The requested session has expired or ended.');
        }

        if ($request->wantsJson()) {
            return response()->json(
                new VMSessionResource($session)
            );
        }

        return Inertia::render('sessions/show', [
            'session' => new VMSessionResource($session),
            'sessionId' => $session->id,
        ]);
    }

    /**
     * Terminate/delete a session.
     *
     * Dispatches TerminateVMJob which will:
     * 1. Delete the Guacamole connection
     * 2. Optionally revert to snapshot (persistent sessions)
     * 3. Stop or delete the VM (based on session type and flags)
     *
     * @throws AuthorizationException
     */
    public function destroy(
        TerminateVMSessionRequest $request,
        string $sessionId,
    ): JsonResponse {
        $session = VMSession::findOrFail($sessionId);

        // Ensure user can only delete their own sessions
        if ($session->user_id !== $request->user()->id) {
            Gate::authorize('admin-only');
        }

        // If already ended, return success immediately
        if (in_array($session->status, [
            VMSessionStatus::EXPIRED,
            VMSessionStatus::TERMINATED,
            VMSessionStatus::FAILED,
        ], true)) {
            return response()->json(['message' => 'Session already ended'], 200);
        }

        Log::info('Terminating VM session', [
            'session_id' => $session->id,
            'user_id' => $request->user()->id,
            'stop_vm' => $request->shouldStopVm(),
            'return_snapshot' => $request->getReturnSnapshot(),
        ]);

        // Run termination synchronously — no queue dependency.
        try {
            TerminateVMJob::dispatchSync(
                session: $session,
                stopVm: $request->shouldStopVm(),
                returnSnapshot: $request->getReturnSnapshot(),
            );

            return response()->json(['message' => 'Session terminated'], 200);
        } catch (\Exception $e) {
            Log::error('Session termination error', [
                'session_id' => $session->id,
                'error' => $e->getMessage(),
            ]);

            // Force-expire even if cleanup had errors
            $session->refresh();
            if (! in_array($session->status, [
                VMSessionStatus::EXPIRED,
                VMSessionStatus::TERMINATED,
                VMSessionStatus::FAILED,
            ], true)) {
                $session->update(['status' => VMSessionStatus::EXPIRED]);
            }

            return response()->json(
                ['message' => 'Session terminated (with cleanup warnings)'],
                200,
            );
        }
    }

    /**
     * Extend an active VM session.
     *
     * Adds the specified number of minutes (or default increment) to the session's
     * expiration time. Validates that the extension won't exceed user's quota.
     *
     * @throws \Exception if extension would exceed quota
     */
    public function extend(
        ExtendVMSessionRequest $request,
        string $sessionId,
    ): JsonResponse {
        $session = VMSession::findOrFail($sessionId);

        // Ensure user can only extend their own sessions
        if ($session->user_id !== $request->user()->id) {
            Gate::authorize('admin-only');
        }

        $minutes = $request->getExtensionMinutes();

        try {
            Log::info('Extending VM session', [
                'session_id' => $session->id,
                'user_id' => $request->user()->id,
                'extend_minutes' => $minutes,
            ]);

            $updatedSession = $this->extendSessionService->extend($session, $minutes);

            return response()->json(
                new VMSessionResource($updatedSession),
                200
            );
        } catch (\Exception $e) {
            Log::warning('Failed to extend VM session', [
                'session_id' => $session->id,
                'error' => $e->getMessage(),
            ]);

            // Return 422 Unprocessable Entity for quota/business logic errors
            return response()->json(
                [
                    'message' => 'Cannot extend session',
                    'error' => $e->getMessage(),
                ],
                422
            );
        }
    }
}
