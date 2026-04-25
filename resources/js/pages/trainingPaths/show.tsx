/**
 * TrainingPath Detail Page
 * Shows trainingPath modules and trainingUnits with VM lab integration.
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
import { initiateCheckout } from '@/api/checkout.api';
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
import { trainingPathToasts } from '@/lib/toast-utils';
import trainingPaths from '@/routes/trainingPaths';
import type { BreadcrumbItem } from '@/types';
import type {
    TrainingPath,
    TrainingPathProgress,
} from '@/types/TrainingPath.types';
const trainingUnitIcons: Record<string, React.ElementType> = {
    video: Play,
    reading: FileText,
    practice: BookOpen,
    'vm-lab': Terminal,
    quiz: Target,
};
const trainingUnitColors: Record<string, string> = {
    video: 'bg-blue-500/10 text-blue-500',
    reading: 'bg-amber-500/10 text-amber-500',
    practice: 'bg-emerald-500/10 text-emerald-500',
    'vm-lab': 'bg-violet-500/10 text-violet-500',
    quiz: 'bg-rose-500/10 text-rose-500',
};
interface PageProps {
    trainingPath: TrainingPath;
    isEnrolled: boolean;
    progress: TrainingPathProgress | null;
    completedTrainingUnitIds: (string | number)[];
    auth: { user: { id: number; email_verified_at?: string | null } | null };
}
export default function TrainingPathDetailPage() {
    const pageProps = usePage<{ props: PageProps }>()
        .props as unknown as PageProps;
    const {
        trainingPath,
        isEnrolled: initialEnrolled,
        progress: initialProgress,
        completedTrainingUnitIds: initialCompleted,
        auth,
    } = pageProps;
    const [isEnrolled, setIsEnrolled] = useState(initialEnrolled);
    const [progress, setProgress] = useState(initialProgress);
    const [completedTrainingUnitIds, setCompletedTrainingUnitIds] = useState<
        (string | number)[]
    >(initialCompleted || []);
    const [enrolling, setEnrolling] = useState(false);
    const [enrollError, setEnrollError] = useState<string | null>(null);
    const [showEnrollDialog, setShowEnrollDialog] = useState(false);
    const [expandedModules, setExpandedModules] = useState<
        Set<string | number>
    >(new Set());
    const queryParams = new URLSearchParams(window.location.search);
    const initialTab = queryParams.get('tab') || 'curriculum';
    const [activeTab, setActiveTab] = useState(initialTab);
    const [showCertificatePrompt, setShowCertificatePrompt] = useState(false);
    const displayPrice =
        trainingPath?.formattedPrice ??
        (trainingPath?.isFree
            ? 'Free'
            : new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: trainingPath?.currency || 'USD',
              }).format(trainingPath?.price || 0));
    // Forum hook for trainingPath-level discussions
    const {
        threads,
        loading: _forumLoading,
        upvoteThread,
    } = useForum({
        trainingPathId: trainingPath?.id,
        autoFetch: !!trainingPath?.id,
    });
    useEffect(() => {
        setIsEnrolled(initialEnrolled);
        setProgress(initialProgress);
        setCompletedTrainingUnitIds(initialCompleted || []);
        // Auto-expand first module
        if (trainingPath?.modules?.[0]) {
            setExpandedModules(new Set([trainingPath.modules[0].id]));
        }
    }, [initialEnrolled, initialProgress, initialCompleted, trainingPath]);

    // Auto-show certificate prompt when trainingPath is 100% complete
    useEffect(() => {
        if (
            isEnrolled &&
            auth?.user?.email_verified_at &&
            progress &&
            progress.percentage === 100
        ) {
            setShowCertificatePrompt(true);
        }
    }, [isEnrolled, auth?.user?.email_verified_at, progress]);

    const isAuthenticated = !!auth?.user;
    const isVerified = !!auth?.user?.email_verified_at;
    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: 'Training Paths', href: '/trainingPaths' },
            {
                title: trainingPath?.title ?? 'Path',
                href: `/trainingPaths/${trainingPath?.id}`,
            },
        ],
        [trainingPath],
    );
    const thumbnailSrc =
        trainingPath.thumbnail ?? trainingPath.thumbnail_url ?? null;
    const handleEnroll = useCallback(async () => {
        if (!trainingPath?.id) return;
        setEnrolling(true);
        setEnrollError(null);
        try {
            const result = await initiateCheckout(trainingPath.id);

            if (result.checkout_url) {
                window.location.assign(result.checkout_url);
                return;
            }

            if (result.redirect_url) {
                setShowEnrollDialog(false);
                router.visit(result.redirect_url, { preserveScroll: true });
                return;
            }

            if (result.enrolled) {
                setIsEnrolled(true);
                setProgress({
                    completed: 0,
                    total:
                        trainingPath.modules?.reduce(
                            (a, m) => a + m.trainingUnits.length,
                            0,
                        ) ?? 0,
                    percentage: 0,
                });
                trainingPathToasts.enrolled(trainingPath.title);
                setShowEnrollDialog(false);
                router.reload({
                    only: [
                        'isEnrolled',
                        'progress',
                        'completedTrainingUnitIds',
                    ],
                });
                return;
            }

            throw new Error('Unable to start checkout');
        } catch (e) {
            const errorMsg =
                e instanceof Error ? e.message : 'Failed to start checkout';
            setEnrollError(errorMsg);
            trainingPathToasts.error(errorMsg);
        } finally {
            setEnrolling(false);
        }
    }, [trainingPath?.id, trainingPath?.title, trainingPath?.modules]);
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
    if (!trainingPath) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Training Path Not Found" />
                <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 p-6">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                        <GraduationCap className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <p className="text-lg text-muted-foreground">
                        Training path not found.
                    </p>
                    <Button variant="outline" asChild>
                        <Link href={trainingPaths.index.url()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Paths
                        </Link>
                    </Button>
                </div>
            </AppLayout>
        );
    }
    const totalTrainingUnits =
        trainingPath.modules?.reduce((a, m) => a + m.trainingUnits.length, 0) ??
        0;
    const completedTrainingUnitsCount = completedTrainingUnitIds?.length ?? 0;
    const progressPercentage =
        progress?.percentage ??
        (totalTrainingUnits > 0
            ? (completedTrainingUnitsCount / totalTrainingUnits) * 100
            : 0);
    const firstTrainingUnitId = trainingPath.modules?.[0]?.trainingUnits[0]?.id;
    const isTrainingUnitCompleted = (trainingUnitId: string | number) => {
        return (
            completedTrainingUnitIds?.some(
                (id) => String(id) === String(trainingUnitId),
            ) ?? false
        );
    };
    // Calculate module completion
    const getModuleProgress = (module: {
        trainingUnits: { id: string | number }[];
    }) => {
        const completed = module.trainingUnits.filter((l) =>
            isTrainingUnitCompleted(l.id),
        ).length;
        return {
            completed,
            total: module.trainingUnits.length,
            percentage:
                module.trainingUnits.length > 0
                    ? (completed / module.trainingUnits.length) * 100
                    : 0,
        };
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={trainingPath.title} />
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
                            href={trainingPaths.index.url()}
                            className="mb-6 inline-flex items-center gap-1 text-sm text-white/60 transition-colors hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" /> Back to paths
                        </Link>
                        <div className="grid gap-8 lg:grid-cols-3">
                            {/* Left: TrainingPath info */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="lg:col-span-2"
                            >
                                {thumbnailSrc && (
                                    <div className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl">
                                        <img
                                            src={thumbnailSrc}
                                            alt={`${trainingPath.title} thumbnail`}
                                            className="h-64 w-full object-cover md:h-80"
                                        />
                                    </div>
                                )}
                                <div className="mb-4 flex flex-wrap items-center gap-2">
                                    <Badge className="border-white/20 bg-white/10 text-white backdrop-blur-sm">
                                        {trainingPath.category}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="border-white/20 text-white/80"
                                    >
                                        {trainingPath.level}
                                    </Badge>
                                    {trainingPath.hasVirtualMachine && (
                                        <Badge className="border-violet-400/30 bg-violet-500/20 text-violet-200">
                                            <Terminal className="mr-1 h-3 w-3" />{' '}
                                            VM Labs Included
                                        </Badge>
                                    )}
                                </div>
                                <h1 className="mb-4 font-heading text-3xl leading-tight font-bold text-white md:text-4xl lg:text-5xl">
                                    {trainingPath.title}
                                </h1>
                                <p className="mb-6 max-w-2xl text-lg text-white/70">
                                    {trainingPath.description}
                                </p>
                                {/* Stats row */}
                                <div className="mb-8 flex flex-wrap items-center gap-6 text-sm text-white/70">
                                    <span className="flex items-center gap-1.5">
                                        <div className="flex items-center gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-4 w-4 ${i < Math.floor(trainingPath.rating) ? 'fill-amber-400 text-amber-400' : 'fill-white/20 text-white/20'}`}
                                                />
                                            ))}
                                        </div>
                                        <span className="font-medium text-white">
                                            {trainingPath.rating}
                                        </span>
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Users className="h-4 w-4" />
                                        {trainingPath.students.toLocaleString()}{' '}
                                        enrolled
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="h-4 w-4" />
                                        {trainingPath.duration}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <BookOpen className="h-4 w-4" />
                                        {totalTrainingUnits} modules
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
                                            {trainingPath.instructor}
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
                                                {completedTrainingUnitsCount} of{' '}
                                                {totalTrainingUnits} modules
                                                completed
                                            </p>
                                        </div>
                                    )}
                                    <CardContent className="p-6">
                                        {/* Price/Free badge */}
                                        <div className="mb-6 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Sparkles className="h-5 w-5 text-primary" />
                                                <span className="text-2xl font-bold text-foreground">
                                                    {displayPrice}
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
                                                    {trainingPath.isFree
                                                        ? 'Login to Enroll'
                                                        : 'Login to Purchase'}
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
                                                {trainingPath.isFree
                                                    ? 'Enroll Now'
                                                    : `Buy Access - ${displayPrice}`}
                                            </Button>
                                        ) : (
                                            <Button
                                                size="lg"
                                                className="h-12 w-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
                                                asChild
                                            >
                                                <Link
                                                    href={`/trainingPaths/${trainingPath.id}/trainingUnit/${firstTrainingUnitId}`}
                                                >
                                                    <Play className="mr-2 h-4 w-4" />
                                                    {progressPercentage > 0
                                                        ? 'Continue Training'
                                                        : 'Start Path'}
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
                                        {/* TrainingPath includes */}
                                        <div className="space-y-3">
                                            <h4 className="text-sm font-semibold text-foreground">
                                                This path includes:
                                            </h4>
                                            <ul className="space-y-2.5">
                                                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                                                        <Play className="h-4 w-4 text-blue-500" />
                                                    </div>
                                                    {totalTrainingUnits}{' '}
                                                    on-demand trainingUnits
                                                </li>
                                                {trainingPath.hasVirtualMachine && (
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
                {/* TrainingPath Content Section */}
                <div className="container py-12">
                    {/* TrainingPath Video Section */}
                    {trainingPath.video_url && trainingPath.video_type && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-12"
                        >
                            <Card className="overflow-hidden border-border/50 shadow-lg">
                                <CardContent className="p-0">
                                    <div className="aspect-video w-full bg-black">
                                        {trainingPath.video_type ===
                                        'youtube' ? (
                                            <iframe
                                                src={trainingPath.video_url}
                                                title="Training path introduction video"
                                                className="h-full w-full border-0"
                                                allowFullScreen
                                                loading="lazy"
                                            />
                                        ) : (
                                            <video
                                                src={trainingPath.video_url}
                                                controls
                                                className="h-full w-full"
                                                controlsList="nodownload"
                                            />
                                        )}
                                    </div>
                                </CardContent>
                                {trainingPath.video_type === 'youtube' && (
                                    <CardContent className="border-t border-border/50 px-6 py-4">
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
                                                TrainingPath Curriculum
                                            </h2>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {trainingPath.modules?.length ??
                                                    0}{' '}
                                                modules · {totalTrainingUnits}{' '}
                                                trainingUnits ·{' '}
                                                {trainingPath.duration}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                if (
                                                    expandedModules.size ===
                                                    trainingPath.modules?.length
                                                ) {
                                                    setExpandedModules(
                                                        new Set(),
                                                    );
                                                } else {
                                                    setExpandedModules(
                                                        new Set(
                                                            trainingPath.modules?.map(
                                                                (m) => m.id,
                                                            ) || [],
                                                        ),
                                                    );
                                                }
                                            }}
                                            className="text-muted-foreground"
                                        >
                                            {expandedModules.size ===
                                            trainingPath.modules?.length
                                                ? 'Collapse all'
                                                : 'Expand all'}
                                        </Button>
                                    </div>
                                    {/* Modules */}
                                    <div className="space-y-3">
                                        {trainingPath.modules?.map(
                                            (module, mi) => {
                                                const isExpanded =
                                                    expandedModules.has(
                                                        module.id,
                                                    );
                                                const moduleProgress =
                                                    getModuleProgress(module);
                                                const isModuleComplete =
                                                    moduleProgress.percentage ===
                                                    100;
                                                return (
                                                    <motion.div
                                                        key={module.id}
                                                        initial={{
                                                            opacity: 0,
                                                            y: 10,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            y: 0,
                                                        }}
                                                        transition={{
                                                            delay: mi * 0.05,
                                                        }}
                                                    >
                                                        <Card className="cursor-pointer overflow-hidden border-border/50">
                                                            {/* Module header */}
                                                            <button
                                                                onClick={() =>
                                                                    toggleModule(
                                                                        module.id,
                                                                    )
                                                                }
                                                                className="flex w-full cursor-pointer items-center justify-between px-5 py-4 transition-colors hover:bg-muted/30"
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
                                                                                {mi +
                                                                                    1}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-left">
                                                                        <h3 className="font-heading font-semibold text-foreground">
                                                                            {
                                                                                module.title
                                                                            }
                                                                        </h3>
                                                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                                                            {
                                                                                module
                                                                                    .trainingUnits
                                                                                    .length
                                                                            }{' '}
                                                                            trainingUnits
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
                                                            {/* TrainingUnits list */}
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
                                                                            {module.trainingUnits.map(
                                                                                (
                                                                                    trainingUnit,
                                                                                    _li,
                                                                                ) => {
                                                                                    const Icon =
                                                                                        trainingUnitIcons[
                                                                                            trainingUnit
                                                                                                .type
                                                                                        ] ||
                                                                                        BookOpen;
                                                                                    const colorClass =
                                                                                        trainingUnitColors[
                                                                                            trainingUnit
                                                                                                .type
                                                                                        ] ||
                                                                                        'bg-muted text-muted-foreground';
                                                                                    const completed =
                                                                                        isTrainingUnitCompleted(
                                                                                            trainingUnit.id,
                                                                                        );
                                                                                    const canAccess =
                                                                                        isEnrolled;
                                                                                    return (
                                                                                        <li
                                                                                            key={
                                                                                                trainingUnit.id
                                                                                            }
                                                                                        >
                                                                                            {canAccess ? (
                                                                                                <Link
                                                                                                    href={`/trainingPaths/${trainingPath.id}/trainingUnit/${trainingUnit.id}`}
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
                                                                                                                trainingUnit.title
                                                                                                            }
                                                                                                        </p>
                                                                                                        <div className="mt-0.5 flex items-center gap-2">
                                                                                                            <span className="text-xs text-muted-foreground capitalize">
                                                                                                                {trainingUnit.type.replace(
                                                                                                                    '-',
                                                                                                                    ' ',
                                                                                                                )}
                                                                                                            </span>
                                                                                                            {trainingUnit.duration && (
                                                                                                                <>
                                                                                                                    <span className="text-muted-foreground/50">
                                                                                                                        ·
                                                                                                                    </span>
                                                                                                                    <span className="text-xs text-muted-foreground">
                                                                                                                        {
                                                                                                                            trainingUnit.duration
                                                                                                                        }
                                                                                                                    </span>
                                                                                                                </>
                                                                                                            )}
                                                                                                            {trainingUnit.vmEnabled && (
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
                                                                                                                trainingUnit.title
                                                                                                            }
                                                                                                        </p>
                                                                                                        <div className="mt-0.5 flex items-center gap-2">
                                                                                                            <span className="text-xs text-muted-foreground capitalize">
                                                                                                                {trainingUnit.type.replace(
                                                                                                                    '-',
                                                                                                                    ' ',
                                                                                                                )}
                                                                                                            </span>
                                                                                                            {trainingUnit.duration && (
                                                                                                                <>
                                                                                                                    <span className="text-muted-foreground/50">
                                                                                                                        ·
                                                                                                                    </span>
                                                                                                                    <span className="text-xs text-muted-foreground">
                                                                                                                        {
                                                                                                                            trainingUnit.duration
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
                                            },
                                        )}
                                    </div>
                                </TabsContent>
                                {/* Discussions Tab */}
                                <TabsContent value="discussions">
                                    <div className="mb-6">
                                        <h2 className="font-heading text-2xl font-bold text-foreground">
                                            TrainingPath Discussions
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
                                                onUpvote={
                                                    isAuthenticated
                                                        ? (threadId) =>
                                                              upvoteThread(
                                                                  threadId,
                                                              )
                                                        : undefined
                                                }
                                                showNewButton={false}
                                                emptyTitle="No discussions yet"
                                                emptyDescription="Start a discussion from any trainingUnit to ask questions or share insights!"
                                            />
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                {/* Reviews Tab */}
                                <TabsContent value="reviews">
                                    <div className="mb-6">
                                        <h2 className="font-heading text-2xl font-bold text-foreground">
                                            Engineer Reviews
                                        </h2>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {isEnrolled
                                                ? 'Share your experience with other engineers'
                                                : 'See what other engineers think about this path'}
                                        </p>
                                    </div>
                                    <ReviewSection
                                        trainingPathId={trainingPath.id}
                                    />
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
                title={
                    trainingPath?.isFree
                        ? 'Start Your Training Journey'
                        : 'Continue to Checkout'
                }
                description={
                    trainingPath?.isFree
                        ? `You're about to enroll in "${trainingPath?.title}". This training path is free and you'll have lifetime access to all content.`
                        : `You're about to purchase "${trainingPath?.title}" for ${displayPrice}. We'll take you to secure checkout to complete payment.`
                }
                confirmText={
                    enrolling
                        ? trainingPath?.isFree
                            ? 'Enrolling...'
                            : 'Opening Checkout...'
                        : trainingPath?.isFree
                          ? 'Enroll Now'
                          : `Checkout - ${displayPrice}`
                }
                cancelText="Maybe Later"
                variant="default"
                loading={enrolling}
            />

            {/* Certificate Claim Prompt */}
            {isAuthenticated && isVerified && isEnrolled && (
                <CertificateClaimPrompt
                    trainingPathId={trainingPath?.id ?? 0}
                    trainingPathTitle={trainingPath?.title ?? 'Path'}
                    open={showCertificatePrompt}
                    onOpenChange={setShowCertificatePrompt}
                />
            )}
        </AppLayout>
    );
}
