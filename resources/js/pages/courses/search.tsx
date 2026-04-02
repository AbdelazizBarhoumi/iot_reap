/**
 * Course Search Results Page
 * Shows search results for courses.
 */
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Search, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import CourseCard from '@/components/courses/CourseCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Course } from '@/types/course.types';
interface Props {
    courses: Course[];
    query: string;
    total: number;
}
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Courses', href: '/courses' },
    { title: 'Search', href: '/search' },
];
export default function SearchPage({
    courses = [],
    query = '',
    total = 0,
}: Props) {
    const [search, setSearch] = useState(query);
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/search', { q: search });
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Search: ${query} - Courses`} />
            <div className="container space-y-6 py-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/courses">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Search Results</h1>
                        <p className="text-muted-foreground">
                            {total} result{total !== 1 ? 's' : ''} for "{query}"
                        </p>
                    </div>
                </div>
                {/* Search Form */}
                <form onSubmit={handleSearch} className="flex max-w-xl gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search courses..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button type="submit">Search</Button>
                </form>
                {/* Results */}
                {courses.length === 0 ? (
                    <div className="py-12 text-center">
                        <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                        <h2 className="mb-2 text-xl font-semibold">
                            No courses found
                        </h2>
                        <p className="mb-6 text-muted-foreground">
                            Try adjusting your search terms or browse all
                            courses
                        </p>
                        <Button asChild>
                            <Link href="/courses">Browse All Courses</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {courses.map((course, index) => (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <CourseCard course={course} />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

