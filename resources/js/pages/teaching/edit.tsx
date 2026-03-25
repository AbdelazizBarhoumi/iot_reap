/**
 * Edit Course Page
 * Teacher view for editing course details and lessons.
 * Uses unified AppLayout.
 */

import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Edit,
    GripVertical,
    Save,
    Star,
    Terminal,
    Users,
} from 'lucide-react';
import { useMemo } from 'react';
import { toast } from 'sonner';
import { CourseStatusBanner } from '@/components/courses/CourseStatusBanner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { useAppState, LearningAppProvider, type CourseStatus } from '@/lib/learning/appState';
import type { BreadcrumbItem } from '@/types';

const statusLabel: Record<CourseStatus, string> = {
    draft: 'Draft',
    pending_review: 'Pending Review',
    approved: 'Approved',
    rejected: 'Rejected',
};

interface EditCourseContentProps {
    id: string;
}

function EditCourseContent({ id }: EditCourseContentProps) {
    const { courses, updateCourse } = useAppState();
    const course = courses.find((c) => c.id === id);

    const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
        { title: 'Teaching', href: '/teaching' },
        { title: course?.title ?? 'Edit Course', href: `/teaching/${id}/edit` },
    ], [course, id]);

    if (!course) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Course Not Found" />
                <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 p-6">
                    <p className="text-muted-foreground">Course not found.</p>
                    <Button variant="outline" asChild>
                        <Link href="/teaching">Back to Dashboard</Link>
                    </Button>
                </div>
            </AppLayout>
        );
    }

    const handleSubmitForReview = () => {
        updateCourse(course.id, { status: 'pending_review' });
        toast.success('Submitted for review!', {
            description: 'An admin will review your course shortly.',
        });
    };

    const handleSave = () => {
        toast.success('Changes saved!', {
            description: 'Your course has been updated.',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${course.title}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <motion.div
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/teaching">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-heading font-semibold text-foreground">Edit Course</h1>
                        <p className="text-sm text-muted-foreground">{course.title}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="capitalize">
                            {statusLabel[course.status]}
                        </Badge>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" /> {course.students.toLocaleString()}
                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500 ml-2" />{' '}
                            {course.rating}
                        </div>
                    </div>
                </motion.div>

                {/* Status Banner */}
                <CourseStatusBanner 
                    status={course.status}
                    adminFeedback={course.adminFeedback}
                />

                <div className="max-w-4xl space-y-6">
                    {/* Course Details */}
                    <Card className="shadow-card">
                        <CardHeader>
                            <CardTitle className="text-lg font-heading">Course Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Course Title</Label>
                                <Input defaultValue={course.title} className="mt-1" />
                            </div>
                            <div>
                                <Label>Description</Label>
                                <Textarea
                                    defaultValue={course.description}
                                    className="mt-1"
                                    rows={3}
                                />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <Label>Category</Label>
                                    <Input defaultValue={course.category} className="mt-1" readOnly />
                                </div>
                                <div>
                                    <Label>Level</Label>
                                    <Input defaultValue={course.level} className="mt-1" readOnly />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Modules with lesson edit links */}
                    {course.modules.map((module, mi) => (
                        <Card key={module.id} className="shadow-card">
                            <CardHeader className="flex-row items-center justify-between">
                                <CardTitle className="text-lg font-heading">
                                    Module {mi + 1}: {module.title}
                                </CardTitle>
                                <Badge variant="outline">{module.lessons.length} lessons</Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {module.lessons.map((lesson) => (
                                        <div
                                            key={lesson.id}
                                            className="flex items-center gap-3 rounded-md border border-border p-3 bg-muted/30"
                                        >
                                            <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground">
                                                    {lesson.title}
                                                </p>
                                                {lesson.content ? (
                                                    <p className="text-xs text-green-500 mt-0.5">
                                                        ✓ Content added
                                                    </p>
                                                ) : (
                                                    <p className="text-xs text-yellow-500 mt-0.5">
                                                        ⚠ No content yet
                                                    </p>
                                                )}
                                            </div>
                                            <Badge variant="outline" className="text-xs capitalize">
                                                {lesson.type.replace('-', ' ')}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {lesson.duration}
                                            </span>
                                            {lesson.vmEnabled && (
                                                <Terminal className="h-4 w-4 text-primary" />
                                            )}
                                            <Button variant="outline" size="sm" asChild>
                                                <Link
                                                    href={`/teaching/${course.id}/module/${module.id}/lesson/${lesson.id}`}
                                                >
                                                    <Edit className="mr-1 h-3.5 w-3.5" /> Edit
                                                </Link>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" asChild>
                            <Link href="/teaching">Cancel</Link>
                        </Button>
                        {course.status !== 'approved' && (
                            <Button
                                variant="outline"
                                className="border-yellow-500/30 text-yellow-600 hover:bg-yellow-500/10"
                                onClick={handleSubmitForReview}
                            >
                                Submit for Review
                            </Button>
                        )}
                        <Button
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                            onClick={handleSave}
                        >
                            <Save className="mr-2 h-4 w-4" /> Save Changes
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

interface EditCoursePageProps {
    id: string;
}

export default function EditCoursePage({ id }: EditCoursePageProps) {
    return (
        <LearningAppProvider>
            <EditCourseContent id={id} />
        </LearningAppProvider>
    );
}
