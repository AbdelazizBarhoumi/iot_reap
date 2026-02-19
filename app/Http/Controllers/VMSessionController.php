<?php

namespace App\Http\Controllers;

use App\Enums\VMSessionType;
use App\Http\Requests\CreateVMSessionRequest;
use App\Http\Resources\VMSessionResource;
use App\Models\VMSession;
use App\Repositories\VMSessionRepository;
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
        private readonly \App\Services\VMProvisioningService $provisioningService,
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
     * @throws AuthorizationException
     */
    public function store(CreateVMSessionRequest $request): JsonResponse
    {
        Log::info('Creating new VM session', [
            'user_id' => $request->user()->id,
            'template_id' => $request->validated('template_id'),
        ]);

        $session = $this->provisioningService->provision(
            user: $request->user(),
            templateId: $request->validated('template_id'),
            durationMinutes: $request->validated('duration_minutes'),
            sessionType: VMSessionType::from($request->validated('session_type')),
        );

        return response()->json(
            new VMSessionResource($session),
            201
        );
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
     * @throws AuthorizationException
     */
    public function destroy(Request $request, string $sessionId): JsonResponse
    {
        $session = VMSession::findOrFail($sessionId);

        // Ensure user can only delete their own sessions
        if ($session->user_id !== $request->user()->id) {
            Gate::authorize('admin-only');
        }

        Log::info('Terminating VM session', [
            'session_id' => $session->id,
            'user_id' => $request->user()->id,
        ]);

        // TODO: Dispatch immediate cleanup job instead of soft delete
        $this->sessionRepository->delete($session);

        return response()->json(['message' => 'Session terminated'], 200);
    }
}
