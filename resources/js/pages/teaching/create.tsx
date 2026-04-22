/**
 * Create TrainingPath Page - Professional Multi-Step Wizard
 * Form for teachers to create new trainingPaths with step-by-step guidance.
 * Uses unified AppLayout with drag-and-drop reordering.
 */
import type { DragEndEvent } from '@dnd-kit/core';
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
import { Head, Link, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    ArrowRight,
    BookOpen,
    Check,
    ChevronDown,
    ChevronUp,
    Clock,
    FileText,
    GripVertical,
    Image,
    Info,
    Layers,
    Plus,
    Rocket,
    Save,
    Sparkles,
    Target,
    Terminal,
    Trash2,
    Upload,
    Video,
    Zap,
} from 'lucide-react';
import { useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';
import TrainingPathVideoInput from '@/components/TrainingPaths/TrainingPathVideoInput';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { LearningAppProvider } from '@/lib/learning/appState';
import type { BreadcrumbItem } from '@/types';
interface CreateTrainingPathPageProps {
    categories: string[];
}
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Teaching', href: '/teaching' },
    { title: 'Create Path', href: '/teaching/create' },
];
// Step configuration
const steps = [
    { id: 1, title: 'Basics', description: 'TrainingPath info', icon: FileText },
    { id: 2, title: 'Details', description: 'Settings', icon: Target },
    { id: 3, title: 'Curriculum', description: 'Structure', icon: Layers },
    { id: 4, title: 'Review', description: 'Finish', icon: Rocket },
];
// TrainingUnit type configuration with icons and colors
const trainingUnitTypes = [
    {
        value: 'video',
        label: 'Video',
        icon: Video,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
    },
    {
        value: 'reading',
        label: 'Reading',
        icon: FileText,
        color: 'text-green-500',
        bg: 'bg-green-500/10',
    },
    {
        value: 'practice',
        label: 'Practice',
        icon: Zap,
        color: 'text-yellow-500',
        bg: 'bg-yellow-500/10',
    },
    {
        value: 'vm-lab',
        label: 'VM Lab',
        icon: Terminal,
        color: 'text-violet-500',
        bg: 'bg-violet-500/10',
    },
];
interface Resource {
    id: string;
    title: string;
    url: string;
}
interface TrainingUnitForm {
    id: string;
    title: string;
    type: string;
    duration: string;
    vmEnabled: boolean;
    // Content fields for inline editing during creation
    content: string;           // For reading/article trainingUnits
    videoUrl: string;          // For video trainingUnits (external URL)
    teacherNotes: string;      // For VM lab trainingUnits
    resources: Resource[];     // Optional links/files
}
interface ModuleForm {
    id: string;
    title: string;
    trainingUnits: TrainingUnitForm[];
}
// Sortable TrainingUnit Component for drag-and-drop
interface SortableTrainingUnitProps {
    trainingUnit: TrainingUnitForm;
    moduleIndex: number;
    trainingUnitIndex: number;
    expanded: boolean;
    onToggleExpand: () => void;
    onUpdate: (moduleIndex: number, trainingUnitIndex: number, field: keyof TrainingUnitForm, value: unknown) => void;
    onRemove: (moduleIndex: number, trainingUnitIndex: number) => void;
    canRemove: boolean;
}
function SortableTrainingUnit({
    trainingUnit,
    moduleIndex,
    trainingUnitIndex,
    expanded,
    onToggleExpand,
    onUpdate,
    onRemove,
    canRemove,
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
        opacity: isDragging ? 0.5 : 1,
    };
    const trainingUnitType = trainingUnitTypes.find((t) => t.value === trainingUnit.type);
    const TrainingUnitIcon = trainingUnitType?.icon || Video;
    // Helper to check if content has been added
    const hasContent = () => {
        switch (trainingUnit.type) {
            case 'video':
                return !!trainingUnit.videoUrl;
            case 'reading':
                return trainingUnit.content.length > 0;
            case 'vm-lab':
                return trainingUnit.teacherNotes.length > 0;
            case 'practice':
                return trainingUnit.content.length > 0;
            default:
                return false;
        }
    };
    // Add resource handler
    const addResource = () => {
        const newResources = [...trainingUnit.resources, { id: Date.now().toString(), title: '', url: '' }];
        onUpdate(moduleIndex, trainingUnitIndex, 'resources', newResources);
    };
    // Update resource handler
    const updateResource = (resourceIndex: number, field: keyof Resource, value: string) => {
        const updated = [...trainingUnit.resources];
        updated[resourceIndex] = { ...updated[resourceIndex], [field]: value };
        onUpdate(moduleIndex, trainingUnitIndex, 'resources', updated);
    };
    // Remove resource handler
    const removeResource = (resourceIndex: number) => {
        const updated = trainingUnit.resources.filter((_, i) => i !== resourceIndex);
        onUpdate(moduleIndex, trainingUnitIndex, 'resources', updated);
    };
    // Content editor based on trainingUnit type
    const renderContentEditor = () => {
        switch (trainingUnit.type) {
            case 'video':
                return (
                    <div className="space-y-4">
                        <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Video className="h-4 w-4 text-blue-500" />
                                <Label className="text-sm font-medium">Video URL</Label>
                            </div>
                            <Input
                                placeholder="https://youtube.com/watch?v=... or external video URL"
                                value={trainingUnit.videoUrl}
                                onChange={(e) => onUpdate(moduleIndex, trainingUnitIndex, 'videoUrl', e.target.value)}
                                className="bg-background"
                            />
                            <p className="mt-2 text-xs text-muted-foreground">
                                Enter an external video URL. You can also upload videos after creating the trainingPath.
                            </p>
                        </div>
                    </div>
                );
            case 'reading':
                return (
                    <div className="space-y-4">
                        <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <FileText className="h-4 w-4 text-green-500" />
                                <Label className="text-sm font-medium">Article Content</Label>
                            </div>
                            <Textarea
                                placeholder="Write your article content here. Markdown is supported.&#10;&#10;## Introduction&#10;Start with an overview...&#10;&#10;## Main Content&#10;Explain the concepts..."
                                value={trainingUnit.content}
                                onChange={(e) => onUpdate(moduleIndex, trainingUnitIndex, 'content', e.target.value)}
                                className="min-h-[200px] resize-y bg-background font-mono text-sm"
                            />
                            <p className="mt-2 text-xs text-muted-foreground">
                                {trainingUnit.content.length} characters • Supports Markdown formatting
                            </p>
                        </div>
                    </div>
                );
            case 'practice':
                return (
                    <div className="space-y-4">
                        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Zap className="h-4 w-4 text-yellow-500" />
                                <Label className="text-sm font-medium">Practice Instructions</Label>
                            </div>
                            <Textarea
                                placeholder="Describe the practical exercise or quiz...&#10;&#10;What should operators do?&#10;What skills will they practice?&#10;&#10;Full quiz questions can be added after creating the path."
                                value={trainingUnit.content}
                                onChange={(e) => onUpdate(moduleIndex, trainingUnitIndex, 'content', e.target.value)}
                                className="min-h-[150px] resize-y bg-background"
                            />
                            <p className="mt-2 text-xs text-muted-foreground">
                                Add detailed quiz questions and answers in the trainingUnit editor after creation.
                            </p>
                        </div>
                    </div>
                );
            case 'vm-lab':
                return (
                    <div className="space-y-4">
                        <div className="rounded-lg border border-violet-500/30 bg-violet-500/5 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Terminal className="h-4 w-4 text-violet-500" />
                                <Label className="text-sm font-medium">VM Lab Configuration</Label>
                            </div>
                            <div className="rounded-lg border border-dashed border-violet-500/30 bg-violet-500/5 p-4 text-center">
                                <Terminal className="mx-auto h-8 w-8 text-violet-400 mb-2" />
                                <p className="text-sm text-muted-foreground">
                                    VM templates are not available. Configure VM settings after trainingPath creation.
                                </p>
                            </div>
                            <div className="mt-3">
                                <Label className="text-sm font-medium">Lab Instructions</Label>
                                <Textarea
                                    placeholder="Describe what students should do in this VM lab...&#10;&#10;- What software is needed?&#10;- What configuration is required?&#10;- What should students accomplish?"
                                    value={trainingUnit.teacherNotes}
                                    onChange={(e) => onUpdate(moduleIndex, trainingUnitIndex, 'teacherNotes', e.target.value)}
                                    className="mt-2 min-h-[100px] resize-y bg-background"
                                />
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };
    // Resources section (common for all types)
    const renderResourcesSection = () => (
        <div className="space-y-3 pt-3 border-t">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Additional Resources</Label>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addResource}
                    className="h-7 text-xs"
                >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Link
                </Button>
            </div>
            {trainingUnit.resources.length > 0 && (
                <div className="space-y-2">
                    {trainingUnit.resources.map((resource, ri) => (
                        <div key={resource.id} className="flex items-center gap-2">
                            <Input
                                placeholder="Title (optional)"
                                value={resource.title}
                                onChange={(e) => updateResource(ri, 'title', e.target.value)}
                                className="h-8 w-32 text-xs"
                            />
                            <Input
                                placeholder="https://..."
                                value={resource.url}
                                onChange={(e) => updateResource(ri, 'url', e.target.value)}
                                className="h-8 flex-1 text-xs"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeResource(ri)}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
    return (
        <div ref={setNodeRef} style={style}>
            <Collapsible open={expanded} onOpenChange={onToggleExpand}>
                <div
                    className={`group rounded-lg border bg-background transition-all ${
                        isDragging ? 'border-primary shadow-lg' : 'border-border hover:bg-muted/30'
                    } ${expanded ? 'border-primary/50' : ''}`}
                >
                    {/* TrainingUnit Header - Always visible */}
                    <div className="flex items-center gap-3 p-3">
                        <button
                            {...attributes}
                            {...listeners}
                            className="cursor-grab touch-none"
                        >
                            <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/50 hover:text-muted-foreground" />
                        </button>
                        <div
                            className={`h-8 w-8 rounded-lg ${trainingUnitType?.bg || 'bg-muted'} flex shrink-0 items-center justify-center`}
                        >
                            <TrainingUnitIcon
                                className={`h-4 w-4 ${trainingUnitType?.color || 'text-muted-foreground'}`}
                            />
                        </div>
                        <Input
                            placeholder="TrainingUnit title"
                            value={trainingUnit.title}
                            onChange={(e) => onUpdate(moduleIndex, trainingUnitIndex, 'title', e.target.value)}
                            className="flex-1 border-0 bg-transparent px-0 focus-visible:ring-0"
                        />
                        <Select
                            value={trainingUnit.type}
                            onValueChange={(v) => onUpdate(moduleIndex, trainingUnitIndex, 'type', v)}
                        >
                            <SelectTrigger className="h-8 w-28 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {trainingUnitTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        <span className="flex items-center gap-2">
                                            <type.icon className={`h-3.5 w-3.5 ${type.color}`} />
                                            {type.label}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input
                            placeholder="10 min"
                            value={trainingUnit.duration}
                            onChange={(e) => onUpdate(moduleIndex, trainingUnitIndex, 'duration', e.target.value)}
                            className="h-8 w-20 text-center text-xs"
                        />
                        <div className="flex shrink-0 items-center gap-1.5 rounded-md bg-muted/50 px-2 py-1">
                            <Terminal
                                className={`h-3.5 w-3.5 ${trainingUnit.vmEnabled ? 'text-violet-500' : 'text-muted-foreground/50'}`}
                            />
                            <Switch
                                checked={trainingUnit.vmEnabled}
                                onCheckedChange={(c) => onUpdate(moduleIndex, trainingUnitIndex, 'vmEnabled', c)}
                                className="scale-75"
                            />
                        </div>
                        <CollapsibleTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                            >
                                {expanded ? (
                                    <ChevronUp className="h-4 w-4" />
                                ) : (
                                    <ChevronDown className="h-4 w-4" />
                                )}
                            </Button>
                        </CollapsibleTrigger>
                        {canRemove && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 shrink-0 p-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                                onClick={() => onRemove(moduleIndex, trainingUnitIndex)}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        )}
                        {/* Content indicator badge */}
                        {hasContent() && (
                            <Badge variant="secondary" className="h-5 text-[10px] bg-green-500/10 text-green-600">
                                <Check className="h-3 w-3 mr-0.5" />
                                Content
                            </Badge>
                        )}
                    </div>
                    {/* Expandable Content Editor */}
                    <CollapsibleContent>
                        <div className="border-t bg-muted/20 p-4 space-y-4">
                            {renderContentEditor()}
                            {renderResourcesSection()}
                        </div>
                    </CollapsibleContent>
                </div>
            </Collapsible>
        </div>
    );
}
function CreateTrainingPathContent({ categories }: { categories: string[] }) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [level, setLevel] = useState('');
    const [price, setPrice] = useState('0');
    const [currency, setCurrency] = useState('USD');
    const [isFree, setIsFree] = useState(true);
    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [videoType, setVideoType] = useState<'upload' | 'youtube' | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [duration, setDuration] = useState('');
    const [objectives, setObjectives] = useState('');
    const [requirements, setRequirements] = useState('');
    const [modules, setModules] = useState<ModuleForm[]>([
        {
            id: '1',
            title: '',
            trainingUnits: [
                {
                    id: '1',
                    title: '',
                    type: 'video',
                    duration: '',
                    vmEnabled: false,
                    content: '',
                    videoUrl: '',
                    teacherNotes: '',
                    resources: [],
                },
            ],
        },
    ]);
    // Expanded trainingUnit tracking
    const [expandedTrainingUnits, setExpandedTrainingUnits] = useState<Set<string>>(new Set());
    // DnD sensors
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
    // Handle drag end for trainingUnit reordering
    const handleTrainingUnitDragEnd = useCallback(
        (event: DragEndEvent, moduleIndex: number) => {
            const { active, over } = event;
            if (!over || active.id === over.id) return;
            setModules((prev) => {
                const updated = [...prev];
                const trainingUnitIds = updated[moduleIndex].trainingUnits.map((l) => l.id);
                const oldIndex = trainingUnitIds.indexOf(active.id as string);
                const newIndex = trainingUnitIds.indexOf(over.id as string);
                if (oldIndex !== -1 && newIndex !== -1) {
                    updated[moduleIndex].trainingUnits = arrayMove(
                        updated[moduleIndex].trainingUnits,
                        oldIndex,
                        newIndex,
                    );
                }
                return updated;
            });
        },
        [],
    );
    // Toggle trainingUnit expansion
    const toggleTrainingUnitExpanded = useCallback((trainingUnitId: string) => {
        setExpandedTrainingUnits((prev) => {
            const next = new Set(prev);
            if (next.has(trainingUnitId)) {
                next.delete(trainingUnitId);
            } else {
                next.add(trainingUnitId);
            }
            return next;
        });
    }, []);
    // Thumbnail handling
    const handleThumbnailUpload = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setThumbnail(reader.result as string);
                };
                reader.readAsDataURL(file);
            }
        },
        [],
    );
    const removeThumbnail = useCallback(() => {
        setThumbnail(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);
    // Module/TrainingUnit management
    const addModule = () => {
        setModules([
            ...modules,
            {
                id: Date.now().toString(),
                title: '',
                trainingUnits: [
                    {
                        id: Date.now().toString() + 'l',
                        title: '',
                        type: 'video',
                        duration: '',
                        vmEnabled: false,
                        content: '',
                        videoUrl: '',
                        teacherNotes: '',
                        resources: [],
                    },
                ],
            },
        ]);
    };
    const addTrainingUnit = (moduleIndex: number) => {
        const updated = [...modules];
        updated[moduleIndex].trainingUnits.push({
            id: Date.now().toString(),
            title: '',
            type: 'video',
            duration: '',
            vmEnabled: false,
            content: '',
            videoUrl: '',
            teacherNotes: '',
            resources: [],
        });
        setModules(updated);
    };
    const removeModule = (index: number) => {
        setModules(modules.filter((_, i) => i !== index));
    };
    const removeTrainingUnit = (moduleIndex: number, trainingUnitIndex: number) => {
        const updated = [...modules];
        updated[moduleIndex].trainingUnits = updated[moduleIndex].trainingUnits.filter(
            (_, i) => i !== trainingUnitIndex,
        );
        setModules(updated);
    };
    const updateModule = (
        index: number,
        field: keyof ModuleForm,
        value: string,
    ) => {
        const updated = [...modules];
        updated[index] = { ...updated[index], [field]: value };
        setModules(updated);
    };
    const updateTrainingUnit = (
        moduleIndex: number,
        trainingUnitIndex: number,
        field: keyof TrainingUnitForm,
        value: unknown,
    ) => {
        const updated = [...modules];
        const trainingUnit = updated[moduleIndex].trainingUnits[trainingUnitIndex];
        updated[moduleIndex].trainingUnits[trainingUnitIndex] = {
            ...trainingUnit,
            [field]: value as never,
        };
        setModules(updated);
    };
    // Step validation
    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return (
                    title.trim().length >= 3 && description.trim().length >= 20
                );
            case 2:
                return category && level;
            case 3:
                return (
                    modules.length > 0 &&
                    modules[0].title.trim() !== '' &&
                    modules[0].trainingUnits[0].title.trim() !== ''
                );
            default:
                return true;
        }
    };
    // Calculate stats
    const totalTrainingUnits = modules.reduce((acc, m) => acc + m.trainingUnits.length, 0);
    const vmTrainingUnits = modules.reduce(
        (acc, m) =>
            acc +
            m.trainingUnits.filter((l) => l.vmEnabled || l.type === 'vm-lab').length,
        0,
    );
    const completionPercent = Math.round(
        ((currentStep - 1) / (steps.length - 1)) * 100,
    );
    const [saving, setSaving] = useState(false);
    const handleSave = () => {
        setSaving(true);
        // Prepare data for API - maps trainingUnit types correctly with content
        const trainingPathData = {
            title: title || 'Untitled Path',
            description: description || 'No description',
            category: category || 'Smart Manufacturing',
            level: level || 'Beginner', // Must match TrainingPathLevel enum: Beginner, Intermediate, Advanced
            price: isFree ? 0 : Number(price) || 0,
            currency: currency || 'USD',
            is_free: isFree,
            duration: duration || '0 hours',
            has_virtual_machine: modules.some((m) =>
                m.trainingUnits.some((l) => l.vmEnabled || l.type === 'vm-lab'),
            ),
            thumbnail: thumbnail || null,
            video_type: videoType || null,
            video_url: videoUrl || null,
            objectives: objectives || null,
            requirements: requirements || null,
            modules: modules.map((m, mIndex) => ({
                title: m.title || 'Untitled Module',
                sort_order: mIndex,
                trainingUnits: m.trainingUnits.map((l, lIndex) => ({
                    title: l.title || 'Untitled TrainingUnit',
                    // Send exactly what the backend TrainingUnitType enum expects
                    type: l.type, // 'video', 'reading', 'practice', 'vm-lab'
                    duration_minutes: parseInt(l.duration) || 10,
                    sort_order: lIndex,
                    is_preview: lIndex === 0 && mIndex === 0, // First trainingUnit is preview
                    // Content fields
                    content: l.content || null,
                    video_url: l.videoUrl || null,
                    teacher_notes: l.teacherNotes || null,
                    resources: l.resources.filter(r => r.url.trim() !== '').map(r => r.url) || null,
                    vm_enabled: l.vmEnabled || l.type === 'vm-lab',
                })),
            })),
        };
        router.post('/teaching', trainingPathData, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('🎉 TrainingPath created successfully!', {
                    description:
                        'Your trainingPath has been created with the content you added.',
                });
            },
            onError: (errors) => {
                console.error('TrainingPath creation errors:', errors);
                const errorMessages = Object.entries(errors)
                    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                    .join('\n');
                toast.error('Failed to create path', {
                    description: errorMessages || 'Unknown error',
                    duration: 10000,
                });
            },
            onFinish: () => setSaving(false),
        });
    };
    // Animation variants
    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 50 : -50,
            opacity: 0,
        }),
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Path" />
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
                <div className="container max-w-5xl py-8">
                    {/* Header with back button */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 flex items-center gap-3"
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="hover:bg-muted/50"
                        >
                            <Link href="/teaching">
                                <ArrowLeft className="mr-1 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                    </motion.div>
                    {/* Progress header */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <Card className="border-0 bg-gradient-to-r from-primary/5 via-background to-violet-500/5 shadow-card">
                            <CardContent className="py-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <div>
                                        <h1 className="flex items-center gap-2 font-heading text-2xl font-bold text-foreground">
                                            <Sparkles className="h-6 w-6 text-primary" />
                                            Create New Path
                                        </h1>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Step {currentStep} of {steps.length}{' '}
                                            —{' '}
                                            {steps[currentStep - 1].description}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-primary">
                                            {completionPercent}%
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Complete
                                        </p>
                                    </div>
                                </div>
                                {/* Step indicators */}
                                <div className="mb-3 flex items-center justify-between">
                                    {steps.map((step, index) => (
                                        <div
                                            key={step.id}
                                            className="flex flex-1 items-center"
                                        >
                                            <button
                                                onClick={() =>
                                                    step.id <= currentStep &&
                                                    setCurrentStep(step.id)
                                                }
                                                disabled={step.id > currentStep}
                                                className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-all ${
                                                    step.id === currentStep
                                                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                                                        : step.id < currentStep
                                                          ? 'cursor-pointer bg-primary/10 text-primary hover:bg-primary/20'
                                                          : 'cursor-not-allowed bg-muted/50 text-muted-foreground'
                                                } `}
                                            >
                                                <div
                                                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                                        step.id === currentStep
                                                            ? 'bg-white/20'
                                                            : step.id <
                                                                currentStep
                                                              ? 'bg-primary/20'
                                                              : 'bg-muted'
                                                    } `}
                                                >
                                                    {step.id < currentStep ? (
                                                        <Check className="h-3.5 w-3.5" />
                                                    ) : (
                                                        <step.icon className="h-3.5 w-3.5" />
                                                    )}
                                                </div>
                                                <span className="hidden text-sm font-medium sm:inline">
                                                    {step.title}
                                                </span>
                                            </button>
                                            {index < steps.length - 1 && (
                                                <div
                                                    className={`mx-2 h-0.5 flex-1 ${step.id < currentStep ? 'bg-primary' : 'bg-muted'} `}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <Progress
                                    value={completionPercent}
                                    className="h-1"
                                />
                            </CardContent>
                        </Card>
                    </motion.div>
                    {/* Step content */}
                    <AnimatePresence mode="wait" custom={currentStep}>
                        <motion.div
                            key={currentStep}
                            custom={currentStep}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                            {/* Step 1: Basic Info */}
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <Card className="shadow-card">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 font-heading text-lg">
                                                <BookOpen className="h-5 w-5 text-primary" />
                                                Path Basics
                                            </CardTitle>
                                            <CardDescription>
                                                Start with a compelling title
                                                and description
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            {/* Thumbnail upload */}
                                            <div>
                                                <Label className="text-sm font-medium">
                                                    Path Thumbnail
                                                </Label>
                                                <div className="mt-2">
                                                    {thumbnail ? (
                                                        <div className="group relative overflow-hidden rounded-xl border-2 border-dashed border-primary/30 bg-muted/30">
                                                            <img
                                                                src={thumbnail}
                                                                alt="Path thumbnail"
                                                                className="h-48 w-full object-cover"
                                                            />
                                                            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                                                <Button
                                                                    size="sm"
                                                                    variant="secondary"
                                                                    onClick={() =>
                                                                        fileInputRef.current?.click()
                                                                    }
                                                                >
                                                                    <Upload className="mr-1 h-4 w-4" />
                                                                    Replace
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={
                                                                        removeThumbnail
                                                                    }
                                                                >
                                                                    <Trash2 className="mr-1 h-4 w-4" />
                                                                    Remove
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() =>
                                                                fileInputRef.current?.click()
                                                            }
                                                            className="group flex h-48 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/30 transition-all hover:border-primary/50 hover:bg-muted/50"
                                                        >
                                                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                                                                <Image className="h-7 w-7 text-primary" />
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="text-sm font-medium text-foreground">
                                                                    Upload
                                                                    thumbnail
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Recommended:
                                                                    1280×720
                                                                    (16:9)
                                                                </p>
                                                            </div>
                                                        </button>
                                                    )}
                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={
                                                            handleThumbnailUpload
                                                        }
                                                        className="hidden"
                                                    />
                                                </div>
                                            </div>
                                            <Separator />
                                            {/* Path Video */}
                                            <div>
                                                <TrainingPathVideoInput
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
                                                    Path Title{' '}
                                                    <span className="text-destructive">
                                                        *
                                                    </span>
                                                </Label>
                                                <Input
                                                    id="title"
                                                    placeholder="e.g. Industrial IoT with Raspberry Pi & Python"
                                                    value={title}
                                                    onChange={(e) =>
                                                        setTitle(e.target.value)
                                                    }
                                                    className="mt-2 h-12 text-lg"
                                                />
                                                <p className="mt-1.5 text-xs text-muted-foreground">
                                                    {title.length}/80 characters
                                                    • Be specific and
                                                    keyword-rich
                                                </p>
                                            </div>
                                            {/* Description */}
                                            <div>
                                                <Label
                                                    htmlFor="description"
                                                    className="text-sm font-medium"
                                                >
                                                    Path Description{' '}
                                                    <span className="text-destructive">
                                                        *
                                                    </span>
                                                </Label>
                                                <Textarea
                                                    id="description"
                                                    placeholder="What will operators learn? What makes this path unique?"
                                                    value={description}
                                                    onChange={(e) =>
                                                        setDescription(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="mt-2 min-h-[120px] resize-none"
                                                    rows={5}
                                                />
                                                <p className="mt-1.5 text-xs text-muted-foreground">
                                                    {description.length}/500
                                                    characters • Minimum 20
                                                    characters required
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                            {/* Step 2: Path Details */}
                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <Card className="shadow-card">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 font-heading text-lg">
                                                <Target className="h-5 w-5 text-primary" />
                                                Path Details
                                            </CardTitle>
                                            <CardDescription>
                                                Help operators find your path
                                                with the right settings
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="grid gap-6 sm:grid-cols-2">
                                                {/* Category */}
                                                <div>
                                                    <Label className="text-sm font-medium">
                                                        Category{' '}
                                                        <span className="text-destructive">
                                                            *
                                                        </span>
                                                    </Label>
                                                    <Select
                                                        value={category}
                                                        onValueChange={
                                                            setCategory
                                                        }
                                                    >
                                                        <SelectTrigger className="mt-2 h-12">
                                                            <SelectValue placeholder="Select a category" />
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
                                                {/* Level */}
                                                <div>
                                                    <Label className="text-sm font-medium">
                                                        Difficulty Level{' '}
                                                        <span className="text-destructive">
                                                            *
                                                        </span>
                                                    </Label>
                                                    <Select
                                                        value={level}
                                                        onValueChange={setLevel}
                                                    >
                                                        <SelectTrigger className="mt-2 h-12">
                                                            <SelectValue placeholder="Select level" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Beginner">
                                                                <span className="flex items-center gap-2">
                                                                    <span className="h-2 w-2 rounded-full bg-green-500" />
                                                                    Beginner
                                                                </span>
                                                            </SelectItem>
                                                            <SelectItem value="Intermediate">
                                                                <span className="flex items-center gap-2">
                                                                    <span className="h-2 w-2 rounded-full bg-yellow-500" />
                                                                    Intermediate
                                                                </span>
                                                            </SelectItem>
                                                            <SelectItem value="Advanced">
                                                                <span className="flex items-center gap-2">
                                                                    <span className="h-2 w-2 rounded-full bg-red-500" />
                                                                    Advanced
                                                                </span>
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                {/* Duration */}
                                                <div>
                                                    <Label className="text-sm font-medium">
                                                        Estimated Duration
                                                    </Label>
                                                    <div className="relative mt-2">
                                                        <Clock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                        <Input
                                                            placeholder="e.g. 8 hours"
                                                            value={duration}
                                                            onChange={(e) =>
                                                                setDuration(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="h-12 pl-10"
                                                        />
                                                    </div>
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
                                                                setPrice(e.target.value);
                                                                if (Number(e.target.value) > 0) {
                                                                    setIsFree(false);
                                                                }
                                                            }}
                                                            disabled={isFree}
                                                            className="h-12 flex-1"
                                                        />
                                                        <Input
                                                            value={currency}
                                                            onChange={(e) => setCurrency(e.target.value.toUpperCase().slice(0, 3))}
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
                                                            onCheckedChange={(checked) => {
                                                                setIsFree(checked);
                                                                if (checked) {
                                                                    setPrice('0');
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <Separator />
                                            {/* Learning objectives */}
                                            <div>
                                                <Label className="text-sm font-medium">
                                                    Training Objectives
                                                </Label>
                                                <p className="mt-0.5 mb-2 text-xs text-muted-foreground">
                                                    What will operators be able
                                                    to do after completing this
                                                    path?
                                                </p>
                                                <Textarea
                                                    placeholder="• Build industrial IoT sensors&#10;• Connect devices to cloud platforms&#10;• Analyze real-time sensor data"
                                                    value={objectives}
                                                    onChange={(e) =>
                                                        setObjectives(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="min-h-[100px] resize-none"
                                                    rows={4}
                                                />
                                            </div>
                                            {/* Prerequisites */}
                                            <div>
                                                <Label className="text-sm font-medium">
                                                    Prerequisites
                                                </Label>
                                                <p className="mt-0.5 mb-2 text-xs text-muted-foreground">
                                                    What should students already
                                                    know?
                                                </p>
                                                <Textarea
                                                    placeholder="• Basic Python programming&#10;• Understanding of electronics&#10;• Computer with admin access"
                                                    value={requirements}
                                                    onChange={(e) =>
                                                        setRequirements(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="min-h-[100px] resize-none"
                                                    rows={4}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                            {/* Step 3: Curriculum */}
                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    {/* Info banner about workflow */}
                                    <Alert className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30">
                                        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        <AlertDescription className="text-blue-800 dark:text-blue-200">
                                            <strong>New!</strong> You can now add content directly while creating your path.
                                            Expand each module to add video URLs, articles, or select VM templates.
                                            You can also add more content in the edit page later.
                                        </AlertDescription>
                                    </Alert>
                                    {/* Stats bar */}
                                    <Card className="border-primary/20 bg-primary/5 shadow-sm">
                                        <CardContent className="py-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                                            <Layers className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="text-lg font-bold text-foreground">
                                                                {modules.length}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Modules
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                                                            <Video className="h-4 w-4 text-blue-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-lg font-bold text-foreground">
                                                                {totalTrainingUnits}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Modules
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                                                            <Terminal className="h-4 w-4 text-violet-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-lg font-bold text-foreground">
                                                                {vmTrainingUnits}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                VM Labs
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className="bg-background text-xs"
                                                >
                                                    <GripVertical className="mr-1 h-3 w-3" />
                                                    Drag to reorder
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    {/* Modules */}
                                    {modules.map((module, mi) => (
                                        <motion.div
                                            key={module.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: mi * 0.05 }}
                                        >
                                            <Card className="overflow-hidden shadow-card">
                                                <CardHeader className="border-b bg-muted/30 pb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                                            <span className="font-bold text-primary">
                                                                {mi + 1}
                                                            </span>
                                                        </div>
                                                        <Input
                                                            placeholder="Module title (e.g. Getting Started)"
                                                            value={module.title}
                                                            onChange={(e) =>
                                                                updateModule(
                                                                    mi,
                                                                    'title',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="h-auto flex-1 border-0 bg-transparent px-0 text-base font-medium focus-visible:ring-0"
                                                        />
                                                        {modules.length > 1 && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                                onClick={() =>
                                                                    removeModule(
                                                                        mi,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="space-y-3 pt-4">
                                                    <DndContext
                                                        sensors={sensors}
                                                        collisionDetection={closestCenter}
                                                        onDragEnd={(event) =>
                                                            handleTrainingUnitDragEnd(event, mi)
                                                        }
                                                    >
                                                        <SortableContext
                                                            items={module.trainingUnits.map((l) => l.id)}
                                                            strategy={verticalListSortingStrategy}
                                                        >
                                                            {module.trainingUnits.map((trainingUnit, li) => (
                                                                <SortableTrainingUnit
                                                                    key={trainingUnit.id}
                                                                    trainingUnit={trainingUnit}
                                                                    trainingUnitIndex={li}
                                                                    moduleIndex={mi}
                                                                    onUpdate={updateTrainingUnit}
                                                                    onRemove={removeTrainingUnit}
                                                                    canRemove={module.trainingUnits.length > 1}
                                                                    expanded={expandedTrainingUnits.has(trainingUnit.id)}
                                                                    onToggleExpand={() =>
                                                                        toggleTrainingUnitExpanded(trainingUnit.id)
                                                                    }
                                                                />
                                                            ))}
                                                        </SortableContext>
                                                    </DndContext>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            addTrainingUnit(mi)
                                                        }
                                                        className="mt-2 w-full justify-center border border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5"
                                                    >
                                                        <Plus className="mr-1 h-4 w-4" />{' '}
                                                            Add Module
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                    <Button
                                        variant="outline"
                                        onClick={addModule}
                                        className="h-14 w-full border-2 border-dashed hover:border-primary/50 hover:bg-primary/5"
                                    >
                                        <Plus className="mr-2 h-5 w-5" /> Add
                                        New Module
                                    </Button>
                                </div>
                            )}
                            {/* Step 4: Review */}
                            {currentStep === 4 && (
                                <div className="space-y-6">
                                    <Card className="overflow-hidden shadow-card">
                                        <div className="border-b bg-gradient-to-r from-primary/10 via-background to-violet-500/10 p-6">
                                            <div className="flex items-start gap-6">
                                                {/* Thumbnail preview */}
                                                <div className="h-28 w-48 shrink-0 overflow-hidden rounded-lg bg-muted">
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
                                                <div className="min-w-0 flex-1">
                                                    <h2 className="truncate font-heading text-xl font-bold text-foreground">
                                                        {title ||
                                                            'Untitled Path'}
                                                    </h2>
                                                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                                        {description ||
                                                            'No description provided'}
                                                    </p>
                                                    <div className="mt-3 flex items-center gap-3">
                                                        {category && (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs"
                                                            >
                                                                {category}
                                                            </Badge>
                                                        )}
                                                        {level && (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs"
                                                            >
                                                                {level}
                                                            </Badge>
                                                        )}
                                                        {duration && (
                                                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                <Clock className="h-3 w-3" />{' '}
                                                                {duration}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <CardContent className="py-6">
                                            {/* Stats summary */}
                                            <div className="mb-6 grid grid-cols-3 gap-4">
                                                <div className="rounded-lg bg-muted/50 p-4 text-center">
                                                    <p className="text-2xl font-bold text-foreground">
                                                        {modules.length}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Modules
                                                    </p>
                                                </div>
                                                <div className="rounded-lg bg-muted/50 p-4 text-center">
                                                    <p className="text-2xl font-bold text-foreground">
                                                        {totalTrainingUnits}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Modules
                                                    </p>
                                                </div>
                                                <div className="rounded-lg bg-muted/50 p-4 text-center">
                                                    <p className="text-2xl font-bold text-foreground">
                                                        {vmTrainingUnits}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        VM Labs
                                                    </p>
                                                </div>
                                            </div>
                                            <Separator className="my-6" />
                                            {/* Curriculum preview */}
                                            <h3 className="mb-4 font-heading font-semibold text-foreground">
                                                Curriculum Overview
                                            </h3>
                                            <div className="space-y-3">
                                                {modules.map((module, mi) => (
                                                    <div
                                                        key={module.id}
                                                        className="rounded-lg border border-border p-4"
                                                    >
                                                        <div className="mb-2 flex items-center gap-2">
                                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                                                {mi + 1}
                                                            </span>
                                                            <span className="font-medium text-foreground">
                                                                {module.title ||
                                                                    'Untitled Module'}
                                                            </span>
                                                            <Badge
                                                                variant="outline"
                                                                className="ml-auto text-xs"
                                                            >
                                                                {
                                                                    module
                                                                        .trainingUnits
                                                                        .length
                                                                }{' '}
                                                                trainingUnits
                                                            </Badge>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 pl-8">
                                                            {module.trainingUnits.map(
                                                                (trainingUnit) => {
                                                                    const type =
                                                                        trainingUnitTypes.find(
                                                                            (
                                                                                t,
                                                                            ) =>
                                                                                t.value ===
                                                                                trainingUnit.type,
                                                                        );
                                                                    return (
                                                                        <span
                                                                            key={
                                                                                trainingUnit.id
                                                                            }
                                                                            className={`rounded-md px-2 py-1 text-xs ${type?.bg || 'bg-muted'} ${type?.color || 'text-muted-foreground'}`}
                                                                        >
                                                                            {trainingUnit.title ||
                                                                                'Untitled'}
                                                                        </span>
                                                                    );
                                                                },
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <Separator className="my-6" />
                                            {/* Ready message */}
                                            <div className="rounded-xl border border-green-500/20 bg-gradient-to-r from-green-500/10 via-background to-green-500/10 px-4 py-6 text-center">
                                                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                                                    <Check className="h-6 w-6 text-green-500" />
                                                </div>
                                                <h3 className="font-heading font-semibold text-foreground">
                                                    Ready to Create!
                                                </h3>
                                                <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                                                    Your trainingPath will be saved as
                                                    a draft. You can add content
                                                    to each trainingUnit and submit
                                                    for review when ready.
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                    {/* Navigation buttons */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-8 flex items-center justify-between border-t border-border pt-6"
                    >
                        <Button
                            variant="outline"
                            onClick={() =>
                                setCurrentStep((s) => Math.max(1, s - 1))
                            }
                            disabled={currentStep === 1}
                            className="gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Previous
                        </Button>
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" asChild>
                                <Link href="/teaching">Cancel</Link>
                            </Button>
                            {currentStep < steps.length ? (
                                <Button
                                    onClick={() =>
                                        setCurrentStep((s) =>
                                            Math.min(steps.length, s + 1),
                                        )
                                    }
                                    disabled={!canProceed()}
                                    className="min-w-[140px] gap-2"
                                >
                                    Continue
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="min-w-[160px] gap-2 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90"
                                >
                                    {saving ? (
                                        <>
                                            <span className="animate-spin">
                                                ⏳
                                            </span>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Create Path
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </AppLayout>
    );
}
export default function CreateTrainingPathPage({
    categories,
}: CreateTrainingPathPageProps) {
    return (
        <LearningAppProvider>
            <CreateTrainingPathContent categories={categories} />
        </LearningAppProvider>
    );
}

