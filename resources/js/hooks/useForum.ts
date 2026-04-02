/**
 * useForum hook for managing discussion threads and replies.
 */
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import type {
    CreateThreadData,
    CreateReplyData,
    ThreadSort,
    ThreadFilter,
} from '@/api/forum.api';
import { forumApi } from '@/api/forum.api';
import type { DiscussionThread, ThreadReply } from '@/types/forum.types';
// ─────────────────────────────────────────────────────────────────────────────
// Hook Options & Return Types
// ─────────────────────────────────────────────────────────────────────────────
interface UseForumOptions {
    /** Lesson ID (for lesson-level threads) */
    lessonId?: number;
    /** Course ID (for course-level threads) */
    courseId?: number;
    /** Initial sort option */
    initialSort?: ThreadSort;
    /** Initial filter option */
    initialFilter?: ThreadFilter;
    /** Auto-fetch threads on mount */
    autoFetch?: boolean;
}
interface UseForumReturn {
    // Data
    threads: DiscussionThread[];
    currentThread: DiscussionThread | null;
    // Loading states
    loading: boolean;
    threadLoading: boolean;
    isSubmitting: boolean;
    // Error state
    error: string | null;
    // Pagination
    currentPage: number;
    totalPages: number;
    totalThreads: number;
    // Sort & Filter
    sort: ThreadSort;
    filter: ThreadFilter;
    setSort: (sort: ThreadSort) => void;
    setFilter: (filter: ThreadFilter) => void;
    // Thread operations
    fetchThreads: (page?: number) => Promise<void>;
    fetchThread: (threadId: string) => Promise<void>;
    createThread: (data: CreateThreadData) => Promise<DiscussionThread | null>;
    deleteThread: (threadId: string) => Promise<boolean>;
    upvoteThread: (threadId: string) => Promise<void>;
    flagThread: (threadId: string) => Promise<void>;
    // Reply operations
    replyToThread: (
        threadId: string,
        data: CreateReplyData,
    ) => Promise<ThreadReply | null>;
    deleteReply: (replyId: string) => Promise<boolean>;
    upvoteReply: (replyId: string) => Promise<void>;
    flagReply: (replyId: string) => Promise<void>;
    // Clear current thread
    clearCurrentThread: () => void;
}
// ─────────────────────────────────────────────────────────────────────────────
// Hook Implementation
// ─────────────────────────────────────────────────────────────────────────────
export function useForum({
    lessonId,
    courseId,
    initialSort = 'recent',
    initialFilter = 'all',
    autoFetch = true,
}: UseForumOptions): UseForumReturn {
    // Thread list state
    const [threads, setThreads] = useState<DiscussionThread[]>([]);
    const [currentThread, setCurrentThread] = useState<DiscussionThread | null>(
        null,
    );
    // Loading states
    const [loading, setLoading] = useState(false);
    const [threadLoading, setThreadLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Error state
    const [error, setError] = useState<string | null>(null);
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalThreads, setTotalThreads] = useState(0);
    // Sort & Filter state
    const [sort, setSort] = useState<ThreadSort>(initialSort);
    const [filter, setFilter] = useState<ThreadFilter>(initialFilter);
    // ─────────────────────────────────────────────────────────────────────────
    // Thread List Operations
    // ─────────────────────────────────────────────────────────────────────────
    const fetchThreads = useCallback(
        async (page = 1) => {
            if (!lessonId && !courseId) {
                setError('Either lessonId or courseId is required');
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const response = lessonId
                    ? await forumApi.getLessonThreads(lessonId, sort, filter, page)
                    : await forumApi.getCourseThreads(courseId!, sort, filter, page);
                setThreads(response.data);
                setCurrentPage(response.pagination.current_page);
                setTotalPages(response.pagination.last_page);
                setTotalThreads(response.pagination.total);
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : 'Failed to load discussions';
                setError(message);
                console.error('Error fetching threads:', err);
            } finally {
                setLoading(false);
            }
        },
        [lessonId, courseId, sort, filter],
    );
    // Auto-fetch on mount and when sort/filter changes
    useEffect(() => {
        if (autoFetch && (lessonId || courseId)) {
            fetchThreads(1);
        }
    }, [autoFetch, lessonId, courseId, sort, filter, fetchThreads]);
    // ─────────────────────────────────────────────────────────────────────────
    // Single Thread Operations
    // ─────────────────────────────────────────────────────────────────────────
    const fetchThread = useCallback(async (threadId: string) => {
        setThreadLoading(true);
        setError(null);
        try {
            const thread = await forumApi.getThread(threadId);
            setCurrentThread(thread);
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : 'Failed to load discussion';
            setError(message);
            console.error('Error fetching thread:', err);
        } finally {
            setThreadLoading(false);
        }
    }, []);
    const clearCurrentThread = useCallback(() => {
        setCurrentThread(null);
    }, []);
    const createThread = useCallback(
        async (data: CreateThreadData): Promise<DiscussionThread | null> => {
            if (!lessonId) {
                toast.error('Cannot create thread: lesson not specified');
                return null;
            }
            setIsSubmitting(true);
            try {
                const newThread = await forumApi.createThread(lessonId, data);
                setThreads((prev) => [newThread, ...prev]);
                setTotalThreads((prev) => prev + 1);
                toast.success('Discussion started successfully');
                return newThread;
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : 'Failed to start discussion';
                toast.error(message);
                return null;
            } finally {
                setIsSubmitting(false);
            }
        },
        [lessonId],
    );
    const deleteThread = useCallback(
        async (threadId: string): Promise<boolean> => {
            setIsSubmitting(true);
            try {
                await forumApi.deleteThread(threadId);
                setThreads((prev) => prev.filter((t) => t.id !== threadId));
                setTotalThreads((prev) => prev - 1);
                if (currentThread?.id === threadId) {
                    setCurrentThread(null);
                }
                toast.success('Discussion deleted');
                return true;
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : 'Failed to delete discussion';
                toast.error(message);
                return false;
            } finally {
                setIsSubmitting(false);
            }
        },
        [currentThread?.id],
    );
    // ─────────────────────────────────────────────────────────────────────────
    // Voting Operations
    // ─────────────────────────────────────────────────────────────────────────
    const upvoteThread = useCallback(async (threadId: string) => {
        try {
            const result = await forumApi.upvoteThread(threadId);
            // Update thread in list
            setThreads((prev) =>
                prev.map((t) =>
                    t.id === threadId
                        ? {
                              ...t,
                              upvotes: result.upvote_count,
                              hasUpvoted: result.upvoted,
                          }
                        : t,
                ),
            );
            // Update current thread if open
            setCurrentThread((prev) =>
                prev?.id === threadId
                    ? {
                          ...prev,
                          upvotes: result.upvote_count,
                          hasUpvoted: result.upvoted,
                      }
                    : prev,
            );
        } catch (err) {
            console.error('Error upvoting thread:', err);
            toast.error('Failed to upvote');
        }
    }, []);
    const upvoteReply = useCallback(async (replyId: string) => {
        try {
            const result = await forumApi.upvoteReply(replyId);
            // Update reply in current thread
            setCurrentThread((prev) => {
                if (!prev?.replies) return prev;
                const updateReplies = (
                    replies: ThreadReply[],
                ): ThreadReply[] => {
                    return replies.map((r) => {
                        if (r.id === replyId) {
                            return {
                                ...r,
                                upvotes: result.upvote_count,
                                hasUpvoted: result.upvoted,
                            };
                        }
                        if (r.replies) {
                            return { ...r, replies: updateReplies(r.replies) };
                        }
                        return r;
                    });
                };
                return { ...prev, replies: updateReplies(prev.replies) };
            });
        } catch (err) {
            console.error('Error upvoting reply:', err);
            toast.error('Failed to upvote');
        }
    }, []);
    // ─────────────────────────────────────────────────────────────────────────
    // Reply Operations
    // ─────────────────────────────────────────────────────────────────────────
    const replyToThread = useCallback(
        async (
            threadId: string,
            data: CreateReplyData,
        ): Promise<ThreadReply | null> => {
            setIsSubmitting(true);
            try {
                const newReply = await forumApi.replyToThread(threadId, data);
                // Update current thread's reply count and add reply
                setCurrentThread((prev) => {
                    if (!prev || prev.id !== threadId) return prev;
                    // If it's a nested reply (has parent_id), find and update parent
                    if (data.parent_id) {
                        const addNestedReply = (
                            replies: ThreadReply[],
                        ): ThreadReply[] => {
                            return replies.map((r) => {
                                if (r.id === data.parent_id) {
                                    return {
                                        ...r,
                                        replies: [...(r.replies || []), newReply],
                                    };
                                }
                                if (r.replies) {
                                    return {
                                        ...r,
                                        replies: addNestedReply(r.replies),
                                    };
                                }
                                return r;
                            });
                        };
                        return {
                            ...prev,
                            replyCount: prev.replyCount + 1,
                            replies: addNestedReply(prev.replies || []),
                        };
                    }
                    // Top-level reply
                    return {
                        ...prev,
                        replyCount: prev.replyCount + 1,
                        replies: [...(prev.replies || []), newReply],
                    };
                });
                // Update thread in list
                setThreads((prev) =>
                    prev.map((t) =>
                        t.id === threadId
                            ? { ...t, replyCount: t.replyCount + 1 }
                            : t,
                    ),
                );
                toast.success('Reply posted');
                return newReply;
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : 'Failed to post reply';
                toast.error(message);
                return null;
            } finally {
                setIsSubmitting(false);
            }
        },
        [],
    );
    const deleteReply = useCallback(
        async (replyId: string): Promise<boolean> => {
            setIsSubmitting(true);
            try {
                await forumApi.deleteReply(replyId);
                // Update current thread
                setCurrentThread((prev) => {
                    if (!prev?.replies) return prev;
                    const removeReply = (
                        replies: ThreadReply[],
                    ): ThreadReply[] => {
                        return replies
                            .filter((r) => r.id !== replyId)
                            .map((r) =>
                                r.replies
                                    ? { ...r, replies: removeReply(r.replies) }
                                    : r,
                            );
                    };
                    return {
                        ...prev,
                        replyCount: Math.max(0, prev.replyCount - 1),
                        replies: removeReply(prev.replies),
                    };
                });
                toast.success('Reply deleted');
                return true;
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : 'Failed to delete reply';
                toast.error(message);
                return false;
            } finally {
                setIsSubmitting(false);
            }
        },
        [],
    );
    // ─────────────────────────────────────────────────────────────────────────
    // Flagging Operations
    // ─────────────────────────────────────────────────────────────────────────
    const flagThread = useCallback(async (threadId: string) => {
        try {
            await forumApi.flagThread(threadId);
            toast.success('Reported for review');
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Failed to report';
            toast.error(message);
        }
    }, []);
    const flagReply = useCallback(async (replyId: string) => {
        try {
            await forumApi.flagReply(replyId);
            toast.success('Reported for review');
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Failed to report';
            toast.error(message);
        }
    }, []);
    // ─────────────────────────────────────────────────────────────────────────
    // Return
    // ─────────────────────────────────────────────────────────────────────────
    return {
        // Data
        threads,
        currentThread,
        // Loading states
        loading,
        threadLoading,
        isSubmitting,
        // Error
        error,
        // Pagination
        currentPage,
        totalPages,
        totalThreads,
        // Sort & Filter
        sort,
        filter,
        setSort,
        setFilter,
        // Thread operations
        fetchThreads,
        fetchThread,
        createThread,
        deleteThread,
        upvoteThread,
        flagThread,
        // Reply operations
        replyToThread,
        deleteReply,
        upvoteReply,
        flagReply,
        // Clear
        clearCurrentThread,
    };
}

