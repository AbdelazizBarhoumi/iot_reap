/**
 * Lesson Viewer Page
 * Shows lesson content with integrated VM lab functionality.
 * Enhanced with progress tracking and Mark Complete functionality.
 * Uses unified AppLayout.
 */
import { Head, Link, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    ArrowRight,
    BookOpen,
    Check,
    CheckCircle2,
    ChevronDown,
    Circle,
    ExternalLink,
    FileText,
    Loader2,
    Menu,
    Play,
    Terminal,
    Clock,
    Users,
} from 'lucide-react';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { courseApi } from '@/api/course.api';
import { vmSessionApi } from '@/api/vm.api';
import { ArticleReader } from '@/components/articles/ArticleReader';
import VideoPlayer from '@/components/courses/VideoPlayer';
import { ThreadList } from '@/components/forum/ThreadList';
import { NotesPanel } from '@/components/notes/NotesPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useForum } from '@/hooks/useForum';
import { useVMSessions } from '@/hooks/useVMSessions';
import AppLayout from '@/layouts/app-layout';
import { courseToasts } from '@/lib/toast-utils';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';
import type { Article } from '@/types/article.types';
import type { Course, Lesson, LessonType } from '@/types/course.types';
/**
 * VM template info from approved lesson assignment.
 */
interface VMTemplateInfo {
    id: number;
    vmid: number;
    name: string;
    description: string | null;
    os_type: string | null;
    protocol: string | null;
    is_available: boolean;
    node?: { id: number; name: string } | null;
    proxmox_server?: { id: number; name: string } | null;
}
/**
 * Queue status for a VM template.
 */
interface QueueStatus {
    in_use: boolean;
    current_user: string | null;
    queue_count: number;
    estimated_wait_minutes: number | null;
}
/**
 * VM info passed from backend for the lesson.
 */
