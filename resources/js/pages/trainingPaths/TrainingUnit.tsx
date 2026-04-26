/**
 * TrainingUnit Viewer Page
 * Shows trainingUnit content with integrated VM lab functionality.
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
    FileQuestion,
    Loader2,
    Maximize2,
    Menu,
    Play,
    Terminal,
    Clock,
    Users,
    X,
} from 'lucide-react';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { trainingPathApi } from '@/api/TrainingPath.api';
import { vmSessionApi } from '@/api/vm.api';
import { ArticleReader } from '@/components/articles/ArticleReader';
import { ThreadList } from '@/components/forum/ThreadList';
import { GuacamoleViewer } from '@/components/GuacamoleViewer';
import { NotesPanel } from '@/components/notes/NotesPanel';
import VideoPlayer from '@/components/TrainingPaths/VideoPlayer';
import VirtualMachinePanel from '@/components/TrainingPaths/VirtualMachinePanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { useForum } from '@/hooks/useForum';
import { useVMSessions } from '@/hooks/useVMSessions';
import AppLayout from '@/layouts/app-layout';
import { trainingPathToasts } from '@/lib/toast-utils';
import { cn } from '@/lib/utils';
import trainingPaths from '@/routes/trainingPaths';
import type { BreadcrumbItem } from '@/types';
import type { Article } from '@/types/article.types';
import type {
    TrainingPath,
    TrainingUnit,
    TrainingUnitType,
} from '@/types/TrainingPath.types';
/**
 * VM info from approved trainingUnit assignment.
 */
interface TrainingUnitVMInfo {
    vm_id: number;
    node_id: number;
    vm_name: string | null;
    available?: boolean;
    unavailable_reason?: string | null;
    reserved_training_path?: string | null;
    node?: { id: number; name: string } | null;
}

/**
 * Queue status for a VM.
 */
interface QueueStatus {
    in_use: boolean;
    current_user: string | null;
    queue_count: number;
    estimated_wait_minutes: number | null;
}

/**
 * VM info passed from backend for the trainingUnit.
 */
interface TrainingUnitVMDisplayInfo {
    vm: TrainingUnitVMInfo;
    queue_status: QueueStatus;
    can_start: boolean;
    my_position: number | null;
}
// TrainingUnit type icons mapping
const trainingUnitIcons: Record<TrainingUnitType, React.ElementType> = {
    video: Play,
    reading: FileText,
    practice: BookOpen,
    'vm-lab': Terminal,
    quiz: FileQuestion,
};
// Helper to compare IDs regardless of string/number type
function isSameId(
    id1: string | number | undefined,
    id2: string | number | undefined,
): boolean {
    if (id1 === undefined || id2 === undefined) return false;
    return String(id1) === String(id2);
}
function isTrainingUnitCompleted(
    trainingUnitId: string | number,
    completedIds: (string | number)[],
): boolean {
    return completedIds.some((id) => isSameId(id, trainingUnitId));
}

function normalizeStringList(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value
            .filter((item): item is string => typeof item === 'string')
            .map((item) => item.trim())
            .filter((item) => item.length > 0);
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();

        if (!trimmed) {
            return [];
        }

        // Handle values accidentally stored as JSON strings.
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            try {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed)) {
                    return parsed
                        .filter(
                            (item): item is string => typeof item === 'string',
                        )
                        .map((item) => item.trim())
                        .filter((item) => item.length > 0);
                }
            } catch {
                // Fall back to delimiter-based parsing below.
            }
        }

        return trimmed
            .split(/\r?\n|,/)
            .map((item) => item.trim())
            .filter((item) => item.length > 0);
    }

    if (value && typeof value === 'object') {
        const obj = value as Record<string, unknown>;
        const nested = obj.items ?? obj.objectives ?? obj.resources;
        if (nested !== undefined) {
            return normalizeStringList(nested);
        }
    }

    return [];
}

