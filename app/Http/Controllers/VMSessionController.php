<?php

namespace App\Http\Controllers;

use App\Enums\VMSessionType;
use App\Http\Requests\CreateVMSessionRequest;
use App\Http\Requests\ExtendVMSessionRequest;
use App\Http\Requests\TerminateVMSessionRequest;
use App\Http\Resources\VMSessionResource;
use App\Jobs\TerminateVMJob;
use App\Models\VMSession;
use App\Repositories\VMSessionRepository;
use App\Services\ExtendSessionService;
use App\Services\QuotaService;
use App\Services\VMProvisioningService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Gate;

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
     */
    public function index(Request $request): JsonResponse
    {
        $sessions = $this->sessionRepository->findByUser($request->user());

        return response()->json([
            'data' => VMSessionResource::collection($sessions),
        ]);
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
            Log::info('Creating new VM session', [
                'user_id' => $request->user()->id,
                'template_id' => $request->validated('template_id'),
                'duration_minutes' => $durationMinutes,
            ]);

            // Check quota before provisioning
            $this->quotaService->assertAllowedToCreate($request->user(), $durationMinutes);

            $session = $this->provisioningService->provision(
                user: $request->user(),
                templateId: $request->validated('template_id'),
                durationMinutes: $durationMinutes,
                sessionType: VMSessionType::from($request->validated('session_type')),
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

            // Return 422 for quota/business logic errors
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
     * Get a specific session.
     *
     * @throws AuthorizationException
     */
    public function show(Request $request, string $sessionId): JsonResponse
    {
        $session = VMSession::findOrFail($sessionId);

        // Ensure user can only see their own sessions
        if ($session->user_id !== $request->user()->id) {
            Gate::authorize('admin-only');
        }

        return response()->json(
            new VMSessionResource($session)
        );
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