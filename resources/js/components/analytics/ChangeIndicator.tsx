import { TrendingDown, TrendingUp } from 'lucide-react';

interface ChangeIndicatorProps {
    value: number;
}

/**
 * ChangeIndicator displays a percentage change with trending icons.
 * Positive values show green uptrend, negative values show red downtrend.
 */
export function ChangeIndicator({ value }: ChangeIndicatorProps) {
    const isPositive = value >= 0;
    const color = isPositive ? 'text-green-600' : 'text-red-600';
    const Icon = isPositive ? TrendingUp : TrendingDown;

    return (
        <div className={`flex items-center gap-1 ${color} text-sm font-semibold`}>
            <Icon className="h-4 w-4" />
            <span>{Math.abs(value).toFixed(1)}%</span>
        </div>
    );
}
