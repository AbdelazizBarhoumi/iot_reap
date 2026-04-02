/**
 * Search types for the global search system
 */
export type SearchResultType =
    | 'course'
    | 'lesson'
    | 'article'
    | 'instructor'
    | 'category';
export interface SearchResult {
    id: string;
    type: SearchResultType;
    title: string;
    subtitle?: string;
    description?: string;
    image?: string;
    url: string;
    highlight?: string;
}
export interface SearchSuggestion {
    query: string;
    type: 'recent' | 'trending' | 'suggested';
}
export interface SearchFilters {
    type?: SearchResultType;
    category?: string;
    level?: string;
}

