/**
 * Admin Dashboard Page
 * Platform-wide analytics and key metrics overview.
 */
import { Head, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Activity,
    Award,
    BarChart3,
    BookOpen,
    DollarSign,
    Monitor,
    TrendingUp,
    UserPlus,
    Users,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { PeriodSelector } from '@/components/analytics';
import { ChangeIndicator } from '@/components/analytics/ChangeIndicator';
import { ActivityLog } from '@/components/monitoring/ActivityLog';
import { AlertsPanel } from '@/components/monitoring/AlertsPanel';
import { MetricsChart } from '@/components/monitoring/MetricsChart';
import { SystemHealthOverview } from '@/components/monitoring/SystemHealthOverview';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import {
    formatCurrency,
    formatDate,
    formatDateTime,
} from '@/lib/analytics.utils';
import type { BreadcrumbItem, PageProps } from '@/types';
import type {
    ActivityLogItem,
    ServiceHealth,
    SystemHealth as MonitoringSystemHealth,
    SystemMetric,
    SystemStatus,
} from '@/types/monitoring.types';
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'Dashboard', href: '/admin/dashboard' },
];
interface KPIs {
    total_users: number;
    new_users: number;
    new_users_change: number;
    total_enrollments: number;
    enrollments_change: number;
    total_completions: number;
    completions_change: number;
    total_revenue: number;
    revenue_change: number;
    total_vm_sessions: number;
    vm_sessions_change: number;
    active_trainingPaths: number;
    certificates_issued: number;
    period: string;
}
interface ChartDataPoint {
    date: string;
    enrollments: number;
    revenue: number;
    vm_sessions: number;
}
interface TopTrainingPath {
    id: number;
    title: string;
    thumbnail_url: string | null;
    enrollments: number;
    instructor: string;
}
interface RevenueCategory {
    category: string;
    revenue: number;
}
interface ActivityItem {
    type: 'enrollment' | 'payment' | 'vm_session';
    message: string;
    amount?: number;
    timestamp: string;
}
interface BackendServiceHealth {
    status?: string;
    latency_ms?: number | null;
    message?: string;
}

interface BackendAlert {
    id: string | number;
    severity: 'info' | 'warning' | 'error' | 'critical';
    title: string;
    description?: string | null;
    source?: string | null;
    acknowledged: boolean;
    created_at: string;
}

interface BackendActivityLog {
    id: string | number;
    type: string;
    action: string;
    description: string;
    user_name?: string | null;
    created_at: string;
    metadata?: Record<string, unknown> | null;
}
interface BackendSystemMetrics {
    php_memory?: {
        used_mb?: number;
        peak_mb?: number;
    };
    active_vm_sessions?: number | null;
    active_users?: number | null;
    queue?: {
        pending?: number;
        failed?: number;
    } | null;
}
interface BackendSystemHealth {
    status: string;
    active_vm_sessions: number;
    queued_sessions: number;
    pending_trainingPaths: number;
    suspended_users: number;
    services?: Record<string, BackendServiceHealth>;
    metrics?: BackendSystemMetrics;
    timestamp?: string;
}
interface DashboardPageProps extends PageProps {
    kpis: KPIs;
    chartData: ChartDataPoint[];
    topTrainingPaths: TopTrainingPath[];
    revenueByCategory: RevenueCategory[];
    userGrowthByRole: Record<string, number>;
    recentActivity: ActivityItem[];
    systemHealth: BackendSystemHealth;
    alerts: BackendAlert[];
    activityLogs: BackendActivityLog[];
    period: string;
}
const COLORS = [
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#8884d8',
    '#82ca9d',
];

const toSystemStatus = (status: string | undefined): SystemStatus => {
    switch (status) {
        case 'healthy':
        case 'warning':
        case 'critical':
        case 'unknown':
            return status;
        default:
            return 'unknown';
    }
};

const toDisplayName = (key: string): string =>
    key
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');

