<?php

namespace App\Http\Controllers;

use App\Enums\CameraPTZDirection;
use App\Exceptions\CameraControlConflictException;
use App\Exceptions\CameraNotControllableException;
use App\Http\Requests\CameraMoveRequest;
use App\Http\Resources\CameraResource;
use App\Models\VMSession;
use App\Services\CameraService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

/**
 * Controller for session camera endpoints.
 *
 * All camera operations are scoped to a VM session. The user can:
 * - View all cameras (see streams from all)
 * - Acquire/release exclusive PTZ control of one camera at a time
 * - Move a controlled camera in 4 directions (up/down/left/right)
 */
class SessionCameraController extends Controller
{
    public function __construct(
        private readonly CameraService $cameraService,
    ) {}

    /**
     * GET /sessions/{session}/cameras
     * List all cameras with their control state for this session.
     */
    public function index(Request $request, string $sessionId): JsonResponse
    {
        $session = $this->authorizeSession($request, $sessionId);

        $cameras = $this->cameraService->getCamerasForSession($session->id);

        return response()->json([
            'data' => CameraResource::collection($cameras),
        ]);
    }

    /**
     * GET /sessions/{session}/cameras/{camera}
     * Get a single camera with stream URLs and control state.
     */
    public function show(Request $request, string $sessionId, int $cameraId): JsonResponse
    {
        $this->authorizeSession($request, $sessionId);

        $camera = app(\App\Repositories\CameraRepository::class)->findWithControl($cameraId);

        return response()->json([
            'data' => new CameraResource($camera),
        ]);
    }

    /**
     * POST /sessions/{session}/cameras/{camera}/control
     * Acquire exclusive PTZ control of a camera.
     */
    public function acquireControl(Request $request, string $sessionId, int $cameraId): JsonResponse
    {
        $session = $this->authorizeSession($request, $sessionId);

        try {
            $control = $this->cameraService->acquireControl($cameraId, $session->id);

            $camera = app(\App\Repositories\CameraRepository::class)->findWithControl($cameraId);

            return response()->json([
                'data' => new CameraResource($camera),
                'message' => 'Camera control acquired.',
            ]);
        } catch (CameraNotControllableException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (CameraControlConflictException $e) {
            return response()->json(['message' => $e->getMessage()], 409);
        }
    }

    /**
     * DELETE /sessions/{session}/cameras/{camera}/control
     * Release PTZ control of a camera.
     */
    public function releaseControl(Request $request, string $sessionId, int $cameraId): JsonResponse
    {
        $session = $this->authorizeSession($request, $sessionId);

        $released = $this->cameraService->releaseControl($cameraId, $session->id);

        if (! $released) {
            return response()->json([
                'message' => 'You do not control this camera.',
            ], 422);
        }

        $camera = app(\App\Repositories\CameraRepository::class)->findWithControl($cameraId);

        return response()->json([
            'data' => new CameraResource($camera),
            'message' => 'Camera control released.',
        ]);
    }

    /**
     * POST /sessions/{session}/cameras/{camera}/move
     * Send a PTZ move command (up/down/left/right).
     */
    public function move(CameraMoveRequest $request, string $sessionId, int $cameraId): JsonResponse
    {
        $session = $this->authorizeSession($request, $sessionId);

        $direction = CameraPTZDirection::from($request->validated('direction'));

        try {
            $this->cameraService->move($cameraId, $session->id, $direction);

            return response()->json([
                'message' => "Camera moved {$direction->value}.",
            ]);
        } catch (CameraNotControllableException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (CameraControlConflictException $e) {
            return response()->json(['message' => $e->getMessage()], 409);
        }
    }

    /**
     * Authorize that the user owns the session (or is admin).
     */
    private function authorizeSession(Request $request, string $sessionId): VMSession
    {
        $session = VMSession::findOrFail($sessionId);

        if ($session->user_id !== $request->user()->id) {
            Gate::authorize('admin-only');
        }

        return $session;
    }
}
