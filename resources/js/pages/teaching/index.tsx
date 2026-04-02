/**
 * Teaching Dashboard
 * Shows teacher's courses with stats, quick actions, and course management.
 * Professional design with animations and modern UI.
 */
import { Head, Link, usePage, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Archive,
    ArchiveRestore,
    BarChart3,
    BookOpen,
    Clock,
    Edit,
    Eye,
    FileEdit,
    MoreHorizontal,
    Plus,
    Rocket,
    Send,
    Star,
    Target,
    Terminal,
    TrendingUp,
    Trash2,
    Users,
    Zap,
} from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { teachingApi } from '@/api/course.api';
import { forumApi } from '@/api/forum.api';
import { TeacherInbox } from '@/components/forum/TeacherInbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Course, CourseStatus } from '@/types/course.types';
import type { DiscussionThread } from '@/types/forum.types';
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Teaching', href: '/teaching' },
];
const statusConfig: Record<
    CourseStatus,
    { label: string; icon: React.ElementType; className: string; bg: string }
> = {
    draft: {
        label: 'Draft',
        icon: FileEdit,
        className: 'text-slate-600 dark:text-slate-400',
        bg: 'bg-slate-100 dark:bg-slate-800',
    },
    pending_review: {
        label: 'In Review',
        icon: Clock,
        className: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-900/20',
    },
    approved: {
        label: 'Published',
        icon: Rocket,
        className: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    rejected: {
        label: 'Needs Changes',
        icon: Target,
        className: 'text-rose-600 dark:text-rose-400',
        bg: 'bg-rose-50 dark:bg-rose-900/20',
    },
    archived: {
        label: 'Archived',
        icon: Archive,
        className: 'text-gray-500 dark:text-gray-400',
        bg: 'bg-gray-100 dark:bg-gray-800',
    },
};
interface TeacherStats {
    totalCourses: number;
    totalStudents: number;
    avgRating: number;
}
interface PageProps {
    courses: Course[];
    stats: TeacherStats;
}
export default function TeachingPage() {
    const { courses, stats } = usePage<{ props: PageProps }>()
        .props as unknown as PageProps;
    const [deletingId, setDeletingId] = useState<string | number | null>(null);
    const [archivingId, setArchivingId] = useState<string | number | null>(
        null,
    );
    const [submittingId, setSubmittingId] = useState<string | number | null>(
        null,
    );
    // Forum inbox state
    const [forumInbox, setForumInbox] = useState<{
        flagged: DiscussionThread[];
        unanswered: DiscussionThread[];
        recent: DiscussionThread[];
    }>({ flagged: [], unanswered: [], recent: [] });
    const [forumLoading, setForumLoading] = useState(true);
    // Fetch forum inbox data
    const fetchForumInbox = useCallback(async () => {
        setForumLoading(true);
        try {
            const [flaggedRes, unansweredRes, recentRes] = await Promise.all([
                forumApi.getTeacherInbox('flagged').catch(() => ({ data: [] })),
                forumApi
                    .getTeacherInbox('unanswered')
                    .catch(() => ({ data: [] })),
                forumApi.getTeacherInbox('recent').catch(() => ({ data: [] })),
            ]);
            setForumInbox({
                flagged: flaggedRes.data,
                unanswered: unansweredRes.data,
                recent: recentRes.data,
            });
        } catch (err) {
            console.error('Failed to load forum inbox:', err);
        } finally {
            setForumLoading(false);
        }
    }, []);
    useEffect(() => {
        fetchForumInbox();
    }, [fetchForumInbox]);
    // Confirmation dialog state
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        title: string;
        description: string;
        confirmText: string;
        variant: 'destructive' | 'default';
        onConfirm: () => void;
    }>({
        open: false,
        title: '',
        description: '',
        confirmText: 'Confirm',
        variant: 'default',
        onConfirm: () => {},
    });
    const activeCourses = courses.filter((c) => c.status !== 'archived');
    const publishedCourses = activeCourses.filter(
        (c) => c.status === 'approved',
    );
    const draftCourses = activeCourses.filter(
        (c) => c.status === 'draft' || c.status === 'rejected',
    );
    const pendingCourses = activeCourses.filter(
        (c) => c.status === 'pending_review',
    );
    const handleSubmitForReview = async (courseId: string | number) => {
        setSubmittingId(courseId);
        try {
            await teachingApi.submitForReview(Number(courseId));
            toast.success('Course submitted for review');
            router.reload({ only: ['courses'] });
        } catch {
            toast.error('Failed to submit course');
        } finally {
            setSubmittingId(null);
        }
    };
    const handleDelete = (courseId: string | number) => {
        setConfirmDialog({
            open: true,
            title: 'Delete Course',
            description:
                'Are you sure you want to delete this course? This action cannot be undone and all associated content will be permanently removed.',
            confirmText: 'Delete Course',
            variant: 'destructive',
            onConfirm: async () => {
                setDeletingId(courseId);
                try {
                    await teachingApi.delete(Number(courseId));
                    toast.success('Course deleted');
                    router.reload({ only: ['courses'] });
                } catch {
                    toast.error('Failed to delete course');
                } finally {
                    setDeletingId(null);
                }
            },
        });
    };
    const handleArchive = (courseId: string | number) => {
        setConfirmDialog({
            open: true,
            title: 'Archive Course',
            description:
                'Archive this course? It will be hidden from students but can be restored later.',
            confirmText: 'Archive',
            variant: 'default',
            onConfirm: async () => {
                setArchivingId(courseId);
                try {
                    await teachingApi.archive(Number(courseId));
                    toast.success('Course archived');
                    router.reload({ only: ['courses'] });
                } catch {
                    toast.error('Failed to archive course');
                } finally {
                    setArchivingId(null);
                }
            },
        });
    };
    const handleRestore = async (courseId: string | number) => {
        setArchivingId(courseId);
        try {
            await teachingApi.restore(Number(courseId));
            toast.success('Course restored to draft');
            router.reload({ only: ['courses'] });
        } catch {
            toast.error('Failed to restore course');
        } finally {
            setArchivingId(null);
        }
    };
    const statCards = [
        {
            icon: BookOpen,
            label: 'Published Courses',
            value: publishedCourses.length,
            subtext: `${draftCourses.length} drafts`,
            gradient: 'from-violet-500 to-purple-600',
            iconBg: 'bg-violet-500/10',
            iconColor: 'text-violet-500',
        },
        {
            icon: Users,
            label: 'Total Students',
            value: stats.totalStudents,
            subtext: 'enrolled across all courses',
            gradient: 'from-cyan-500 to-blue-600',
            iconBg: 'bg-cyan-500/10',
            iconColor: 'text-cyan-500',
        },
        {
            icon: Star,
            label: 'Average Rating',
            value: stats.avgRating.toFixed(1),
            subtext: 'out of 5.0 stars',
            gradient: 'from-amber-500 to-orange-600',
            iconBg: 'bg-amber-500/10',
            iconColor: 'text-amber-500',
        },
        {
            icon: TrendingUp,
            label: 'Course Completion',
            value: '78%',
            subtext: 'average completion rate',
            gradient: 'from-emerald-500 to-teal-600',
            iconBg: 'bg-emerald-500/10',
            iconColor: 'text-emerald-500',
        },
    ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Teaching Dashboard" />
            <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
                <div className="container py-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
                    >
                        <div>
                            <h1 className="font-heading text-3xl font-bold text-foreground">
                                Teaching Dashboard
                            </h1>
                            <p className="mt-1 text-muted-foreground">
                                Create courses, track students, and grow your
                                impact
                            </p>
                        </div>
                        <Button
                            className="bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
                            asChild
                        >
                            <Link href="/teaching/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Create New Course
                            </Link>
                        </Button>
                    </motion.div>
                    {/* Stats Grid */}
                    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {statCards.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                            >
                                <Card className="relative overflow-hidden border-border/50 shadow-sm transition-shadow hover:shadow-md">
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-muted-foreground">
                                                    {stat.label}
                                                </p>
                                                <p className="font-heading text-3xl font-bold text-foreground">
                                                    {typeof stat.value ===
                                                    'number'
                                                        ? stat.value.toLocaleString()
                                                        : stat.value}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {stat.subtext}
                                                </p>
                                            </div>
                                            <div
                                                className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.iconBg}`}
                                            >
                                                <stat.icon
                                                    className={`h-6 w-6 ${stat.iconColor}`}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                    {/* Decorative gradient line */}
                                    <div
                                        className={`absolute right-0 bottom-0 left-0 h-1 bg-gradient-to-r ${stat.gradient}`}
                                    />
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                    {/* Two-column layout: Forum Inbox + Quick Actions */}
                    <div className="mb-8 grid gap-6 lg:grid-cols-2">
                        {/* Forum Inbox */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 }}
                        >
                            <TeacherInbox
                                flaggedThreads={forumInbox.flagged}
                                unansweredThreads={forumInbox.unanswered}
                                recentThreads={forumInbox.recent}
                                onViewThread={(threadId, courseSlug) => {
                                    router.visit(
                                        `/courses/${courseSlug}?thread=${threadId}`,
                                    );
                                }}
                                onResolveFlag={async (threadId) => {
                                    try {
                                        await forumApi.unpinThread(threadId);
                                        fetchForumInbox();
                                        toast.success('Thread flag resolved');
                                    } catch {
                                        toast.error('Failed to resolve flag');
                                    }
                                }}
                                onPinThread={async (threadId) => {
                                    try {
                                        await forumApi.pinThread(threadId);
                                        fetchForumInbox();
                                        toast.success('Thread pinned');
                                    } catch {
                                        toast.error('Failed to pin thread');
                                    }
                                }}
                                onLockThread={async (threadId) => {
                                    try {
                                        await forumApi.lockThread(threadId);
                                        fetchForumInbox();
                                        toast.success('Thread locked');
                                    } catch {
                                        toast.error('Failed to lock thread');
                                    }
                                }}
                                onRefresh={fetchForumInbox}
                                isLoading={forumLoading}
                            />
                        </motion.div>
                        {/* Quick Actions for pending/drafts */}
                        {(pendingCourses.length > 0 ||
                            draftCourses.length > 0) && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Card className="border-primary/20 bg-primary/5">
                                    <CardContent className="p-5">
                                        <div className="mb-4 flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                                <Zap className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground">
                                                Quick Actions
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                You have courses that need
                                                attention
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {pendingCourses.length > 0 && (
                                            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                <Clock className="mr-1 h-3 w-3" />
                                                {pendingCourses.length} awaiting
                                                review
                                            </Badge>
                                        )}
                                        {draftCourses.length > 0 && (
                                            <Badge variant="secondary">
                                                <FileEdit className="mr-1 h-3 w-3" />
                                                {draftCourses.length} draft
                                                {draftCourses.length > 1
                                                    ? 's'
                                                    : ''}{' '}
                                                to complete
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                    </div>
                    {/* Courses List */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="font-heading text-xl font-semibold text-foreground">
                                My Courses
                            </h2>
                            <span className="text-sm text-muted-foreground">
                                {courses.length} total
                            </span>
                        </div>
                        {courses.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-16 text-center"
                            >
                                <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                                    <BookOpen className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <h3 className="mb-2 font-heading text-xl font-semibold">
                                    Create your first course
                                </h3>
                                <p className="mx-auto mb-6 max-w-md text-muted-foreground">
                                    Share your knowledge with engineers around
                                    the world. Create interactive courses with
                                    VM labs and hands-on projects.
                                </p>
                                <Button asChild>
                                    <Link href="/teaching/create">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Get Started
                                    </Link>
                                </Button>
                            </motion.div>
                        ) : (
                            <div className="space-y-3">
                                <AnimatePresence>
                                    {courses.map((course, i) => {
                                        const status =
                                            statusConfig[course.status];
                                        const StatusIcon = status.icon;
                                        const moduleCount =
                                            course.modules?.length ?? 0;
                                        const lessonCount =
                                            course.modules?.reduce(
                                                (a, m) => a + m.lessons.length,
                                                0,
                                            ) ?? 0;
                                        const completeness = Math.min(
                                            100,
                                            (lessonCount / 10) * 100,
                                        ); // Assume 10 lessons = 100%
                                        return (
                                            <motion.div
                                                key={course.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ delay: i * 0.05 }}
                                            >
                                                <Card className="group overflow-hidden border-border/50 shadow-sm transition-all hover:border-primary/20 hover:shadow-md">
                                                    <CardContent className="p-0">
                                                        <div className="flex flex-col lg:flex-row lg:items-center">
                                                            {/* Course thumbnail/placeholder */}
                                                            <div className="hidden h-full w-32 shrink-0 items-center justify-center border-r border-border/50 bg-gradient-to-br from-primary/10 to-secondary/10 lg:flex">
                                                                {course.hasVirtualMachine ? (
                                                                    <Terminal className="h-8 w-8 text-primary/60" />
                                                                ) : (
                                                                    <BookOpen className="h-8 w-8 text-muted-foreground/60" />
                                                                )}
                                                            </div>
                                                            {/* Main content */}
                                                            <div className="flex-1 p-5">
                                                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                                                                    <div className="min-w-0 flex-1">
                                                                        {/* Title row */}
                                                                        <div className="mb-2 flex flex-wrap items-center gap-2">
                                                                            <Link
                                                                                href={`/teaching/${course.id}/edit`}
                                                                                className="font-heading font-semibold text-foreground transition-colors hover:text-primary"
                                                                            >
                                                                                {
                                                                                    course.title
                                                                                }
                                                                            </Link>
                                                                            <Badge
                                                                                variant="outline"
                                                                                className={`text-xs ${status.className} ${status.bg} border-0`}
                                                                            >
                                                                                <StatusIcon className="mr-1 h-3 w-3" />
                                                                                {
                                                                                    status.label
                                                                                }
                                                                            </Badge>
                                                                            {course.hasVirtualMachine && (
                                                                                <Badge
                                                                                    variant="secondary"
                                                                                    className="text-xs"
                                                                                >
                                                                                    <Terminal className="mr-1 h-3 w-3" />
                                                                                    VM
                                                                                    Labs
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        {/* Stats row */}
                                                                        <div className="mb-3 flex items-center gap-4 text-sm text-muted-foreground">
                                                                            <span className="flex items-center gap-1">
                                                                                <BookOpen className="h-3.5 w-3.5" />
                                                                                {
                                                                                    moduleCount
                                                                                }{' '}
                                                                                modules
                                                                                ·{' '}
                                                                                {
                                                                                    lessonCount
                                                                                }{' '}
                                                                                lessons
                                                                            </span>
                                                                            <span className="flex items-center gap-1">
                                                                                <Users className="h-3.5 w-3.5" />
                                                                                {(
                                                                                    course.students ??
                                                                                    0
                                                                                ).toLocaleString()}{' '}
                                                                                students
                                                                            </span>
                                                                            <span className="flex items-center gap-1">
                                                                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                                                                {(
                                                                                    course.rating ??
                                                                                    0
                                                                                ).toFixed(
                                                                                    1,
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                        {/* Progress bar for drafts */}
                                                                        {course.status ===
                                                                            'draft' && (
                                                                            <div className="flex items-center gap-3">
                                                                                <Progress
                                                                                    value={
                                                                                        completeness
                                                                                    }
                                                                                    className="h-1.5 flex-1"
                                                                                />
                                                                                <span className="text-xs whitespace-nowrap text-muted-foreground">
                                                                                    {Math.round(
                                                                                        completeness,
                                                                                    )}
                                                                                    %
                                                                                    complete
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                        {/* Admin feedback */}
                                                                        {course.adminFeedback && (
                                                                            <div className="mt-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                                                                                <p className="text-xs font-medium text-destructive">
                                                                                    Admin
                                                                                    Feedback:{' '}
                                                                                    {
                                                                                        course.adminFeedback
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    {/* Actions */}
                                                                    <div className="flex shrink-0 items-center gap-2">
                                                                        {course.status ===
                                                                            'draft' && (
                                                                            <Button
                                                                                size="sm"
                                                                                onClick={() =>
                                                                                    handleSubmitForReview(
                                                                                        course.id,
                                                                                    )
                                                                                }
                                                                                disabled={submittingId === course.id}
                                                                                className="hidden sm:flex"
                                                                            >
                                                                                <Send className="mr-1 h-4 w-4" />
                                                                                {submittingId === course.id ? 'Submitting...' : 'Submit'}
                                                                            </Button>
                                                                        )}
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            asChild
                                                                        >
                                                                            <Link
                                                                                href={`/teaching/${course.id}/edit`}
                                                                            >
                                                                                <Edit className="h-4 w-4 sm:mr-1" />
                                                                                <span className="hidden sm:inline">
                                                                                    Edit
                                                                                </span>
                                                                            </Link>
                                                                        </Button>
                                                                        {course.status ===
                                                                            'approved' && (
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                asChild
                                                                            >
                                                                                <Link
                                                                                    href={`/courses/${course.id}`}
                                                                                >
                                                                                    <Eye className="h-4 w-4" />
                                                                                </Link>
                                                                            </Button>
                                                                        )}
                                                                        <DropdownMenu>
                                                                            <DropdownMenuTrigger
                                                                                asChild
                                                                            >
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    aria-label="Course options"
                                                                                >
                                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                                </Button>
                                                                            </DropdownMenuTrigger>
                                                                            <DropdownMenuContent align="end">
                                                                                <DropdownMenuItem
                                                                                    asChild
                                                                                >
                                                                                    <Link
                                                                                        href={`/teaching/${course.id}/edit`}
                                                                                    >
                                                                                        <Edit className="mr-2 h-4 w-4" />
                                                                                        Edit
                                                                                        Course
                                                                                    </Link>
                                                                                </DropdownMenuItem>
                                                                                {(course.status === 'draft' || course.status === 'rejected') && (
                                                                                    <DropdownMenuItem
                                                                                        onClick={() =>
                                                                                            handleSubmitForReview(course.id)
                                                                                        }
                                                                                        disabled={submittingId === course.id}
                                                                                    >
                                                                                        <Send className="mr-2 h-4 w-4" />
                                                                                        {submittingId === course.id ? 'Submitting...' : 'Submit for Review'}
                                                                                    </DropdownMenuItem>
                                                                                )}
                                                                                <DropdownMenuItem
                                                                                    asChild
                                                                                >
                                                                                    <Link
                                                                                        href={`/teaching/analytics/courses/${course.id}/students`}
                                                                                    >
                                                                                        <BarChart3 className="mr-2 h-4 w-4" />
                                                                                        View
                                                                                        Analytics
                                                                                    </Link>
                                                                                </DropdownMenuItem>
                                                                                {course.status ===
                                                                                    'approved' && (
                                                                                    <DropdownMenuItem
                                                                                        asChild
                                                                                    >
                                                                                        <Link
                                                                                            href={`/courses/${course.id}`}
                                                                                        >
                                                                                            <Eye className="mr-2 h-4 w-4" />
                                                                                            View
                                                                                            Public
                                                                                            Page
                                                                                        </Link>
                                                                                    </DropdownMenuItem>
                                                                                )}
                                                                                <DropdownMenuSeparator />
                                                                                {course.status ===
                                                                                'archived' ? (
                                                                                    <DropdownMenuItem
                                                                                        onClick={() =>
                                                                                            handleRestore(
                                                                                                course.id,
                                                                                            )
                                                                                        }
                                                                                        disabled={
                                                                                            archivingId ===
                                                                                            course.id
                                                                                        }
                                                                                    >
                                                                                        <ArchiveRestore className="mr-2 h-4 w-4" />
                                                                                        Restore
                                                                                        Course
                                                                                    </DropdownMenuItem>
                                                                                ) : (
                                                                                    <DropdownMenuItem
                                                                                        onClick={() =>
                                                                                            handleArchive(
                                                                                                course.id,
                                                                                            )
                                                                                        }
                                                                                        disabled={
                                                                                            archivingId ===
                                                                                            course.id
                                                                                        }
                                                                                    >
                                                                                        <Archive className="mr-2 h-4 w-4" />
                                                                                        Archive
                                                                                        Course
                                                                                    </DropdownMenuItem>
                                                                                )}
                                                                                <DropdownMenuItem
                                                                                    className="text-destructive focus:text-destructive"
                                                                                    onClick={() =>
                                                                                        handleDelete(
                                                                                            course.id,
                                                                                        )
                                                                                    }
                                                                                    disabled={
                                                                                        deletingId ===
                                                                                        course.id
                                                                                    }
                                                                                >
                                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                                    Delete
                                                                                    Course
                                                                                </DropdownMenuItem>
                                                                            </DropdownMenuContent>
                                                                        </DropdownMenu>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <ConfirmDialog
                open={confirmDialog.open}
                onOpenChange={(open) =>
                    setConfirmDialog((prev) => ({ ...prev, open }))
                }
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                description={confirmDialog.description}
                confirmText={confirmDialog.confirmText}
                variant={confirmDialog.variant}
                loading={deletingId !== null || archivingId !== null}
            />
        </AppLayout>
    );
}

