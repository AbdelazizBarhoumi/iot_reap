/**
 * Admin Dashboard Page
 * Platform-wide analytics and key metrics overview.
 */
import { Head, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Activity,
    ArrowDownRight,
    ArrowUpRight,
    Award,
    BarChart3,
    BookOpen,
    DollarSign,
    Monitor,
    RefreshCw,
    TrendingUp,
    UserPlus,
    Users,
} from 'lucide-react';
import React, { useState } from 'react';
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
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, PageProps } from '@/types';
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
    active_courses: number;
    certificates_issued: number;
    period: string;
}
interface ChartDataPoint {
    date: string;
    enrollments: number;
    revenue: number;
    vm_sessions: number;
}
interface TopCourse {
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
interface SystemHealth {
    active_vm_sessions: number;
    queued_sessions: number;
    pending_courses: number;
    suspended_users: number;
}
interface DashboardPageProps extends PageProps {
    kpis: KPIs;
    chartData: ChartDataPoint[];
    topCourses: TopCourse[];
    revenueByCategory: RevenueCategory[];
    userGrowthByRole: Record<string, number>;
    recentActivity: ActivityItem[];
    systemHealth: SystemHealth;
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
const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
};
function ChangeIndicator({ value }: { value: number }) {
    if (value === 0) return null;
    const isPositive = value > 0;
    return (
        <span
            className={`inline-flex items-center text-xs font-medium ${
                isPositive ? 'text-success' : 'text-destructive'
            }`}
        >
            {isPositive ? (
                <ArrowUpRight className="mr-0.5 h-3 w-3" />
            ) : (
                <ArrowDownRight className="mr-0.5 h-3 w-3" />
            )}
            {Math.abs(value)}%
        </span>
    );
}
export default function DashboardPage() {
    const {
        kpis,
        chartData,
        topCourses,
        userGrowthByRole,
        recentActivity,
        systemHealth,
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
                            <Select
                                value={selectedPeriod}
                                onValueChange={handlePeriodChange}
                            >
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7d">
                                        Last 7 days
                                    </SelectItem>
                                    <SelectItem value="30d">
                                        Last 30 days
                                    </SelectItem>
                                    <SelectItem value="90d">
                                        Last 90 days
                                    </SelectItem>
                                    <SelectItem value="12m">
                                        Last 12 months
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                    handlePeriodChange(selectedPeriod)
                                }
                            >
                                <RefreshCw
                                    className="h-4 w-4"
                                />
                            </Button>
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
                                        Course Completions
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
                                <div className="h-72">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
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
                                <div className="h-72">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
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
                        {/* Top Courses */}
                        <Card className="shadow-card lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Top Courses
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {topCourses.length === 0 ? (
                                        <p className="py-8 text-center text-muted-foreground">
                                            No course data available
                                        </p>
                                    ) : (
                                        topCourses.map((course, idx) => (
                                            <div
                                                key={course.id}
                                                className="flex items-center gap-4"
                                            >
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                                                    {idx + 1}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-medium text-foreground">
                                                        {course.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        by {course.instructor}
                                                    </p>
                                                </div>
                                                <Badge variant="secondary">
                                                    {course.enrollments}{' '}
                                                    enrollments
                                                </Badge>
                                            </div>
                                        ))
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
                                            Pending Course Reviews
                                        </span>
                                        <Badge
                                            variant={
                                                systemHealth.pending_courses > 0
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                            className={
                                                systemHealth.pending_courses > 0
                                                    ? 'bg-warning text-warning-foreground'
                                                    : ''
                                            }
                                        >
                                            {systemHealth.pending_courses}
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
                </div>
            </div>
        </AppLayout>
    );
}

