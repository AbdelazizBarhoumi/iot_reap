/**
 * Discussion Thread List Component
 *
 * Displays a list of discussion threads with:
 * - Search and filter controls
 * - Sort options (recent, popular, unanswered)
 * - Empty state handling
 * - New thread button
 */
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Plus,
    MessageSquare,
    TrendingUp,
    Clock,
    HelpCircle,
    X,
    SlidersHorizontal,
} from 'lucide-react';
import { useState, useMemo } from 'react';
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
import { cn } from '@/lib/utils';
import type { DiscussionThread } from '@/types/forum.types';
import { ThreadCard } from './ThreadCard';
interface ThreadListProps {
    threads: DiscussionThread[];
    trainingPathSlug?: string;
    trainingUnitSlug?: string;
    returnTo?: string;
    onNewThread?: () => void;
    onUpvote?: (threadId: string) => void;
    showNewButton?: boolean;
    emptyTitle?: string;
    emptyDescription?: string;
}
const sortOptions = [
    { value: 'recent', label: ' Recent', icon: Clock },
    { value: 'popular', label: ' Popular', icon: TrendingUp },
    { value: 'unanswered', label: 'Unanswered', icon: HelpCircle },
];
const filterTabs = [
    { value: 'all', label: 'All' },
    { value: 'open', label: 'Open' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'pinned', label: 'Pinned' },
];
export function ThreadList({
    threads,
    trainingPathSlug,
    trainingUnitSlug,
    returnTo,
    onNewThread,
    onUpvote,
    showNewButton = true,
    emptyTitle = 'No discussions yet',
    emptyDescription = 'Be the first to start a discussion!',
}: ThreadListProps) {
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'unanswered'>(
        'recent',
    );
    const [statusFilter, setStatusFilter] = useState<string>('all');
    // Filter and sort threads
    const filteredThreads = useMemo(() => {
        let result = [...threads];
        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(
                (t) =>
                    t.title.toLowerCase().includes(searchLower) ||
                    t.content.toLowerCase().includes(searchLower) ||
                    t.author.name.toLowerCase().includes(searchLower) ||
                    t.tags?.some((tag) =>
                        tag.toLowerCase().includes(searchLower),
                    ),
            );
        }
        // Status filter
        if (statusFilter !== 'all') {
            if (statusFilter === 'pinned') {
                result = result.filter((t) => t.isPinned);
            } else {
                result = result.filter((t) => t.status === statusFilter);
            }
        }
        // Sort
        switch (sortBy) {
            case 'popular':
                result.sort(
                    (a, b) =>
                        b.upvotes + b.replyCount - (a.upvotes + a.replyCount),
                );
                break;
            case 'unanswered':
                result = result.filter(
                    (t) => t.replyCount === 0 && t.status !== 'resolved',
                );
                result.sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime(),
                );
                break;
            case 'recent':
            default:
                result.sort((a, b) => {
                    const aTime = a.lastReplyAt || a.createdAt;
                    const bTime = b.lastReplyAt || b.createdAt;
                    return (
                        new Date(bTime).getTime() - new Date(aTime).getTime()
                    );
                });
        }
        // Always show pinned threads first
        const pinned = result.filter((t) => t.isPinned);
        const notPinned = result.filter((t) => !t.isPinned);
        return [...pinned, ...notPinned];
    }, [threads, search, sortBy, statusFilter]);
    const hasActiveFilters =
        search || statusFilter !== 'all' || sortBy !== 'recent';
    const clearFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setSortBy('recent');
    };
    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <h2 className="font-heading text-lg font-semibold">
                        Discussions
                    </h2>
                    <Badge variant="secondary" className="ml-1">
                        {threads.length}
                    </Badge>
                </div>
                {showNewButton && (
                    <Button onClick={onNewThread} size="sm" className="gap-1.5">
                        <Plus className="h-4 w-4" />
                        New Discussion
                    </Button>
                )}
            </div>
            {/* Search and Filters */}
            <div className="flex flex-col gap-3 lg:flex-row">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search discussions..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-9 pl-9"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-0.5 hover:bg-muted"
                        >
                            <X className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                    )}
                </div>
                {/* Filter Tabs */}
                <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-1">
                    {filterTabs.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setStatusFilter(tab.value)}
                            className={cn(
                                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                                statusFilter === tab.value
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                {/* Sort */}
                <Select
                    value={sortBy}
                    onValueChange={(v) => setSortBy(v as typeof sortBy)}
                >
                    <SelectTrigger className="h-9 w-[160px]">
                        <SlidersHorizontal className="mr-2 h-4 w-4 text-muted-foreground" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {sortOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                <span className="flex items-center gap-2">
                                    <option.icon className="h-4 w-4 text-muted-foreground" />
                                    {option.label}
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-9 text-muted-foreground"
                    >
                        <X className="mr-1 h-4 w-4" />
                        Clear
                    </Button>
                )}
            </div>
            {/* Results count */}
            {search && (
                <p className="text-sm text-muted-foreground">
                    Found{' '}
                    <span className="font-medium text-foreground">
                        {filteredThreads.length}
                    </span>{' '}
                    {filteredThreads.length === 1
                        ? 'discussion'
                        : 'discussions'}
                    {search && ` matching "${search}"`}
                </p>
            )}
            {/* Thread List */}
            <AnimatePresence mode="wait">
                {filteredThreads.length > 0 ? (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-3"
                    >
                        {filteredThreads.map((thread, index) => (
                            <ThreadCard
                                key={thread.id}
                                thread={thread}
                                trainingPathSlug={trainingPathSlug}
                                trainingUnitSlug={trainingUnitSlug}
                                returnTo={returnTo}
                                onUpvote={onUpvote}
                                index={index}
                            />
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="py-16 text-center"
                    >
                        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                            <MessageSquare className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="mb-2 font-heading text-lg font-semibold">
                            {hasActiveFilters
                                ? 'No matching discussions'
                                : emptyTitle}
                        </h3>
                        <p className="mx-auto mb-6 max-w-sm text-muted-foreground">
                            {hasActiveFilters
                                ? 'Try adjusting your filters or search term'
                                : emptyDescription}
                        </p>
                        {hasActiveFilters ? (
                            <Button variant="outline" onClick={clearFilters}>
                                Clear filters
                            </Button>
                        ) : showNewButton ? (
                            <Button onClick={onNewThread}>
                                <Plus className="mr-2 h-4 w-4" />
                                Start a Discussion
                            </Button>
                        ) : null}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}


