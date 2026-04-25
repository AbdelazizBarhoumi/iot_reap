/**
 * Search API Module
 *
 * Provides API calls for the global search functionality.
 */
import type { SearchResult, SearchSuggestion } from '@/types/search.types';
import client from './client';
interface SearchFilters {
    category?: string;
    level?: string;
    has_vm?: boolean;
    price_min?: number;
    price_max?: number;
}
interface SearchResponse {
    results: SearchResult[];
    total: number;
    query: string;
    filters: SearchFilters;
    sort: string;
    categories: Array<{ slug: string; name: string; count: number }>;
}
interface SuggestResponse {
    suggestions: SearchSuggestion[];
}
interface TrendingResponse {
    trending: string[];
}
interface RecentResponse {
    searches: string[];
}
interface CategoriesResponse {
    categories: Array<{ slug: string; name: string; count: number }>;
}
export const searchApi = {
    /**
     * Full-text search across trainingPaths, trainingUnits, articles.
     */
    async search(params: {
        q: string;
        category?: string;
        level?: string;
        sort?: 'relevance' | 'rating' | 'students' | 'newest';
        page?: number;
        per_page?: number;
    }): Promise<SearchResponse> {
        const response = await client.get<SearchResponse>('/search', {
            params,
            headers: { Accept: 'application/json' },
        });
        return response.data;
    },
    /**
     * Get search suggestions (autocomplete).
     */
    async suggest(
        query: string,
        limit: number = 5,
    ): Promise<SearchSuggestion[]> {
        const response = await client.get<SuggestResponse>('/search/suggest', {
            params: { q: query, limit },
        });
        return response.data.suggestions;
    },
    /**
     * Get recent searches for the authenticated user.
     */
    async getRecent(): Promise<string[]> {
        const response = await client.get<RecentResponse>('/search/recent');
        return response.data.searches;
    },
    /**
     * Get trending searches.
     */
    async getTrending(): Promise<string[]> {
        const response = await client.get<TrendingResponse>('/search/trending');
        return response.data.trending;
    },
    /**
     * Get all categories with trainingPath counts.
     */
    async getCategories(): Promise<CategoriesResponse['categories']> {
        const response =
            await client.get<CategoriesResponse>('/search/categories');
        return response.data.categories;
    },
    /**
     * Get trainingPaths by category slug.
     */
    async getTrainingPathsByCategory(slug: string): Promise<SearchResult[]> {
        const response = await client.get<{ trainingPaths: SearchResult[] }>(
            `/search/category/${slug}`,
            { headers: { Accept: 'application/json' } },
        );
        return response.data.trainingPaths;
    },
};
