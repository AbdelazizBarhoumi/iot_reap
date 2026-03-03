/**
 * Edit Lesson Page
 * Teacher view for editing individual lesson content.
 * Uses unified AppLayout.
 */

import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Save,
    Terminal,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { useAppState, LearningAppProvider } from '@/lib/learning/appState';
import type { BreadcrumbItem } from '@/types';

interface EditLessonContentProps {
    courseId: string;
    moduleId: string;
    lessonId: string;
}

function EditLessonContent({ courseId, moduleId, lessonId }: EditLessonContentProps) {
    const { courses, updateLesson: updateLessonState } = useAppState();
    const course = courses.find((c) => c.id === courseId);
    const module = course?.modules.find((m) => m.id === moduleId);
    const lesson = module?.lessons.find((l) => l.id === lessonId);

    const [content, setContent] = useState(lesson?.content || '');
    const [objectives, setObjectives] = useState((lesson?.objectives || []).join('\n'));
    const [resources, setResources] = useState((lesson?.resources || []).join('\n'));
    const [vmEnabled, setVmEnabled] = useState(lesson?.vmEnabled || false);

    const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
        { title: 'Teaching', href: '/teaching' },
        { title: course?.title ?? 'Course', href: `/teaching/${courseId}/edit` },
        { title: lesson?.title ?? 'Lesson', href: `/teaching/${courseId}/module/${moduleId}/lesson/${lessonId}` },
    ], [course, courseId, moduleId, lessonId, lesson]);

    if (!course || !module || !lesson) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Lesson Not Found" />
                <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 p-6">
                    <p className="text-muted-foreground">Lesson not found.</p>
                    <Button variant="outline" asChild>
                        <Link href="/teaching">Back to Dashboard</Link>
                    </Button>
                </div>
            </AppLayout>
        );
    }

    const handleSave = () => {
        updateLessonState(courseId, moduleId, lessonId, {
            content,
            objectives: objectives.split('\n').filter(Boolean),
            resources: resources.split('\n').filter(Boolean),
            vmEnabled,
        });
        toast.success('Lesson saved!', {
            description: 'Your changes have been saved.',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${lesson.title}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <motion.div
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/teaching/${courseId}/edit`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-heading font-semibold text-foreground">Edit Lesson</h1>
                        <p className="text-sm text-muted-foreground">
                            {course.title} / {module.title}
                        </p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                        {lesson.type.replace('-', ' ')}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{lesson.duration}</span>
                </motion.div>

                <div className="max-w-4xl space-y-6">
                    {/* Lesson Info */}
                    <Card className="shadow-card">
                        <CardHeader>
                            <CardTitle className="text-lg font-heading">{lesson.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Lesson Content</Label>
                                <Textarea
                                    placeholder="Write the main content for this lesson..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="mt-1"
                                    rows={10}
                                />
                            </div>
                            <div>
                                <Label>Learning Objectives (one per line)</Label>
                                <Textarea
                                    placeholder="What will students learn?"
                                    value={objectives}
                                    onChange={(e) => setObjectives(e.target.value)}
                                    className="mt-1"
                                    rows={4}
                                />
                            </div>
                            <div>
                                <Label>Resources (one URL per line)</Label>
                                <Textarea
                                    placeholder="https://example.com/resource"
                                    value={resources}
                                    onChange={(e) => setResources(e.target.value)}
                                    className="mt-1"
                                    rows={3}
                                />
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                                <Switch
                                    checked={vmEnabled}
                                    onCheckedChange={setVmEnabled}
                                />
                                <div className="flex items-center gap-2">
                                    <Terminal
                                        className={`h-4 w-4 ${vmEnabled ? 'text-info' : 'text-muted-foreground'}`}
                                    />
                                    <Label className="cursor-pointer">
                                        Enable VM Lab for this lesson
                                    </Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" asChild>
                            <Link href={`/teaching/${courseId}/edit`}>Cancel</Link>
                        </Button>
                        <Button
                            className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                            onClick={handleSave}
                        >
                            <Save className="mr-2 h-4 w-4" /> Save Lesson
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

interface EditLessonPageProps {
    courseId: string;
    moduleId: string;
    lessonId: string;
}

export default function EditLessonPage({ courseId, moduleId, lessonId }: EditLessonPageProps) {
    return (
        <LearningAppProvider>
            <EditLessonContent courseId={courseId} moduleId={moduleId} lessonId={lessonId} />
        </LearningAppProvider>
    );
}
