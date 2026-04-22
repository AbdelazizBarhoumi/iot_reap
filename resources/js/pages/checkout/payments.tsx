/**
 * Payment History Page
 * Shows all user payments with refund options.
 */
import { Head, Link, router } from '@inertiajs/react';
import { CreditCard, MoreHorizontal, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { requestRefund } from '@/api/checkout.api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { Payment } from '@/types/payment.types';
interface PaymentsPageProps {
    payments: Payment[] | { data?: Payment[] };
}
function getStatusColor(status: Payment['status']): string {
    switch (status) {
        case 'completed':
            return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
        case 'failed':
            return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
        case 'refunded':
        case 'partially_refunded':
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}
export default function PaymentsPage({ payments }: PaymentsPageProps) {
    const paymentList = Array.isArray(payments) ? payments : payments?.data ?? [];
    const [refundDialog, setRefundDialog] = useState<Payment | null>(null);
    const [refundReason, setRefundReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleRefundRequest = async () => {
        if (!refundDialog || refundReason.length < 20) return;
        setIsSubmitting(true);
        try {
            await requestRefund(refundDialog.id, refundReason);
            setRefundDialog(null);
            setRefundReason('');
            toast.success('Refund request submitted', {
                description:
                    'Our team will review your request within 2-3 business days.',
            });
            router.reload({ only: ['payments'] });
        } catch (error) {
            toast.error('An error occurred', {
                description:
                    error instanceof Error
                        ? error.message
                        : 'Please check your connection and try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Payments', href: '/checkout/payments' },
            ]}
        >
            <Head title="Payment History" />
            <div className="p-6">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="font-heading text-2xl font-semibold">
                            Payment History
                        </h1>
                        <p className="text-muted-foreground">
                            View your past payments and request refunds.
                        </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/checkout/refunds">View Refunds</Link>
                    </Button>
                </div>
                {paymentList.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <CreditCard className="mb-4 h-12 w-12 text-muted-foreground" />
                            <h3 className="text-lg font-medium">
                                No payments yet
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Your payment history will appear here.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {paymentList.map((payment) => (
                            <Card key={payment.id}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            {payment.trainingPath.thumbnail_url ? (
                                                <img
                                                    src={
                                                        payment.trainingPath
                                                            .thumbnail_url
                                                    }
                                                    alt={payment.trainingPath.title}
                                                    className="h-12 w-12 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                                    <CreditCard className="h-6 w-6 text-primary" />
                                                </div>
                                            )}
                                            <div>
                                                <CardTitle className="text-base">
                                                    {payment.trainingPath.title}
                                                </CardTitle>
                                                <CardDescription>
                                                    {payment.paid_at
                                                        ? new Date(
                                                              payment.paid_at,
                                                          ).toLocaleDateString()
                                                        : new Date(
                                                              payment.created_at,
                                                          ).toLocaleDateString()}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                className={getStatusColor(
                                                    payment.status,
                                                )}
                                            >
                                                {payment.status_label}
                                            </Badge>
                                            {payment.is_refundable && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            aria-label="Payment options"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setRefundDialog(
                                                                    payment,
                                                                )
                                                            }
                                                        >
                                                            <RefreshCw className="mr-2 h-4 w-4" />
                                                            Request Refund
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Amount
                                        </span>
                                        <span className="font-medium">
                                            {payment.formatted_amount}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
            {/* Refund Dialog */}
            <Dialog
                open={!!refundDialog}
                onOpenChange={() => setRefundDialog(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Request a Refund</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for your refund request. Our
                            team will review it within 2-3 business days.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {refundDialog && (
                            <div className="rounded-lg border bg-muted/50 p-4">
                                <p className="font-medium">
                                    {refundDialog.trainingPath.title}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {refundDialog.formatted_amount}
                                </p>
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Reason for refund{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <Textarea
                                value={refundReason}
                                onChange={(e) =>
                                    setRefundReason(e.target.value)
                                }
                                placeholder="Please explain why you're requesting a refund (minimum 20 characters)..."
                                rows={4}
                            />
                            <p className="text-xs text-muted-foreground">
                                {refundReason.length}/20 characters minimum
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setRefundDialog(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRefundRequest}
                            disabled={refundReason.length < 20 || isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Request'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

