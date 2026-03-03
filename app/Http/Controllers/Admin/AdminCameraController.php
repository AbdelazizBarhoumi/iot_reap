<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Camera\ApproveCameraReservationRequest;
use App\Http\Requests\Camera\CreateAdminCameraBlockRequest;
use App\Http\Resources\CameraReservationResource;
use App\Http\Resources\CameraResource;
use App\Models\Camera;
use App\Models\CameraReservation;
use App\Repositories\CameraReservationRepository;
use App\Services\CameraService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

/**
 * Admin controller for managing camera reservations and cameras.
 */
class AdminCameraController extends Controller
{
    public function __construct(
        private readonly CameraReservationRepository $reservationRepository,
        private readonly CameraService $cameraService,
    ) {}

    // ────────────────────────────────────────────────────────────────────
    // Camera Management
    // ────────────────────────────────────────────────────────────────────

    /**
     * List all cameras with reservation info for admin.
     */
    public function cameras(): JsonResponse
    {
        Gate::authorize('admin-only');

        $cameras = $this->cameraService->getAllCamerasWithReservations();

        return response()->json([
            'data' => CameraResource::collection($cameras),
        ]);
    }

    // ────────────────────────────────────────────────────────────────────
    // Reservation Management
    // ────────────────────────────────────────────────────────────────────

    /**
     * List all pending camera reservations for admin review.
     */
    public function pending(): JsonResponse
    {
        Gate::authorize('admin-only');

        $reservations = $this->reservationRepository->findPending();

        return response()->json([
            'data' => CameraReservationResource::collection($reservations),
        ]);
    }

    /**
     * List all camera reservations with filters.
     */
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('admin-only');

        $query = CameraReservation::with(['camera.robot', 'user', 'approver']);

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($cameraId = $request->query('camera_id')) {
            $query->where('camera_id', $cameraId);
        }

        if ($userId = $request->query('user_id')) {
            $query->where('user_id', $userId);
        }

        if ($from = $request->query('from')) {
            $query->where(function ($q) use ($from) {
                $q->where('requested_start_at', '>=', $from)
                  ->orWhere('approved_start_at', '>=', $from);
            });
        }

        if ($to = $request->query('to')) {
            $query->where(function ($q) use ($to) {
                $q->where('requested_end_at', '<=', $to)
                  ->orWhere('approved_end_at', '<=', $to);
            });
        }

        $reservations = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'data' => CameraReservationResource::collection($reservations),
            'meta' => [
                'current_page' => $reservations->currentPage(),
                'last_page' => $reservations->lastPage(),
                'per_page' => $reservations->perPage(),
                'total' => $reservations->total(),
            ],
        ]);
    }

    /**
     * Approve a camera reservation.
     */
    public function approve(CameraReservation $reservation, ApproveCameraReservationRequest $request): JsonResponse
    {
        Gate::authorize('admin-only');

        if (!$reservation->isPending()) {
            return response()->json([
                'success' => false,
                'message' => 'Only pending reservations can be approved',
            ], 422);
        }

        $modifiedStart = $request->validated('approved_start_at')
            ? new \DateTime($request->validated('approved_start_at'))
            : null;
        $modifiedEnd = $request->validated('approved_end_at')
            ? new \DateTime($request->validated('approved_end_at'))
            : null;

        try {
            $approved = $this->cameraService->approveReservation(
                reservation: $reservation,
                approver: auth()->user(),
                modifiedStartAt: $modifiedStart,
                modifiedEndAt: $modifiedEnd,
                adminNotes: $request->validated('admin_notes'),
            );

            return response()->json([
                'success' => true,
                'message' => 'Camera reservation approved',
                'data' => new CameraReservationResource($approved->load(['camera.robot', 'user', 'approver'])),
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Reject a camera reservation.
     */
    public function reject(CameraReservation $reservation, Request $request): JsonResponse
    {
        Gate::authorize('admin-only');

        if (!$reservation->isPending()) {
            return response()->json([
                'success' => false,
                'message' => 'Only pending reservations can be rejected',
            ], 422);
        }

        $rejected = $this->cameraService->rejectReservation(
            reservation: $reservation,
            approver: auth()->user(),
            adminNotes: $request->input('admin_notes'),
        );

        return response()->json([
            'success' => true,
            'message' => 'Camera reservation rejected',
            'data' => new CameraReservationResource($rejected),
        ]);
    }

    /**
     * Create an admin block for a camera.
     */
    public function createBlock(CreateAdminCameraBlockRequest $request): JsonResponse
    {
        Gate::authorize('admin-only');

        $camera = Camera::findOrFail($request->validated('camera_id'));
        $startAt = new \DateTime($request->validated('start_at'));
        $endAt = new \DateTime($request->validated('end_at'));

        try {
            $block = $this->cameraService->createAdminBlock(
                camera: $camera,
                admin: auth()->user(),
                startAt: $startAt,
                endAt: $endAt,
                notes: $request->validated('notes'),
            );

            return response()->json([
                'success' => true,
                'message' => 'Camera blocked successfully',
                'data' => new CameraReservationResource($block->load(['camera.robot', 'user'])),
            ], 201);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Get upcoming camera reservations for dashboard.
     */
    public function upcoming(): JsonResponse
    {
        Gate::authorize('admin-only');

        $upcoming = $this->reservationRepository->findUpcoming(24);
        $active = $this->reservationRepository->findCurrentlyActive();

        return response()->json([
            'active' => CameraReservationResource::collection($active),
            'upcoming' => CameraReservationResource::collection($upcoming),
        ]);
    }
}
