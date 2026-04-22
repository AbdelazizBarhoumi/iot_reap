/**
 * ReviewSection - Complete reviews section for trainingPath pages.
 */
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronDown, Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { CreateReviewData } from '@/api/reviews.api';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useReviews } from '@/hooks/useReviews';
import { cn } from '@/lib/utils';
import { ReviewCard } from './ReviewCard';
import { ReviewForm } from './ReviewForm';
import { StarRatingDisplay } from './StarRating';
interface ReviewSectionProps {
    trainingPathId: number;
    className?: string;
}
export function ReviewSection({ trainingPathId, className }: ReviewSectionProps) {
    const {
        reviews,
        stats,
        myReview,
        canReview,
        loading,
        statsLoading,
        currentPage,
        totalPages,
        totalReviews,
        fetchReviews,
        createReview,
        updateReview,
        deleteReview,
        isSubmitting,
    } = useReviews({ trainingPathId });
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const handleCreateReview = async (data: CreateReviewData) => {
        const result = await createReview(data);
        return result !== null;
    };
    const handleUpdateReview = async (data: CreateReviewData) => {
        if (!myReview) return false;
        const result = await updateReview(myReview.id, data);
        if (result) {
            setIsEditing(false);
        }
        return result !== null;
    };
    const handleDeleteReview = async () => {
        if (!myReview) return;
        await deleteReview(myReview.id);
        setShowDeleteDialog(false);
    };
    const handleLoadMore = () => {
        if (currentPage < totalPages) {
            fetchReviews(currentPage + 1);
        }
    };
    return (
        <div className={cn('space-y-6', className)}>
            {/* Header with stats */}
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                {/* Rating overview */}
                <Card className="flex-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-yellow-400" />
                            Engineer Reviews
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? (
                            <div className="flex justify-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : stats ? (
                            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                                {/* Average rating */}
                                <div className="text-center">
                                    <p className="text-5xl font-bold text-foreground">
                                        {stats.average?.toFixed(1) || '—'}
                                    </p>
                                    <StarRatingDisplay
                                        rating={stats.average || 0}
                                        size="md"
                                        className="mt-2 justify-center"
                                    />
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {totalReviews.toLocaleString()}{' '}
                                        {totalReviews === 1
                                            ? 'review'
                                            : 'reviews'}
                                    </p>
                                </div>
                                {/* Rating distribution */}
                                <div className="flex-1 space-y-2">
                                    {[5, 4, 3, 2, 1].map((rating) => {
                                        const count =
                                            stats.distribution[rating] || 0;
                                        const percentage =
                                            totalReviews > 0
                                                ? (count / totalReviews) * 100
                                                : 0;
                                        return (
                                            <div
                                                key={rating}
                                                className="flex items-center gap-2"
                                            >
                                                <span className="w-3 text-sm font-medium text-muted-foreground">
                                                    {rating}
                                                </span>
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <Progress
                                                    value={percentage}
                                                    className="h-2 flex-1"
                                                />
                                                <span className="w-8 text-right text-xs text-muted-foreground">
                                                    {count}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground">
                                No reviews yet
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
            {/* Review form or user's review */}
            <AnimatePresence mode="wait">
                {canReview && !isEditing && (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <ReviewForm
                            onSubmit={handleCreateReview}
                            isSubmitting={isSubmitting}
                        />
                    </motion.div>
                )}
                {myReview && !isEditing && (
                    <motion.div
                        key="my-review"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">
                                Your Review
                            </p>
                            <ReviewCard
                                review={myReview}
                                isOwnReview
                                onEdit={() => setIsEditing(true)}
                                onDelete={() => setShowDeleteDialog(true)}
                            />
                        </div>
                    </motion.div>
                )}
                {isEditing && myReview && (
                    <motion.div
                        key="edit-form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <ReviewForm
                            existingReview={myReview}
                            onSubmit={handleUpdateReview}
                            onCancel={() => setIsEditing(false)}
                            isSubmitting={isSubmitting}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Reviews list */}
            <div className="space-y-4">
                <h3 className="font-semibold text-foreground">All Reviews</h3>
                {loading && reviews.length === 0 ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : reviews.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center">
                            <p className="text-muted-foreground">
                                No reviews yet. Be the first to review!
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {reviews
                            .filter((r) => r.id !== myReview?.id)
                            .map((review) => (
                                <ReviewCard key={review.id} review={review} />
                            ))}
                    </div>
                )}
                {/* Load more */}
                {currentPage < totalPages && (
                    <div className="flex justify-center">
                        <Button
                            variant="outline"
                            onClick={handleLoadMore}
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <ChevronDown className="mr-2 h-4 w-4" />
                            )}
                            Load More Reviews
                        </Button>
                    </div>
                )}
            </div>
            {/* Delete confirmation dialog */}
            <AlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete your review?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. Your review will be
                            permanently deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteReview}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}


