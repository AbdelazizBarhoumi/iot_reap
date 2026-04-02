<?php

namespace App\Http\Controllers;

use App\Http\Requests\Camera\CreateCameraReservationRequest;
use App\Http\Resources\CameraReservationResource;
use App\Models\Camera;
use App\Models\CameraReservation;
use App\Repositories\CameraReservationRepository;
use App\Services\CameraService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller for camera reservations.
 *
 * Users can request reservations, view their own reservations, and cancel them.
 */
class CameraReservationController extends Controller
{
    public function __construct(
        private readonly CameraReservationRepository $reservationRepository,
        private readonly CameraService $cameraService,
    ) {}

    /**
     * List user's camera reservations.
     */
    public function index(): JsonResponse
    {
        $reservations = $this->reservationRepository->findByUser(auth()->user());

        return response()->json([
            'data' => CameraReservationResource::collection($reservations),
        ]);
    }

    /**
     * Create a new camera reservation request.
     */
    public function store(CreateCameraReservationRequest $request): JsonResponse
    {
        $camera = Camera::with('robot')->findOrFail($request->validated('camera_id'));

        $startAt = new \DateTime($request->validated('start_at'));
        $endAt = new \DateTime($request->validated('end_at'));

        try {
            $reservation = $this->cameraService->requestReservation(
                camera: $camera,
                user: auth()->user(),
                startAt: $startAt,
                endAt: $endAt,
                purpose: $request->validated('purpose'),
            );

            return response()->json([
                'success' => true,
                'message' => 'Camera reservation request submitted for approval',
                'data' => new CameraReservationResource($reservation->load(['camera.robot', 'user'])),
            ], 201);
        } catch (\InvalidArgumentException|\DomainException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Show a specific camera reservation.
     */
    public function show(CameraReservation $reservation): JsonResponse
    {
        // Users can only view their own reservations
        if ($reservation->user_id !== auth()->id() && ! auth()->user()->isAdmin()) {
            abort(403);
        }

        return response()->json([
            'data' => new CameraReservationResource(
                $reservation->load(['camera.robot', 'user', 'approver'])
            ),
        ]);
    }

    /**
     * Cancel a camera reservation.
     */
    public function cancel(CameraReservation $reservation): JsonResponse
    {
        // Users can only cancel their own reservations
        if ($reservation->user_id !== auth()->id() && ! auth()->user()->isAdmin()) {
            abort(403);
        }

        try {
            $cancelled = $this->cameraService->cancelReservation($reservation);

            return response()->json([
                'success' => true,
                'message' => 'Camera reservation cancelled',
                'data' => new CameraReservationResource($cancelled),
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Get reservations for a specific camera (calendar view).
     */
    public function cameraReservations(Camera $camera, Request $request): JsonResponse
    {
        $startDate = $request->query('start', now()->startOfWeek()->toDateString());
        $endDate = $request->query('end', now()->addWeeks(4)->endOfWeek()->toDateString());

        $reservations = CameraReservation::where('camera_id', $camera->id)
            ->whereIn('status', ['pending', 'approved', 'active'])
            ->where(function ($q) use ($startDate, $endDate) {
                $q->whereBetween('requested_start_at', [$startDate, $endDate])
                    ->orWhereBetween('approved_start_at', [$startDate, $endDate]);
            })
            ->with(['user'])
            ->orderBy('requested_start_at')
            ->get();

        return response()->json([
            'data' => CameraReservationResource::collection($reservations),
        ]);
    }
}
