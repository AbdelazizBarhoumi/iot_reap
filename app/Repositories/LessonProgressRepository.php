<?php

namespace App\Repositories;

use App\Models\LessonProgress;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

/**
 * Repository for lesson progress database access.
 */
class LessonProgressRepository
{
    /**
     * Create or update progress for a lesson.
     *
     * @param  array<string, mixed>  $data
     */
    public function upsert(string $userId, int $lessonId, array $data): LessonProgress
    {
        return LessonProgress::updateOrCreate(
            ['user_id' => $userId, 'lesson_id' => $lessonId],
            $data
        );
    }

    /**
     * Find progress by user and lesson.
     */
    public function findByUserAndLesson(string $userId, int $lessonId): ?LessonProgress
    {
        return LessonProgress::where('user_id', $userId)
            ->where('lesson_id', $lessonId)
            ->first();
    }

    /**
     * Find or create progress record for user and lesson.
     */
    public function findOrCreate(string $userId, int $lessonId): LessonProgress
    {
        return LessonProgress::firstOrCreate(
            ['user_id' => $userId, 'lesson_id' => $lessonId],
            ['completed' => false]
        );
    }

    /**
     * Find all progress for a user.
     */
    public function findByUser(User $user): Collection
    {
        return LessonProgress::where('user_id', $user->id)
            ->with('lesson.module.course')
            ->get();
    }

    /**
     * Find all progress for a user in a course.
     */
    public function findByUserAndCourse(User $user, int $courseId): Collection
    {
        return LessonProgress::where('user_id', $user->id)
            ->whereHas('lesson.module', fn ($q) => $q->where('course_id', $courseId))
            ->with('lesson')
            ->get();
    }

    /**
     * Mark a lesson as complete.
     */
    public function markComplete(string $userId, int $lessonId): LessonProgress
    {
        return $this->upsert($userId, $lessonId, [
            'completed' => true,
            'completed_at' => now(),
        ]);
    }

    /**
     * Mark a lesson as incomplete.
     */
    public function markIncomplete(string $userId, int $lessonId): LessonProgress
    {
        return $this->upsert($userId, $lessonId, [
            'completed' => false,
            'completed_at' => null,
        ]);
    }

    /**
     * Update video watch progress.
     */
    public function updateVideoProgress(
        string $userId,
        int $lessonId,
        int $percentage,
        int $positionSeconds,
    ): LessonProgress {
        $progress = $this->findOrCreate($userId, $lessonId);
        $progress->updateVideoProgress($percentage, $positionSeconds);

        return $progress->fresh();
    }

    /**
     * Mark quiz as passed and optionally complete the lesson.
     */
    public function markQuizPassed(string $userId, int $lessonId, int $attemptId): LessonProgress
    {
        $progress = $this->findOrCreate($userId, $lessonId);
        $progress->markQuizPassed($attemptId);

        return $progress->fresh();
    }

    /**
     * Mark article as read and optionally complete the lesson.
     */
    public function markArticleRead(string $userId, int $lessonId): LessonProgress
    {
        $progress = $this->findOrCreate($userId, $lessonId);
        $progress->markArticleRead();

        return $progress->fresh();
    }

    /**
     * Get completed lesson count for a course.
     */
    public function getCompletedCountForCourse(User $user, int $courseId): int
    {
        return LessonProgress::where('user_id', $user->id)
            ->where('completed', true)
            ->whereHas('lesson.module', fn ($q) => $q->where('course_id', $courseId))
            ->count();
    }

    /**
     * Get course progress percentage for a user.
     * Uses a single query with conditional counting for efficiency.
     */
    public function getCourseProgressPercentage(User $user, int $courseId): float
    {
        $stats = \App\Models\Lesson::whereHas('module', fn ($q) => $q->where('course_id', $courseId))
            ->leftJoin('lesson_progress', function ($join) use ($user) {
                $join->on('lessons.id', '=', 'lesson_progress.lesson_id')
                    ->where('lesson_progress.user_id', '=', $user->id);
            })
            ->selectRaw('COUNT(lessons.id) as total, SUM(CASE WHEN lesson_progress.completed = 1 THEN 1 ELSE 0 END) as completed')
            ->first();

        if (! $stats || $stats->total === 0) {
            return 0;
        }

        return round(($stats->completed / $stats->total) * 100, 1);
    }
}
