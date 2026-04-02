/**
 * StarRating - Reusable star rating input/display component.
 */
import { Star } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
interface StarRatingProps {
    value: number;
    onChange?: (rating: number) => void;
    readonly?: boolean;
    size?: 'sm' | 'md' | 'lg';
    showValue?: boolean;
    className?: string;
}
const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
};
export function StarRating({
    value,
    onChange,
    readonly = false,
    size = 'md',
    showValue = false,
    className,
}: StarRatingProps) {
    const [hoverValue, setHoverValue] = useState(0);
    const displayValue = hoverValue || value;
    const handleClick = (rating: number) => {
        if (!readonly && onChange) {
            onChange(rating);
        }
    };
    const handleMouseEnter = (rating: number) => {
        if (!readonly) {
            setHoverValue(rating);
        }
    };
    const handleMouseLeave = () => {
        if (!readonly) {
            setHoverValue(0);
        }
    };
    return (
        <div className={cn('flex items-center gap-0.5', className)}>
            {[1, 2, 3, 4, 5].map((rating) => (
                <button
                    key={rating}
                    type="button"
                    onClick={() => handleClick(rating)}
                    onMouseEnter={() => handleMouseEnter(rating)}
                    onMouseLeave={handleMouseLeave}
                    disabled={readonly}
                    className={cn(
                        'transition-colors focus:outline-none',
                        !readonly &&
                            'cursor-pointer transition-transform hover:scale-110',
                        readonly && 'cursor-default',
                    )}
                    aria-label={`Rate ${rating} star${rating > 1 ? 's' : ''}`}
                >
                    <Star
                        className={cn(
                            sizeClasses[size],
                            'transition-colors',
                            rating <= displayValue
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-none text-muted-foreground/40',
                        )}
                    />
                </button>
            ))}
            {showValue && (
                <span className="ml-2 text-sm font-medium text-foreground">
                    {value.toFixed(1)}
                </span>
            )}
        </div>
    );
}
/**
 * StarRatingDisplay - Non-interactive star rating display with count.
 */
interface StarRatingDisplayProps {
    rating: number;
    count?: number;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}
export function StarRatingDisplay({
    rating,
    count,
    size = 'md',
    className,
}: StarRatingDisplayProps) {
    return (
        <div className={cn('flex items-center gap-1.5', className)}>
            <StarRating value={rating} readonly size={size} />
            <span className="text-sm font-medium text-foreground">
                {rating.toFixed(1)}
            </span>
            {count !== undefined && (
                <span className="text-sm text-muted-foreground">
                    ({count.toLocaleString()}{' '}
                    {count === 1 ? 'review' : 'reviews'})
                </span>
            )}
        </div>
    );
}


