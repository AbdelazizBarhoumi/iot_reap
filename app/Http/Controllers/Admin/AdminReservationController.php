<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Hardware\ApproveReservationRequest;
use App\Http\Requests\Hardware\CreateAdminReservationRequest;
use App\Http\Resources\UsbDeviceReservationResource;
use App\Models\UsbDevice;
use App\Models\UsbDeviceReservation;
use App\Repositories\UsbDeviceReservationRepository;
use App\Services\UsbDeviceQueueService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

/**
 * Admin controller for managing USB device reservations.
 */
class AdminReservationController extends Controller
{
    public function __construct(
        private readonly UsbDeviceReservationRepository $reservationRepository,
        private readonly UsbDeviceQueueService $queueService,
    ) {}

    /**
     * List all pending reservations for admin review.
     */
    public function pending(): JsonResponse
    {
        Gate::authorize('admin-only');

        $reservations = $this->reservationRepository->findPending();

        return response()->json([
            'data' => UsbDeviceReservationResource::collection($reservations),
        ]);
    }

    /**
     * List all reservations with filters.
     */
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('admin-only');

        $query = UsbDeviceReservation::with(['device.gatewayNode', 'user', 'approver']);

        // Filter by status
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        // Filter by device
        if ($deviceId = $request->query('device_id')) {
            $query->where('usb_device_id', $deviceId);
        }

        // Filter by user
        if ($userId = $request->query('user_id')) {
            $query->where('user_id', $userId);
        }

        // Date range filter
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
            'data' => UsbDeviceReservationResource::collection($reservations),
            'meta' => [
                'current_page' => $reservations->currentPage(),
                'last_page' => $reservations->lastPage(),
                'per_page' => $reservations->perPage(),
                'total' => $reservations->total(),
            ],
        ]);
    }

    /**
     * Approve a reservation.
     */
    public function approve(UsbDeviceReservation $reservation, ApproveReservationRequest $request): JsonResponse
    {
        Gate::authorize('admin-only');

        if (! $reservation->isPending()) {
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
            $approved = $this->queueService->approveReservation(
                reservation: $reservation,
                approver: auth()->user(),
                modifiedStartAt: $modifiedStart,
                modifiedEndAt: $modifiedEnd,
                adminNotes: $request->validated('admin_notes'),
            );

            return response()->json([
                'success' => true,
                'message' => 'Reservation approved',
                'data' => new UsbDeviceReservationResource($approved->load(['device.gatewayNode', 'user', 'approver'])),
            ]);
        } catch (\InvalidArgumentException|\DomainException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Reject a reservation.
     */
    public function reject(UsbDeviceReservation $reservation, Request $request): JsonResponse
    {
        Gate::authorize('admin-only');

        if (! $reservation->isPending()) {
            return response()->json([
                'success' => false,
                'message' => 'Only pending reservations can be rejected',
            ], 422);
        }

        $rejected = $this->queueService->rejectReservation(
            reservation: $reservation,
            approver: auth()->user(),
            adminNotes: $request->input('admin_notes'),
        );

        return response()->json([
            'success' => true,
            'message' => 'Reservation rejected',
            'data' => new UsbDeviceReservationResource($rejected),
        ]);
    }

    /**
     * Create an admin block (reserve a device for maintenance/testing).
     */
    public function createBlock(CreateAdminReservationRequest $request): JsonResponse
    {
        Gate::authorize('admin-only');

        $device = UsbDevice::findOrFail($request->validated('usb_device_id'));
        $startAt = new \DateTime($request->validated('start_at'));
        $endAt = new \DateTime($request->validated('end_at'));

        try {
            $block = $this->queueService->createAdminBlock(
                device: $device,
                admin: auth()->user(),
                startAt: $startAt,
                endAt: $endAt,
                notes: $request->validated('notes'),
            );

            return response()->json([
                'success' => true,
                'message' => 'Device blocked successfully',
                'data' => new UsbDeviceReservationResource($block->load(['device.gatewayNode', 'user'])),
            ], 201);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Get upcoming reservations for dashboard.
     */
    public function upcoming(): JsonResponse
    {
        Gate::authorize('admin-only');

        $upcoming = $this->reservationRepository->findUpcoming(24);
        $active = $this->reservationRepository->findCurrentlyActive();

        return response()->json([
            'active' => UsbDeviceReservationResource::collection($active),
            'upcoming' => UsbDeviceReservationResource::collection($upcoming),
        ]);
    }
}
