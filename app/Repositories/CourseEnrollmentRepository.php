<?php

namespace App\Repositories;

use App\Models\CourseEnrollment;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

/**
 * Repository for course enrollment database access.
 */
class CourseEnrollmentRepository
{
    /**
     * Enroll a user in a course.
     */
    public function enroll(string $userId, int $courseId): CourseEnrollment
    {
        return CourseEnrollment::firstOrCreate(
            ['user_id' => $userId, 'course_id' => $courseId],
            ['enrolled_at' => now()]
        );
    }

    /**
     * Check if a user is enrolled in a course.
     */
    public function isEnrolled(string $userId, int $courseId): bool
    {
        return CourseEnrollment::where('user_id', $userId)
            ->where('course_id', $courseId)
            ->exists();
    }

    /**
     * Find enrollment.
     */
    public function find(string $userId, int $courseId): ?CourseEnrollment
    {
        return CourseEnrollment::where('user_id', $userId)
            ->where('course_id', $courseId)
            ->first();
    }

    /**
     * Unenroll a user from a course.
     */
    public function unenroll(string $userId, int $courseId): bool
    {
        return CourseEnrollment::where('user_id', $userId)
            ->where('course_id', $courseId)
            ->delete() > 0;
    }

    /**
     * Find all enrollments for a user.
     */
    public function findByUser(User $user): Collection
    {
        return CourseEnrollment::where('user_id', $user->id)
            ->with(['course.instructor', 'course.modules.lessons'])
            ->orderByDesc('enrolled_at')
            ->get();
    }

    /**
     * Get enrolled student count for a course.
     */
    public function getStudentCount(int $courseId): int
    {
        return CourseEnrollment::where('course_id', $courseId)->count();
    }
}
