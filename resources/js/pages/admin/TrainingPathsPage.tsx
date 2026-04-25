/**
 * Admin TrainingPath Approvals Page
 * Admin view for reviewing and approving/rejecting TrainingPath submissions.
 * Uses unified AppLayout.
 */
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    BookOpen,
    CheckCircle2,
    Clock,
    Eye,
    Shield,
    Star,
    Users,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { usePendingTrainingPaths } from '@/hooks/useAdmin';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type TrainingPathAdminStatus =
    | 'draft'
    | 'pending_review'
    | 'pending'
    | 'approved'
    | 'rejected';

interface ManagedTrainingPath {
    id: string;
    title: string;
    description: string;
    status: TrainingPathAdminStatus;
    instructor?: { name: string } | string;
    category: string;
    level?: 'beginner' | 'intermediate' | 'advanced';
    duration?: string;
    thumbnail?: string | null;
    thumbnail_url?: string | null;
    modules?: Array<{
        id?: string;
        title?: string;
        trainingUnits?: Array<Record<string, unknown>>;
    }>;
    students?: number;
    rating: number;
    adminFeedback?: string | null;
}
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/infrastructure' },
    { title: 'Training Path Approvals', href: '/admin/trainingPaths' },
];
const statusConfig: Record<
    TrainingPathAdminStatus,
    { label: string; color: string; icon: React.ElementType }
