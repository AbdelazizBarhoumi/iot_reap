/**
 * Course Category Page
 * Shows courses in a specific category.
 */
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useState } from 'react';
import CourseCard from '@/components/courses/CourseCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Course } from '@/types/course.types';
interface Props {
    courses: Course[];
    category: string;
    total: number;
    allCategories: string[];
}
export default function CategoryPage({
    courses = [],
    category = '',
    total = 0,
    allCategories = [],
}: Props) {
    const [sortBy, setSortBy] = useState('popular');
    const [level, setLevel] = useState('all');
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Courses', href: '/courses' },
        {
            title: category,
            href: `/courses/category/${encodeURIComponent(category)}`,
        },
    ];
    // Filter and sort
    const filtered = courses
        .filter((c) => level === 'all' || c.level.toLowerCase() === level)
        .sort((a, b) => {
            switch (sortBy) {
                case 'rating':
                    return b.rating - a.rating;
                case 'newest':
                    return (
                        new Date(b.created_at || 0).getTime() -
                        new Date(a.created_at || 0).getTime()
                    );
                case 'price-low':
                    return 0; // Price sorting not available
                case 'price-high':
                    return 0; // Price sorting not available  
                default:
                    return (b.students || 0) - (a.students || 0);
            }
        });
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${category} Courses`} />
            <div className="container space-y-6 py-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/courses">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{category}</h1>
                        <p className="text-muted-foreground">
                            {total} course{total !== 1 ? 's' : ''} available
                        </p>
                    </div>
                </div>
                {/* Filters */}
                <div className="flex flex-wrap gap-4">
                    <Select value={level} onValueChange={setLevel}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Level" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Levels</SelectItem>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">
                                Intermediate
                            </SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="popular">
                                Most Popular
                            </SelectItem>
                            <SelectItem value="rating">
                                Highest Rated
                            </SelectItem>
                            <SelectItem value="newest">Newest</SelectItem>
                            <SelectItem value="price-low">
                                Price: Low to High
                            </SelectItem>
                            <SelectItem value="price-high">
                                Price: High to Low
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {/* Other Categories */}
                {allCategories.length > 1 && (
                    <div className="flex flex-wrap gap-2">
                        {allCategories
                            .filter((c) => c !== category)
                            .map((cat) => (
                                <Link
                                    key={cat}
                                    href={`/courses/category/${encodeURIComponent(cat)}`}
                                >
                                    <Badge
                                        variant="outline"
                                        className="cursor-pointer hover:bg-accent"
                                    >
                                        {cat}
                                    </Badge>
                                </Link>
                            ))}
                    </div>
                )}
                {/* Results */}
                {filtered.length === 0 ? (
                    <div className="py-12 text-center">
                        <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                        <h2 className="mb-2 text-xl font-semibold">
                            No courses found
                        </h2>
                        <p className="mb-6 text-muted-foreground">
                            Try adjusting your filters or browse all courses
                        </p>
                        <Button asChild>
                            <Link href="/courses">Browse All Courses</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filtered.map((course, index) => (
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