interface TrainingUnitSidebarProps {
    modules: TrainingPath['modules'];
    currentTrainingUnitId: string | number;
    completedTrainingUnitIds: (string | number)[];
    trainingPathId: number;
    totalTrainingUnits: number;
    completedCount: number;
}
function TrainingUnitSidebar({
    modules,
    currentTrainingUnitId,
    completedTrainingUnitIds,
    trainingPathId,
    totalTrainingUnits,
    completedCount,
}: TrainingUnitSidebarProps) {
    const progressPercentage =
        totalTrainingUnits > 0
            ? (completedCount / totalTrainingUnits) * 100
            : 0;
    // Find which module contains the current trainingUnit and default open it
    const currentModuleIndex =
        modules?.findIndex((m) =>
            m.trainingUnits.some((l) => isSameId(l.id, currentTrainingUnitId)),
        ) ?? 0;
    const [openModules, setOpenModules] = useState<Record<number, boolean>>(
        () => {
            // Default: open the module containing current trainingUnit
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
                    Path Content
                </h3>
                <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                            {completedCount}/{totalTrainingUnits}
                        </span>
                        <span>{Math.round(progressPercentage)}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-1.5" />
                </div>
            </div>
            {/* Scrollable content with collapsible modules */}
            <div className="flex-1 overflow-y-auto">
                {modules?.map((module, mi) => {
                    const moduleCompleted = module.trainingUnits.every((l) =>
                        isTrainingUnitCompleted(l.id, completedTrainingUnitIds),
                    );
                    const moduleTrainingUnitsCompleted =
                        module.trainingUnits.filter((l) =>
                            isTrainingUnitCompleted(
                                l.id,
                                completedTrainingUnitIds,
                            ),
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
                                            {moduleTrainingUnitsCompleted}/
                                            {module.trainingUnits.length}{' '}
                                            modules
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
                                {/* TrainingUnits list */}
                                <ul className="py-1">
                                    {module.trainingUnits.map(
                                        (trainingUnit) => {
                                            const Icon =
                                                trainingUnitIcons[
                                                    trainingUnit.type as TrainingUnitType
                                                ] || BookOpen;
                                            const isActive = isSameId(
                                                trainingUnit.id,
                                                currentTrainingUnitId,
                                            );
                                            const isCompleted =
                                                isTrainingUnitCompleted(
                                                    trainingUnit.id,
                                                    completedTrainingUnitIds,
                                                );
                                            return (
                                                <li key={trainingUnit.id}>
                                                    <Link
                                                        href={`/trainingPaths/${trainingPathId}/trainingUnit/${trainingUnit.id}`}
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
                                                        {/* TrainingUnit info */}
                                                        <div className="min-w-0 flex-1">
                                                            <p
                                                                className={cn(
                                                                    'truncate font-medium',
                                                                    isActive &&
                                                                        'text-primary',
                                                                )}
                                                            >
                                                                {
                                                                    trainingUnit.title
                                                                }
                                                            </p>
                                                            <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                                                                {trainingUnit.duration ||
                                                                    'N/A'}
                                                                {trainingUnit.vmEnabled && (
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
                                        },
                                    )}
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
    vmInfo: TrainingUnitVMDisplayInfo | null;
    trainingUnitId: number;
    onOpenSessionInSplit: (sessionId: string) => void;
}
function VMLabPanel({
    vmInfo,
    trainingUnitId,
    onOpenSessionInSplit,
}: VMLabPanelProps) {
    const { sessions, loading: sessionsLoading } = useVMSessions();
    const [launching, setLaunching] = useState(false);
    const activeSessions = sessions.filter((s) => s?.status === 'active');
    const hasActiveSession = activeSessions.length > 0;
    const handleLaunchVM = useCallback(async () => {
        if (!vmInfo) return;
        const vm = vmInfo.vm ?? (vmInfo as unknown as TrainingUnitVMInfo);
        setLaunching(true);
        try {
            const session = await vmSessionApi.create({
                vmid: vm.vm_id,
                node_id: vm.node_id,
                training_unit_id: trainingUnitId,
                vm_name: vm.vm_name ?? `VM ${vm.vm_id}`,
                duration_minutes: 60,
                use_existing: true, // Use the existing VM (no cloning)
            });
            if (session?.id) {
                onOpenSessionInSplit(session.id);
            }
        } catch (e) {
            console.error('Failed to launch VM:', e);
            trainingPathToasts.error('Failed to start VM session');
        } finally {
            setLaunching(false);
        }
    }, [vmInfo, onOpenSessionInSplit, trainingUnitId]);
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
                            onClick={() => onOpenSessionInSplit(session.id)}
                        >
                            <span className="inline-flex items-center">
                                Open Session{' '}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }
    // No approved VM for this trainingUnit
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
                        No VM has been assigned to this module yet. The
                        instructor will assign a VM that an administrator must
                        approve.
                    </p>
                </CardContent>
            </Card>
        );
    }
    const vm = vmInfo.vm ?? vmInfo;
    const queueStatus = vmInfo.queue_status;
    const canStartFromQueue = vmInfo.can_start ?? true;
    const myPosition = vmInfo.my_position ?? null;
    const isAvailable = vm.available ?? true;
    const vmName = vm.vm_name ?? `VM ${vm.vm_id}`;

    return (
        <Card>
            <CardContent className="py-6">
                <div className="mb-4 flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-primary" />
                    <h4 className="font-medium text-foreground">{vmName}</h4>
                </div>
                {/* Queue status */}
                {queueStatus?.in_use && (
                    <div className="mb-4 rounded-lg bg-muted/50 p-3">
                        <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                                Currently in use by {queueStatus.current_user}
                            </span>
                        </div>
                        {queueStatus.queue_count > 0 && (
                            <div className="mt-1 flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                    {queueStatus.queue_count} in queue
                                    {queueStatus.estimated_wait_minutes && (
                                        <>
                                            {' '}
                                            · ~
                                            {
                                                queueStatus.estimated_wait_minutes
                                            }{' '}
                                            min wait
                                        </>
                                    )}
                                </span>
                            </div>
                        )}
                        {myPosition !== null && myPosition > 0 && (
                            <p className="mt-2 text-sm text-primary">
                                You are #{myPosition} in the queue
                            </p>
                        )}
                    </div>
                )}

                {!isAvailable && (
                    <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                        <p className="font-medium">VM currently unavailable</p>
                        <p>
                            {vm.unavailable_reason ??
                                'This assigned VM is temporarily reserved.'}
                        </p>
                    </div>
                )}
                <Button
                    onClick={handleLaunchVM}
                    disabled={launching || !canStartFromQueue || !isAvailable}
                    className="w-full"
                >
                    {launching ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Starting...
                        </>
                    ) : !isAvailable ? (
                        <>
                            <Clock className="mr-2 h-4 w-4" />
                            Not Available Right Now
                        </>
                    ) : canStartFromQueue ? (
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
                {vm.node?.name && (
                    <p className="mt-2 text-center text-xs text-muted-foreground">
                        Node: {vm.node.name}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
interface PageProps {
    trainingPath: TrainingPath;
    trainingUnit: TrainingUnit;
    completedTrainingUnitIds: (string | number)[];
    vmInfo: TrainingUnitVMDisplayInfo | null;
    article?: Article | null;
}

const LESSON_SPLIT_MIN_PERCENT = 30;
const LESSON_SPLIT_MAX_PERCENT = 70;

export default function TrainingUnitPage() {
    const pageProps = usePage<{ props: PageProps }>()
        .props as unknown as PageProps;
    const {
        trainingPath,
        trainingUnit,
        completedTrainingUnitIds: initialCompleted,
        vmInfo,
        article,
    } = pageProps;
    const [completedTrainingUnitIds, setCompletedTrainingUnitIds] = useState<
        (string | number)[]
    >(initialCompleted || []);
    const [markingComplete, setMarkingComplete] = useState(false);
    const [isDiscussionComposerOpen, setIsDiscussionComposerOpen] =
        useState(false);
    const [newDiscussionTitle, setNewDiscussionTitle] = useState('');
    const [newDiscussionContent, setNewDiscussionContent] = useState('');
    const [isCreatingDiscussion, setIsCreatingDiscussion] = useState(false);
    const [splitSessionId, setSplitSessionId] = useState<string | null>(null);
    const [splitLeftWidth, setSplitLeftWidth] = useState<number>(50);
    const [isResizingSplit, setIsResizingSplit] = useState(false);
    const splitContainerRef = useRef<HTMLDivElement | null>(null);
    const normalizedObjectives = useMemo(
        () => normalizeStringList(trainingUnit?.objectives),
        [trainingUnit?.objectives],
    );
    const normalizedResources = useMemo(
        () => normalizeStringList(trainingUnit?.resources),
        [trainingUnit?.resources],
    );
    // Forum hook for trainingUnit discussions (must be before any conditional returns)
    const { threads, createThread, upvoteThread } = useForum({
        trainingUnitId: trainingUnit?.id ? Number(trainingUnit.id) : undefined,
        autoFetch: !!trainingUnit?.id,
    });

    const handleCreateDiscussion = useCallback(async () => {
        const title = newDiscussionTitle.trim();
        const content = newDiscussionContent.trim();

        if (title.length < 5 || content.length < 10) {
            trainingPathToasts.error(
                'Please add a valid title (5+ chars) and content (10+ chars).',
            );

            return;
        }

        setIsCreatingDiscussion(true);

        try {
            const createdThread = await createThread({ title, content });

            if (!createdThread) {
                return;
            }

            setNewDiscussionTitle('');
            setNewDiscussionContent('');
            setIsDiscussionComposerOpen(false);

            router.visit(
                `/forum/threads/${createdThread.id}?from=${encodeURIComponent(`/trainingPaths/${trainingPath.id}/trainingUnit/${trainingUnit.id}`)}`,
            );
        } finally {
            setIsCreatingDiscussion(false);
        }
    }, [
        createThread,
        newDiscussionTitle,
        newDiscussionContent,
        trainingPath.id,
        trainingUnit.id,
    ]);
    // Sync completedTrainingUnitIds with server data when props change (e.g., navigation)
    useEffect(() => {
        setCompletedTrainingUnitIds(initialCompleted || []);
    }, [initialCompleted]);
    const allTrainingUnits = useMemo(() => {
        if (!trainingPath?.modules) return [];
        return trainingPath.modules.flatMap((m) => m.trainingUnits);
    }, [trainingPath]);
    const totalTrainingUnits = allTrainingUnits.length;
    const completedCount = completedTrainingUnitIds.length;
    const currentIndex = allTrainingUnits.findIndex((l) =>
        isSameId(l.id, trainingUnit?.id),
    );
    const prevTrainingUnit =
        currentIndex > 0 ? allTrainingUnits[currentIndex - 1] : null;
    const nextTrainingUnit =
        currentIndex < allTrainingUnits.length - 1
            ? allTrainingUnits[currentIndex + 1]
            : null;
    const isCurrentTrainingUnitCompleted = isTrainingUnitCompleted(
        trainingUnit?.id,
        completedTrainingUnitIds,
    );
    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: 'Training Paths', href: '/trainingPaths' },
            {
                title: trainingPath?.title ?? 'Path',
                href: `/trainingPaths/${trainingPath?.id}`,
            },
            {
                title: trainingUnit?.title ?? 'Module',
                href: `/trainingPaths/${trainingPath?.id}/trainingUnit/${trainingUnit?.id}`,
            },
        ],
        [trainingPath, trainingUnit],
    );
    const handleMarkComplete = useCallback(async () => {
        if (!trainingPath?.id || !trainingUnit?.id) return;
        setMarkingComplete(true);
        try {
            await trainingPathApi.markTrainingUnitComplete(
                trainingPath.id,
                Number(trainingUnit.id),
            );
            // Update local state
            if (!isCurrentTrainingUnitCompleted) {
                setCompletedTrainingUnitIds((prev) => [
                    ...prev,
                    trainingUnit.id,
                ]);
                trainingPathToasts.trainingUnitCompleted(trainingUnit.title);
                // Check if trainingPath is now completed
                const newCompletedCount = completedCount + 1;
                if (newCompletedCount === totalTrainingUnits) {
                    trainingPathToasts.trainingPathCompleted(
                        trainingPath.title,
                    );
                }
            }
        } catch (e) {
            console.error('Failed to mark trainingUnit complete:', e);
            trainingPathToasts.error('Failed to mark trainingUnit as complete');
        } finally {
            setMarkingComplete(false);
        }
    }, [
        trainingPath?.id,
        trainingPath?.title,
        trainingUnit?.id,
        trainingUnit?.title,
        isCurrentTrainingUnitCompleted,
        completedCount,
        totalTrainingUnits,
    ]);
    const handleMarkIncomplete = useCallback(async () => {
        if (!trainingPath?.id || !trainingUnit?.id) return;
        setMarkingComplete(true);
        try {
            await trainingPathApi.markTrainingUnitIncomplete(
                trainingPath.id,
                Number(trainingUnit.id),
            );
            // Update local state
            setCompletedTrainingUnitIds((prev) =>
                prev.filter((id) => !isSameId(id, trainingUnit.id)),
            );
        } catch (e) {
            console.error('Failed to mark trainingUnit incomplete:', e);
        } finally {
            setMarkingComplete(false);
        }
    }, [trainingPath?.id, trainingUnit?.id]);

    const handleOpenSessionInSplit = useCallback((sessionId: string) => {
        setSplitSessionId(sessionId);
    }, []);

    const handleCloseSplitSession = useCallback(() => {
        setIsResizingSplit(false);
        setSplitSessionId(null);
    }, []);

    useEffect(() => {
        if (!splitSessionId || !isResizingSplit) {
            return;
        }

        const handlePointerMove = (event: PointerEvent) => {
            const container = splitContainerRef.current;
            if (!container) {
                return;
            }

            const rect = container.getBoundingClientRect();
            const relativeX = event.clientX - rect.left;
            const ratio = (relativeX / rect.width) * 100;
            const clampedRatio = Math.min(
                LESSON_SPLIT_MAX_PERCENT,
                Math.max(LESSON_SPLIT_MIN_PERCENT, ratio),
            );

            setSplitLeftWidth(clampedRatio);
        };

        const stopResize = () => {
            setIsResizingSplit(false);
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', stopResize);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', stopResize);
        };
    }, [splitSessionId, isResizingSplit]);
    if (!trainingPath || !trainingUnit) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Module Not Found" />
                <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 p-6">
                    <BookOpen className="h-12 w-12 text-muted-foreground/40" />
                    <p className="text-lg text-muted-foreground">
                        TrainingUnit not found.
                    </p>
                    <Button variant="outline" asChild>
                        <Link href={trainingPaths.index.url()}>
                            Back to Paths
                        </Link>
                    </Button>
                </div>
            </AppLayout>
        );
    }
    const TypeIcon =
        trainingUnitIcons[trainingUnit.type as TrainingUnitType] || BookOpen;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${trainingUnit.title} - ${trainingPath.title}`} />
            <div ref={splitContainerRef} className="flex h-full flex-1">
                {/* Desktop Sidebar - Sticky */}
                <div
                    className={
                        splitSessionId
                            ? 'hidden'
                            : 'sticky top-0 hidden h-screen w-80 shrink-0 overflow-y-auto lg:block'
                    }
                >
                    <TrainingUnitSidebar
                        modules={trainingPath.modules}
                        currentTrainingUnitId={trainingUnit.id}
                        completedTrainingUnitIds={completedTrainingUnitIds}
                        trainingPathId={trainingPath.id}
                        totalTrainingUnits={totalTrainingUnits}
                        completedCount={completedCount}
                    />
                </div>
                {/* Main Content */}
                <div
                    className={cn(
                        'flex min-w-0 flex-1 flex-col overflow-y-auto',
                        splitSessionId && 'shrink-0 border-r border-border',
                    )}
                    style={
                        splitSessionId
                            ? { width: `${splitLeftWidth}%` }
                            : undefined
                    }
                >
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
                                    <TrainingUnitSidebar
                                        modules={trainingPath.modules}
                                        currentTrainingUnitId={trainingUnit.id}
                                        completedTrainingUnitIds={
                                            completedTrainingUnitIds
                                        }
                                        trainingPathId={trainingPath.id}
                                        totalTrainingUnits={totalTrainingUnits}
                                        completedCount={completedCount}
                                    />
                                </SheetContent>
                            </Sheet>
                            <Link
                                href={`/trainingPaths/${trainingPath.id}`}
                                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">
                                    {trainingPath.title}
                                </span>
                                <span className="sm:hidden">Back</span>
                            </Link>
                        </div>
                        {/* Progress indicator in top bar */}
                        <div className="hidden items-center gap-3 text-sm sm:flex">
                            <span className="text-muted-foreground">
                                {currentIndex + 1}/{totalTrainingUnits}
                            </span>
                            <Progress
                                value={
                                    (completedCount / totalTrainingUnits) * 100
                                }
                                className="h-2 w-24"
                            />
                            <span className="font-medium text-muted-foreground">
                                {Math.round(
                                    (completedCount / totalTrainingUnits) * 100,
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
                                key={trainingUnit.id}
                            >
                                {/* TrainingUnit Header */}
                                <div className="mb-6 flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <TypeIcon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs tracking-wide text-muted-foreground uppercase">
                                                {trainingUnit.type.replace(
                                                    '-',
                                                    ' ',
                                                )}{' '}
                                                ·{' '}
                                                {trainingUnit.duration || 'N/A'}
                                            </p>
                                            <h1 className="font-heading text-2xl font-bold text-foreground">
                                                {trainingUnit.title}
                                            </h1>
                                        </div>
                                    </div>
                                    {/* Mark Complete Button */}
                                    <Button
                                        variant={
                                            isCurrentTrainingUnitCompleted
                                                ? 'outline'
                                                : 'default'
                                        }
                                        size="sm"
                                        onClick={
                                            isCurrentTrainingUnitCompleted
                                                ? handleMarkIncomplete
                                                : handleMarkComplete
                                        }
                                        disabled={markingComplete}
                                        className={cn(
                                            'shrink-0',
                                            isCurrentTrainingUnitCompleted &&
                                                'border-success text-success hover:bg-success/10',
                                        )}
                                    >
                                        {markingComplete ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : isCurrentTrainingUnitCompleted ? (
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                        ) : (
                                            <Circle className="mr-2 h-4 w-4" />
                                        )}
                                        {isCurrentTrainingUnitCompleted
                                            ? 'Completed'
                                            : 'Mark Complete'}
                                    </Button>
                                </div>
                                {/* Video Player */}
                                {trainingUnit.type === 'video' &&
                                    trainingUnit.videoUrl && (
                                        <div className="mb-8">
                                            <VideoPlayer
                                                src={trainingUnit.videoUrl}
                                                title={trainingUnit.title}
                                                onComplete={() => {
                                                    // Auto-mark as complete when video finishes
                                                    if (
                                                        !completedTrainingUnitIds.some(
                                                            (id) =>
                                                                isSameId(
                                                                    id,
                                                                    trainingUnit.id,
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
                                {trainingUnit.type === 'video' &&
                                    !trainingUnit.videoUrl && (
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
                                {trainingUnit.type === 'reading' && article && (
                                    <div className="mb-8">
                                        <ArticleReader article={article} />
                                    </div>
                                )}
                                {/* Module Content */}
                                <Card className="mb-8">
                                    <CardContent className="py-6">
                                        {trainingUnit.content ? (
                                            <p className="leading-relaxed whitespace-pre-line text-foreground">
                                                {trainingUnit.content}
                                            </p>
                                        ) : (
                                            <p className="text-muted-foreground italic">
                                                No content has been added for
                                                this module yet.
                                            </p>
                                        )}
                                        {/* Training Objectives */}
                                        {normalizedObjectives.length > 0 && (
                                            <div className="mt-6 border-t border-border pt-6">
                                                <h3 className="mb-3 font-heading text-lg font-semibold text-foreground">
                                                    Training Objectives
                                                </h3>
                                                <ul className="space-y-2">
                                                    {normalizedObjectives.map(
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
                                        {normalizedResources.length > 0 && (
                                            <div className="mt-6 border-t border-border pt-6">
                                                <h3 className="mb-3 font-heading text-lg font-semibold text-foreground">
                                                    Resources
                                                </h3>
                                                <ul className="space-y-2">
                                                    {normalizedResources.map(
                                                        (res, i) => (
                                                            <li key={i}>
                                                                <a
                                                                    href={res}
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
                                {(trainingUnit.vmEnabled ||
                                    trainingUnit.type === 'vm-lab') && (
                                    <div className="mb-8">
                                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                                            <Terminal className="h-5 w-5 text-primary" />
                                            Virtual Machine Lab
                                        </h3>
                                        <VMLabPanel
                                            vmInfo={vmInfo ?? null}
                                            trainingUnitId={Number(
                                                trainingUnit.id,
                                            )}
                                            onOpenSessionInSplit={
                                                handleOpenSessionInSplit
                                            }
                                        />
                                        {/* Additional VM Template Selection */}
                                        <div className="mt-6">
                                            <VirtualMachinePanel />
                                        </div>
                                    </div>
                                )}
                                {/* Discussion Forum Section */}
                                <div className="mb-8">
                                    <Card>
                                        <CardContent className="pt-6">
                                            {isDiscussionComposerOpen && (
                                                <div className="mb-6 space-y-3 rounded-lg border border-border bg-muted/20 p-4">
                                                    <h4 className="font-medium text-foreground">
                                                        Start a New Discussion
                                                    </h4>
                                                    <Input
                                                        value={
                                                            newDiscussionTitle
                                                        }
                                                        onChange={(event) =>
                                                            setNewDiscussionTitle(
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        placeholder="Discussion title"
                                                        maxLength={255}
                                                    />
                                                    <Textarea
                                                        value={
                                                            newDiscussionContent
                                                        }
                                                        onChange={(event) =>
                                                            setNewDiscussionContent(
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        placeholder="Describe your question or discussion topic..."
                                                        rows={5}
                                                        maxLength={10000}
                                                    />
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setIsDiscussionComposerOpen(
                                                                    false,
                                                                );
                                                                setNewDiscussionTitle(
                                                                    '',
                                                                );
                                                                setNewDiscussionContent(
                                                                    '',
                                                                );
                                                            }}
                                                            disabled={
                                                                isCreatingDiscussion
                                                            }
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            onClick={() =>
                                                                void handleCreateDiscussion()
                                                            }
                                                            disabled={
                                                                isCreatingDiscussion
                                                            }
                                                        >
                                                            {isCreatingDiscussion
                                                                ? 'Posting...'
                                                                : 'Post Discussion'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            <ThreadList
                                                threads={threads}
                                                onNewThread={() =>
                                                    setIsDiscussionComposerOpen(
                                                        true,
                                                    )
                                                }
                                                onUpvote={(threadId) =>
                                                    upvoteThread(threadId)
                                                }
                                                showNewButton={true}
                                                returnTo={`/trainingPaths/${trainingPath.id}/trainingUnit/${trainingUnit.id}`}
                                                emptyTitle="No discussions yet"
                                                emptyDescription="Be the first to ask a question or start a discussion about this trainingUnit!"
                                            />
                                        </CardContent>
                                    </Card>
                                </div>
                                {/* Navigation */}
                                <div className="flex items-center justify-between border-t border-border pt-6">
                                    {prevTrainingUnit ? (
                                        <Button variant="outline" asChild>
                                            <Link
                                                href={`/trainingPaths/${trainingPath.id}/trainingUnit/${prevTrainingUnit.id}`}
                                            >
                                                <ArrowLeft className="mr-2 h-4 w-4" />{' '}
                                                Previous
                                            </Link>
                                        </Button>
                                    ) : (
                                        <div />
                                    )}
                                    {nextTrainingUnit ? (
                                        <Button
                                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                                            asChild
                                        >
                                            <Link
                                                href={`/trainingPaths/${trainingPath.id}/trainingUnit/${nextTrainingUnit.id}`}
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
                                                href={`/trainingPaths/${trainingPath.id}`}
                                            >
                                                <CheckCircle2 className="mr-2 h-4 w-4" />{' '}
                                                Complete TrainingPath
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {splitSessionId && (
                    <>
                        <div
                            role="separator"
                            aria-orientation="vertical"
                            aria-label="Resize lesson and VM split"
                            className="relative w-3 shrink-0 cursor-col-resize self-stretch"
                            onPointerDown={(event) => {
                                event.preventDefault();
                                setIsResizingSplit(true);
                            }}
                        >
                            <div
                                className={`absolute inset-y-0 left-1/2 w-px -translate-x-1/2 ${
                                    isResizingSplit ? 'bg-primary' : 'bg-border'
                                }`}
                            />
                            <div
                                className={`absolute top-1/2 left-1/2 h-10 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border ${
                                    isResizingSplit
                                        ? 'border-primary/40 bg-primary/10'
                                        : 'border-border bg-background'
                                }`}
                            />
                        </div>

                        <div
                            className="flex min-w-0 shrink-0 flex-col bg-background"
                            style={{ width: `${100 - splitLeftWidth}%` }}
                        >
                            <div className="flex items-center justify-between border-b border-border px-4 py-3">
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground">
                                        VM Workspace
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Split view from this lesson page
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button size="sm" variant="outline" asChild>
                                        <Link
                                            href={`/sessions/${splitSessionId}`}
                                        >
                                            <Maximize2 className="mr-2 h-4 w-4" />
                                            Full Page VM
                                        </Link>
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={handleCloseSplitSession}
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        Close
                                    </Button>
                                </div>
                            </div>

                            <div className="min-h-0 flex-1 p-4">
                                <div className="h-full overflow-hidden rounded-lg border border-border/40 bg-background">
                                    <GuacamoleViewer
                                        sessionId={splitSessionId}
                                        isActive={true}
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
            {/* Notes Panel - Fixed sidebar */}
            {!splitSessionId && (
                <NotesPanel trainingUnitId={Number(trainingUnit.id)} />
            )}
        </AppLayout>
    );
}
