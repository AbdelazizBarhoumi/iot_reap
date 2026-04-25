/**
 * Article API Module
 * Handles article management for trainingUnits (teacher-only)
 */

import client from './client';

export interface Article {
    id: string;
    training_unit_id: string;
    title: string;
    content: string;
    preview: string;
    word_count: number;
    reading_time_minutes: number;
    published: boolean;
    created_at: string;
    updated_at: string;
}

/**
 * Get article for a trainingUnit
 */
export const getArticle = (trainingUnitId: string) =>
    client.get<Article>(`/teaching/trainingUnits/${trainingUnitId}/article`);

/**
 * Create or update article (upsert)
 */
export const saveArticle = (
    trainingUnitId: string,
    article: Partial<Article>,
) =>
    client.post<Article>(
        `/teaching/trainingUnits/${trainingUnitId}/article`,
        article,
    );

/**
 * Delete article
 */
export const deleteArticle = (trainingUnitId: string) =>
    client.delete(`/teaching/trainingUnits/${trainingUnitId}/article`);

/**
 * Get article for reading (student view)
 */
export const readArticle = (trainingPathId: string, trainingUnitId: string) =>
    client.get<Article>(`/trainingUnits/${trainingUnitId}/article/read`);

/**
 * Mark article as read (track student progress)
 */
export const markArticleRead = (
    trainingPathId: string,
    trainingUnitId: string,
) =>
    client.post(
        `/trainingPaths/${trainingPathId}/trainingUnits/${trainingUnitId}/article-read`,
        {},
    );
