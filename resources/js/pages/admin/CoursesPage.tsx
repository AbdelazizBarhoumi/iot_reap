/**
 * Admin Course Approvals Page
 * Admin view for reviewing and approving/rejecting course submissions.
 * Uses unified AppLayout.
 */

import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    BookOpen,
    CheckCircle2,
    Clock,
    Eye,
    Shield,
    Star,
    Users,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { useAppState, LearningAppProvider, type CourseStatus, type ManagedCourse } from '@/lib/learning/appState';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/infrastructure' },
    { title: 'Course Approvals', href: '/admin/courses' },
];

const statusConfig: Record<CourseStatus, { label: string; color: string; icon: React.ElementType }> = {
    draft: { label: 'Draft', color: 'bg-muted text-muted-foreground', icon: Clock },
    pending_review: { label: 'Pending Review', color: 'bg-warning/10 text-warning border-warning/30', icon: Clock },
    approved: { label: 'Approved', color: 'bg-success/10 text-success border-success/30', icon: CheckCircle2 },
    rejected: { label: 'Rejected', color: 'bg-destructive/10 text-destructive border-destructive/30', icon: XCircle },
};

function AdminCoursesContent() {
    const { courses, approveCourse, rejectCourse } = useAppState();
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [feedback, setFeedback] = useState('');
    const [previewId, setPreviewId] = useState<string | null>(null);

    const pendingCourses = courses.filter((c) => c.status === 'pending_review');
    const approvedCourses = courses.filter((c) => c.status === 'approved');
    const rejectedCourses = courses.filter((c) => c.status === 'rejected');

    const handleApprove = (id: string) => {
        approveCourse(id);
    };

    const handleReject = () => {
        if (rejectingId) {
            rejectCourse(rejectingId, feedback);
            setRejectingId(null);
            setFeedback('');
        }
    };

    const previewCourse = courses.find((c) => c.id === previewId);

    const CourseRow = ({ course }: { course: ManagedCourse }) => {
        const status = statusConfig[course.status];
        const StatusIcon = status.icon;
        const totalLessons = course.modules.reduce((a, m) => a + m.lessons.length, 0);

        return (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="shadow-card hover:shadow-card-hover transition-shadow">
                    <CardContent className="py-5">
                        <div className="flex items-start gap-4">
                            <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-muted">
                                <BookOpen className="h-7 w-7 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h3 className="font-heading font-semibold text-foreground">{course.title}</h3>
                                    <Badge variant="outline" className={`text-xs ${status.color}`}>
                                        <StatusIcon className="mr-1 h-3 w-3" />
                                        {status.label}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                                    {course.description}
                                </p>
                                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                    <span>By {course.instructor}</span>
                                    <span>{course.category}</span>
                                    <span>{course.modules.length} modules</span>
                                    <span>{totalLessons} lessons</span>
                                    <span className="flex items-center gap-1">
                                        <Users className="h-3 w-3" /> {course.students.toLocaleString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Star className="h-3 w-3 fill-warning text-warning" />{' '}
                                        {course.rating}
                                    </span>
                                </div>
                                {course.adminFeedback && (
                                    <div className="mt-3 rounded-md bg-destructive/5 border border-destructive/20 p-3">
                                        <p className="text-xs font-medium text-destructive mb-1">
                                            Admin Feedback:
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {course.adminFeedback}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPreviewId(course.id)}
                                >
                                    <Eye className="mr-1 h-3.5 w-3.5" /> Review
                                </Button>
                                {course.status === 'pending_review' && (
                                    <>
                                        <Button
                                            size="sm"
                                            className="bg-success text-success-foreground hover:bg-success/90"
                                            onClick={() => handleApprove(course.id)}
                                        >
                                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approve
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-destructive border-destructive/30 hover:bg-destructive/10"
                                            onClick={() => setRejectingId(course.id)}
                                        >
                                            <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
                                        </Button>
                                    </>
                                )}
                                {course.status === 'rejected' && (
                                    <Button
                                        size="sm"
                                        className="bg-success text-success-foreground hover:bg-success/90"
                                        onClick={() => handleApprove(course.id)}
                                    >
                                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approve
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Course Approvals" />
            <div className="min-h-screen bg-background">
                <div className="container py-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10 text-info">
                        <Shield className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="font-heading text-3xl font-bold text-foreground">Course Approvals</h1>
                        <p className="text-muted-foreground">
                            Review and manage course submissions
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                    <Card className="shadow-card">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10 text-warning">
                                <Clock className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Pending Review</p>
                                <p className="font-heading text-2xl font-bold text-foreground">
                                    {pendingCourses.length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-card">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10 text-success">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Approved</p>
                                <p className="font-heading text-2xl font-bold text-foreground">
                                    {approvedCourses.length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-card">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                                <XCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Rejected</p>
                                <p className="font-heading text-2xl font-bold text-foreground">
                                    {rejectedCourses.length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="pending">
                    <TabsList>
                        <TabsTrigger value="pending">
                            Pending Review
                            {pendingCourses.length > 0 && (
                                <Badge className="ml-2 bg-yellow-500 text-white h-5 w-5 p-0 flex items-center justify-center text-xs">
                                    {pendingCourses.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="approved">Approved</TabsTrigger>
                        <TabsTrigger value="rejected">Rejected</TabsTrigger>
                        <TabsTrigger value="all">All Courses</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending" className="space-y-4 mt-6">
                        {pendingCourses.length === 0 ? (
                            <div className="text-center py-12">
                                <CheckCircle2 className="mx-auto h-12 w-12 text-green-500/40 mb-3" />
                                <p className="text-muted-foreground">
                                    No courses pending review. All caught up!
                                </p>
                            </div>
                        ) : (
                            pendingCourses.map((c) => <CourseRow key={c.id} course={c} />)
                        )}
                    </TabsContent>

                    <TabsContent value="approved" className="space-y-4 mt-6">
                        {approvedCourses.map((c) => (
                            <CourseRow key={c.id} course={c} />
                        ))}
                    </TabsContent>

                    <TabsContent value="rejected" className="space-y-4 mt-6">
                        {rejectedCourses.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">No rejected courses.</p>
                            </div>
                        ) : (
                            rejectedCourses.map((c) => <CourseRow key={c.id} course={c} />)
                        )}
                    </TabsContent>

                    <TabsContent value="all" className="space-y-4 mt-6">
                        {courses.map((c) => (
                            <CourseRow key={c.id} course={c} />
                        ))}
                    </TabsContent>
                </Tabs>

                {/* Reject Dialog */}
                <Dialog open={!!rejectingId} onOpenChange={(open) => !open && setRejectingId(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reject Course</DialogTitle>
                            <DialogDescription>
                                Provide feedback to the instructor about why this course was rejected.
                            </DialogDescription>
                        </DialogHeader>
                        <Textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Explain what needs to be improved..."
                            rows={4}
                        />
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setRejectingId(null)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleReject}
                                disabled={!feedback.trim()}
                            >
                                <XCircle className="mr-2 h-4 w-4" /> Reject Course
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Preview Dialog */}
                <Dialog open={!!previewId} onOpenChange={(open) => !open && setPreviewId(null)}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        {previewCourse && (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="text-xl">
                                        {previewCourse.title}
                                    </DialogTitle>
                                    <DialogDescription>{previewCourse.description}</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 mt-4">
                                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                        <Badge variant="outline">{previewCourse.category}</Badge>
                                        <Badge variant="outline">{previewCourse.level}</Badge>
                                        <span>By {previewCourse.instructor}</span>
                                        <span>{previewCourse.duration}</span>
                                    </div>
                                    {previewCourse.modules.map((mod, mi) => (
                                        <div
                                            key={mod.id}
                                            className="rounded-lg border border-border overflow-hidden"
                                        >
                                            <div className="px-4 py-3 bg-muted/30 border-b border-border">
                                                <p className="font-semibold text-sm text-foreground">
                                                    Module {mi + 1}: {mod.title}
                                                </p>
                                            </div>
                                            <ul className="divide-y divide-border">
                                                {mod.lessons.map((l) => (
                                                    <li key={l.id} className="px-4 py-2.5 text-sm">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-foreground">{l.title}</span>
                                                            <div className="flex items-center gap-2">
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-xs capitalize"
                                                                >
                                                                    {l.type.replace('-', ' ')}
                                                                </Badge>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {l.duration}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {l.content && (
                                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                                {l.content}
                                                            </p>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                                <DialogFooter className="mt-4">
                                    <Button variant="outline" asChild>
                                        <Link
                                            href={`/courses/${previewCourse.id}`}
                                            onClick={() => setPreviewId(null)}
                                        >
                                            <Eye className="mr-2 h-4 w-4" /> Full Preview
                                        </Link>
                                    </Button>
                                    {previewCourse.status === 'pending_review' && (
                                        <>
                                            <Button
                                                className="bg-green-500 text-white hover:bg-green-600"
                                                onClick={() => {
                                                    handleApprove(previewCourse.id);
                                                    setPreviewId(null);
                                                }}
                                            >
                                                <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={() => {
                                                    setPreviewId(null);
                                                    setRejectingId(previewCourse.id);
                                                }}
                                            >
                                                <XCircle className="mr-2 h-4 w-4" /> Reject
                                            </Button>
                                        </>
                                    )}
                                </DialogFooter>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
                </div>
            </div>
        </AppLayout>
    );
}

export default function AdminCoursesPage() {
    return (
        <LearningAppProvider>
            <AdminCoursesContent />
        </LearningAppProvider>
    );
}
