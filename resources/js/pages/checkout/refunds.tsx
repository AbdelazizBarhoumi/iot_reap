/**
 * Refund Requests Page
 * Shows user's refund request history.
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
interface RefundRequest {
    id: string;
    payment_id: string;
    course: {
        id: number;
        title: string;
    };
    amount: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    processed_at: string | null;
}
interface RefundsPageProps {
    refunds: { data: RefundRequest[] };
}
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Payments', href: '/checkout/payments' },
    { title: 'Refunds', href: '/checkout/refunds' },
];
const statusConfig = {
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
};
function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount / 100);
}
export default function RefundsPage({ refunds }: RefundsPageProps) {
    const refundList = refunds?.data ?? [];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Refund Requests" />
            <div className="container max-w-4xl space-y-6 py-8">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                        <RotateCcw className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Refund Requests</h1>
                        <p className="text-muted-foreground">
                            Track the status of your refund requests
                        </p>
                    </div>
                </div>
                {refundList.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <RotateCcw className="mb-4 h-12 w-12 text-muted-foreground/50" />
                            <h3 className="mb-1 text-lg font-medium">
                                No Refund Requests
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
                                                    {refund.course.title}
                                                </CardTitle>
                                                <CardDescription>
                                                    Requested on{' '}
                                                    {formatDate(
                                                        refund.created_at,
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
                                                    {formatCurrency(
                                                        refund.amount,
                                                    )}
                                                </span>
                                            </div>
                                            {refund.processed_at && (
                                                <div className="text-muted-foreground">
                                                    Processed:{' '}
                                                    {formatDate(
                                                        refund.processed_at,
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

