/**
 * Article types matching the backend API resources
 */
export interface Article {
    id: number;
    training_unit_id: number;
    content: TipTapContent;
    word_count: number;
    estimated_read_time_minutes: number;
    created_at: string;
    updated_at: string;
}
// TipTap JSON content structure
export interface TipTapContent {
    type: string;
    content?: TipTapNode[];
}
export interface TipTapNode {
    type: string;
    attrs?: Record<string, unknown>;
    content?: TipTapNode[];
    text?: string;
    marks?: TipTapMark[];
}
export interface TipTapMark {
    type: string;
    attrs?: Record<string, unknown>;
}
