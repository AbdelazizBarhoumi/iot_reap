<?php

namespace App\Services;

use App\Enums\TrainingPathStatus;
use App\Models\TrainingPath;
use App\Models\User;
use App\Repositories\TrainingPathRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;

/**
 * Service for managing featured trainingPaths on the homepage.
 */
class FeaturedTrainingPathsService
{
    public function __construct(
        private readonly TrainingPathRepository $trainingPathRepository,
        private readonly TrainingPathCacheService $cacheService,
    ) {}

    /**
     * Get all featured trainingPaths ordered by featured_order (cached).
     */
    public function getFeaturedTrainingPaths(int $limit = 6): Collection
    {
        return $this->cacheService->rememberFeaturedTrainingPaths(function () use ($limit) {
            return TrainingPath::where('is_featured', true)
                ->where('status', TrainingPathStatus::APPROVED)
                ->orderBy('featured_order')
                ->orderByDesc('featured_at')
                ->limit($limit)
                ->with(['instructor:id,name'])
                ->get();
        });
    }

    /**
     * Feature a trainingPath (admin action).
     *
     * @throws \DomainException
     */
    public function featureTrainingPath(TrainingPath $trainingPath, User $admin, ?int $order = null): TrainingPath
    {
        if ($trainingPath->status !== TrainingPathStatus::APPROVED) {
            throw new \DomainException('Only approved trainingPaths can be featured.');
        }

        if ($trainingPath->is_featured) {
            throw new \DomainException('This trainingPath is already featured.');
        }

        // If no order specified, add to the end
        if ($order === null) {
            $maxOrder = TrainingPath::where('is_featured', true)->max('featured_order') ?? 0;
            $order = $maxOrder + 1;
        }

        $trainingPath->update([
            'is_featured' => true,
            'featured_order' => $order,
            'featured_at' => now(),
        ]);

        // Invalidate caches
        $this->cacheService->invalidateTrainingPath($trainingPath);

        Log::info('TrainingPath featured', [
            'training_path_id' => $trainingPath->id,
            'admin_id' => $admin->id,
            'order' => $order,
        ]);

        return $trainingPath->fresh();
    }

    /**
     * Unfeature a trainingPath (admin action).
     */
    public function unfeatureTrainingPath(TrainingPath $trainingPath, User $admin): TrainingPath
    {
        if (! $trainingPath->is_featured) {
            throw new \DomainException('This trainingPath is not currently featured.');
        }

        $trainingPath->update([
            'is_featured' => false,
            'featured_order' => null,
            'featured_at' => null,
        ]);

        // Re-order remaining featured trainingPaths to fill the gap
        $this->reorderFeaturedTrainingPaths();

        // Invalidate caches
        $this->cacheService->invalidateTrainingPath($trainingPath);

        Log::info('TrainingPath unfeatured', [
            'training_path_id' => $trainingPath->id,
            'admin_id' => $admin->id,
        ]);

        return $trainingPath->fresh();
    }

    /**
     * Update featured trainingPaths order (admin action).
     *
     * @param  array<int, int>  $trainingPathOrderMap  [training_path_id => new_order]
     */
    public function updateFeaturedOrder(array $trainingPathOrderMap, User $admin): void
    {
        foreach ($trainingPathOrderMap as $trainingPathId => $order) {
            TrainingPath::where('id', $trainingPathId)
                ->where('is_featured', true)
                ->update(['featured_order' => $order]);
        }

        // Invalidate featured trainingPaths cache
        $this->cacheService->invalidateFeatured();

        Log::info('Featured trainingPaths reordered', [
            'admin_id' => $admin->id,
            'changes' => count($trainingPathOrderMap),
        ]);
    }

    /**
     * Re-order featured trainingPaths to fill gaps.
     */
    private function reorderFeaturedTrainingPaths(): void
    {
        $featured = TrainingPath::where('is_featured', true)
            ->orderBy('featured_order')
            ->get();

        foreach ($featured->values() as $index => $trainingPath) {
            $trainingPath->update(['featured_order' => $index + 1]);
        }
    }

    /**
     * Get count of featured trainingPaths.
     */
    public function getFeaturedCount(): int
    {
        return TrainingPath::where('is_featured', true)->count();
    }

    /**
     * Check if a trainingPath can be featured.
     */
    public function canFeature(TrainingPath $trainingPath): bool
    {
        return $trainingPath->status === TrainingPathStatus::APPROVED && ! $trainingPath->is_featured;
    }
}
