/**
 * Edit Course Page - Professional Curriculum Builder
 * Teacher view for editing course details and managing curriculum with drag-and-drop.
 * Properly wired to backend API endpoints.
 */
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Head, Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Check,
    ChevronDown,
    ChevronUp,
    Clock,
    Edit,
    Eye,
    FileText,
    GripVertical,
    Image,
    Layers,
    Loader2,
    Plus,
    Save,
    Settings,
    Sparkles,
    Star,
    Terminal,
    Trash2,
    Users,
    Video,
    Zap,
} from 'lucide-react';
import { useMemo, useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { teachingApi } from '@/api/course.api';
import { CourseStatusBanner } from '@/components/courses/CourseStatusBanner';
import CourseVideoInput from '@/components/courses/CourseVideoInput';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type {
    Course,
    CourseModule,
    Lesson,
    CourseStatus,
} from '@/types/course.types';
const statusConfig: Record<
    CourseStatus,
    { label: string; color: string; bg: string }
> = {
    draft: { label: 'Draft', color: 'text-gray-500', bg: 'bg-gray-500/10' },
    pending_review: {
        label: 'Pending Review',
        color: 'text-yellow-500',
        bg: 'bg-yellow-500/10',
    },
    approved: {
        label: 'Approved',
        color: 'text-green-500',
        bg: 'bg-green-500/10',
    },
    rejected: { label: 'Rejected', color: 'text-red-500', bg: 'bg-red-500/10' },
    archived: {
        label: 'Archived',
        color: 'text-gray-400',
        bg: 'bg-gray-400/10',
    },
};
const lessonTypeConfig = {
    video: { icon: Video, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    reading: { icon: FileText, color: 'text-green-500', bg: 'bg-green-500/10' },
    practice: { icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    'vm-lab': {
        icon: Terminal,
        color: 'text-violet-500',
        bg: 'bg-violet-500/10',
    },
};
interface SortableLessonProps {
    lesson: Lesson;
    courseId: number;
    moduleId: string;
    onDelete: () => void;
    isDeleting: boolean;
}
function SortableLesson({
    lesson,
    courseId,
    moduleId,
    onDelete,
    isDeleting,
}: SortableLessonProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: lesson.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    const typeConfig =
        lessonTypeConfig[lesson.type as keyof typeof lessonTypeConfig] ||
        lessonTypeConfig.video;
    const TypeIcon = typeConfig.icon;
    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group flex items-center gap-3 rounded-lg border border-border bg-background p-3 transition-all ${isDragging ? 'opacity-50 shadow-lg ring-2 ring-primary/50' : 'hover:bg-muted/30'} ${isDeleting ? 'pointer-events-none opacity-50' : ''} `}
        >
            <button
                {...attributes}
                {...listeners}
                className="cursor-grab touch-none active:cursor-grabbing"
            >
                <GripVertical className="h-4 w-4 text-muted-foreground/50 hover:text-muted-foreground" />
            </button>
            <div
                className={`h-8 w-8 rounded-lg ${typeConfig.bg} flex shrink-0 items-center justify-center`}
            >
                <TypeIcon className={`h-4 w-4 ${typeConfig.color}`} />
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                    {lesson.title}
                </p>
                <div className="mt-0.5 flex items-center gap-2">
                    {lesson.content ? (
                        <span className="flex items-center gap-1 text-xs text-green-500">
                            <Check className="h-3 w-3" /> Content added
                        </span>
                    ) : (
                        <span className="text-xs text-yellow-500">
                            ⚠ No content
                        </span>
                    )}
                </div>
            </div>
            <Badge
                variant="outline"
                className={`text-xs ${typeConfig.bg} ${typeConfig.color} border-0`}
            >
                {lesson.type.replace('-', ' ')}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {lesson.duration ?? '0 min'}
            </span>
            {lesson.vmEnabled && (
                <div className="flex h-6 w-6 items-center justify-center rounded bg-violet-500/20">
                    <Terminal className="h-3.5 w-3.5 text-violet-500" />
                </div>
            )}
            <Button
                variant="outline"
                size="sm"
                asChild
                className="opacity-0 transition-opacity group-hover:opacity-100"
            >
                <Link
                    href={`/teaching/${courseId}/module/${moduleId}/lesson/${lesson.id}`}
                >
                    <Edit className="h-3.5 w-3.5" />
                </Link>
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                onClick={onDelete}
                disabled={isDeleting}
            >
                {isDeleting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                )}
            </Button>
        </div>
    );
}
interface EditCoursePageProps {
    id: string;
    course: Course;
    categories: string[];
}
export default function EditCoursePage({
    id,
    course: initialCourse,
    categories,
}: EditCoursePageProps) {
    // Local state for optimistic updates
    const [course, setCourse] = useState<Course>(initialCourse);
    const [activeTab, setActiveTab] = useState('curriculum');
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [expandedModules, setExpandedModules] = useState<Set<string>>(
        new Set(),
    );

    const [_activeId, setActiveId] = useState<string | null>(null);
    const [deletingLessonId, setDeletingLessonId] = useState<string | null>(
        null,
    );
    const [deletingModuleId, setDeletingModuleId] = useState<string | null>(
        null,
    );
    // Module dialog state
    const [showModuleDialog, setShowModuleDialog] = useState(false);
    const [editingModule, setEditingModule] = useState<CourseModule | null>(
        null,
    );
    const [moduleTitle, setModuleTitle] = useState('');
    const [isModuleSaving, setIsModuleSaving] = useState(false);
    // Lesson dialog state
    const [showLessonDialog, setShowLessonDialog] = useState(false);
    const [lessonModuleId, setLessonModuleId] = useState<string | null>(null);
    const [lessonTitle, setLessonTitle] = useState('');
    const [lessonType, setLessonType] = useState<string>('video');
    const [isLessonSaving, setIsLessonSaving] = useState(false);
    // Form state for details tab
    const [title, setTitle] = useState(course.title);
    const [description, setDescription] = useState(course.description);
    const [category, setCategory] = useState(course.category);
    const [level, setLevel] = useState(course.level);
    const [thumbnail, setThumbnail] = useState<string | null>(course.thumbnail);
    const [videoType, setVideoType] = useState<'upload' | 'youtube' | null>(course.video_type || null);
    const [videoUrl, setVideoUrl] = useState<string | null>(course.video_url || null);
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
    // Get flash messages from the page props
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
    // Show flash message on page load (e.g., after course creation redirect)
    useEffect(() => {
        if (flash?.success) {
            toast.success('🎉 ' + flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );
    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: 'Teaching', href: '/teaching' },
            { title: course.title, href: `/teaching/${id}/edit` },
        ],
        [course.title, id],
    );
    const modules = course.modules ?? [];
    const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
    const completedLessons = modules.reduce(
        (acc, m) => acc + m.lessons.filter((l) => l.content).length,
        0,
    );
    const completionPercent =
        totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;
    const statusInfo = statusConfig[course.status] ?? statusConfig.draft;
    const toggleModule = useCallback((moduleId: string) => {
        setExpandedModules((prev) => {
            const next = new Set(prev);
            if (next.has(moduleId)) {
                next.delete(moduleId);
            } else {
                next.add(moduleId);
            }
            return next;
        });
    }, []);
    // === SAVE COURSE DETAILS ===
    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updateData: Record<string, unknown> = {
                title,
                description,
                category,
                level,
            };
            // Only include thumbnail if it changed (is base64 or different from original)
            if (thumbnail && thumbnail !== course.thumbnail) {
                updateData.thumbnail = thumbnail;
            }
            // Include video if it exists
            if (videoType && videoUrl) {
                updateData.video_type = videoType;
                updateData.video_url = videoUrl;
            } else if (!videoType && !videoUrl) {
                // Allow clearing video
                updateData.video_type = null;
                updateData.video_url = null;
            }
            await teachingApi.update(course.id, updateData);
            setCourse((prev) => ({
                ...prev,
                title,
                description,
                category,
                level,
                thumbnail: thumbnail ?? prev.thumbnail,
                video_type: videoType ?? prev.video_type,
                video_url: videoUrl ?? prev.video_url,
            }));
            setLastSaved(new Date());
            toast.success('Changes saved!', {
                description: 'Your course has been updated.',
            });
        } catch {
            toast.error('Failed to save', {
                description: 'Could not update course. Please try again.',
            });
        } finally {
            setIsSaving(false);
        }
    };
    // === THUMBNAIL UPLOAD ===
    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Invalid file type', {
                    description: 'Please select an image file.',
                });
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File too large', {
                    description: 'Please select an image smaller than 5MB.',
                });
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnail(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    // === SUBMIT FOR REVIEW ===
    const handleSubmitForReview = async () => {
        try {
            await teachingApi.submitForReview(course.id);
            setCourse((prev) => ({
                ...prev,
                status: 'pending_review',
            }));
            toast.success('Submitted for review!', {
                description:
                    'An admin will review your course shortly.',
            });
        } catch {
            toast.error('Failed to submit', {
                description: 'Could not submit course for review.',
            });
        }
    };
    // === MODULE CRUD ===
    const openAddModuleDialog = () => {
        setEditingModule(null);
        setModuleTitle('');
        setShowModuleDialog(true);
    };
    const openEditModuleDialog = (module: CourseModule) => {
        setEditingModule(module);
        setModuleTitle(module.title);
        setShowModuleDialog(true);
    };
    const handleSaveModule = async () => {
        if (!moduleTitle.trim()) return;
        setIsModuleSaving(true);
        try {
            if (editingModule) {
                // Update existing module
                await teachingApi.updateModule(
                    course.id,
                    parseInt(editingModule.id),
                    { title: moduleTitle },
                );
                setCourse((prev) => ({
                    ...prev,
                    modules: prev.modules?.map((m) =>
                        m.id === editingModule.id
                            ? { ...m, title: moduleTitle }
                            : m,
                    ),
                }));
                toast.success('Module updated');
            } else {
                // Create new module
                const response = await teachingApi.addModule(course.id, {
                    title: moduleTitle,
                });
                const newModule: CourseModule = {
                    id: String(response.data.id),
                    title: moduleTitle,
                    sort_order: modules.length,
                    lessons: [],
                };
                setCourse((prev) => ({
                    ...prev,
                    modules: [...(prev.modules ?? []), newModule],
                }));
                toast.success('Module created');
            }
            setShowModuleDialog(false);
        } catch {
            toast.error(
                editingModule
                    ? 'Failed to update module'
                    : 'Failed to create module',
            );
        } finally {
            setIsModuleSaving(false);
        }
    };
    const handleDeleteModule = async (moduleId: string) => {
        setConfirmDialog({
            open: true,
            title: 'Delete Module',
            description:
                'Are you sure you want to delete this module and all its lessons? This action cannot be undone.',
            confirmText: 'Delete Module',
            variant: 'destructive',
            onConfirm: async () => {
                setDeletingModuleId(moduleId);
                try {
                    await teachingApi.deleteModule(
                        course.id,
                        parseInt(moduleId),
                    );
                    setCourse((prev) => ({
                        ...prev,
                        modules: prev.modules?.filter((m) => m.id !== moduleId),
                    }));
                    toast.success('Module deleted');
                } catch {
                    toast.error('Failed to delete module');
                } finally {
                    setDeletingModuleId(null);
                }
            },
        });
    };
    // === LESSON CRUD ===
    const openAddLessonDialog = (moduleId: string) => {
        setLessonModuleId(moduleId);
        setLessonTitle('');
        setLessonType('video');
        setShowLessonDialog(true);
    };
    const handleSaveLesson = async () => {
        if (!lessonTitle.trim() || !lessonModuleId) return;
        setIsLessonSaving(true);
        try {
            const response = await teachingApi.addLesson(
                course.id,
                parseInt(lessonModuleId),
                {
                    title: lessonTitle,
                    type: lessonType,
                },
            );
            const newLesson: Lesson = {
                id: String(response.data.id),
                title: lessonTitle,
                type: lessonType as Lesson['type'],
                duration: null,
                content: null,
                objectives: null,
                vmEnabled: false,
                videoUrl: null,
                resources: null,
                sort_order: 0,
            };
            setCourse((prev) => ({
                ...prev,
                modules: prev.modules?.map((m) =>
                    m.id === lessonModuleId
                        ? { ...m, lessons: [...m.lessons, newLesson] }
                        : m,
                ),
            }));
            toast.success('Lesson created');
            setShowLessonDialog(false);
            // Expand the module to show the new lesson
            setExpandedModules((prev) => new Set(prev).add(lessonModuleId));
        } catch {
            toast.error('Failed to create lesson');
        } finally {
            setIsLessonSaving(false);
        }
    };
    const handleDeleteLesson = async (
        moduleId: string,
        lessonId: string,
        lessonTitle: string,
    ) => {
        setConfirmDialog({
            open: true,
            title: 'Delete Lesson',
            description: `Are you sure you want to delete "${lessonTitle}"? This action cannot be undone.`,
            confirmText: 'Delete Lesson',
            variant: 'destructive',
            onConfirm: async () => {
                setDeletingLessonId(lessonId);
                try {
                    await teachingApi.deleteLesson(
                        course.id,
                        parseInt(moduleId),
                        parseInt(lessonId),
                    );
                    setCourse((prev) => ({
                        ...prev,
                        modules: prev.modules?.map((m) =>
                            m.id === moduleId
                                ? {
                                      ...m,
                                      lessons: m.lessons.filter(
                                          (l) => l.id !== lessonId,
                                      ),
                                  }
                                : m,
                        ),
                    }));
                    toast.success('Lesson deleted', {
                        description: `"${lessonTitle}" has been removed.`,
                    });
                } catch {
                    toast.error('Failed to delete lesson');
                } finally {
                    setDeletingLessonId(null);
                }
            },
        });
    };
    // === DRAG & DROP REORDER ===
    const handleDragStart = useCallback((event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    }, []);
    const handleLessonDragEnd = useCallback(
        async (event: DragEndEvent, moduleId: string, lessons: Lesson[]) => {
            const { active, over } = event;
            setActiveId(null);
            if (over && active.id !== over.id) {
                const oldIndex = lessons.findIndex((l) => l.id === active.id);
                const newIndex = lessons.findIndex((l) => l.id === over.id);
                const newOrder = arrayMove(lessons, oldIndex, newIndex);
                // Optimistic update
                setCourse((prev) => ({
                    ...prev,
                    modules: prev.modules?.map((m) =>
                        m.id === moduleId ? { ...m, lessons: newOrder } : m,
                    ),
                }));
                // Persist to backend
                try {
                    await teachingApi.reorderLessons(
                        course.id,
                        parseInt(moduleId),
                        newOrder.map((l) => parseInt(l.id)),
                    );
                    toast.success('Lesson order updated');
                } catch {
                    // Revert on failure
                    setCourse((prev) => ({
                        ...prev,
                        modules: prev.modules?.map((m) =>
                            m.id === moduleId ? { ...m, lessons } : m,
                        ),
                    }));
                    toast.error('Failed to reorder lessons');
                }
            }
        },
        [course.id],
    );
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${course.title}`} />
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
                                <Link href="/teaching">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="flex items-center gap-2 font-heading text-2xl font-bold text-foreground">
                                    {course.title}
                                </h1>
                                <div className="mt-1 flex items-center gap-3">
                                    <Badge
                                        variant="outline"
                                        className={`${statusInfo.bg} ${statusInfo.color} border-0`}
                                    >
                                        {statusInfo.label}
                                    </Badge>
                                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Users className="h-3.5 w-3.5" />
                                        {course.students?.toLocaleString() ??
                                            0}{' '}
                                        students
                                    </span>
                                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                                        {course.rating ?? 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {lastSaved && (
                                <span className="text-xs text-muted-foreground">
                                    Saved {lastSaved.toLocaleTimeString()}
                                </span>
                            )}
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/courses/${course.id}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Preview
                                </Link>
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-primary"
                            >
                                {isSaving ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="mr-2 h-4 w-4" />
                                )}
                                Save
                            </Button>
                        </div>
                    </motion.div>
                    {/* Status Banner */}
                    <CourseStatusBanner
                        status={course.status}
                        adminFeedback={course.adminFeedback}
                    />
                    {/* Main content */}
                    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
                        {/* Left sidebar - Stats */}
                        <div className="space-y-6">
                            {/* Completion card */}
                            <Card className="shadow-card">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center justify-between text-sm font-medium">
                                        <span>Course Completion</span>
                                        <span className="text-lg font-bold text-primary">
                                            {completionPercent}%
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Progress
                                        value={completionPercent}
                                        className="mb-3 h-2"
                                    />
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Modules</span>
                                            <span className="font-medium text-foreground">
                                                {modules.length}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Lessons</span>
                                            <span className="font-medium text-foreground">
                                                {totalLessons}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Content Ready</span>
                                            <span className="font-medium text-green-500">
                                                {completedLessons}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            {/* Quick actions */}
                            <Card className="shadow-card">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium">
                                        Quick Actions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        size="sm"
                                        onClick={openAddModuleDialog}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Module
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        size="sm"
                                    >
                                        <Image className="mr-2 h-4 w-4" />
                                        Update Thumbnail
                                    </Button>
                                    {course.status === 'draft' && (
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start border-yellow-500/30 text-yellow-600 hover:bg-yellow-500/10"
                                            size="sm"
                                            onClick={handleSubmitForReview}
                                        >
                                            <Sparkles className="mr-2 h-4 w-4" />
                                            Submit for Review
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                        {/* Main content area */}
                        <div className="lg:col-span-3">
                            <Tabs
                                value={activeTab}
                                onValueChange={setActiveTab}
                            >
                                <TabsList className="mb-6 w-full justify-start bg-muted/50 p-1">
                                    <TabsTrigger
                                        value="curriculum"
                                        className="gap-2"
                                    >
                                        <Layers className="h-4 w-4" />
                                        Curriculum
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="details"
                                        className="gap-2"
                                    >
                                        <Settings className="h-4 w-4" />
                                        Details
                                    </TabsTrigger>
                                </TabsList>
                                {/* Curriculum Tab */}
                                <TabsContent
                                    value="curriculum"
                                    className="space-y-4"
                                >
                                    {/* Info bar */}
                                    <Card className="border-primary/20 bg-primary/5 shadow-sm">
                                        <CardContent className="py-3">
                                            <div className="flex items-center justify-between">
                                                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <GripVertical className="h-4 w-4" />
                                                    Drag lessons to reorder them
                                                    within modules
                                                </p>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        const allIds =
                                                            modules.map(
                                                                (m) => m.id,
                                                            );
                                                        setExpandedModules(
                                                            new Set(allIds),
                                                        );
                                                    }}
                                                >
                                                    Expand All
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    {/* Modules */}
                                    {modules.length === 0 ? (
                                        <Card className="shadow-card">
                                            <CardContent className="py-12 text-center">
                                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                                    <Layers className="h-8 w-8 text-muted-foreground" />
                                                </div>
                                                <h3 className="mb-2 font-semibold">
                                                    No modules yet
                                                </h3>
                                                <p className="mb-4 text-sm text-muted-foreground">
                                                    Start building your
                                                    curriculum by adding a
                                                    module.
                                                </p>
                                                <Button
                                                    onClick={
                                                        openAddModuleDialog
                                                    }
                                                >
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Add First Module
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        modules.map((module, mi) => {
                                            const isExpanded =
                                                expandedModules.has(module.id);
                                            const moduleLessonsWithContent =
                                                module.lessons.filter(
                                                    (l) => l.content,
                                                ).length;
                                            const moduleCompletion =
                                                module.lessons.length > 0
                                                    ? Math.round(
                                                          (moduleLessonsWithContent /
                                                              module.lessons
                                                                  .length) *
                                                              100,
                                                      )
                                                    : 0;
                                            const isDeleting =
                                                deletingModuleId === module.id;
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
                                                    <Card
                                                        className={`overflow-hidden shadow-card ${isDeleting ? 'opacity-50' : ''}`}
                                                    >
                                                        <div
                                                            onClick={() =>
                                                                toggleModule(
                                                                    module.id,
                                                                )
                                                            }
                                                            className="cursor-pointer"
                                                        >
                                                            <CardHeader className="border-b bg-muted/30 py-4 transition-colors hover:bg-muted/50">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                                                        <span className="font-bold text-primary">
                                                                            {mi +
                                                                                1}
                                                                        </span>
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <CardTitle className="truncate font-heading text-base">
                                                                            {
                                                                                module.title
                                                                            }
                                                                        </CardTitle>
                                                                        <CardDescription className="mt-0.5 flex items-center gap-3">
                                                                            <span>
                                                                                {
                                                                                    module
                                                                                        .lessons
                                                                                        .length
                                                                                }{' '}
                                                                                lessons
                                                                            </span>
                                                                            <span className="text-xs">
                                                                                •
                                                                            </span>
                                                                            <span
                                                                                className={
                                                                                    moduleCompletion ===
                                                                                    100
                                                                                        ? 'text-green-500'
                                                                                        : ''
                                                                                }
                                                                            >
                                                                                {
                                                                                    moduleCompletion
                                                                                }
                                                                                %
                                                                                complete
                                                                            </span>
                                                                        </CardDescription>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={(
                                                                                e,
                                                                            ) => {
                                                                                e.stopPropagation();
                                                                                openEditModuleDialog(
                                                                                    module,
                                                                                );
                                                                            }}
                                                                        >
                                                                            <Edit className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="text-destructive hover:text-destructive"
                                                                            onClick={(
                                                                                e,
                                                                            ) => {
                                                                                e.stopPropagation();
                                                                                handleDeleteModule(
                                                                                    module.id,
                                                                                );
                                                                            }}
                                                                            disabled={
                                                                                isDeleting
                                                                            }
                                                                        >
                                                                            {isDeleting ? (
                                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                                            ) : (
                                                                                <Trash2 className="h-4 w-4" />
                                                                            )}
                                                                        </Button>
                                                                        <Progress
                                                                            value={
                                                                                moduleCompletion
                                                                            }
                                                                            className="h-2 w-20"
                                                                        />
                                                                        {isExpanded ? (
                                                                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                                                        ) : (
                                                                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </CardHeader>
                                                        </div>
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
                                                                >
                                                                    <CardContent className="space-y-2 pt-4">
                                                                        <DndContext
                                                                            sensors={
                                                                                sensors
                                                                            }
                                                                            collisionDetection={
                                                                                closestCenter
                                                                            }
                                                                            onDragStart={
                                                                                handleDragStart
                                                                            }
                                                                            onDragEnd={(
                                                                                e,
                                                                            ) =>
                                                                                handleLessonDragEnd(
                                                                                    e,
                                                                                    module.id,
                                                                                    module.lessons,
                                                                                )
                                                                            }
                                                                        >
                                                                            <SortableContext
                                                                                items={module.lessons.map(
                                                                                    (
                                                                                        l,
                                                                                    ) =>
                                                                                        l.id,
                                                                                )}
                                                                                strategy={
                                                                                    verticalListSortingStrategy
                                                                                }
                                                                            >
                                                                                {module.lessons.map(
                                                                                    (
                                                                                        lesson,
                                                                                    ) => (
                                                                                        <SortableLesson
                                                                                            key={
                                                                                                lesson.id
                                                                                            }
                                                                                            lesson={
                                                                                                lesson
                                                                                            }
                                                                                            courseId={
                                                                                                course.id
                                                                                            }
                                                                                            moduleId={
                                                                                                module.id
                                                                                            }
                                                                                            onDelete={() =>
                                                                                                handleDeleteLesson(
                                                                                                    module.id,
                                                                                                    lesson.id,
                                                                                                    lesson.title,
                                                                                                )
                                                                                            }
                                                                                            isDeleting={
                                                                                                deletingLessonId ===
                                                                                                lesson.id
                                                                                            }
                                                                                        />
                                                                                    ),
                                                                                )}
                                                                            </SortableContext>
                                                                        </DndContext>
                                                                        {module
                                                                            .lessons
                                                                            .length ===
                                                                            0 && (
                                                                            <p className="py-4 text-center text-sm text-muted-foreground">
                                                                                No
                                                                                lessons
                                                                                in
                                                                                this
                                                                                module
                                                                                yet.
                                                                            </p>
                                                                        )}
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="mt-2 w-full justify-center border border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5"
                                                                            onClick={() =>
                                                                                openAddLessonDialog(
                                                                                    module.id,
                                                                                )
                                                                            }
                                                                        >
                                                                            <Plus className="mr-1 h-4 w-4" />{' '}
                                                                            Add
                                                                            Lesson
                                                                        </Button>
                                                                    </CardContent>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </Card>
                                                </motion.div>
                                            );
                                        })
                                    )}
                                    {/* Add module button */}
                                    {modules.length > 0 && (
                                        <Button
                                            variant="outline"
                                            className="h-14 w-full border-2 border-dashed hover:border-primary/50 hover:bg-primary/5"
                                            onClick={openAddModuleDialog}
                                        >
                                            <Plus className="mr-2 h-5 w-5" />{' '}
                                            Add New Module
                                        </Button>
                                    )}
                                </TabsContent>
                                {/* Details Tab */}
                                <TabsContent value="details">
                                    <Card className="shadow-card">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 font-heading text-lg">
                                                <Settings className="h-5 w-5 text-primary" />
                                                Course Details
                                            </CardTitle>
                                            <CardDescription>
                                                Update your course information
                                                and settings
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            {/* Thumbnail */}
                                            <div>
                                                <Label className="text-sm font-medium">
                                                    Course Thumbnail
                                                </Label>
                                                <div className="mt-2 flex items-start gap-4">
                                                    <div className="h-28 w-48 overflow-hidden rounded-lg border bg-muted">
                                                        {thumbnail ? (
                                                            <img
                                                                src={thumbnail}
                                                                alt="Course thumbnail"
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center">
                                                                <Image className="h-8 w-8 text-muted-foreground/50" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleThumbnailChange}
                                                            className="hidden"
                                                            id="thumbnail-upload"
                                                        />
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => document.getElementById('thumbnail-upload')?.click()}
                                                            type="button"
                                                        >
                                                            <Image className="mr-2 h-4 w-4" />
                                                            Change Image
                                                        </Button>
                                                        <p className="text-xs text-muted-foreground">
                                                            Recommended:
                                                            1280×720 (16:9)
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <Separator />
                                            {/* Course Video */}
                                            <div>
                                                <CourseVideoInput
                                                    videoType={videoType}
                                                    videoUrl={videoUrl}
                                                    onVideoChange={(type, url) => {
                                                        setVideoType(type);
                                                        setVideoUrl(url);
                                                    }}
                                                    onUpload={async (file) => {
                                                        // In a real app, upload the video file to your backend
                                                        // For now, we'll use data URL
                                                        return new Promise((resolve) => {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                resolve(reader.result as string);
                                                            };
                                                            reader.readAsDataURL(file);
                                                        });
                                                    }}
                                                />
                                            </div>
                                            <Separator />
                                            {/* Title */}
                                            <div>
                                                <Label
                                                    htmlFor="title"
                                                    className="text-sm font-medium"
                                                >
                                                    Course Title
                                                </Label>
                                                <Input
                                                    id="title"
                                                    value={title}
                                                    onChange={(e) =>
                                                        setTitle(e.target.value)
                                                    }
                                                    className="mt-2"
                                                />
                                            </div>
                                            {/* Description */}
                                            <div>
                                                <Label
                                                    htmlFor="description"
                                                    className="text-sm font-medium"
                                                >
                                                    Description
                                                </Label>
                                                <Textarea
                                                    id="description"
                                                    value={description}
                                                    onChange={(e) =>
                                                        setDescription(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="mt-2 min-h-[120px]"
                                                    rows={5}
                                                />
                                            </div>
                                            {/* Category & Level */}
                                            <div className="grid gap-6 sm:grid-cols-2">
                                                <div>
                                                    <Label className="text-sm font-medium">
                                                        Category
                                                    </Label>
                                                    <Select
                                                        value={category}
                                                        onValueChange={
                                                            setCategory
                                                        }
                                                    >
                                                        <SelectTrigger className="mt-2">
                                                            <SelectValue placeholder="Select category" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {categories.map(
                                                                (cat) => (
                                                                    <SelectItem
                                                                        key={
                                                                            cat
                                                                        }
                                                                        value={
                                                                            cat
                                                                        }
                                                                    >
                                                                        {cat}
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-medium">
                                                        Level
                                                    </Label>
                                                    <Select
                                                        value={level}
                                                        onValueChange={(value) => setLevel(value as unknown as typeof level)}
                                                    >
                                                        <SelectTrigger className="mt-2">
                                                            <SelectValue placeholder="Select level" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Beginner">
                                                                Beginner
                                                            </SelectItem>
                                                            <SelectItem value="Intermediate">
                                                                Intermediate
                                                            </SelectItem>
                                                            <SelectItem value="Advanced">
                                                                Advanced
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>
            {/* Module Dialog */}
            <Dialog open={showModuleDialog} onOpenChange={setShowModuleDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingModule ? 'Edit Module' : 'Add New Module'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingModule
                                ? 'Update the module title.'
                                : 'Create a new module for your course curriculum.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="module-title">Module Title</Label>
                        <Input
                            id="module-title"
                            value={moduleTitle}
                            onChange={(e) => setModuleTitle(e.target.value)}
                            placeholder="e.g., Introduction to IoT"
                            className="mt-2"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowModuleDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveModule}
                            disabled={isModuleSaving || !moduleTitle.trim()}
                        >
                            {isModuleSaving && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {editingModule ? 'Save Changes' : 'Create Module'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Lesson Dialog */}
            <Dialog open={showLessonDialog} onOpenChange={setShowLessonDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Lesson</DialogTitle>
                        <DialogDescription>
                            Create a new lesson. You can add content after
                            creating.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="lesson-title">Lesson Title</Label>
                            <Input
                                id="lesson-title"
                                value={lessonTitle}
                                onChange={(e) => setLessonTitle(e.target.value)}
                                placeholder="e.g., Setting up your development environment"
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <Label>Lesson Type</Label>
                            <Select
                                value={lessonType}
                                onValueChange={setLessonType}
                            >
                                <SelectTrigger className="mt-2">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="video">
                                        <div className="flex items-center gap-2">
                                            <Video className="h-4 w-4 text-blue-500" />
                                            Video
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="reading">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-green-500" />
                                            Reading
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="practice">
                                        <div className="flex items-center gap-2">
                                            <Zap className="h-4 w-4 text-yellow-500" />
                                            Practice
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="vm-lab">
                                        <div className="flex items-center gap-2">
                                            <Terminal className="h-4 w-4 text-violet-500" />
                                            VM Lab
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowLessonDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveLesson}
                            disabled={isLessonSaving || !lessonTitle.trim()}
                        >
                            {isLessonSaving && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Create Lesson
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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
                loading={deletingModuleId !== null || deletingLessonId !== null}
            />
        </AppLayout>
    );
}

