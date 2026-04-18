<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\TrainingPathRepository;
use App\Repositories\SearchRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Service for searching trainingPaths and tracking search queries.
 */
class SearchService
{
    public function __construct(
        private readonly SearchRepository $searchRepository,
        private readonly TrainingPathRepository $trainingPathRepository,
    ) {}

    /**
     * Search trainingPaths using FULLTEXT search (MySQL) or LIKE fallback (SQLite).
     *
     * @param  array<string, mixed>  $filters
     * @return array{results: Collection, total: int}
     */
    public function search(
        string $query,
        array $filters = [],
        string $sort = 'relevance',
        ?User $user = null,
        ?string $ipAddress = null,
        ?string $userAgent = null,
    ): array {
        $query = trim($query);

        if (strlen($query) < 2) {
            return ['results' => collect(), 'total' => 0];
        }

        // Use repository for search
        $results = $this->trainingPathRepository->searchWithFilters($query, $filters, $sort);
        $total = $results->count();

        // Log the search
        $this->logSearch($query, $total, $user, $ipAddress, $userAgent);

        Log::info('Search performed', [
            'query' => $query,
            'filters' => $filters,
            'results_count' => $total,
            'user_id' => $user?->id,
        ]);

        return [
            'results' => $results,
            'total' => $total,
        ];
    }

    /**
     * Get search suggestions (autocomplete).
     *
     * @return array<string>
     */
    public function suggest(string $query, int $limit = 5): array
    {
        $query = trim($query);

        if (strlen($query) < 2) {
            return [];
        }

        // Cache suggestions for 15 minutes
        $cacheKey = 'search:suggest:'.md5($query);

        return Cache::remember($cacheKey, 900, fn () => $this->trainingPathRepository->getTitleSuggestions($query, $limit)
        );
    }

    /**
     * Get recent searches for a user.
     */
    public function getRecentSearches(User $user, int $limit = 5): Collection
    {
        return $this->searchRepository->getRecentByUser($user->id, $limit);
    }

    /**
     * Get trending searches.
     *
     * @return array<string>
     */
    public function getTrendingSearches(int $days = 7, int $limit = 5): array
    {
        $cacheKey = "search:trending:{$days}:{$limit}";

        return Cache::remember($cacheKey, 1800, function () use ($days, $limit) {
            return $this->searchRepository
                ->getTrending($days, $limit)
                ->pluck('query')
                ->toArray();
        });
    }

    /**
     * Get all categories with trainingPath counts.
     *
     * @return array<array{slug: string, name: string, count: int}>
     */
    public function getCategories(): array
    {
        return Cache::remember('search:categories', 3600, fn () => $this->trainingPathRepository->getCategoryStats()
        );
    }

    /**
     * Get trainingPaths by category.
     */
    public function getTrainingPathsByCategory(string $slug): Collection
    {
        return $this->trainingPathRepository->findByCategorySlug($slug);
    }

    /**
     * Log a search query.
     */
    private function logSearch(
        string $query,
        int $resultsCount,
        ?User $user,
        ?string $ipAddress,
        ?string $userAgent,
    ): void {
        $this->searchRepository->create([
            'user_id' => $user?->id,
            'query' => $query,
            'results_count' => $resultsCount,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent ? substr($userAgent, 0, 500) : null,
        ]);
    }
}
