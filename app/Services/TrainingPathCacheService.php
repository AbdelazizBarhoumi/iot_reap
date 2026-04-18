<?php

namespace App\Services;

use App\Models\TrainingPath;
use Illuminate\Support\Facades\Cache;

/**
 * Centralized service for trainingPath cache management.
 *
 * All cache operations for trainingPaths should go through this service
 * to ensure consistent invalidation strategies.
 */
class TrainingPathCacheService
{
    /**
     * Cache key patterns.
     */
    private const APPROVED_ALL = 'trainingPaths:approved:all';

    private const APPROVED_CATEGORY = 'trainingPaths:approved:category:%s';

    private const COURSE_CONTENT = 'trainingPath:%d:content';

    private const CATEGORIES = 'trainingPaths:categories';

    private const FEATURED = 'trainingPaths:featured';

    private const ENROLLED = 'enrollments:user:%s';

    private const ENROLLMENT_CHECK = 'enrollment:user:%s:trainingPath:%d';

    /**
     * Cache TTL values (in seconds).
     */
    public const TTL_APPROVED = 900;       // 15 minutes

    public const TTL_COURSE_CONTENT = 1800; // 30 minutes

    public const TTL_CATEGORIES = 3600;     // 1 hour

    public const TTL_FEATURED = 300;        // 5 minutes

    public const TTL_ENROLLMENT = 3600;     // 1 hour

    /**
     * Get or cache approved trainingPaths.
     */
    public function rememberApprovedTrainingPaths(callable $callback): mixed
    {
        return Cache::remember(self::APPROVED_ALL, self::TTL_APPROVED, $callback);
    }

    /**
     * Get or cache approved trainingPaths by category.
     */
    public function rememberApprovedByCategory(string $category, callable $callback): mixed
    {
        $key = sprintf(self::APPROVED_CATEGORY, $category);

        return Cache::remember($key, self::TTL_APPROVED, $callback);
    }

    /**
     * Get or cache trainingPath content.
     */
    public function rememberTrainingPathContent(int $trainingPathId, callable $callback): mixed
    {
        $key = sprintf(self::COURSE_CONTENT, $trainingPathId);

        return Cache::remember($key, self::TTL_COURSE_CONTENT, $callback);
    }

    /**
     * Get or cache all categories.
     */
    public function rememberCategories(callable $callback): mixed
    {
        return Cache::remember(self::CATEGORIES, self::TTL_CATEGORIES, $callback);
    }

    /**
     * Get or cache featured trainingPaths.
     */
    public function rememberFeaturedTrainingPaths(callable $callback): mixed
    {
        return Cache::remember(self::FEATURED, self::TTL_FEATURED, $callback);
    }

    /**
     * Get or cache user's enrolled trainingPaths.
     */
    public function rememberEnrolledTrainingPaths(string $userId, callable $callback): mixed
    {
        $key = sprintf(self::ENROLLED, $userId);

        return Cache::remember($key, self::TTL_ENROLLMENT, $callback);
    }

    /**
     * Get or cache enrollment check.
     */
    public function rememberEnrollmentCheck(string $userId, int $trainingPathId, callable $callback): mixed
    {
        $key = sprintf(self::ENROLLMENT_CHECK, $userId, $trainingPathId);

        return Cache::remember($key, self::TTL_ENROLLMENT, $callback);
    }

    /**
     * Invalidate all caches related to a trainingPath.
     *
     * Call this whenever a trainingPath is created, updated, deleted,
     * approved, rejected, featured, or unfeatured.
     */
    public function invalidateTrainingPath(TrainingPath $trainingPath): void
    {
        $keys = [
            sprintf(self::COURSE_CONTENT, $trainingPath->id),
            self::APPROVED_ALL,
            sprintf(self::APPROVED_CATEGORY, $trainingPath->category),
            self::CATEGORIES,
            self::FEATURED,
        ];

        foreach ($keys as $key) {
            Cache::forget($key);
        }
    }

    /**
     * Invalidate trainingPath caches when category changes.
     */
    public function invalidateTrainingPathWithOldCategory(TrainingPath $trainingPath, string $oldCategory): void
    {
        $this->invalidateTrainingPath($trainingPath);
        Cache::forget(sprintf(self::APPROVED_CATEGORY, $oldCategory));
    }

    /**
     * Invalidate featured trainingPaths cache.
     */
    public function invalidateFeatured(): void
    {
        Cache::forget(self::FEATURED);
    }

    /**
     * Invalidate user enrollment caches.
     */
    public function invalidateUserEnrollments(string $userId): void
    {
        Cache::forget(sprintf(self::ENROLLED, $userId));
        // Note: individual enrollment checks are harder to clear,
        // but they have a 1-hour TTL which is acceptable
    }

    /**
     * Invalidate a specific enrollment check.
     */
    public function invalidateEnrollmentCheck(string $userId, int $trainingPathId): void
    {
        Cache::forget(sprintf(self::ENROLLMENT_CHECK, $userId, $trainingPathId));
    }

    /**
     * Invalidate all trainingPath listing caches.
     * Use when bulk operations occur.
     */
    public function invalidateAllListings(): void
    {
        // Clear approved trainingPaths cache
        Cache::forget(self::APPROVED_ALL);
        Cache::forget(self::CATEGORIES);
        Cache::forget(self::FEATURED);

        // Note: Category-specific caches will expire naturally
        // For a full clear, consider using cache tags if available
    }
}
