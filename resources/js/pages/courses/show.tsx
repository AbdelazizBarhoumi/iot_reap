/**
 * Course Detail Page
 * Shows course modules and lessons with VM lab integration.
 * Uses unified AppLayout.
 */

import { Head, Link, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    Clock,
    FileText,
    GraduationCap,
    Loader2,
    Lock,
    Play,
    Star,
    Terminal,
    UserPlus,
    Users,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import React from 'react';
import { courseApi } from '@/api/course.api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Course, CourseProgress } from '@/types/course.types';

const lessonIcons: Record<string, React.ElementType> = {
    video: Play,
    reading: FileText,
    practice: BookOpen,
    'vm-lab': Terminal,
};

interface PageProps {
    course: Course;
    isEnrolled: boolean;
    progress: CourseProgress | null;
    completedLessonIds: (string | number)[];
    auth: { user: { id: number } | null };
}

export default function CourseDetailPage() {
    const pageProps = usePage<{ props: PageProps }>().props as unknown as PageProps;
    const { course, isEnrolled: initialEnrolled, progress: initialProgress, completedLessonIds: initialCompleted, auth } = pageProps;
    
    const [isEnrolled, setIsEnrolled] = useState(initialEnrolled);
    const [progress, setProgress] = useState(initialProgress);
    const [completedLessonIds, setCompletedLessonIds] = useState<(string | number)[]>(initialCompleted || []);
    const [enrolling, setEnrolling] = useState(false);
    const [enrollError, setEnrollError] = useState<string | null>(null);

    // Sync state with server data when props change (e.g., page revisit)
    useEffect(() => {
        setIsEnrolled(initialEnrolled);
        setProgress(initialProgress);
        setCompletedLessonIds(initialCompleted || []);
    }, [initialEnrolled, initialProgress, initialCompleted]);

    const isAuthenticated = !!auth?.user;

    const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
        { title: 'Courses', href: '/courses' },
        { title: course?.title ?? 'Course', href: `/courses/${course?.id}` },
    ], [course]);

    const handleEnroll = useCallback(async () => {
        if (!course?.id) return;
        
        setEnrolling(true);
        setEnrollError(null);
        
        try {
            await courseApi.enroll(course.id);
            setIsEnrolled(true);
            setProgress({ completed: 0, total: course.modules?.reduce((a, m) => a + m.lessons.length, 0) ?? 0, percentage: 0 });
            // Refresh the page to get updated data
            router.reload({ only: ['isEnrolled', 'progress', 'completedLessonIds'] });
        } catch (e) {
            setEnrollError(e instanceof Error ? e.message : 'Failed to enroll');
        } finally {
            setEnrolling(false);
        }
    }, [course?.id, course?.modules]);

    if (!course) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Course Not Found" />
                <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 p-6">
                    <GraduationCap className="h-12 w-12 text-muted-foreground/40" />
                    <p className="text-muted-foreground text-lg">Course not found.</p>
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

    const totalLessons = course.modules?.reduce((a, m) => a + m.lessons.length, 0) ?? 0;
    const completedLessonsCount = completedLessonIds?.length ?? 0;
    const progressPercentage = progress?.percentage ?? (totalLessons > 0 ? (completedLessonsCount / totalLessons) * 100 : 0);
    const firstLessonId = course.modules?.[0]?.lessons[0]?.id;

    // Helper to check if a lesson is completed (handles string/number mismatch)
    const isLessonCompleted = (lessonId: string | number) => {
        return completedLessonIds?.some(id => String(id) === String(lessonId)) ?? false;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={course.title} />
            <div className="min-h-screen bg-background">
                {/* Course Header - Hero Section */}
                <div className="bg-hero-gradient">
                    <div className="container py-12">
                        <Link
                            href="/courses"
                            className="inline-flex items-center gap-1 text-sm text-secondary-foreground/60 hover:text-secondary-foreground mb-4"
                        >
                            <ArrowLeft className="h-4 w-4" /> Back to courses
                        </Link>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-3xl"
                        >
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                <Badge className="bg-primary/20 text-primary border-primary/30">
                                    {course.category}
                                </Badge>
                                <Badge variant="outline" className="border-secondary-foreground/20 text-secondary-foreground/70">
                                    {course.level}
                                </Badge>
                                {course.hasVirtualMachine && (
                                    <Badge className="bg-secondary-foreground/10 text-secondary-foreground border-secondary-foreground/20">
                                        <Terminal className="mr-1 h-3 w-3" /> VM Labs
                                    </Badge>
                                )}
                            </div>
                            <h1 className="font-heading text-3xl font-bold text-secondary-foreground md:text-4xl">
                                {course.title}
                            </h1>
                            <p className="mt-4 text-secondary-foreground/70 max-w-2xl">
                                {course.description}
                            </p>
                            <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-secondary-foreground/60">
                                <span>By {course.instructor}</span>
                                <span className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-warning text-warning" />
                                    {course.rating}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    {course.students.toLocaleString()} students
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {course.duration}
                                </span>
                            </div>

                            {/* CTA Buttons */}
                            <div className="mt-8 flex flex-wrap items-center gap-4">
                                {!isAuthenticated ? (
                                    // Not logged in
                                    <Button
                                        size="lg"
                                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                                        asChild
                                    >
                                        <Link href="/login">
                                            <Lock className="mr-2 h-4 w-4" />
                                            Login to Enroll
                                        </Link>
                                    </Button>
                                ) : !isEnrolled ? (
                                    // Logged in but not enrolled
                                    <Button
                                        size="lg"
                                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                                        onClick={handleEnroll}
                                        disabled={enrolling}
                                    >
                                        {enrolling ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Enrolling...
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="mr-2 h-4 w-4" />
                                                Enroll Now - Free
                                            </>
                                        )}
                                    </Button>
                                ) : (
                                    // Enrolled - show continue/start button
                                    <Button
                                        size="lg"
                                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                                        asChild
                                    >
                                        <Link href={`/courses/${course.id}/lesson/${firstLessonId}`}>
                                            <Play className="mr-2 h-4 w-4" />
                                            {progressPercentage > 0 ? 'Continue Learning' : 'Start Course'}
                                        </Link>
                                    </Button>
                                )}

                                {/* Enrolled indicator */}
                                {isEnrolled && (
                                    <Badge className="bg-success/20 text-success border-success/30 text-sm py-1.5 px-3">
                                        <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                        Enrolled
                                    </Badge>
                                )}
                            </div>

                            {/* Error message */}
                            {enrollError && (
                                <p className="mt-3 text-sm text-destructive">{enrollError}</p>
                            )}

                            {/* Progress bar for enrolled users */}
                            {isEnrolled && progressPercentage > 0 && (
                                <div className="mt-6 max-w-sm">
                                    <div className="flex justify-between text-xs text-secondary-foreground/50 mb-1">
                                        <span>
                                            {completedLessonsCount}/{totalLessons} lessons completed
                                        </span>
                                        <span>{Math.round(progressPercentage)}%</span>
                                    </div>
                                    <Progress value={progressPercentage} className="h-2 bg-secondary-foreground/10" />
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>

                {/* Course Content */}
                <div className="container py-12">
                    <h2 className="font-heading text-2xl font-bold text-foreground mb-6">
                        Course Content
                    </h2>
                    <p className="text-sm text-muted-foreground mb-8">
                        {course.modules?.length ?? 0} modules · {totalLessons} lessons ·{' '}
                        {course.duration}
                    </p>
                    <div className="space-y-4">
                        {course.modules?.map((module, mi) => (
                            <motion.div
                                key={module.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: mi * 0.1 }}
                            >
                                <div className="rounded-lg border border-border bg-card overflow-hidden">
                                    <div className="px-5 py-4 bg-muted/30 border-b border-border">
                                        <h3 className="font-heading font-semibold text-foreground">
                                            <span className="text-muted-foreground mr-2">
                                                Module {mi + 1}:
                                            </span>
                                            {module.title}
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {module.lessons.length} lessons
                                        </p>
                                    </div>
                                    <ul className="divide-y divide-border">
                                        {module.lessons.map((lesson) => {
                                            const Icon = lessonIcons[lesson.type] || BookOpen;
                                            const completed = isLessonCompleted(lesson.id);
                                            const canAccess = isEnrolled;

                                            return (
                                                <li key={lesson.id}>
                                                    {canAccess ? (
                                                        <Link
                                                            href={`/courses/${course.id}/lesson/${lesson.id}`}
                                                            className="flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors"
                                                        >
                                                            <div
                                                                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                                                    completed
                                                                        ? 'bg-success text-success-foreground'
                                                                        : 'bg-muted text-muted-foreground'
                                                                }`}
                                                            >
                                                                {completed ? (
                                                                    <CheckCircle2 className="h-4 w-4" />
                                                                ) : (
                                                                    <Icon className="h-4 w-4" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium text-foreground">
                                                                    {lesson.title}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground capitalize flex items-center gap-2">
                                                                    {lesson.type.replace('-', ' ')} ·{' '}
                                                                    {lesson.duration}
                                                                    {lesson.vmEnabled && (
                                                                        <span className="text-primary flex items-center gap-0.5">
                                                                            <Terminal className="h-3 w-3" />{' '}
                                                                            VM Lab
                                                                        </span>
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </Link>
                                                    ) : (
                                                        <div className="flex items-center gap-4 px-5 py-3 opacity-60">
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                                                <Lock className="h-4 w-4" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium text-foreground">
                                                                    {lesson.title}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground capitalize flex items-center gap-2">
                                                                    {lesson.type.replace('-', ' ')} ·{' '}
                                                                    {lesson.duration}
                                                                    {lesson.vmEnabled && (
                                                                        <span className="text-primary flex items-center gap-0.5">
                                                                            <Terminal className="h-3 w-3" />{' '}
                                                                            VM Lab
                                                                        </span>
                                                                    )}
                                                                </p>
                                                            </div>
                                                            <Badge variant="outline" className="text-xs">
                                                                Enroll to access
                                                            </Badge>
                                                        </div>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
