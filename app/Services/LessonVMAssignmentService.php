<?php

namespace App\Services;

use App\Enums\LessonVMAssignmentStatus;
use App\Models\Lesson;
use App\Models\LessonVMAssignment;
use App\Models\User;
use App\Models\VMTemplate;
use App\Repositories\LessonVMAssignmentRepository;
use App\Repositories\VMTemplateRepository;
use Illuminate\Database\Eloquent\Collection;

class LessonVMAssignmentService
{
    public function __construct(
        private LessonVMAssignmentRepository $assignmentRepository,
        private VMTemplateRepository $templateRepository,
    ) {}

    /**
     * Get all pending assignments for admin review.
     */
    public function getPendingAssignments(): Collection
    {
        return $this->assignmentRepository->findPending();
    }

    /**
     * Get the approved VM assignment for a lesson.
     */
    public function getApprovedAssignment(int $lessonId): ?LessonVMAssignment
    {
        return $this->assignmentRepository->findApprovedForLesson($lessonId);
    }

    /**
     * Assign a VM template to a lesson (teacher action).
     */
    public function assignVMToLesson(
        Lesson $lesson,
        VMTemplate $template,
        User $teacher,
        ?string $notes = null
    ): LessonVMAssignment {
        // Check if lesson already has an active assignment
        if ($this->assignmentRepository->hasActiveAssignment($lesson->id)) {
            throw new \RuntimeException('This lesson already has a pending or approved VM assignment.');
        }

        // Verify teacher owns the course
        $course = $lesson->module->course;
        if ($course->instructor_id !== $teacher->id && ! $teacher->isAdmin()) {
            throw new \RuntimeException('You do not have permission to assign VMs to this lesson.');
        }

        // Verify template is available
        if (! $template->isAvailable()) {
            throw new \RuntimeException('Selected VM template is not available (may be in maintenance).');
        }

        return $this->assignmentRepository->create([
            'lesson_id' => $lesson->id,
            'vm_template_id' => $template->id,
            'assigned_by' => $teacher->id,
            'status' => LessonVMAssignmentStatus::PENDING,
            'teacher_notes' => $notes,
        ]);
    }

    /**
     * Approve an assignment (admin action).
     */
    public function approveAssignment(
        LessonVMAssignment $assignment,
        User $admin,
        ?string $notes = null
    ): LessonVMAssignment {
        if (! $assignment->isPending()) {
            throw new \RuntimeException('Only pending assignments can be approved.');
        }

        $assignment->approve($admin, $notes);

        return $assignment->fresh(['lesson', 'vmTemplate', 'approvedByUser']);
    }

    /**
     * Reject an assignment (admin action).
     */
    public function rejectAssignment(
        LessonVMAssignment $assignment,
        User $admin,
        ?string $notes = null
    ): LessonVMAssignment {
        if (! $assignment->isPending()) {
            throw new \RuntimeException('Only pending assignments can be rejected.');
        }

        if (! $notes) {
            throw new \RuntimeException('Rejection requires a reason/notes.');
        }

        $assignment->reject($admin, $notes);

        return $assignment->fresh(['lesson', 'vmTemplate', 'approvedByUser']);
    }

    /**
     * Remove an assignment (teacher can remove their pending, admin can remove any).
     */
    public function removeAssignment(LessonVMAssignment $assignment, User $user): bool
    {
        // Teachers can only remove pending assignments they created
        if (! $user->isAdmin()) {
            if ($assignment->assigned_by !== $user->id) {
                throw new \RuntimeException('You can only remove assignments you created.');
            }
            if (! $assignment->isPending()) {
                throw new \RuntimeException('You can only remove pending assignments. Contact admin for approved assignments.');
            }
        }

        // If removing approved assignment, also disable VM on lesson
        if ($assignment->isApproved()) {
            $assignment->lesson->update(['vm_enabled' => false]);
        }

        return $this->assignmentRepository->delete($assignment);
    }

    /**
     * Get all available VM templates for assignment.
     */
    public function getAvailableTemplates(): Collection
    {
        return $this->templateRepository->findAvailable();
    }

    /**
     * Get assignments for a teacher's courses.
     */
    public function getAssignmentsForTeacher(User $teacher): Collection
    {
        return $this->assignmentRepository->findByTeacher($teacher->id);
    }

    /**
     * Get the VM template a user can access for a lesson.
     * Returns null if not enrolled, no approved assignment, or lesson not VM-enabled.
     */
    public function getAccessibleTemplateForLesson(int $lessonId, User $user): ?VMTemplate
    {
        $lesson = Lesson::with('module.course.enrollments')->findOrFail($lessonId);

        // Check if user is enrolled in the course
        $isEnrolled = $lesson->module->course->enrollments()
            ->where('user_id', $user->id)
            ->exists();

        if (! $isEnrolled && ! $user->isAdmin() && ! $user->hasRole(\App\Enums\UserRole::TEACHER)) {
            return null;
        }

        // Get the approved assignment
        $assignment = $this->assignmentRepository->findApprovedForLesson($lessonId);

        if (! $assignment) {
            return null;
        }

        return $assignment->vmTemplate;
    }
}
