/**
 * TrainingPath Students Page
 * Student roster with progress tracking.
 */
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Search, CheckCircle, Clock, User } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type {
    StudentRosterItem,
    PaginationMeta,
} from '@/types/analytics.types';
interface StudentsPageProps {
    trainingPath: {
        id: number;
        title: string;
    };
    students: StudentRosterItem[];
    pagination: PaginationMeta;
}
export default function StudentsPage({
    trainingPath,
    students,
    pagination,
}: StudentsPageProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: 'Teaching', href: '/teaching' },
            { title: 'Analytics', href: '/teaching/analytics' },
            {
                title: trainingPath.title,
                href: `/teaching/analytics/trainingPaths/${trainingPath.id}/students`,
            },
        ],
        [trainingPath],
    );
    const filteredStudents = useMemo(() => {
        if (!searchQuery) return students;
        const query = searchQuery.toLowerCase();
        return students.filter(
            (s) =>
                s.name.toLowerCase().includes(query) ||
                s.email.toLowerCase().includes(query),
        );
    }, [students, searchQuery]);
    const handlePageChange = (page: number) => {
        router.get(
            `/teaching/analytics/trainingPaths/${trainingPath.id}/students`,
            { page },
            { preserveState: true },
        );
    };
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };
    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Students - ${trainingPath.title}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/teaching/analytics">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="font-heading text-2xl font-semibold text-foreground">
                            {trainingPath.title}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {pagination.total} students enrolled
                        </p>
                    </div>
                </div>
                {/* Filters */}
                <div className="flex items-center gap-4">
                    <div className="relative max-w-sm flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search students..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>
                {/* Student List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">
                            Student Roster
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {filteredStudents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <User className="mb-4 h-12 w-12 text-muted-foreground" />
                                <p className="text-muted-foreground">
                                    {searchQuery
                                        ? 'No students match your search.'
                                        : 'No students enrolled yet.'}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {filteredStudents.map((student) => (
                                    <div
                                        key={student.id}
                                        className="flex items-center gap-4 py-4"
                                    >
                                        <Avatar>
                                            <AvatarImage
                                                src={
                                                    student.avatar_url ??
                                                    undefined
                                                }
                                                alt={student.name}
                                            />
                                            <AvatarFallback>
                                                {getInitials(student.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium">
                                                {student.name}
                                            </p>
                                            <p className="truncate text-sm text-muted-foreground">
                                                {student.email}
                                            </p>
                                        </div>
                                        <div className="hidden w-32 sm:block">
                                            <p className="mb-1 text-xs text-muted-foreground">
                                                Progress
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <Progress
                                                    value={student.progress}
                                                    className="flex-1"
                                                />
                                                <span className="w-8 text-xs font-medium">
                                                    {student.progress}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="hidden text-right md:block">
                                            <p className="text-xs text-muted-foreground">
                                                Enrolled
                                            </p>
                                            <p className="text-sm">
                                                {formatDate(
                                                    student.enrolled_at,
                                                )}
                                            </p>
                                        </div>
                                        <div className="w-24 text-right">
                                            {student.is_completed ? (
                                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                                    <CheckCircle className="mr-1 h-3 w-3" />
                                                    Completed
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">
                                                    <Clock className="mr-1 h-3 w-3" />
                                                    In Progress
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {/* Pagination */}
                        {pagination.last_page > 1 && (
                            <div className="mt-6 flex items-center justify-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        handlePageChange(
                                            pagination.current_page - 1,
                                        )
                                    }
                                    disabled={pagination.current_page === 1}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Page {pagination.current_page} of{' '}
                                    {pagination.last_page}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        handlePageChange(
                                            pagination.current_page + 1,
                                        )
                                    }
                                    disabled={
                                        pagination.current_page ===
                                        pagination.last_page
                                    }
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
