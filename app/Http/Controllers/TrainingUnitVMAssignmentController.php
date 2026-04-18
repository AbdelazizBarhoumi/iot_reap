<?php

namespace App\Http\Controllers;

use App\Http\Requests\ApproveVMAssignmentRequest;
use App\Http\Requests\AssignVMToTrainingUnitRequest;
use App\Http\Requests\RejectVMAssignmentRequest;
use App\Http\Resources\TrainingUnitVMAssignmentResource;
use App\Models\TrainingUnit;
use App\Models\TrainingUnitVMAssignment;
use App\Services\TrainingUnitVMAssignmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class TrainingUnitVMAssignmentController extends Controller
{
    public function __construct(
        private TrainingUnitVMAssignmentService $assignmentService,
    ) {}

    /**
     * List pending assignments for admin review.
     */
    public function pending(Request $request): JsonResponse|Response
    {
        Gate::authorize('admin-only');

        $assignments = $this->assignmentService->getPendingAssignments();

        if ($request->wantsJson()) {
            return response()->json([
                'data' => TrainingUnitVMAssignmentResource::collection($assignments),
            ]);
        }

        return Inertia::render('admin/VMAssignmentApprovalsPage', [
            'assignments' => TrainingUnitVMAssignmentResource::collection($assignments),
        ]);
    }

    /**
     * Get available VMs for assignment (from Proxmox).
     */
    public function availableVMs(Request $request): JsonResponse
    {
        $vms = $this->assignmentService->getAvailableVMs();

        return response()->json([
            'data' => $vms,
        ]);
    }

    /**
     * Get assignment for a specific trainingUnit.
     */
    public function forTrainingUnit(Request $request, int $trainingUnitId): JsonResponse
    {
        $assignment = $this->assignmentService->getApprovedAssignment($trainingUnitId);

        return response()->json([
            'data' => $assignment ? new TrainingUnitVMAssignmentResource($assignment->load([
                'node',
                'assignedByUser',
                'approvedByUser',
            ])) : null,
        ]);
    }

    /**
     * Assign a Proxmox VM to a trainingUnit (teacher action).
     */
    public function store(AssignVMToTrainingUnitRequest $request): JsonResponse
    {
        $trainingUnit = TrainingUnit::findOrFail($request->validated('training_unit_id'));

        try {
            $assignment = $this->assignmentService->assignVMToTrainingUnit(
                $trainingUnit,
                vmId: $request->validated('vm_id'),
                nodeId: $request->validated('node_id'),
                vmName: $request->validated('vm_name'),
                teacher: $request->user(),
                notes: $request->validated('teacher_notes')
            );

            return response()->json([
                'data' => new TrainingUnitVMAssignmentResource($assignment->load([
                    'trainingUnit.module.trainingPath',
                    'node',
                    'assignedByUser',
                ])),
                'message' => 'VM assignment submitted for admin approval.',
            ], 201);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    /**
     * Approve an assignment (admin action).
     */
    public function approve(ApproveVMAssignmentRequest $request, TrainingUnitVMAssignment $assignment): JsonResponse
    {
        try {
            $assignment = $this->assignmentService->approveAssignment(
                $assignment,
                $request->user(),
                $request->validated('admin_notes')
            );

            return response()->json([
                'data' => new TrainingUnitVMAssignmentResource($assignment),
                'message' => 'Assignment approved. VM is now available for this trainingUnit.',
            ]);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    /**
     * Reject an assignment (admin action).
     */
    public function reject(RejectVMAssignmentRequest $request, TrainingUnitVMAssignment $assignment): JsonResponse
    {
        try {
            $assignment = $this->assignmentService->rejectAssignment(
                $assignment,
                $request->user(),
                $request->validated('admin_notes')
            );

            return response()->json([
                'data' => new TrainingUnitVMAssignmentResource($assignment),
                'message' => 'Assignment rejected.',
            ]);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    /**
     * Remove an assignment.
     */
    public function destroy(Request $request, TrainingUnitVMAssignment $assignment): JsonResponse
    {
        try {
            $this->assignmentService->removeAssignment($assignment, $request->user());

            return response()->json(['message' => 'Assignment removed successfully.']);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    /**
     * Get teacher's assignments.
     */
    public function myAssignments(Request $request): JsonResponse
    {
        $assignments = $this->assignmentService->getAssignmentsForTeacher($request->user());

        return response()->json([
            'data' => TrainingUnitVMAssignmentResource::collection($assignments),
        ]);
    }
}
