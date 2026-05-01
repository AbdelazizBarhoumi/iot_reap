/**
 * Unified Admin Finance Page
 * Review payouts and refunds from one workspace.
 */
import { Head, router } from '@inertiajs/react';
import {
    BanknoteIcon,
    CheckCircle2,
    Clock,
    Download,
    Search,
    XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface PayoutRequest {
    id: string;
    teacher: {
        id: string;
        name: string;
        email: string;
    };
    amount: number;
    status: 'pending' | 'approved' | 'rejected' | 'paid';
    requestedAt: string;
    processedAt: string | null;
}

interface RefundRequest {
    id: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
    trainingPath: {
        id: number;
        title: string;
    };
    amount: number | null;
    formattedAmount: string | null;
    reason: string;
    status:
        | 'pending'
        | 'approved'
        | 'rejected'
        | 'processing'
        | 'completed'
        | 'failed';
    requestedAt: string;
    processedAt: string | null;
}

type Pagination = {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

type PayoutStats = {
    pending: number;
    totalPending: number;
    paidThisMonth: number;
};

type RefundStats = {
    pending: number;
    approved: number;
    rejected: number;
    totalRefunded: number;
};

type Props = {
    activeTab: 'payouts' | 'refunds';
    payouts: PayoutRequest[];
    payoutStats: PayoutStats;
    payoutPagination: Pagination;
    refunds: RefundRequest[] | { data?: RefundRequest[] };
    refundStats: RefundStats;
    refundPagination: Pagination;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'Payouts & Refunds', href: '/admin/finance' },
];

const payoutStatusConfig = {
    pending: {
        label: 'Pending',
        color: 'bg-warning/10 text-warning',
        icon: Clock,
    },
    approved: {
        label: 'Approved',
        color: 'bg-blue-500/10 text-blue-500',
        icon: CheckCircle2,
    },
    rejected: {
        label: 'Rejected',
        color: 'bg-destructive/10 text-destructive',
        icon: XCircle,
    },
    paid: {
        label: 'Paid',
        color: 'bg-success/10 text-success',
        icon: BanknoteIcon,
    },
} as const;

const refundStatusConfig = {
    pending: {
        label: 'Pending',
        color: 'bg-warning/10 text-warning',
        icon: Clock,
    },
    approved: {
        label: 'Approved',
        color: 'bg-success/10 text-success',
        icon: CheckCircle2,
    },
    rejected: {
        label: 'Rejected',
        color: 'bg-destructive/10 text-destructive',
        icon: XCircle,
    },
    processing: {
        label: 'Processing',
        color: 'bg-warning/10 text-warning',
        icon: Clock,
    },
    completed: {
        label: 'Completed',
        color: 'bg-success/10 text-success',
        icon: CheckCircle2,
    },
    failed: {
        label: 'Failed',
        color: 'bg-destructive/10 text-destructive',
        icon: XCircle,
    },
} as const;

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
    }).format(value);
}

function formatDate(value: string | null): string {
    if (!value) {
        return '—';
    }

    return new Date(value).toLocaleDateString();
}

