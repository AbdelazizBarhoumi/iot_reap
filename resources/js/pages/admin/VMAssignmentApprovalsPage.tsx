/**
 * Admin VM Assignment Approvals Page
 * Approve/reject teacher requests to assign VMs to trainingUnits.
 */
import { Head, router } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock,
    Monitor,
    Search,
    Server,
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
import type { TrainingUnitVMAssignment } from '@/types/vm.types';

interface Props {
    assignments: TrainingUnitVMAssignment[];
    stats?: {
        pending: number;
        approved: number;
        rejected: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/infrastructure' },
    { title: 'VM Assignments', href: '/admin/vm-assignments' },
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

export default function VMAssignmentApprovalsPage({
    assignments = [],
    stats,
}: Props) {
    const [search, setSearch] = useState('');
    const [processing, setProcessing] = useState<number | null>(null);

    const filtered = assignments.filter(
        (a) =>
            a.trainingUnit?.title
                ?.toLowerCase()
                .includes(search.toLowerCase()) ||
            a.trainingUnit?.module?.trainingPath?.title
                ?.toLowerCase()
                .includes(search.toLowerCase()) ||
            a.assigned_by?.name?.toLowerCase().includes(search.toLowerCase()) ||
            a.vm_name?.toLowerCase().includes(search.toLowerCase()),
    );

    const handleApprove = (id: number) => {
        setProcessing(id);
        router.post(
            `/admin/trainingUnit-assignments/${id}/approve`,
            {},
            {
                onFinish: () => setProcessing(null),
            },
        );
    };

    const handleReject = (id: number) => {
        const notes = prompt('Please provide a reason for rejection:');
        if (!notes) return;

        setProcessing(id);
        router.post(
            `/admin/trainingUnit-assignments/${id}/reject`,
            { admin_notes: notes },
            {
                onFinish: () => setProcessing(null),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="VM Assignment Approvals - Admin" />
            <div className="container space-y-6 py-8">
                <div>
                    <h1 className="text-3xl font-bold">
                        VM Assignment Approvals
                    </h1>
                    <p className="text-muted-foreground">
                        Review instructor requests to assign VMs to training
                        modules
                    </p>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
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
                </div>

                {/* Search */}
                <div className="relative max-w-sm">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by path, module, or instructor..."
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
                                <TableHead>Module</TableHead>
                                <TableHead>VM</TableHead>
                                <TableHead>Instructor</TableHead>
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
                                        colSpan={6}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        No VM assignment requests found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((assignment) => {
                                    const status =
                                        statusConfig[assignment.status];
                                    const StatusIcon = status.icon;
                                    return (
                                        <TableRow key={assignment.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {assignment.trainingUnit
                                                            ?.title ?? 'N/A'}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {assignment.trainingUnit
                                                            ?.module
                                                            ?.trainingPath
                                                            ?.title ?? 'N/A'}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Monitor className="h-4 w-4 text-muted-foreground" />
                                                    <div>
                                                        <div className="font-medium">
                                                            {assignment.vm_name ??
                                                                `VM ${assignment.vm_id}`}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                            <Server className="h-3 w-3" />
                                                            {assignment.node
                                                                ?.name ??
                                                                'Unknown node'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {assignment.assigned_by
                                                            ?.name ?? 'N/A'}
                                                    </div>
                                                </div>
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
                                                    assignment.created_at,
                                                ).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {assignment.is_pending && (
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() =>
                                                                handleApprove(
                                                                    assignment.id,
                                                                )
                                                            }
                                                            disabled={
                                                                processing ===
                                                                assignment.id
                                                            }
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                handleReject(
                                                                    assignment.id,
                                                                )
                                                            }
                                                            disabled={
                                                                processing ===
                                                                assignment.id
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
