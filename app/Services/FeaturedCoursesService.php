<?php

namespace App\Services;

use App\Enums\CourseStatus;
use App\Models\Course;
use App\Models\User;
use App\Repositories\CourseRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;

/**
 * Service for managing featured courses on the homepage.
 */
class FeaturedCoursesService
{
    public function __construct(
        private readonly CourseRepository $courseRepository,
        private readonly CourseCacheService $cacheService,
    ) {}

    /**
     * Get all featured courses ordered by featured_order (cached).
     */
    public function getFeaturedCourses(int $limit = 6): Collection
    {
        return $this->cacheService->rememberFeaturedCourses(function () use ($limit) {
            return Course::where('is_featured', true)
                ->where('status', CourseStatus::APPROVED)
                ->orderBy('featured_order')
                ->orderByDesc('featured_at')
                ->limit($limit)
                ->with(['instructor:id,name'])
                ->get();
        });
    }

    /**
     * Feature a course (admin action).
     *
     * @throws \DomainException
     */
    public function featureCourse(Course $course, User $admin, ?int $order = null): Course
    {
        if ($course->status !== CourseStatus::APPROVED) {
            throw new \DomainException('Only approved courses can be featured.');
        }

        if ($course->is_featured) {
            throw new \DomainException('This course is already featured.');
        }

        // If no order specified, add to the end
        if ($order === null) {
            $maxOrder = Course::where('is_featured', true)->max('featured_order') ?? 0;
            $order = $maxOrder + 1;
        }

        $course->update([
            'is_featured' => true,
            'featured_order' => $order,
            'featured_at' => now(),
        ]);

        // Invalidate caches
        $this->cacheService->invalidateCourse($course);

        Log::info('Course featured', [
            'course_id' => $course->id,
            'admin_id' => $admin->id,
            'order' => $order,
        ]);

        return $course->fresh();
    }

    /**
     * Unfeature a course (admin action).
     */
    public function unfeatureCourse(Course $course, User $admin): Course
    {
        if (! $course->is_featured) {
            throw new \DomainException('This course is not currently featured.');
        }

        $course->update([
            'is_featured' => false,
            'featured_order' => null,
            'featured_at' => null,
        ]);

        // Re-order remaining featured courses to fill the gap
        $this->reorderFeaturedCourses();

        // Invalidate caches
        $this->cacheService->invalidateCourse($course);

        Log::info('Course unfeatured', [
            'course_id' => $course->id,
            'admin_id' => $admin->id,
        ]);

        return $course->fresh();
    }

    /**
     * Update featured courses order (admin action).
     *
     * @param  array<int, int>  $courseOrderMap  [course_id => new_order]
     */
    public function updateFeaturedOrder(array $courseOrderMap, User $admin): void
    {
        foreach ($courseOrderMap as $courseId => $order) {
            Course::where('id', $courseId)
                ->where('is_featured', true)
                ->update(['featured_order' => $order]);
        }

        // Invalidate featured courses cache
        $this->cacheService->invalidateFeatured();

        Log::info('Featured courses reordered', [
            'admin_id' => $admin->id,
            'changes' => count($courseOrderMap),
        ]);
    }

    /**
     * Re-order featured courses to fill gaps.
     */
    private function reorderFeaturedCourses(): void
    {
        $featured = Course::where('is_featured', true)
            ->orderBy('featured_order')
            ->get();

        foreach ($featured->values() as $index => $course) {
            $course->update(['featured_order' => $index + 1]);
        }
    }

    /**
     * Get count of featured courses.
     */
    public function getFeaturedCount(): int
    {
        return Course::where('is_featured', true)->count();
    }

    /**
     * Check if a course can be featured.
     */
    public function canFeature(Course $course): bool
    {
        return $course->status === CourseStatus::APPROVED && ! $course->is_featured;
    }
}