export default function FinancePage({
    activeTab,
    payouts,
    payoutStats,
    refunds,
    refundStats,
}: Props) {
    const [searchPayouts, setSearchPayouts] = useState('');
    const [searchRefunds, setSearchRefunds] = useState('');
    const [processing, setProcessing] = useState<string | null>(null);

    const filteredPayouts = useMemo(
        () =>
            payouts.filter(
                (payout) =>
                    payout.teacher.name
                        .toLowerCase()
                        .includes(searchPayouts.toLowerCase()) ||
                    payout.teacher.email
                        .toLowerCase()
                        .includes(searchPayouts.toLowerCase()),
            ),
        [payouts, searchPayouts],
    );

    const filteredRefunds = useMemo(() => {
        const refundList = Array.isArray(refunds) ? refunds : (refunds?.data ?? []);
        return refundList.filter(
                (refund) =>
                    refund.user.name
                        .toLowerCase()
                        .includes(searchRefunds.toLowerCase()) ||
                    refund.user.email
                        .toLowerCase()
                        .includes(searchRefunds.toLowerCase()) ||
                    refund.trainingPath.title
                        .toLowerCase()
                        .includes(searchRefunds.toLowerCase()),
            );
    }, [refunds, searchRefunds]);

    const handlePayoutApprove = (id: string) => {
        setProcessing(id);
        router.post(`/admin/payouts/${id}/approve`, {}, {
            onFinish: () => setProcessing(null),
        });
    };

    const handlePayoutReject = (id: string) => {
        const reason = window.prompt('Please provide a reason for rejection:');
        if (!reason || reason.trim().length === 0) {
            return;
        }

        setProcessing(id);
        router.post(
            `/admin/payouts/${id}/reject`,
            { reason: reason.trim() },
            {
                onFinish: () => setProcessing(null),
            },
        );
    };

    const handlePayoutProcess = (id: string) => {
        setProcessing(id);
        router.post(`/admin/payouts/${id}/process`, {}, {
            onFinish: () => setProcessing(null),
        });
    };

    const handleRefundApprove = (id: string) => {
        setProcessing(id);
        router.post(`/admin/refunds/${id}/approve`, {}, {
            onFinish: () => setProcessing(null),
        });
    };

    const handleRefundReject = (id: string) => {
        const reason = window.prompt('Please provide a reason for rejection:');
        if (!reason || reason.trim().length === 0) {
            return;
        }

        setProcessing(id);
        router.post(
            `/admin/refunds/${id}/reject`,
            { reason: reason.trim() },
            {
                onFinish: () => setProcessing(null),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payouts & Refunds - Admin" />

            <div className="container space-y-6 py-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold">
                            Payouts & Refunds
                        </h1>
                        <p className="text-muted-foreground">
                            Manage teacher payouts and training refund reviews
                            from one place.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <a href="/admin/payouts/export" target="_blank" rel="noopener noreferrer">
                                <Download className="mr-2 h-4 w-4" />
                                Export payouts
                            </a>
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue={activeTab} className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="payouts">Payouts</TabsTrigger>
                        <TabsTrigger value="refunds">Refunds</TabsTrigger>
                    </TabsList>

                    <TabsContent value="payouts" className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Pending Requests
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {payoutStats.pending}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Pending Amount
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {formatCurrency(payoutStats.totalPending)}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Paid This Month
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-success">
                                        {formatCurrency(payoutStats.paidThisMonth)}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="relative max-w-sm">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search teachers..."
                                value={searchPayouts}
                                onChange={(e) => setSearchPayouts(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <Card>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Teacher</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Requested</TableHead>
                                        <TableHead className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPayouts.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="py-8 text-center text-muted-foreground"
                                            >
                                                No payout requests found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredPayouts.map((payout) => {
                                            const status = payoutStatusConfig[
                                                payout.status
                                            ];
                                            const StatusIcon = status.icon;

                                            return (
                                                <TableRow key={payout.id}>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">
                                                                {payout.teacher.name}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {payout.teacher.email}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {formatCurrency(payout.amount)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className={status.color}
                                                        >
                                                            <StatusIcon className="mr-1 h-3 w-3" />
                                                            {status.label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {formatDate(payout.requestedAt)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {payout.status === 'pending' && (
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        handlePayoutApprove(
                                                                            payout.id,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        processing ===
                                                                        payout.id
                                                                    }
                                                                >
                                                                    Approve
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        handlePayoutReject(
                                                                            payout.id,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        processing ===
                                                                        payout.id
                                                                    }
                                                                >
                                                                    Reject
                                                                </Button>
                                                            </div>
                                                        )}

                                                        {payout.status === 'approved' && (
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        handlePayoutProcess(
                                                                            payout.id,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        processing ===
                                                                        payout.id
                                                                    }
                                                                >
                                                                    Process
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </Card>
                    </TabsContent>

                    <TabsContent value="refunds" className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Pending
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-warning">
                                        {refundStats.pending}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Approved
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-success">
                                        {refundStats.approved}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Rejected
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-destructive">
                                        {refundStats.rejected}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Total Refunded
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {formatCurrency(refundStats.totalRefunded)}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="relative max-w-sm">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by user or training path..."
                                value={searchRefunds}
                                onChange={(e) => setSearchRefunds(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <Card>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Training Path</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Requested</TableHead>
                                        <TableHead className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredRefunds.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={7}
                                                className="py-8 text-center text-muted-foreground"
                                            >
                                                No refund requests found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredRefunds.map((refund) => {
                                            const status = refundStatusConfig[
                                                refund.status
                                            ];
                                            const StatusIcon = status.icon;

                                            return (
                                                <TableRow key={refund.id}>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">
                                                                {refund.user.name}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {refund.user.email}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="max-w-[200px] truncate">
                                                        {refund.trainingPath.title}
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {refund.formattedAmount ?? '—'}
                                                    </TableCell>
                                                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                                                        {refund.reason}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className={status.color}
                                                        >
                                                            <StatusIcon className="mr-1 h-3 w-3" />
                                                            {status.label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {formatDate(refund.requestedAt)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {refund.status === 'pending' && (
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        handleRefundApprove(
                                                                            refund.id,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        processing ===
                                                                        refund.id
                                                                    }
                                                                >
                                                                    Refund
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        handleRefundReject(
                                                                            refund.id,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        processing ===
                                                                        refund.id
                                                                    }
                                                                >
                                                                    Reject
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}