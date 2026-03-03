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
     * @param array<string, mixed> $data
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
     * Get completed lesson count for a course.
     */
    public function getCompletedCountForCourse(User $user, int $courseId): int
    {
        return LessonProgress::where('user_id', $user->id)
            ->where('completed', true)
            ->whereHas('lesson.module', fn ($q) => $q->where('course_id', $courseId))
            ->count();
    }
}
