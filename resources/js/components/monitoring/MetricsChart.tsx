/**
 * Real-time Metrics Chart Component
 *
 * Displays live-updating metrics with:
 * - Animated line/area chart
 * - Current value display
 * - Trend indicator
 * - Threshold lines
 */
import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    Minus,
    Cpu,
    HardDrive,
    Wifi,
    Activity,
    RefreshCw,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type {
    SystemMetric,
    MetricTrend,
    SystemStatus,
} from '@/types/monitoring.types';
interface MetricsChartProps {
    metrics: SystemMetric[];
    onRefresh?: () => void;
    isRefreshing?: boolean;
}
const metricIcons: Record<string, typeof Cpu> = {
    cpu: Cpu,
    memory: Activity,
    disk: HardDrive,
    network: Wifi,
    default: Activity,
};
const statusColors: Record<SystemStatus, string> = {
    healthy: 'text-emerald-500',
    warning: 'text-amber-500',
    critical: 'text-red-500',
    unknown: 'text-muted-foreground',
};
const statusBgColors: Record<SystemStatus, string> = {
    healthy: 'bg-emerald-500',
    warning: 'bg-amber-500',
    critical: 'bg-red-500',
    unknown: 'bg-muted-foreground',
};
const trendIcons: Record<MetricTrend, typeof TrendingUp> = {
    up: TrendingUp,
    down: TrendingDown,
    stable: Minus,
};
interface MiniChartProps {
    data: { value: number }[];
    max: number;
    status: SystemStatus;
}
function MiniChart({ data, max, status }: MiniChartProps) {
    const width = 120;
    const height = 40;
    const padding = 2;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    if (data.length < 2) return null;
    const xStep = chartWidth / (data.length - 1);
    const points = data.map((d, i) => ({
        x: padding + i * xStep,
        y: padding + chartHeight - (d.value / max) * chartHeight,
    }));
    const pathD = points.reduce((acc, point, i) => {
        if (i === 0) return `M ${point.x} ${point.y}`;
        return `${acc} L ${point.x} ${point.y}`;
    }, '');
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;
    return (
        <svg width={width} height={height} className="overflow-visible">
            {/* Area fill */}
            <motion.path
                d={areaD}
                fill={`url(#gradient-${status})`}
                opacity={0.3}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
            />
            {/* Line */}
            <motion.path
                d={pathD}
                fill="none"
                stroke={statusBgColors[status].replace('bg-', 'var(--')}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={statusColors[status].replace('text-', 'stroke-')}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5 }}
            />
            {/* Gradients */}
            <defs>
                <linearGradient
                    id={`gradient-${status}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                >
                    <stop
                        offset="0%"
                        className={statusColors[status].replace('text', 'stop')}
                        stopOpacity={0.4}
                    />
                    <stop
                        offset="100%"
                        className={statusColors[status].replace('text', 'stop')}
                        stopOpacity={0}
                    />
                </linearGradient>
            </defs>
        </svg>
    );
}
interface MetricCardProps {
    metric: SystemMetric;
    index: number;
}
function MetricCard({ metric, index }: MetricCardProps) {
    const Icon = metricIcons[metric.id] || metricIcons.default;
    const TrendIcon = metric.trend ? trendIcons[metric.trend] : Minus;
    const percentage = metric.max
        ? Math.round((metric.value / metric.max) * 100)
        : null;
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
                'rounded-xl border p-4 transition-colors',
                metric.status === 'critical' &&
                    'border-red-500/30 bg-red-50/50 dark:bg-red-950/20',
                metric.status === 'warning' &&
                    'border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20',
                metric.status === 'healthy' && 'hover:border-primary/30',
            )}
        >
            <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2">
                    <div
                        className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-lg',
                            metric.status === 'healthy' && 'bg-emerald-500/10',
                            metric.status === 'warning' && 'bg-amber-500/10',
                            metric.status === 'critical' && 'bg-red-500/10',
                        )}
                    >
                        <Icon
                            className={cn(
                                'h-4 w-4',
                                statusColors[metric.status],
                            )}
                        />
                    </div>
                    <span className="text-sm font-medium">{metric.name}</span>
                </div>
                <Badge
                    variant="outline"
                    className={cn(
                        'px-1.5 py-0 text-[10px] capitalize',
                        statusColors[metric.status],
                        'border-current',
                    )}
                >
                    {metric.status}
                </Badge>
            </div>
            <div className="flex items-end justify-between">
                <div>
                    <div className="flex items-baseline gap-1">
                        <span
                            className={cn(
                                'text-3xl font-bold',
                                statusColors[metric.status],
                            )}
                        >
                            {metric.value}
                        </span>
                        <span className="text-sm text-muted-foreground">
                            {metric.unit}
                        </span>
                    </div>
                    {percentage !== null && (
                        <div className="mt-1 flex items-center gap-1.5">
                            <div className="h-1.5 w-20 flex-1 overflow-hidden rounded-full bg-muted">
                                <motion.div
                                    className={cn(
                                        'h-full rounded-full',
                                        statusBgColors[metric.status],
                                    )}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{
                                        duration: 0.5,
                                        delay: index * 0.05,
                                    }}
                                />
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {percentage}%
                            </span>
                        </div>
                    )}
                    {metric.trend && metric.trendValue !== undefined && (
                        <div
                            className={cn(
                                'mt-1 flex items-center gap-1 text-xs',
                                metric.trend === 'up' && 'text-red-500',
                                metric.trend === 'down' && 'text-emerald-500',
                                metric.trend === 'stable' &&
                                    'text-muted-foreground',
                            )}
                        >
                            <TrendIcon className="h-3 w-3" />
                            <span>
                                {metric.trendValue > 0 ? '+' : ''}
                                {metric.trendValue}%
                            </span>
                        </div>
                    )}
                </div>
                {/* Mini Chart */}
                {metric.history && metric.history.length > 1 && metric.max && (
                    <MiniChart
                        data={metric.history.map((h) => ({ value: h.value }))}
                        max={metric.max}
                        status={metric.status}
                    />
                )}
            </div>
        </motion.div>
    );
}
export function MetricsChart({
    metrics,
    onRefresh,
    isRefreshing = false,
}: MetricsChartProps) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                            <Activity className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-base">
                            System Metrics
                        </CardTitle>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        className="h-8"
                    >
                        <RefreshCw
                            className={cn(
                                'h-4 w-4',
                                isRefreshing && 'animate-spin',
                            )}
                        />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                    {metrics.map((metric, index) => (
                        <MetricCard
                            key={metric.id}
                            metric={metric}
                            index={index}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}


