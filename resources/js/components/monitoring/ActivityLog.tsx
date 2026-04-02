/**
 * Activity Log Component
 *
 * Displays system activity with:
 * - Activity type icons
 * - User attribution
 * - Timestamp and details
 * - Type-based filtering
 */
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    Server,
    User,
    BookOpen,
    Settings,
    Shield,
    Clock,
    RefreshCw,
    Search,
    X,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { ActivityLogItem } from '@/types/monitoring.types';
interface ActivityLogProps {
    activities: ActivityLogItem[];
    onRefresh?: () => void;
    isRefreshing?: boolean;
    maxHeight?: string;
}
const typeConfig = {
    vm: {
        icon: Server,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        label: 'VM',
    },
    user: {
        icon: User,
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        label: 'User',
    },
    course: {
        icon: BookOpen,
        color: 'text-violet-500',
        bg: 'bg-violet-500/10',
        label: 'Course',
    },
    system: {
        icon: Settings,
        color: 'text-muted-foreground',
        bg: 'bg-muted',
        label: 'System',
    },
    security: {
        icon: Shield,
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
        label: 'Security',
    },
};
function formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}
export function ActivityLog({
    activities,
    onRefresh,
    isRefreshing = false,
    maxHeight = '400px',
}: ActivityLogProps) {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<string | null>(null);
    const filteredActivities = useMemo(() => {
        let result = [...activities];
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(
                (a) =>
                    a.action.toLowerCase().includes(searchLower) ||
                    a.details.toLowerCase().includes(searchLower) ||
                    a.user?.toLowerCase().includes(searchLower),
            );
        }
        if (typeFilter) {
            result = result.filter((a) => a.type === typeFilter);
        }
        return result.sort(
            (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime(),
        );
    }, [activities, search, typeFilter]);
    const typeCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        activities.forEach((a) => {
            counts[a.type] = (counts[a.type] || 0) + 1;
        });
        return counts;
    }, [activities]);
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                            <Activity className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-base">
                            Activity Log
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
            <CardContent className="space-y-3">
                {/* Search and Filters */}
                <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search activities..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-9 pl-9"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-0.5 hover:bg-muted"
                            >
                                <X className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                        )}
                    </div>
                    {/* Type Filter Chips */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                        <button
                            onClick={() => setTypeFilter(null)}
                            className={cn(
                                'shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                                typeFilter === null
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:text-foreground',
                            )}
                        >
                            All
                        </button>
                        {Object.entries(typeConfig).map(
                            ([type, config]) =>
                                typeCounts[type] > 0 && (
                                    <button
                                        key={type}
                                        onClick={() =>
                                            setTypeFilter(
                                                typeFilter === type
                                                    ? null
                                                    : type,
                                            )
                                        }
                                        className={cn(
                                            'flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                                            typeFilter === type
                                                ? `${config.bg} ${config.color}`
                                                : 'bg-muted text-muted-foreground hover:text-foreground',
                                        )}
                                    >
                                        <config.icon className="h-3 w-3" />
                                        {config.label}
                                        <span className="opacity-70">
                                            ({typeCounts[type]})
                                        </span>
                                    </button>
                                ),
                        )}
                    </div>
                </div>
                {/* Activity List */}
                <div
                    className="space-y-1 overflow-y-auto pr-1"
                    style={{ maxHeight }}
                >
                    <AnimatePresence mode="popLayout">
                        {filteredActivities.length > 0 ? (
                            filteredActivities.map((activity, index) => {
                                const config = typeConfig[activity.type];
                                const TypeIcon = config.icon;
                                return (
                                    <motion.div
                                        key={activity.id}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ delay: index * 0.02 }}
                                        className="flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted/50"
                                    >
                                        <div
                                            className={cn(
                                                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                                                config.bg,
                                            )}
                                        >
                                            <TypeIcon
                                                className={cn(
                                                    'h-4 w-4',
                                                    config.color,
                                                )}
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-0.5 flex items-center gap-2">
                                                <span className="text-sm font-medium">
                                                    {activity.action}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        'px-1.5 py-0 text-[10px]',
                                                        config.color,
                                                        'border-current',
                                                    )}
                                                >
                                                    {config.label}
                                                </Badge>
                                            </div>
                                            <p className="line-clamp-1 text-xs text-muted-foreground">
                                                {activity.details}
                                            </p>
                                            <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatTime(
                                                        activity.timestamp,
                                                    )}
                                                </span>
                                                {activity.user && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1">
                                                            <User className="h-3 w-3" />
                                                            {activity.user}
                                                        </span>
                                                    </>
                                                )}
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
                                <Activity className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
                                <p className="text-sm text-muted-foreground">
                                    {search || typeFilter
                                        ? 'No matching activities'
                                        : 'No recent activity'}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </CardContent>
        </Card>
    );
}


