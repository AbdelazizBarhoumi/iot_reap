/**
 * Create Course Page
 * Form for teachers to create new courses.
 * Uses unified AppLayout.
 */

import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    GripVertical,
    Plus,
    Save,
    Terminal,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { useAppState, LearningAppProvider } from '@/lib/learning/appState';
import { categories } from '@/lib/learning/mockData';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Teaching', href: '/teaching' },
    { title: 'Create Course', href: '/teaching/create' },
];

interface LessonForm {
    id: string;
    title: string;
    type: string;
    duration: string;
    vmEnabled: boolean;
}

interface ModuleForm {
    id: string;
    title: string;
    lessons: LessonForm[];
}

function CreateCourseContent() {
    const { addCourse } = useAppState();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [level, setLevel] = useState('');
    const [modules, setModules] = useState<ModuleForm[]>([
        {
            id: '1',
            title: '',
            lessons: [{ id: '1', title: '', type: 'video', duration: '', vmEnabled: false }],
        },
    ]);

    const addModule = () => {
        setModules([
            ...modules,
            {
                id: Date.now().toString(),
                title: '',
                lessons: [{ id: Date.now().toString() + 'l', title: '', type: 'video', duration: '', vmEnabled: false }],
            },
        ]);
    };

    const addLesson = (moduleIndex: number) => {
        const updated = [...modules];
        updated[moduleIndex].lessons.push({
            id: Date.now().toString(),
            title: '',
            type: 'video',
            duration: '',
            vmEnabled: false,
        });
        setModules(updated);
    };

    const removeModule = (index: number) => {
        setModules(modules.filter((_, i) => i !== index));
    };

    const removeLesson = (moduleIndex: number, lessonIndex: number) => {
        const updated = [...modules];
        updated[moduleIndex].lessons = updated[moduleIndex].lessons.filter((_, i) => i !== lessonIndex);
        setModules(updated);
    };

    const updateModule = (index: number, field: keyof ModuleForm, value: string) => {
        const updated = [...modules];
        updated[index] = { ...updated[index], [field]: value };
        setModules(updated);
    };

    const updateLesson = (moduleIndex: number, lessonIndex: number, field: keyof LessonForm, value: unknown) => {
        const updated = [...modules];
        const lesson = updated[moduleIndex].lessons[lessonIndex];
        updated[moduleIndex].lessons[lessonIndex] = { ...lesson, [field]: value as never };
        setModules(updated);
    };

    const handleSave = () => {
        const newCourse = {
            id: Date.now().toString(),
            title: title || 'Untitled Course',
            description: description || 'No description',
            instructor: 'You',
            thumbnail: '',
            category: category || 'Web Development',
            level: (level || 'Beginner') as 'Beginner' | 'Intermediate' | 'Advanced',
            duration: '0 hours',
            students: 0,
            rating: 0,
            hasVirtualMachine: modules.some((m) => m.lessons.some((l) => l.vmEnabled)),
            status: 'draft' as const,
            modules: modules.map((m) => ({
                id: m.id,
                title: m.title || 'Untitled Module',
                lessons: m.lessons.map((l) => ({
                    id: l.id,
                    title: l.title || 'Untitled Lesson',
                    type: l.type as 'video' | 'reading' | 'practice' | 'vm-lab',
                    duration: l.duration || '10 min',
                    vmEnabled: l.vmEnabled,
                })),
            })),
        };
        addCourse(newCourse);
        toast.success('Course created!', {
            description: 'Now add content to your lessons and submit for review.',
        });
        router.visit(`/teaching/${newCourse.id}/edit`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Course" />
            <div className="min-h-screen bg-background">
                <div className="container max-w-4xl py-8">
                    <div className="flex items-center gap-3 mb-8">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/teaching">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="font-heading text-2xl font-bold text-foreground">Create New Course</h1>
                            <p className="text-sm text-muted-foreground">
                                Add modules and lessons, then fill in lesson details
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Course Details */}
                        <Card className="shadow-card">
                            <CardHeader>
                                <CardTitle className="font-heading text-lg">Course Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Course Title</Label>
                                    <Input
                                        placeholder="e.g. Full-Stack Web Development"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label>Description</Label>
                                    <Textarea
                                        placeholder="What will students learn?"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="mt-1"
                                        rows={3}
                                    />
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label>Category</Label>
                                        <Select value={category} onValueChange={setCategory}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat} value={cat}>
                                                        {cat}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Level</Label>
                                        <Select value={level} onValueChange={setLevel}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Beginner">Beginner</SelectItem>
                                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                                                <SelectItem value="Advanced">Advanced</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Modules */}
                        {modules.map((module, mi) => (
                            <motion.div
                                key={module.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card className="shadow-card">
                                    <CardHeader className="flex-row items-center justify-between">
                                        <CardTitle className="font-heading text-lg">Module {mi + 1}</CardTitle>
                                        {modules.length > 1 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive"
                                                onClick={() => removeModule(mi)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <Input
                                            placeholder="Module title"
                                            value={module.title}
                                            onChange={(e) => updateModule(mi, 'title', e.target.value)}
                                        />
                                        <div className="space-y-3">
                                            {module.lessons.map((lesson, li) => (
                                                <div
                                                    key={lesson.id}
                                                    className="flex items-center gap-3 rounded-md border border-border p-3 bg-muted/30"
                                                >
                                                    <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                                                    <Input
                                                        placeholder="Lesson title"
                                                        value={lesson.title}
                                                        onChange={(e) => updateLesson(mi, li, 'title', e.target.value)}
                                                        className="flex-1"
                                                    />
                                                    <Select
                                                        value={lesson.type}
                                                        onValueChange={(v) => updateLesson(mi, li, 'type', v)}
                                                    >
                                                        <SelectTrigger className="w-32">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="video">Video</SelectItem>
                                                            <SelectItem value="reading">Reading</SelectItem>
                                                            <SelectItem value="practice">Practice</SelectItem>
                                                            <SelectItem value="vm-lab">VM Lab</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <Input
                                                        placeholder="Duration"
                                                        value={lesson.duration}
                                                        onChange={(e) => updateLesson(mi, li, 'duration', e.target.value)}
                                                        className="w-24"
                                                    />
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
                                                        <Switch
                                                            checked={lesson.vmEnabled}
                                                            onCheckedChange={(c) => updateLesson(mi, li, 'vmEnabled', c)}
                                                        />
                                                    </div>
                                                    {module.lessons.length > 1 && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-destructive shrink-0 p-2"
                                                            onClick={() => removeLesson(mi, li)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addLesson(mi)}
                                            >
                                                <Plus className="mr-1 h-4 w-4" /> Add Lesson
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}

                        <Button variant="outline" onClick={addModule}>
                            <Plus className="mr-2 h-4 w-4" /> Add Module
                        </Button>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" asChild>
                                <Link href="/teaching">Cancel</Link>
                            </Button>
                            <Button
                                className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                                onClick={handleSave}
                            >
                                <Save className="mr-2 h-4 w-4" /> Save Course
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

export default function CreateCoursePage() {
    return (
        <LearningAppProvider>
            <CreateCourseContent />
        </LearningAppProvider>
    );
}
