/**
 * Reviews API module for trainingPath reviews CRUD operations.
 */
import client from './client';
export interface TrainingPathReview {
    id: number;
    training_path_id: number;
    rating: number;
    review: string | null;
    is_featured: boolean;
    created_at: string;
    user?: {
        id: string;
        name: string;
    };
}
export interface ReviewStats {
    average: number | null;
    count: number;
    distribution: Record<number, number>;
}
export interface CreateReviewData {
    rating: number;
    review?: string | null;
}
interface ReviewsResponse {
    data: TrainingPathReview[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}
interface ReviewResponse {
    data: TrainingPathReview;
    message?: string;
}
interface MyReviewResponse {
    data: TrainingPathReview | null;
    can_review: boolean;
}
interface StatsResponse {
    data: ReviewStats;
}
/**
 * Get paginated reviews for a trainingPath.
 */
export async function getReviews(
    trainingPathId: number,
    page = 1,
    perPage = 10,
): Promise<ReviewsResponse> {
    const response = await client.get<ReviewsResponse>(
        `/trainingPaths/${trainingPathId}/reviews?page=${page}&per_page=${perPage}`,
    );
    return response.data;
}
/**
 * Get review stats for a trainingPath.
 */
export async function getReviewStats(
    trainingPathId: number,
): Promise<ReviewStats> {
    const response = await client.get<StatsResponse>(
        `/trainingPaths/${trainingPathId}/reviews/stats`,
    );
    return response.data.data;
}
/**
 * Get current user's review for a trainingPath.
 */
export async function getMyReview(
    trainingPathId: number,
): Promise<MyReviewResponse> {
    const response = await client.get<MyReviewResponse>(
        `/trainingPaths/${trainingPathId}/reviews/my`,
    );
    return response.data;
}
/**
 * Create a new review.
 */
export async function createReview(
    trainingPathId: number,
    data: CreateReviewData,
): Promise<TrainingPathReview> {
    const response = await client.post<ReviewResponse>(
        `/trainingPaths/${trainingPathId}/reviews`,
        data,
    );
    return response.data.data;
}
/**
 * Update an existing review.
 */
export async function updateReview(
    trainingPathId: number,
    reviewId: number,
    data: CreateReviewData,
): Promise<TrainingPathReview> {
    const response = await client.put<ReviewResponse>(
        `/trainingPaths/${trainingPathId}/reviews/${reviewId}`,
        data,
    );
    return response.data.data;
}
/**
 * Delete a review.
 */
export async function deleteReview(
    trainingPathId: number,
    reviewId: number,
): Promise<void> {
    await client.delete(`/trainingPaths/${trainingPathId}/reviews/${reviewId}`);
}
export const reviewsApi = {
    getReviews,
    getReviewStats,
    getMyReview,
    createReview,
    updateReview,
    deleteReview,
};
