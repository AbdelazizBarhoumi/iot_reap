/**
 * Course Detail Page
 * Shows course modules and lessons with VM lab integration.
 * Professional design with animations and enrollment flow.
 */
import { Head, Link, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    ArrowRight,
    Award,
    BookOpen,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Clock,
    FileText,
    GraduationCap,
    Lock,
    MessageSquare,
    Play,
    Sparkles,
    Star,
    Target,
    Terminal,
    Trophy,
    UserPlus,
    Users,
    Zap,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import React from 'react';
import { courseApi } from '@/api/course.api';
import { CertificateClaimPrompt } from '@/components/certificates/CertificateClaimPrompt';
import { ThreadList } from '@/components/forum/ThreadList';
import { ReviewSection } from '@/components/reviews/ReviewSection';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForum } from '@/hooks/useForum';
import AppLayout from '@/layouts/app-layout';
import { courseToasts } from '@/lib/toast-utils';
import type { BreadcrumbItem } from '@/types';
import type { Course, CourseProgress } from '@/types/course.types';
const lessonIcons: Record<string, React.ElementType> = {
    video: Play,
    reading: FileText,
    practice: BookOpen,
    'vm-lab': Terminal,
    quiz: Target,
};
const lessonColors: Record<string, string> = {
    video: 'bg-blue-500/10 text-blue-500',
    reading: 'bg-amber-500/10 text-amber-500',
    practice: 'bg-emerald-500/10 text-emerald-500',
    'vm-lab': 'bg-violet-500/10 text-violet-500',
    quiz: 'bg-rose-500/10 text-rose-500',
};
interface PageProps {
    course: Course;
    isEnrolled: boolean;
    progress: CourseProgress | null;
    completedLessonIds: (string | number)[];
    auth: { user: { id: number } | null };
}
export default function CourseDetailPage() {
    const pageProps = usePage<{ props: PageProps }>()
        .props as unknown as PageProps;
    const {
        course,
        isEnrolled: initialEnrolled,
        progress: initialProgress,
        completedLessonIds: initialCompleted,
        auth,
    } = pageProps;
    const [isEnrolled, setIsEnrolled] = useState(initialEnrolled);
    const [progress, setProgress] = useState(initialProgress);
    const [completedLessonIds, setCompletedLessonIds] = useState<
        (string | number)[]
    >(initialCompleted || []);
    const [enrolling, setEnrolling] = useState(false);
    const [enrollError, setEnrollError] = useState<string | null>(null);
    const [showEnrollDialog, setShowEnrollDialog] = useState(false);
    const [expandedModules, setExpandedModules] = useState<
        Set<string | number>
    >(new Set());
    const [activeTab, setActiveTab] = useState('curriculum');
    const [showCertificatePrompt, setShowCertificatePrompt] = useState(false);
    // Forum hook for course-level discussions
    const {
        threads,
        loading: _forumLoading,
        upvoteThread,
    } = useForum({
        courseId: course?.id,
        autoFetch: !!course?.id,
    });
    useEffect(() => {
        setIsEnrolled(initialEnrolled);
        setProgress(initialProgress);
        setCompletedLessonIds(initialCompleted || []);
        // Auto-expand first module
        if (course?.modules?.[0]) {
            setExpandedModules(new Set([course.modules[0].id]));
        }
    }, [initialEnrolled, initialProgress, initialCompleted, course]);

    // Auto-show certificate prompt when course is 100% complete
    useEffect(() => {
        if (isEnrolled && progress && progress.percentage === 100) {
            setShowCertificatePrompt(true);
        }
    }, [isEnrolled, progress]);

    const isAuthenticated = !!auth?.user;
    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: 'Courses', href: '/courses' },
            {
                title: course?.title ?? 'Course',
                href: `/courses/${course?.id}`,
            },
        ],
        [course],
    );
    const handleEnroll = useCallback(async () => {
        if (!course?.id) return;
        setEnrolling(true);
        setEnrollError(null);
        try {
            await courseApi.enroll(course.id);
            setIsEnrolled(true);
            setProgress({
                completed: 0,
                total:
                    course.modules?.reduce((a, m) => a + m.lessons.length, 0) ??
                    0,
                percentage: 0,
            });
            courseToasts.enrolled(course.title);
            setShowEnrollDialog(false);
            router.reload({
                only: ['isEnrolled', 'progress', 'completedLessonIds'],
            });
        } catch (e) {
            const errorMsg =
                e instanceof Error ? e.message : 'Failed to enroll';
            setEnrollError(errorMsg);
            courseToasts.error(errorMsg);
        } finally {
            setEnrolling(false);
        }
    }, [course?.id, course?.title, course?.modules]);
    const toggleModule = (moduleId: string | number) => {
        setExpandedModules((prev) => {
            const next = new Set(prev);
            if (next.has(moduleId)) {
                next.delete(moduleId);
            } else {
                next.add(moduleId);
            }
            return next;
        });
    };
    if (!course) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Course Not Found" />
                <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 p-6">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                        <GraduationCap className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <p className="text-lg text-muted-foreground">
                        Course not found.
                    </p>
                    <Button variant="outline" asChild>
                        <Link href="/courses">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Courses
                        </Link>
                    </Button>
                </div>
            </AppLayout>
        );
    }
    const totalLessons =
        course.modules?.reduce((a, m) => a + m.lessons.length, 0) ?? 0;
    const completedLessonsCount = completedLessonIds?.length ?? 0;
    const progressPercentage =
        progress?.percentage ??
        (totalLessons > 0 ? (completedLessonsCount / totalLessons) * 100 : 0);
    const firstLessonId = course.modules?.[0]?.lessons[0]?.id;
    const isLessonCompleted = (lessonId: string | number) => {
        return (
            completedLessonIds?.some((id) => String(id) === String(lessonId)) ??
            false
        );
    };
    // Calculate module completion
    const getModuleProgress = (module: {
        lessons: { id: string | number }[];
    }) => {
        const completed = module.lessons.filter((l) =>
            isLessonCompleted(l.id),
        ).length;
        return {
            completed,
            total: module.lessons.length,
            percentage:
                module.lessons.length > 0
                    ? (completed / module.lessons.length) * 100
                    : 0,
        };
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={course.title} />
            <div className="min-h-screen bg-background">
                {/* Hero Section */}
                <div className="bg-hero-gradient relative overflow-hidden">
                    {/* Background pattern */}
                    <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                            backgroundSize: '32px 32px',
                        }}
                    />
                    <div className="relative container py-12 md:py-16">
                        <Link
                            href="/courses"
                            className="mb-6 inline-flex items-center gap-1 text-sm text-white/60 transition-colors hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" /> Back to courses
                        </Link>
                        <div className="grid gap-8 lg:grid-cols-3">
                            {/* Left: Course info */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="lg:col-span-2"
                            >
                                <div className="mb-4 flex flex-wrap items-center gap-2">
                                    <Badge className="border-white/20 bg-white/10 text-white backdrop-blur-sm">
                                        {course.category}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="border-white/20 text-white/80"
                                    >
                                        {course.level}
                                    </Badge>
                                    {course.hasVirtualMachine && (
                                        <Badge className="border-violet-400/30 bg-violet-500/20 text-violet-200">
                                            <Terminal className="mr-1 h-3 w-3" />{' '}
                                            VM Labs Included
                                        </Badge>
                                    )}
                                </div>
                                <h1 className="mb-4 font-heading text-3xl leading-tight font-bold text-white md:text-4xl lg:text-5xl">
                                    {course.title}
                                </h1>
                                <p className="mb-6 max-w-2xl text-lg text-white/70">
                                    {course.description}
                                </p>
                                {/* Stats row */}
                                <div className="mb-8 flex flex-wrap items-center gap-6 text-sm text-white/70">
                                    <span className="flex items-center gap-1.5">
                                        <div className="flex items-center gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-4 w-4 ${i < Math.floor(course.rating) ? 'fill-amber-400 text-amber-400' : 'fill-white/20 text-white/20'}`}
                                                />
                                            ))}
                                        </div>
                                        <span className="font-medium text-white">
                                            {course.rating}
                                        </span>
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Users className="h-4 w-4" />
                                        {course.students.toLocaleString()}{' '}
                                        enrolled
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="h-4 w-4" />
                                        {course.duration}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <BookOpen className="h-4 w-4" />
                                        {totalLessons} lessons
                                    </span>
                                </div>
                                {/* Instructor */}
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                                        <GraduationCap className="h-5 w-5 text-white/80" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-white/70">
                                            Instructor
                                        </p>
                                        <p className="text-sm font-medium text-white">
                                            {course.instructor}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                            {/* Right: Enrollment Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="lg:col-span-1"
                            >
                                <Card className="sticky top-24 overflow-hidden border-0 shadow-2xl">
                                    {/* Progress header for enrolled users */}
                                    {isEnrolled && (
                                        <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-4">
                                            <div className="mb-2 flex items-center justify-between text-white">
                                                <span className="text-sm font-medium">
                                                    Your Progress
                                                </span>
                                                <span className="text-lg font-bold">
                                                    {Math.round(
                                                        progressPercentage,
                                                    )}
                                                    %
                                                </span>
                                            </div>
                                            <Progress
                                                value={progressPercentage}
                                                className="h-2 bg-white/20"
                                            />
                                            <p className="mt-2 text-xs text-white/70">
                                                {completedLessonsCount} of{' '}
                                                {totalLessons} lessons completed
                                            </p>
                                        </div>
                                    )}
                                    <CardContent className="p-6">
                                        {/* Price/Free badge */}
                                        <div className="mb-6 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Sparkles className="h-5 w-5 text-primary" />
                                                <span className="text-2xl font-bold text-foreground">
                                                    Free
                                                </span>
                                            </div>
                                            {isEnrolled && (
                                                <Badge className="border-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                                                    Enrolled
                                                </Badge>
                                            )}
                                        </div>
                                        {/* CTA Button */}
                                        {!isAuthenticated ? (
                                            <Button
                                                size="lg"
                                                className="h-12 w-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
                                                asChild
                                            >
                                                <Link href="/login">
                                                    <Lock className="mr-2 h-4 w-4" />
                                                    Login to Enroll
                                                </Link>
                                            </Button>
                                        ) : !isEnrolled ? (
                                            <Button
                                                size="lg"
                                                className="h-12 w-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl"
                                                onClick={() =>
                                                    setShowEnrollDialog(true)
                                                }
                                                disabled={enrolling}
                                            >
                                                <UserPlus className="mr-2 h-4 w-4" />
                                                Enroll Now - Free
                                            </Button>
                                        ) : (
                                            <Button
                                                size="lg"
                                                className="h-12 w-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
                                                asChild
                                            >
                                                <Link
                                                    href={`/courses/${course.id}/lesson/${firstLessonId}`}
                                                >
                                                    <Play className="mr-2 h-4 w-4" />
                                                    {progressPercentage > 0
                                                        ? 'Continue Learning'
                                                        : 'Start Course'}
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        )}
                                        {enrollError && (
                                            <p className="mt-3 text-center text-sm text-destructive">
                                                {enrollError}
                                            </p>
                                        )}
                                        <Separator className="my-6" />
                                        {/* Course includes */}
                                        <div className="space-y-3">
                                            <h4 className="text-sm font-semibold text-foreground">
                                                This course includes:
                                            </h4>
                                            <ul className="space-y-2.5">
                                                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                                                        <Play className="h-4 w-4 text-blue-500" />
                                                    </div>
                                                    {totalLessons} on-demand
                                                    lessons
                                                </li>
                                                {course.hasVirtualMachine && (
                                                    <li className="flex items-center gap-3 text-sm text-muted-foreground">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                                                            <Terminal className="h-4 w-4 text-violet-500" />
                                                        </div>
                                                        Hands-on VM labs
                                                    </li>
                                                )}
                                                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                                                        <Zap className="h-4 w-4 text-emerald-500" />
                                                    </div>
                                                    Lifetime access
                                                </li>
                                                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                                                        <Award className="h-4 w-4 text-amber-500" />
                                                    </div>
                                                    Certificate of completion
                                                </li>
                                            </ul>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                    </div>
                </div>
                {/* Course Content Section */}
                <div className="container py-12">
                    {/* Course Video Section */}
                    {course.video_url && course.video_type && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-12"
                        >
                            <Card className="overflow-hidden border-border/50 shadow-lg">
                                <CardContent className="p-0">
                                    <div className="aspect-video w-full bg-black">
                                        {course.video_type === 'youtube' ? (
                                            <iframe
                                                src={course.video_url}
                                                title="Course introduction video"
                                                className="h-full w-full border-0"
                                                allowFullScreen
                                                loading="lazy"
                                            />
                                        ) : (
                                            <video
                                                src={course.video_url}
                                                controls
                                                className="h-full w-full"
                                                controlsList="nodownload"
                                            />
                                        )}
                                    </div>
                                </CardContent>
                                {course.video_type === 'youtube' && (
                                    <CardContent className="px-6 py-4 border-t border-border/50">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Play className="h-4 w-4" />
                                            <span>YouTube video player</span>
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        </motion.div>
                    )}
                    <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                        <div className="lg:col-span-2">
                            {/* Tabs for Curriculum, Discussions, and Reviews */}
                            <Tabs
                                value={activeTab}
                                onValueChange={setActiveTab}
                                className="w-full"
                            >
                                <TabsList className="mb-6 grid w-full grid-cols-3">
                                    <TabsTrigger
                                        value="curriculum"
                                        className="flex items-center gap-2"
                                    >
                                        <BookOpen className="h-4 w-4" />
                                        Curriculum
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="discussions"
                                        className="flex items-center gap-2"
                                    >
                                        <MessageSquare className="h-4 w-4" />
                                        Discussions
                                        {threads.length > 0 && (
                                            <Badge
                                                variant="secondary"
                                                className="ml-1 px-1.5 py-0 text-xs"
                                            >
                                                {threads.length}
                                            </Badge>
                                        )}
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="reviews"
                                        className="flex items-center gap-2"
                                    >
                                        <Star className="h-4 w-4" />
                                        Reviews
                                    </TabsTrigger>
                                </TabsList>
                                {/* Curriculum Tab */}
                                <TabsContent value="curriculum">
                                    {/* Section header */}
                                    <div className="mb-6 flex items-center justify-between">
                                        <div>
                                            <h2 className="font-heading text-2xl font-bold text-foreground">
                                                Course Curriculum
                                            </h2>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {course.modules?.length ?? 0}{' '}
                                                modules · {totalLessons} lessons
                                                · {course.duration}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                if (
                                                    expandedModules.size ===
                                                    course.modules?.length
                                                ) {
                                                    setExpandedModules(
                                                        new Set(),
                                                    );
                                                } else {
                                                    setExpandedModules(
                                                        new Set(
                                                            course.modules?.map(
                                                                (m) => m.id,
                                                            ) || [],
                                                        ),
                                                    );
                                                }
                                            }}
                                            className="text-muted-foreground"
                                        >
                                            {expandedModules.size ===
                                            course.modules?.length
                                                ? 'Collapse all'
                                                : 'Expand all'}
                                        </Button>
                                    </div>
                                    {/* Modules */}
                                    <div className="space-y-3">
                                        {course.modules?.map((module, mi) => {
                                            const isExpanded =
                                                expandedModules.has(module.id);
                                            const moduleProgress =
                                                getModuleProgress(module);
                                            const isModuleComplete =
                                                moduleProgress.percentage === 100;
                                            return (
                                                <motion.div
                                            key={module.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: mi * 0.05 }}
                                        >
                                            <Card className="overflow-hidden border-border/50">
                                                {/* Module header */}
                                                <button
                                                    onClick={() =>
                                                        toggleModule(module.id)
                                                    }
                                                    className="flex w-full items-center justify-between px-5 py-4 transition-colors hover:bg-muted/30"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div
                                                            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                                                isModuleComplete
                                                                    ? 'bg-emerald-500/10 text-emerald-500'
                                                                    : 'bg-muted text-muted-foreground'
                                                            }`}
                                                        >
                                                            {isModuleComplete ? (
                                                                <Trophy className="h-5 w-5" />
                                                            ) : (
                                                                <span className="font-semibold">
                                                                    {mi + 1}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-left">
                                                            <h3 className="font-heading font-semibold text-foreground">
                                                                {module.title}
                                                            </h3>
                                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                                {
                                                                    module
                                                                        .lessons
                                                                        .length
                                                                }{' '}
                                                                lessons
                                                                {isEnrolled &&
                                                                    moduleProgress.completed >
                                                                        0 && (
                                                                        <span className="ml-2 text-primary">
                                                                            ·{' '}
                                                                            {
                                                                                moduleProgress.completed
                                                                            }
                                                                            /
                                                                            {
                                                                                moduleProgress.total
                                                                            }{' '}
                                                                            completed
                                                                        </span>
                                                                    )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {isEnrolled &&
                                                            moduleProgress.percentage >
                                                                0 && (
                                                                <div className="hidden w-24 sm:block">
                                                                    <Progress
                                                                        value={
                                                                            moduleProgress.percentage
                                                                        }
                                                                        className="h-1.5"
                                                                    />
                                                                </div>
                                                            )}
                                                        {isExpanded ? (
                                                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                                        ) : (
                                                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                </button>
                                                {/* Lessons list */}
                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{
                                                                height: 0,
                                                                opacity: 0,
                                                            }}
                                                            animate={{
                                                                height: 'auto',
                                                                opacity: 1,
                                                            }}
                                                            exit={{
                                                                height: 0,
                                                                opacity: 0,
                                                            }}
                                                            transition={{
                                                                duration: 0.2,
                                                            }}
                                                            className="overflow-hidden"
                                                        >
                                                            <ul className="divide-y divide-border/50 border-t border-border/50">
                                                                {module.lessons.map(
                                                                    (
                                                                        lesson,
                                                                        _li,
                                                                    ) => {
                                                                        const Icon =
                                                                            lessonIcons[
                                                                                lesson
                                                                                    .type
                                                                            ] ||
                                                                            BookOpen;
                                                                        const colorClass =
                                                                            lessonColors[
                                                                                lesson
                                                                                    .type
                                                                            ] ||
                                                                            'bg-muted text-muted-foreground';
                                                                        const completed =
                                                                            isLessonCompleted(
                                                                                lesson.id,
                                                                            );
                                                                        const canAccess =
                                                                            isEnrolled;
                                                                        return (
                                                                            <li
                                                                                key={
                                                                                    lesson.id
                                                                                }
                                                                            >
                                                                                {canAccess ? (
                                                                                    <Link
                                                                                        href={`/courses/${course.id}/lesson/${lesson.id}`}
                                                                                        className="group flex items-center gap-4 px-5 py-3 transition-colors hover:bg-muted/30"
                                                                                    >
                                                                                        <div
                                                                                            className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                                                                                                completed
                                                                                                    ? 'bg-emerald-500/10 text-emerald-500'
                                                                                                    : colorClass
                                                                                            }`}
                                                                                        >
                                                                                            {completed ? (
                                                                                                <CheckCircle2 className="h-4 w-4" />
                                                                                            ) : (
                                                                                                <Icon className="h-4 w-4" />
                                                                                            )}
                                                                                        </div>
                                                                                        <div className="min-w-0 flex-1">
                                                                                            <p
                                                                                                className={`truncate text-sm font-medium ${
                                                                                                    completed
                                                                                                        ? 'text-muted-foreground'
                                                                                                        : 'text-foreground group-hover:text-primary'
                                                                                                } transition-colors`}
                                                                                            >
                                                                                                {
                                                                                                    lesson.title
                                                                                                }
                                                                                            </p>
                                                                                            <div className="mt-0.5 flex items-center gap-2">
                                                                                                <span className="text-xs text-muted-foreground capitalize">
                                                                                                    {lesson.type.replace(
                                                                                                        '-',
                                                                                                        ' ',
                                                                                                    )}
                                                                                                </span>
                                                                                                {lesson.duration && (
                                                                                                    <>
                                                                                                        <span className="text-muted-foreground/50">
                                                                                                            ·
                                                                                                        </span>
                                                                                                        <span className="text-xs text-muted-foreground">
                                                                                                            {
                                                                                                                lesson.duration
                                                                                                            }
                                                                                                        </span>
                                                                                                    </>
                                                                                                )}
                                                                                                {lesson.vmEnabled && (
                                                                                                    <>
                                                                                                        <span className="text-muted-foreground/50">
                                                                                                            ·
                                                                                                        </span>
                                                                                                        <span className="flex items-center gap-0.5 text-xs text-violet-500">
                                                                                                            <Terminal className="h-3 w-3" />{' '}
                                                                                                            VM
                                                                                                        </span>
                                                                                                    </>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                                                                                    </Link>
                                                                                ) : (
                                                                                    <div className="flex items-center gap-4 px-5 py-3 opacity-60">
                                                                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                                                                            <Lock className="h-4 w-4" />
                                                                                        </div>
                                                                                        <div className="min-w-0 flex-1">
                                                                                            <p className="truncate text-sm font-medium text-foreground">
                                                                                                {
                                                                                                    lesson.title
                                                                                                }
                                                                                            </p>
                                                                                            <div className="mt-0.5 flex items-center gap-2">
                                                                                                <span className="text-xs text-muted-foreground capitalize">
                                                                                                    {lesson.type.replace(
                                                                                                        '-',
                                                                                                        ' ',
                                                                                                    )}
                                                                                                </span>
                                                                                                {lesson.duration && (
                                                                                                    <>
                                                                                                        <span className="text-muted-foreground/50">
                                                                                                            ·
                                                                                                        </span>
                                                                                                        <span className="text-xs text-muted-foreground">
                                                                                                            {
                                                                                                                lesson.duration
                                                                                                            }
                                                                                                        </span>
                                                                                                    </>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </li>
                                                                        );
                                                                    },
                                                                )}
                                                            </ul>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </Card>
                                        </motion.div>
                                    );
                                })}
                                    </div>
                                </TabsContent>
                                {/* Discussions Tab */}
                                <TabsContent value="discussions">
                                    <div className="mb-6">
                                        <h2 className="font-heading text-2xl font-bold text-foreground">
                                            Course Discussions
                                        </h2>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Ask questions and discuss topics
                                            with other students
                                        </p>
                                    </div>
                                    <Card>
                                        <CardContent className="pt-6">
                                            <ThreadList
                                                threads={threads}
                                                onUpvote={(threadId) =>
                                                    upvoteThread(threadId)
                                                }
                                                showNewButton={false}
                                                emptyTitle="No discussions yet"
                                                emptyDescription="Start a discussion from any lesson to ask questions or share insights!"
                                            />
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                {/* Reviews Tab */}
                                <TabsContent value="reviews">
                                    <div className="mb-6">
                                        <h2 className="font-heading text-2xl font-bold text-foreground">
                                            Student Reviews
                                        </h2>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {isEnrolled
                                                ? 'Share your experience with other students'
                                                : 'See what other students think about this course'}
                                        </p>
                                    </div>
                                    <ReviewSection courseId={course.id} />
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>
            {/* Enrollment Confirmation Dialog */}
            <ConfirmDialog
                open={showEnrollDialog}
                onOpenChange={setShowEnrollDialog}
                onConfirm={handleEnroll}
                title="Start Your Learning Journey"
                description={`You're about to enroll in "${course?.title}". This course is completely free and you'll have lifetime access to all content.`}
                confirmText={enrolling ? 'Enrolling...' : 'Enroll Now'}
                cancelText="Maybe Later"
                variant="default"
                loading={enrolling}
            />

            {/* Certificate Claim Prompt */}
            <CertificateClaimPrompt
                courseId={course?.id ?? 0}
                courseTitle={course?.title ?? 'Course'}
                open={showCertificatePrompt}
                onOpenChange={setShowCertificatePrompt}
            />
        </AppLayout>
    );
}

