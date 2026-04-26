/**
 * Edit TrainingUnit Page - Professional Content Editor
 * Teacher view for editing individual trainingUnit content with rich features.
 * Uses unified AppLayout and Inertia props.
 */
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    BarChart3,
    BookOpen,
    Check,
    CheckCircle2,
    Clock,
    ExternalLink,
    Eye,
    FileText,
    GripVertical,
    Link2,
    List,
    Loader2,
    Monitor,
    Play,
    Plus,
    Save,
    Settings,
    Sparkles,
    Terminal,
    Trash2,
    Video,
    XCircle,
    Zap,
} from 'lucide-react';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { getOrCreateQuiz } from '@/api/quiz.api';
import * as teachingApi from '@/api/teaching.api';
import * as videoApi from '@/api/video.api';
import { trainingUnitVMAssignmentApi } from '@/api/vm.api';
import { TeacherQuizStatsPanel } from '@/components/quiz/TeacherQuizStatsPanel';
import VideoUpload from '@/components/TrainingPaths/VideoUpload';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { TrainingUnit, TrainingPath } from '@/types/TrainingPath.types';
import type { TrainingUnitVMAssignment } from '@/types/vm.types';

// TrainingUnit type configuration
const trainingUnitTypeConfig = {
    video: {
        icon: Video,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        label: 'Video Module',
    },
    reading: {
        icon: FileText,
        color: 'text-green-500',
        bg: 'bg-green-500/10',
        label: 'Reference Material',
    },
    practice: {
        icon: Zap,
        color: 'text-yellow-500',
        bg: 'bg-yellow-500/10',
        label: 'Practical Exercise',
    },
    'vm-lab': {
        icon: Terminal,
        color: 'text-violet-500',
        bg: 'bg-violet-500/10',
        label: 'VM Lab Module',
    },
    lab: {
        icon: Terminal,
        color: 'text-violet-500',
        bg: 'bg-violet-500/10',
        label: 'VM Lab Module',
    },
    article: {
        icon: FileText,
        color: 'text-green-500',
        bg: 'bg-green-500/10',
        label: 'Reference Material',
    },
};
interface Resource {
    id: string;
    title: string;
    url: string;
    type: 'link' | 'file' | 'download';
}

function normalizeQualityList(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value.filter((item): item is string => typeof item === 'string');
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();

        if (!trimmed) {
            return [];
        }

        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
                return parsed.filter(
                    (item): item is string => typeof item === 'string',
                );
            }
        } catch {
            return trimmed
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean);
        }
    }

    return [];
}

