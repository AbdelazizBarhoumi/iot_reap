/**
 * KPI Card Component
 * Displays a key performance indicator with trend.
 */
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
interface KPICardProps {
    title: string;
    value: string | number;
    change?: number;
    format?: 'number' | 'currency' | 'percentage';
    icon?: React.ReactNode;
    subtitle?: string;
}
export function KPICard({
    title,
    value,
    change,
    format = 'number',
    icon,
    subtitle,
}: KPICardProps) {
    const formatValue = () => {
        if (format === 'currency' && typeof value === 'number') {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            }).format(value);
        }
        if (format === 'percentage' && typeof value === 'number') {
            return `${value.toFixed(1)}%`;
        }
        if (typeof value === 'number') {
            return new Intl.NumberFormat('en-US').format(value);
        }
        return value;
    };
    const getTrendIcon = () => {
        if (change === undefined || change === 0) {
            return <Minus className="h-4 w-4 text-muted-foreground" />;
        }
        if (change > 0) {
            return <TrendingUp className="h-4 w-4 text-green-500" />;
        }
        return <TrendingDown className="h-4 w-4 text-red-500" />;
    };
    const getTrendColor = () => {
        if (change === undefined || change === 0)
            return 'text-muted-foreground';
        return change > 0 ? 'text-green-500' : 'text-red-500';
    };
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                {icon && <div className="text-muted-foreground">{icon}</div>}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formatValue()}</div>
                {(change !== undefined || subtitle) && (
                    <div className="mt-1 flex items-center gap-1">
                        {change !== undefined && (
                            <>
                                {getTrendIcon()}
                                <span
                                    className={cn(
                                        'text-xs font-medium',
                                        getTrendColor(),
                                    )}
                                >
                                    {change > 0 ? '+' : ''}
                                    {change.toFixed(1)}%
                                </span>
                            </>
                        )}
                        {subtitle && (
                            <span className="text-xs text-muted-foreground">
                                {change !== undefined ? ' · ' : ''}
                                {subtitle}
                            </span>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
