/**
 * Browse Courses Page
 * Shows all approved courses available for learning.
 * Professional design with filters, search, and animated grid.
 */
import { Head, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    BookOpen,
    GraduationCap,
    Sparkles,
    X,
    SlidersHorizontal,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import CourseCard from '@/components/courses/CourseCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
interface PageProps {
    courses: Course[];
    categories: string[];
}
const breadcrumbs: BreadcrumbItem[] = [{ title: 'Courses', href: '/courses' }];
const levelFilters = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];
export default function CoursesPage() {
    const { courses, categories } = usePage<{ props: PageProps }>()
        .props as unknown as PageProps;
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        null,
    );
    const [selectedLevel, setSelectedLevel] = useState<string>('All Levels');
    const [sortBy, setSortBy] = useState<string>('popular');
    // Filter and sort courses
    const filtered = useMemo(() => {
        let result = courses.filter((c) => {
            const matchesSearch =
                !search ||
                c.title.toLowerCase().includes(search.toLowerCase()) ||
                c.description.toLowerCase().includes(search.toLowerCase()) ||
                c.instructor.toLowerCase().includes(search.toLowerCase());
            const matchesCat =
                !selectedCategory || c.category === selectedCategory;
            const matchesLevel =
                selectedLevel === 'All Levels' || c.level === selectedLevel;
            return matchesSearch && matchesCat && matchesLevel;
        });
        // Sort
        switch (sortBy) {
            case 'rating':
                result = [...result].sort((a, b) => b.rating - a.rating);
                break;
            case 'students':
                result = [...result].sort((a, b) => b.students - a.students);
                break;
            case 'newest':
                result = [...result].reverse();
                break;
            case 'popular':
            default:
                result = [...result].sort(
                    (a, b) => b.students * b.rating - a.students * a.rating,
                );
        }
        return result;
    }, [courses, search, selectedCategory, selectedLevel, sortBy]);
    const clearFilters = () => {
        setSearch('');
        setSelectedCategory(null);
        setSelectedLevel('All Levels');
        setSortBy('popular');
    };
    const hasActiveFilters =
        search || selectedCategory || selectedLevel !== 'All Levels';
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Browse Courses" />
            <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
                {/* Hero Section */}
                <div className="bg-hero-gradient text-white">
                    <div className="container py-12 md:py-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-2xl"
                        >
                            <div className="mb-4 flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary" />
                                <span className="text-sm font-medium text-white/80">
                                    {courses.length} courses available
                                </span>
                            </div>
                            <h1 className="mb-4 font-heading text-4xl font-bold md:text-5xl">
                                Level Up Your
                                <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                                    Engineering Skills
                                </span>
                            </h1>
                            <p className="max-w-xl text-lg text-white/70">
                                Explore hands-on courses with virtual labs, real
                                equipment access, and industry-relevant projects
                                designed for Industry 4.0.
                            </p>
                        </motion.div>
                        {/* Search in hero */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="mt-8 max-w-2xl"
                        >
                            <div className="relative">
                                <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search courses, topics, or instructors..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-14 rounded-xl border-white/20 bg-white/10 pl-12 text-lg text-white backdrop-blur-sm placeholder:text-white/50 focus:border-white/40 focus:bg-white/20"
                                />
                                {search && (
                                    <button
                                        onClick={() => setSearch('')}
                                        className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full p-1 transition-colors hover:bg-white/10"
                                    >
                                        <X className="h-4 w-4 text-white/70" />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
                <div className="container py-8">
                    {/* Filters Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-8 flex flex-col gap-4 rounded-xl border border-border/50 bg-card p-4 shadow-sm lg:flex-row lg:items-center"
                    >
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <SlidersHorizontal className="h-4 w-4" />
                            <span>Filters</span>
                        </div>
                        {/* Category Pills */}
                        <div className="flex flex-1 flex-wrap gap-2">
                            <Badge
                                variant={
                                    selectedCategory === null
                                        ? 'default'
                                        : 'outline'
                                }
                                className={`cursor-pointer px-3 py-1.5 text-sm transition-all ${
                                    selectedCategory === null
                                        ? 'bg-primary text-primary-foreground shadow-md'
                                        : 'hover:bg-muted'
                                }`}
                                onClick={() => setSelectedCategory(null)}
                            >
                                <BookOpen className="mr-1.5 h-3.5 w-3.5" />
                                All Categories
                            </Badge>
                            {categories.map((cat) => (
                                <Badge
                                    key={cat}
                                    variant={
                                        selectedCategory === cat
                                            ? 'default'
                                            : 'outline'
                                    }
                                    className={`cursor-pointer px-3 py-1.5 text-sm transition-all ${
                                        selectedCategory === cat
                                            ? 'bg-primary text-primary-foreground shadow-md'
                                            : 'hover:bg-muted'
                                    }`}
                                    onClick={() => setSelectedCategory(cat)}
                                >
                                    {cat}
                                </Badge>
                            ))}
                        </div>
                        {/* Level and Sort dropdowns */}
                        <div className="flex items-center gap-3">
                            <Select
                                value={selectedLevel}
                                onValueChange={setSelectedLevel}
                            >
                                <SelectTrigger className="h-9 w-[140px]">
                                    <GraduationCap className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <SelectValue placeholder="Level" />
                                </SelectTrigger>
                                <SelectContent>
                                    {levelFilters.map((level) => (
                                        <SelectItem key={level} value={level}>
                                            {level}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="h-9 w-[130px]">
                                    <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="popular">
                                        Popular
                                    </SelectItem>
                                    <SelectItem value="rating">
                                        Top Rated
                                    </SelectItem>
                                    <SelectItem value="students">
                                        Most Students
                                    </SelectItem>
                                    <SelectItem value="newest">
                                        Newest
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    <X className="mr-1 h-4 w-4" />
                                    Clear
                                </Button>
                            )}
                        </div>
                    </motion.div>
                    {/* Results count */}
                    <div className="mb-6 flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing{' '}
                            <span className="font-medium text-foreground">
                                {filtered.length}
                            </span>{' '}
                            {filtered.length === 1 ? 'course' : 'courses'}
                            {hasActiveFilters && ' matching your filters'}
                        </p>
                    </div>
                    {/* Course Grid */}
                    <AnimatePresence mode="wait">
                        {filtered.length > 0 ? (
                            <motion.div
                                key="grid"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                            >
                                {filtered.map((course, i) => (
                                    <CourseCard
                                        key={course.id}
                                        course={course}
                                        index={i}
                                    />
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="py-20 text-center"
                            >
                                <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                                    <BookOpen className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <h3 className="mb-2 font-heading text-xl font-semibold">
                                    No courses found
                                </h3>
                                <p className="mx-auto mb-6 max-w-md text-muted-foreground">
                                    We couldn't find any courses matching your
                                    criteria. Try adjusting your filters or
                                    search term.
                                </p>
                                <Button
                                    onClick={clearFilters}
                                    variant="outline"
                                >
                                    Clear all filters
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </AppLayout>
    );
}

