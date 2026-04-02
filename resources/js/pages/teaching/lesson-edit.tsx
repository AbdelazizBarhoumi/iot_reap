/**
 * Edit Lesson Page - Professional Content Editor
 * Teacher view for editing individual lesson content with rich features.
 * Uses unified AppLayout and Inertia props.
 */
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
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
import { useState, useMemo, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { teachingApi } from '@/api/course.api';
import * as videoApi from '@/api/video.api';
import VideoUpload from '@/components/courses/VideoUpload';
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
import type { Lesson, Course } from '@/types/course.types';
// Lesson type configuration
const lessonTypeConfig = {
    video: {
        icon: Video,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        label: 'Video Lesson',
    },
    reading: {
        icon: FileText,
        color: 'text-green-500',
        bg: 'bg-green-500/10',
        label: 'Reading Material',
    },
    practice: {
        icon: Zap,
        color: 'text-yellow-500',
        bg: 'bg-yellow-500/10',
        label: 'Practice Exercise',
    },
    'vm-lab': {
        icon: Terminal,
        color: 'text-violet-500',
        bg: 'bg-violet-500/10',
        label: 'VM Lab Session',
    },
    lab: {
        icon: Terminal,
        color: 'text-violet-500',
        bg: 'bg-violet-500/10',
        label: 'VM Lab Session',
    },
    article: {
        icon: FileText,
        color: 'text-green-500',
        bg: 'bg-green-500/10',
        label: 'Reading Material',
    },
};
interface Resource {
    id: string;
    title: string;
    url: string;
    type: 'link' | 'file' | 'download';
}
// VM Assignment from backend (legacy, can be null)
interface VMAssignment {
    id: string;
    lesson_id: number;
    status: 'pending' | 'approved' | 'rejected';
    teacher_notes?: string;
    admin_feedback?: string;
    template?: { id: string; name: string } | null;
}
interface EditLessonPageProps {
    courseId: string;
    moduleId: string;
    lessonId: string;
    lesson: Lesson;
    course: Course;
    vmAssignment?: VMAssignment | null;
}
export default function EditLessonPage({
    courseId,
    moduleId,
    lessonId,
    lesson,
    course,
    vmAssignment,
}: EditLessonPageProps) {
    // Form state initialized from backend props
    const [content, setContent] = useState(lesson?.content || '');
    const [objectives, setObjectives] = useState(
        (lesson?.objectives || []).join('\n'),
    );
    const [vmEnabled, setVmEnabled] = useState(lesson?.vmEnabled || false);
    const [freePreview, setFreePreview] = useState(false);
    const [downloadable, setDownloadable] = useState(false);
    const [videoUrl, setVideoUrl] = useState(lesson?.videoUrl || '');
    const [activeTab, setActiveTab] = useState('content');
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [resources, setResources] = useState<Resource[]>(() => {
        // Initialize resources from lesson data
        const lessonResources = lesson?.resources || [];
        if (lessonResources.length === 0) {
            return [{ id: '1', title: '', url: '', type: 'link' as const }];
        }
        return lessonResources.map((url, i) => ({
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
    // VM Assignment dialog state - kept minimal since templates are not available
    const [showVMDialog, setShowVMDialog] = useState(false);
    // Fetch video status on mount
    useEffect(() => {
        if (lesson?.type === 'video') {
            videoApi
                .getVideoStatus(parseInt(lessonId))
                .then(setVideoStatus)
                .catch(() => {});
        }
    }, [lessonId, lesson?.type]);
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
                title: course?.title ?? 'Course',
                href: `/teaching/${courseId}/edit`,
            },
            {
                title: lesson?.title ?? 'Lesson',
                href: `/teaching/${courseId}/module/${moduleId}/lesson/${lessonId}`,
            },
        ],
        [course, courseId, moduleId, lessonId, lesson],
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
            try {
                await videoApi.uploadVideo(
                    parseInt(lessonId),
                    file,
                    () => {},
                );
                toast.success('Video uploaded!', {
                    description:
                        'Transcoding started. This may take a few minutes.',
                });
                // Poll for status updates
                videoApi
                    .pollUntilReady(parseInt(lessonId), 3000, 60, (status) =>
                        setVideoStatus(status),
                    )
                    .catch(() => {});
            } catch (error: unknown) {
                const message =
                    error instanceof Error ? error.message : 'Upload failed';
                toast.error('Upload failed', { description: message });
            }
        },
        [lessonId],
    );

    // Handle video upload for VideoUpload component (returns URL)
    const handleVideoUploadForComponent = useCallback(
        async (file: File): Promise<string> => {
            await handleVideoUpload(file);
            return file.name; // Return filename as URL placeholder
        },
        [handleVideoUpload],
    );
    // Handle lesson save - ACTUAL API CALL
    const handleSave = useCallback(async () => {
        setIsSaving(true);
        try {
            await teachingApi.updateLesson(
                parseInt(courseId),
                parseInt(moduleId),
                parseInt(lessonId),
                {
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
            toast.success('Lesson saved!', {
                description: 'Your changes have been saved successfully.',
            });
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : 'Save failed';
            toast.error('Failed to save lesson', { description: message });
        } finally {
            setIsSaving(false);
        }
    }, [
        courseId,
        moduleId,
        lessonId,
        content,
        objectives,
        resources,
        vmEnabled,
        videoUrl,
    ]);
    if (!lesson) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Lesson Not Found" />
                <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 p-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">Lesson not found.</p>
                    <Button variant="outline" asChild>
                        <Link href="/teaching">Back to Dashboard</Link>
                    </Button>
                </div>
            </AppLayout>
        );
    }
    const typeConfig =
        lessonTypeConfig[lesson.type as keyof typeof lessonTypeConfig] ||
        lessonTypeConfig.video;
    const TypeIcon = typeConfig.icon;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${lesson.title}`} />
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
                                <Link href={`/teaching/${courseId}/edit`}>
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
                                            {lesson.title}
                                        </h1>
                                        <p className="text-sm text-muted-foreground">
                                            {course.title} / {course?.modules?.find((m) => m.id.toString() === moduleId.toString())?.title || 'Unknown Module'}
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
                                {lesson.duration}
                            </Badge>
                        </div>
                    </motion.div>
                    {/* Main content area */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Left: Editor */}
                        <div className="space-y-6 lg:col-span-2">
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
                                    {(lesson.type === 'video' ||
                                        lesson.type === 'vm-lab') && (
                                        <TabsTrigger
                                            value="media"
                                            className="gap-2"
                                        >
                                            {lesson.type === 'video' ? (
                                                <Video className="h-4 w-4" />
                                            ) : (
                                                <Terminal className="h-4 w-4" />
                                            )}
                                            {lesson.type === 'video'
                                                ? 'Video'
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
                                <TabsContent value="content" className="mt-4">
                                    <Card className="shadow-card">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="flex items-center gap-2 font-heading text-lg">
                                                <Sparkles className="h-5 w-5 text-primary" />
                                                Lesson Content
                                            </CardTitle>
                                            <CardDescription>
                                                Write the main content for this
                                                lesson. Use markdown for
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
                                                    placeholder="Write your lesson content here...
## Introduction
Start with an overview of what students will learn.
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
                                                    Learning Objectives
                                                </Label>
                                                <p className="mt-0.5 mb-2 text-xs text-muted-foreground">
                                                    What will students be able
                                                    to do after this lesson?
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
                                                {lesson.type === 'video' ? (
                                                    <>
                                                        <Video className="h-5 w-5 text-blue-500" />
                                                        Video Content
                                                    </>
                                                ) : (
                                                    <>
                                                        <Terminal className="h-5 w-5 text-violet-500" />
                                                        Virtual Machine Setup
                                                    </>
                                                )}
                                            </CardTitle>
                                            <CardDescription>
                                                {lesson.type === 'video'
                                                    ? 'Add a video for students to watch'
                                                    : 'Configure the VM environment for this lab'}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            {lesson.type === 'video' ? (
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
                                                        </div>
                                                    )}
                                                    {/* Video URL input */}
                                                    <div>
                                                        <Label className="text-sm font-medium">
                                                            Video URL
                                                        </Label>
                                                        <p className="mt-0.5 mb-2 text-xs text-muted-foreground">
                                                            Paste a YouTube,
                                                            Vimeo, or direct
                                                            video URL
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
                                                    {/* Video preview placeholder */}
                                                    <div className="flex aspect-video flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/30">
                                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                                            <Play className="ml-1 h-8 w-8 text-primary" />
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            {videoStatus?.is_ready
                                                                ? 'Video ready for playback'
                                                                : videoUrl
                                                                  ? 'External video linked'
                                                                  : 'No video added yet'}
                                                        </p>
                                                    </div>
                                                    {/* Upload option */}
                                                    <div className="border-t border-border pt-4">
                                                        <VideoUpload
                                                            value={videoUrl}
                                                            onUpload={
                                                                handleVideoUploadForComponent
                                                            }
                                                            maxSizeMB={500}
                                                            acceptedFormats={[
                                                                'video/mp4',
                                                                'video/webm',
                                                                'video/quicktime',
                                                                'video/x-msvideo',
                                                            ]}
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    {/* Current Assignment Status */}
                                                    {vmAssignment && (
                                                        <div
                                                            className={`rounded-lg border p-4 ${
                                                                vmAssignment.status ===
                                                                'approved'
                                                                    ? 'border-green-500/30 bg-green-500/5'
                                                                    : vmAssignment.status ===
                                                                        'rejected'
                                                                      ? 'border-destructive/30 bg-destructive/5'
                                                                      : 'border-warning/30 bg-warning/5'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                {vmAssignment.status ===
                                                                    'approved' && (
                                                                    <>
                                                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                                        <div>
                                                                            <p className="font-medium text-green-600 dark:text-green-400">
                                                                                VM
                                                                                Approved
                                                                            </p>
                                                                            <p className="text-xs text-muted-foreground">
                                                                                Template:{' '}
                                                                                {
                                                                                    vmAssignment
                                                                                        .template
                                                                                        ?.name
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    </>
                                                                )}
                                                                {vmAssignment.status ===
                                                                    'pending' && (
                                                                    <>
                                                                        <Clock className="h-5 w-5 text-warning" />
                                                                        <div>
                                                                            <p className="font-medium text-warning">
                                                                                Pending
                                                                                Approval
                                                                            </p>
                                                                            <p className="text-xs text-muted-foreground">
                                                                                Template:{' '}
                                                                                {
                                                                                    vmAssignment
                                                                                        .template
                                                                                        ?.name
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    </>
                                                                )}
                                                                {vmAssignment.status ===
                                                                    'rejected' && (
                                                                    <>
                                                                        <XCircle className="h-5 w-5 text-destructive" />
                                                                        <div>
                                                                            <p className="font-medium text-destructive">
                                                                                Request
                                                                                Rejected
                                                                            </p>
                                                                            {vmAssignment.admin_feedback && (
                                                                                <p className="text-xs text-muted-foreground">
                                                                                    Feedback:{' '}
                                                                                    {
                                                                                        vmAssignment.admin_feedback
                                                                                    }
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {/* VM Template selection - disabled, templates not available */}
                                                    <div>
                                                        <Label className="text-sm font-medium">
                                                            VM Template
                                                        </Label>
                                                        <p className="mt-0.5 mb-2 text-xs text-muted-foreground">
                                                            VM templates are not currently available
                                                        </p>
                                                        <div className="rounded-lg border border-dashed border-violet-500/30 bg-violet-500/5 p-4 text-center">
                                                            <Monitor className="mx-auto h-8 w-8 text-violet-400 mb-2" />
                                                            <p className="text-sm text-muted-foreground">
                                                                VM template configuration is not available at this time.
                                                            </p>
                                                        </div>
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
                                                Lesson Settings
                                            </CardTitle>
                                            <CardDescription>
                                                Configure advanced options for
                                                this lesson
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
                                                            this lesson
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
                                                            <p className="flex items-center gap-2 text-sm text-violet-600 dark:text-violet-400">
                                                                <Check className="h-4 w-4" />
                                                                Students will
                                                                have access to a
                                                                VM during this
                                                                lesson
                                                            </p>
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
                                                            this lesson
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
                                                            download lesson
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
                        <div className="space-y-6">
                            {/* Completion card */}
                            <Card className="sticky top-6 shadow-card">
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
                                                    Save Lesson
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            asChild
                                        >
                                            <Link
                                                href={`/teaching/${courseId}/edit`}
                                            >
                                                <ArrowLeft className="mr-2 h-4 w-4" />
                                                Back to Course
                                            </Link>
                                        </Button>
                                    </div>
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
                                            Add clear learning objectives
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
            {/* VM Assignment Request Dialog - disabled since templates are not available */}
            <Dialog open={showVMDialog} onOpenChange={setShowVMDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>VM Templates Not Available</DialogTitle>
                        <DialogDescription>
                            VM template assignment is not currently available.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowVMDialog(false)}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

