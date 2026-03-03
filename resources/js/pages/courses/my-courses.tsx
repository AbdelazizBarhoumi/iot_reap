/**
 * My Courses Page
 * Shows all enrolled courses for the student with progress tracking.
 * Links to continue learning from where the student left off.
 */

import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    BookOpen,
    CheckCircle2,
    Clock,
    GraduationCap,
    Play,
    Star,
    Terminal,
    TrendingUp,
} from 'lucide-react';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Course, CourseProgress } from '@/types/course.types';

interface EnrollmentData {
    enrollment: {
        id: number;
        enrolled_at: string;
    };
    course: Course;
    progress: CourseProgress;
    completedLessonIds: number[];
}

interface PageProps {
    enrollments: EnrollmentData[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'My Courses', href: '/my-courses' },
];

const levelColors: Record<string, string> = {
    Beginner: 'bg-success/10 text-success border-success/20',
    Intermediate: 'bg-warning/10 text-warning border-warning/20',
    Advanced: 'bg-destructive/10 text-destructive border-destructive/20',
};

function EnrolledCourseCard({ data, index }: { data: EnrollmentData; index: number }) {
    const { course, progress, completedLessonIds } = data;
    
    // Find the next lesson to continue
    const nextLesson = useMemo(() => {
        if (!course.modules) return null;
        for (const module of course.modules) {
            for (const lesson of module.lessons) {
                // Convert to number for comparison since completedLessonIds might be numbers
                const lessonIdNum = typeof lesson.id === 'string' ? parseInt(lesson.id, 10) : lesson.id;
                if (!completedLessonIds.includes(lessonIdNum)) {
                    return lesson;
                }
            }
        }
        // All completed - return last lesson
        const lastModule = course.modules[course.modules.length - 1];
        return lastModule?.lessons[lastModule.lessons.length - 1] ?? null;
    }, [course.modules, completedLessonIds]);

    const isCompleted = progress.percentage >= 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <Card className="group overflow-hidden border-border hover:shadow-card-hover transition-all duration-300">
                {/* Header with category gradient */}
                <div className="h-3 bg-gradient-to-r from-primary/60 to-primary/30" />
                
                <CardContent className="p-5">
                    {/* Course info */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <Badge variant="outline" className={levelColors[course.level]}>
                                    {course.level}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                    {course.category}
                                </Badge>
                                {course.hasVirtualMachine && (
                                    <Badge variant="outline" className="text-xs text-primary border-primary/30">
                                        <Terminal className="mr-1 h-3 w-3" /> VM Labs
                                    </Badge>
                                )}
                            </div>
                            <Link href={`/courses/${course.id}`} className="block">
                                <h3 className="font-heading text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                    {course.title}
                                </h3>
                            </Link>
                            <p className="text-sm text-muted-foreground mt-1">{course.instructor}</p>
                        </div>
                        
                        {/* Completion badge */}
                        {isCompleted && (
                            <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                                <CheckCircle2 className="h-5 w-5 text-success" />
                            </div>
                        )}
                    </div>

                    {/* Progress bar */}
                    <div className="mb-4">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                            <span className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                {progress.completed}/{progress.total} lessons
                            </span>
                            <span className="font-medium">
                                {Math.round(progress.percentage)}%
                            </span>
                        </div>
                        <Progress 
                            value={progress.percentage} 
                            className={`h-2 ${isCompleted ? 'bg-success/20' : 'bg-muted'}`} 
                        />
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-warning text-warning" />
                            {course.rating.toFixed(1)}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {course.duration || 'Self-paced'}
                        </span>
                        <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {course.modules?.length ?? 0} modules
                        </span>
                    </div>
                </CardContent>

                <CardFooter className="p-5 pt-0">
                    {nextLesson ? (
                        <Button
                            className={`w-full ${isCompleted ? 'bg-success text-success-foreground hover:bg-success/90' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
                            asChild
                        >
                            <Link href={`/courses/${course.id}/lesson/${nextLesson.id}`}>
                                {isCompleted ? (
                                    <>
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Review Course
                                    </>
                                ) : (
                                    <>
                                        <Play className="mr-2 h-4 w-4" />
                                        Continue Learning
                                    </>
                                )}
                            </Link>
                        </Button>
                    ) : (
                        <Button variant="outline" className="w-full" asChild>
                            <Link href={`/courses/${course.id}`}>
                                View Course <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </motion.div>
    );
}

function EmptyState() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
        >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
                <GraduationCap className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-2">
                No Enrolled Courses Yet
            </h2>
            <p className="text-muted-foreground mb-6 max-w-sm">
                Start your learning journey by exploring our course catalog and enrolling in courses that interest you.
            </p>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                <Link href="/courses">
                    Browse Courses <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </motion.div>
    );
}

export default function MyCoursesPage() {
    const { enrollments } = usePage<{ props: PageProps }>().props as unknown as PageProps;

    // Calculate overall stats
    const stats = useMemo(() => {
        if (!enrollments || enrollments.length === 0) {
            return { total: 0, inProgress: 0, completed: 0, totalLessons: 0, completedLessons: 0 };
        }

        const completed = enrollments.filter((e) => e.progress.percentage >= 100).length;
        const totalLessons = enrollments.reduce((sum, e) => sum + (e.progress.total || 0), 0);
        const completedLessons = enrollments.reduce((sum, e) => sum + (e.progress.completed || 0), 0);

        return {
            total: enrollments.length,
            inProgress: enrollments.length - completed,
            completed,
            totalLessons,
            completedLessons,
        };
    }, [enrollments]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Courses" />
            <div className="min-h-screen">
                <div className="container py-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h1 className="font-heading text-3xl font-bold text-foreground">My Learning</h1>
                        <p className="text-muted-foreground mt-1">
                            Track your progress and continue where you left off
                        </p>
                    </motion.div>

                    {enrollments && enrollments.length > 0 ? (
                        <>
                            {/* Stats cards */}
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                                <Card>
                                    <CardContent className="flex items-center gap-4 p-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                            <BookOpen className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Enrolled</p>
                                            <p className="font-heading text-xl font-bold">{stats.total}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="flex items-center gap-4 p-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                                            <Play className="h-5 w-5 text-warning" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">In Progress</p>
                                            <p className="font-heading text-xl font-bold">{stats.inProgress}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="flex items-center gap-4 p-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                                            <CheckCircle2 className="h-5 w-5 text-success" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Completed</p>
                                            <p className="font-heading text-xl font-bold">{stats.completed}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="flex items-center gap-4 p-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                                            <TrendingUp className="h-5 w-5 text-info" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Lessons Done</p>
                                            <p className="font-heading text-xl font-bold">
                                                {stats.completedLessons}/{stats.totalLessons}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Course grid */}
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {enrollments.map((enrollment, i) => (
                                    <EnrolledCourseCard
                                        key={enrollment.enrollment.id}
                                        data={enrollment}
                                        index={i}
                                    />
                                ))}
                            </div>
                        </>
                    ) : (
                        <EmptyState />
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
