<?php

namespace App\Repositories;

use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

/**
 * Repository for course database access.
 */
class CourseRepository
{
    /**
     * Create a new course.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Course
    {
        return Course::create($data);
    }

    /**
     * Find a course by ID.
     */
    public function findById(int $id): ?Course
    {
        return Course::find($id);
    }

    /**
     * Find a course by ID with modules and lessons.
     */
    public function findByIdWithContent(int $id): ?Course
    {
        return Course::with(['modules.lessons', 'instructor'])->find($id);
    }

    /**
     * Find all approved courses.
     */
    public function findApproved(): Collection
    {
        return Course::approved()
            ->with('instructor')
            ->withCount('enrollments as student_count')
            ->orderByDesc('created_at')
            ->get();
    }

    /**
     * Find approved courses by category.
     */
    public function findApprovedByCategory(string $category): Collection
    {
        return Course::approved()
            ->byCategory($category)
            ->with('instructor')
            ->withCount('enrollments as student_count')
            ->orderByDesc('created_at')
            ->get();
    }

    /**
     * Find all courses by an instructor.
     */
    public function findByInstructor(User $user): Collection
    {
        return Course::byInstructor($user->id)
            ->with(['instructor', 'modules.lessons'])
            ->withCount('enrollments as student_count')
            ->orderByDesc('created_at')
            ->get();
    }

    /**
     * Find all courses pending review.
     */
    public function findPendingReview(): Collection
    {
        return Course::pendingReview()
            ->with(['instructor', 'modules.lessons'])
            ->withCount('enrollments as student_count')
            ->orderBy('created_at')
            ->get();
    }

    /**
     * Search approved courses.
     */
    public function searchApproved(string $query): Collection
    {
        return Course::approved()
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                    ->orWhere('description', 'like', "%{$query}%");
            })
            ->with('instructor')
            ->withCount('enrollments as student_count')
            ->get();
    }

    /**
     * Update a course.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(Course $course, array $data): Course
    {
        $course->update($data);

        return $course->fresh();
    }

    /**
     * Delete a course.
     */
    public function delete(Course $course): bool
    {
        return $course->delete();
    }

    /**
     * Get all unique categories.
     *
     * @return array<string>
     */
    public function getCategories(): array
    {
        return Course::approved()
            ->distinct()
            ->pluck('category')
            ->toArray();
    }

    /**
     * Full-text search courses with filters and sorting.
     *
     * @param  array<string, mixed>  $filters
     */
    public function searchWithFilters(
        string $query,
        array $filters = [],
        string $sort = 'relevance'
    ): Collection {
        $searchQuery = Course::query()
            ->approved()
            ->with(['instructor']);

        // Use FULLTEXT search on MySQL, LIKE fallback on other databases
        if (\DB::getDriverName() === 'mysql') {
            $searchQuery->selectRaw(
                '*, MATCH(title, description) AGAINST(? IN NATURAL LANGUAGE MODE) AS relevance_score',
                [$query]
            )
                ->whereRaw(
                    'MATCH(title, description) AGAINST(? IN NATURAL LANGUAGE MODE)',
                    [$query]
                );
        } else {
            // SQLite/other fallback: use LIKE search
            $searchQuery->addSelect([
                '*',
                \DB::raw('1 AS relevance_score'),
            ])
                ->where(function ($q) use ($query) {
                    $q->where('title', 'LIKE', "%{$query}%")
                        ->orWhere('description', 'LIKE', "%{$query}%");
                });
        }

        // Apply filters
        if (! empty($filters['category'])) {
            $searchQuery->where('category', $filters['category']);
        }

        if (! empty($filters['level'])) {
            $searchQuery->where('level', $filters['level']);
        }

        if (isset($filters['price_min'])) {
            $searchQuery->where('price_cents', '>=', $filters['price_min'] * 100);
        }

        if (isset($filters['price_max'])) {
            $searchQuery->where('price_cents', '<=', $filters['price_max'] * 100);
        }

        if (isset($filters['is_free']) && $filters['is_free']) {
            $searchQuery->where('is_free', true);
        }

        if (isset($filters['has_virtual_machine']) && $filters['has_virtual_machine']) {
            $searchQuery->where('has_virtual_machine', true);
        }

        // Apply sorting
        match ($sort) {
            'relevance' => $searchQuery->orderByDesc('relevance_score'),
            'newest' => $searchQuery->orderByDesc('created_at'),
            'rating' => $searchQuery->orderByDesc('rating'),
            'enrollments' => $searchQuery->withCount('enrollments')->orderByDesc('enrollments_count'),
            'price_low' => $searchQuery->orderBy('price_cents'),
            'price_high' => $searchQuery->orderByDesc('price_cents'),
            default => $searchQuery->orderByDesc('relevance_score'),
        };

        return $searchQuery->get();
    }

    /**
     * Get title suggestions for autocomplete.
     *
     * @return array<string>
     */
    public function getTitleSuggestions(string $query, int $limit = 5): array
    {
        return Course::approved()
            ->where('title', 'LIKE', "%{$query}%")
            ->select('title')
            ->distinct()
            ->limit($limit)
            ->pluck('title')
            ->toArray();
    }

    /**
     * Get category statistics for search filters.
     *
     * @return array<array{slug: string, name: string, count: int}>
     */
    public function getCategoryStats(): array
    {
        return Course::approved()
            ->select('category')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('category')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($item) => [
                'slug' => strtolower(str_replace(' ', '-', $item->category)),
                'name' => $item->category,
                'count' => $item->count,
            ])
            ->toArray();
    }

    /**
     * Get courses by category slug.
     */
    public function findByCategorySlug(string $slug): Collection
    {
        $categoryName = str_replace('-', ' ', $slug);

        return Course::approved()
            ->where(\DB::raw('LOWER(category)'), 'LIKE', strtolower($categoryName))
            ->with('instructor')
            ->withCount('enrollments as student_count')
            ->orderByDesc('rating')
            ->get();
    }
}
