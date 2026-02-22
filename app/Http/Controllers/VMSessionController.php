<?php

namespace App\Http\Controllers;

use App\Enums\VMSessionType;
use App\Enums\VMSessionStatus;
use App\Http\Requests\CreateVMSessionRequest;
use App\Http\Requests\ExtendVMSessionRequest;
use App\Http\Requests\TerminateVMSessionRequest;
use App\Http\Resources\VMSessionResource;
use App\Events\VMSessionActivated;
use App\Events\VMSessionCreated;
use App\Jobs\TerminateVMJob;
use App\Models\VMSession;
use App\Models\VMTemplate;
use App\Repositories\VMSessionRepository;
use App\Services\ExtendSessionService;
use App\Services\ProxmoxClient;
use App\Services\QuotaService;
use App\Services\VMProvisioningService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Gate;
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
        private readonly VMProvisioningService $provisioningService,
        private readonly ExtendSessionService $extendSessionService,
        private readonly QuotaService $quotaService,
    ) {}

    /**
     * Get all sessions for the authenticated user.
     * Returns Inertia page for browser requests, JSON for XHR.
     */
    public function index(Request $request): JsonResponse|InertiaResponse
    {
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
            // if the caller explicitly requested to use the existing VM instead
            // of cloning a template, handle that as a special case. the
            // frontend only enables this flag for non-template VMs coming from
            // the dashboard browser.
            if ($request->validated('use_existing') && $request->validated('vmid')) {
                // we still need a template_id to satisfy the non-null column
                // so either use the value provided or auto-register one based
                // on the vmid. this does **not** trigger a clone.
                $templateId = $request->validated('template_id')
                    ?? $this->findOrCreateTemplate($request)->id;

                $node = \App\Models\ProxmoxNode::findOrFail($request->validated('node_id'));
                $serverId = $node->proxmox_server_id;

                Log::info('Creating direct session to existing VM', [
                    'user_id' => $request->user()->id,
                    'vmid' => $request->validated('vmid'),
                    'node_id' => $node->id,
                    'template_id' => $templateId,
                    'duration_minutes' => $durationMinutes,
                ]);

                // direct connections still count against quota
                $this->quotaService->assertAllowedToCreate($request->user(), $durationMinutes);

                $sessionData = [
                    'user_id' => $request->user()->id,
                    'template_id' => $templateId,
                    'proxmox_server_id' => $serverId,
                    'node_id' => $node->id,
                    'vm_id' => $request->validated('vmid'),
                    'status' => VMSessionStatus::PENDING,
                    'session_type' => VMSessionType::from($request->validated('session_type')),
                    // do NOT override protocol for direct connections; use template default
                    'protocol_override' => null,
                    'expires_at' => now()->addMinutes($durationMinutes),
                    'credentials' => array_filter([
                        'username' => $request->validated('username'),
                        'password' => $request->validated('password'),
                    ]),
                    'return_snapshot' => $request->validated('return_snapshot'),
                ];

                $session = $this->sessionRepository->create($sessionData);

                // fire the usual events so the Guacamole listener will pick up the
                // vm_id and start the machine / create a connection.
                event(new VMSessionCreated($session));
                event(new VMSessionActivated($session));

                return response()->json(new VMSessionResource($session), 201);
            }

            // Resolve template_id: either directly provided or auto-registered from vmid
            $templateId = $request->validated('template_id');

            if (!$templateId && $request->validated('vmid')) {
                $templateId = $this->findOrCreateTemplate($request)->id;
            }

            Log::info('Creating new VM session', [
                'user_id' => $request->user()->id,
                'template_id' => $templateId,
                'duration_minutes' => $durationMinutes,
            ]);

            // Check quota before provisioning
            $this->quotaService->assertAllowedToCreate($request->user(), $durationMinutes);

            // Build credentials from request (if provided)
            $credentials = null;
            if ($request->validated('username') || $request->validated('password')) {
                $credentials = array_filter([
                    'username' => $request->validated('username'),
                    'password' => $request->validated('password'),
                ]);
            }

            // Protocol override - use request protocol or connection_preference_protocol
            $protocolOverride = $request->validated('protocol')
                ?? $request->validated('connection_preference_protocol');

            $session = $this->provisioningService->provision(
                user: $request->user(),
                templateId: $templateId,
                durationMinutes: $durationMinutes,
                sessionType: VMSessionType::from($request->validated('session_type')),
                credentials: $credentials,
                returnSnapshot: $request->validated('return_snapshot'),
                protocolOverride: $protocolOverride,
            );

            return response()->json(
                new VMSessionResource($session),
                201
            );
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
     * Find or auto-register a VMTemplate from a Proxmox VMID.
     * Called when launching a session directly from the VM browser.
     */
    private function findOrCreateTemplate(CreateVMSessionRequest $request): VMTemplate
    {
        $vmid = $request->validated('vmid');

        return VMTemplate::firstOrCreate(
            ['template_vmid' => $vmid],
            [
                'name'      => $request->validated('vm_name') ?? "VM-{$vmid}",
                'os_type'   => $request->validated('os_type') ?? 'linux',
                'protocol'  => $request->validated('protocol') ?? 'vnc',
                'cpu_cores' => 2,
                'ram_mb'    => 2048,
                'disk_gb'   => 40,
                'tags'      => [],
                'is_active' => true,
            ],
        );
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
        if (!$session->vm_id || !$session->proxmoxServer || !$session->node) {
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
    public function show(Request $request, string $sessionId): JsonResponse|InertiaResponse
    {
        $session = VMSession::findOrFail($sessionId);

        // Ensure user can only see their own sessions
        if ($session->user_id !== $request->user()->id) {
            Gate::authorize('admin-only');
        }

        if ($request->wantsJson()) {
            return response()->json(
                new VMSessionResource($session)
            );
        }

        return Inertia::render('sessions/show', [
            'session' => new VMSessionResource($session),
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

        Log::info('Terminating VM session', [
            'session_id' => $session->id,
            'user_id' => $request->user()->id,
            'stop_vm' => $request->shouldStopVm(),
            'return_snapshot' => $request->getReturnSnapshot(),
        ]);

        // Dispatch the termination job
        TerminateVMJob::dispatch(
            session: $session,
            stopVm: $request->shouldStopVm(),
            returnSnapshot: $request->getReturnSnapshot(),
        );

        return response()->json(
            ['message' => 'Session termination initiated'],
            202
        );
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
    }}