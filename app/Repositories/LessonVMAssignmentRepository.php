<?php

namespace App\Repositories;

use App\Enums\LessonVMAssignmentStatus;
use App\Models\LessonVMAssignment;
use Illuminate\Database\Eloquent\Collection;

class LessonVMAssignmentRepository
{
    /**
     * Get all assignments for a lesson.
     */
    public function findByLesson(int $lessonId): Collection
    {
        return LessonVMAssignment::where('lesson_id', $lessonId)
            ->with(['vmTemplate', 'assignedByUser', 'approvedByUser'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get the approved assignment for a lesson.
     */
    public function findApprovedForLesson(int $lessonId): ?LessonVMAssignment
    {
        return LessonVMAssignment::where('lesson_id', $lessonId)
            ->where('status', LessonVMAssignmentStatus::APPROVED)
            ->with(['vmTemplate', 'vmTemplate.proxmoxServer', 'vmTemplate.node'])
            ->first();
    }

    /**
     * Get all pending assignments.
     */
    public function findPending(): Collection
    {
        return LessonVMAssignment::pending()
            ->with([
                'lesson.module.course.instructor',
                'vmTemplate',
                'assignedByUser',
            ])
            ->orderBy('created_at')
            ->get();
    }

    /**
     * Get pending assignments for a specific course.
     */
    public function findPendingForCourse(int $courseId): Collection
    {
        return LessonVMAssignment::pending()
            ->whereHas('lesson.module.course', function ($q) use ($courseId) {
                $q->where('id', $courseId);
            })
            ->with(['lesson', 'vmTemplate', 'assignedByUser'])
            ->orderBy('created_at')
            ->get();
    }

    /**
     * Find an assignment by ID.
     */
    public function findById(int $id): ?LessonVMAssignment
    {
        return LessonVMAssignment::with([
            'lesson.module.course',
            'vmTemplate',
            'assignedByUser',
            'approvedByUser',
        ])->find($id);
    }

    /**
     * Find an assignment by ID or fail.
     */
    public function findByIdOrFail(int $id): LessonVMAssignment
    {
        return LessonVMAssignment::with([
            'lesson.module.course',
            'vmTemplate',
            'assignedByUser',
            'approvedByUser',
        ])->findOrFail($id);
    }

    /**
     * Create a new assignment.
     */
    public function create(array $data): LessonVMAssignment
    {
        return LessonVMAssignment::create($data);
    }

    /**
     * Update an assignment.
     */
    public function update(LessonVMAssignment $assignment, array $data): LessonVMAssignment
    {
        $assignment->update($data);

        return $assignment->fresh();
    }

    /**
     * Delete an assignment.
     */
    public function delete(LessonVMAssignment $assignment): bool
    {
        return $assignment->delete();
    }

    /**
     * Check if a lesson already has a pending or approved assignment.
     */
    public function hasActiveAssignment(int $lessonId): bool
    {
        return LessonVMAssignment::where('lesson_id', $lessonId)
            ->whereIn('status', [
                LessonVMAssignmentStatus::PENDING,
                LessonVMAssignmentStatus::APPROVED,
            ])
            ->exists();
    }

    /**
     * Get assignments by teacher (assigned_by).
     */
    public function findByTeacher(string $teacherId): Collection
    {
        return LessonVMAssignment::where('assigned_by', $teacherId)
            ->with(['lesson.module.course', 'vmTemplate'])
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
