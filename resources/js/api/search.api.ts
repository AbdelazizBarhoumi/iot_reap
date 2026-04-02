/**
 * Search API Module
 *
 * Provides API calls for the global search functionality.
 */
import axios from 'axios';
import type { SearchResult, SearchSuggestion } from '@/types/search.types';
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
     * Full-text search across courses, lessons, articles.
     */
    async search(params: {
        q: string;
        category?: string;
        level?: string;
        sort?: 'relevance' | 'rating' | 'students' | 'newest';
        page?: number;
        per_page?: number;
    }): Promise<SearchResponse> {
        const response = await axios.get<SearchResponse>('/search', {
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
        const response = await axios.get<SuggestResponse>('/search/suggest', {
            params: { q: query, limit },
        });
        return response.data.suggestions;
    },
    /**
     * Get recent searches for the authenticated user.
     */
    async getRecent(): Promise<string[]> {
        const response = await axios.get<RecentResponse>('/search/recent');
        return response.data.searches;
    },
    /**
     * Get trending searches.
     */
    async getTrending(): Promise<string[]> {
        const response = await axios.get<TrendingResponse>('/search/trending');
        return response.data.trending;
    },
    /**
     * Get all categories with course counts.
     */
    async getCategories(): Promise<CategoriesResponse['categories']> {
        const response =
            await axios.get<CategoriesResponse>('/search/categories');
        return response.data.categories;
    },
    /**
     * Get courses by category slug.
     */
    async getCoursesByCategory(slug: string): Promise<SearchResult[]> {
        const response = await axios.get<{ courses: SearchResult[] }>(
            `/search/category/${slug}`,
            { headers: { Accept: 'application/json' } },
        );
        return response.data.courses;
    },
};

