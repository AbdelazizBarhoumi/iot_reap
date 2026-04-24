<?php

namespace App\Http\Controllers;

use App\Enums\CameraStatus;
use App\Enums\UsbDeviceStatus;
use App\Http\Requests\Camera\CreateCameraReservationRequest;
use App\Http\Resources\CameraReservationResource;
use App\Http\Resources\CameraResource;
use App\Models\Camera;
use App\Models\Reservation;
use App\Repositories\CameraReservationRepository;
use App\Services\CameraService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
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
    public function index(Request $request): JsonResponse|RedirectResponse
    {
        $reservations = $this->reservationRepository->findByUser(auth()->user());

        if (! $request->wantsJson()) {
            return redirect()->route('reservations.index', ['tab' => 'cameras']);
        }

        return response()->json([
            'data' => CameraReservationResource::collection($reservations),
        ]);
    }

    /**
     * List cameras that engineers can reserve.
     *
     * Only cameras that are ACTIVE and linked to a bound/attached USB device
     * are exposed to engineers.
     */
    public function cameras(): JsonResponse
    {
        $cameras = Camera::query()
            ->with(['gatewayNode', 'usbDevice', 'robot'])
            ->where('status', CameraStatus::ACTIVE)
            ->whereNotNull('usb_device_id')
            ->whereHas('usbDevice', function ($query) {
                $query->whereIn('status', [
                    UsbDeviceStatus::BOUND,
                    UsbDeviceStatus::ATTACHED,
                ]);
            })
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => CameraResource::collection($cameras),
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
                'data' => new CameraReservationResource($reservation->load(['reservable', 'user'])),
            ], 201);
        } catch (\InvalidArgumentException | \DomainException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Show a specific camera reservation.
     */
    public function show(Reservation $reservation): JsonResponse
    {
        // Ensure this is a camera reservation
        if ($reservation->reservable_type !== 'App\Models\Camera') {
            abort(404);
        }

        // Users can only view their own reservations
        if ($reservation->user_id !== auth()->id() && ! auth()->user()->isAdmin()) {
            abort(403);
        }

        return response()->json([
            'data' => new CameraReservationResource(
                $reservation->load(['reservable', 'user', 'approver'])
            ),
        ]);
    }

    /**
     * Cancel a camera reservation.
     */
    public function cancel(Reservation $reservation): JsonResponse
    {
        // Ensure this is a camera reservation
        if ($reservation->reservable_type !== 'App\Models\Camera') {
            abort(404);
        }

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

        $reservations = Reservation::where('reservable_type', 'App\Models\Camera')
            ->where('reservable_id', $camera->id)
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
