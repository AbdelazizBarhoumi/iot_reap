/**
 * Admin VM Assignment Approvals Page
 * Approve/reject teacher requests to assign VMs to lessons.
 */
import { Head, router } from '@inertiajs/react';
import { CheckCircle2, Clock, Monitor, Search, XCircle } from 'lucide-react';
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
interface VMAssignmentRequest {
    id: string;
    lesson: {
        id: number;
        title: string;
        course: {
            id: number;
            title: string;
        };
    };
    template: {
        id: number;
        name: string;
        os_type: string;
    };
    teacher: {
        id: string;
        name: string;
        email: string;
    };
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: string;
    notes: string | null;
}
interface Props {
    requests: VMAssignmentRequest[];
    stats: {
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
    requests = [],
    stats,
}: Props) {
    const [search, setSearch] = useState('');
    const [processing, setProcessing] = useState<string | null>(null);
    const filtered = requests.filter(
        (r) =>
            r.lesson.title.toLowerCase().includes(search.toLowerCase()) ||
            r.lesson.course.title
                .toLowerCase()
                .includes(search.toLowerCase()) ||
            r.teacher.name.toLowerCase().includes(search.toLowerCase()) ||
            r.template.name.toLowerCase().includes(search.toLowerCase()),
    );
    const handleApprove = (id: string) => {
        setProcessing(id);
        router.post(
            `/admin/vm-assignments/${id}/approve`,
            {},
            {
                onFinish: () => setProcessing(null),
            },
        );
    };
    const handleReject = (id: string) => {
        setProcessing(id);
        router.post(
            `/admin/vm-assignments/${id}/reject`,
            {},
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
                        Review teacher requests to assign VMs to course lessons
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
                        placeholder="Search by course, lesson, or teacher..."
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
                                <TableHead>Lesson</TableHead>
                                <TableHead>VM Template</TableHead>
                                <TableHead>Teacher</TableHead>
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
                                filtered.map((request) => {
                                    const status = statusConfig[request.status];
                                    const StatusIcon = status.icon;
                                    return (
                                        <TableRow key={request.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {request.lesson.title}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {
                                                            request.lesson
                                                                .course.title
                                                        }
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Monitor className="h-4 w-4 text-muted-foreground" />
                                                    <div>
                                                        <div className="font-medium">
                                                            {
                                                                request.template
                                                                    .name
                                                            }
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {
                                                                request.template
                                                                    .os_type
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {request.teacher.name}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {request.teacher.email}
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
                                                    request.requestedAt,
                                                ).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {request.status ===
                                                    'pending' && (
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() =>
                                                                handleApprove(
                                                                    request.id,
                                                                )
                                                            }
                                                            disabled={
                                                                processing ===
                                                                request.id
                                                            }
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                handleReject(
                                                                    request.id,
                                                                )
                                                            }
                                                            disabled={
                                                                processing ===
                                                                request.id
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