> = {
    draft: {
        label: 'Draft',
        color: 'bg-muted text-muted-foreground',
        icon: Clock,
    },
    pending: {
        label: 'Pending',
        color: 'bg-warning/10 text-warning border-warning/30',
        icon: Clock,
    },
    pending_review: {
        label: 'Pending Review',
        color: 'bg-warning/10 text-warning border-warning/30',
        icon: Clock,
    },
    approved: {
        label: 'Approved',
        color: 'bg-success/10 text-success border-success/30',
        icon: CheckCircle2,
    },
    rejected: {
        label: 'Rejected',
        color: 'bg-destructive/10 text-destructive border-destructive/30',
        icon: XCircle,
    },
};
function AdminTrainingPathsContent() {
    const { trainingPaths, approve, reject } = usePendingTrainingPaths();
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [feedback, setFeedback] = useState('');
    const [previewId, setPreviewId] = useState<string | null>(null);

    const pendingTrainingPaths = trainingPaths.filter(
        (c) => c.status === 'pending_review',
    );
    const approvedTrainingPaths = trainingPaths.filter(
        (c) => c.status === 'approved',
    );
    const rejectedTrainingPaths = trainingPaths.filter(
        (c) => c.status === 'rejected',
    );

    const handleApprove = async (id: string) => {
        try {
            await approve(id);
        } catch (err) {
            console.error('Failed to approve TrainingPath:', err);
        }
    };

    const handleReject = async () => {
        if (rejectingId) {
            try {
                await reject(rejectingId, feedback);
                setRejectingId(null);
                setFeedback('');
            } catch (err) {
                console.error('Failed to reject TrainingPath:', err);
            }
        }
    };
    const previewTrainingPath = trainingPaths.find((c) => c.id === previewId);
    const TrainingPathRow = ({
        TrainingPath,
    }: {
        TrainingPath: ManagedTrainingPath;
    }) => {
        const status = statusConfig[TrainingPath.status];
        const StatusIcon = status.icon;
        const totalTrainingUnits = (TrainingPath.modules ?? []).reduce(
            (a, m) => a + (m.trainingUnits?.length ?? 0),
            0,
        );
        const thumbnailSrc =
            TrainingPath.thumbnail ?? TrainingPath.thumbnail_url ?? null;
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Card className="shadow-card transition-shadow hover:shadow-card-hover">
                    <CardContent className="py-5">
                        <div className="flex items-start gap-4">
                            <div className="hidden h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted sm:flex">
                                {thumbnailSrc ? (
                                    <img
                                        src={thumbnailSrc}
                                        alt={`${TrainingPath.title} thumbnail`}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        <BookOpen className="h-7 w-7 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="mb-1 flex flex-wrap items-center gap-2">
                                    <h3 className="font-heading font-semibold text-foreground">
                                        {TrainingPath.title}
                                    </h3>
                                    <Badge
                                        variant="outline"
                                        className={`text-xs ${status.color}`}
                                    >
                                        <StatusIcon className="mr-1 h-3 w-3" />
                                        {status.label}
                                    </Badge>
                                </div>
                                <p className="mb-2 line-clamp-1 text-sm text-muted-foreground">
                                    {TrainingPath.description}
                                </p>
                                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                    <span>
                                        By{' '}
                                        {typeof TrainingPath.instructor ===
                                        'string'
                                            ? TrainingPath.instructor
                                            : TrainingPath.instructor?.name}
                                    </span>
                                    <span>{TrainingPath.category}</span>
                                    <span>
                                        {(TrainingPath.modules || []).length}{' '}
                                        modules
                                    </span>
                                    <span>
                                        {(totalTrainingUnits as number) || 0}{' '}
                                        trainingUnits
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />{' '}
                                        {(
                                            TrainingPath.students ?? 0
                                        ).toLocaleString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Star className="h-3 w-3 fill-warning text-warning" />{' '}
                                        {TrainingPath.rating}
                                    </span>
                                </div>
                                {TrainingPath.adminFeedback && (
                                    <div className="mt-3 rounded-md border border-destructive/20 bg-destructive/5 p-3">
                                        <p className="mb-1 text-xs font-medium text-destructive">
                                            Admin Feedback:
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {TrainingPath.adminFeedback}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setPreviewId(TrainingPath.id)
                                    }
                                >
                                    <Eye className="mr-1 h-3.5 w-3.5" /> Review
                                </Button>
                                {TrainingPath.status === 'pending_review' && (
                                    <>
                                        <Button
                                            size="sm"
                                            className="bg-success text-success-foreground hover:bg-success/90"
                                            onClick={() =>
                                                handleApprove(TrainingPath.id)
                                            }
                                        >
                                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />{' '}
                                            Approve
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-destructive/30 text-destructive hover:bg-destructive/10"
                                            onClick={() =>
                                                setRejectingId(TrainingPath.id)
                                            }
                                        >
                                            <XCircle className="mr-1 h-3.5 w-3.5" />{' '}
                                            Reject
                                        </Button>
                                    </>
                                )}
                                {TrainingPath.status === 'rejected' && (
                                    <Button
                                        size="sm"
                                        className="bg-success text-success-foreground hover:bg-success/90"
                                        onClick={() =>
                                            handleApprove(TrainingPath.id)
                                        }
                                    >
                                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />{' '}
                                        Approve
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        );
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Training Path Approvals" />
            <div className="min-h-screen bg-background">
                <div className="container py-8">
                    <div className="mb-8 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10 text-info">
                            <Shield className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="font-heading text-3xl font-bold text-foreground">
                                Training Path Approvals
                            </h1>
                            <p className="text-muted-foreground">
                                Review and manage training path submissions
                            </p>
                        </div>
                    </div>
                    {/* Stats */}
                    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Card className="shadow-card">
                            <CardContent className="flex items-center gap-4 p-5">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10 text-warning">
                                    <Clock className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Pending Review
                                    </p>
                                    <p className="font-heading text-2xl font-bold text-foreground">
                                        {pendingTrainingPaths.length}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="shadow-card">
                            <CardContent className="flex items-center gap-4 p-5">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10 text-success">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Approved
                                    </p>
                                    <p className="font-heading text-2xl font-bold text-foreground">
                                        {approvedTrainingPaths.length}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="shadow-card">
                            <CardContent className="flex items-center gap-4 p-5">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                                    <XCircle className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Rejected
                                    </p>
                                    <p className="font-heading text-2xl font-bold text-foreground">
                                        {rejectedTrainingPaths.length}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    {/* Tabs */}
                    <Tabs defaultValue="pending">
                        <TabsList>
                            <TabsTrigger value="pending">
                                Pending Review
                                {pendingTrainingPaths.length > 0 && (
                                    <Badge className="ml-2 flex h-5 w-5 items-center justify-center bg-yellow-500 p-0 text-xs text-white">
                                        {pendingTrainingPaths.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="approved">Approved</TabsTrigger>
                            <TabsTrigger value="rejected">Rejected</TabsTrigger>
                            <TabsTrigger value="all">All Paths</TabsTrigger>
                        </TabsList>
                        <TabsContent value="pending" className="mt-6 space-y-4">
                            {pendingTrainingPaths.length === 0 ? (
                                <div className="py-12 text-center">
                                    <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-green-500/40" />
                                    <p className="text-muted-foreground">
                                        No training paths pending review. All
                                        caught up!
                                    </p>
                                </div>
                            ) : (
                                pendingTrainingPaths.map((c) => (
                                    <TrainingPathRow
                                        key={c.id}
                                        TrainingPath={c}
                                    />
                                ))
                            )}
                        </TabsContent>
                        <TabsContent
                            value="approved"
                            className="mt-6 space-y-4"
                        >
                            {approvedTrainingPaths.map((c) => (
                                <TrainingPathRow key={c.id} TrainingPath={c} />
                            ))}
                        </TabsContent>
                        <TabsContent
                            value="rejected"
                            className="mt-6 space-y-4"
                        >
                            {rejectedTrainingPaths.length === 0 ? (
                                <div className="py-12 text-center">
                                    <p className="text-muted-foreground">
                                        No rejected paths.
                                    </p>
                                </div>
                            ) : (
                                rejectedTrainingPaths.map((c) => (
                                    <TrainingPathRow
                                        key={c.id}
                                        TrainingPath={c}
                                    />
                                ))
                            )}
                        </TabsContent>
                        <TabsContent value="all" className="mt-6 space-y-4">
                            {trainingPaths.map((c) => (
                                <TrainingPathRow key={c.id} TrainingPath={c} />
                            ))}
                        </TabsContent>
                    </Tabs>
                    {/* Reject Dialog */}
                    <Dialog
                        open={!!rejectingId}
                        onOpenChange={(open) => !open && setRejectingId(null)}
                    >
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Reject Path</DialogTitle>
                                <DialogDescription>
                                    Provide feedback to the instructor about why
                                    this training path was rejected.
                                </DialogDescription>
                            </DialogHeader>
                            <Textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Explain what needs to be improved..."
                                rows={4}
                            />
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setRejectingId(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleReject}
                                    disabled={!feedback.trim()}
                                >
                                    <XCircle className="mr-2 h-4 w-4" /> Reject
                                    Path
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    {/* Preview Dialog */}
                    <Dialog
                        open={!!previewId}
                        onOpenChange={(open) => !open && setPreviewId(null)}
                    >
                        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                            {previewTrainingPath && (
                                <>
                                    <DialogHeader>
                                        <DialogTitle className="text-xl">
                                            {previewTrainingPath.title}
                                        </DialogTitle>
                                        <DialogDescription>
                                            {previewTrainingPath.description}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="mt-4 space-y-4">
                                        {(previewTrainingPath.thumbnail ??
                                            previewTrainingPath.thumbnail_url) && (
                                            <div className="overflow-hidden rounded-lg border border-border">
                                                <img
                                                    src={
                                                        previewTrainingPath.thumbnail ??
                                                        previewTrainingPath.thumbnail_url ??
                                                        ''
                                                    }
                                                    alt={`${previewTrainingPath.title} thumbnail`}
                                                    className="h-48 w-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                            <Badge variant="outline">
                                                {previewTrainingPath.category}
                                            </Badge>
                                            <Badge variant="outline">
                                                {previewTrainingPath.level}
                                            </Badge>
                                            <span>
                                                By{' '}
                                                {typeof previewTrainingPath.instructor ===
                                                'string'
                                                    ? previewTrainingPath.instructor
                                                    : previewTrainingPath
                                                          .instructor?.name}
                                            </span>
                                            <span>
                                                {previewTrainingPath.duration}
                                            </span>
                                        </div>
                                        {(
                                            previewTrainingPath.modules ?? []
                                        ).map((mod, mi) => (
                                            <div
                                                key={mod.id ?? mi}
                                                className="overflow-hidden rounded-lg border border-border"
                                            >
                                                <div className="border-b border-border bg-muted/30 px-4 py-3">
                                                    <p className="text-sm font-semibold text-foreground">
                                                        Module {mi + 1}:{' '}
                                                        {mod.title}
                                                    </p>
                                                </div>
                                                <ul className="divide-y divide-border">
                                                    {mod.trainingUnits?.map(
                                                        (l) => (
                                                            <li
                                                                key={l.id}
                                                                className="px-4 py-2.5 text-sm"
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-foreground">
                                                                        {
                                                                            l.title
                                                                        }
                                                                    </span>
                                                                    <div className="flex items-center gap-2">
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="text-xs capitalize"
                                                                        >
                                                                            {(
                                                                                l.type ??
                                                                                ''
                                                                            ).replace(
                                                                                '-',
                                                                                ' ',
                                                                            )}
                                                                        </Badge>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            {
                                                                                l.duration
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                {l.content && (
                                                                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                                                        {
                                                                            l.content
                                                                        }
                                                                    </p>
                                                                )}
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                    <DialogFooter className="mt-4">
                                        <Button variant="outline" asChild>
                                            <Link
                                                href={`/trainingPaths/${previewTrainingPath.id}`}
                                                onClick={() =>
                                                    setPreviewId(null)
                                                }
                                            >
                                                <Eye className="mr-2 h-4 w-4" />{' '}
                                                Full Preview
                                            </Link>
                                        </Button>
                                        {previewTrainingPath.status ===
                                            'pending_review' && (
                                            <>
                                                <Button
                                                    className="bg-green-500 text-white hover:bg-green-600"
                                                    onClick={() => {
                                                        handleApprove(
                                                            previewTrainingPath.id,
                                                        );
                                                        setPreviewId(null);
                                                    }}
                                                >
                                                    <CheckCircle2 className="mr-2 h-4 w-4" />{' '}
                                                    Approve
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    onClick={() => {
                                                        setPreviewId(null);
                                                        setRejectingId(
                                                            previewTrainingPath.id,
                                                        );
                                                    }}
                                                >
                                                    <XCircle className="mr-2 h-4 w-4" />{' '}
                                                    Reject
                                                </Button>
                                            </>
                                        )}
                                    </DialogFooter>
                                </>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </AppLayout>
    );
}
export default function AdminTrainingPathsPage() {
    return <AdminTrainingPathsContent />;
}
