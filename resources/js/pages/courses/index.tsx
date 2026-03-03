/**
 * Browse Courses Page
 * Shows all approved courses available for learning.
 * Uses unified AppLayout.
 */

import { Head, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import CourseCard from '@/components/courses/CourseCard';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Course } from '@/types/course.types';

interface PageProps {
    courses: Course[];
    categories: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Courses', href: '/courses' },
];

export default function CoursesPage() {
    const { courses, categories } = usePage<{ props: PageProps }>().props as unknown as PageProps;
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Filter courses based on search and category
    const filtered = useMemo(() => {
        return courses.filter((c) => {
            const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
                c.description.toLowerCase().includes(search.toLowerCase());
            const matchesCat = !selectedCategory || c.category === selectedCategory;
            return matchesSearch && matchesCat;
        });
    }, [courses, search, selectedCategory]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Browse Courses" />
            <div className="min-h-screen">
                <div className="container py-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="font-heading text-3xl font-bold text-foreground">Explore Courses</h1>
                        <p className="text-muted-foreground mt-1">Find the perfect course to advance your skills</p>
                    </motion.div>

                    {/* Search and Filter */}
                    <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search courses..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="mt-4 flex flex-wrap gap-2">
                        <Badge
                            variant={selectedCategory === null ? 'default' : 'outline'}
                            className={`cursor-pointer ${selectedCategory === null ? 'bg-primary text-primary-foreground' : ''}`}
                            onClick={() => setSelectedCategory(null)}
                        >
                            All
                        </Badge>
                        {categories.map((cat) => (
                            <Badge
                                key={cat}
                                variant={selectedCategory === cat ? 'default' : 'outline'}
                                className={`cursor-pointer ${selectedCategory === cat ? 'bg-primary text-primary-foreground' : ''}`}
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat}
                            </Badge>
                        ))}
                    </div>

                    {/* Course Grid */}
                    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filtered.map((course, i) => (
                            <CourseCard key={course.id} course={course} index={i} />
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <div className="mt-16 text-center">
                            <p className="text-muted-foreground text-lg">
                                No courses found matching your criteria.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
