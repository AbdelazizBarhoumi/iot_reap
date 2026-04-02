<?php

namespace App\Http\Controllers;

use App\Http\Requests\Search\SearchRequest;
use App\Http\Requests\Search\SuggestRequest;
use App\Http\Resources\SearchResultResource;
use App\Services\SearchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

/**
 * Controller for search functionality.
 */
class SearchController extends Controller
{
    public function __construct(
        private readonly SearchService $searchService,
    ) {}

    /**
     * Search courses.
     */
    public function search(SearchRequest $request): JsonResponse|InertiaResponse
    {
        $query = $request->validated('q');
        $filters = $request->getFilters();
        $sort = $request->validated('sort', 'relevance');

        $result = $this->searchService->search(
            query: $query,
            filters: $filters,
            sort: $sort,
            user: $request->user(),
            ipAddress: $request->ip(),
            userAgent: $request->userAgent(),
        );

        $categories = $this->searchService->getCategories();

        $responseData = [
            'results' => SearchResultResource::collection($result['results']),
            'total' => $result['total'],
            'query' => $query,
            'filters' => $filters,
            'sort' => $sort,
            'categories' => $categories,
        ];

        if ($request->wantsJson()) {
            return response()->json($responseData);
        }

        return Inertia::render('courses/search', $responseData);
    }

    /**
     * Get search suggestions (autocomplete).
     */
    public function suggest(SuggestRequest $request): JsonResponse
    {
        $query = $request->validated('q');
        $limit = $request->validated('limit', 5);

        $suggestions = $this->searchService->suggest($query, $limit);

        return response()->json([
            'suggestions' => $suggestions,
        ]);
    }

    /**
     * Get recent searches for authenticated user.
     */
    public function recent(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['searches' => []]);
        }

        $recentSearches = $this->searchService->getRecentSearches($user);

        return response()->json([
            'searches' => $recentSearches->pluck('query')->unique()->values(),
        ]);
    }

    /**
     * Get trending searches.
     */
    public function trending(): JsonResponse
    {
        $trending = $this->searchService->getTrendingSearches();

        return response()->json([
            'trending' => $trending,
        ]);
    }

    /**
     * Get all categories with counts.
     */
    public function categories(): JsonResponse
    {
        $categories = $this->searchService->getCategories();

        return response()->json([
            'categories' => $categories,
        ]);
    }

    /**
     * Get courses by category.
     */
    public function byCategory(Request $request, string $slug): JsonResponse|InertiaResponse
    {
        $courses = $this->searchService->getCoursesByCategory($slug);
        $categories = $this->searchService->getCategories();

        $categoryName = collect($categories)
            ->firstWhere('slug', $slug)['name'] ?? ucwords(str_replace('-', ' ', $slug));

        if ($request->wantsJson()) {
            return response()->json([
                'courses' => SearchResultResource::collection($courses),
                'category' => $categoryName,
            ]);
        }

        return Inertia::render('courses/category', [
            'courses' => SearchResultResource::collection($courses),
            'category' => $categoryName,
            'slug' => $slug,
            'categories' => $categories,
        ]);
    }
}
