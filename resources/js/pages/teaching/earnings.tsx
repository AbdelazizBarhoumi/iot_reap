/**
 * Earnings Page
 * Revenue tracking with export functionality.
 */
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Download,
    DollarSign,
    TrendingUp,
    BookOpen,
} from 'lucide-react';
import { useMemo } from 'react';
import { KPICard, RevenueChart } from '@/components/analytics';
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
    EarningsSummary,
    RevenueByCourse,
    RevenueChartPoint,
    AnalyticsPeriod,
} from '@/types/analytics.types';
interface EarningsPageProps {
    summary: EarningsSummary;
    revenueByCourse: RevenueByCourse[];
    revenueChart: RevenueChartPoint[];
    period: AnalyticsPeriod;
}
export default function EarningsPage({
    summary,
    revenueByCourse,
    revenueChart,
    period,
}: EarningsPageProps) {
    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: 'Teaching', href: '/teaching' },
            { title: 'Analytics', href: '/teaching/analytics' },
            { title: 'Earnings', href: '/teaching/analytics/earnings' },
        ],
        [],
    );
    const handlePeriodChange = (newPeriod: string) => {
        router.get(
            '/teaching/analytics/earnings',
            { period: newPeriod },
            { preserveState: true },
        );
    };
    const handleExport = () => {
        const params = new URLSearchParams({
            start_date: summary.start_date,
            end_date: summary.end_date,
        });
        window.location.href = `/teaching/analytics/earnings/export?${params}`;
    };
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(value);
    };
    const totalSales = revenueByCourse.reduce(
        (sum, c) => sum + c.sales_count,
        0,
    );
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Earnings" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/teaching/analytics">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="font-heading text-2xl font-semibold text-foreground">
                            Earnings
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Track your revenue and download reports
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
                        <Button onClick={handleExport}>
                            <Download className="mr-2 h-4 w-4" />
                            Export CSV
                        </Button>
                    </div>
                </div>
                {/* KPI Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <KPICard
                        title="Total Revenue"
                        value={summary.total_revenue}
                        format="currency"
                        change={summary.change_percentage}
                        icon={<DollarSign className="h-4 w-4" />}
                    />
                    <KPICard
                        title="Previous Period"
                        value={summary.previous_revenue}
                        format="currency"
                        icon={<TrendingUp className="h-4 w-4" />}
                    />
                    <KPICard
                        title="Total Sales"
                        value={totalSales}
                        icon={<BookOpen className="h-4 w-4" />}
                    />
                </div>
                {/* Revenue Chart */}
                <RevenueChart data={revenueChart} title="Daily Revenue" />
                {/* Revenue by Course */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">
                            Revenue by Course
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {revenueByCourse.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <DollarSign className="mb-4 h-12 w-12 text-muted-foreground" />
                                <p className="text-muted-foreground">
                                    No sales during this period.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {revenueByCourse.map((course) => (
                                    <div
                                        key={course.id}
                                        className="flex items-center gap-4"
                                    >
                                        {course.thumbnail_url ? (
                                            <img
                                                src={course.thumbnail_url}
                                                alt={course.title}
                                                className="h-12 w-12 rounded object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-12 w-12 items-center justify-center rounded bg-primary/10">
                                                <BookOpen className="h-6 w-6 text-primary" />
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium">
                                                {course.title}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {course.sales_count} sales
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">
                                                {formatCurrency(course.revenue)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {/* Total */}
                                <div className="flex items-center justify-between border-t pt-4">
                                    <span className="font-medium">Total</span>
                                    <span className="text-lg font-bold">
                                        {formatCurrency(summary.total_revenue)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

