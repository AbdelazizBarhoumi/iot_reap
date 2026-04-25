/**
 * Global Search Component
 *
 * A command-palette style search with:
 * - Keyboard shortcut (Cmd/Ctrl + K)
 * - Recent searches
 * - Trending searches
 * - Real-time autocomplete
 * - Search results with categories
 */
import { router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    X,
    BookOpen,
    FileText,
    User,
    Tag,
    Clock,
    TrendingUp,
    ArrowRight,
    Loader2,
    Command,
    Video,
} from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { searchApi } from '@/api/search.api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type {
    SearchResult,
    SearchSuggestion,
    SearchResultType,
} from '@/types/search.types';
// Icon mapping for result types
const typeIcons: Record<SearchResultType, typeof BookOpen> = {
    trainingPath: BookOpen,
    trainingUnit: Video,
    article: FileText,
    instructor: User,
    category: Tag,
};
const typeLabels: Record<SearchResultType, string> = {
    trainingPath: 'Path',
    trainingUnit: 'Lab',
    article: 'Guide',
    instructor: 'Expert',
    category: 'Domain',
};
const typeColors: Record<SearchResultType, string> = {
    trainingPath: 'bg-primary/10 text-primary',
    trainingUnit: 'bg-violet-500/10 text-violet-500',
    article: 'bg-amber-500/10 text-amber-500',
    instructor: 'bg-emerald-500/10 text-emerald-500',
    category: 'bg-blue-500/10 text-blue-500',
};
interface GlobalSearchProps {
    placeholder?: string;
}
export function GlobalSearch({
    placeholder = 'Search paths, labs, and experts...',
}: GlobalSearchProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [recentSearches, setRecentSearches] = useState<SearchSuggestion[]>(
        [],
    );
    const [trendingSearches, setTrendingSearches] = useState<
        SearchSuggestion[]
    >([]);
    const inputRef = useRef<HTMLInputElement>(null);
    // Fetch recent and trending searches
    useEffect(() => {
        const fetchSuggestions = async () => {
            // Get auth state to check if we should fetch personal recent searches
            const { useAuthStore } = await import('@/store/authStore');
            const user = useAuthStore.getState().user;

            try {
                // Only fetch recent searches if authenticated
                const recentPromise = user
                    ? searchApi.getRecent().catch(() => [])
                    : Promise.resolve([]);
                const [recent, trending] = await Promise.all([
                    recentPromise,
                    searchApi.getTrending().catch(() => []),
                ]);
                setRecentSearches(
                    recent.map((q) => ({ query: q, type: 'recent' as const })),
                );
                setTrendingSearches(
                    trending.map((q) => ({
                        query: q,
                        type: 'trending' as const,
                    })),
                );
            } catch {
                // Silently fail - suggestions are non-critical (guests won't have recent searches)
            }
        };
        fetchSuggestions();
    }, []);
    // Keyboard shortcut to open search
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);
    // Focus input when dialog opens
    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 0);
        } else {
            setQuery('');
            setResults([]);
            setSelectedIndex(0);
        }
    }, [open]);
    // Debounced search
    useEffect(() => {
        const trimmedQuery = query.trim();

        // Clear results if query is empty or too short (backend requires min 2 chars)
        if (trimmedQuery.length === 0) {
            setResults([]);
            setLoading(false);
            return;
        }

        if (trimmedQuery.length < 2) {
            setResults([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const timer = setTimeout(async () => {
            try {
                const response = await searchApi.search({
                    q: query,
                    per_page: 10,
                });
                setResults(response.results);
            } catch (error) {
                console.error('Search failed:', error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);
    // Keyboard navigation
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            const items = query
                ? results
                : [...recentSearches, ...trendingSearches];
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex((i) => (i + 1) % items.length);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(
                        (i) => (i - 1 + items.length) % items.length,
                    );
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (query && results[selectedIndex]) {
                        navigateToResult(results[selectedIndex]);
                    } else if (!query) {
                        const allSuggestions = [
                            ...recentSearches,
                            ...trendingSearches,
                        ];
                        if (allSuggestions[selectedIndex]) {
                            setQuery(allSuggestions[selectedIndex].query);
                        }
                    }
                    break;
                case 'Escape':
                    setOpen(false);
                    break;
            }
        },
        [query, results, recentSearches, trendingSearches, selectedIndex],
    );
    const navigateToResult = (result: SearchResult) => {
        setOpen(false);
        router.visit(result.url);
    };
    const handleSuggestionClick = (suggestion: SearchSuggestion) => {
        setQuery(suggestion.query);
    };
    return (
        <>
            {/* Search Trigger Button */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => setOpen(true)}
                className="relative h-9 w-9 cursor-pointer text-muted-foreground sm:w-64 sm:justify-start sm:px-3 sm:py-2"
                aria-label="Search industrial paths, labs, and experts"
            >
                <Search className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline-flex">Search...</span>
                <kbd className="pointer-events-none absolute top-1/2 right-2 hidden h-5 -translate-y-1/2 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground select-none sm:flex">
                    <Command className="h-3 w-3" />K
                </kbd>
            </Button>
            {/* Search Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-2xl [&>button]:hidden">
                    <DialogHeader>
                        <DialogTitle className="sr-only">
                            Industrial Search
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            Search paths, labs, experts, and resources.
                        </DialogDescription>
                    </DialogHeader>
                    {/* Search Input */}
                    <div className="flex items-center gap-3 border-b px-4 pt-4 pb-4">
                        <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
                        <Input
                            ref={inputRef}
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setSelectedIndex(0);
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            className="h-10 rounded-lg border bg-muted px-3 text-base focus-visible:ring-2 focus-visible:ring-primary"
                        />
                        {loading && (
                            <Loader2
                                className="h-5 w-5 shrink-0 animate-spin text-muted-foreground"
                                aria-label="Searching..."
                            />
                        )}
                        {query && !loading && (
                            <button
                                onClick={() => setQuery('')}
                                className="cursor-pointer rounded-full p-1 transition-colors hover:bg-muted"
                                aria-label="Clear search"
                            >
                                <X className="h-5 w-5 shrink-0 text-muted-foreground" />
                            </button>
                        )}
                    </div>
                    {/* Results / Suggestions */}
                    <div className="max-h-[400px] overflow-y-auto py-2">
                        <AnimatePresence mode="wait">
                            {!query ? (
                                /* Show suggestions when no query */
                                <motion.div
                                    key="suggestions"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    {/* Recent Searches */}
                                    {recentSearches.length > 0 && (
                                        <div className="px-2 pb-2">
                                            <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-muted-foreground">
                                                <Clock className="h-3.5 w-3.5" />
                                                Recent Activity
                                            </div>
                                            {recentSearches.map(
                                                (suggestion, i) => (
                                                    <button
                                                        key={suggestion.query}
                                                        onClick={() =>
                                                            handleSuggestionClick(
                                                                suggestion,
                                                            )
                                                        }
                                                        className={cn(
                                                            'flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-sm transition-colors',
                                                            selectedIndex === i
                                                                ? 'bg-primary/10 text-primary'
                                                                : 'text-foreground hover:bg-muted',
                                                        )}
                                                    >
                                                        <Search className="h-4 w-4 text-muted-foreground" />
                                                        <span>
                                                            {suggestion.query}
                                                        </span>
                                                        <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                                                    </button>
                                                ),
                                            )}
                                        </div>
                                    )}
                                    {/* Trending Searches */}
                                    {trendingSearches.length > 0 && (
                                        <div className="px-2 pb-2">
                                            <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-muted-foreground">
                                                <TrendingUp className="h-3.5 w-3.5" />
                                                Trending Topics
                                            </div>
                                            {trendingSearches.map(
                                                (suggestion, i) => (
                                                    <button
                                                        key={suggestion.query}
                                                        onClick={() =>
                                                            handleSuggestionClick(
                                                                suggestion,
                                                            )
                                                        }
                                                        className={cn(
                                                            'flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-sm transition-colors',
                                                            selectedIndex ===
                                                                i +
                                                                    recentSearches.length
                                                                ? 'bg-primary/10 text-primary'
                                                                : 'text-foreground hover:bg-muted',
                                                        )}
                                                    >
                                                        <TrendingUp className="h-4 w-4 text-orange-500" />
                                                        <span>
                                                            {suggestion.query}
                                                        </span>
                                                    </button>
                                                ),
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            ) : results.length > 0 ? (
                                /* Show search results */
                                <motion.div
                                    key="results"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="px-2"
                                >
                                    {results.map((result, i) => {
                                        const Icon = typeIcons[result.type];
                                        return (
                                            <button
                                                key={result.id}
                                                onClick={() =>
                                                    navigateToResult(result)
                                                }
                                                className={cn(
                                                    'flex w-full cursor-pointer items-start gap-3 rounded-lg p-3 text-left transition-colors',
                                                    selectedIndex === i
                                                        ? 'bg-primary/10'
                                                        : 'hover:bg-muted',
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                                                        typeColors[result.type],
                                                    )}
                                                >
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="truncate text-sm font-medium">
                                                            {result.title}
                                                        </span>
                                                        <Badge
                                                            variant="secondary"
                                                            className="px-1.5 py-0 text-[10px]"
                                                        >
                                                            {
                                                                typeLabels[
                                                                    result.type
                                                                ]
                                                            }
                                                        </Badge>
                                                    </div>
                                                    {result.subtitle && (
                                                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                                            {result.subtitle}
                                                        </p>
                                                    )}
                                                    {result.description && (
                                                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                                                            {result.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <ArrowRight
                                                    className={cn(
                                                        'mt-3 h-4 w-4 shrink-0 transition-opacity',
                                                        selectedIndex === i
                                                            ? 'text-primary opacity-100'
                                                            : 'opacity-0',
                                                    )}
                                                />
                                            </button>
                                        );
                                    })}
                                </motion.div>
                            ) : !loading ? (
                                /* No results */
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="px-6 py-14 text-center"
                                >
                                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                        <Search className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <h3 className="mb-1 text-sm font-medium">
                                        No industrial results found
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Try searching for a different path, lab,
                                        or expert
                                    </p>
                                </motion.div>
                            ) : null}
                        </AnimatePresence>
                    </div>
                    {/* Footer with shortcuts */}
                    <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                                <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                                    ↑↓
                                </kbd>
                                Navigate
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                                    ↵
                                </kbd>
                                Select
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                                    Esc
                                </kbd>
                                Close
                            </span>
                        </div>
                        <span>
                            Powered by{' '}
                            <span className="font-medium text-foreground">
                                IoT-REAP
                            </span>
                        </span>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
