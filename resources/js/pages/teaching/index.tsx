/**
 * Teaching Dashboard
 * Shows teacher's courses with stats and management options.
 * Uses unified AppLayout.
 */

import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    BookOpen,
    Edit,
    Plus,
    Star,
    Trash2,
    Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Course, CourseStatus } from '@/types/course.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Teaching', href: '/teaching' },
];

const statusConfig: Record<CourseStatus, { label: string; className: string }> = {
    draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
    pending_review: { label: 'Pending', className: 'bg-warning/10 text-warning border-warning/30' },
    approved: { label: 'Approved', className: 'bg-success/10 text-success border-success/30' },
    rejected: { label: 'Rejected', className: 'bg-destructive/10 text-destructive border-destructive/30' },
};

interface TeacherStats {
    totalCourses: number;
    totalStudents: number;
    avgRating: number;
}

interface PageProps {
    courses: Course[];
    stats: TeacherStats;
}

export default function TeachingPage() {
    const { courses, stats } = usePage<{ props: PageProps }>().props as unknown as PageProps;

    const statCards = [
        { icon: BookOpen, label: 'Total Courses', value: stats.totalCourses, bg: 'bg-primary/10', color: 'text-primary' },
        { icon: Users, label: 'Total Students', value: stats.totalStudents.toLocaleString(), bg: 'bg-info/10', color: 'text-info' },
        { icon: Star, label: 'Avg Rating', value: stats.avgRating, bg: 'bg-warning/10', color: 'text-warning' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Teaching Dashboard" />
            <div className="min-h-screen bg-background">
                <div className="container py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="font-heading text-3xl font-bold text-foreground">Teacher Dashboard</h1>
                            <p className="text-muted-foreground mt-1">Manage your courses and track student progress</p>
                        </div>
                        <Button className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                            <Link href="/teaching/create">
                                <Plus className="mr-2 h-4 w-4" /> Create Course
                            </Link>
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                        {statCards.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card className="shadow-card">
                                    <CardContent className="flex items-center gap-4 p-5">
                                        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bg}`}>
                                            <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                                            <p className="font-heading text-2xl font-bold text-foreground">{stat.value}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* My Courses */}
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="font-heading text-xl font-semibold text-foreground">My Courses</h2>
                    </div>
                    <div className="space-y-4">
                        {courses.map((course, i) => {
                            const status = statusConfig[course.status];
                            const moduleCount = course.modules?.length ?? 0;
                            const lessonCount = course.modules?.reduce((a, m) => a + m.lessons.length, 0) ?? 0;
                            return (
                                <motion.div
                                    key={course.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <Card className="shadow-card hover:shadow-card-hover transition-shadow">
                                        <CardContent className="flex items-center gap-6 p-5">
                                            <div className="hidden sm:flex h-16 w-24 shrink-0 items-center justify-center rounded-md bg-muted">
                                                <BookOpen className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <h3 className="font-heading font-semibold text-foreground truncate">
                                                        {course.title}
                                                    </h3>
                                                    <Badge variant="outline" className={`text-xs ${status.className}`}>
                                                        {status.label}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs">
                                                        {course.level}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {moduleCount} modules ·{' '}
                                                    {lessonCount} lessons ·{' '}
                                                    {(course.students ?? 0).toLocaleString()} students
                                                </p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                                                    <span className="text-sm text-muted-foreground">{course.rating ?? 0}</span>
                                                </div>
                                                {course.adminFeedback && (
                                                    <p className="text-xs text-destructive mt-1">
                                                        Admin feedback: {course.adminFeedback}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/teaching/${course.id}/edit`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="sm">
                                                    <BarChart3 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
