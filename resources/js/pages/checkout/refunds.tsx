/**
 * Refund Requests Page
 * Shows the user's training path refund request history.
 */
import { Head } from '@inertiajs/react';
import { RotateCcw, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { RefundRequest, RefundStatus } from '@/types/payment.types';
interface RefundsPageProps {
    refunds: RefundRequest[] | { data?: RefundRequest[] };
}
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Payments', href: '/checkout/payments' },
    { title: 'Refunds', href: '/checkout/refunds' },
];
const statusConfig: Record<
    RefundStatus,
    {
        label: string;
        className: string;
        icon: typeof Clock;
    }
> = {
    pending: {
        label: 'Pending',
        className:
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
        icon: Clock,
    },
    approved: {
        label: 'Approved',
        className:
            'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        icon: CheckCircle2,
    },
    rejected: {
        label: 'Rejected',
        className:
            'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
        icon: XCircle,
    },
    processing: {
        label: 'Processing',
        className:
            'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
        icon: Clock,
    },
    completed: {
        label: 'Completed',
        className:
            'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        icon: CheckCircle2,
    },
    failed: {
        label: 'Failed',
        className:
            'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
        icon: XCircle,
    },
};
function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}
export default function RefundsPage({ refunds }: RefundsPageProps) {
    const refundList = Array.isArray(refunds) ? refunds : refunds?.data ?? [];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Training Refund Requests" />
            <div className="container max-w-4xl space-y-6 py-8">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                        <RotateCcw className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Training Path Refund Requests</h1>
                        <p className="text-muted-foreground">
                            Track the status of your training path refund requests
                        </p>
                    </div>
                </div>
                {refundList.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <RotateCcw className="mb-4 h-12 w-12 text-muted-foreground/50" />
                            <h3 className="mb-1 text-lg font-medium">
                                No Training Path Refund Requests
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                You haven't requested any refunds yet.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {refundList.map((refund) => {
                            const config = statusConfig[refund.status];
                            const StatusIcon = config.icon;
                            return (
                                <Card key={refund.id}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-base">
                                                    {refund.trainingPath?.title ??
                                                        'Training Path'}
                                                </CardTitle>
                                                <CardDescription>
                                                    Requested on{' '}
                                                    {formatDate(
                                                        refund.requestedAt,
                                                    )}
                                                </CardDescription>
                                            </div>
                                            <Badge className={config.className}>
                                                <StatusIcon className="mr-1 h-3 w-3" />
                                                {config.label}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="flex items-center justify-between text-sm">
                                            <div>
                                                <span className="text-muted-foreground">
                                                    Amount:{' '}
                                                </span>
                                                <span className="font-medium">
                                                    {refund.amount ?? '—'}
                                                </span>
                                            </div>
                                            {refund.processedAt && (
                                                <div className="text-muted-foreground">
                                                    Processed:{' '}
                                                    {formatDate(
                                                        refund.processedAt,
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {refund.reason && (
                                            <p className="mt-3 border-t pt-3 text-sm text-muted-foreground">
                                                <span className="font-medium text-foreground">
                                                    Reason:{' '}
                                                </span>
                                                {refund.reason}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

