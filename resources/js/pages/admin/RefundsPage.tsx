/**
 * Admin Refunds Page
 * View and manage training path refund requests.
 */
import { Head, router } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock,
    Download,
    RotateCcw,
    Search,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
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
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
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
    amount: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: string;
    processedAt: string | null;
}
interface Props {
    refunds: RefundRequest[];
    stats: {
        pending: number;
        approved: number;
        rejected: number;
        totalRefunded: number;
    };
}
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/infrastructure' },
    { title: 'Refunds', href: '/admin/refunds' },
];
const statusConfig = {
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
};
export default function RefundsPage({ refunds = [], stats }: Props) {
    const [search, setSearch] = useState('');
    const [processing, setProcessing] = useState<string | null>(null);
    const filtered = refunds.filter(
        (r) =>
            r.user.name.toLowerCase().includes(search.toLowerCase()) ||
            r.user.email.toLowerCase().includes(search.toLowerCase()) ||
            r.trainingPath.title.toLowerCase().includes(search.toLowerCase()),
    );
    const handleApprove = (id: string) => {
        setProcessing(id);
        router.post(
            `/admin/refunds/${id}/approve`,
            {},
            {
                onFinish: () => setProcessing(null),
            },
        );
    };
    const handleReject = (id: string) => {
        setProcessing(id);
        router.post(
            `/admin/refunds/${id}/reject`,
            {},
            {
                onFinish: () => setProcessing(null),
            },
        );
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Refunds - Admin" />
            <div className="container space-y-6 py-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Training Path Refund Requests</h1>
                        <p className="text-muted-foreground">
                            Review and process training path refunds
                        </p>
                    </div>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Pending
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-warning">
                                {stats?.pending ?? 0}
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
                                {stats?.approved ?? 0}
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
                                {stats?.rejected ?? 0}
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
                                ${(stats?.totalRefunded ?? 0).toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                {/* Search */}
                <div className="relative max-w-sm">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by user or training path..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                {/* Table */}
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
                            {filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        No refund requests found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((refund) => {
                                    const status = statusConfig[refund.status];
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
                                                $
                                                {refund.amount.toLocaleString()}
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
                                                {new Date(
                                                    refund.requestedAt,
                                                ).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {refund.status ===
                                                    'pending' && (
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() =>
                                                                handleApprove(
                                                                    refund.id,
                                                                )
                                                            }
                                                            disabled={
                                                                processing ===
                                                                refund.id
                                                            }
                                                        >
                                                            <RotateCcw className="mr-1 h-3 w-3" />
                                                            Refund
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                handleReject(
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
            </div>
        </AppLayout>
    );
}

