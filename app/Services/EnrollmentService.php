<?php

namespace App\Services;

use App\Models\TrainingPath;
use App\Models\TrainingPathEnrollment;
use App\Models\TrainingUnitProgress;
use App\Models\User;
use App\Repositories\PaymentRepository;
use App\Repositories\TrainingPathEnrollmentRepository;
use App\Repositories\TrainingPathRepository;
use App\Repositories\TrainingUnitProgressRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Service for trainingPath enrollment and progress tracking.
 */
class EnrollmentService
{
    public function __construct(
        private readonly TrainingPathEnrollmentRepository $enrollmentRepository,
        private readonly TrainingPathRepository $trainingPathRepository,
        private readonly TrainingUnitProgressRepository $progressRepository,
        private readonly PaymentRepository $paymentRepository,
    ) {}

    /**
     * Enroll a user in a trainingPath.
     */
    public function enroll(User $user, int $trainingPathId): TrainingPathEnrollment
    {
        $trainingPath = $this->trainingPathRepository->findById($trainingPathId);

        if (! $trainingPath) {
            throw new \DomainException('TrainingPath not found');
        }

        if (! $trainingPath->isPublished()) {
            throw new \DomainException('Cannot enroll in unpublished trainingPath');
        }

        if (! $trainingPath->is_free) {
            $completedPayment = $this->paymentRepository->findCompletedByUserAndTrainingPath(
                $user->id,
                $trainingPathId
            );

            if (! $completedPayment) {
                throw new \DomainException('Complete checkout before enrolling in this training path');
            }
        }

        Log::info('User enrolled in trainingPath', [
            'user_id' => $user->id,
            'training_path_id' => $trainingPathId,
        ]);

        // Invalidate enrollment cache
        Cache::forget("user:{$user->id}:enrolled:{$trainingPathId}");
        Cache::forget("user:{$user->id}:enrollments");

        return $this->enrollmentRepository->enroll($user->id, $trainingPathId);
    }

    /**
     * Unenroll a user from a trainingPath.
     */
    public function unenroll(User $user, int $trainingPathId): bool
    {
        Log::info('User unenrolled from trainingPath', [
            'user_id' => $user->id,
            'training_path_id' => $trainingPathId,
        ]);

        // Invalidate enrollment cache
        Cache::forget("user:{$user->id}:enrolled:{$trainingPathId}");
        Cache::forget("user:{$user->id}:enrollments");

        return $this->enrollmentRepository->unenroll($user->id, $trainingPathId);
    }

    /**
     * Check if a user is enrolled in a trainingPath (cached for 1 hour).
     */
    public function isEnrolled(User $user, int $trainingPathId): bool
    {
        return Cache::remember(
            "user:{$user->id}:enrolled:{$trainingPathId}",
            3600,
            fn () => $this->enrollmentRepository->isEnrolled($user->id, $trainingPathId)
        );
    }

    /**
     * Get all enrolled trainingPaths for a user (cached for 30 minutes).
     */
    public function getEnrolledTrainingPaths(User $user): Collection
    {
        return Cache::remember(
            "user:{$user->id}:enrollments",
            1800,
            fn () => $this->enrollmentRepository->findByUser($user)
        );
    }

    /**
     * Mark a trainingUnit as complete.
     */
    public function markTrainingUnitComplete(User $user, int $trainingUnitId): TrainingUnitProgress
    {
        $progress = $this->progressRepository->markComplete($user->id, $trainingUnitId);

        Log::info('TrainingUnit marked complete', [
            'user_id' => $user->id,
            'training_unit_id' => $trainingUnitId,
        ]);

        return $progress;
    }

    /**
     * Mark a trainingUnit as incomplete.
     */
    public function markTrainingUnitIncomplete(User $user, int $trainingUnitId): void
    {
        $this->progressRepository->markIncomplete($user->id, $trainingUnitId);
    }

    /**
     * Update video watch progress for a trainingUnit.
     */
    public function updateVideoProgress(
        User $user,
        int $trainingUnitId,
        int $percentage,
        int $positionSeconds,
    ): TrainingUnitProgress {
        $progress = $this->progressRepository->updateVideoProgress(
            $user->id,
            $trainingUnitId,
            $percentage,
            $positionSeconds
        );

        Log::info('Video progress updated', [
            'user_id' => $user->id,
            'training_unit_id' => $trainingUnitId,
            'percentage' => $percentage,
            'position_seconds' => $positionSeconds,
            'completed' => $progress->completed,
        ]);

        return $progress;
    }

    /**
     * Mark article as read for a trainingUnit.
     */
    public function markArticleRead(User $user, int $trainingUnitId): TrainingUnitProgress
    {
        $progress = $this->progressRepository->markArticleRead($user->id, $trainingUnitId);

        Log::info('Article marked as read', [
            'user_id' => $user->id,
            'training_unit_id' => $trainingUnitId,
            'completed' => $progress->completed,
        ]);

        return $progress;
    }

    /**
     * Mark quiz as passed for a trainingUnit.
     */
    public function markQuizPassed(User $user, int $trainingUnitId, int $attemptId): TrainingUnitProgress
    {
        $progress = $this->progressRepository->markQuizPassed($user->id, $trainingUnitId, $attemptId);

        Log::info('Quiz passed', [
            'user_id' => $user->id,
            'training_unit_id' => $trainingUnitId,
            'attempt_id' => $attemptId,
            'completed' => $progress->completed,
        ]);

        return $progress;
    }

    /**
     * Get progress for a user in a trainingPath.
     *
     * @return array{completed: int, total: int, percentage: float}
     */
    public function getTrainingPathProgress(User $user, TrainingPath $trainingPath): array
    {
        $totalTrainingUnits = $trainingPath->trainingUnits()->count();
        $completedTrainingUnits = $this->progressRepository->getCompletedCountForTrainingPath($user, $trainingPath->id);

        return [
            'completed' => $completedTrainingUnits,
            'total' => $totalTrainingUnits,
            'percentage' => $totalTrainingUnits > 0 ? round(($completedTrainingUnits / $totalTrainingUnits) * 100, 1) : 0,
        ];
    }

    /**
     * Get all progress for a user in a trainingPath.
     *
     * @deprecated Unused - candidate for removal. Use getCompletedTrainingUnitIds() or getTrainingPathProgress() instead.
     */
    public function getTrainingUnitProgress(User $user, int $trainingPathId): Collection
    {
        return $this->progressRepository->findByUserAndTrainingPath($user, $trainingPathId);
    }

    /**
     * Get completed trainingUnit IDs for a trainingPath.
     *
     * @return array<int>
     */
    public function getCompletedTrainingUnitIds(User $user, int $trainingPathId): array
    {
        return $this->progressRepository->findByUserAndTrainingPath($user, $trainingPathId)
            ->where('completed', true)
            ->pluck('training_unit_id')
            ->toArray();
    }
}