const toServiceHealth = (
    services: Record<string, BackendServiceHealth> | undefined,
    timestamp: string | undefined,
): ServiceHealth[] => {
    if (!services) {
        return [];
    }

    return Object.entries(services).map(([id, service]) => {
        const status = toSystemStatus(service.status);

        return {
            id,
            name: toDisplayName(id),
            status,
            latency:
                typeof service.latency_ms === 'number'
                    ? Math.round(service.latency_ms)
                    : undefined,
            lastError: status === 'critical' ? service.message : undefined,
            lastErrorAt: status === 'critical' ? timestamp : undefined,
        };
    });
};

const toMetricStatus = (
    value: number,
    warningAt: number,
    criticalAt: number,
): SystemStatus => {
    if (value >= criticalAt) {
        return 'critical';
    }

    if (value >= warningAt) {
        return 'warning';
    }

    return 'healthy';
};

const toSystemMetrics = (health: BackendSystemHealth): SystemMetric[] => {
    const metrics: SystemMetric[] = [
        {
            id: 'active_vm_sessions',
            name: 'Active VM Sessions',
            value: health.active_vm_sessions,
            unit: '',
            max: 100,
            status: toMetricStatus(health.active_vm_sessions, 50, 80),
        },
        {
            id: 'queued_sessions',
            name: 'Queued Sessions',
            value: health.queued_sessions,
            unit: '',
            max: 50,
            status: toMetricStatus(health.queued_sessions, 10, 25),
        },
        {
            id: 'pending_trainingPaths',
            name: 'Pending Reviews',
            value: health.pending_trainingPaths,
            unit: '',
            max: 20,
            status: toMetricStatus(health.pending_trainingPaths, 1, 10),
        },
        {
            id: 'suspended_users',
            name: 'Suspended Users',
            value: health.suspended_users,
            unit: '',
            max: 20,
            status: toMetricStatus(health.suspended_users, 1, 10),
        },
    ];

    const phpMemoryUsed = health.metrics?.php_memory?.used_mb;
    if (typeof phpMemoryUsed === 'number') {
        metrics.push({
            id: 'php_memory',
            name: 'PHP Memory',
            value: Math.round(phpMemoryUsed),
            unit: 'MB',
            max: 1024,
            status: toMetricStatus(phpMemoryUsed, 512, 768),
        });
    }

    const queueFailed = health.metrics?.queue?.failed;
    if (typeof queueFailed === 'number') {
        metrics.push({
            id: 'failed_jobs',
            name: 'Failed Jobs',
            value: queueFailed,
            unit: '',
            max: 50,
            status: toMetricStatus(queueFailed, 1, 5),
        });
    }

    return metrics;
};

const toActivityType = (
    type: ActivityItem['type'],
): ActivityLogItem['type'] => {
    switch (type) {
        case 'enrollment':
            return 'trainingPath';
        case 'vm_session':
            return 'vm';
        case 'payment':
        default:
            return 'system';
    }
};

const toActivityAction = (type: ActivityItem['type']): string => {
    switch (type) {
        case 'enrollment':
            return 'Enrollment';
        case 'vm_session':
            return 'VM Session';
        case 'payment':
        default:
            return 'Payment';
    }
};

const toAlertItems = (alerts: BackendAlert[]) =>
    alerts.map((alert) => ({
        id: String(alert.id),
        severity: alert.severity,
        title: alert.title,
        message: alert.description ?? '',
        source: alert.source ?? 'system',
        timestamp: alert.created_at,
        acknowledged: alert.acknowledged,
    }));

const toActivityLogType = (
    type: string | undefined,
): ActivityLogItem['type'] => {
    switch (type) {
        case 'vm':
        case 'user':
        case 'trainingPath':
        case 'system':
        case 'security':
            return type;
        case 'training_path':
            return 'trainingPath';
        default:
            return 'system';
    }
};

const toActivityLogItems = (
    activityLogs: BackendActivityLog[],
): ActivityLogItem[] =>
    activityLogs.map((log) => ({
        id: String(log.id),
        type: toActivityLogType(log.type),
        action: log.action,
        details: log.description,
        user: log.user_name ?? undefined,
        timestamp: log.created_at,
        metadata: log.metadata ?? undefined,
    }));

