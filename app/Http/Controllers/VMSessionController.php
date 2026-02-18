<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateVMSessionRequest;
use App\Http\Resources\VMSessionResource;
use App\Models\VMSession;
use App\Repositories\VMSessionRepository;
use App\Services\VMProvisioningService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class VMSessionController extends Controller
{
    public function __construct(
        private readonly VMSessionRepository $sessionRepository,
        private readonly VMProvisioningService $provisioningService,
    ) {
    }

    /**
     * Get all VM sessions for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $sessions = $this->sessionRepository->findByUser($request->user());

        return response()->json([
            'data' => VMSessionResource::collection($sessions),
        ]);
    }

    /**
     * Get a specific VM session.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $session = VMSession::find($id);

        if (! $session) {
            return response()->json(['error' => 'Session not found'], 404);
        }

        // Verify ownership
        if ($session->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json([
            'data' => new VMSessionResource($session),
        ]);
    }

    /**
     * Create a new VM session.
     */
    public function store(CreateVMSessionRequest $request): JsonResponse
    {
        try {
            $session = $this->provisioningService->provision(
                user: $request->user(),
                templateId: $request->validated('template_id'),
                durationMinutes: $request->validated('duration_minutes'),
                sessionType: $request->validated('session_type'),
            );

            Log::info("VM session created via API", [
                'session_id' => $session->id,
                'user_id' => $request->user()->id,
                'template_id' => $request->validated('template_id'),
            ]);

            return response()->json([
                'data' => new VMSessionResource($session),
            ], 201);
        } catch (\Exception $e) {
            Log::error("Failed to create VM session", [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Failed to create VM session: ' . $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Terminate a VM session.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $session = VMSession::find($id);

        if (! $session) {
            return response()->json(['error' => 'Session not found'], 404);
        }

        // Verify ownership
        if ($session->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        try {
            // Mark as terminated
            $session->update(['status' => 'terminated']);

            // TODO: Dispatch cleanup job to delete the VM
            // CleanupVMJob::dispatch($session)->now();

            Log::info("VM session terminated", [
                'session_id' => $session->id,
                'user_id' => $request->user()->id,
            ]);

            return response()->json(null, 204);
        } catch (\Exception $e) {
            Log::error("Failed to terminate VM session", [
                'session_id' => $session->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Failed to terminate session: ' . $e->getMessage(),
            ], 500);
        }
    }
}
