/**
 * Training Path Search Results Page
 * Shows search results for industry-focused training paths.
 */
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Search, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import TrainingPathCard from '@/components/TrainingPaths/TrainingPathCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { TrainingPath } from '@/types/TrainingPath.types';
interface Props {
    trainingPaths: TrainingPath[];
    query: string;
    total: number;
}
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Training Paths', href: '/trainingPaths' },
    { title: 'Search', href: '/search' },
];
export default function SearchPage({
    trainingPaths = [],
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
            <Head title={`Search: ${query} - Training Paths`} />
            <div className="container space-y-6 py-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/trainingPaths">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Search Results</h1>
                        <p className="text-muted-foreground">
                            {total} training path result{total !== 1 ? 's' : ''} for "{query}"
                        </p>
                    </div>
                </div>
                {/* Search Form */}
                <form onSubmit={handleSearch} className="flex max-w-xl gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search training paths..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button type="submit">Search</Button>
                </form>
                {/* Results */}
                {trainingPaths.length === 0 ? (
                    <div className="py-12 text-center">
                        <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                        <h2 className="mb-2 text-xl font-semibold">
                            No training paths found
                        </h2>
                        <p className="mb-6 text-muted-foreground">
                            Try adjusting your search terms or browse all
                            training paths
                        </p>
                        <Button asChild>
                            <Link href="/trainingPaths">Browse All Paths</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {trainingPaths.map((trainingPath, index) => (
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