function normalizeVideoStatus(
    status: videoApi.VideoStatus | null,
): videoApi.VideoStatus | null {
    if (!status) {
        return null;
    }

    return {
        ...status,
        available_qualities: normalizeQualityList(status.available_qualities),
    };
}
// VM Assignment from backend
interface EditTrainingUnitPageProps {
    trainingPathId: string;
    moduleId: string;
    trainingUnitId: string;
    trainingUnit: TrainingUnit;
    trainingPath: TrainingPath;
    vmAssignment?: TrainingUnitVMAssignment | null;
}
export default function EditTrainingUnitPage({
    trainingPathId,
    moduleId,
    trainingUnitId,
    trainingUnit,
    trainingPath,
    vmAssignment,
}: EditTrainingUnitPageProps) {
    // Form state initialized from backend props
    const [title, setTitle] = useState(trainingUnit?.title || '');
    const [trainingUnitType, setTrainingUnitType] = useState<
        'video' | 'reading' | 'practice' | 'vm-lab'
    >(
        (trainingUnit?.type as 'video' | 'reading' | 'practice' | 'vm-lab') ||
            'reading',
    );
    const [duration, setDuration] = useState(trainingUnit?.duration || '');
    const [content, setContent] = useState(trainingUnit?.content || '');
    const [objectives, setObjectives] = useState(
        (trainingUnit?.objectives || []).join('\n'),
    );
    const [vmEnabled, setVmEnabled] = useState(
        trainingUnit?.vmEnabled || false,
    );
    const [freePreview, setFreePreview] = useState(false);
    const [downloadable, setDownloadable] = useState(false);
    const [videoUrl, setVideoUrl] = useState(
        trainingUnit?.externalVideoUrl || '',
    );
    const [activeTab, setActiveTab] = useState('content');
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [resources, setResources] = useState<Resource[]>(() => {
        // Initialize resources from trainingUnit data
        const trainingUnitResources = trainingUnit?.resources || [];
        if (trainingUnitResources.length === 0) {
            return [{ id: '1', title: '', url: '', type: 'link' as const }];
        }
        return trainingUnitResources.map((url, i) => ({
            id: String(i + 1),
            title: '',
            url: url,
            type: 'link' as const,
        }));
    });
    // VM Template removed - feature not available
    const [videoStatus, setVideoStatus] = useState<videoApi.VideoStatus | null>(
        null,
    );
    const [uploadedVideo, setUploadedVideo] = useState<videoApi.Video | null>(
        null,
    );
    const [teacherQuiz, setTeacherQuiz] = useState<{
        id: string;
        title: string;
    } | null>(null);
    const [isQuizLookupLoading, setIsQuizLookupLoading] = useState(false);
    const [isQuizStatsOpen, setIsQuizStatsOpen] = useState(false);
    // VM Assignment dialog state
    const [currentVmAssignment, setCurrentVmAssignment] =
        useState<TrainingUnitVMAssignment | null>(vmAssignment || null);
    const [showVMDialog, setShowVMDialog] = useState(false);
    const [availableVMs, setAvailableVMs] = useState<
        Array<{
            vmid: number;
            name: string;
            node_id: number;
            node_name: string;
            status: string;
        }>
    >([]);
    const [loadingVMs, setLoadingVMs] = useState(false);
    const [selectedVM, setSelectedVM] = useState<{
        vmid: number;
        name: string;
        node_id: number;
    } | null>(null);
    const [vmNotes, setVmNotes] = useState('');
    const [submittingVM, setSubmittingVM] = useState(false);
    const editorTabsRef = useRef<HTMLDivElement | null>(null);
    const resolvedVideoPreviewUrl =
        videoStatus?.hls_url || uploadedVideo?.hls_url || videoUrl || '';
    const uploadedStreamUrl =
        videoStatus?.hls_url ||
        uploadedVideo?.hls_url ||
        trainingUnit?.uploadedVideoUrl ||
        '';
    const refreshVideoData = useCallback(async () => {
        if (trainingUnit?.type !== 'video') {
            setVideoStatus(null);
            setUploadedVideo(null);

            return;
        }

        try {
            const [status, video] = await Promise.all([
                videoApi.getVideoStatus(parseInt(trainingUnitId)),
                videoApi.getVideoForTrainingUnit(parseInt(trainingUnitId)),
            ]);

            setVideoStatus(normalizeVideoStatus(status));
            setUploadedVideo(video);
        } catch {
            setVideoStatus(null);
            setUploadedVideo(null);
        }
    }, [trainingUnitId, trainingUnit?.type]);

    // Fetch video status on mount
    useEffect(() => {
        void refreshVideoData();
    }, [refreshVideoData]);
    useEffect(() => {
        if (trainingUnitType !== 'practice') {
            setTeacherQuiz(null);
            setIsQuizLookupLoading(false);
            return;
        }

        let cancelled = false;
        setIsQuizLookupLoading(true);

        getOrCreateQuiz(trainingUnitId)
            .then((quiz) => {
                if (cancelled) {
                    return;
                }

                setTeacherQuiz(
                    quiz
                        ? {
                              id: String(quiz.id),
                              title: quiz.title,
                          }
                        : null,
                );
            })
            .catch(() => {
                if (!cancelled) {
                    setTeacherQuiz(null);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setIsQuizLookupLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [trainingUnitId, trainingUnitType]);

    const openMediaTab = useCallback(() => {
        setActiveTab('media');
        requestAnimationFrame(() => {
            editorTabsRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        });
    }, []);
    // Calculate completion
    const completionItems = [
        { done: content.length > 50, label: 'Content added' },
        {
            done: objectives.split('\n').filter(Boolean).length > 0,
            label: 'Objectives set',
        },
        {
            done: resources.some((r) => r.url.trim() !== ''),
            label: 'Resources linked',
        },
    ];
    const completionPercent = Math.round(
        (completionItems.filter((i) => i.done).length /
            completionItems.length) *
            100,
    );
    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: 'Teaching', href: '/teaching' },
            {
                title: trainingPath?.title ?? 'TrainingPath',
                href: `/teaching/${trainingPathId}/edit`,
            },
            {
                title: trainingUnit?.title ?? 'TrainingUnit',
                href: `/teaching/${trainingPathId}/module/${moduleId}/trainingUnit/${trainingUnitId}`,
            },
        ],
        [trainingPath, trainingPathId, moduleId, trainingUnitId, trainingUnit],
    );
    const addResource = useCallback(() => {
        setResources([
            ...resources,
            { id: Date.now().toString(), title: '', url: '', type: 'link' },
        ]);
    }, [resources]);
    const updateResource = useCallback(
        (index: number, field: keyof Resource, value: string) => {
            const updated = [...resources];
            updated[index] = { ...updated[index], [field]: value };
            setResources(updated);
        },
        [resources],
    );
    const removeResource = useCallback(
        (index: number) => {
            setResources(resources.filter((_, i) => i !== index));
        },
        [resources],
    );
    // Handle video upload
    const handleVideoUpload = useCallback(
        async (file: File) => {
            if (!file) return;

            const unitId = parseInt(trainingUnitId);
            const syncExistingVideoState = async (): Promise<boolean> => {
                const latestStatus = normalizeVideoStatus(
                    await videoApi.getVideoStatus(unitId),
                );

                setVideoStatus(latestStatus);

                if (!latestStatus?.has_video) {
                    setUploadedVideo(null);
                    return false;
                }

                return true;
            };

            const runUpload = async () =>
                videoApi.uploadVideo(unitId, file, () => {});

            try {
                if (
                    (await syncExistingVideoState()) ||
                    videoStatus?.has_video
                ) {
                    await videoApi.deleteVideo(unitId);
                    setVideoStatus({ has_video: false });
                    setUploadedVideo(null);
                }

                const uploaded = await runUpload();
                setUploadedVideo(uploaded);
                setVideoStatus({
                    has_video: true,
                    status: uploaded.status,
                    is_ready: uploaded.is_ready,
                    is_processing: uploaded.is_processing,
                    has_failed: uploaded.has_failed,
                    error_message: uploaded.error_message ?? null,
                    duration_seconds: uploaded.duration_seconds,
                    available_qualities: uploaded.available_qualities,
                    resolution_width: uploaded.resolution_width,
                    resolution_height: uploaded.resolution_height,
                    original_filename: uploaded.original_filename,
                    file_size_bytes: uploaded.file_size_bytes,
                    hls_url: uploaded.hls_url ?? null,
                    thumbnail_url: uploaded.thumbnail_url,
                });
                toast.success('Video uploaded!', {
                    description:
                        'Transcoding started. This may take a few minutes.',
                });
                // Poll for status updates
                videoApi
                    .pollUntilReady(unitId, 3000, 60, (status) =>
                        setVideoStatus(normalizeVideoStatus(status)),
                    )
                    .then(() => refreshVideoData())
                    .catch(() => {});
            } catch (error: unknown) {
                const duplicateVideoMessage =
                    typeof error === 'object' &&
                    error !== null &&
                    'response' in error &&
                    (
                        error as {
                            response?: {
                                status?: number;
                                data?: { message?: string };
                            };
                        }
                    ).response?.status === 422 &&
                    (
                        (
                            error as {
                                response?: {
                                    data?: { message?: string };
                                };
                            }
                        ).response?.data?.message || ''
                    )
                        .toLowerCase()
                        .includes('already has a video');

                if (duplicateVideoMessage) {
                    try {
                        if (await syncExistingVideoState()) {
                            await videoApi.deleteVideo(unitId);
                            setVideoStatus({ has_video: false });
                            setUploadedVideo(null);
                        }

                        const uploaded = await runUpload();
                        setUploadedVideo(uploaded);
                        setVideoStatus({
                            has_video: true,
                            status: uploaded.status,
                            is_ready: uploaded.is_ready,
                            is_processing: uploaded.is_processing,
                            has_failed: uploaded.has_failed,
                            error_message: uploaded.error_message ?? null,
                            duration_seconds: uploaded.duration_seconds,
                            available_qualities: uploaded.available_qualities,
                            resolution_width: uploaded.resolution_width,
                            resolution_height: uploaded.resolution_height,
                            original_filename: uploaded.original_filename,
                            file_size_bytes: uploaded.file_size_bytes,
                            hls_url: uploaded.hls_url ?? null,
                            thumbnail_url: uploaded.thumbnail_url,
                        });
                        toast.success('Video replaced!', {
                            description:
                                'The existing video was replaced and transcoding restarted.',
                        });

                        videoApi
                            .pollUntilReady(unitId, 3000, 60, (status) =>
                                setVideoStatus(normalizeVideoStatus(status)),
                            )
                            .then(() => refreshVideoData())
                            .catch(() => {});

                        return;
                    } catch {
                        // Fall through to the normal error handling below.
                    }
                }

                const message =
                    typeof error === 'object' &&
                    error !== null &&
                    'response' in error
                        ? (() => {
                              const response = (
                                  error as {
                                      response?: {
                                          data?: {
                                              message?: string;
                                              errors?: Record<string, string[]>;
                                          };
                                      };
                                  }
                              ).response;
                              const fieldErrors = response?.data?.errors
                                  ? Object.values(response.data.errors)
                                        .flat()
                                        .join(' ')
                                  : '';

                              return (
                                  response?.data?.message ||
                                  fieldErrors ||
                                  'Upload failed'
                              );
                          })()
                        : error instanceof Error
                          ? error.message
                          : 'Upload failed';
                toast.error('Upload failed', { description: message });
                await refreshVideoData();
            }
        },
        [trainingUnitId, videoStatus?.has_video, refreshVideoData],
    );

    // Handle video upload for VideoUpload component (returns URL)
    const handleVideoUploadForComponent = useCallback(
        async (file: File): Promise<string> => {
            await handleVideoUpload(file);
            return ''; // Return empty string to keep using the blob URL for preview
        },
        [handleVideoUpload],
    );

    const handleVideoRemove = useCallback(async () => {
        if (!videoStatus?.has_video) {
            return;
        }

        try {
            await videoApi.deleteVideo(parseInt(trainingUnitId));
            setVideoStatus({ has_video: false });
            setUploadedVideo(null);
            toast.success('Video removed');
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Failed to remove video';
            toast.error('Failed to remove video', { description: message });
        }
    }, [trainingUnitId, videoStatus?.has_video]);

    const handleRetryVideo = useCallback(async () => {
        try {
            const retried = await videoApi.retryTranscoding(
                parseInt(trainingUnitId),
            );
            setUploadedVideo(retried);
            setVideoStatus({
                has_video: true,
                status: retried.status,
                is_ready: retried.is_ready,
                is_processing: retried.is_processing,
                has_failed: retried.has_failed,
                error_message: retried.error_message ?? null,
                duration_seconds: retried.duration_seconds,
                available_qualities: retried.available_qualities,
                resolution_width: retried.resolution_width,
                resolution_height: retried.resolution_height,
                original_filename: retried.original_filename,
                file_size_bytes: retried.file_size_bytes,
                hls_url: retried.hls_url ?? null,
                thumbnail_url: retried.thumbnail_url,
            });
            toast.success('Transcoding restarted');

            videoApi
                .pollUntilReady(parseInt(trainingUnitId), 3000, 60, (status) =>
                    setVideoStatus(normalizeVideoStatus(status)),
                )
                .then(() => refreshVideoData())
                .catch(() => {});
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : 'Retry failed';
            toast.error('Failed to retry transcoding', {
                description: message,
            });
        }
    }, [trainingUnitId, refreshVideoData]);

    // Handle trainingUnit save - ACTUAL API CALL
    const handleSave = useCallback(async () => {
        setIsSaving(true);
        try {
            await teachingApi.updateTrainingUnit(
                String(trainingPathId),
                String(moduleId),
                String(trainingUnitId),
                {
                    title,
                    type: trainingUnitType,
                    duration: duration || undefined,
                    content,
                    objectives: objectives.split('\n').filter(Boolean),
                    resources: resources
                        .filter((r) => r.url.trim() !== '')
                        .map((r) => r.url),
                    vm_enabled: vmEnabled,
                    video_url: videoUrl || undefined,
                },
            );
            setLastSaved(new Date());
            toast.success('TrainingUnit saved!', {
                description: 'Your changes have been saved successfully.',
            });
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : 'Save failed';
            toast.error('Failed to save trainingUnit', {
                description: message,
            });
        } finally {
            setIsSaving(false);
        }
    }, [
        trainingPathId,
        moduleId,
        trainingUnitId,
        title,
        trainingUnitType,
        duration,
        content,
        objectives,
        resources,
        vmEnabled,
        videoUrl,
    ]);
    if (!trainingUnit) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="TrainingUnit Not Found" />
                <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 p-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">
                        TrainingUnit not found.
                    </p>
                    <Button variant="outline" asChild>
                        <Link href="/teaching">Back to Dashboard</Link>
                    </Button>
                </div>
            </AppLayout>
        );
    }
    const typeConfig =
        trainingUnitTypeConfig[
            trainingUnitType as keyof typeof trainingUnitTypeConfig
        ] || trainingUnitTypeConfig.video;
    const TypeIcon = typeConfig.icon;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${trainingUnit.title}`} />
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
                <div className="container max-w-6xl py-6">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 flex items-start justify-between gap-4"
                    >
                        <div className="flex items-start gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="mt-1"
                            >
                                <Link href={`/teaching/${trainingPathId}/edit`}>
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <div>
                                <div className="mb-1 flex items-center gap-3">
                                    <div
                                        className={`h-10 w-10 rounded-xl ${typeConfig.bg} flex items-center justify-center`}
                                    >
                                        <TypeIcon
                                            className={`h-5 w-5 ${typeConfig.color}`}
                                        />
                                    </div>
                                    <div>
                                        <h1 className="font-heading text-xl font-bold text-foreground">
                                            {trainingUnit.title}
                                        </h1>
                                        <p className="text-sm text-muted-foreground">
                                            {trainingPath.title} /{' '}
                                            {trainingPath?.modules?.find(
                                                (m) =>
                                                    m.id.toString() ===
                                                    moduleId.toString(),
                                            )?.title || 'Unknown Module'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Save status */}
                            <div className="text-right">
                                {lastSaved && (
                                    <p className="text-xs text-muted-foreground">
                                        Last saved{' '}
                                        {lastSaved.toLocaleTimeString()}
                                    </p>
                                )}
                            </div>
                            <Badge
                                variant="outline"
                                className={`${typeConfig.bg} ${typeConfig.color} border-0`}
                            >
                                {typeConfig.label}
                            </Badge>
                            <Badge variant="outline" className="gap-1">
                                <Clock className="h-3 w-3" />
                                {trainingUnit.duration}
                            </Badge>
                        </div>
                    </motion.div>
                    {/* Main content area */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Left: Editor */}
                        <div
                            ref={editorTabsRef}
                            className="space-y-6 lg:col-span-2"
                        >
                            <Tabs
                                value={activeTab}
                                onValueChange={setActiveTab}
                                className="w-full"
                            >
                                <TabsList className="w-full justify-start bg-muted/50 p-1">
                                    <TabsTrigger
                                        value="content"
                                        className="gap-2"
                                    >
                                        <FileText className="h-4 w-4" />
                                        Content
                                    </TabsTrigger>
                                    {(trainingUnitType === 'video' ||
                                        trainingUnitType === 'vm-lab' ||
                                        vmEnabled) && (
                                        <TabsTrigger
                                            value="media"
                                            className="gap-2"
                                        >
                                            {trainingUnitType === 'video' ? (
                                                <Video className="h-4 w-4" />
                                            ) : (
                                                <Terminal className="h-4 w-4" />
                                            )}
                                            {trainingUnitType === 'video'
                                                ? vmEnabled
                                                    ? 'Video & Lab'
                                                    : 'Video'
                                                : 'VM Setup'}
                                        </TabsTrigger>
                                    )}
                                    <TabsTrigger
                                        value="resources"
                                        className="gap-2"
                                    >
                                        <Link2 className="h-4 w-4" />
                                        Resources
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="settings"
                                        className="gap-2"
                                    >
                                        <Settings className="h-4 w-4" />
                                        Settings
                                    </TabsTrigger>
                                </TabsList>
                                {/* Content Tab */}
                                <TabsContent
                                    value="content"
                                    className="mt-4 space-y-4"
                                >
                                    {/* TrainingUnit Metadata Card */}
                                    <Card className="shadow-card">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="flex items-center gap-2 font-heading text-lg">
                                                <Settings className="h-5 w-5 text-primary" />
                                                TrainingUnit Details
                                            </CardTitle>
                                            <CardDescription>
                                                Basic information about this
                                                trainingUnit
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid gap-4 md:grid-cols-3">
                                                {/* Title Input */}
                                                <div className="md:col-span-2">
                                                    <Label
                                                        htmlFor="trainingUnit-title"
                                                        className="text-sm font-medium"
                                                    >
                                                        Title{' '}
                                                        <span className="text-destructive">
                                                            *
                                                        </span>
                                                    </Label>
                                                    <Input
                                                        id="trainingUnit-title"
                                                        placeholder="Enter trainingUnit title"
                                                        value={title}
                                                        onChange={(e) =>
                                                            setTitle(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="mt-1.5"
                                                        required
                                                    />
                                                </div>
                                                {/* Duration Input */}
                                                <div>
                                                    <Label
                                                        htmlFor="trainingUnit-duration"
                                                        className="text-sm font-medium"
                                                    >
                                                        Duration
                                                    </Label>
                                                    <Input
                                                        id="trainingUnit-duration"
                                                        placeholder="e.g., 45 minutes"
                                                        value={duration}
                                                        onChange={(e) =>
                                                            setDuration(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="mt-1.5"
                                                    />
                                                </div>
                                            </div>
                                            {/* Type Select */}
                                            <div className="max-w-xs">
                                                <Label
                                                    htmlFor="trainingUnit-type"
                                                    className="text-sm font-medium"
                                                >
                                                    TrainingUnit Type{' '}
                                                    <span className="text-destructive">
                                                        *
                                                    </span>
                                                </Label>
                                                <Select
                                                    value={trainingUnitType}
                                                    onValueChange={(
                                                        value:
                                                            | 'video'
                                                            | 'reading'
                                                            | 'practice'
                                                            | 'vm-lab',
                                                    ) => {
                                                        setTrainingUnitType(
                                                            value,
                                                        );
                                                        if (
                                                            value === 'vm-lab'
                                                        ) {
                                                            setVmEnabled(true);
                                                        }
                                                    }}
                                                >
                                                    <SelectTrigger
                                                        id="trainingUnit-type"
                                                        className="mt-1.5"
                                                    >
                                                        <SelectValue placeholder="Select module type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="video">
                                                            <span className="flex items-center gap-2">
                                                                <Video className="h-4 w-4 text-blue-500" />
                                                                Video Module
                                                            </span>
                                                        </SelectItem>
                                                        <SelectItem value="reading">
                                                            <span className="flex items-center gap-2">
                                                                <FileText className="h-4 w-4 text-green-500" />
                                                                Reference
                                                                Material
                                                            </span>
                                                        </SelectItem>
                                                        <SelectItem value="practice">
                                                            <span className="flex items-center gap-2">
                                                                <Zap className="h-4 w-4 text-yellow-500" />
                                                                Practical
                                                                Exercise
                                                            </span>
                                                        </SelectItem>
                                                        <SelectItem value="vm-lab">
                                                            <span className="flex items-center gap-2">
                                                                <Terminal className="h-4 w-4 text-violet-500" />
                                                                VM Lab Module
                                                            </span>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    {/* Module Content Card */}
                                    <Card className="shadow-card">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="flex items-center gap-2 font-heading text-lg">
                                                <Sparkles className="h-5 w-5 text-primary" />
                                                Module Content
                                            </CardTitle>
                                            <CardDescription>
                                                Write the main content for this
                                                module. Use markdown for
                                                formatting.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            {/* Content editor */}
                                            <div>
                                                <div className="mb-2 flex items-center justify-between">
                                                    <Label className="text-sm font-medium">
                                                        Main Content
                                                    </Label>
                                                    <span className="text-xs text-muted-foreground">
                                                        {content.length}{' '}
                                                        characters
                                                    </span>
                                                </div>
                                                <Textarea
                                                    placeholder="Write your module content here...
## Introduction
Start with an overview of what operators will learn.
## Key Concepts
Explain the main ideas with examples.
## Summary
Recap the important points."
                                                    value={content}
                                                    onChange={(e) =>
                                                        setContent(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="min-h-[350px] resize-none font-mono text-sm"
                                                />
                                                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                                                    <span>
                                                        Supports Markdown:
                                                        **bold**, *italic*,
                                                        `code`, ## headings
                                                    </span>
                                                </div>
                                            </div>
                                            <Separator />
                                            {/* Learning objectives */}
                                            <div>
                                                <Label className="flex items-center gap-2 text-sm font-medium">
                                                    <List className="h-4 w-4 text-green-500" />
                                                    Training Objectives
                                                </Label>
                                                <p className="mt-0.5 mb-2 text-xs text-muted-foreground">
                                                    What will operators be able
                                                    to do after this module?
                                                    (One per line)
                                                </p>
                                                <Textarea
                                                    placeholder="Understand the basics of IoT sensors&#10;Configure a Raspberry Pi for data collection&#10;Write Python code to read sensor data"
                                                    value={objectives}
                                                    onChange={(e) =>
                                                        setObjectives(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="min-h-[120px] resize-none"
                                                    rows={5}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                {/* Media Tab (Video or VM) */}
                                <TabsContent value="media" className="mt-4">
                                    <Card className="shadow-card">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="flex items-center gap-2 font-heading text-lg">
                                                {trainingUnitType ===
                                                'video' ? (
                                                    <>
                                                        <Video className="h-5 w-5 text-blue-500" />
                                                        {vmEnabled
                                                            ? 'Video & Lab Content'
                                                            : 'Video Content'}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Terminal className="h-5 w-5 text-violet-500" />
                                                        Virtual Machine Setup
                                                    </>
                                                )}
                                            </CardTitle>
                                            <CardDescription>
                                                {trainingUnitType === 'video'
                                                    ? vmEnabled
                                                        ? 'Configure both video and VM environment'
                                                        : 'Add a video for students to watch'
                                                    : 'Configure the VM environment for this lab'}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            {trainingUnitType === 'video' && (
                                                <>
                                                    {/* Video Status Display */}
                                                    {videoStatus?.has_video && (
                                                        <div
                                                            className={`rounded-lg border p-4 ${
                                                                videoStatus.is_ready
                                                                    ? 'border-green-500/30 bg-green-500/5'
                                                                    : videoStatus.has_failed
                                                                      ? 'border-destructive/30 bg-destructive/5'
                                                                      : 'border-primary/30 bg-primary/5'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                {videoStatus.is_ready && (
                                                                    <>
                                                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                                        <div>
                                                                            <p className="font-medium text-green-600 dark:text-green-400">
                                                                                Video
                                                                                Ready
                                                                            </p>
                                                                            <p className="text-xs text-muted-foreground">
                                                                                Duration:{' '}
                                                                                {videoStatus.duration_seconds
                                                                                    ? `${Math.floor(videoStatus.duration_seconds / 60)}m ${videoStatus.duration_seconds % 60}s`
                                                                                    : 'Unknown'}
                                                                            </p>
                                                                            {(videoStatus.resolution_width ||
                                                                                videoStatus.resolution_height) && (
                                                                                <p className="text-xs text-muted-foreground">
                                                                                    Source:{' '}
                                                                                    {videoStatus.resolution_width ??
                                                                                        '?'}

                                                                                    x
                                                                                    {videoStatus.resolution_height ??
                                                                                        '?'}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </>
                                                                )}
                                                                {videoStatus.is_processing && (
                                                                    <>
                                                                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                                                        <div>
                                                                            <p className="font-medium text-primary">
                                                                                Processing
                                                                                Video...
                                                                            </p>
                                                                            <p className="text-xs text-muted-foreground">
                                                                                This
                                                                                may
                                                                                take
                                                                                a
                                                                                few
                                                                                minutes
                                                                            </p>
                                                                        </div>
                                                                    </>
                                                                )}
                                                                {videoStatus.has_failed && (
                                                                    <>
                                                                        <XCircle className="h-5 w-5 text-destructive" />
                                                                        <div>
                                                                            <p className="font-medium text-destructive">
                                                                                Processing
                                                                                Failed
                                                                            </p>
                                                                            <p className="text-xs text-muted-foreground">
                                                                                {videoStatus.error_message ||
                                                                                    'Unknown error'}
                                                                            </p>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                            {!!normalizeQualityList(
                                                                videoStatus.available_qualities,
                                                            ).length && (
                                                                <div className="mt-3 flex flex-wrap gap-2">
                                                                    {normalizeQualityList(
                                                                        videoStatus.available_qualities,
                                                                    ).map(
                                                                        (
                                                                            quality,
                                                                        ) => (
                                                                            <Badge
                                                                                key={
                                                                                    quality
                                                                                }
                                                                                variant="secondary"
                                                                            >
                                                                                {
                                                                                    quality
                                                                                }
                                                                            </Badge>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            )}
                                                            <div className="mt-3 flex flex-wrap gap-2">
                                                                {videoStatus.has_failed && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() =>
                                                                            void handleRetryVideo()
                                                                        }
                                                                    >
                                                                        Retry
                                                                        Processing
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() =>
                                                                        void handleVideoRemove()
                                                                    }
                                                                    className="text-muted-foreground hover:text-destructive"
                                                                >
                                                                    Delete
                                                                    Upload
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {/* External Video URL input */}
                                                    <div>
                                                        <Label className="text-sm font-medium">
                                                            External Video URL
                                                        </Label>
                                                        <p className="mt-0.5 mb-2 text-xs text-muted-foreground">
                                                            Paste a YouTube,
                                                            Vimeo, or direct
                                                            video URL. Uploaded
                                                            platform videos are
                                                            shown separately
                                                            below.
                                                        </p>
                                                        <div className="flex gap-2">
                                                            <Input
                                                                placeholder="https://youtube.com/watch?v=..."
                                                                value={videoUrl}
                                                                onChange={(e) =>
                                                                    setVideoUrl(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="flex-1"
                                                            />
                                                            {videoUrl && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    asChild
                                                                >
                                                                    <a
                                                                        href={
                                                                            videoUrl
                                                                        }
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                    >
                                                                        <ExternalLink className="h-4 w-4" />
                                                                    </a>
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {uploadedStreamUrl && (
                                                        <div>
                                                            <Label className="text-sm font-medium">
                                                                Uploaded Stream
                                                            </Label>
                                                            <p className="mt-0.5 mb-2 text-xs text-muted-foreground">
                                                                This is the
                                                                generated
                                                                platform stream
                                                                URL used for
                                                                uploaded videos.
                                                            </p>
                                                            <div className="flex gap-2">
                                                                <Input
                                                                    value={
                                                                        uploadedStreamUrl
                                                                    }
                                                                    readOnly
                                                                    className="flex-1 font-mono text-xs"
                                                                />
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    asChild
                                                                >
                                                                    <a
                                                                        href={
                                                                            uploadedStreamUrl
                                                                        }
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                    >
                                                                        <ExternalLink className="h-4 w-4" />
                                                                    </a>
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {/* Video preview placeholder */}
                                                    <div className="flex aspect-video flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/30">
                                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                                            <Play className="ml-1 h-8 w-8 text-primary" />
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            {videoStatus?.is_ready
                                                                ? 'Video ready for playback'
                                                                : videoStatus?.is_processing
                                                                  ? 'Video uploaded and processing'
                                                                  : resolvedVideoPreviewUrl
                                                                    ? 'Video linked and available'
                                                                    : uploadedVideo
                                                                      ? 'Uploaded video saved'
                                                                      : 'No video added yet'}
                                                        </p>
                                                    </div>
                                                    {/* Upload option */}
                                                    <div className="border-t border-border pt-4">
                                                        <VideoUpload
                                                            key={`${trainingUnitId}-${resolvedVideoPreviewUrl || 'empty'}-${videoStatus?.status || 'idle'}`}
                                                            value={
                                                                resolvedVideoPreviewUrl ||
                                                                undefined
                                                            }
                                                            onUpload={
                                                                handleVideoUploadForComponent
                                                            }
                                                            onRemove={
                                                                videoStatus?.has_video
                                                                    ? () =>
                                                                          void handleVideoRemove()
                                                                    : undefined
                                                            }
                                                            maxSizeMB={500}
                                                            acceptedFormats={[
                                                                'video/mp4',
                                                                'video/webm',
                                                                'video/quicktime',
                                                                'video/x-msvideo',
                                                                'video/x-m4v',
                                                                '.mp4',
                                                                '.webm',
                                                                '.mov',
                                                                '.avi',
                                                                '.m4v',
                                                            ]}
                                                        />
                                                    </div>
                                                </>
                                            )}

                                            {(trainingUnitType === 'vm-lab' ||
                                                vmEnabled) && (
                                                <>
                                                    {trainingUnitType ===
                                                        'video' && (
                                                        <Separator className="my-2" />
                                                    )}
                                                    {/* Current Assignment Status */}
                                                    {currentVmAssignment && (
                                                        <div
                                                            className={`rounded-lg border p-4 ${
                                                                currentVmAssignment.status ===
                                                                'approved'
                                                                    ? 'border-green-500/30 bg-green-500/5'
                                                                    : currentVmAssignment.status ===
                                                                        'rejected'
                                                                      ? 'border-destructive/30 bg-destructive/5'
                                                                      : 'border-warning/30 bg-warning/5'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                {currentVmAssignment.status ===
                                                                    'approved' && (
                                                                    <>
                                                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                                        <div>
                                                                            <p className="font-medium text-green-600 dark:text-green-400">
                                                                                VM
                                                                                Approved
                                                                            </p>
                                                                            <p className="text-xs text-muted-foreground">
                                                                                VM:{' '}
                                                                                {currentVmAssignment.vm_name ??
                                                                                    `VM ${currentVmAssignment.vm_id}`}
                                                                                {currentVmAssignment
                                                                                    .node
                                                                                    ?.name && (
                                                                                    <>
                                                                                        {' '}
                                                                                        ·{' '}
                                                                                        {
                                                                                            currentVmAssignment
                                                                                                .node
                                                                                                .name
                                                                                        }
                                                                                    </>
                                                                                )}
                                                                            </p>
                                                                        </div>
                                                                    </>
                                                                )}
                                                                {currentVmAssignment.status ===
                                                                    'pending' && (
                                                                    <>
                                                                        <Clock className="h-5 w-5 text-warning" />
                                                                        <div>
                                                                            <p className="font-medium text-warning">
                                                                                Pending
                                                                                Approval
                                                                            </p>
                                                                            <p className="text-xs text-muted-foreground">
                                                                                VM:{' '}
                                                                                {currentVmAssignment.vm_name ??
                                                                                    `VM ${currentVmAssignment.vm_id}`}
                                                                            </p>
                                                                        </div>
                                                                    </>
                                                                )}
                                                                {currentVmAssignment.status ===
                                                                    'rejected' && (
                                                                    <>
                                                                        <XCircle className="h-5 w-5 text-destructive" />
                                                                        <div>
                                                                            <p className="font-medium text-destructive">
                                                                                Request
                                                                                Rejected
                                                                            </p>
                                                                            {currentVmAssignment.admin_feedback && (
                                                                                <p className="text-xs text-muted-foreground">
                                                                                    Feedback:{' '}
                                                                                    {
                                                                                        currentVmAssignment.admin_feedback
                                                                                    }
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {/* VM Selection */}
                                                    <div>
                                                        <Label className="text-sm font-medium">
                                                            VM Selection
                                                        </Label>
                                                        <p className="mt-0.5 mb-2 text-xs text-muted-foreground">
                                                            Select a Proxmox VM
                                                            to assign to this
                                                            trainingUnit
                                                        </p>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            className="w-full"
                                                            onClick={() => {
                                                                setShowVMDialog(
                                                                    true,
                                                                );
                                                                setLoadingVMs(
                                                                    true,
                                                                );
                                                                trainingUnitVMAssignmentApi
                                                                    .getAvailableVMs()
                                                                    .then(
                                                                        setAvailableVMs,
                                                                    )
                                                                    .catch(
                                                                        (e) => {
                                                                            console.error(
                                                                                'Failed to load VMs:',
                                                                                e,
                                                                            );
                                                                            toast.error(
                                                                                'Failed to load available VMs',
                                                                            );
                                                                        },
                                                                    )
                                                                    .finally(
                                                                        () =>
                                                                            setLoadingVMs(
                                                                                false,
                                                                            ),
                                                                    );
                                                            }}
                                                        >
                                                            <Monitor className="mr-2 h-4 w-4" />
                                                            {currentVmAssignment
                                                                ? 'Change VM Assignment'
                                                                : 'Select VM for TrainingUnit'}
                                                        </Button>
                                                    </div>
                                                    {/* VM Preview */}
                                                    <div className="relative flex aspect-video flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border border-border bg-gray-900">
                                                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent" />
                                                        <Monitor className="h-16 w-16 text-violet-400/50" />
                                                        <p className="text-sm text-gray-400">
                                                            VM preview will
                                                            appear here
                                                        </p>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="mt-2"
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Test VM Environment
                                                        </Button>
                                                    </div>
                                                    {/* VM settings */}
                                                    <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                                                        <div>
                                                            <Label className="text-sm font-medium">
                                                                Session Duration
                                                            </Label>
                                                            <Select defaultValue="60">
                                                                <SelectTrigger className="mt-2">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="30">
                                                                        30
                                                                        minutes
                                                                    </SelectItem>
                                                                    <SelectItem value="60">
                                                                        1 hour
                                                                    </SelectItem>
                                                                    <SelectItem value="120">
                                                                        2 hours
                                                                    </SelectItem>
                                                                    <SelectItem value="240">
                                                                        4 hours
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div>
                                                            <Label className="text-sm font-medium">
                                                                Auto-Save Work
                                                            </Label>
                                                            <Select defaultValue="yes">
                                                                <SelectTrigger className="mt-2">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="yes">
                                                                        Yes,
                                                                        save
                                                                        student
                                                                        work
                                                                    </SelectItem>
                                                                    <SelectItem value="no">
                                                                        No,
                                                                        reset
                                                                        each
                                                                        session
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                {/* Resources Tab */}
                                <TabsContent value="resources" className="mt-4">
                                    <Card className="shadow-card">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="flex items-center gap-2 font-heading text-lg">
                                                <Link2 className="h-5 w-5 text-primary" />
                                                Additional Resources
                                            </CardTitle>
                                            <CardDescription>
                                                Add links to documentation,
                                                articles, or downloadable files
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {resources.map(
                                                (resource, index) => (
                                                    <motion.div
                                                        key={resource.id}
                                                        initial={{
                                                            opacity: 0,
                                                            y: 10,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            y: 0,
                                                        }}
                                                        className="group flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4"
                                                    >
                                                        <GripVertical className="mt-2 h-5 w-5 cursor-grab text-muted-foreground/50" />
                                                        <div className="grid flex-1 grid-cols-2 gap-3">
                                                            <div>
                                                                <Label className="text-xs text-muted-foreground">
                                                                    Title
                                                                </Label>
                                                                <Input
                                                                    placeholder="Resource name"
                                                                    value={
                                                                        resource.title
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        updateResource(
                                                                            index,
                                                                            'title',
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="mt-1"
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label className="text-xs text-muted-foreground">
                                                                    URL
                                                                </Label>
                                                                <Input
                                                                    placeholder="https://..."
                                                                    value={
                                                                        resource.url
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        updateResource(
                                                                            index,
                                                                            'url',
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="mt-1"
                                                                />
                                                            </div>
                                                        </div>
                                                        <Select
                                                            value={
                                                                resource.type
                                                            }
                                                            onValueChange={(
                                                                v,
                                                            ) =>
                                                                updateResource(
                                                                    index,
                                                                    'type',
                                                                    v,
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger className="mt-5 w-32">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="link">
                                                                    🔗 Link
                                                                </SelectItem>
                                                                <SelectItem value="file">
                                                                    📄 File
                                                                </SelectItem>
                                                                <SelectItem value="download">
                                                                    ⬇️ Download
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="mt-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                                                            onClick={() =>
                                                                removeResource(
                                                                    index,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </motion.div>
                                                ),
                                            )}
                                            <Button
                                                variant="outline"
                                                onClick={addResource}
                                                className="w-full border-dashed"
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Resource
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                {/* Settings Tab */}
                                <TabsContent value="settings" className="mt-4">
                                    <Card className="shadow-card">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="flex items-center gap-2 font-heading text-lg">
                                                <Settings className="h-5 w-5 text-primary" />
                                                TrainingUnit Settings
                                            </CardTitle>
                                            <CardDescription>
                                                Configure advanced options for
                                                this trainingUnit
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            {/* VM Toggle */}
                                            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`h-10 w-10 rounded-lg ${vmEnabled ? 'bg-violet-500/20' : 'bg-muted'} flex items-center justify-center`}
                                                    >
                                                        <Terminal
                                                            className={`h-5 w-5 ${vmEnabled ? 'text-violet-500' : 'text-muted-foreground'}`}
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground">
                                                            VM Lab Environment
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Enable virtual
                                                            machine access for
                                                            this trainingUnit
                                                        </p>
                                                    </div>
                                                </div>
                                                <Switch
                                                    checked={vmEnabled}
                                                    onCheckedChange={
                                                        setVmEnabled
                                                    }
                                                />
                                            </div>
                                            <AnimatePresence>
                                                {vmEnabled && (
                                                    <motion.div
                                                        initial={{
                                                            opacity: 0,
                                                            height: 0,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            height: 'auto',
                                                        }}
                                                        exit={{
                                                            opacity: 0,
                                                            height: 0,
                                                        }}
                                                        className="space-y-4 overflow-hidden"
                                                    >
                                                        <div className="rounded-lg border border-violet-500/30 bg-violet-500/5 p-4">
                                                            <div className="flex flex-col gap-2">
                                                                <p className="flex items-center gap-2 text-sm text-violet-600 dark:text-violet-400">
                                                                    <Check className="h-4 w-4" />
                                                                    Students
                                                                    will have
                                                                    access to a
                                                                    VM during
                                                                    this
                                                                    trainingUnit
                                                                </p>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="w-fit gap-2 border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 dark:border-violet-900/30 dark:bg-violet-950/20 dark:text-violet-300"
                                                                    onClick={() =>
                                                                        setActiveTab(
                                                                            'media',
                                                                        )
                                                                    }
                                                                >
                                                                    <Terminal className="h-4 w-4" />
                                                                    Configure VM
                                                                    Setup
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                            <Separator />
                                            {/* Preview settings */}
                                            <div className="space-y-4">
                                                <h4 className="font-medium text-foreground">
                                                    Preview & Visibility
                                                </h4>
                                                <div className="flex items-center justify-between py-2">
                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            Free Preview
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Allow non-enrolled
                                                            users to preview
                                                            this trainingUnit
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        checked={freePreview}
                                                        onCheckedChange={
                                                            setFreePreview
                                                        }
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between py-2">
                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            Downloadable Content
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Allow students to
                                                            download
                                                            trainingUnit
                                                            materials
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        checked={downloadable}
                                                        onCheckedChange={
                                                            setDownloadable
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                        {/* Right: Sidebar */}
                        <div className="space-y-6 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:self-start lg:overflow-y-auto lg:pr-1">
                            {/* Completion card */}
                            <Card className="shadow-card">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center justify-between font-heading text-lg">
                                        <span>Completion</span>
                                        <span className="text-primary">
                                            {completionPercent}%
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Progress
                                        value={completionPercent}
                                        className="h-2"
                                    />
                                    <div className="space-y-2">
                                        {completionItems.map((item, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center gap-2 text-sm"
                                            >
                                                <div
                                                    className={`flex h-5 w-5 items-center justify-center rounded-full ${
                                                        item.done
                                                            ? 'bg-green-500/20 text-green-500'
                                                            : 'bg-muted text-muted-foreground'
                                                    }`}
                                                >
                                                    {item.done ? (
                                                        <Check className="h-3 w-3" />
                                                    ) : (
                                                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                                    )}
                                                </div>
                                                <span
                                                    className={
                                                        item.done
                                                            ? 'text-foreground'
                                                            : 'text-muted-foreground'
                                                    }
                                                >
                                                    {item.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <Separator />
                                    {/* Action buttons */}
                                    <div className="space-y-2">
                                        <Button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="w-full bg-primary hover:bg-primary/90"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="mr-2 h-4 w-4" />
                                                    Save TrainingUnit
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            asChild
                                        >
                                            <Link
                                                href={`/teaching/${trainingPathId}/edit`}
                                            >
                                                <ArrowLeft className="mr-2 h-4 w-4" />
                                                Back to TrainingPath
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="shadow-card">
                                <CardHeader className="pb-4">
                                    <CardTitle className="font-heading text-lg">
                                        Content Actions
                                    </CardTitle>
                                    <CardDescription>
                                        Open the dedicated tools for this
                                        unit&apos;s content type.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {trainingUnitType === 'practice' && (
                                        <>
                                            <Button
                                                className="w-full justify-start"
                                                asChild
                                            >
                                                <Link
                                                    href={`/teaching/trainingUnits/${trainingUnitId}/quiz`}
                                                >
                                                    <Sparkles className="mr-2 h-4 w-4" />
                                                    {teacherQuiz
                                                        ? 'Edit Quiz'
                                                        : 'Create Quiz'}
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start"
                                                onClick={() =>
                                                    setIsQuizStatsOpen(true)
                                                }
                                                disabled={
                                                    !teacherQuiz ||
                                                    isQuizLookupLoading
                                                }
                                            >
                                                <BarChart3 className="mr-2 h-4 w-4" />
                                                View Quiz Stats
                                            </Button>
                                            <p className="text-xs text-muted-foreground">
                                                {isQuizLookupLoading
                                                    ? 'Checking for an existing quiz...'
                                                    : teacherQuiz
                                                      ? 'Review attempt performance without leaving the unit flow.'
                                                      : 'Create the quiz first, then attempt stats will appear here.'}
                                            </p>
                                        </>
                                    )}
                                    {trainingUnitType === 'reading' && (
                                        <>
                                            <Button
                                                className="w-full justify-start"
                                                asChild
                                            >
                                                <Link
                                                    href={`/teaching/trainingUnits/${trainingUnitId}/article`}
                                                >
                                                    <FileText className="mr-2 h-4 w-4" />
                                                    Edit Article
                                                </Link>
                                            </Button>
                                            <p className="text-xs text-muted-foreground">
                                                Open the focused article editor
                                                for long-form reading content.
                                            </p>
                                        </>
                                    )}
                                    {trainingUnitType === 'video' && (
                                        <>
                                            <Button
                                                className="w-full justify-start"
                                                variant="outline"
                                                onClick={openMediaTab}
                                            >
                                                <Video className="mr-2 h-4 w-4" />
                                                Manage Video
                                            </Button>
                                            <p className="text-xs text-muted-foreground">
                                                Upload, monitor, retry, and
                                                review processing status from
                                                the media tab.
                                            </p>
                                        </>
                                    )}
                                    {trainingUnitType === 'vm-lab' && (
                                        <>
                                            <Button
                                                className="w-full justify-start"
                                                variant="outline"
                                                onClick={openMediaTab}
                                            >
                                                <Terminal className="mr-2 h-4 w-4" />
                                                Manage VM Request
                                            </Button>
                                            <Button
                                                className="w-full justify-start"
                                                variant="ghost"
                                                asChild
                                            >
                                                <Link href="/teaching/trainingUnit-assignments/my-assignments">
                                                    <Monitor className="mr-2 h-4 w-4" />
                                                    Open My VM Assignments
                                                </Link>
                                            </Button>
                                            <p className="text-xs text-muted-foreground">
                                                Track request status and jump
                                                back into the assignment
                                                workflow from here.
                                            </p>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                            {/* Quick tips */}
                            <Card className="border-primary/20 bg-primary/5 shadow-sm">
                                <CardContent className="py-4">
                                    <h4 className="mb-3 flex items-center gap-2 font-medium text-foreground">
                                        <BookOpen className="h-4 w-4 text-primary" />
                                        Quick Tips
                                    </h4>
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        <li className="flex items-start gap-2">
                                            <span className="text-primary">
                                                •
                                            </span>
                                            Keep content concise and focused
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-primary">
                                                •
                                            </span>
                                            Add clear training objectives
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-primary">
                                                •
                                            </span>
                                            Link to additional resources
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-primary">
                                                •
                                            </span>
                                            Test VM labs before publishing
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
            <Dialog open={isQuizStatsOpen} onOpenChange={setIsQuizStatsOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Quiz Statistics</DialogTitle>
                        <DialogDescription>
                            {teacherQuiz
                                ? `Attempt summary for ${teacherQuiz.title}.`
                                : 'Create the quiz first to unlock teacher-facing stats.'}
                        </DialogDescription>
                    </DialogHeader>
                    {teacherQuiz ? (
                        <TeacherQuizStatsPanel quizId={teacherQuiz.id} />
                    ) : (
                        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                            No quiz has been created for this training unit yet.
                        </div>
                    )}
                </DialogContent>
            </Dialog>
            {/* VM Assignment Dialog */}
            <Dialog open={showVMDialog} onOpenChange={setShowVMDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Select VM for TrainingUnit</DialogTitle>
                        <DialogDescription>
                            Choose a Proxmox VM to assign to this trainingUnit.
                            An administrator will need to approve this request.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {loadingVMs ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                <span className="ml-2 text-muted-foreground">
                                    Loading VMs...
                                </span>
                            </div>
                        ) : availableVMs.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                No VMs available. Please contact an
                                administrator.
                            </div>
                        ) : (
                            <>
                                <div className="max-h-[300px] space-y-2 overflow-y-auto">
                                    {availableVMs.map((vm) => (
                                        <div
                                            key={`${vm.node_id}-${vm.vmid}`}
                                            className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                                                selectedVM?.vmid === vm.vmid &&
                                                selectedVM?.node_id ===
                                                    vm.node_id
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border hover:border-primary/50'
                                            }`}
                                            onClick={() =>
                                                setSelectedVM({
                                                    vmid: vm.vmid,
                                                    name: vm.name,
                                                    node_id: vm.node_id,
                                                })
                                            }
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Monitor className="h-5 w-5 text-violet-500" />
                                                    <div>
                                                        <p className="font-medium">
                                                            {vm.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            VMID: {vm.vmid} ·
                                                            Node: {vm.node_name}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge
                                                    variant={
                                                        vm.status === 'running'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {vm.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <Label htmlFor="vm-notes">
                                        Notes (optional)
                                    </Label>
                                    <Textarea
                                        id="vm-notes"
                                        placeholder="Add any notes for the administrator..."
                                        value={vmNotes}
                                        onChange={(e) =>
                                            setVmNotes(e.target.value)
                                        }
                                        className="mt-1"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowVMDialog(false);
                                setSelectedVM(null);
                                setVmNotes('');
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={!selectedVM || submittingVM}
                            onClick={async () => {
                                if (!selectedVM) return;
                                setSubmittingVM(true);
                                try {
                                    const newAssignment =
                                        await trainingUnitVMAssignmentApi.assign(
                                            {
                                                training_unit_id:
                                                    parseInt(trainingUnitId),
                                                vm_id: selectedVM.vmid,
                                                node_id: selectedVM.node_id,
                                                vm_name: selectedVM.name,
                                                teacher_notes:
                                                    vmNotes || undefined,
                                            },
                                        );
                                    toast.success(
                                        'VM assignment submitted for approval',
                                    );
                                    setShowVMDialog(false);
                                    setSelectedVM(null);
                                    setVmNotes('');
                                    // Update local state instead of reloading
                                    setCurrentVmAssignment(newAssignment);
                                } catch (e) {
                                    console.error(
                                        'Failed to submit VM assignment:',
                                        e,
                                    );
                                    toast.error(
                                        'Failed to submit VM assignment',
                                    );
                                } finally {
                                    setSubmittingVM(false);
                                }
                            }}
                        >
                            {submittingVM ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                'Submit for Approval'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
