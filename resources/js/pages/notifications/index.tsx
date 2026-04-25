import { Head } from '@inertiajs/react';
import { Bell, BellOff, Check, CheckCheck, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { notificationApi } from '@/api/notification.api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Notification } from '@/types/notification.types';

interface Props {
    notifications?: Notification[] | { data?: Notification[] };
    unread_count?: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Notifications', href: '/notifications' },
];

export default function NotificationsPage({
    notifications: notificationsProp,
    unread_count = 0,
}: Props) {
    const initialNotifications = useMemo(
        () =>
            Array.isArray(notificationsProp)
                ? notificationsProp
                : (notificationsProp?.data ?? []),
        [notificationsProp],
    );

    const [notifications, setNotifications] =
        useState<Notification[]>(initialNotifications);
    const [unreadCount, setUnreadCount] = useState(unread_count);
    const [loading, setLoading] = useState(false);

    const markAsRead = async (id: string) => {
        setNotifications((current) =>
            current.map((notification) =>
                notification.id === id
                    ? { ...notification, read: true }
                    : notification,
            ),
        );
        setUnreadCount((count) => Math.max(0, count - 1));

        try {
            await notificationApi.markAsRead(id);
        } catch {
            setNotifications((current) =>
                current.map((notification) =>
                    notification.id === id
                        ? { ...notification, read: false }
                        : notification,
                ),
            );
            setUnreadCount((count) => count + 1);
        }
    };

    const markAllAsRead = async () => {
        setLoading(true);
        const previousNotifications = notifications;
        const previousUnreadCount = unreadCount;

        setNotifications((current) =>
            current.map((notification) => ({ ...notification, read: true })),
        );
        setUnreadCount(0);

        try {
            await notificationApi.markAllAsRead();
        } catch {
            setNotifications(previousNotifications);
            setUnreadCount(previousUnreadCount);
        } finally {
            setLoading(false);
        }
    };

    const deleteNotification = async (id: string) => {
        const target = notifications.find(
            (notification) => notification.id === id,
        );

        setNotifications((current) =>
            current.filter((notification) => notification.id !== id),
        );

        if (target && !target.read) {
            setUnreadCount((count) => Math.max(0, count - 1));
        }

        try {
            await notificationApi.delete(id);
        } catch {
            setNotifications((current) => {
                if (
                    !target ||
                    current.some((notification) => notification.id === id)
                ) {
                    return current;
                }

                return [target, ...current];
            });

            if (target && !target.read) {
                setUnreadCount((count) => count + 1);
            }
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />
            <div className="container max-w-3xl space-y-6 py-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Notifications</h1>
                        <p className="text-muted-foreground">
                            {unreadCount > 0
                                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                                : 'All caught up!'}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="outline"
                            onClick={() => void markAllAsRead()}
                            disabled={loading}
                        >
                            <CheckCheck className="mr-2 h-4 w-4" />
                            Mark all as read
                        </Button>
                    )}
                </div>
                <div className="space-y-3">
                    {notifications.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <BellOff className="mb-4 h-12 w-12 text-muted-foreground" />
                                <p className="text-muted-foreground">
                                    No notifications yet
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        notifications.map((notification) => (
                            <Card
                                key={notification.id}
                                className={
                                    notification.read ? 'opacity-60' : ''
                                }
                            >
                                <CardContent className="flex items-start gap-4 p-4">
                                    <div
                                        className={`rounded-full p-2 ${notification.read ? 'bg-muted' : 'bg-primary/10'}`}
                                    >
                                        <Bell
                                            className={`h-4 w-4 ${notification.read ? 'text-muted-foreground' : 'text-primary'}`}
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className="font-medium">
                                                    {notification.title}
                                                </h3>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {notification.message}
                                                </p>
                                            </div>
                                            {!notification.read && (
                                                <Badge
                                                    variant="default"
                                                    className="shrink-0"
                                                >
                                                    New
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="mt-3 flex items-center gap-4">
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(
                                                    notification.created_at,
                                                ).toLocaleString()}
                                            </span>
                                            <div className="flex gap-2">
                                                {!notification.read && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            void markAsRead(
                                                                notification.id,
                                                            );
                                                        }}
                                                    >
                                                        <Check className="mr-1 h-3 w-3" />
                                                        Mark read
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => {
                                                        void deleteNotification(
                                                            notification.id,
                                                        );
                                                    }}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
