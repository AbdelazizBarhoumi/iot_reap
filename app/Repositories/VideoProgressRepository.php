<?php

namespace App\Repositories;

use App\Models\User;
use App\Models\Video;
use App\Models\VideoProgress;
use Illuminate\Database\Eloquent\Collection;

/**
 * Repository for VideoProgress model operations.
 */
class VideoProgressRepository
{
    /**
     * Find progress by user and video.
     */
    public function findByUserAndVideo(User $user, Video $video): ?VideoProgress
    {
        return VideoProgress::where('user_id', $user->id)
            ->where('video_id', $video->id)
            ->first();
    }

    /**
     * Find or create progress record.
     */
    public function findOrCreate(User $user, Video $video): VideoProgress
    {
        return VideoProgress::firstOrCreate(
            [
                'user_id' => $user->id,
                'video_id' => $video->id,
            ],
            [
                'watched_seconds' => 0,
                'total_watch_time' => 0,
                'completed' => false,
            ]
        );
    }

    /**
     * Update progress position.
     */
    public function updateProgress(VideoProgress $progress, int $seconds): VideoProgress
    {
        $progress->updateProgress($seconds);

        return $progress->fresh();
    }

    /**
     * Mark as completed.
     */
    public function markAsCompleted(VideoProgress $progress): VideoProgress
    {
        $progress->markAsCompleted();

        return $progress->fresh();
    }

    /**
     * Get user's video progress for a course.
     */
    public function getForUserAndCourse(User $user, int $courseId): Collection
    {
        return VideoProgress::where('user_id', $user->id)
            ->whereHas('video.lesson.module', function ($query) use ($courseId) {
                $query->where('course_id', $courseId);
            })
            ->with('video.lesson')
            ->get();
    }

    /**
     * Get total watch time for a user.
     */
    public function getTotalWatchTimeForUser(User $user): int
    {
        return (int) VideoProgress::where('user_id', $user->id)
            ->sum('total_watch_time');
    }

    /**
     * Get completed videos count for a user.
     */
    public function getCompletedCountForUser(User $user): int
    {
        return VideoProgress::where('user_id', $user->id)
            ->where('completed', true)
            ->count();
    }

    /**
     * Reset progress for a user and video.
     */
    public function resetProgress(User $user, Video $video): void
    {
        VideoProgress::where('user_id', $user->id)
            ->where('video_id', $video->id)
            ->delete();
    }
}
