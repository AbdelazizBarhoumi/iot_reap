/**
 * Teacher Analytics Page
 * Main dashboard with KPIs and charts.
 */
import { Head, Link, router } from '@inertiajs/react';
import {
    Users,
    TrendingUp,
    Award,
    DollarSign,
    Clock,
    Target,
} from 'lucide-react';
import { useMemo } from 'react';
import { KPICard, EnrollmentChart, RevenueChart } from '@/components/analytics';
import { CompletionFunnel } from '@/components/analytics/CompletionFunnel';
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
import type { BreadcrumbItem } from '@/types';
import type {
    KPIs,
    EnrollmentChartPoint,
    RevenueChartPoint,
    TopCourse,
    AnalyticsPeriod,
} from '@/types/analytics.types';
interface AnalyticsPageProps {
    kpis: KPIs;
    enrollmentChart: EnrollmentChartPoint[];
    revenueChart: RevenueChartPoint[];
    topCourses: TopCourse[];
    period: AnalyticsPeriod;
}
export default function AnalyticsPage({
    kpis,
    enrollmentChart,
    revenueChart,
    topCourses,
    period,
}: AnalyticsPageProps) {
    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: 'Teaching', href: '/teaching' },
            { title: 'Analytics', href: '/teaching/analytics' },
        ],
        [],
    );

    // Calculate completion funnel stages
    const funnelData = useMemo(() => {
        const totalStudents = kpis.total_students || 1;
        return [
            {
                stage: 'Enrolled',
                count: kpis.total_students || 0,
                percentage: 100,
            },
            {
                stage: 'Active',
                count: Math.round(totalStudents * 0.85), // Estimate 85% active
                percentage: 85,
            },
            {
                stage: 'In Progress',
                count: Math.round(totalStudents * 0.65), // Estimate 65% started courses
                percentage: 65,
            },
            {
                stage: 'Completed',
                count: kpis.total_completions || 0,
                percentage:
                    totalStudents > 0
                        ? Math.round((kpis.total_completions || 0) / totalStudents * 100)
                        : 0,
            },
        ];
    }, [kpis]);
    const handlePeriodChange = (newPeriod: string) => {
        router.get(
            '/teaching/analytics',
            { period: newPeriod },
            { preserveState: true },
        );
    };
    const periodLabels: Record<string, string> = {
        '7d': 'Last 7 days',
        '30d': 'Last 30 days',
        '90d': 'Last 90 days',
        '12m': 'Last 12 months',
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Analytics Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-heading text-2xl font-semibold text-foreground">
                            Analytics Dashboard
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Track your course performance and revenue
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Select
                            value={period}
                            onValueChange={handlePeriodChange}
                        >
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7d">Last 7 days</SelectItem>
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
                        <Button variant="outline" asChild>
                            <Link href="/teaching/analytics/earnings">
                                <DollarSign className="mr-2 h-4 w-4" />
                                View Earnings
                            </Link>
                        </Button>
                    </div>
                </div>
                {/* KPI Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    <KPICard
                        title="Total Students"
                        value={kpis.total_students}
                        icon={<Users className="h-4 w-4" />}
                    />
                    <KPICard
                        title="New Enrollments"
                        value={kpis.total_enrollments}
                        change={kpis.enrollments_change}
                        icon={<TrendingUp className="h-4 w-4" />}
                        subtitle={periodLabels[period]}
                    />
                    <KPICard
                        title="Completions"
                        value={kpis.total_completions}
                        change={kpis.completions_change}
                        icon={<Award className="h-4 w-4" />}
                    />
                    <KPICard
                        title="Revenue"
                        value={kpis.total_revenue}
                        format="currency"
                        change={kpis.revenue_change}
                        icon={<DollarSign className="h-4 w-4" />}
                    />
                    <KPICard
                        title="Quiz Pass Rate"
                        value={kpis.quiz_pass_rate}
                        format="percentage"
                        icon={<Target className="h-4 w-4" />}
                    />
                    <KPICard
                        title="Avg. Watch Time"
                        value={`${kpis.avg_video_minutes} min`}
                        icon={<Clock className="h-4 w-4" />}
                    />
                </div>
                {/* Charts */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <EnrollmentChart data={enrollmentChart} />
                    <RevenueChart data={revenueChart} />
                </div>
                {/* Completion Funnel */}
                <CompletionFunnel
                    data={funnelData}
                    title="Student Completion Funnel"
                />
                {/* Top Courses */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">
                            Top Performing Courses
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {topCourses.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                No course data available for this period.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {topCourses.map((course, index) => (
                                    <div
                                        key={course.id}
                                        className="flex items-center gap-4"
                                    >
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                                            {index + 1}
                                        </span>
                                        {course.thumbnail_url ? (
                                            <img
                                                src={course.thumbnail_url}
                                                alt={course.title}
                                                className="h-10 w-10 rounded object-cover"
                                            />
                                        ) : (
                                            <div className="h-10 w-10 rounded bg-primary/10" />
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <Link
                                                href={`/teaching/analytics/courses/${course.id}/students`}
                                                className="block truncate text-sm font-medium hover:underline"
                                            >
                                                {course.title}
                                            </Link>
                                        </div>
                                        <div className="text-sm font-medium">
                                            {course.formatted_value} enrollments
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

