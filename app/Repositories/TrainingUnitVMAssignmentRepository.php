<?php

namespace App\Repositories;

use App\Enums\TrainingUnitVMAssignmentStatus;
use App\Models\TrainingUnitVMAssignment;
use Illuminate\Database\Eloquent\Collection;

class TrainingUnitVMAssignmentRepository
{
    /**
     * Get all assignments for a trainingUnit.
     */
    public function findByTrainingUnit(int $trainingUnitId): Collection
    {
        return TrainingUnitVMAssignment::where('training_unit_id', $trainingUnitId)
            ->with(['node', 'assignedByUser', 'approvedByUser'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get the approved assignment for a trainingUnit.
     */
    public function findApprovedForTrainingUnit(int $trainingUnitId): ?TrainingUnitVMAssignment
    {
        return TrainingUnitVMAssignment::where('training_unit_id', $trainingUnitId)
            ->where('status', TrainingUnitVMAssignmentStatus::APPROVED)
            ->with(['node', 'node.proxmoxServer'])
            ->first();
    }

    /**
     * Get all pending assignments.
     */
    public function findPending(): Collection
    {
        return TrainingUnitVMAssignment::pending()
            ->with([
                'trainingUnit.module.trainingPath.instructor',
                'node',
                'assignedByUser',
            ])
            ->orderBy('created_at')
            ->get();
    }

    /**
     * Get pending assignments for a specific trainingPath.
     */
    public function findPendingForTrainingPath(int $trainingPathId): Collection
    {
        return TrainingUnitVMAssignment::pending()
            ->whereHas('trainingUnit.module.trainingPath', function ($q) use ($trainingPathId) {
                $q->where('id', $trainingPathId);
            })
            ->with(['trainingUnit', 'node', 'assignedByUser'])
            ->orderBy('created_at')
            ->get();
    }

    /**
     * Find an assignment by ID.
     */
    public function findById(int $id): ?TrainingUnitVMAssignment
    {
        return TrainingUnitVMAssignment::with([
            'trainingUnit.module.trainingPath',
            'node',
            'assignedByUser',
            'approvedByUser',
        ])->find($id);
    }

    /**
     * Find an assignment by ID or fail.
     */
    public function findByIdOrFail(int $id): TrainingUnitVMAssignment
    {
        return TrainingUnitVMAssignment::with([
            'trainingUnit.module.trainingPath',
            'node',
            'assignedByUser',
            'approvedByUser',
        ])->findOrFail($id);
    }

    /**
     * Create a new assignment.
     */
    public function create(array $data): TrainingUnitVMAssignment
    {
        return TrainingUnitVMAssignment::create($data);
    }

    /**
     * Update an assignment.
     */
    public function update(TrainingUnitVMAssignment $assignment, array $data): TrainingUnitVMAssignment
    {
        $assignment->update($data);

        return $assignment->fresh();
    }

    /**
     * Delete an assignment.
     */
    public function delete(TrainingUnitVMAssignment $assignment): bool
    {
        return $assignment->delete();
    }

    /**
     * Check if a trainingUnit already has a pending or approved assignment.
     */
    public function hasActiveAssignment(int $trainingUnitId): bool
    {
        return TrainingUnitVMAssignment::where('training_unit_id', $trainingUnitId)
            ->whereIn('status', [
                TrainingUnitVMAssignmentStatus::PENDING,
                TrainingUnitVMAssignmentStatus::APPROVED,
            ])
            ->exists();
    }

    /**
     * Get assignments by teacher (assigned_by).
     */
    public function findByTeacher(string $teacherId): Collection
    {
        return TrainingUnitVMAssignment::where('assigned_by', $teacherId)
            ->with(['trainingUnit.module.trainingPath', 'node'])
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
