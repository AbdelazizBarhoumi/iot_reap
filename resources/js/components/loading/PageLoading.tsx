/**
 * Page Loading Component
 *
 * A beautiful loading indicator for lazy-loaded pages
 * Used with React.lazy() and Suspense for code splitting
 */
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
interface PageLoadingProps {
    message?: string;
}
export function PageLoading({ message = 'Loading...' }: PageLoadingProps) {
    return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4"
            >
                {/* Animated Loader */}
                <div className="relative">
                    <motion.div
                        className="h-12 w-12 rounded-full border-4 border-muted"
                        animate={{
                            borderColor: [
                                'hsl(var(--muted))',
                                'hsl(var(--primary))',
                                'hsl(var(--muted))',
                            ],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                    <motion.div
                        className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary"
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                    />
                </div>
                {/* Loading Text */}
                <motion.p
                    className="text-sm text-muted-foreground"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                >
                    {message}
                </motion.p>
            </motion.div>
        </div>
    );
}
/**
 * Skeleton loading for content areas
 */
interface ContentSkeletonProps {
    lines?: number;
    showAvatar?: boolean;
    showImage?: boolean;
}
export function ContentSkeleton({
    lines = 3,
    showAvatar = false,
    showImage = false,
}: ContentSkeletonProps) {
    return (
        <div className="animate-pulse space-y-4">
            {showImage && <div className="h-48 w-full rounded-xl bg-muted" />}
            <div className="flex items-start gap-3">
                {showAvatar && (
                    <div className="h-10 w-10 shrink-0 rounded-full bg-muted" />
                )}
                <div className="flex-1 space-y-2">
                    {Array.from({ length: lines }).map((_, i) => (
                        <div
                            key={i}
                            className="h-4 rounded bg-muted"
                            style={{
                                width: i === lines - 1 ? '60%' : '100%',
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
/**
 * Card skeleton for grid layouts
 */
export function CardSkeleton() {
    return (
        <div className="animate-pulse rounded-xl border bg-card p-4">
            <div className="mb-4 h-32 w-full rounded-lg bg-muted" />
            <div className="space-y-2">
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-3 w-2/3 rounded bg-muted" />
            </div>
            <div className="mt-4 flex items-center gap-2 border-t pt-4">
                <div className="h-6 w-6 rounded-full bg-muted" />
                <div className="h-3 w-20 rounded bg-muted" />
            </div>
        </div>
    );
}
/**
 * Table skeleton for data tables
 */
interface TableSkeletonProps {
    rows?: number;
    columns?: number;
}
export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
    return (
        <div className="animate-pulse rounded-xl border">
            {/* Header */}
            <div className="flex items-center gap-4 border-b bg-muted/30 p-4">
                {Array.from({ length: columns }).map((_, i) => (
                    <div
                        key={i}
                        className="h-4 rounded bg-muted"
                        style={{
                            width: i === 0 ? '30%' : `${20 + ((i * 7) % 20)}%`,
                        }}
                    />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div
                    key={rowIndex}
                    className="flex items-center gap-4 border-b p-4 last:border-0"
                >
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <div
                            key={colIndex}
                            className="h-4 rounded bg-muted"
                            style={{
                                width:
                                    colIndex === 0
                                        ? '30%'
                                        : `${15 + (((rowIndex + colIndex) * 5) % 25)}%`,
                            }}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}
/**
 * Dashboard skeleton with stats and charts
 */
export function DashboardSkeleton() {
    return (
        <div className="animate-pulse space-y-6">
            {/* Stats Row */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-xl border bg-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-muted" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 w-20 rounded bg-muted" />
                                <div className="h-6 w-16 rounded bg-muted" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {/* Charts Row */}
            <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border bg-card p-4">
                    <div className="mb-4 h-4 w-32 rounded bg-muted" />
                    <div className="h-64 rounded-lg bg-muted" />
                </div>
                <div className="rounded-xl border bg-card p-4">
                    <div className="mb-4 h-4 w-24 rounded bg-muted" />
                    <div className="h-64 rounded-lg bg-muted" />
                </div>
            </div>
            {/* Table */}
            <TableSkeleton rows={5} columns={5} />
        </div>
    );
}
/**
 * Inline loading spinner
 */
interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}
export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
    };
    return (
        <Loader2
            className={`animate-spin text-primary ${sizeClasses[size]} ${className}`}
        />
    );
}


