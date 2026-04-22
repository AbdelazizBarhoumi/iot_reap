<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Camera\ApproveCameraReservationRequest;
use App\Http\Requests\Camera\CreateAdminCameraBlockRequest;
use App\Http\Resources\CameraReservationResource;
use App\Http\Resources\CameraResource;
use App\Models\Camera;
use App\Models\Reservation;
use App\Repositories\CameraReservationRepository;
use App\Services\CameraService;
use App\Services\GatewayService;
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
        private readonly GatewayService $gatewayService,
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

        try {
            $cameras = $this->cameraService->getAllCamerasWithReservations();

            return response()->json([
                'data' => CameraResource::collection($cameras),
            ]);
        } catch (\Exception $e) {
            // Log the error for debugging, but return empty list to prevent page blocking
            \Illuminate\Support\Facades\Log::error('Failed to fetch cameras', [
                'error' => $e->getMessage(),
                'exception' => $e,
            ]);

            // Return empty list instead of 500 error so page doesn't block
            return response()->json([
                'data' => [],
                'message' => 'Unable to load cameras at this time',
            ]);
        }
    }

    /**
     * Assign a camera to a specific VM ID.
     *
     * PUT /admin/cameras/{camera}/assign
     */
    public function assignToVm(Camera $camera, \App\Http\Requests\Admin\AssignCameraToVmRequest $request): JsonResponse
    {
        Gate::authorize('admin-only');

        $vmId = $request->validated('vm_id');

        $camera->assignToVm($vmId);

        \Illuminate\Support\Facades\Log::info('Camera assigned to VM', [
            'camera_id' => $camera->id,
            'camera_name' => $camera->name,
            'assigned_vm_id' => $vmId,
            'admin_id' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Camera '{$camera->name}' assigned to VM {$vmId}",
            'data' => new CameraResource($camera->fresh()->load(['robot', 'gatewayNode', 'activeControl'])),
        ]);
    }

    /**
     * Unassign a camera from its VM.
     *
     * DELETE /admin/cameras/{camera}/assign
     */
    public function unassignFromVm(Camera $camera): JsonResponse
    {
        Gate::authorize('admin-only');

        $previousVmId = $camera->assigned_vm_id;

        if ($previousVmId === null) {
            return response()->json([
                'success' => false,
                'message' => "Camera '{$camera->name}' is not assigned to any VM",
            ], 422);
        }

        $camera->unassignFromVm();

        \Illuminate\Support\Facades\Log::info('Camera unassigned from VM', [
            'camera_id' => $camera->id,
            'camera_name' => $camera->name,
            'previous_vm_id' => $previousVmId,
            'admin_id' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Camera '{$camera->name}' unassigned from VM {$previousVmId}",
            'data' => new CameraResource($camera->fresh()->load(['robot', 'gatewayNode', 'activeControl'])),
        ]);
    }

    /**
     * Bulk assign cameras to VMs.
     *
     * POST /admin/cameras/bulk-assign
     */
    public function bulkAssign(\App\Http\Requests\Admin\BulkAssignCamerasRequest $request): JsonResponse
    {
        Gate::authorize('admin-only');

        $assignments = $request->validated('assignments');
        $results = [];

        foreach ($assignments as $assignment) {
            $camera = Camera::find($assignment['camera_id']);
            if (! $camera) {
                $results[] = [
                    'camera_id' => $assignment['camera_id'],
                    'success' => false,
                    'message' => 'Camera not found',
                ];
                continue;
            }

            $vmId = $assignment['vm_id'] ?? null;
            if ($vmId === null) {
                $camera->unassignFromVm();
                $results[] = [
                    'camera_id' => $camera->id,
                    'success' => true,
                    'message' => "Unassigned from VM",
                ];
            } else {
                $camera->assignToVm($vmId);
                $results[] = [
                    'camera_id' => $camera->id,
                    'success' => true,
                    'message' => "Assigned to VM {$vmId}",
                ];
            }
        }

        \Illuminate\Support\Facades\Log::info('Bulk camera assignment', [
            'admin_id' => auth()->id(),
            'assignment_count' => count($assignments),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Bulk assignment completed',
            'results' => $results,
        ]);
    }

    // ────────────────────────────────────────────────────────────────────
    // Camera Status Management
    // ────────────────────────────────────────────────────────────────────

    /**
     * Activate a camera.
     *
     * PUT /admin/cameras/{camera}/activate
     */
    public function activate(Camera $camera): JsonResponse
    {
        Gate::authorize('admin-only');

        try {
            $activated = $this->cameraService->activate($camera, $this->gatewayService);
        } catch (\RuntimeException $e) {
            \Illuminate\Support\Facades\Log::warning('Camera activation failed', [
                'camera_id' => $camera->id,
                'camera_name' => $camera->name,
                'admin_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        \Illuminate\Support\Facades\Log::info('Camera activated by admin', [
            'camera_id' => $camera->id,
            'camera_name' => $camera->name,
            'admin_id' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Camera '{$camera->name}' activated successfully",
            'data' => new CameraResource($activated),
        ]);
    }

    /**
     * Deactivate a camera.
     *
     * PUT /admin/cameras/{camera}/deactivate
     */
    public function deactivate(Camera $camera, Request $request): JsonResponse
    {
        Gate::authorize('admin-only');

        $reason = $request->input('reason');
        $deactivated = $this->cameraService->deactivate($camera, $this->gatewayService, $reason);

        \Illuminate\Support\Facades\Log::info('Camera deactivated by admin', [
            'camera_id' => $camera->id,
            'camera_name' => $camera->name,
            'reason' => $reason,
            'admin_id' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Camera '{$camera->name}' deactivated successfully",
            'data' => new CameraResource($deactivated),
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

        try {
            $reservations = $this->reservationRepository->findPending();

            return response()->json([
                'data' => CameraReservationResource::collection($reservations),
            ]);
        } catch (\Exception $e) {
            // Log the error for debugging, but return empty list to prevent page blocking
            \Illuminate\Support\Facades\Log::error('Failed to fetch pending camera reservations', [
                'error' => $e->getMessage(),
                'exception' => $e,
            ]);

            // Return empty list instead of 500 error so page doesn't block
            return response()->json([
                'data' => [],
                'message' => 'Unable to load reservations at this time',
            ]);
        }
    }

    /**
     * List all camera reservations with filters.
     */
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('admin-only');

        $query = Reservation::where('reservable_type', 'App\Models\Camera')
            ->with(['reservable', 'user', 'approver']);

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($cameraId = $request->query('camera_id')) {
            $query->where('reservable_id', $cameraId);
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
    public function approve(Reservation $reservation, ApproveCameraReservationRequest $request): JsonResponse
    {
        Gate::authorize('admin-only');

        // Ensure this is a camera reservation
        if ($reservation->reservable_type !== 'App\Models\Camera') {
            abort(404);
        }

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
                'data' => new CameraReservationResource($approved->load(['reservable', 'user', 'approver'])),
            ]);
        } catch (\InvalidArgumentException|\DomainException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Reject a camera reservation.
     */
    public function reject(Reservation $reservation, Request $request): JsonResponse
    {
        Gate::authorize('admin-only');

        // Ensure this is a camera reservation
        if ($reservation->reservable_type !== 'App\Models\Camera') {
            abort(404);
        }

        if (! $reservation->isPending()) {
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
                mode: $request->validated('mode') ?? 'block',
                targetUserId: $request->validated('target_user_id'),
                targetVmId: $request->validated('target_vm_id'),
                purpose: $request->validated('purpose'),
            );

            return response()->json([
                'success' => true,
                'message' => 'Camera reservation created successfully',
                'data' => new CameraReservationResource($block->load(['reservable', 'user'])),
            ], 201);
        } catch (\InvalidArgumentException|\DomainException $e) {
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
