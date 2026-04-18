/**
 * ReviewCard - Display a single trainingPath review.
 */
import { formatDistanceToNow } from 'date-fns';
import { MoreVertical, Edit2, Trash2 } from 'lucide-react';
import type { TrainingPathReview } from '@/api/reviews.api';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { StarRating } from './StarRating';
interface ReviewCardProps {
    review: TrainingPathReview;
    isOwnReview?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
    className?: string;
}
export function ReviewCard({
    review,
    isOwnReview = false,
    onEdit,
    onDelete,
    className,
}: ReviewCardProps) {
    const initials =
        review.user?.name
            ?.split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'U';
    return (
        <Card className={cn('relative', className)}>
            <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium text-foreground">
                                {review.user?.name || 'Anonymous'}
                            </p>
                            <div className="mt-0.5 flex items-center gap-2">
                                <StarRating
                                    value={review.rating}
                                    readonly
                                    size="sm"
                                />
                                <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(
                                        new Date(review.created_at),
                                        { addSuffix: true },
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Actions menu */}
                    {isOwnReview && (onEdit || onDelete) && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    aria-label="Review options"
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {onEdit && (
                                    <DropdownMenuItem onClick={onEdit}>
                                        <Edit2 className="mr-2 h-4 w-4" />
                                        Edit review
                                    </DropdownMenuItem>
                                )}
                                {onDelete && (
                                    <DropdownMenuItem
                                        onClick={onDelete}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete review
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
                {/* Review text */}
                {review.review && (
                    <p className="mt-3 text-sm whitespace-pre-wrap text-foreground/80">
                        {review.review}
                    </p>
                )}
                {/* Featured badge */}
                {review.is_featured && (
                    <span className="mt-3 inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                        Featured Review
                    </span>
                )}
            </CardContent>
        </Card>
    );
}


