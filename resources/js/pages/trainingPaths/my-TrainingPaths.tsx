/**
 * My Training Page
 * Shows all enrolled training paths for the operator with progress tracking.
 * Links to continue learning from where the operator left off.
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
import type { TrainingPath, TrainingPathProgress } from '@/types/TrainingPath.types';
interface EnrollmentData {
    enrollment: {
        id: number;
        enrolled_at: string;
    };
    trainingPath: TrainingPath;
    progress: TrainingPathProgress;
    completedTrainingUnitIds: number[];
}
interface PageProps {
    enrollments: EnrollmentData[];
}
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'My Training', href: '/my-trainingPaths' },
];
const levelColors: Record<string, string> = {
    Beginner: 'bg-success/10 text-success border-success/20',
    Intermediate: 'bg-warning/10 text-warning border-warning/20',
    Advanced: 'bg-destructive/10 text-destructive border-destructive/20',
};
function EnrolledTrainingPathCard({
    data,
    index,
}: {
    data: EnrollmentData;
    index: number;
}) {
    const { trainingPath, progress, completedTrainingUnitIds } = data;
    // Find the next trainingUnit to continue
    const nextTrainingUnit = useMemo(() => {
        if (!trainingPath.modules) return null;
        for (const module of trainingPath.modules) {
            for (const trainingUnit of module.trainingUnits) {
                // Convert to number for comparison since completedTrainingUnitIds might be numbers
                const trainingUnitIdNum =
                    typeof trainingUnit.id === 'string'
                        ? parseInt(trainingUnit.id, 10)
                        : trainingUnit.id;
                if (!completedTrainingUnitIds.includes(trainingUnitIdNum)) {
                    return trainingUnit;
                }
            }
        }
        // All completed - return last trainingUnit
        const lastModule = trainingPath.modules[trainingPath.modules.length - 1];
        return lastModule?.trainingUnits[lastModule.trainingUnits.length - 1] ?? null;
    }, [trainingPath.modules, completedTrainingUnitIds]);
    const isCompleted = progress.percentage >= 100;
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <Card className="group overflow-hidden border-border transition-all duration-300 hover:shadow-card-hover">
                {/* Header with category gradient */}
                <div className="h-3 bg-gradient-to-r from-primary/60 to-primary/30" />
                <CardContent className="p-5">
                    {/* TrainingPath info */}
                    <div className="mb-4 flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                <Badge
                                    variant="outline"
                                    className={levelColors[trainingPath.level]}
                                >
                                    {trainingPath.level}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                    {trainingPath.category}
                                </Badge>
                                {trainingPath.hasVirtualMachine && (
                                    <Badge
                                        variant="outline"
                                        className="border-primary/30 text-xs text-primary"
                                    >
                                        <Terminal className="mr-1 h-3 w-3" /> VM
                                        Labs
                                    </Badge>
                                )}
                            </div>
                            <Link
                                href={`/trainingPaths/${trainingPath.id}`}
                                className="block"
                            >
                                <h3 className="line-clamp-2 font-heading text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                                    {trainingPath.title}
                                </h3>
                            </Link>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {trainingPath.instructor}
                            </p>
                        </div>
                        {/* Completion badge */}
                        {isCompleted && (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/10">
                                <CheckCircle2 className="h-5 w-5 text-success" />
                            </div>
                        )}
                    </div>
                    {/* Progress bar */}
                    <div className="mb-4">
                        <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                {progress.completed}/{progress.total} trainingUnits
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
                            {trainingPath.rating.toFixed(1)}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {trainingPath.duration || 'Self-paced'}
                        </span>
                        <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {trainingPath.modules?.length ?? 0} modules
                        </span>
                    </div>
                </CardContent>
                <CardFooter className="p-5 pt-0">
                    {nextTrainingUnit ? (
                        <Button
                            className={`w-full ${isCompleted ? 'bg-success text-success-foreground hover:bg-success/90' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
                            asChild
                        >
                            <Link
                                href={`/trainingPaths/${trainingPath.id}/trainingUnit/${nextTrainingUnit.id}`}
                            >
                                        {isCompleted ? (
                                    <>
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Review Path
                                    </>
                                ) : (
                                    <>
                                        <Play className="mr-2 h-4 w-4" />
                                        Continue Training
                                    </>
                                )}
                            </Link>
                        </Button>
                    ) : (
                        <Button variant="outline" className="w-full" asChild>
                            <Link href={`/trainingPaths/${trainingPath.id}`}>
                                View Path{' '}
                                <ArrowRight className="ml-2 h-4 w-4" />
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
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <GraduationCap className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="mb-2 font-heading text-xl font-semibold text-foreground">
                No Training Paths Yet
            </h2>
            <p className="mb-6 max-w-sm text-muted-foreground">
                Start your training journey by exploring our path catalog and
                enrolling in paths that interest you.
            </p>
            <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                asChild
            >
                <Link href="/trainingPaths">
                    Browse Paths <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </motion.div>
    );
}
export default function MyTrainingPathsPage() {
    const { enrollments } = usePage<{ props: PageProps }>()
        .props as unknown as PageProps;
    // Calculate overall stats
    const stats = useMemo(() => {
        if (!enrollments || enrollments.length === 0) {
            return {
                total: 0,
                inProgress: 0,
                completed: 0,
                totalTrainingUnits: 0,
                completedTrainingUnits: 0,
            };
        }
        const completed = enrollments.filter(
            (e) => e.progress.percentage >= 100,
        ).length;
        const totalTrainingUnits = enrollments.reduce(
            (sum, e) => sum + (e.progress.total || 0),
            0,
        );
        const completedTrainingUnits = enrollments.reduce(
            (sum, e) => sum + (e.progress.completed || 0),
            0,
        );
        return {
            total: enrollments.length,
            inProgress: enrollments.length - completed,
            completed,
            totalTrainingUnits,
            completedTrainingUnits,
        };
    }, [enrollments]);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Training" />
            <div className="min-h-screen">
                <div className="container py-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h1 className="font-heading text-3xl font-bold text-foreground">
                            My Training
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Track your progress and continue where you left off
                        </p>
                    </motion.div>
                    {enrollments && enrollments.length > 0 ? (
                        <>
                            {/* Stats cards */}
                            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <Card>
                                    <CardContent className="flex items-center gap-4 p-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                            <BookOpen className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Active Paths
                                            </p>
                                            <p className="font-heading text-xl font-bold">
                                                {stats.total}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="flex items-center gap-4 p-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                                            <Play className="h-5 w-5 text-warning" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                In Progress
                                            </p>
                                            <p className="font-heading text-xl font-bold">
                                                {stats.inProgress}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="flex items-center gap-4 p-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                                            <CheckCircle2 className="h-5 w-5 text-success" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Completed Paths
                                            </p>
                                            <p className="font-heading text-xl font-bold">
                                                {stats.completed}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="flex items-center gap-4 p-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                                            <TrendingUp className="h-5 w-5 text-info" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Modules Done
                                            </p>
                                            <p className="font-heading text-xl font-bold">
                                                {stats.completedTrainingUnits}/
                                                {stats.totalTrainingUnits}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                            {/* TrainingPath grid */}
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {enrollments.map((enrollment, i) => (
                                    <EnrolledTrainingPathCard
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

