<?php

namespace App\Repositories;

use App\Enums\CourseStatus;
use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

/**
 * Repository for course database access.
 */
class CourseRepository
{
    /**
     * Create a new course.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Course
    {
        return Course::create($data);
    }

    /**
     * Find a course by ID.
     */
    public function findById(int $id): ?Course
    {
        return Course::find($id);
    }

    /**
     * Find a course by ID with modules and lessons.
     */
    public function findByIdWithContent(int $id): ?Course
    {
        return Course::with(['modules.lessons', 'instructor'])->find($id);
    }

    /**
     * Find all approved courses.
     */
    public function findApproved(): Collection
    {
        return Course::approved()
            ->with('instructor')
            ->withCount('enrollments as student_count')
            ->orderByDesc('created_at')
            ->get();
    }

    /**
     * Find approved courses by category.
     */
    public function findApprovedByCategory(string $category): Collection
    {
        return Course::approved()
            ->byCategory($category)
            ->with('instructor')
            ->withCount('enrollments as student_count')
            ->orderByDesc('created_at')
            ->get();
    }

    /**
     * Find all courses by an instructor.
     */
    public function findByInstructor(User $user): Collection
    {
        return Course::byInstructor($user->id)
            ->with(['instructor', 'modules.lessons'])
            ->withCount('enrollments as student_count')
            ->orderByDesc('created_at')
            ->get();
    }

    /**
     * Find all courses pending review.
     */
    public function findPendingReview(): Collection
    {
        return Course::pendingReview()
            ->with(['instructor', 'modules.lessons'])
            ->withCount('enrollments as student_count')
            ->orderBy('created_at')
            ->get();
    }

    /**
     * Search approved courses.
     */
    public function searchApproved(string $query): Collection
    {
        return Course::approved()
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                    ->orWhere('description', 'like', "%{$query}%");
            })
            ->with('instructor')
            ->withCount('enrollments as student_count')
            ->get();
    }

    /**
     * Update a course.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(Course $course, array $data): Course
    {
        $course->update($data);

        return $course->fresh();
    }

    /**
     * Delete a course.
     */
    public function delete(Course $course): bool
    {
        return $course->delete();
    }

    /**
     * Get all unique categories.
     *
     * @return array<string>
     */
    public function getCategories(): array
    {
        return Course::approved()
            ->distinct()
            ->pluck('category')
            ->toArray();
    }

    /**
     * Submit a course for review.
     */
    public function submitForReview(Course $course): Course
    {
        return $this->update($course, [
            'status' => CourseStatus::PENDING_REVIEW,
            'admin_feedback' => null,
        ]);
    }

    /**
     * Approve a course.
     */
    public function approve(Course $course): Course
    {
        return $this->update($course, [
            'status' => CourseStatus::APPROVED,
            'admin_feedback' => null,
        ]);
    }

    /**
     * Reject a course.
     */
    public function reject(Course $course, string $feedback): Course
    {
        return $this->update($course, [
            'status' => CourseStatus::REJECTED,
            'admin_feedback' => $feedback,
        ]);
    }
}
