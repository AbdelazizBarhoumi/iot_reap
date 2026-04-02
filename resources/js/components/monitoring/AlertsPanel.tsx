/**
 * Alerts Panel Component
 *
 * Displays system alerts with:
 * - Severity indicators (info/warning/error/critical)
 * - Acknowledge functionality
 * - Filtering by severity
 * - Timestamp and source info
 */
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle,
    XCircle,
    Info,
    Bell,
    BellOff,
    Check,
    CheckCheck,
    X,
    Clock,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { AlertItem } from '@/types/monitoring.types';
interface AlertsPanelProps {
    alerts: AlertItem[];
    onAcknowledge?: (alertId: string) => void;
    onAcknowledgeAll?: () => void;
    onDismiss?: (alertId: string) => void;
    maxHeight?: string;
}
const severityConfig = {
    info: {
        icon: Info,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
    },
    warning: {
        icon: AlertTriangle,
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
    },
    error: {
        icon: XCircle,
        color: 'text-red-500',
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
    },
    critical: {
        icon: XCircle,
        color: 'text-red-600',
        bg: 'bg-red-600/10',
        border: 'border-red-600/50',
    },
};
function formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
}
export function AlertsPanel({
    alerts,
    onAcknowledge,
    onAcknowledgeAll,
    onDismiss,
    maxHeight = '400px',
}: AlertsPanelProps) {
    const [filter, setFilter] = useState<'all' | 'unacknowledged'>('all');
    const filteredAlerts = useMemo(() => {
        let result = [...alerts];
        if (filter === 'unacknowledged') {
            result = result.filter((a) => !a.acknowledged);
        }
        // Sort by severity (critical first) then by time
        const severityOrder = { critical: 0, error: 1, warning: 2, info: 3 };
        return result.sort((a, b) => {
            const severityDiff =
                severityOrder[a.severity] - severityOrder[b.severity];
            if (severityDiff !== 0) return severityDiff;
            return (
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
            );
        });
    }, [alerts, filter]);
    const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;
    const criticalCount = alerts.filter(
        (a) => a.severity === 'critical' && !a.acknowledged,
    ).length;
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div
                            className={cn(
                                'flex h-9 w-9 items-center justify-center rounded-lg',
                                criticalCount > 0
                                    ? 'bg-red-500/10'
                                    : 'bg-primary/10',
                            )}
                        >
                            <Bell
                                className={cn(
                                    'h-5 w-5',
                                    criticalCount > 0
                                        ? 'text-red-500'
                                        : 'text-primary',
                                )}
                            />
                        </div>
                        <div>
                            <CardTitle className="flex items-center gap-2 text-base">
                                Alerts
                                {unacknowledgedCount > 0 && (
                                    <Badge
                                        variant="destructive"
                                        className="h-5 px-1.5 text-xs"
                                    >
                                        {unacknowledgedCount} new
                                    </Badge>
                                )}
                            </CardTitle>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Filter Toggle */}
                        <div className="flex rounded-lg bg-muted/50 p-1">
                            <button
                                onClick={() => setFilter('all')}
                                className={cn(
                                    'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                                    filter === 'all'
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter('unacknowledged')}
                                className={cn(
                                    'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                                    filter === 'unacknowledged'
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                Unread
                            </button>
                        </div>
                        {unacknowledgedCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onAcknowledgeAll}
                                className="h-8 text-xs text-muted-foreground"
                            >
                                <CheckCheck className="mr-1 h-3.5 w-3.5" />
                                Ack All
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div
                    className="space-y-2 overflow-y-auto pr-1"
                    style={{ maxHeight }}
                >
                    <AnimatePresence mode="popLayout">
                        {filteredAlerts.length > 0 ? (
                            filteredAlerts.map((alert, index) => {
                                const config = severityConfig[alert.severity];
                                const SeverityIcon = config.icon;
                                return (
                                    <motion.div
                                        key={alert.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10, height: 0 }}
                                        transition={{ delay: index * 0.02 }}
                                        className={cn(
                                            'rounded-lg border p-3 transition-colors',
                                            config.border,
                                            !alert.acknowledged && config.bg,
                                        )}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={cn(
                                                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                                                    config.bg,
                                                )}
                                            >
                                                <SeverityIcon
                                                    className={cn(
                                                        'h-4 w-4',
                                                        config.color,
                                                    )}
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-1 flex items-center gap-2">
                                                    <span
                                                        className={cn(
                                                            'text-sm font-medium',
                                                            !alert.acknowledged &&
                                                                'text-foreground',
                                                        )}
                                                    >
                                                        {alert.title}
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            'px-1.5 py-0 text-[10px] capitalize',
                                                            config.color,
                                                            'border-current',
                                                        )}
                                                    >
                                                        {alert.severity}
                                                    </Badge>
                                                </div>
                                                <p className="line-clamp-2 text-xs text-muted-foreground">
                                                    {alert.message}
                                                </p>
                                                <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {formatTime(
                                                            alert.timestamp,
                                                        )}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{alert.source}</span>
                                                </div>
                                            </div>
                                            {/* Actions */}
                                            <div className="flex shrink-0 items-center gap-1">
                                                {!alert.acknowledged && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            onAcknowledge?.(
                                                                alert.id,
                                                            )
                                                        }
                                                        className="h-7 w-7 p-0"
                                                    >
                                                        <Check className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        onDismiss?.(alert.id)
                                                    }
                                                    className="h-7 w-7 p-0 text-muted-foreground"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="py-8 text-center"
                            >
                                <BellOff className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
                                <p className="text-sm text-muted-foreground">
                                    {filter === 'unacknowledged'
                                        ? 'All alerts acknowledged'
                                        : 'No alerts'}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </CardContent>
        </Card>
    );
}


