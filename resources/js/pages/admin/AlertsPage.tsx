import { Head } from '@inertiajs/react';
import {
    Bell,
    CheckCheck,
    CheckCircle2,
    RefreshCw,
    ShieldAlert,
    Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
    alertsApi,
    type AlertSeverity,
    type AlertStats,
    type PaginatedAlertsResponse,
    type SystemAlert,
} from '@/api/alerts.api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    { title: 'System Alerts', href: '/admin/alerts' },
];

const severityBadgeClass: Record<AlertSeverity, string> = {
    info: 'border-blue-500/30 bg-blue-500/10 text-blue-500',
    warning: 'border-amber-500/30 bg-amber-500/10 text-amber-500',
    error: 'border-red-500/30 bg-red-500/10 text-red-500',
    critical: 'border-red-700/30 bg-red-700/10 text-red-700',
};

interface AlertFilters {
    severity: 'all' | AlertSeverity;
    source: string;
    status: 'all' | 'acknowledged' | 'unacknowledged';
}

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<SystemAlert[]>([]);
    const [meta, setMeta] = useState<PaginatedAlertsResponse['meta']>({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 15,
    });
    const [stats, setStats] = useState<AlertStats | null>(null);
    const [filters, setFilters] = useState<AlertFilters>({
        severity: 'all',
        source: 'all',
        status: 'all',
    });
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

    const sourceOptions = useMemo(
        () =>
            Array.from(
                new Set(
                    alerts
                        .map((alert) => alert.source)
                        .filter((source): source is string =>
                            Boolean(source && source.trim().length > 0),
                        ),
                ),
            ),
        [alerts],
    );

    const loadAlerts = useCallback(async () => {
        setLoading(true);

        try {
            const response = await alertsApi.listAlerts({
                page,
                per_page: 15,
                severity:
                    filters.severity === 'all' ? undefined : filters.severity,
                source: filters.source === 'all' ? undefined : filters.source,
                status: filters.status === 'all' ? undefined : filters.status,
            });

            setAlerts(response.data);
            setMeta(response.meta);
        } catch (error) {
            toast.error(getHttpErrorMessage(error, 'Failed to load alerts'));
        } finally {
            setLoading(false);
        }
    }, [filters.severity, filters.source, filters.status, page]);

    const loadStats = useCallback(async () => {
        try {
            const response = await alertsApi.getAlertStats();
            setStats(response);
        } catch (error) {
            toast.error(getHttpErrorMessage(error, 'Failed to load alert stats'));
        }
    }, []);

    useEffect(() => {
        void loadAlerts();
    }, [loadAlerts]);

    useEffect(() => {
        void loadStats();
    }, [loadStats]);

    const handleAcknowledge = async (alertId: number) => {
        setActionLoadingId(alertId);
        try {
            await alertsApi.acknowledgeAlert(alertId);
            toast.success('Alert acknowledged');
            await Promise.all([loadAlerts(), loadStats()]);
        } catch (error) {
            toast.error(getHttpErrorMessage(error, 'Failed to acknowledge alert'));
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleResolve = async (alertId: number) => {
        setActionLoadingId(alertId);
        try {
            await alertsApi.resolveAlert(alertId);
            toast.success('Alert resolved');
            await Promise.all([loadAlerts(), loadStats()]);
        } catch (error) {
            toast.error(getHttpErrorMessage(error, 'Failed to resolve alert'));
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleDelete = async (alertId: number) => {
        setActionLoadingId(alertId);
        try {
            await alertsApi.deleteAlert(alertId);
            toast.success('Alert deleted');
            await Promise.all([loadAlerts(), loadStats()]);
        } catch (error) {
            toast.error(getHttpErrorMessage(error, 'Failed to delete alert'));
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleAcknowledgeAll = async () => {
        setLoading(true);
        try {
            await alertsApi.acknowledgeAllAlerts();
            toast.success('All alerts acknowledged');
            await Promise.all([loadAlerts(), loadStats()]);
        } catch (error) {
            toast.error(getHttpErrorMessage(error, 'Failed to acknowledge all alerts'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System Alerts" />

            <div className="container space-y-6 py-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">System Alerts</h1>
                        <p className="text-muted-foreground">
                            Review, acknowledge, resolve, and clear platform alerts.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                void Promise.all([loadAlerts(), loadStats()]);
                            }}
                            disabled={loading}
                        >
                            <RefreshCw
                                className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                            />
                            Refresh
                        </Button>

                        <Button onClick={() => void handleAcknowledgeAll()} disabled={loading}>
                            <CheckCheck className="mr-2 h-4 w-4" />
                            Acknowledge All
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground">Total</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold">
                            {stats?.total ?? 0}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground">
                                Unacknowledged
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold text-amber-600">
                            {stats?.unacknowledged ?? 0}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground">Unresolved</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold text-blue-600">
                            {stats?.unresolved ?? 0}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground">Critical</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold text-red-700">
                            {stats?.critical ?? 0}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="space-y-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Bell className="h-5 w-5" />
                            Alert Queue
                        </CardTitle>

                        <div className="grid gap-2 sm:grid-cols-3">
                            <Select
                                value={filters.severity}
                                onValueChange={(value: AlertFilters['severity']) => {
                                    setPage(1);
                                    setFilters((prev) => ({ ...prev, severity: value }));
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Severity" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Severities</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                    <SelectItem value="error">Error</SelectItem>
                                    <SelectItem value="warning">Warning</SelectItem>
                                    <SelectItem value="info">Info</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={filters.status}
                                onValueChange={(value: AlertFilters['status']) => {
                                    setPage(1);
                                    setFilters((prev) => ({ ...prev, status: value }));
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="unacknowledged">Unacknowledged</SelectItem>
                                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={filters.source}
                                onValueChange={(value: string) => {
                                    setPage(1);
                                    setFilters((prev) => ({ ...prev, source: value }));
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Source" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Sources</SelectItem>
                                    {sourceOptions.map((source) => (
                                        <SelectItem key={source} value={source}>
                                            {source}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Severity</TableHead>
                                    <TableHead>Source</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {alerts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                                            No alerts found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    alerts.map((alert) => {
                                        const isActing = actionLoadingId === alert.id;

                                        return (
                                            <TableRow key={alert.id}>
                                                <TableCell>
                                                    <div className="max-w-[280px]">
                                                        <p className="font-medium">{alert.title}</p>
                                                        <p className="truncate text-xs text-muted-foreground">
                                                            {alert.description ?? 'No description'}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={severityBadgeClass[alert.severity]}>
                                                        {alert.severity}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{alert.source ?? 'system'}</TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {new Date(alert.created_at).toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                alert.acknowledged
                                                                    ? 'border-green-500/30 bg-green-500/10 text-green-600'
                                                                    : 'border-amber-500/30 bg-amber-500/10 text-amber-600'
                                                            }
                                                        >
                                                            {alert.acknowledged ? 'Acknowledged' : 'Unacknowledged'}
                                                        </Badge>
                                                        {alert.resolved ? (
                                                            <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-600">
                                                                Resolved
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-600">
                                                                Open
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {!alert.acknowledged && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    void handleAcknowledge(alert.id);
                                                                }}
                                                                disabled={isActing}
                                                            >
                                                                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                                                                Ack
                                                            </Button>
                                                        )}

                                                        {!alert.resolved && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    void handleResolve(alert.id);
                                                                }}
                                                                disabled={isActing}
                                                            >
                                                                <ShieldAlert className="mr-1 h-3.5 w-3.5" />
                                                                Resolve
                                                            </Button>
                                                        )}

                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-destructive/30 text-destructive hover:bg-destructive/10"
                                                            onClick={() => {
                                                                void handleDelete(alert.id);
                                                            }}
                                                            disabled={isActing}
                                                        >
                                                            <Trash2 className="mr-1 h-3.5 w-3.5" />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>

                        {meta.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Page {meta.current_page} of {meta.last_page} ({meta.total} alerts)
                                </span>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                        disabled={loading || page <= 1}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage((prev) => Math.min(meta.last_page, prev + 1))}
                                        disabled={loading || page >= meta.last_page}
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
