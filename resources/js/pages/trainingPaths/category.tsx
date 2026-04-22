/**
 * TrainingPath Category Page
 * Shows trainingPaths in a specific category.
 */
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useState } from 'react';
import TrainingPathCard from '@/components/TrainingPaths/TrainingPathCard';
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
import trainingPathsRoutes from '@/routes/trainingPaths';
import type { BreadcrumbItem } from '@/types';

interface SearchTrainingPathResult {
    id: string | number;
    title: string;
    description: string;
    instructor: string;
    category: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    duration: string | null;
    rating: number;
    students: number;
    hasVirtualMachine?: boolean;
    thumbnail?: string | null;
    price?: number;
    isFree?: boolean;
    created_at?: string;
}

interface SearchCategory {
    name: string;
    slug: string;
    count?: number;
}

interface Props {
    trainingPaths: SearchTrainingPathResult[];
    category: string;
    slug: string;
    total?: number;
    categories?: SearchCategory[];
}
export default function CategoryPage({
    trainingPaths = [],
    category = '',
    slug,
    total = 0,
    categories = [],
}: Props) {
    const [sortBy, setSortBy] = useState('popular');
    const [level, setLevel] = useState('all');
    const totalResults = total || trainingPaths.length;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Training Paths', href: '/trainingPaths' },
        {
            title: category,
            href: `/search/category/${slug}`,
        },
    ];
    // Filter and sort
    const filtered = trainingPaths
        .filter((c) => level === 'all' || c.level.toLowerCase() === level)
        .sort((a, b) => {
            switch (sortBy) {
                case 'rating':
                    return b.rating - a.rating;
                case 'newest':
                    return (
                        new Date(b.created_at ?? 0).getTime() -
                        new Date(a.created_at ?? 0).getTime()
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
            <Head title={`${category} Training Paths`} />
            <div className="container space-y-6 py-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={trainingPathsRoutes.index.url()}>
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{category}</h1>
                        <p className="text-muted-foreground">
                            {totalResults} training path
                            {totalResults !== 1 ? 's' : ''} available
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
                            <SelectItem value="popular"> Popular</SelectItem>
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
                {/* Other Domains */}
                {categories.length > 1 && (
                    <div className="flex flex-wrap gap-2">
                        {categories
                            .filter((cat) => cat.slug !== slug)
                            .map((cat) => (
                                <Link
                                    key={cat.slug}
                                    href={`/search/category/${cat.slug}`}
                                >
                                    <Badge
                                        variant="outline"
                                        className="cursor-pointer hover:bg-accent"
                                    >
                                        {cat.name}
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
                            No training paths found
                        </h2>
                        <p className="mb-6 text-muted-foreground">
                            Try adjusting your filters or browse all paths
                        </p>
                        <Button asChild>
                            <Link href={trainingPathsRoutes.index.url()}>
                                Browse All Paths
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filtered.map((trainingPath, index) => (
                            <motion.div
                                key={trainingPath.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <TrainingPathCard trainingPath={trainingPath} />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
