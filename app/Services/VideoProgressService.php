<?php

namespace App\Services;

use App\Models\User;
use App\Models\Video;
use App\Models\VideoProgress;
use App\Repositories\VideoProgressRepository;
use Illuminate\Support\Facades\Log;

/**
 * Service for tracking video watch progress.
 */
class VideoProgressService
{
    public function __construct(
        private readonly VideoProgressRepository $progressRepository,
    ) {}

    /**
     * Save progress for a user watching a video.
     */
    public function saveProgress(User $user, Video $video, int $seconds): VideoProgress
    {
        Log::debug('Saving video progress', [
            'user_id' => $user->id,
            'video_id' => $video->id,
            'seconds' => $seconds,
        ]);

        $progress = $this->progressRepository->findOrCreate($user, $video);

        return $this->progressRepository->updateProgress($progress, $seconds);
    }

    /**
     * Get progress for a user and video.
     */
    public function getProgress(User $user, Video $video): ?VideoProgress
    {
        return $this->progressRepository->findByUserAndVideo($user, $video);
    }

    /**
     * Get progress position in seconds.
     */
    public function getProgressPosition(User $user, Video $video): int
    {
        $progress = $this->getProgress($user, $video);

        return $progress?->watched_seconds ?? 0;
    }

    /**
     * Mark a video as completed for a user.
     */
    public function markAsCompleted(User $user, Video $video): VideoProgress
    {
        Log::info('Marking video as completed', [
            'user_id' => $user->id,
            'video_id' => $video->id,
        ]);

        $progress = $this->progressRepository->findOrCreate($user, $video);

        return $this->progressRepository->markAsCompleted($progress);
    }

    /**
     * Check if a user has completed a video (watched > 80%).
     */
    public function hasCompleted(User $user, Video $video): bool
    {
        $progress = $this->getProgress($user, $video);

        return $progress?->isComplete() ?? false;
    }

    /**
     * Get completion percentage for a user and video.
     */
    public function getCompletionPercentage(User $user, Video $video): int
    {
        return $video->getCompletionPercentage($user);
    }

    /**
     * Reset progress for a user and video.
     */
    public function resetProgress(User $user, Video $video): void
    {
        Log::info('Resetting video progress', [
            'user_id' => $user->id,
            'video_id' => $video->id,
        ]);

        $this->progressRepository->resetProgress($user, $video);
    }

    /**
     * Get total watch time for a user.
     */
    public function getTotalWatchTimeForUser(User $user): int
    {
        return $this->progressRepository->getTotalWatchTimeForUser($user);
    }

    /**
     * Get completed videos count for a user.
     */
    public function getCompletedCountForUser(User $user): int
    {
        return $this->progressRepository->getCompletedCountForUser($user);
    }

    /**
     * Get user's video progress for a trainingPath.
     *
     * @return array<int, array{video_id: int, watched_seconds: int, completed: bool, percentage: int}>
     */
    public function getProgressForTrainingPath(User $user, int $trainingPathId): array
    {
        $progressRecords = $this->progressRepository->getForUserAndTrainingPath($user, $trainingPathId);

        return $progressRecords->map(function ($progress) {
            return [
                'video_id' => $progress->video_id,
                'training_unit_id' => $progress->video?->training_unit_id,
                'watched_seconds' => $progress->watched_seconds,
                'completed' => $progress->completed,
                'percentage' => $progress->percentage,
            ];
        })->toArray();
    }
}
