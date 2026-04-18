/**
 * Browse TrainingPaths Page
 * Shows all approved trainingPaths available for learning.
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
import TrainingPathCard from '@/components/TrainingPaths/TrainingPathCard';
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
import type { TrainingPath } from '@/types/TrainingPath.types';
interface PageProps {
    trainingPaths: TrainingPath[];
    categories: string[];
}
const breadcrumbs: BreadcrumbItem[] = [{ title: 'TrainingPaths', href: '/trainingPaths' }];
const levelFilters = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];
export default function TrainingPathsPage() {
    const { trainingPaths, categories } = usePage<{ props: PageProps }>()
        .props as unknown as PageProps;
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        null,
    );
    const [selectedLevel, setSelectedLevel] = useState<string>('All Levels');
    const [sortBy, setSortBy] = useState<string>('popular');
    // Filter and sort trainingPaths
    const filtered = useMemo(() => {
        let result = trainingPaths.filter((c) => {
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
    }, [trainingPaths, search, selectedCategory, selectedLevel, sortBy]);
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
            <Head title="Browse Training Paths" />
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
                                    {trainingPaths.length} training paths available
                                </span>
                            </div>
                            <h1 className="mb-4 font-heading text-4xl font-bold md:text-5xl">
                                Level Up Your
                                <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                                    Industrial Skills
                                </span>
                            </h1>
                            <p className="max-w-xl text-lg text-white/70">
                                Explore hands-on training paths with virtual
                                labs, real equipment access, and
                                industry-relevant projects designed for
                                Industry 4.0.
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
                                    placeholder="Search paths, topics, or experts..."
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
                    {/* Enhanced Filters Panel */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-10 rounded-2xl border border-border/40 bg-card p-6 shadow-sm"
                    >
                        {/* Filters Header */}
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-primary/10 p-2">
                                    <SlidersHorizontal className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="font-semibold text-foreground">Filters</h3>
                            </div>
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="text-xs text-muted-foreground hover:text-foreground"
                                >
                                    <X className="mr-1.5 h-4 w-4" />
                                    Clear all
                                </Button>
                            )}
                        </div>

                        {/* Category Pills */}
                        <div className="mb-6">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Domains
                            </p>
                            <div className="grid grid-flow-col auto-cols-max gap-2.5 overflow-x-auto pb-2 sm:grid-rows-2 scroll-smooth">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={`inline-flex min-w-max items-center justify-center gap-2 rounded-full px-3 py-2.5 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                                        selectedCategory === null
                                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                                            : 'border border-border/60 bg-background text-foreground hover:border-primary/30 hover:bg-primary/5'
                                    }`}
                                >
                                    <BookOpen className="h-4 w-4 flex-shrink-0" />
                                    All Domains
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`inline-flex min-w-max items-center justify-center gap-2 rounded-full px-3 py-2.5 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                                            selectedCategory === cat
                                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                                                : 'border border-border/60 bg-background text-foreground hover:border-primary/30 hover:bg-primary/5'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Level and Sort Controls */}
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Level
                                </p>
                                <Select
                                    value={selectedLevel}
                                    onValueChange={setSelectedLevel}
                                >
                                    <SelectTrigger className="h-10 rounded-lg border-border/60 bg-background">
                                        <GraduationCap className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <SelectValue placeholder="All Levels" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {levelFilters.map((level) => (
                                            <SelectItem key={level} value={level}>
                                                {level}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex-1 min-w-[200px]">
                                <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Sort by
                                </p>
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="h-10 rounded-lg border-border/60 bg-background">
                                        <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <SelectValue placeholder="Popular" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="popular">Popular</SelectItem>
                                        <SelectItem value="rating">Top Rated</SelectItem>
                                        <SelectItem value="students">Most Students</SelectItem>
                                        <SelectItem value="newest">Newest</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </motion.div>

                    {/* Results count */}
                    <div className="mb-8 flex items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground">
                            <span className="text-foreground">{filtered.length}</span>
                            {' '}
                            {filtered.length === 1 ? 'training path' : 'training paths'}
                            {hasActiveFilters && ' matching your filters'}
                        </p>
                    </div>

                    {/* TrainingPath Grid */}
                    <AnimatePresence mode="wait">
                        {filtered.length > 0 ? (
                            <motion.div
                                key="grid"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                            >
                                {filtered.map((trainingPath, i) => (
                                    <TrainingPathCard
                                        key={trainingPath.id}
                                        trainingPath={trainingPath}
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
                                className="rounded-2xl border border-border/30 bg-muted/30 py-20 text-center"
                            >
                                <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                                    <BookOpen className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <h3 className="mb-2 font-heading text-xl font-semibold">
                                    No training paths found
                                </h3>
                                <p className="mx-auto mb-6 max-w-md text-muted-foreground">
                                    We couldn't find any paths matching your
                                    criteria. Try adjusting your filters.
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

