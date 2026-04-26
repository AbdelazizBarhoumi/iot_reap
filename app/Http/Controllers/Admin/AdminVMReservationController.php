<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\VM\ApproveVMReservationRequest;
use App\Http\Resources\VMReservationResource;
use App\Models\ProxmoxNode;
use App\Models\Reservation;
use App\Services\VMReservationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class AdminVMReservationController extends Controller
{
    public function __construct(
        private readonly VMReservationService $vmReservationService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        Gate::authorize('admin-only');

        $status = $request->query('status');
        if ($status === null || $status === '') {
            $status = 'pending';
        }

        return response()->json([
            'data' => VMReservationResource::collection($this->vmReservationService->listForAdmin($status)),
        ]);
    }

    public function pending(): JsonResponse
    {
        return $this->index(request());
    }

    public function approve(Reservation $reservation, ApproveVMReservationRequest $request): JsonResponse
    {
        Gate::authorize('admin-only');

        if ($reservation->reservable_type !== ProxmoxNode::class) {
            abort(404);
        }

        try {
            $approved = $this->vmReservationService->approve(
                reservation: $reservation,
                approver: $request->user(),
                approvedStartAt: $request->validated('approved_start_at'),
                approvedEndAt: $request->validated('approved_end_at'),
                adminNotes: $request->validated('admin_notes'),
            );

            return response()->json([
                'success' => true,
                'message' => 'VM reservation approved.',
                'data' => new VMReservationResource($approved),
            ]);
        } catch (\DomainException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function reject(Request $request, Reservation $reservation): JsonResponse
    {
        Gate::authorize('admin-only');

        if ($reservation->reservable_type !== ProxmoxNode::class) {
            abort(404);
        }

        try {
            $rejected = $this->vmReservationService->reject(
                reservation: $reservation,
                approver: $request->user(),
                adminNotes: $request->input('admin_notes'),
            );

            return response()->json([
                'success' => true,
                'message' => 'VM reservation rejected.',
                'data' => new VMReservationResource($rejected),
            ]);
        } catch (\DomainException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
