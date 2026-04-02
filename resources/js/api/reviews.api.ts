/**
 * Reviews API module for course reviews CRUD operations.
 */
import client from './client';
export interface CourseReview {
    id: number;
    course_id: number;
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
    data: CourseReview[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}
interface ReviewResponse {
    data: CourseReview;
    message?: string;
}
interface MyReviewResponse {
    data: CourseReview | null;
    can_review: boolean;
}
interface StatsResponse {
    data: ReviewStats;
}
/**
 * Get paginated reviews for a course.
 */
export async function getReviews(
    courseId: number,
    page = 1,
    perPage = 10,
): Promise<ReviewsResponse> {
    const response = await client.get<ReviewsResponse>(
        `/courses/${courseId}/reviews?page=${page}&per_page=${perPage}`,
    );
    return response.data;
}
/**
 * Get review stats for a course.
 */
export async function getReviewStats(courseId: number): Promise<ReviewStats> {
    const response = await client.get<StatsResponse>(
        `/courses/${courseId}/reviews/stats`,
    );
    return response.data.data;
}
/**
 * Get current user's review for a course.
 */
export async function getMyReview(courseId: number): Promise<MyReviewResponse> {
    const response = await client.get<MyReviewResponse>(
        `/courses/${courseId}/reviews/my`,
    );
    return response.data;
}
/**
 * Create a new review.
 */
export async function createReview(
    courseId: number,
    data: CreateReviewData,
): Promise<CourseReview> {
    const response = await client.post<ReviewResponse>(
        `/courses/${courseId}/reviews`,
        data,
    );
    return response.data.data;
}
/**
 * Update an existing review.
 */
export async function updateReview(
    courseId: number,
    reviewId: number,
    data: CreateReviewData,
): Promise<CourseReview> {
    const response = await client.put<ReviewResponse>(
        `/courses/${courseId}/reviews/${reviewId}`,
        data,
    );
    return response.data.data;
}
/**
 * Delete a review.
 */
export async function deleteReview(
    courseId: number,
    reviewId: number,
): Promise<void> {
    await client.delete(`/courses/${courseId}/reviews/${reviewId}`);
}
export const reviewsApi = {
    getReviews,
    getReviewStats,
    getMyReview,
    createReview,
    updateReview,
    deleteReview,
};

