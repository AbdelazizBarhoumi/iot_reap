<?php

namespace App\Repositories;

use App\Models\TrainingPath;
use App\Models\TrainingPathEnrollment;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
/**
 * Repository for trainingPath database access.
 */
class TrainingPathRepository
{
    /**
     * Create a new trainingPath.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): TrainingPath
    {
        return TrainingPath::create($data);
    }

    /**
     * Find a trainingPath by ID.
     */
    public function findById(int $id): ?TrainingPath
    {
        return TrainingPath::find($id);
    }

    /**
     * Find a trainingPath by ID with modules and trainingUnits.
     */
    public function findByIdWithContent(int $id): ?TrainingPath
    {
        return TrainingPath::with(['modules.trainingUnits', 'instructor'])->find($id);
    }

    /**
     * Find all approved trainingPaths.
     */
    public function findApproved(): Collection
    {
        return TrainingPath::approved()
            ->with('instructor')
            ->withCount('enrollments as student_count')
            ->orderByDesc('created_at')
            ->get();
    }

    /**
     * Find approved trainingPaths by category.
     */
    public function findApprovedByCategory(string $category): Collection
    {
        return TrainingPath::approved()
            ->byCategory($category)
            ->with('instructor')
            ->withCount('enrollments as student_count')
            ->orderByDesc('created_at')
            ->get();
    }

    /**
     * Find all trainingPaths by an instructor.
     */
    public function findByInstructor(User $user): Collection
    {
        return TrainingPath::byInstructor($user->id)
            ->with(['instructor', 'modules.trainingUnits'])
            ->withCount('enrollments as student_count')
            ->orderByDesc('created_at')
            ->get();
    }

    /**
     * Get the instructor's average completion rate across all their trainingPaths.
     */
    public function getInstructorCompletionRate(User $user): float
    {
        $trainingPathIds = TrainingPath::byInstructor($user->id)->pluck('id');

        if ($trainingPathIds->isEmpty()) {
            return 0.0;
        }

        $totalEnrollments = TrainingPathEnrollment::whereIn('training_path_id', $trainingPathIds)->count();

        if ($totalEnrollments === 0) {
            return 0.0;
        }

        $completedEnrollments = TrainingPathEnrollment::whereIn('training_path_id', $trainingPathIds)
            ->whereNotNull('completed_at')
            ->count();

        return round(($completedEnrollments / $totalEnrollments) * 100, 1);
    }

    /**
     * Find all trainingPaths pending review.
     */
    public function findPendingReview(): Collection
    {
        return TrainingPath::pendingReview()
            ->with(['instructor', 'modules.trainingUnits'])
            ->withCount('enrollments as student_count')
            ->orderBy('created_at')
            ->get();
    }

    /**
     * Search approved trainingPaths.
     */
    public function searchApproved(string $query): Collection
    {
        $query = $this->escapeLike($query);

        return TrainingPath::approved()
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                    ->orWhere('description', 'like', "%{$query}%");
            })
            ->with('instructor')
            ->withCount('enrollments as student_count')
            ->get();
    }

    /**
     * Update a trainingPath.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(TrainingPath $trainingPath, array $data): TrainingPath
    {
        $trainingPath->update($data);

        return $trainingPath->fresh();
    }

    /**
     * Delete a trainingPath.
     */
    public function delete(TrainingPath $trainingPath): bool
    {
        return $trainingPath->delete();
    }

    /**
     * Get all unique categories.
     *
     * @return array<string>
     */
    public function getCategories(): array
    {
        return TrainingPath::approved()
            ->distinct()
            ->pluck('category')
            ->toArray();
    }

    /**
     * Search approved trainingPaths using partial matching on title and description.
     *
     * @param  array<string, mixed>  $filters
     */
    public function searchWithFilters(
        string $query,
        array $filters = [],
        string $sort = 'relevance'
    ): Collection {
        $query = $this->escapeLike($query);

        $searchQuery = TrainingPath::query()
            ->approved()
            ->with(['instructor'])
            ->addSelect([
                '*',
                DB::raw('1 AS relevance_score'),
            ])
            ->where(function ($q) use ($query) {
                $q->where('title', 'LIKE', "%{$query}%")
                    ->orWhere('description', 'LIKE', "%{$query}%");
            });

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
     * Escape LIKE wildcard characters in a query value.
     */
    private function escapeLike(string $value): string
    {
        return str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $value);
    }

    /**
     * Get title suggestions for autocomplete.
     *
     * @return array<string>
     */
    public function getTitleSuggestions(string $query, int $limit = 5): array
    {
        $query = $this->escapeLike($query);

        return TrainingPath::approved()
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
        return TrainingPath::approved()
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
     * Get trainingPaths by category slug.
     */
    public function findByCategorySlug(string $slug): Collection
    {
        $categoryName = str_replace('-', ' ', $slug);

        return TrainingPath::approved()
            ->where(DB::raw('LOWER(category)'), 'LIKE', strtolower($categoryName))
            ->with('instructor')
            ->withCount('enrollments as student_count')
            ->orderByDesc('rating')
            ->get();
    }
}
