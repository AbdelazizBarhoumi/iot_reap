<?php

namespace App\Services;

use App\Models\Course;
use Illuminate\Support\Facades\Cache;

/**
 * Centralized service for course cache management.
 *
 * All cache operations for courses should go through this service
 * to ensure consistent invalidation strategies.
 */
class CourseCacheService
{
    /**
     * Cache key patterns.
     */
    private const APPROVED_ALL = 'courses:approved:all';

    private const APPROVED_CATEGORY = 'courses:approved:category:%s';

    private const COURSE_CONTENT = 'course:%d:content';

    private const CATEGORIES = 'courses:categories';

    private const FEATURED = 'courses:featured';

    private const ENROLLED = 'enrollments:user:%s';

    private const ENROLLMENT_CHECK = 'enrollment:user:%s:course:%d';

    /**
     * Cache TTL values (in seconds).
     */
    public const TTL_APPROVED = 900;       // 15 minutes

    public const TTL_COURSE_CONTENT = 1800; // 30 minutes

    public const TTL_CATEGORIES = 3600;     // 1 hour

    public const TTL_FEATURED = 300;        // 5 minutes

    public const TTL_ENROLLMENT = 3600;     // 1 hour

    /**
     * Get or cache approved courses.
     */
    public function rememberApprovedCourses(callable $callback): mixed
    {
        return Cache::remember(self::APPROVED_ALL, self::TTL_APPROVED, $callback);
    }

    /**
     * Get or cache approved courses by category.
     */
    public function rememberApprovedByCategory(string $category, callable $callback): mixed
    {
        $key = sprintf(self::APPROVED_CATEGORY, $category);

        return Cache::remember($key, self::TTL_APPROVED, $callback);
    }

    /**
     * Get or cache course content.
     */
    public function rememberCourseContent(int $courseId, callable $callback): mixed
    {
        $key = sprintf(self::COURSE_CONTENT, $courseId);

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
     * Get or cache featured courses.
     */
    public function rememberFeaturedCourses(callable $callback): mixed
    {
        return Cache::remember(self::FEATURED, self::TTL_FEATURED, $callback);
    }

    /**
     * Get or cache user's enrolled courses.
     */
    public function rememberEnrolledCourses(string $userId, callable $callback): mixed
    {
        $key = sprintf(self::ENROLLED, $userId);

        return Cache::remember($key, self::TTL_ENROLLMENT, $callback);
    }

    /**
     * Get or cache enrollment check.
     */
    public function rememberEnrollmentCheck(string $userId, int $courseId, callable $callback): mixed
    {
        $key = sprintf(self::ENROLLMENT_CHECK, $userId, $courseId);

        return Cache::remember($key, self::TTL_ENROLLMENT, $callback);
    }

    /**
     * Invalidate all caches related to a course.
     *
     * Call this whenever a course is created, updated, deleted,
     * approved, rejected, featured, or unfeatured.
     */
    public function invalidateCourse(Course $course): void
    {
        $keys = [
            sprintf(self::COURSE_CONTENT, $course->id),
            self::APPROVED_ALL,
            sprintf(self::APPROVED_CATEGORY, $course->category),
            self::CATEGORIES,
            self::FEATURED,
        ];

        foreach ($keys as $key) {
            Cache::forget($key);
        }
    }

    /**
     * Invalidate course caches when category changes.
     */
    public function invalidateCourseWithOldCategory(Course $course, string $oldCategory): void
    {
        $this->invalidateCourse($course);
        Cache::forget(sprintf(self::APPROVED_CATEGORY, $oldCategory));
    }

    /**
     * Invalidate featured courses cache.
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
    public function invalidateEnrollmentCheck(string $userId, int $courseId): void
    {
        Cache::forget(sprintf(self::ENROLLMENT_CHECK, $userId, $courseId));
    }

    /**
     * Invalidate all course listing caches.
     * Use when bulk operations occur.
     */
    public function invalidateAllListings(): void
    {
        // Clear approved courses cache
        Cache::forget(self::APPROVED_ALL);
        Cache::forget(self::CATEGORIES);
        Cache::forget(self::FEATURED);

        // Note: Category-specific caches will expire naturally
        // For a full clear, consider using cache tags if available
    }
}