export default function DashboardPage() {
    const {
        kpis,
        chartData,
        topTrainingPaths,
        userGrowthByRole,
        recentActivity,
        systemHealth,
        alerts,
        activityLogs,
        period,
    } = usePage<DashboardPageProps>().props;
    const [selectedPeriod, setSelectedPeriod] = useState(period);
    const handlePeriodChange = (newPeriod: string) => {
        setSelectedPeriod(newPeriod);
        router.get(
            '/admin/dashboard',
            { period: newPeriod },
            { preserveState: true },
        );
    };
    const roleData = Object.entries(userGrowthByRole).map(([role, count]) => ({
        name: role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' '),
        value: count,
    }));

    const monitoringHealth = useMemo<MonitoringSystemHealth>(
        () => ({
            overall: toSystemStatus(systemHealth.status),
            lastChecked: systemHealth.timestamp ?? new Date().toISOString(),
            services: toServiceHealth(
                systemHealth.services,
                systemHealth.timestamp,
            ),
            metrics: toSystemMetrics(systemHealth),
        }),
        [systemHealth],
    );

    const monitoringActivities = useMemo<ActivityLogItem[]>(
        () =>
            activityLogs.length > 0
                ? toActivityLogItems(activityLogs)
                : recentActivity.map((activity, index) => ({
                      id: `${activity.type}-${activity.timestamp}-${index}`,
                      type: toActivityType(activity.type),
                      action: toActivityAction(activity.type),
                      details: activity.message,
                      timestamp: activity.timestamp,
                      metadata:
                          typeof activity.amount === 'number'
                              ? { amount: activity.amount }
                              : undefined,
                  })),
        [activityLogs, recentActivity],
    );

    const monitoringAlerts = useMemo(() => toAlertItems(alerts), [alerts]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="min-h-screen bg-background">
                <div className="container py-8">
                    {/* Header */}
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <BarChart3 className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="font-heading text-3xl font-bold text-foreground">
                                    Platform Dashboard
                                </h1>
                                <p className="text-muted-foreground">
                                    Overview of platform metrics and performance
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <PeriodSelector
                                value={selectedPeriod}
                                onPeriodChange={handlePeriodChange}
                            />
                        </div>
                    </div>
                    {/* KPI Cards */}
                    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0 }}
                        >
                            <Card className="shadow-card transition-shadow hover:shadow-card-hover">
                                <CardContent className="p-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                New Users
                                            </p>
                                            <p className="font-heading text-2xl font-bold text-foreground">
                                                {kpis.new_users.toLocaleString()}
                                            </p>
                                            <ChangeIndicator
                                                value={kpis.new_users_change}
                                            />
                                        </div>
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                                            <UserPlus className="h-6 w-6" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card className="shadow-card transition-shadow hover:shadow-card-hover">
                                <CardContent className="p-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Enrollments
                                            </p>
                                            <p className="font-heading text-2xl font-bold text-foreground">
                                                {kpis.total_enrollments.toLocaleString()}
                                            </p>
                                            <ChangeIndicator
                                                value={kpis.enrollments_change}
                                            />
                                        </div>
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                                            <BookOpen className="h-6 w-6" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="shadow-card transition-shadow hover:shadow-card-hover">
                                <CardContent className="p-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Revenue
                                            </p>
                                            <p className="font-heading text-2xl font-bold text-foreground">
                                                {formatCurrency(
                                                    kpis.total_revenue,
                                                )}
                                            </p>
                                            <ChangeIndicator
                                                value={kpis.revenue_change}
                                            />
                                        </div>
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                                            <DollarSign className="h-6 w-6" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card className="shadow-card transition-shadow hover:shadow-card-hover">
                                <CardContent className="p-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                VM Sessions
                                            </p>
                                            <p className="font-heading text-2xl font-bold text-foreground">
                                                {kpis.total_vm_sessions.toLocaleString()}
                                            </p>
                                            <ChangeIndicator
                                                value={kpis.vm_sessions_change}
                                            />
                                        </div>
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                                            <Monitor className="h-6 w-6" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                    {/* Secondary Stats */}
                    <div className="mb-8 grid gap-4 sm:grid-cols-3">
                        <Card className="shadow-card">
                            <CardContent className="flex items-center gap-4 p-5">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                                    <Award className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Certificates Issued
                                    </p>
                                    <p className="font-heading text-xl font-bold text-foreground">
                                        {kpis.certificates_issued}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="shadow-card">
                            <CardContent className="flex items-center gap-4 p-5">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10 text-teal-500">
                                    <TrendingUp className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Path Completions
                                    </p>
                                    <p className="font-heading text-xl font-bold text-foreground">
                                        {kpis.total_completions}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="shadow-card">
                            <CardContent className="flex items-center gap-4 p-5">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Total Users
                                    </p>
                                    <p className="font-heading text-xl font-bold text-foreground">
                                        {kpis.total_users.toLocaleString()}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    {/* Charts Row */}
                    <div className="mb-8 grid gap-6 lg:grid-cols-2">
                        {/* Enrollments & Revenue Chart */}
                        <Card className="shadow-card">
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Enrollments & Revenue Trend
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="min-w-0">
                                    <ResponsiveContainer
                                        width="100%"
                                        height={288}
                                        minWidth={0}
                                    >
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient
                                                    id="enrollGradient"
                                                    x1="0"
                                                    y1="0"
                                                    x2="0"
                                                    y2="1"
                                                >
                                                    <stop
                                                        offset="5%"
                                                        stopColor="#3b82f6"
                                                        stopOpacity={0.3}
                                                    />
                                                    <stop
                                                        offset="95%"
                                                        stopColor="#3b82f6"
                                                        stopOpacity={0}
                                                    />
                                                </linearGradient>
                                                <linearGradient
                                                    id="revenueGradient"
                                                    x1="0"
                                                    y1="0"
                                                    x2="0"
                                                    y2="1"
                                                >
                                                    <stop
                                                        offset="5%"
                                                        stopColor="#10b981"
                                                        stopOpacity={0.3}
                                                    />
                                                    <stop
                                                        offset="95%"
                                                        stopColor="#10b981"
                                                        stopOpacity={0}
                                                    />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                className="stroke-muted"
                                            />
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={formatDate}
                                                fontSize={12}
                                                className="fill-muted-foreground"
                                            />
                                            <YAxis
                                                fontSize={12}
                                                className="fill-muted-foreground"
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor:
                                                        'hsl(var(--card))',
                                                    border: '1px solid hsl(var(--border))',
                                                    borderRadius: '8px',
                                                }}
                                                labelFormatter={(label) =>
                                                    typeof label === 'string'
                                                        ? formatDate(label)
                                                        : String(label)
                                                }
                                            />
                                            <Legend />
                                            <Area
                                                type="monotone"
                                                dataKey="enrollments"
                                                stroke="#3b82f6"
                                                fill="url(#enrollGradient)"
                                                name="Enrollments"
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="#10b981"
                                                fill="url(#revenueGradient)"
                                                name="Revenue ($)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                        {/* User Growth by Role */}
                        <Card className="shadow-card">
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    New Users by Role
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="min-w-0">
                                    <ResponsiveContainer
                                        width="100%"
                                        height={288}
                                        minWidth={0}
                                    >
                                        <PieChart>
                                            <Pie
                                                data={roleData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) =>
                                                    `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                                                }
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {roleData.map(
                                                    (entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={
                                                                COLORS[
                                                                    index %
                                                                        COLORS.length
                                                                ]
                                                            }
                                                        />
                                                    ),
                                                )}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor:
                                                        'hsl(var(--card))',
                                                    border: '1px solid hsl(var(--border))',
                                                    borderRadius: '8px',
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    {/* Bottom Row */}
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Top TrainingPaths */}
                        <Card className="shadow-card lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Top Training Paths
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {topTrainingPaths.length === 0 ? (
                                        <p className="py-8 text-center text-muted-foreground">
                                            No path data available
                                        </p>
                                    ) : (
                                        topTrainingPaths.map(
                                            (trainingPath, idx) => (
                                                <div
                                                    key={trainingPath.id}
                                                    className="flex items-center gap-4"
                                                >
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate font-medium text-foreground">
                                                            {trainingPath.title}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            by{' '}
                                                            {
                                                                trainingPath.instructor
                                                            }
                                                        </p>
                                                    </div>
                                                    <Badge variant="secondary">
                                                        {
                                                            trainingPath.enrollments
                                                        }{' '}
                                                        enrollments
                                                    </Badge>
                                                </div>
                                            ),
                                        )
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        {/* System Health */}
                        <Card className="shadow-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Activity className="h-5 w-5" />
                                    System Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Active VM Sessions
                                        </span>
                                        <Badge
                                            variant={
                                                systemHealth.active_vm_sessions >
                                                0
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {systemHealth.active_vm_sessions}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Queued Sessions
                                        </span>
                                        <Badge
                                            variant={
                                                systemHealth.queued_sessions > 0
                                                    ? 'outline'
                                                    : 'secondary'
                                            }
                                        >
                                            {systemHealth.queued_sessions}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Pending Path Reviews
                                        </span>
                                        <Badge
                                            variant={
                                                systemHealth.pending_trainingPaths >
                                                0
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                            className={
                                                systemHealth.pending_trainingPaths >
                                                0
                                                    ? 'bg-warning text-warning-foreground'
                                                    : ''
                                            }
                                        >
                                            {systemHealth.pending_trainingPaths}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Suspended Users
                                        </span>
                                        <Badge
                                            variant={
                                                systemHealth.suspended_users > 0
                                                    ? 'destructive'
                                                    : 'secondary'
                                            }
                                        >
                                            {systemHealth.suspended_users}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    {/* Recent Activity */}
                    <Card className="mt-6 shadow-card">
                        <CardHeader>
                            <CardTitle className="text-lg">
                                Recent Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentActivity.length === 0 ? (
                                    <p className="py-4 text-center text-muted-foreground">
                                        No recent activity
                                    </p>
                                ) : (
                                    recentActivity.map((activity, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-4 border-b py-2 last:border-0"
                                        >
                                            <div
                                                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                                    activity.type ===
                                                    'enrollment'
                                                        ? 'bg-blue-500/10 text-blue-500'
                                                        : activity.type ===
                                                            'payment'
                                                          ? 'bg-green-500/10 text-green-500'
                                                          : 'bg-purple-500/10 text-purple-500'
                                                }`}
                                            >
                                                {activity.type ===
                                                'enrollment' ? (
                                                    <BookOpen className="h-4 w-4" />
                                                ) : activity.type ===
                                                  'payment' ? (
                                                    <DollarSign className="h-4 w-4" />
                                                ) : (
                                                    <Monitor className="h-4 w-4" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm text-foreground">
                                                    {activity.message}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDateTime(
                                                        activity.timestamp,
                                                    )}
                                                </p>
                                            </div>
                                            {activity.amount && (
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-green-500/10 text-green-600"
                                                >
                                                    {formatCurrency(
                                                        activity.amount,
                                                    )}
                                                </Badge>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    {/* Infrastructure Monitoring Section */}
                    <div className="mt-8 space-y-6">
                        <h2 className="font-heading text-xl font-bold text-foreground">
                            Infrastructure Monitoring
                        </h2>
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* System Health Overview */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <SystemHealthOverview
                                    health={monitoringHealth}
                                />
                            </motion.div>
                            {/* System Alerts */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <AlertsPanel alerts={monitoringAlerts} />
                            </motion.div>
                        </div>
                        {/* Metrics Charts */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <MetricsChart metrics={monitoringHealth.metrics} />
                        </motion.div>
                        {/* Activity Log */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                        >
                            <ActivityLog activities={monitoringActivities} />
                        </motion.div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
