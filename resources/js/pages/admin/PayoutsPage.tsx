/**
 * Admin Payouts Page
 * View and manage teacher payout requests.
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
interface Props {
    payouts: PayoutRequest[];
    stats: {
        pending: number;
        totalPending: number;
        paidThisMonth: number;
    };
}
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/infrastructure' },
    { title: 'Payouts', href: '/admin/payouts' },
];
const statusConfig = {
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
};
export default function PayoutsPage({ payouts = [], stats }: Props) {
    const [search, setSearch] = useState('');
    const [processing, setProcessing] = useState<string | null>(null);
    const filtered = payouts.filter(
        (p) =>
            p.teacher.name.toLowerCase().includes(search.toLowerCase()) ||
            p.teacher.email.toLowerCase().includes(search.toLowerCase()),
    );
    const handleApprove = (id: string) => {
        setProcessing(id);
        router.post(
            `/admin/payouts/${id}/approve`,
            {},
            {
                onFinish: () => setProcessing(null),
            },
        );
    };
    const handleReject = (id: string) => {
        setProcessing(id);
        router.post(
            `/admin/payouts/${id}/reject`,
            {},
            {
                onFinish: () => setProcessing(null),
            },
        );
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payouts - Admin" />
            <div className="container space-y-6 py-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Payouts</h1>
                        <p className="text-muted-foreground">
                            Manage teacher payout requests
                        </p>
                    </div>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Pending Requests
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats?.pending ?? 0}
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
                                ${(stats?.totalPending ?? 0).toLocaleString()}
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
                                ${(stats?.paidThisMonth ?? 0).toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                {/* Search */}
                <div className="relative max-w-sm">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search teachers..."
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
                            {filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        No payout requests found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((payout) => {
                                    const status = statusConfig[payout.status];
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
                                                $
                                                {payout.amount.toLocaleString()}
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
                                                    payout.requestedAt,
                                                ).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {payout.status ===
                                                    'pending' && (
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() =>
                                                                handleApprove(
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
                                                                handleReject(
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