interface LessonVMInfo {
    template: VMTemplateInfo;
    queue_status: QueueStatus;
    can_start: boolean;
    my_position: number | null;
}
// Lesson type icons mapping
const lessonIcons: Record<LessonType, React.ElementType> = {
    video: Play,
    reading: FileText,
    practice: BookOpen,
    'vm-lab': Terminal,
};
// Helper to compare IDs regardless of string/number type
function isSameId(
    id1: string | number | undefined,
    id2: string | number | undefined,
): boolean {
    if (id1 === undefined || id2 === undefined) return false;
    return String(id1) === String(id2);
}
function isLessonCompleted(
    lessonId: string | number,
    completedIds: (string | number)[],
): boolean {
    return completedIds.some((id) => isSameId(id, lessonId));
}
interface LessonSidebarProps {
    modules: Course['modules'];
    currentLessonId: string | number;
    completedLessonIds: (string | number)[];
    courseId: number;
    totalLessons: number;
    completedCount: number;
}
function LessonSidebar({
    modules,
    currentLessonId,
    completedLessonIds,
    courseId,
    totalLessons,
    completedCount,
}: LessonSidebarProps) {
    const progressPercentage =
        totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;
    // Find which module contains the current lesson and default open it
    const currentModuleIndex =
        modules?.findIndex((m) =>
            m.lessons.some((l) => isSameId(l.id, currentLessonId)),
        ) ?? 0;
    const [openModules, setOpenModules] = useState<Record<number, boolean>>(
        () => {
            // Default: open the module containing current lesson
            const initial: Record<number, boolean> = {};
            modules?.forEach((_, idx) => {
                initial[idx] = idx === currentModuleIndex;
            });
            return initial;
        },
    );
    const toggleModule = (index: number) => {
        setOpenModules((prev) => ({ ...prev, [index]: !prev[index] }));
    };
    return (
        <div className="flex h-full flex-col border-r border-border bg-card">
            {/* Header with progress */}
            <div className="space-y-3 border-b border-border p-4">
                <h3 className="font-heading text-sm font-semibold text-foreground">
                    Course Content
                </h3>
                <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                            {completedCount}/{totalLessons}
                        </span>
                        <span>{Math.round(progressPercentage)}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-1.5" />
                </div>
            </div>
            {/* Scrollable content with collapsible modules */}
            <div className="flex-1 overflow-y-auto">
                {modules?.map((module, mi) => {
                    const moduleCompleted = module.lessons.every((l) =>
                        isLessonCompleted(l.id, completedLessonIds),
                    );
                    const moduleLessonsCompleted = module.lessons.filter((l) =>
                        isLessonCompleted(l.id, completedLessonIds),
                    ).length;
                    return (
                        <Collapsible
                            key={module.id}
                            open={openModules[mi]}
                            onOpenChange={() => toggleModule(mi)}
                        >
                            {/* Collapsible Module header */}
                            <CollapsibleTrigger className="w-full">
                                <div className="flex cursor-pointer items-center justify-between border-b border-border bg-muted/50 px-4 py-3 transition-colors hover:bg-muted/70">
                                    <div className="flex-1 text-left">
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                Module {mi + 1}
                                            </p>
                                            {moduleCompleted && (
                                                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                                            )}
                                        </div>
                                        <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
                                            {module.title}
                                        </p>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            {moduleLessonsCompleted}/
                                            {module.lessons.length} lessons
                                        </p>
                                    </div>
                                    <ChevronDown
                                        className={cn(
                                            'h-4 w-4 text-muted-foreground transition-transform duration-200',
                                            openModules[mi] && 'rotate-180',
                                        )}
                                    />
                                </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                {/* Lessons list */}
                                <ul className="py-1">
                                    {module.lessons.map((lesson) => {
                                        const Icon =
                                            lessonIcons[
                                                lesson.type as LessonType
                                            ] || BookOpen;
                                        const isActive = isSameId(
                                            lesson.id,
                                            currentLessonId,
                                        );
                                        const isCompleted = isLessonCompleted(
                                            lesson.id,
                                            completedLessonIds,
                                        );
                                        return (
                                            <li key={lesson.id}>
                                                <Link
                                                    href={`/courses/${courseId}/lesson/${lesson.id}`}
                                                    className={cn(
                                                        'flex items-center gap-3 px-4 py-3 text-sm transition-colors',
                                                        'hover:bg-muted/50',
                                                        isActive &&
                                                            'border-l-2 border-primary bg-primary/10',
                                                        isCompleted &&
                                                            !isActive &&
                                                            'text-muted-foreground',
                                                    )}
                                                >
                                                    {/* Status indicator */}
                                                    <div
                                                        className={cn(
                                                            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border',
                                                            isCompleted
                                                                ? 'border-success bg-success text-success-foreground'
                                                                : isActive
                                                                  ? 'border-primary text-primary'
                                                                  : 'border-border text-muted-foreground',
                                                        )}
                                                    >
                                                        {isCompleted ? (
                                                            <Check className="h-3.5 w-3.5" />
                                                        ) : (
                                                            <Icon className="h-3.5 w-3.5" />
                                                        )}
                                                    </div>
                                                    {/* Lesson info */}
                                                    <div className="min-w-0 flex-1">
                                                        <p
                                                            className={cn(
                                                                'truncate font-medium',
                                                                isActive &&
                                                                    'text-primary',
                                                            )}
                                                        >
                                                            {lesson.title}
                                                        </p>
                                                        <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                                                            {lesson.duration ||
                                                                'N/A'}
                                                            {lesson.vmEnabled && (
                                                                <span className="inline-flex items-center gap-0.5 text-primary">
                                                                    <Terminal className="h-3 w-3" />{' '}
                                                                    VM
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </CollapsibleContent>
                        </Collapsible>
                    );
                })}
            </div>
        </div>
    );
}
interface VMLabPanelProps {
    vmInfo: LessonVMInfo | null;
}
function VMLabPanel({ vmInfo }: VMLabPanelProps) {
    const { sessions, loading: sessionsLoading } = useVMSessions();
    const [launching, setLaunching] = useState(false);
    const activeSessions = sessions.filter((s) => s?.status === 'active');
    const hasActiveSession = activeSessions.length > 0;
    const handleLaunchVM = useCallback(async () => {
        if (!vmInfo) return;
        setLaunching(true);
        try {
            const session = await vmSessionApi.create({
                vmid: vmInfo.template.vmid,
                node_id: vmInfo.template.node?.id ?? 0,
                vm_name: vmInfo.template.name,
                duration_minutes: 60,
                use_existing: false, // Always clone from template
            });
            if (session?.id) {
                router.visit(`/sessions/${session.id}`);
            }
        } catch (e) {
            console.error('Failed to launch VM:', e);
            courseToasts.error('Failed to start VM session');
        } finally {
            setLaunching(false);
        }
    }, [vmInfo]);
    if (sessionsLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center gap-2 py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="text-muted-foreground">
                        Loading VM lab...
                    </span>
                </CardContent>
            </Card>
        );
    }
    // User has an active session - show link to it
    if (hasActiveSession) {
        const session = activeSessions[0];
        return (
            <Card className="border-primary/30">
                <CardContent className="py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <Terminal className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium text-foreground">
                                    VM Session Active
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    VM #{session.vm_id} · {session.node_name}
                                </p>
                            </div>
                        </div>
                        <Button
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                            asChild
                        >
                            <Link href={`/sessions/${session.id}`}>
                                Open Session{' '}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }
    // No approved VM template for this lesson
    if (!vmInfo) {
        return (
            <Card>
                <CardContent className="py-6">
                    <div className="mb-4 flex items-center gap-2">
                        <Terminal className="h-5 w-5 text-muted-foreground" />
                        <h4 className="font-medium text-foreground">
                            Virtual Machine
                        </h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        No VM has been assigned to this lesson yet. The
                        instructor will assign a VM template that an
                        administrator must approve.
                    </p>
                </CardContent>
            </Card>
        );
    }
    const { template, queue_status, can_start, my_position } = vmInfo;
    // Template is in maintenance or unavailable
    if (!template.is_available) {
        return (
            <Card>
                <CardContent className="py-6">
                    <div className="mb-4 flex items-center gap-2">
                        <Terminal className="h-5 w-5 text-amber-500" />
                        <h4 className="font-medium text-foreground">
                            {template.name}
                        </h4>
                    </div>
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                        This VM is currently in maintenance. Please try again
                        later.
                    </p>
                </CardContent>
            </Card>
        );
    }
    return (
        <Card>
            <CardContent className="py-6">
                <div className="mb-4 flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-primary" />
                    <h4 className="font-medium text-foreground">
                        {template.name}
                    </h4>
                </div>
                {template.description && (
                    <p className="mb-4 text-sm text-muted-foreground">
                        {template.description}
                    </p>
                )}
                {/* Queue status */}
                {queue_status.in_use && (
                    <div className="mb-4 rounded-lg bg-muted/50 p-3">
                        <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                                Currently in use by {queue_status.current_user}
                            </span>
                        </div>
                        {queue_status.queue_count > 0 && (
                            <div className="mt-1 flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                    {queue_status.queue_count} in queue
                                    {queue_status.estimated_wait_minutes && (
                                        <>
                                            {' '}
                                            · ~
                                            {
                                                queue_status.estimated_wait_minutes
                                            }{' '}
                                            min wait
                                        </>
                                    )}
                                </span>
                            </div>
                        )}
                        {my_position !== null && my_position > 0 && (
                            <p className="mt-2 text-sm text-primary">
                                You are #{my_position} in the queue
                            </p>
                        )}
                    </div>
                )}
                <Button
                    onClick={handleLaunchVM}
                    disabled={launching || !can_start}
                    className="w-full"
                >
                    {launching ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Starting...
                        </>
                    ) : can_start ? (
                        <>
                            <Play className="mr-2 h-4 w-4" />
                            Start VM Session
                        </>
                    ) : (
                        <>
                            <Clock className="mr-2 h-4 w-4" />
                            Join Queue
                        </>
                    )}
                </Button>
                {template.os_type && (
                    <p className="mt-2 text-center text-xs text-muted-foreground">
                        {template.os_type} ·{' '}
                        {template.protocol?.toUpperCase() || 'RDP'}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
interface PageProps {
    course: Course;
    lesson: Lesson;
    completedLessonIds: (string | number)[];
    vmInfo: LessonVMInfo | null;
    article?: Article | null;
}
export default function LessonPage() {
    const pageProps = usePage<{ props: PageProps }>()
        .props as unknown as PageProps;
    const {
        course,
        lesson,
        completedLessonIds: initialCompleted,
        vmInfo,
        article,
    } = pageProps;
    const [completedLessonIds, setCompletedLessonIds] = useState<
        (string | number)[]
    >(initialCompleted || []);
    const [markingComplete, setMarkingComplete] = useState(false);
    const [_showNewThread, setShowNewThread] = useState(false);
    // Forum hook for lesson discussions (must be before any conditional returns)
    const {
        threads,
        upvoteThread,
    } = useForum({
        lessonId: lesson?.id ? Number(lesson.id) : undefined,
        autoFetch: !!lesson?.id,
    });
    // Sync completedLessonIds with server data when props change (e.g., navigation)
    useEffect(() => {
        setCompletedLessonIds(initialCompleted || []);
    }, [initialCompleted]);
    const allLessons = useMemo(() => {
        if (!course?.modules) return [];
        return course.modules.flatMap((m) => m.lessons);
    }, [course]);
    const totalLessons = allLessons.length;
    const completedCount = completedLessonIds.length;
    const currentIndex = allLessons.findIndex((l) =>
        isSameId(l.id, lesson?.id),
    );
    const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    const nextLesson =
        currentIndex < allLessons.length - 1
            ? allLessons[currentIndex + 1]
            : null;
    const isCurrentLessonCompleted = isLessonCompleted(
        lesson?.id,
        completedLessonIds,
    );
    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: 'Courses', href: '/courses' },
            {
                title: course?.title ?? 'Course',
                href: `/courses/${course?.id}`,
            },
            {
                title: lesson?.title ?? 'Lesson',
                href: `/courses/${course?.id}/lesson/${lesson?.id}`,
            },
        ],
        [course, lesson],
    );
    const handleMarkComplete = useCallback(async () => {
        if (!course?.id || !lesson?.id) return;
        setMarkingComplete(true);
        try {
            await courseApi.markLessonComplete(course.id, Number(lesson.id));
            // Update local state
            if (!isCurrentLessonCompleted) {
                setCompletedLessonIds((prev) => [...prev, lesson.id]);
                courseToasts.lessonCompleted(lesson.title);
                // Check if course is now completed
                const newCompletedCount = completedCount + 1;
                if (newCompletedCount === totalLessons) {
                    courseToasts.courseCompleted(course.title);
                }
            }
        } catch (e) {
            console.error('Failed to mark lesson complete:', e);
            courseToasts.error('Failed to mark lesson as complete');
        } finally {
            setMarkingComplete(false);
        }
    }, [
        course?.id,
        course?.title,
        lesson?.id,
        lesson?.title,
        isCurrentLessonCompleted,
        completedCount,
        totalLessons,
    ]);
    const handleMarkIncomplete = useCallback(async () => {
        if (!course?.id || !lesson?.id) return;
        setMarkingComplete(true);
        try {
            await courseApi.markLessonIncomplete(course.id, Number(lesson.id));
            // Update local state
            setCompletedLessonIds((prev) =>
                prev.filter((id) => !isSameId(id, lesson.id)),
            );
        } catch (e) {
            console.error('Failed to mark lesson incomplete:', e);
        } finally {
            setMarkingComplete(false);
        }
    }, [course?.id, lesson?.id]);
    if (!course || !lesson) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Lesson Not Found" />
                <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 p-6">
                    <BookOpen className="h-12 w-12 text-muted-foreground/40" />
                    <p className="text-lg text-muted-foreground">
                        Lesson not found.
                    </p>
                    <Button variant="outline" asChild>
                        <Link href="/courses">Back to Courses</Link>
                    </Button>
                </div>
            </AppLayout>
        );
    }
    const TypeIcon = lessonIcons[lesson.type as LessonType] || BookOpen;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${lesson.title} - ${course.title}`} />
            <div className="flex h-full flex-1">
                {/* Desktop Sidebar - Sticky */}
                <div className="sticky top-0 hidden h-screen w-80 shrink-0 overflow-y-auto lg:block">
                    <LessonSidebar
                        modules={course.modules}
                        currentLessonId={lesson.id}
                        completedLessonIds={completedLessonIds}
                        courseId={course.id}
                        totalLessons={totalLessons}
                        completedCount={completedCount}
                    />
                </div>
                {/* Main Content */}
                <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
                    {/* Top bar with progress and mobile menu - Sticky */}
                    <div className="sticky top-0 z-40 flex shrink-0 items-center justify-between gap-3 border-b border-border bg-background/95 px-6 py-3 backdrop-blur-lg">
                        <div className="flex items-center gap-3">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="lg:hidden"
                                    >
                                        <Menu className="h-4 w-4" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-80 p-0">
                                    <LessonSidebar
                                        modules={course.modules}
                                        currentLessonId={lesson.id}
                                        completedLessonIds={completedLessonIds}
                                        courseId={course.id}
                                        totalLessons={totalLessons}
                                        completedCount={completedCount}
                                    />
                                </SheetContent>
                            </Sheet>
                            <Link
                                href={`/courses/${course.id}`}
                                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">
                                    {course.title}
                                </span>
                                <span className="sm:hidden">Back</span>
                            </Link>
                        </div>
                        {/* Progress indicator in top bar */}
                        <div className="hidden items-center gap-3 text-sm sm:flex">
                            <span className="text-muted-foreground">
                                {currentIndex + 1}/{totalLessons}
                            </span>
                            <Progress
                                value={(completedCount / totalLessons) * 100}
                                className="h-2 w-24"
                            />
                            <span className="font-medium text-muted-foreground">
                                {Math.round(
                                    (completedCount / totalLessons) * 100,
                                )}
                                %
                            </span>
                        </div>
                    </div>
                    <div className="min-w-0 flex-1 overflow-y-auto">
                        <div className="mx-auto max-w-4xl px-6 py-8">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={lesson.id}
                            >
                                {/* Lesson Header */}
                                <div className="mb-6 flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <TypeIcon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs tracking-wide text-muted-foreground uppercase">
                                                {lesson.type.replace('-', ' ')}{' '}
                                                · {lesson.duration || 'N/A'}
                                            </p>
                                            <h1 className="font-heading text-2xl font-bold text-foreground">
                                                {lesson.title}
                                            </h1>
                                        </div>
                                    </div>
                                    {/* Mark Complete Button */}
                                    <Button
                                        variant={
                                            isCurrentLessonCompleted
                                                ? 'outline'
                                                : 'default'
                                        }
                                        size="sm"
                                        onClick={
                                            isCurrentLessonCompleted
                                                ? handleMarkIncomplete
                                                : handleMarkComplete
                                        }
                                        disabled={markingComplete}
                                        className={cn(
                                            'shrink-0',
                                            isCurrentLessonCompleted &&
                                                'border-success text-success hover:bg-success/10',
                                        )}
                                    >
                                        {markingComplete ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : isCurrentLessonCompleted ? (
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                        ) : (
                                            <Circle className="mr-2 h-4 w-4" />
                                        )}
                                        {isCurrentLessonCompleted
                                            ? 'Completed'
                                            : 'Mark Complete'}
                                    </Button>
                                </div>
                                {/* Video Player */}
                                {lesson.type === 'video' && lesson.videoUrl && (
                                    <div className="mb-8">
                                        <VideoPlayer
                                            src={lesson.videoUrl}
                                            title={lesson.title}
                                            onComplete={() => {
                                                // Auto-mark as complete when video finishes
                                                if (
                                                    !completedLessonIds.some(
                                                        (id) =>
                                                            isSameId(
                                                                id,
                                                                lesson.id,
                                                            ),
                                                    )
                                                ) {
                                                    handleMarkComplete();
                                                }
                                            }}
                                        />
                                    </div>
                                )}
                                {/* Video placeholder when no URL */}
                                {lesson.type === 'video' && !lesson.videoUrl && (
                                    <div className="mb-8 flex aspect-video items-center justify-center rounded-lg bg-slate-900">
                                        <div className="text-center">
                                            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                                                <Play className="h-8 w-8 text-primary" />
                                            </div>
                                            <p className="text-sm text-white/60">
                                                Video not available
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {/* Article Content */}
                                {lesson.type === 'reading' && article && (
                                    <div className="mb-8">
                                        <ArticleReader article={article} />
                                    </div>
                                )}
                                {/* Lesson Content */}
                                <Card className="mb-8">
                                    <CardContent className="py-6">
                                        {lesson.content ? (
                                            <p className="leading-relaxed whitespace-pre-line text-foreground">
                                                {lesson.content}
                                            </p>
                                        ) : (
                                            <p className="text-muted-foreground italic">
                                                No content has been added for
                                                this lesson yet.
                                            </p>
                                        )}
                                        {/* Learning Objectives */}
                                        {lesson.objectives &&
                                            lesson.objectives.length > 0 && (
                                                <div className="mt-6 border-t border-border pt-6">
                                                    <h3 className="mb-3 font-heading text-lg font-semibold text-foreground">
                                                        Learning Objectives
                                                    </h3>
                                                    <ul className="space-y-2">
                                                        {lesson.objectives.map(
                                                            (obj, i) => (
                                                                <li
                                                                    key={i}
                                                                    className="flex items-start gap-2 text-sm text-muted-foreground"
                                                                >
                                                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                                                                    {obj}
                                                                </li>
                                                            ),
                                                        )}
                                                    </ul>
                                                </div>
                                            )}
                                        {/* Resources */}
                                        {lesson.resources &&
                                            lesson.resources.length > 0 && (
                                                <div className="mt-6 border-t border-border pt-6">
                                                    <h3 className="mb-3 font-heading text-lg font-semibold text-foreground">
                                                        Resources
                                                    </h3>
                                                    <ul className="space-y-2">
                                                        {lesson.resources.map(
                                                            (res, i) => (
                                                                <li key={i}>
                                                                    <a
                                                                        href={
                                                                            res
                                                                        }
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                                                                    >
                                                                        <ExternalLink className="h-3.5 w-3.5" />{' '}
                                                                        {res}
                                                                    </a>
                                                                </li>
                                                            ),
                                                        )}
                                                    </ul>
                                                </div>
                                            )}
                                    </CardContent>
                                </Card>
                                {/* VM Lab Panel */}
                                {(lesson.vmEnabled ||
                                    lesson.type === 'vm-lab') && (
                                    <div className="mb-8">
                                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                                            <Terminal className="h-5 w-5 text-primary" />
                                            Virtual Machine Lab
                                        </h3>
                                        <VMLabPanel vmInfo={vmInfo ?? null} />
                                    </div>
                                )}
                                {/* Discussion Forum Section */}
                                <div className="mb-8">
                                    <Card>
                                        <CardContent className="pt-6">
                                            <ThreadList
                                                threads={threads}
                                                onNewThread={() =>
                                                    setShowNewThread(true)
                                                }
                                                onUpvote={(threadId) =>
                                                    upvoteThread(threadId)
                                                }
                                                showNewButton={true}
                                                emptyTitle="No discussions yet"
                                                emptyDescription="Be the first to ask a question or start a discussion about this lesson!"
                                            />
                                        </CardContent>
                                    </Card>
                                </div>
                                {/* Navigation */}
                                <div className="flex items-center justify-between border-t border-border pt-6">
                                    {prevLesson ? (
                                        <Button variant="outline" asChild>
                                            <Link
                                                href={`/courses/${course.id}/lesson/${prevLesson.id}`}
                                            >
                                                <ArrowLeft className="mr-2 h-4 w-4" />{' '}
                                                Previous
                                            </Link>
                                        </Button>
                                    ) : (
                                        <div />
                                    )}
                                    {nextLesson ? (
                                        <Button
                                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                                            asChild
                                        >
                                            <Link
                                                href={`/courses/${course.id}/lesson/${nextLesson.id}`}
                                            >
                                                Next{' '}
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button
                                            className="bg-success text-success-foreground hover:bg-success/90"
                                            asChild
                                        >
                                            <Link
                                                href={`/courses/${course.id}`}
                                            >
                                                <CheckCircle2 className="mr-2 h-4 w-4" />{' '}
                                                Complete Course
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Notes Panel - Fixed sidebar */}
            <NotesPanel lessonId={Number(lesson.id)} />
        </AppLayout>
    );
}

