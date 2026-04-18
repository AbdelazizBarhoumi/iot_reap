<?php

namespace App\Repositories;

use App\Models\TrainingUnitProgress;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

/**
 * Repository for trainingUnit progress database access.
 */
class TrainingUnitProgressRepository
{
    /**
     * Create or update progress for a trainingUnit.
     *
     * @param  array<string, mixed>  $data
     */
    public function upsert(string $userId, int $trainingUnitId, array $data): TrainingUnitProgress
    {
        return TrainingUnitProgress::updateOrCreate(
            ['user_id' => $userId, 'training_unit_id' => $trainingUnitId],
            $data
        );
    }

    /**
     * Find progress by user and trainingUnit.
     */
    public function findByUserAndTrainingUnit(string $userId, int $trainingUnitId): ?TrainingUnitProgress
    {
        return TrainingUnitProgress::where('user_id', $userId)
            ->where('training_unit_id', $trainingUnitId)
            ->first();
    }

    /**
     * Find or create progress record for user and trainingUnit.
     */
    public function findOrCreate(string $userId, int $trainingUnitId): TrainingUnitProgress
    {
        return TrainingUnitProgress::firstOrCreate(
            ['user_id' => $userId, 'training_unit_id' => $trainingUnitId],
            ['completed' => false]
        );
    }

    /**
     * Find all progress for a user.
     */
    public function findByUser(User $user): Collection
    {
        return TrainingUnitProgress::where('user_id', $user->id)
            ->with('trainingUnit.module.trainingPath')
            ->get();
    }

    /**
     * Find all progress for a user in a trainingPath.
     */
    public function findByUserAndTrainingPath(User $user, int $trainingPathId): Collection
    {
        return TrainingUnitProgress::where('user_id', $user->id)
            ->whereHas('trainingUnit.module', fn ($q) => $q->where('training_path_id', $trainingPathId))
            ->with('trainingUnit')
            ->get();
    }

    /**
     * Mark a trainingUnit as complete.
     */
    public function markComplete(string $userId, int $trainingUnitId): TrainingUnitProgress
    {
        return $this->upsert($userId, $trainingUnitId, [
            'completed' => true,
            'completed_at' => now(),
        ]);
    }

    /**
     * Mark a trainingUnit as incomplete.
     */
    public function markIncomplete(string $userId, int $trainingUnitId): TrainingUnitProgress
    {
        return $this->upsert($userId, $trainingUnitId, [
            'completed' => false,
            'completed_at' => null,
        ]);
    }

    /**
     * Update video watch progress.
     */
    public function updateVideoProgress(
        string $userId,
        int $trainingUnitId,
        int $percentage,
        int $positionSeconds,
    ): TrainingUnitProgress {
        $progress = $this->findOrCreate($userId, $trainingUnitId);
        $progress->updateVideoProgress($percentage, $positionSeconds);

        return $progress->fresh();
    }

    /**
     * Mark quiz as passed and optionally complete the trainingUnit.
     */
    public function markQuizPassed(string $userId, int $trainingUnitId, int $attemptId): TrainingUnitProgress
    {
        $progress = $this->findOrCreate($userId, $trainingUnitId);
        $progress->markQuizPassed($attemptId);

        return $progress->fresh();
    }

    /**
     * Mark article as read and optionally complete the trainingUnit.
     */
    public function markArticleRead(string $userId, int $trainingUnitId): TrainingUnitProgress
    {
        $progress = $this->findOrCreate($userId, $trainingUnitId);
        $progress->markArticleRead();

        return $progress->fresh();
    }

    /**
     * Get completed trainingUnit count for a trainingPath.
     */
    public function getCompletedCountForTrainingPath(User $user, int $trainingPathId): int
    {
        return TrainingUnitProgress::where('user_id', $user->id)
            ->where('completed', true)
            ->whereHas('trainingUnit.module', fn ($q) => $q->where('training_path_id', $trainingPathId))
            ->count();
    }

    /**
     * Get trainingPath progress percentage for a user.
     * Uses a single query with conditional counting for efficiency.
     */
    public function getTrainingPathProgressPercentage(User $user, int $trainingPathId): float
    {
        $stats = \App\Models\TrainingUnit::whereHas('module', fn ($q) => $q->where('training_path_id', $trainingPathId))
            ->leftJoin('training_unit_progress', function ($join) use ($user) {
                $join->on('training_units.id', '=', 'training_unit_progress.training_unit_id')
                    ->where('training_unit_progress.user_id', '=', $user->id);
            })
            ->selectRaw('COUNT(training_units.id) as total, SUM(CASE WHEN training_unit_progress.completed = 1 THEN 1 ELSE 0 END) as completed')
            ->first();

        if (! $stats || $stats->total === 0) {
            return 0;
        }

        return round(($stats->completed / $stats->total) * 100, 1);
    }
}
