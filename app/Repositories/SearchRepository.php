<?php

namespace App\Repositories;

use App\Models\Search;
use Illuminate\Database\Eloquent\Collection;

/**
 * Repository for search query tracking.
 */
class SearchRepository
{
    /**
     * Log a search query.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Search
    {
        return Search::create($data);
    }

    /**
     * Get recent searches for a user.
     */
    public function getRecentByUser(string $userId, int $limit = 5): Collection
    {
        return Search::byUser($userId)
            ->recent($limit)
            ->get();
    }

    /**
     * Get trending search queries.
     *
     * @return Collection<int, object{query: string, search_count: int}>
     */
    public function getTrending(int $days = 7, int $limit = 5): Collection
    {
        return Search::trending($days, $limit)->get();
    }

    /**
     * Get popular searches across all users.
     *
     * @deprecated Unused - getTrending() returns search terms by recency instead. Candidate for removal.
     */
    public function getPopularQueries(int $limit = 10): Collection
    {
        return Search::select('query')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('query')
            ->orderByDesc('count')
            ->limit($limit)
            ->get();
    }
}
