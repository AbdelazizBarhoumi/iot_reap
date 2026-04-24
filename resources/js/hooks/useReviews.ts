/**
 * useReviews hook for managing trainingPath reviews.
 */
import { usePage } from '@inertiajs/react';
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import type {
    TrainingPathReview,
    ReviewStats,
    CreateReviewData,
} from '@/api/reviews.api';
import { reviewsApi } from '@/api/reviews.api';
import type { PageProps } from '@/types/api.types';
interface UseReviewsOptions {
    trainingPathId: number;
    autoFetch?: boolean;
}
interface UseReviewsReturn {
    reviews: TrainingPathReview[];
    stats: ReviewStats | null;
    myReview: TrainingPathReview | null;
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
    createReview: (data: CreateReviewData) => Promise<TrainingPathReview | null>;
    updateReview: (
        reviewId: number,
        data: CreateReviewData,
    ) => Promise<TrainingPathReview | null>;
    deleteReview: (reviewId: number) => Promise<boolean>;
    isSubmitting: boolean;
}
export function useReviews({
    trainingPathId,
    autoFetch = true,
}: UseReviewsOptions): UseReviewsReturn {
    const [reviews, setReviews] = useState<TrainingPathReview[]>([]);
    const [stats, setStats] = useState<ReviewStats | null>(null);
    const [myReview, setMyReview] = useState<TrainingPathReview | null>(null);
    const [canReview, setCanReview] = useState(false);
    const [loading, setLoading] = useState(false);
    const [statsLoading, setStatsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalReviews, setTotalReviews] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { auth } = usePage<PageProps>().props;
    const fetchReviews = useCallback(
        async (page = 1) => {
            setLoading(true);
            setError(null);
            try {
                const response = await reviewsApi.getReviews(trainingPathId, page);
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
            } finally {
                setLoading(false);
            }
        },
        [trainingPathId],
    );
    const fetchStats = useCallback(async () => {
        setStatsLoading(true);
        try {
            const data = await reviewsApi.getReviewStats(trainingPathId);
            setStats(data);
        } catch {
            // Silently fail - stats are non-critical
        } finally {
            setStatsLoading(false);
        }
    }, [trainingPathId]);
    const fetchMyReview = useCallback(async () => {
        if (!auth?.user) {
            setMyReview(null);
            setCanReview(false);
            return;
        }
        try {
            const response = await reviewsApi.getMyReview(trainingPathId);
            setMyReview(response.data);
            setCanReview(response.can_review);
        } catch {
            // Silently fail - endpoint is auth-only
            setMyReview(null);
            setCanReview(false);
        }
    }, [trainingPathId, auth?.user]);
    useEffect(() => {
        if (autoFetch && trainingPathId) {
            fetchReviews();
            fetchStats();
            fetchMyReview();
        }
    }, [autoFetch, trainingPathId, fetchReviews, fetchStats, fetchMyReview]);
    const createReview = useCallback(
        async (data: CreateReviewData): Promise<TrainingPathReview | null> => {
            setIsSubmitting(true);
            try {
                const newReview = await reviewsApi.createReview(trainingPathId, data);
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
        [trainingPathId, fetchStats],
    );
    const updateReview = useCallback(
        async (
            reviewId: number,
            data: CreateReviewData,
        ): Promise<TrainingPathReview | null> => {
            setIsSubmitting(true);
            try {
                const updatedReview = await reviewsApi.updateReview(
                    trainingPathId,
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
        [trainingPathId, fetchStats],
    );
    const deleteReview = useCallback(
        async (reviewId: number): Promise<boolean> => {
            setIsSubmitting(true);
            try {
                await reviewsApi.deleteReview(trainingPathId, reviewId);
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
        [trainingPathId, fetchStats],
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

