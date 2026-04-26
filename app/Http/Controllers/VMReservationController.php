<?php

namespace App\Http\Controllers;

use App\Http\Requests\VM\CreateVMReservationRequest;
use App\Http\Resources\VMReservationResource;
use App\Models\ProxmoxNode;
use App\Models\Reservation;
use App\Repositories\VMReservationRepository;
use App\Services\TrainingUnitVMAssignmentService;
use App\Services\VMReservationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VMReservationController extends Controller
{
    public function __construct(
        private readonly VMReservationService $vmReservationService,
        private readonly TrainingUnitVMAssignmentService $trainingUnitVMAssignmentService,
        private readonly VMReservationRepository $vmReservationRepository,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $reservations = $this->vmReservationService->listForUser($request->user());

        return response()->json([
            'data' => VMReservationResource::collection($reservations),
        ]);
    }

    public function availableVMs(): JsonResponse
    {
        return response()->json([
            'data' => $this->trainingUnitVMAssignmentService->getAvailableVMs(),
        ]);
    }

    public function store(CreateVMReservationRequest $request): JsonResponse
    {
        try {
            $reservation = $this->vmReservationService->createRequest(
                user: $request->user(),
                nodeId: (int) $request->validated('node_id'),
                vmId: (int) $request->validated('vm_id'),
                startAt: $request->validated('start_at'),
                endAt: $request->validated('end_at'),
                vmName: $request->validated('vm_name'),
                trainingPathId: $request->validated('training_path_id'),
                purpose: $request->validated('purpose'),
            );

            return response()->json([
                'success' => true,
                'message' => 'VM reservation request submitted for approval.',
                'data' => new VMReservationResource($reservation),
            ], 201);
        } catch (\DomainException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function show(Request $request, Reservation $reservation): JsonResponse
    {
        if ($reservation->reservable_type !== ProxmoxNode::class) {
            abort(404);
        }

        if ($reservation->user_id !== $request->user()->id && ! $request->user()->isAdmin()) {
            abort(403);
        }

        return response()->json([
            'data' => new VMReservationResource($reservation->load(['reservable', 'user', 'approver', 'trainingPath'])),
        ]);
    }

    public function cancel(Request $request, Reservation $reservation): JsonResponse
    {
        if ($reservation->reservable_type !== ProxmoxNode::class) {
            abort(404);
        }

        try {
            $cancelled = $this->vmReservationService->cancel($reservation, $request->user());

            return response()->json([
                'success' => true,
                'message' => 'VM reservation cancelled.',
                'data' => new VMReservationResource($cancelled),
            ]);
        } catch (\DomainException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function vmReservationsCalendar(Request $request, int $nodeId, int $vmId): JsonResponse
    {
        $startDate = $request->query('start', now()->startOfWeek()->toDateString());
        $endDate = $request->query('end', now()->addWeeks(4)->endOfWeek()->toDateString());

        $reservations = $this->vmReservationRepository->findCalendarForVm($nodeId, $vmId, $startDate, $endDate);

        return response()->json([
            'data' => VMReservationResource::collection($reservations),
        ]);
    }
}
