<?php

namespace App\Http\Controllers\Admin;

use App\Enums\TrainingUnitVMAssignmentStatus;
use App\Models\TrainingUnitVMAssignment;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class AdminVMAssignmentController
{
    /**
     * List all VM assignments with approval status.
     */
    public function index(): Response|JsonResponse
    {
        $assignments = TrainingUnitVMAssignment::with([
            'trainingUnit.module.trainingPath',
            'assignedByUser',
            'approvedByUser',
        ])
            ->orderBy('created_at', 'desc')
            ->get();

        // Calculate stats
        $stats = [
            'pending' => $assignments->where('status', TrainingUnitVMAssignmentStatus::PENDING)->count(),
            'approved' => $assignments->where('status', TrainingUnitVMAssignmentStatus::APPROVED)->count(),
            'rejected' => $assignments->where('status', TrainingUnitVMAssignmentStatus::REJECTED)->count(),
        ];

        if (request()->wantsJson()) {
            return response()->json([
                'data' => $assignments,
                'stats' => $stats,
            ]);
        }

        return Inertia::render('admin/VMAssignmentApprovalsPage', [
            'assignments' => $assignments,
            'stats' => $stats,
        ]);
    }
}
