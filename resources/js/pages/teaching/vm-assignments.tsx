import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    RefreshCw,
    Terminal,
    Trash2,
    XCircle,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { trainingUnitVMAssignmentApi } from '@/api/vm.api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import teaching from '@/routes/teaching';
import type { BreadcrumbItem } from '@/types';
import type { TrainingUnitVMAssignment } from '@/types/vm.types';

interface TeacherVMAssignmentsPageProps {
    assignments: TrainingUnitVMAssignment[];
}

export default function TeacherVMAssignmentsPage({
    assignments: initialAssignments,
}: TeacherVMAssignmentsPageProps) {
    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: 'Teaching', href: teaching.index.url() },
            {
                title: 'VM Assignments',
                href: teaching.trainingUnitAssignments.my.url(),
            },
        ],
        [],
    );

    const [assignments, setAssignments] = useState(initialAssignments);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [deletingAssignmentId, setDeletingAssignmentId] = useState<
        number | null
    >(null);

    const refreshAssignments = useCallback(async () => {
        setIsRefreshing(true);

        try {
            const data = await trainingUnitVMAssignmentApi.getMyAssignments();
            setAssignments(data);
        } catch {
            toast.error('Unable to refresh VM assignments right now.');
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    const summary = useMemo(
        () => ({
            total: assignments.length,
            pending: assignments.filter((assignment) => assignment.is_pending)
                .length,
            approved: assignments.filter((assignment) => assignment.is_approved)
                .length,
            rejected: assignments.filter((assignment) => assignment.is_rejected)
                .length,
        }),
        [assignments],
    );

    const summaryCards = [
        {
            label: 'Total Requests',
            value: summary.total,
            icon: Terminal,
        },
        {
            label: 'Pending Approval',
            value: summary.pending,
            icon: Clock,
        },
        {
            label: 'Approved',
            value: summary.approved,
            icon: CheckCircle2,
        },
        {
            label: 'Rejected',
            value: summary.rejected,
            icon: XCircle,
        },
    ];

    const getAssignmentHref = (assignment: TrainingUnitVMAssignment) => {
        const trainingPathId =
            assignment.trainingUnit?.module?.trainingPath?.id ?? null;
        const moduleId = assignment.trainingUnit?.module?.id ?? null;
        const trainingUnitId = assignment.trainingUnit?.id ?? null;

        if (!trainingPathId || !moduleId || !trainingUnitId) {
            return null;
        }

        return `/teaching/${trainingPathId}/module/${moduleId}/trainingUnit/${trainingUnitId}`;
    };

    const handleDelete = async (assignmentId: number) => {
        setDeletingAssignmentId(assignmentId);

        try {
            await trainingUnitVMAssignmentApi.remove(assignmentId);
            setAssignments((current) =>
                current.filter((assignment) => assignment.id !== assignmentId),
            );
            toast.success('VM assignment removed.');
        } catch {
            toast.error('Unable to remove this VM assignment.');
        } finally {
            setDeletingAssignmentId(null);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My VM Assignments" />
            <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
                <div className="container py-8">
                    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={teaching.index.url()}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Teaching
                                </Link>
                            </Button>
                            <div>
                                <h1 className="font-heading text-3xl font-bold">
                                    My VM Assignments
                                </h1>
                                <p className="text-muted-foreground">
                                    Track every unit VM request from submission
                                    through approval, and clean up pending
                                    requests when plans change.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Button
                                variant="outline"
                                onClick={() => void refreshAssignments()}
                            >
                                <RefreshCw
                                    className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                                />
                                Refresh
                            </Button>
                            <Button asChild>
                                <Link href={teaching.index.url()}>
                                    Open Studio
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {summaryCards.map((card) => (
                            <Card key={card.label}>
                                <CardContent className="flex items-center justify-between p-5">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            {card.label}
                                        </p>
                                        <p className="mt-1 text-3xl font-semibold">
                                            {card.value}
                                        </p>
                                    </div>
                                    <div className="rounded-xl bg-primary/10 p-3">
                                        <card.icon className="h-5 w-5 text-primary" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Assignment Queue</CardTitle>
                            <CardDescription>
                                Each request is tied back to its training path,
                                training unit, selected VM, and admin feedback.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {assignments.length === 0 ? (
                                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                                    No VM assignments yet. Submit one from a VM
                                    lab unit to start the approval flow.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {assignments.map((assignment) => {
                                        const assignmentHref =
                                            getAssignmentHref(assignment);

                                        return (
                                            <div
                                                key={assignment.id}
                                                className="rounded-xl border p-5"
                                            >
                                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                    <div className="space-y-2">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h2 className="font-semibold">
                                                                {assignment
                                                                    .trainingUnit
                                                                    ?.title ??
                                                                    'Training Unit'}
                                                            </h2>
                                                            <Badge variant="secondary">
                                                                {
                                                                    assignment.status_label
                                                                }
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            {assignment
                                                                .trainingUnit
                                                                ?.module
                                                                ?.trainingPath
                                                                ?.title ??
                                                                'Training Path'}
                                                            {' / '}
                                                            {assignment
                                                                .trainingUnit
                                                                ?.module
                                                                ?.title ??
                                                                'Module'}
                                                        </p>
                                                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                                            <span>
                                                                VM{' '}
                                                                {assignment.vm_name ??
                                                                    assignment.vm_id}
                                                            </span>
                                                            {assignment.node && (
                                                                <>
                                                                    <span>
                                                                        •
                                                                    </span>
                                                                    <span>
                                                                        Node{' '}
                                                                        {
                                                                            assignment
                                                                                .node
                                                                                .name
                                                                        }
                                                                    </span>
                                                                </>
                                                            )}
                                                            <span>•</span>
                                                            <span>
                                                                Requested{' '}
                                                                {new Date(
                                                                    assignment.created_at,
                                                                ).toLocaleString()}
                                                            </span>
                                                        </div>
                                                        {assignment.teacher_notes && (
                                                            <p className="rounded-lg bg-muted/30 p-3 text-sm text-muted-foreground">
                                                                {
                                                                    assignment.teacher_notes
                                                                }
                                                            </p>
                                                        )}
                                                        {assignment.admin_feedback && (
                                                            <p className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                                                                {
                                                                    assignment.admin_feedback
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {assignmentHref && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={
                                                                        assignmentHref
                                                                    }
                                                                >
                                                                    Open Unit
                                                                </Link>
                                                            </Button>
                                                        )}
                                                        {assignment.is_pending && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-destructive hover:text-destructive"
                                                                onClick={() =>
                                                                    void handleDelete(
                                                                        assignment.id,
                                                                    )
                                                                }
                                                                disabled={
                                                                    deletingAssignmentId ===
                                                                    assignment.id
                                                                }
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                {deletingAssignmentId ===
                                                                assignment.id
                                                                    ? 'Removing...'
                                                                    : 'Delete'}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
