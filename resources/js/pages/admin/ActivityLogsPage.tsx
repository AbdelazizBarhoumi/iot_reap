import { Head } from '@inertiajs/react';
import { ClipboardList, RefreshCw, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
    activityLogsApi,
    type ActivityLogEntry,
    type ActivityLogStats,
    type PaginatedActivityLogsResponse,
} from '@/api/activityLogs.api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { getHttpErrorMessage } from '@/lib/http-errors';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'Activity Logs', href: '/admin/activity-logs' },
];

interface ActivityLogFilters {
    type: string;
    status: string;
    days: number;
    userId: string;
    search: string;
}

export default function ActivityLogsPage() {
    const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
    const [meta, setMeta] = useState<PaginatedActivityLogsResponse['meta']>({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 20,
    });
    const [stats, setStats] = useState<ActivityLogStats | null>(null);
    const [filters, setFilters] = useState<ActivityLogFilters>({
        type: 'all',
        status: 'all',
        days: 7,
        userId: '',
        search: '',
    });
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const loadLogs = useCallback(async () => {
        setLoading(true);

        try {
            const response = await activityLogsApi.listActivityLogs({
                page,
                per_page: 20,
                type: filters.type === 'all' ? undefined : filters.type,
                status: filters.status === 'all' ? undefined : filters.status,
                user_id:
                    filters.userId.trim().length > 0
                        ? Number(filters.userId)
                        : undefined,
                days: filters.days,
            });

            setLogs(response.data);
            setMeta(response.meta);
        } catch (error) {
            toast.error(
                getHttpErrorMessage(error, 'Failed to load activity logs'),
            );
        } finally {
            setLoading(false);
        }
    }, [filters.days, filters.status, filters.type, filters.userId, page]);

    const loadStats = useCallback(async () => {
        try {
            const response = await activityLogsApi.getActivityStats(
                filters.days,
            );
            setStats(response);
        } catch (error) {
            toast.error(
                getHttpErrorMessage(error, 'Failed to load activity stats'),
            );
        }
    }, [filters.days]);

    useEffect(() => {
        void loadLogs();
    }, [loadLogs]);

    useEffect(() => {
        void loadStats();
    }, [loadStats]);

    const typeOptions = useMemo(() => {
        if (!stats?.by_type) {
            return [];
        }

        return Object.keys(stats.by_type);
    }, [stats?.by_type]);

    const statusOptions = useMemo(() => {
        if (!stats?.by_status) {
            return [];
        }

        return Object.keys(stats.by_status);
    }, [stats?.by_status]);

    const filteredLogs = useMemo(() => {
        if (!filters.search.trim()) {
            return logs;
        }

        const keyword = filters.search.trim().toLowerCase();

        return logs.filter((entry) => {
            return (
                entry.action.toLowerCase().includes(keyword) ||
                entry.description.toLowerCase().includes(keyword) ||
                (entry.user_name?.toLowerCase().includes(keyword) ?? false)
            );
        });
    }, [filters.search, logs]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Activity Logs" />

            <div className="container space-y-6 py-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Activity Logs</h1>
                        <p className="text-muted-foreground">
                            Review audit trail events across the platform.
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => {
                            void Promise.all([loadLogs(), loadStats()]);
                        }}
                        disabled={loading}
                    >
                        <RefreshCw
                            className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                        />
                        Refresh
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground">
                                Total Events
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold">
                            {stats?.total ?? 0}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground">
                                Completed
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold text-green-600">
                            {stats?.by_status?.completed ?? 0}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground">
                                Failed
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold text-red-600">
                            {stats?.by_status?.failed ?? 0}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="space-y-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <ClipboardList className="h-5 w-5" />
                            Audit Trail
                        </CardTitle>

                        <div className="grid gap-2 sm:grid-cols-5">
                            <div className="relative sm:col-span-2">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={filters.search}
                                    onChange={(event) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            search: event.target.value,
                                        }))
                                    }
                                    className="pl-9"
                                    placeholder="Search logs..."
                                />
                            </div>

                            <Select
                                value={filters.type}
                                onValueChange={(value: string) => {
                                    setPage(1);
                                    setFilters((prev) => ({
                                        ...prev,
                                        type: value,
                                    }));
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Types
                                    </SelectItem>
                                    {typeOptions.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={filters.status}
                                onValueChange={(value: string) => {
                                    setPage(1);
                                    setFilters((prev) => ({
                                        ...prev,
                                        status: value,
                                    }));
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Statuses
                                    </SelectItem>
                                    {statusOptions.map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {status}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={String(filters.days)}
                                onValueChange={(value: string) => {
                                    setPage(1);
                                    setFilters((prev) => ({
                                        ...prev,
                                        days: Number(value),
                                    }));
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Window" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Last 24h</SelectItem>
                                    <SelectItem value="7">
                                        Last 7 days
                                    </SelectItem>
                                    <SelectItem value="30">
                                        Last 30 days
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {filteredLogs.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="py-10 text-center text-muted-foreground"
                                        >
                                            No activity entries found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredLogs.map((entry) => (
                                        <TableRow key={entry.id}>
                                            <TableCell className="font-medium">
                                                {entry.action}
                                            </TableCell>
                                            <TableCell>
                                                <p className="max-w-[340px] truncate text-sm text-muted-foreground">
                                                    {entry.description}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                {entry.user_name ?? 'System'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {entry.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        entry.status ===
                                                        'completed'
                                                            ? 'border-green-500/30 bg-green-500/10 text-green-600'
                                                            : 'border-red-500/30 bg-red-500/10 text-red-600'
                                                    }
                                                >
                                                    {entry.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {new Date(
                                                    entry.created_at,
                                                ).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {meta.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Page {meta.current_page} of {meta.last_page}{' '}
                                    ({meta.total} events)
                                </span>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setPage((prev) =>
                                                Math.max(1, prev - 1),
                                            )
                                        }
                                        disabled={loading || page <= 1}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setPage((prev) =>
                                                Math.min(
                                                    meta.last_page,
                                                    prev + 1,
                                                ),
                                            )
                                        }
                                        disabled={
                                            loading || page >= meta.last_page
                                        }
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
