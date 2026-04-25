/**
 * ReviewForm - Form for creating/editing trainingPath reviews.
 */
import { motion } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { TrainingPathReview, CreateReviewData } from '@/api/reviews.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from './StarRating';
interface ReviewFormProps {
    existingReview?: TrainingPathReview | null;
    onSubmit: (data: CreateReviewData) => Promise<boolean>;
    onCancel?: () => void;
    isSubmitting?: boolean;
    variant?: 'inline' | 'modal';
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}
export function ReviewForm({
    existingReview,
    onSubmit,
    onCancel,
    isSubmitting = false,
    variant = 'inline',
    open,
    onOpenChange,
}: ReviewFormProps) {
    // Use the existing review as the form state directly
    const [rating, setRating] = useState(existingReview?.rating ?? 0);
    const [review, setReview] = useState(existingReview?.review ?? '');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return;
        const success = await onSubmit({
            rating,
            review: review.trim() || null,
        });
        if (success && !existingReview) {
            setRating(0);
            setReview('');
        }
    };
    const formContent = (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Rating */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                    Your Rating <span className="text-destructive">*</span>
                </label>
                <div className="flex items-center gap-3">
                    <StarRating value={rating} onChange={setRating} size="lg" />
                    {rating > 0 && (
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-sm font-medium text-primary"
                        >
                            {rating === 1 && 'Poor'}
                            {rating === 2 && 'Fair'}
                            {rating === 3 && 'Good'}
                            {rating === 4 && 'Very Good'}
                            {rating === 5 && 'Excellent'}
                        </motion.span>
                    )}
                </div>
            </div>
            {/* Review text */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                    Your Review (optional)
                </label>
                <Textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Share your experience with this trainingPath..."
                    className="min-h-[120px] resize-none"
                    maxLength={5000}
                />
                <p className="text-right text-xs text-muted-foreground">
                    {review.length}/5000
                </p>
            </div>
            {/* Actions */}
            <div className="flex justify-end gap-2">
                {onCancel && (
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={rating === 0 || isSubmitting}>
                    {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Send className="mr-2 h-4 w-4" />
                    )}
                    {existingReview ? 'Update Review' : 'Submit Review'}
                </Button>
            </div>
        </form>
    );
    if (variant === 'modal') {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {existingReview
                                ? 'Edit Your Review'
                                : 'Write a Review'}
                        </DialogTitle>
                        <DialogDescription>
                            Share your experience to help other students
                        </DialogDescription>
                    </DialogHeader>
                    {formContent}
                </DialogContent>
            </Dialog>
        );
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">
                    {existingReview ? 'Edit Your Review' : 'Write a Review'}
                </CardTitle>
            </CardHeader>
            <CardContent>{formContent}</CardContent>
        </Card>
    );
}
