/**
 * Admin Maintenance Page
 * System maintenance and health checks.
 */
import { Head, router } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    Database,
    HardDrive,
    RefreshCw,
    Server,
    Trash2,
    Wrench,
} from 'lucide-react';
import { useState } from 'react';
import { ActivityLog } from '@/components/monitoring/ActivityLog';
import { AlertsPanel } from '@/components/monitoring/AlertsPanel';
import { MetricsChart } from '@/components/monitoring/MetricsChart';
import { SystemHealthOverview } from '@/components/monitoring/SystemHealthOverview';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
interface HealthCheck {
    name: string;
    status: 'healthy' | 'warning' | 'critical';
    message: string;
    lastChecked: string;
}
interface Props {
    health: HealthCheck[];
    storage: {
        used: number;
        total: number;
        percentage: number;
    };
    cache: {
        size: string;
        entries: number;
    };
    queue: {
        pending: number;
        failed: number;
    };
}
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/infrastructure' },
    { title: 'Maintenance', href: '/admin/maintenance' },
];
const statusConfig = {
    healthy: { color: 'text-success', bg: 'bg-success/10', icon: CheckCircle2 },
    warning: {
        color: 'text-warning',
        bg: 'bg-warning/10',
        icon: AlertTriangle,
    },
    critical: {
        color: 'text-destructive',
        bg: 'bg-destructive/10',
        icon: AlertTriangle,
    },
};

// Mock data for monitoring components - replace with real data from backend
const mockSystemHealth = {
    overall: 'healthy' as const,
    lastChecked: new Date().toISOString(),
    services: [
        { id: '1', name: 'Database', status: 'healthy' as const },
        { id: '2', name: 'Cache', status: 'healthy' as const },
        { id: '3', name: 'Queue', status: 'warning' as const },
        { id: '4', name: 'Proxmox API', status: 'healthy' as const },
    ],
    metrics: [
        {
            id: '1',
            name: 'CPU Usage',
            value: 45,
            unit: '%',
            max: 100,
            status: 'healthy' as const,
            trend: 'stable' as const,
        },
        {
            id: '2',
            name: 'Memory Usage',
            value: 62,
            unit: '%',
            max: 100,
            status: 'healthy' as const,
            trend: 'up' as const,
            trendValue: 2,
        },
    ],
};

const mockMetrics = [
    {
        id: '1',
        name: 'CPU Usage',
        value: 45,
        unit: '%',
        max: 100,
        status: 'healthy' as const,
        trend: 'stable' as const,
    },
    {
        id: '2',
        name: 'Memory Usage',
        value: 62,
        unit: '%',
        max: 100,
        status: 'healthy' as const,
        trend: 'up' as const,
    },
];

const mockAlerts = [
    {
        id: '1',
        severity: 'warning' as const,
        title: 'High queue backlog',
        message: 'VM provisioning queue has 12 pending jobs',
        source: 'queue-monitor',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        acknowledged: false,
    },
    {
        id: '2',
        severity: 'info' as const,
        title: 'Database backup completed',
        message: 'Daily backup successfully completed at 2:30 AM',
        source: 'backup-service',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        acknowledged: true,
    },
];

