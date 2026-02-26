<?php

namespace App\Http\Controllers;

use App\Http\Requests\Hardware\CreateReservationRequest;
use App\Http\Resources\UsbDeviceReservationResource;
use App\Models\UsbDevice;
use App\Models\UsbDeviceReservation;
use App\Repositories\UsbDeviceReservationRepository;
use App\Services\UsbDeviceQueueService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller for USB device reservations.
 * 
 * Users can request reservations, view their own reservations, and cancel them.
 */
class UsbDeviceReservationController extends Controller
{
    public function __construct(
        private readonly UsbDeviceReservationRepository $reservationRepository,
        private readonly UsbDeviceQueueService $queueService,
    ) {}

    /**
     * List user's reservations.
     */
    public function index(): JsonResponse
    {
        $reservations = $this->reservationRepository->findByUser(auth()->user());

        return response()->json([
            'data' => UsbDeviceReservationResource::collection($reservations),
        ]);
    }

    /**
     * Create a new reservation request.
     */
    public function store(CreateReservationRequest $request): JsonResponse
    {
        $device = UsbDevice::with('gatewayNode')->findOrFail($request->validated('usb_device_id'));

        // Verify device is from a verified gateway
        if (!$device->gatewayNode?->is_verified) {
            return response()->json([
                'success' => false,
                'message' => 'Device gateway is not verified',
            ], 422);
        }

        $startAt = new \DateTime($request->validated('start_at'));
        $endAt = new \DateTime($request->validated('end_at'));

        try {
            $reservation = $this->queueService->requestReservation(
                device: $device,
                user: auth()->user(),
                startAt: $startAt,
                endAt: $endAt,
                purpose: $request->validated('purpose'),
            );

            return response()->json([
                'success' => true,
                'message' => 'Reservation request submitted for approval',
                'data' => new UsbDeviceReservationResource($reservation->load(['device.gatewayNode', 'user'])),
            ], 201);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Show a specific reservation.
     */
    public function show(UsbDeviceReservation $reservation): JsonResponse
    {
        // Users can only view their own reservations
        if ($reservation->user_id !== auth()->id() && !auth()->user()->isAdmin()) {
            abort(403);
        }

        return response()->json([
            'data' => new UsbDeviceReservationResource(
                $reservation->load(['device.gatewayNode', 'user', 'approver'])
            ),
        ]);
    }

    /**
     * Cancel a reservation.
     */
    public function cancel(UsbDeviceReservation $reservation): JsonResponse
    {
        // Users can only cancel their own reservations
        if ($reservation->user_id !== auth()->id() && !auth()->user()->isAdmin()) {
            abort(403);
        }

        try {
            $cancelled = $this->queueService->cancelReservation($reservation);

            return response()->json([
                'success' => true,
                'message' => 'Reservation cancelled',
                'data' => new UsbDeviceReservationResource($cancelled),
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Get reservations for a specific device (calendar view).
     */
    public function deviceReservations(UsbDevice $device, Request $request): JsonResponse
    {
        $startDate = $request->query('start', now()->startOfWeek()->toDateString());
        $endDate = $request->query('end', now()->addWeeks(4)->endOfWeek()->toDateString());

        $reservations = UsbDeviceReservation::where('usb_device_id', $device->id)
            ->whereIn('status', ['pending', 'approved', 'active'])
            ->where(function ($q) use ($startDate, $endDate) {
                $q->whereBetween('requested_start_at', [$startDate, $endDate])
                  ->orWhereBetween('approved_start_at', [$startDate, $endDate]);
            })
            ->with(['user'])
            ->orderBy('requested_start_at')
            ->get();

        return response()->json([
            'data' => UsbDeviceReservationResource::collection($reservations),
        ]);
    }
}
