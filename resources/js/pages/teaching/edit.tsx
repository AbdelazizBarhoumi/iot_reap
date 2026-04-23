/**
 * Edit TrainingPath Page - Professional Curriculum Builder
 * Teacher view for editing trainingPath details and managing curriculum with drag-and-drop.
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
import * as teachingApi from '@/api/teaching.api';
import { TrainingPathStatusBanner } from '@/components/TrainingPaths/TrainingPathStatusBanner';
import TrainingPathVideoInput from '@/components/TrainingPaths/TrainingPathVideoInput';
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
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type {
    TrainingPath,
    TrainingPathModule,
    TrainingUnit,
    TrainingPathStatus,
} from '@/types/TrainingPath.types';
const statusConfig: Record<
    TrainingPathStatus,
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
const trainingUnitTypeConfig = {
    video: { icon: Video, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    reading: { icon: FileText, color: 'text-green-500', bg: 'bg-green-500/10' },
    practice: { icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    'vm-lab': {
        icon: Terminal,
        color: 'text-violet-500',
        bg: 'bg-violet-500/10',
    },
};
interface SortableTrainingUnitProps {
    trainingUnit: TrainingUnit;
    trainingPathId: number;
    moduleId: string;
    onDelete: () => void;
    isDeleting: boolean;
}
function SortableTrainingUnit({
    trainingUnit,
    trainingPathId,
    moduleId,
    onDelete,
    isDeleting,
}: SortableTrainingUnitProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: trainingUnit.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    const typeConfig =
        trainingUnitTypeConfig[
            trainingUnit.type as keyof typeof trainingUnitTypeConfig
        ] || trainingUnitTypeConfig.video;
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
                    {trainingUnit.title}
                </p>
                <div className="mt-0.5 flex items-center gap-2">
                    {trainingUnit.content ? (
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
                {trainingUnit.type.replace('-', ' ')}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {trainingUnit.duration ?? '0 min'}
            </span>
            {trainingUnit.vmEnabled && (
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
                    href={`/teaching/${trainingPathId}/module/${moduleId}/trainingUnit/${trainingUnit.id}`}
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
interface EditTrainingPathPageProps {
    id: string;
    trainingPath: TrainingPath;
    categories: string[];
}
interface SortableModuleContainerProps {
    moduleId: string;
    isDeleting: boolean;
    children: (dragHandleProps: {
        attributes: ReturnType<typeof useSortable>['attributes'];
        listeners: ReturnType<typeof useSortable>['listeners'];
        isDragging: boolean;
    }) => React.ReactNode;
}
function SortableModuleContainer({
    moduleId,
    isDeleting,
    children,
}: SortableModuleContainerProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: moduleId });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`${isDragging ? 'z-10 opacity-70' : ''} ${isDeleting ? 'pointer-events-none' : ''}`}
        >
            {children({ attributes, listeners, isDragging })}
        </div>
    );
}
export default function EditTrainingPathPage({
    id,
    trainingPath: initialTrainingPath,
    categories,
}: EditTrainingPathPageProps) {
    // Local state for optimistic updates
    const [trainingPath, setTrainingPath] =
        useState<TrainingPath>(initialTrainingPath);
    const [activeTab, setActiveTab] = useState('curriculum');
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [expandedModules, setExpandedModules] = useState<Set<string>>(
        new Set(),
    );

    const [_activeId, setActiveId] = useState<string | null>(null);
    const [deletingTrainingUnitId, setDeletingTrainingUnitId] = useState<
        string | null
    >(null);
    const [deletingModuleId, setDeletingModuleId] = useState<string | null>(
        null,
    );
    // Module dialog state
    const [showModuleDialog, setShowModuleDialog] = useState(false);
    const [editingModule, setEditingModule] =
        useState<TrainingPathModule | null>(null);
    const [moduleTitle, setModuleTitle] = useState('');
    const [isModuleSaving, setIsModuleSaving] = useState(false);
    // TrainingUnit dialog state
    const [showTrainingUnitDialog, setShowTrainingUnitDialog] = useState(false);
    const [trainingUnitModuleId, setTrainingUnitModuleId] = useState<
        string | null
    >(null);
    const [trainingUnitTitle, setTrainingUnitTitle] = useState('');
    const [trainingUnitType, setTrainingUnitType] = useState<
        'video' | 'article' | 'quiz' | 'interactive'
    >('video');
    const [isTrainingUnitSaving, setIsTrainingUnitSaving] = useState(false);
    // Form state for details tab
    const [title, setTitle] = useState(trainingPath.title);
    const [description, setDescription] = useState(trainingPath.description);
    const [category, setCategory] = useState(trainingPath.category);
    const [level, setLevel] = useState(trainingPath.level);
    const [price, setPrice] = useState(trainingPath.price?.toString() ?? '0');
    const [currency, setCurrency] = useState(trainingPath.currency ?? 'USD');
    const [isFree, setIsFree] = useState(trainingPath.isFree ?? false);
    const [thumbnail, setThumbnail] = useState<string | null>(
        trainingPath.thumbnail,
    );
    const [videoType, setVideoType] = useState<'upload' | 'youtube' | null>(
        trainingPath.video_type || null,
    );
    const [videoUrl, setVideoUrl] = useState<string | null>(
        trainingPath.video_url || null,
    );
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
    const { flash } = usePage<{
        flash?: { success?: string; error?: string };
    }>().props;
    // Show flash message on page load (e.g., after trainingPath creation redirect)
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
            { title: trainingPath.title, href: `/teaching/${id}/edit` },
        ],
        [trainingPath.title, id],
    );
    const modules = useMemo(
        () => trainingPath.modules ?? [],
        [trainingPath.modules],
    );
    const totalTrainingUnits = modules.reduce(
        (acc, m) => acc + m.trainingUnits.length,
        0,
    );
    const completedTrainingUnits = modules.reduce(
        (acc, m) => acc + m.trainingUnits.filter((l) => l.content).length,
        0,
    );
    const completionPercent =
        totalTrainingUnits > 0
            ? Math.round((completedTrainingUnits / totalTrainingUnits) * 100)
            : 0;
    const statusInfo = statusConfig[trainingPath.status] ?? statusConfig.draft;
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
            if (thumbnail && thumbnail !== trainingPath.thumbnail) {
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
            updateData.price = isFree ? 0 : Number(price) || 0;
            updateData.currency = currency || 'USD';
            updateData.is_free = isFree;
            await teachingApi.updateTrainingPath(
                String(trainingPath.id),
                updateData,
            );
            setTrainingPath((prev) => ({
                ...prev,
                title,
                description,
                category,
                level,
                price: isFree ? 0 : Number(price) || 0,
                currency: currency || 'USD',
                isFree,
                thumbnail: thumbnail ?? prev.thumbnail,
                video_type: videoType ?? prev.video_type,
                video_url: videoUrl ?? prev.video_url,
            }));
            setLastSaved(new Date());
            toast.success('Changes saved!', {
                description: 'Your trainingPath has been updated.',
            });
        } catch {
            toast.error('Failed to save', {
                description: 'Could not update trainingPath. Please try again.',
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
            await teachingApi.submitTrainingPathForReview(
                String(trainingPath.id),
            );
            setTrainingPath((prev) => ({
                ...prev,
                status: 'pending_review',
            }));
            toast.success('Submitted for review!', {
                description: 'An admin will review your trainingPath shortly.',
            });
        } catch {
            toast.error('Failed to submit', {
                description: 'Could not submit trainingPath for review.',
            });
        }
    };
    // === MODULE CRUD ===
    const openAddModuleDialog = () => {
        setEditingModule(null);
        setModuleTitle('');
        setShowModuleDialog(true);
    };
    const openEditModuleDialog = (module: TrainingPathModule) => {
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
                    String(trainingPath.id),
                    String(editingModule.id),
                    { title: moduleTitle },
                );
                setTrainingPath((prev) => ({
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
                const response = await teachingApi.createModule(
                    String(trainingPath.id),
                    {
                        title: moduleTitle,
                    },
                );
                // The backend returns { data: module }
                const moduleData = (
                    response.data as unknown as { data: teachingApi.Module }
                ).data;
                const newModule: TrainingPathModule = {
                    id: String(moduleData.id),
                    title: moduleTitle,
                    sort_order: modules.length,
                    trainingUnits: [],
                };
                setTrainingPath((prev) => ({
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
                'Are you sure you want to delete this module and all its trainingUnits? This action cannot be undone.',
            confirmText: 'Delete Module',
            variant: 'destructive',
            onConfirm: async () => {
                setDeletingModuleId(moduleId);
                try {
                    await teachingApi.deleteModule(
                        String(trainingPath.id),
                        String(moduleId),
                    );
                    setTrainingPath((prev) => ({
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
    const openAddTrainingUnitDialog = (moduleId: string) => {
        setTrainingUnitModuleId(moduleId);
        setTrainingUnitTitle('');
        setTrainingUnitType('video');
        setShowTrainingUnitDialog(true);
    };
    const handleSaveTrainingUnit = async () => {
        if (!trainingUnitTitle.trim() || !trainingUnitModuleId) return;
        setIsTrainingUnitSaving(true);
        try {
            const response = await teachingApi.createTrainingUnit(
                String(trainingPath.id),
                trainingUnitModuleId,
                {
                    title: trainingUnitTitle,
                    type: trainingUnitType,
                },
            );
            // The backend returns { data: trainingUnit }
            const trainingUnitData = (
                response.data as unknown as {
                    data: teachingApi.TrainingUnit;
                }
            ).data;
            const newTrainingUnit: TrainingUnit = {
                id: String(trainingUnitData.id),
                title: trainingUnitTitle,
                type: trainingUnitType as TrainingUnit['type'],
                duration: null,
                content: null,
                objectives: null,
                vmEnabled: false,
                videoUrl: null,
                resources: null,
                sort_order: 0,
            };
            setTrainingPath((prev) => ({
                ...prev,
                modules: prev.modules?.map((m) =>
                    m.id === trainingUnitModuleId
                        ? {
                              ...m,
                              trainingUnits: [
                                  ...m.trainingUnits,
                                  newTrainingUnit,
                              ],
                          }
                        : m,
                ),
            }));
            toast.success('TrainingUnit created');
            setShowTrainingUnitDialog(false);
            // Expand the module to show the new trainingUnit
            setExpandedModules((prev) =>
                new Set(prev).add(trainingUnitModuleId),
            );
        } catch {
            toast.error('Failed to create trainingUnit');
        } finally {
            setIsTrainingUnitSaving(false);
        }
    };
    const handleDeleteTrainingUnit = async (
        moduleId: string,
        trainingUnitId: string,
        trainingUnitTitle: string,
    ) => {
        setConfirmDialog({
            open: true,
            title: 'Delete TrainingUnit',
            description: `Are you sure you want to delete "${trainingUnitTitle}"? This action cannot be undone.`,
            confirmText: 'Delete TrainingUnit',
            variant: 'destructive',
            onConfirm: async () => {
                setDeletingTrainingUnitId(trainingUnitId);
                try {
                    await teachingApi.deleteTrainingUnit(
                        String(trainingPath.id),
                        String(moduleId),
                        String(trainingUnitId),
                    );
                    setTrainingPath((prev) => ({
                        ...prev,
                        modules: prev.modules?.map((m) =>
                            m.id === moduleId
                                ? {
                                      ...m,
                                      trainingUnits: m.trainingUnits.filter(
                                          (l) => l.id !== trainingUnitId,
                                      ),
                                  }
                                : m,
                        ),
                    }));
                    toast.success('TrainingUnit deleted', {
                        description: `"${trainingUnitTitle}" has been removed.`,
                    });
                } catch {
                    toast.error('Failed to delete trainingUnit');
                } finally {
                    setDeletingTrainingUnitId(null);
                }
            },
        });
    };
    // === DRAG & DROP REORDER ===
    const handleDragStart = useCallback((event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    }, []);
    const handleTrainingUnitDragEnd = useCallback(
        async (
            event: DragEndEvent,
            moduleId: string,
            trainingUnits: TrainingUnit[],
        ) => {
            const { active, over } = event;
            setActiveId(null);
            if (over && active.id !== over.id) {
                const oldIndex = trainingUnits.findIndex(
                    (l) => l.id === active.id,
                );
                const newIndex = trainingUnits.findIndex(
                    (l) => l.id === over.id,
                );
                const newOrder = arrayMove(trainingUnits, oldIndex, newIndex);
                // Optimistic update
                setTrainingPath((prev) => ({
                    ...prev,
                    modules: prev.modules?.map((m) =>
                        m.id === moduleId
                            ? { ...m, trainingUnits: newOrder }
                            : m,
                    ),
                }));
                // Persist to backend
                try {
                    await teachingApi.reorderTrainingUnits(
                        String(trainingPath.id),
                        String(moduleId),
                        newOrder.map((l) => String(l.id)),
                    );
                    toast.success('TrainingUnit order updated');
                } catch {
                    // Revert on failure
                    setTrainingPath((prev) => ({
                        ...prev,
                        modules: prev.modules?.map((m) =>
                            m.id === moduleId ? { ...m, trainingUnits } : m,
                        ),
                    }));
                    toast.error('Failed to reorder trainingUnits');
                }
            }
        },
        [trainingPath.id],
    );
    const handleModuleDragEnd = useCallback(
        async (event: DragEndEvent) => {
            const { active, over } = event;
            setActiveId(null);

            if (!over || active.id === over.id) {
                return;
            }

            const oldIndex = modules.findIndex(
                (module) => module.id === active.id,
            );
            const newIndex = modules.findIndex(
                (module) => module.id === over.id,
            );

            if (oldIndex < 0 || newIndex < 0) {
                return;
            }

            const newOrder = arrayMove(modules, oldIndex, newIndex);

            setTrainingPath((prev) => ({
                ...prev,
                modules: newOrder,
            }));

            try {
                await teachingApi.reorderModules(
                    String(trainingPath.id),
                    newOrder.map((module) => String(module.id)),
                );
                toast.success('Module order updated');
            } catch {
                setTrainingPath((prev) => ({
                    ...prev,
                    modules,
                }));
                toast.error('Failed to reorder modules');
            }
        },
        [modules, trainingPath.id],
    );
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${trainingPath.title}`} />
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
                                    {trainingPath.title}
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
                                        {trainingPath.students?.toLocaleString() ??
                                            0}{' '}
                                        students
                                    </span>
                                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                                        {trainingPath.rating ?? 0}
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
                                <Link
                                    href={`/trainingPaths/${trainingPath.id}`}
                                >
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
                    <TrainingPathStatusBanner
                        status={trainingPath.status}
                        adminFeedback={trainingPath.adminFeedback}
                    />
                    {/* Main content */}
                    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
                        {/* Left sidebar - Stats */}
                        <div className="space-y-6">
                            {/* Completion card */}
                            <Card className="shadow-card">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center justify-between text-sm font-medium">
                                        <span>Path Completion</span>
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
                                            <span>TrainingUnits</span>
                                            <span className="font-medium text-foreground">
                                                {totalTrainingUnits}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Content Ready</span>
                                            <span className="font-medium text-green-500">
                                                {completedTrainingUnits}
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
                                    {trainingPath.status === 'draft' && (
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
                                                    Drag modules and
                                                    trainingUnits to keep the
                                                    curriculum in the right
                                                    order
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
                                        <DndContext
                                            sensors={sensors}
                                            collisionDetection={closestCenter}
                                            onDragStart={handleDragStart}
                                            onDragEnd={handleModuleDragEnd}
                                        >
                                            <SortableContext
                                                items={modules.map(
                                                    (module) => module.id,
                                                )}
                                                strategy={
                                                    verticalListSortingStrategy
                                                }
                                            >
                                                <div className="space-y-4">
                                                    {modules.map(
                                                        (module, mi) => {
                                                            const isExpanded =
                                                                expandedModules.has(
                                                                    module.id,
                                                                );
                                                            const moduleTrainingUnitsWithContent =
                                                                module.trainingUnits.filter(
                                                                    (l) =>
                                                                        l.content,
                                                                ).length;
                                                            const moduleCompletion =
                                                                module
                                                                    .trainingUnits
                                                                    .length > 0
                                                                    ? Math.round(
                                                                          (moduleTrainingUnitsWithContent /
                                                                              module
                                                                                  .trainingUnits
                                                                                  .length) *
                                                                              100,
                                                                      )
                                                                    : 0;
                                                            const isDeleting =
                                                                deletingModuleId ===
                                                                module.id;
                                                            return (
                                                                <SortableModuleContainer
                                                                    key={
                                                                        module.id
                                                                    }
                                                                    moduleId={
                                                                        module.id
                                                                    }
                                                                    isDeleting={
                                                                        isDeleting
                                                                    }
                                                                >
                                                                    {({
                                                                        attributes,
                                                                        listeners,
                                                                        isDragging,
                                                                    }) => (
                                                                        <Card
                                                                            className={`overflow-hidden shadow-card ${isDeleting ? 'opacity-50' : ''} ${isDragging ? 'ring-2 ring-primary/40' : ''}`}
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
                                                                                        <button
                                                                                            {...attributes}
                                                                                            {...listeners}
                                                                                            onClick={(
                                                                                                e,
                                                                                            ) => {
                                                                                                e.stopPropagation();
                                                                                            }}
                                                                                            className="cursor-grab touch-none rounded-lg border border-dashed border-muted-foreground/30 p-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary active:cursor-grabbing"
                                                                                            aria-label={`Reorder module ${module.title}`}
                                                                                        >
                                                                                            <GripVertical className="h-4 w-4" />
                                                                                        </button>
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
                                                                                                            .trainingUnits
                                                                                                            .length
                                                                                                    }{' '}
                                                                                                    trainingUnits
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
                                                                                                    handleTrainingUnitDragEnd(
                                                                                                        e,
                                                                                                        module.id,
                                                                                                        module.trainingUnits,
                                                                                                    )
                                                                                                }
                                                                                            >
                                                                                                <SortableContext
                                                                                                    items={module.trainingUnits.map(
                                                                                                        (
                                                                                                            l,
                                                                                                        ) =>
                                                                                                            l.id,
                                                                                                    )}
                                                                                                    strategy={
                                                                                                        verticalListSortingStrategy
                                                                                                    }
                                                                                                >
                                                                                                    {module.trainingUnits.map(
                                                                                                        (
                                                                                                            trainingUnit,
                                                                                                        ) => (
                                                                                                            <SortableTrainingUnit
                                                                                                                key={
                                                                                                                    trainingUnit.id
                                                                                                                }
                                                                                                                trainingUnit={
                                                                                                                    trainingUnit
                                                                                                                }
                                                                                                                trainingPathId={
                                                                                                                    trainingPath.id
                                                                                                                }
                                                                                                                moduleId={
                                                                                                                    module.id
                                                                                                                }
                                                                                                                onDelete={() =>
                                                                                                                    handleDeleteTrainingUnit(
                                                                                                                        module.id,
                                                                                                                        trainingUnit.id,
                                                                                                                        trainingUnit.title,
                                                                                                                    )
                                                                                                                }
                                                                                                                isDeleting={
                                                                                                                    deletingTrainingUnitId ===
                                                                                                                    trainingUnit.id
                                                                                                                }
                                                                                                            />
                                                                                                        ),
                                                                                                    )}
                                                                                                </SortableContext>
                                                                                            </DndContext>
                                                                                            {module
                                                                                                .trainingUnits
                                                                                                .length ===
                                                                                                0 && (
                                                                                                <p className="py-4 text-center text-sm text-muted-foreground">
                                                                                                    No
                                                                                                    trainingUnits
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
                                                                                                    openAddTrainingUnitDialog(
                                                                                                        module.id,
                                                                                                    )
                                                                                                }
                                                                                            >
                                                                                                <Plus className="mr-1 h-4 w-4" />{' '}
                                                                                                Add
                                                                                                TrainingUnit
                                                                                            </Button>
                                                                                        </CardContent>
                                                                                    </motion.div>
                                                                                )}
                                                                            </AnimatePresence>
                                                                        </Card>
                                                                    )}
                                                                </SortableModuleContainer>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            </SortableContext>
                                        </DndContext>
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
                                                TrainingPath Details
                                            </CardTitle>
                                            <CardDescription>
                                                Update your training path
                                                information and settings
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            {/* Thumbnail */}
                                            <div>
                                                <Label className="text-sm font-medium">
                                                    Path Thumbnail
                                                </Label>
                                                <div className="mt-2 flex items-start gap-4">
                                                    <div className="h-28 w-48 overflow-hidden rounded-lg border bg-muted">
                                                        {thumbnail ? (
                                                            <img
                                                                src={thumbnail}
                                                                alt="Path thumbnail"
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
                                                            onChange={
                                                                handleThumbnailChange
                                                            }
                                                            className="hidden"
                                                            id="thumbnail-upload"
                                                        />
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                document
                                                                    .getElementById(
                                                                        'thumbnail-upload',
                                                                    )
                                                                    ?.click()
                                                            }
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
                                            {/* Path Video */}
                                            <div>
                                                <TrainingPathVideoInput
                                                    videoType={videoType}
                                                    videoUrl={videoUrl}
                                                    onVideoChange={(
                                                        type,
                                                        url,
                                                    ) => {
                                                        setVideoType(type);
                                                        setVideoUrl(url);
                                                    }}
                                                    onUpload={async (file) => {
                                                        // In a real app, upload the video file to your backend
                                                        // For now, we'll use data URL
                                                        return new Promise(
                                                            (resolve) => {
                                                                const reader =
                                                                    new FileReader();
                                                                reader.onloadend =
                                                                    () => {
                                                                        resolve(
                                                                            reader.result as string,
                                                                        );
                                                                    };
                                                                reader.readAsDataURL(
                                                                    file,
                                                                );
                                                            },
                                                        );
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
                                                    Path Title
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
                                                        onValueChange={(
                                                            value,
                                                        ) =>
                                                            setLevel(
                                                                value as unknown as typeof level,
                                                            )
                                                        }
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
                                                <div>
                                                    <Label className="text-sm font-medium">
                                                        Path Price
                                                    </Label>
                                                    <div className="mt-2 flex gap-2">
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={price}
                                                            onChange={(e) => {
                                                                setPrice(
                                                                    e.target
                                                                        .value,
                                                                );
                                                                if (
                                                                    Number(
                                                                        e.target
                                                                            .value,
                                                                    ) > 0
                                                                ) {
                                                                    setIsFree(
                                                                        false,
                                                                    );
                                                                }
                                                            }}
                                                            disabled={isFree}
                                                            className="h-12 flex-1"
                                                        />
                                                        <Input
                                                            value={currency}
                                                            onChange={(e) =>
                                                                setCurrency(
                                                                    e.target.value
                                                                        .toUpperCase()
                                                                        .slice(
                                                                            0,
                                                                            3,
                                                                        ),
                                                                )
                                                            }
                                                            className="h-12 w-24"
                                                            maxLength={3}
                                                        />
                                                    </div>
                                                    <div className="mt-2 flex items-center justify-between rounded-lg border bg-background px-3 py-2">
                                                        <span className="text-xs text-muted-foreground">
                                                            Mark as free
                                                        </span>
                                                        <Switch
                                                            checked={isFree}
                                                            onCheckedChange={(
                                                                checked,
                                                            ) => {
                                                                setIsFree(
                                                                    checked,
                                                                );
                                                                if (checked) {
                                                                    setPrice(
                                                                        '0',
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                    </div>
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
                                : 'Create a new module for your trainingPath curriculum.'}
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
            {/* TrainingUnit Dialog */}
            <Dialog
                open={showTrainingUnitDialog}
                onOpenChange={setShowTrainingUnitDialog}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New TrainingUnit</DialogTitle>
                        <DialogDescription>
                            Create a new trainingUnit. You can add content after
                            creating.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="trainingUnit-title">
                                TrainingUnit Title
                            </Label>
                            <Input
                                id="trainingUnit-title"
                                value={trainingUnitTitle}
                                onChange={(e) =>
                                    setTrainingUnitTitle(e.target.value)
                                }
                                placeholder="e.g., Setting up your development environment"
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <Label>TrainingUnit Type</Label>
                            <Select
                                value={trainingUnitType}
                                onValueChange={(value) =>
                                    setTrainingUnitType(
                                        value as
                                            | 'video'
                                            | 'article'
                                            | 'quiz'
                                            | 'interactive',
                                    )
                                }
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
                            onClick={() => setShowTrainingUnitDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveTrainingUnit}
                            disabled={
                                isTrainingUnitSaving ||
                                !trainingUnitTitle.trim()
                            }
                        >
                            {isTrainingUnitSaving && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Create TrainingUnit
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
                loading={
                    deletingModuleId !== null || deletingTrainingUnitId !== null
                }
            />
        </AppLayout>
    );
}
