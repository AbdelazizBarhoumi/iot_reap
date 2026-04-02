<?php

namespace App\Services;

use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Models\LessonProgress;
use App\Models\User;
use App\Repositories\CourseEnrollmentRepository;
use App\Repositories\CourseRepository;
use App\Repositories\LessonProgressRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Service for course enrollment and progress tracking.
 */
class EnrollmentService
{
    public function __construct(
        private readonly CourseEnrollmentRepository $enrollmentRepository,
        private readonly CourseRepository $courseRepository,
        private readonly LessonProgressRepository $progressRepository,
    ) {}

    /**
     * Enroll a user in a course.
     */
    public function enroll(User $user, int $courseId): CourseEnrollment
    {
        $course = $this->courseRepository->findById($courseId);

        if (! $course) {
            throw new \DomainException('Course not found');
        }

        if (! $course->isPublished()) {
            throw new \DomainException('Cannot enroll in unpublished course');
        }

        Log::info('User enrolled in course', [
            'user_id' => $user->id,
            'course_id' => $courseId,
        ]);

        // Invalidate enrollment cache
        Cache::forget("user:{$user->id}:enrolled:{$courseId}");
        Cache::forget("user:{$user->id}:enrollments");

        return $this->enrollmentRepository->enroll($user->id, $courseId);
    }

    /**
     * Unenroll a user from a course.
     */
    public function unenroll(User $user, int $courseId): bool
    {
        Log::info('User unenrolled from course', [
            'user_id' => $user->id,
            'course_id' => $courseId,
        ]);

        // Invalidate enrollment cache
        Cache::forget("user:{$user->id}:enrolled:{$courseId}");
        Cache::forget("user:{$user->id}:enrollments");

        return $this->enrollmentRepository->unenroll($user->id, $courseId);
    }

    /**
     * Check if a user is enrolled in a course (cached for 1 hour).
     */
    public function isEnrolled(User $user, int $courseId): bool
    {
        return Cache::remember(
            "user:{$user->id}:enrolled:{$courseId}",
            3600,
            fn () => $this->enrollmentRepository->isEnrolled($user->id, $courseId)
        );
    }

    /**
     * Get all enrolled courses for a user (cached for 30 minutes).
     */
    public function getEnrolledCourses(User $user): Collection
    {
        return Cache::remember(
            "user:{$user->id}:enrollments",
            1800,
            fn () => $this->enrollmentRepository->findByUser($user)
        );
    }

    /**
     * Mark a lesson as complete.
     */
    public function markLessonComplete(User $user, int $lessonId): LessonProgress
    {
        $progress = $this->progressRepository->markComplete($user->id, $lessonId);

        Log::info('Lesson marked complete', [
            'user_id' => $user->id,
            'lesson_id' => $lessonId,
        ]);

        return $progress;
    }

    /**
     * Mark a lesson as incomplete.
     */
    public function markLessonIncomplete(User $user, int $lessonId): void
    {
        $this->progressRepository->markIncomplete($user->id, $lessonId);
    }

    /**
     * Update video watch progress for a lesson.
     */
    public function updateVideoProgress(
        User $user,
        int $lessonId,
        int $percentage,
        int $positionSeconds,
    ): LessonProgress {
        $progress = $this->progressRepository->updateVideoProgress(
            $user->id,
            $lessonId,
            $percentage,
            $positionSeconds
        );

        Log::info('Video progress updated', [
            'user_id' => $user->id,
            'lesson_id' => $lessonId,
            'percentage' => $percentage,
            'position_seconds' => $positionSeconds,
            'completed' => $progress->completed,
        ]);

        return $progress;
    }

    /**
     * Mark article as read for a lesson.
     */
    public function markArticleRead(User $user, int $lessonId): LessonProgress
    {
        $progress = $this->progressRepository->markArticleRead($user->id, $lessonId);

        Log::info('Article marked as read', [
            'user_id' => $user->id,
            'lesson_id' => $lessonId,
            'completed' => $progress->completed,
        ]);

        return $progress;
    }

    /**
     * Mark quiz as passed for a lesson.
     */
    public function markQuizPassed(User $user, int $lessonId, int $attemptId): LessonProgress
    {
        $progress = $this->progressRepository->markQuizPassed($user->id, $lessonId, $attemptId);

        Log::info('Quiz passed', [
            'user_id' => $user->id,
            'lesson_id' => $lessonId,
            'attempt_id' => $attemptId,
            'completed' => $progress->completed,
        ]);

        return $progress;
    }

    /**
     * Get progress for a user in a course.
     *
     * @return array{completed: int, total: int, percentage: float}
     */
    public function getCourseProgress(User $user, Course $course): array
    {
        $totalLessons = $course->lessons()->count();
        $completedLessons = $this->progressRepository->getCompletedCountForCourse($user, $course->id);

        return [
            'completed' => $completedLessons,
            'total' => $totalLessons,
            'percentage' => $totalLessons > 0 ? round(($completedLessons / $totalLessons) * 100, 1) : 0,
        ];
    }

    /**
     * Get all progress for a user in a course.
     *
     * @deprecated Unused - candidate for removal. Use getCompletedLessonIds() or getCourseProgress() instead.
     */
    public function getLessonProgress(User $user, int $courseId): Collection
    {
        return $this->progressRepository->findByUserAndCourse($user, $courseId);
    }

    /**
     * Get completed lesson IDs for a course.
     *
     * @return array<int>
     */
    public function getCompletedLessonIds(User $user, int $courseId): array
    {
        return $this->progressRepository->findByUserAndCourse($user, $courseId)
            ->where('completed', true)
            ->pluck('lesson_id')
            ->toArray();
    }
}