const mockActivityLog = [
    {
        id: '1',
        type: 'vm' as const,
        action: 'Created VM',
        details: 'Ubuntu-22.04-Web-Server provisioned successfully',
        user: 'admin@example.com',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
        id: '2',
        type: 'security' as const,
        action: 'User login',
        details: 'Successful login from 192.168.1.100',
        user: 'admin@example.com',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
    },
    {
        id: '3',
        type: 'system' as const,
        action: 'Cache cleared',
        details: 'Automatic cache clearing executed',
        timestamp: new Date(Date.now() - 14400000).toISOString(),
    },
];
export default function MaintenancePage({
    health = [],
    storage,
    cache,
    queue,
}: Props) {
    const [running, setRunning] = useState<string | null>(null);
    const runTask = (task: string, endpoint: string) => {
        setRunning(task);
        router.post(
            endpoint,
            {},
            {
                onFinish: () => setRunning(null),
            },
        );
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Maintenance - Admin" />
            <div className="container space-y-6 py-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            System Maintenance
                        </h1>
                        <p className="text-muted-foreground">
                            Health checks and maintenance tasks
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => router.reload()}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                </div>
                {/* Health Checks */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Health Checks
                        </CardTitle>
                        <CardDescription>
                            System component status
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {health.length === 0 ? (
                                <p className="py-4 text-center text-muted-foreground">
                                    No health checks configured
                                </p>
                            ) : (
                                health.map((check) => {
                                    const status = statusConfig[check.status];
                                    const StatusIcon = status.icon;
                                    return (
                                        <div
                                            key={check.name}
                                            className="flex items-center justify-between rounded-lg border p-4"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`rounded-full p-2 ${status.bg}`}
                                                >
                                                    <StatusIcon
                                                        className={`h-4 w-4 ${status.color}`}
                                                    />
                                                </div>
                                                <div>
                                                    <div className="font-medium">
                                                        {check.name}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {check.message}
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={`${status.bg} ${status.color} border-0`}
                                            >
                                                {check.status}
                                            </Badge>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Storage */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <HardDrive className="h-5 w-5" />
                                Storage
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span>Used</span>
                                <span>
                                    {storage?.used ?? 0} GB /{' '}
                                    {storage?.total ?? 0} GB
                                </span>
                            </div>
                            <Progress value={storage?.percentage ?? 0} />
                            <p className="text-sm text-muted-foreground">
                                {storage?.percentage ?? 0}% of storage used
                            </p>
                        </CardContent>
                    </Card>
                    {/* Cache */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="h-5 w-5" />
                                Cache
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-2xl font-bold">
                                        {cache?.size ?? '0 MB'}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Cache Size
                                    </div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">
                                        {cache?.entries ?? 0}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Entries
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full"
                                disabled={running === 'cache'}
                                onClick={() =>
                                    runTask(
                                        'cache',
                                        '/admin/maintenance/clear-cache',
                                    )
                                }
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Clear Cache
                            </Button>
                        </CardContent>
                    </Card>
                </div>
                {/* Maintenance Tasks */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wrench className="h-5 w-5" />
                            Maintenance Tasks
                        </CardTitle>
                        <CardDescription>
                            Run system maintenance operations
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <Button
                                variant="outline"
                                className="flex h-auto flex-col items-center gap-2 py-4"
                                disabled={running === 'optimize'}
                                onClick={() =>
                                    runTask(
                                        'optimize',
                                        '/admin/maintenance/optimize',
                                    )
                                }
                            >
                                <RefreshCw
                                    className={`h-6 w-6 ${running === 'optimize' ? 'animate-spin' : ''}`}
                                />
                                <span>Optimize System</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="flex h-auto flex-col items-center gap-2 py-4"
                                disabled={running === 'sessions'}
                                onClick={() =>
                                    runTask(
                                        'sessions',
                                        '/admin/maintenance/cleanup-sessions',
                                    )
                                }
                            >
                                <Server
                                    className={`h-6 w-6 ${running === 'sessions' ? 'animate-spin' : ''}`}
                                />
                                <span>Cleanup Sessions</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="flex h-auto flex-col items-center gap-2 py-4"
                                disabled={running === 'queue'}
                                onClick={() =>
                                    runTask(
                                        'queue',
                                        '/admin/maintenance/retry-failed-jobs',
                                    )
                                }
                            >
                                <Activity
                                    className={`h-6 w-6 ${running === 'queue' ? 'animate-spin' : ''}`}
                                />
                                <span>
                                    Retry Failed Jobs ({queue?.failed ?? 0})
                                </span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Monitoring Components */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* System Health Overview */}
                    <SystemHealthOverview
                        health={mockSystemHealth}
                        onRefresh={() => router.reload()}
                    />

                    {/* Metrics Chart */}
                    <MetricsChart metrics={mockMetrics} />
                </div>

                {/* Alerts Panel */}
                <AlertsPanel alerts={mockAlerts} />

                {/* Activity Log */}
                <ActivityLog activities={mockActivityLog} />
            </div>
        </AppLayout>
    );
}

