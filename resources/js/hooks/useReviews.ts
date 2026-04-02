/**
 * useReviews hook for managing course reviews.
 */
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import type {
    CourseReview,
    ReviewStats,
    CreateReviewData,
} from '@/api/reviews.api';
import { reviewsApi } from '@/api/reviews.api';
interface UseReviewsOptions {
    courseId: number;
    autoFetch?: boolean;
}
interface UseReviewsReturn {
    reviews: CourseReview[];
    stats: ReviewStats | null;
    myReview: CourseReview | null;
    canReview: boolean;
    loading: boolean;
    statsLoading: boolean;
    error: string | null;
    currentPage: number;
    totalPages: number;
    totalReviews: number;
    fetchReviews: (page?: number) => Promise<void>;
    fetchStats: () => Promise<void>;
    fetchMyReview: () => Promise<void>;
    createReview: (data: CreateReviewData) => Promise<CourseReview | null>;
    updateReview: (
        reviewId: number,
        data: CreateReviewData,
    ) => Promise<CourseReview | null>;
    deleteReview: (reviewId: number) => Promise<boolean>;
    isSubmitting: boolean;
}
export function useReviews({
    courseId,
    autoFetch = true,
}: UseReviewsOptions): UseReviewsReturn {
    const [reviews, setReviews] = useState<CourseReview[]>([]);
    const [stats, setStats] = useState<ReviewStats | null>(null);
    const [myReview, setMyReview] = useState<CourseReview | null>(null);
    const [canReview, setCanReview] = useState(false);
    const [loading, setLoading] = useState(false);
    const [statsLoading, setStatsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalReviews, setTotalReviews] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fetchReviews = useCallback(
        async (page = 1) => {
            setLoading(true);
            setError(null);
            try {
                const response = await reviewsApi.getReviews(courseId, page);
                setReviews(response.data);
                setCurrentPage(response.meta.current_page);
                setTotalPages(response.meta.last_page);
                setTotalReviews(response.meta.total);
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : 'Failed to load reviews';
                setError(message);
                console.error('Error fetching reviews:', err);
            } finally {
                setLoading(false);
            }
        },
        [courseId],
    );
    const fetchStats = useCallback(async () => {
        setStatsLoading(true);
        try {
            const data = await reviewsApi.getReviewStats(courseId);
            setStats(data);
        } catch (err) {
            console.error('Error fetching review stats:', err);
        } finally {
            setStatsLoading(false);
        }
    }, [courseId]);
    const fetchMyReview = useCallback(async () => {
        try {
            const response = await reviewsApi.getMyReview(courseId);
            setMyReview(response.data);
            setCanReview(response.can_review);
        } catch (err) {
            console.error('Error fetching my review:', err);
        }
    }, [courseId]);
    useEffect(() => {
        if (autoFetch && courseId) {
            fetchReviews();
            fetchStats();
            fetchMyReview();
        }
    }, [autoFetch, courseId, fetchReviews, fetchStats, fetchMyReview]);
    const createReview = useCallback(
        async (data: CreateReviewData): Promise<CourseReview | null> => {
            setIsSubmitting(true);
            try {
                const newReview = await reviewsApi.createReview(courseId, data);
                setReviews((prev) => [newReview, ...prev]);
                setMyReview(newReview);
                setCanReview(false);
                setTotalReviews((prev) => prev + 1);
                // Refresh stats
                fetchStats();
                toast.success('Review submitted successfully');
                return newReview;
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : 'Failed to submit review';
                toast.error(message);
                return null;
            } finally {
                setIsSubmitting(false);
            }
        },
        [courseId, fetchStats],
    );
    const updateReview = useCallback(
        async (
            reviewId: number,
            data: CreateReviewData,
        ): Promise<CourseReview | null> => {
            setIsSubmitting(true);
            try {
                const updatedReview = await reviewsApi.updateReview(
                    courseId,
                    reviewId,
                    data,
                );
                setReviews((prev) =>
                    prev.map((r) => (r.id === reviewId ? updatedReview : r)),
                );
                setMyReview(updatedReview);
                // Refresh stats
                fetchStats();
                toast.success('Review updated successfully');
                return updatedReview;
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : 'Failed to update review';
                toast.error(message);
                return null;
            } finally {
                setIsSubmitting(false);
            }
        },
        [courseId, fetchStats],
    );
    const deleteReview = useCallback(
        async (reviewId: number): Promise<boolean> => {
            setIsSubmitting(true);
            try {
                await reviewsApi.deleteReview(courseId, reviewId);
                setReviews((prev) => prev.filter((r) => r.id !== reviewId));
                setMyReview(null);
                setCanReview(true);
                setTotalReviews((prev) => prev - 1);
                // Refresh stats
                fetchStats();
                toast.success('Review deleted');
                return true;
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : 'Failed to delete review';
                toast.error(message);
                return false;
            } finally {
                setIsSubmitting(false);
            }
        },
        [courseId, fetchStats],
    );
    return {
        reviews,
        stats,
        myReview,
        canReview,
        loading,
        statsLoading,
        error,
        currentPage,
        totalPages,
        totalReviews,
        fetchReviews,
        fetchStats,
        fetchMyReview,
        createReview,
        updateReview,
        deleteReview,
        isSubmitting,
    };
}

