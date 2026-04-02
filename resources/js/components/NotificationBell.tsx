/**
 * Notification Bell Component
 *
 * A notification center with:
 * - Unread badge count
 * - Grouped notifications by date
 * - Mark as read functionality
 * - Real-time updates support
 * - Different notification type icons
 */
import { router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    CheckCheck,
    BookCheck,
    XCircle,
    Users,
    MessageSquare,
    AtSign,
    Award,
    Megaphone,
    AlertCircle,
    Clock,
    ChevronRight,
    Settings,
    Loader2,
} from 'lucide-react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { notificationApi } from '@/api/notification.api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type {
    Notification,
    NotificationType,
    NotificationGroup,
} from '@/types/notification.types';
// Icon mapping for notification types
const typeIcons: Record<NotificationType, typeof Bell> = {
    course_approved: BookCheck,
    course_rejected: XCircle,
    new_enrollment: Users,
    forum_reply: MessageSquare,
    forum_mention: AtSign,
    quiz_graded: Award,
    certificate_ready: Award,
    system: AlertCircle,
    announcement: Megaphone,
};
const typeColors: Record<NotificationType, string> = {
    course_approved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    course_rejected: 'bg-red-500/10 text-red-600 dark:text-red-400',
    new_enrollment: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    forum_reply: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    forum_mention: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    quiz_graded: 'bg-primary/10 text-primary',
    certificate_ready: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    system: 'bg-muted text-muted-foreground',
    announcement: 'bg-primary/10 text-primary',
};
// Group notifications by date
function groupNotifications(
    notifications: Notification[],
): NotificationGroup[] {
    const groups: Record<string, Notification[]> = {};
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    notifications.forEach((notification) => {
        const date = new Date(notification.created_at);
        let dateKey: string;
        if (date.toDateString() === today.toDateString()) {
            dateKey = 'today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            dateKey = 'yesterday';
        } else if (date > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
            dateKey = 'this_week';
        } else {
            dateKey = 'earlier';
        }
        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(notification);
    });
    const order = ['today', 'yesterday', 'this_week', 'earlier'];
    const labels: Record<string, string> = {
        today: 'Today',
        yesterday: 'Yesterday',
        this_week: 'This Week',
        earlier: 'Earlier',
    };
    return order
        .filter((key) => groups[key]?.length > 0)
        .map((key) => ({
            date: key,
            label: labels[key],
            notifications: groups[key],
        }));
}
// Format relative time
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
interface NotificationBellProps {
    className?: string;
}
export function NotificationBell({ className }: NotificationBellProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    // Fetch notifications from API
    const fetchNotifications = useCallback(async () => {
        try {
            const data = await notificationApi.getRecent(20);
            setNotifications(data.notifications);
            setUnreadCount(data.unread_count);
        } catch (error) {
            // Silently fail - notifications are non-critical
            console.error('Failed to fetch notifications:', error);
        }
    }, []);
    // Initial fetch and polling
    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every 60 seconds
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);
    // Refresh when popover opens
    useEffect(() => {
        if (open) {
            fetchNotifications();
        }
    }, [open, fetchNotifications]);
    const filteredNotifications = useMemo(
        () =>
            activeTab === 'unread'
                ? notifications.filter((n) => !n.read)
                : notifications,
        [notifications, activeTab],
    );
    const groupedNotifications = useMemo(
        () => groupNotifications(filteredNotifications),
        [filteredNotifications],
    );
    const markAsRead = useCallback(async (id: string) => {
        // Optimistic update
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        try {
            await notificationApi.markAsRead(id);
        } catch (error) {
            // Revert on error
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: false } : n)),
            );
            setUnreadCount((prev) => prev + 1);
            console.error('Failed to mark notification as read:', error);
        }
    }, []);
    const markAllAsRead = useCallback(async () => {
        setLoading(true);
        const previousNotifications = notifications;
        const previousUnreadCount = unreadCount;
        // Optimistic update
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
        try {
            await notificationApi.markAllAsRead();
        } catch (error) {
            // Revert on error
            setNotifications(previousNotifications);
            setUnreadCount(previousUnreadCount);
            console.error('Failed to mark all notifications as read:', error);
        } finally {
            setLoading(false);
        }
    }, [notifications, unreadCount]);
    const handleNotificationClick = useCallback(
        (notification: Notification) => {
            if (!notification.read) {
                markAsRead(notification.id);
            }
            if (notification.link) {
                setOpen(false);
                router.visit(notification.link);
            }
        },
        [markAsRead],
    );
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn('relative h-9 w-9', className)}
                    aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                >
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <AnimatePresence>
                        {unreadCount > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground"
                            >
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </motion.span>
                        )}
                    </AnimatePresence>
                    {/* Ping animation for new notifications */}
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 h-5 w-5 animate-ping rounded-full bg-primary/50" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="end"
                className="w-[380px] p-0"
                sideOffset={8}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold">Notifications</h3>
                        {unreadCount > 0 && (
                            <Badge
                                variant="secondary"
                                className="h-5 px-1.5 text-xs"
                            >
                                {unreadCount} new
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={markAllAsRead}
                                disabled={loading}
                                className="h-8 text-xs text-muted-foreground hover:text-foreground"
                            >
                                {loading ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <CheckCheck className="mr-1 h-3.5 w-3.5" />
                                )}
                                Mark all read
                            </Button>
                        )}
                    </div>
                </div>
                {/* Tabs */}
                <Tabs
                    value={activeTab}
                    onValueChange={(v) => setActiveTab(v as 'all' | 'unread')}
                >
                    <TabsList className="h-10 w-full justify-start rounded-none border-b bg-transparent px-4">
                        <TabsTrigger
                            value="all"
                            className="rounded-none px-3 py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                        >
                            All
                        </TabsTrigger>
                        <TabsTrigger
                            value="unread"
                            className="rounded-none px-3 py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                        >
                            Unread ({unreadCount})
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value={activeTab} className="mt-0">
                        <ScrollArea className="h-[380px]">
                            {groupedNotifications.length > 0 ? (
                                <div className="divide-y">
                                    {groupedNotifications.map((group) => (
                                        <div key={group.date}>
                                            <div className="sticky top-0 z-10 bg-muted/80 px-4 py-1.5 backdrop-blur-sm">
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    {group.label}
                                                </span>
                                            </div>
                                            <div className="divide-y divide-border/50">
                                                {group.notifications.map(
                                                    (notification) => {
                                                        const Icon =
                                                            typeIcons[
                                                                notification
                                                                    .type
                                                            ];
                                                        return (
                                                            <motion.button
                                                                key={
                                                                    notification.id
                                                                }
                                                                initial={{
                                                                    opacity: 0,
                                                                    x: -10,
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    x: 0,
                                                                }}
                                                                onClick={() =>
                                                                    handleNotificationClick(
                                                                        notification,
                                                                    )
                                                                }
                                                                className={cn(
                                                                    'flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted/50',
                                                                    !notification.read &&
                                                                        'bg-primary/5',
                                                                )}
                                                            >
                                                                <div
                                                                    className={cn(
                                                                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                                                                        typeColors[
                                                                            notification
                                                                                .type
                                                                        ],
                                                                    )}
                                                                >
                                                                    <Icon className="h-4 w-4" />
                                                                </div>
                                                                <div className="min-w-0 flex-1 space-y-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <span
                                                                            className={cn(
                                                                                'truncate text-sm',
                                                                                !notification.read &&
                                                                                    'font-semibold',
                                                                            )}
                                                                        >
                                                                            {
                                                                                notification.title
                                                                            }
                                                                        </span>
                                                                        {!notification.read && (
                                                                            <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                                                                        )}
                                                                    </div>
                                                                    <p className="line-clamp-2 text-xs text-muted-foreground">
                                                                        {
                                                                            notification.message
                                                                        }
                                                                    </p>
                                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground/70">
                                                                        <Clock className="h-3 w-3" />
                                                                        {formatTime(
                                                                            notification.created_at,
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                {notification.link && (
                                                                    <ChevronRight className="mt-2.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                                                )}
                                                            </motion.button>
                                                        );
                                                    },
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                                        <Bell className="h-7 w-7 text-muted-foreground" />
                                    </div>
                                    <h4 className="mb-1 text-sm font-medium">
                                        {activeTab === 'unread'
                                            ? 'All caught up!'
                                            : 'No notifications yet'}
                                    </h4>
                                    <p className="max-w-[200px] text-xs text-muted-foreground">
                                        {activeTab === 'unread'
                                            ? "You've read all your notifications"
                                            : "We'll notify you when something important happens"}
                                    </p>
                                </div>
                            )}
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
                {/* Footer */}
                <div className="border-t px-4 py-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-full justify-between text-xs text-muted-foreground hover:text-foreground"
                        asChild
                    >
                        <a href="/notifications">
                            <span className="flex items-center gap-1.5">
                                <Settings className="h-3.5 w-3.5" />
                                Notification Settings
                            </span>
                            <ChevronRight className="h-3.5 w-3.5" />
                        </a>
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}


