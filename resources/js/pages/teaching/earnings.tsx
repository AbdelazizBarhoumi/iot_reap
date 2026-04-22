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
import { useEffect, useMemo, useState } from 'react';
import { KPICard, RevenueChart, PeriodSelector } from '@/components/analytics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { payoutApi, type PayoutRequestItem } from '@/api/payout.api';
import teaching from '@/routes/teaching';
import type { BreadcrumbItem } from '@/types';
import type {
    EarningsSummary,
    RevenueByTrainingPath,
    RevenueChartPoint,
    AnalyticsPeriod,
} from '@/types/analytics.types';
interface EarningsPageProps {
    summary: EarningsSummary;
    revenueByTrainingPath: RevenueByTrainingPath[];
    revenueChart: RevenueChartPoint[];
    period: AnalyticsPeriod;
}
export default function EarningsPage({
    summary,
    revenueByTrainingPath,
    revenueChart,
    period,
}: EarningsPageProps) {
    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: 'Teaching', href: teaching.index.url() },
            { title: 'Analytics', href: teaching.analytics.index.url() },
            { title: 'Earnings', href: teaching.analytics.earnings.url() },
        ],
        [],
    );
    const handlePeriodChange = (newPeriod: string) => {
        router.get(
            teaching.analytics.earnings.url(),
            { period: newPeriod },
            { preserveState: true },
        );
    };

    const [payoutAmount, setPayoutAmount] = useState('');
    const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);
    const [availableBalance, setAvailableBalance] = useState<number | null>(null);
    const [payoutRequests, setPayoutRequests] = useState<PayoutRequestItem[]>([]);

    useEffect(() => {
        let mounted = true;

        payoutApi
            .getMyPayouts()
            .then((payload) => {
                if (!mounted) return;

                setAvailableBalance(payload.available_balance);
                setPayoutRequests(payload.data);
            })
            .catch(() => {
                if (!mounted) return;
                setAvailableBalance(null);
                setPayoutRequests([]);
            });

        return () => {
            mounted = false;
        };
    }, []);

    const handleRequestPayout = async () => {
        const amount = Number(payoutAmount);

        if (!Number.isFinite(amount) || amount <= 0) {
            return;
        }

        setIsSubmittingPayout(true);
        try {
            const created = await payoutApi.requestPayout({
                amount,
                payout_method: 'stripe',
            });

            setPayoutRequests((prev) => [created, ...prev]);
            setPayoutAmount('');
            // Refresh available balance after request
            const refreshed = await payoutApi.getMyPayouts();
            setAvailableBalance(refreshed.available_balance);
            setPayoutRequests(refreshed.data);
        } finally {
            setIsSubmittingPayout(false);
        }
    };

    const handleExport = () => {
        const params = new URLSearchParams({
            start_date: summary.start_date,
            end_date: summary.end_date,
        });
        window.location.href = `${teaching.analytics.earnings.export.url()}?${params}`;
    };
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(value);
    };
    const totalSales = revenueByTrainingPath.reduce(
        (sum, c) => sum + c.sales_count,
        0,
    );
    const balanceToShow = availableBalance ?? summary.total_revenue;
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
                        <PeriodSelector
                            value={period}
                            onPeriodChange={handlePeriodChange}
                        />
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

                {/* Payout request */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Request Payout</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Available balance
                                </p>
                                <p className="text-2xl font-semibold">
                                    {formatCurrency(balanceToShow)}
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Input
                                    type="number"
                                    min={50}
                                    step="0.01"
                                    value={payoutAmount}
                                    onChange={(e) => setPayoutAmount(e.target.value)}
                                    placeholder="Amount in USD"
                                    className="sm:w-48"
                                />
                                <Button
                                    onClick={handleRequestPayout}
                                    disabled={isSubmittingPayout || !payoutAmount}
                                >
                                    {isSubmittingPayout ? 'Submitting...' : 'Request Payout'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Revenue Chart */}
                <RevenueChart data={revenueChart} title="Daily Revenue" />
                {/* Revenue by TrainingPath */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">
                            Revenue by TrainingPath
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {revenueByTrainingPath.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <DollarSign className="mb-4 h-12 w-12 text-muted-foreground" />
                                <p className="text-muted-foreground">
                                    No sales during this period.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {revenueByTrainingPath.map((trainingPath) => (
                                    <div
                                        key={trainingPath.id}
                                        className="flex items-center gap-4"
                                    >
                                        {trainingPath.thumbnail_url ? (
                                            <img
                                                src={trainingPath.thumbnail_url}
                                                alt={trainingPath.title}
                                                className="h-12 w-12 rounded object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-12 w-12 items-center justify-center rounded bg-primary/10">
                                                <BookOpen className="h-6 w-6 text-primary" />
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium">
                                                {trainingPath.title}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {trainingPath.sales_count} sales
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">
                                                {formatCurrency(trainingPath.revenue)}
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

                {/* Recent payout requests */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Recent Payout Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {payoutRequests.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No payout requests yet.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {payoutRequests.map((request) => (
                                    <div
                                        key={request.id}
                                        className="flex items-center justify-between rounded-lg border p-3"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {formatCurrency(request.amount)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Requested {new Date(request.requestedAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                            {request.status_label}
                                        </span>
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

