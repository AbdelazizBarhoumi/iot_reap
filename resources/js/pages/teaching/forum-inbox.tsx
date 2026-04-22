import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    ExternalLink,
    Flag,
    Lock,
    MessageSquare,
    Pin,
    RefreshCw,
    Unlock,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { forumApi } from '@/api/forum.api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import teaching from '@/routes/teaching';
import type { BreadcrumbItem } from '@/types';
import type { DiscussionThread, ThreadReply } from '@/types/forum.types';

type TeacherInboxFilter = 'flagged' | 'unanswered' | 'recent';

interface TeacherForumInboxPageProps {
    initialFilter?: TeacherInboxFilter;
    selectedThreadId?: string | null;
    threads?: Record<TeacherInboxFilter, DiscussionThread[]>;
}

interface ReplyItemProps {
    reply: ThreadReply;
    onMarkAnswer: (replyId: string) => Promise<void>;
    actionReplyId: string | null;
    level?: number;
}

function formatRelativeTime(dateString: string) {
    const value = new Date(dateString);
    const diffMs = Date.now() - value.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 1) {
        return 'Just now';
    }

    if (diffMinutes < 60) {
        return `${diffMinutes}m ago`;
    }

    if (diffHours < 24) {
        return `${diffHours}h ago`;
    }

    if (diffDays < 7) {
        return `${diffDays}d ago`;
    }

    return value.toLocaleDateString();
}

function ReplyItem({
    reply,
    onMarkAnswer,
    actionReplyId,
    level = 0,
}: ReplyItemProps) {
    return (
        <div className={level > 0 ? 'ml-6 border-l pl-4' : ''}>
            <div className="rounded-lg border bg-background p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">
                                {reply.author.name}
                            </p>
                            {reply.isAnswer && (
                                <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10">
                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                    Answer
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {formatRelativeTime(reply.createdAt)}
                        </p>
                    </div>
                    {!reply.isAnswer && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onMarkAnswer(reply.id)}
                            disabled={actionReplyId === reply.id}
                        >
                            {actionReplyId === reply.id
                                ? 'Saving...'
                                : 'Mark as Answer'}
                        </Button>
                    )}
                </div>
                <p className="mt-3 text-sm whitespace-pre-wrap text-foreground">
                    {reply.content}
                </p>
            </div>
            {reply.replies && reply.replies.length > 0 && (
                <div className="mt-3 space-y-3">
                    {reply.replies.map((childReply) => (
                        <ReplyItem
                            key={childReply.id}
                            reply={childReply}
                            onMarkAnswer={onMarkAnswer}
                            actionReplyId={actionReplyId}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function TeacherForumInboxPage({
    initialFilter = 'flagged',
    selectedThreadId: initialSelectedThreadId = null,
    threads: initialThreads,
}: TeacherForumInboxPageProps) {
    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: 'Teaching', href: teaching.index.url() },
            { title: 'Forum Inbox', href: teaching.forum.inbox.url() },
        ],
        [],
    );

    const [activeFilter, setActiveFilter] =
        useState<TeacherInboxFilter>(initialFilter);
    const [threadsByFilter, setThreadsByFilter] = useState<
        Record<TeacherInboxFilter, DiscussionThread[]>
    >(
        initialThreads ?? {
            flagged: [],
            unanswered: [],
            recent: [],
        },
    );
    const [selectedThreadId, setSelectedThreadId] = useState<string | null>(
        initialSelectedThreadId,
    );
    const [selectedThread, setSelectedThread] =
        useState<DiscussionThread | null>(null);
    const [isLoadingThreads, setIsLoadingThreads] = useState(
        initialThreads === undefined,
    );
    const [isLoadingThread, setIsLoadingThread] = useState(false);
    const [actionThreadId, setActionThreadId] = useState<string | null>(null);
    const [actionReplyId, setActionReplyId] = useState<string | null>(null);

    const allThreads = useMemo(
        () => [
            ...threadsByFilter.flagged,
            ...threadsByFilter.unanswered,
            ...threadsByFilter.recent,
        ],
        [threadsByFilter],
    );

    const selectedThreadSummary = useMemo(
        () =>
            allThreads.find((thread) => thread.id === selectedThreadId) ?? null,
        [allThreads, selectedThreadId],
    );

    const refreshThreads = useCallback(async () => {
        setIsLoadingThreads(true);

        try {
            const [flagged, unanswered, recent] = await Promise.all([
                forumApi.getTeacherInbox('flagged'),
                forumApi.getTeacherInbox('unanswered'),
                forumApi.getTeacherInbox('recent'),
            ]);

            setThreadsByFilter({
                flagged: flagged.data,
                unanswered: unanswered.data,
                recent: recent.data,
            });
        } catch {
            toast.error('Failed to load the teacher forum inbox.');
        } finally {
            setIsLoadingThreads(false);
        }
    }, []);

    const loadThread = useCallback(async (threadId: string) => {
        setIsLoadingThread(true);

        try {
            const thread = await forumApi.getThread(threadId);
            setSelectedThread(thread);
        } catch {
            toast.error('Failed to load the selected thread.');
        } finally {
            setIsLoadingThread(false);
        }
    }, []);

    useEffect(() => {
        if (initialThreads === undefined) {
            void refreshThreads();
        }
    }, [initialThreads, refreshThreads]);

    useEffect(() => {
        if (!selectedThreadId) {
            const firstThread = threadsByFilter[activeFilter][0];
            if (firstThread) {
                setSelectedThreadId(firstThread.id);
            } else {
                setSelectedThread(null);
            }
            return;
        }

        const matchingFilter = (
            ['flagged', 'unanswered', 'recent'] as TeacherInboxFilter[]
        ).find((filter) =>
            threadsByFilter[filter].some(
                (thread) => thread.id === selectedThreadId,
            ),
        );

        if (matchingFilter && matchingFilter !== activeFilter) {
            setActiveFilter(matchingFilter);
        }
    }, [activeFilter, selectedThreadId, threadsByFilter]);

    useEffect(() => {
        if (selectedThreadId) {
            void loadThread(selectedThreadId);
        }
    }, [loadThread, selectedThreadId]);

    const refreshThreadAfterAction = useCallback(
        async (threadId: string) => {
            await refreshThreads();
            await loadThread(threadId);
        },
        [loadThread, refreshThreads],
    );

    const withThreadAction = useCallback(
        async (
            threadId: string,
            action: () => Promise<unknown>,
            successMessage: string,
        ) => {
            setActionThreadId(threadId);

            try {
                await action();
                toast.success(successMessage);
                await refreshThreadAfterAction(threadId);
            } catch {
                toast.error('Unable to update this thread right now.');
            } finally {
                setActionThreadId(null);
            }
        },
        [refreshThreadAfterAction],
    );

    const handleMarkAnswer = useCallback(
        async (replyId: string) => {
            if (!selectedThreadId) {
                return;
            }

            setActionReplyId(replyId);

            try {
                await forumApi.markAsAnswer(replyId);
                toast.success('Reply marked as the answer.');
                await refreshThreadAfterAction(selectedThreadId);
            } catch {
                toast.error('Unable to mark that reply as the answer.');
            } finally {
                setActionReplyId(null);
            }
        },
        [refreshThreadAfterAction, selectedThreadId],
    );

    const activeThreads = threadsByFilter[activeFilter];
    const focusThread = selectedThread ?? selectedThreadSummary;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Teacher Forum Inbox" />
            <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
                <div className="container py-8">
                    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={teaching.index.url()}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Teaching
                                </Link>
                            </Button>
                            <div>
                                <h1 className="font-heading text-3xl font-bold">
                                    Forum Inbox
                                </h1>
                                <p className="text-muted-foreground">
                                    Moderate discussion threads, lock noisy
                                    conversations, and mark the best reply as
                                    the answer.
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => void refreshThreads()}
                            disabled={isLoadingThreads}
                        >
                            <RefreshCw
                                className={`mr-2 h-4 w-4 ${isLoadingThreads ? 'animate-spin' : ''}`}
                            />
                            Refresh
                        </Button>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
                        <Card className="h-fit">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5 text-primary" />
                                    Moderation Queue
                                </CardTitle>
                                <CardDescription>
                                    Switch between flagged threads, unanswered
                                    questions, and recent discussions.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-3 gap-2">
                                    {(
                                        [
                                            {
                                                key: 'flagged',
                                                label: 'Flagged',
                                                count: threadsByFilter.flagged
                                                    .length,
                                            },
                                            {
                                                key: 'unanswered',
                                                label: 'Unanswered',
                                                count: threadsByFilter
                                                    .unanswered.length,
                                            },
                                            {
                                                key: 'recent',
                                                label: 'Recent',
                                                count: threadsByFilter.recent
                                                    .length,
                                            },
                                        ] as Array<{
                                            key: TeacherInboxFilter;
                                            label: string;
                                            count: number;
                                        }>
                                    ).map((tab) => (
                                        <Button
                                            key={tab.key}
                                            variant={
                                                activeFilter === tab.key
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            className="justify-between"
                                            onClick={() =>
                                                setActiveFilter(tab.key)
                                            }
                                        >
                                            <span>{tab.label}</span>
                                            <Badge variant="secondary">
                                                {tab.count}
                                            </Badge>
                                        </Button>
                                    ))}
                                </div>
                                <Separator />
                                {isLoadingThreads ? (
                                    <div className="py-10 text-center text-sm text-muted-foreground">
                                        Loading moderation threads...
                                    </div>
                                ) : activeThreads.length === 0 ? (
                                    <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                                        No threads in this queue right now.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {activeThreads.map((thread) => (
                                            <button
                                                key={thread.id}
                                                type="button"
                                                onClick={() =>
                                                    setSelectedThreadId(
                                                        thread.id,
                                                    )
                                                }
                                                className={`w-full rounded-xl border p-4 text-left transition-colors ${
                                                    selectedThreadId ===
                                                    thread.id
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-border hover:border-primary/40 hover:bg-muted/30'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="space-y-1">
                                                        <p className="font-medium">
                                                            {thread.title}
                                                        </p>
                                                        <p className="line-clamp-2 text-sm text-muted-foreground">
                                                            {thread.content}
                                                        </p>
                                                    </div>
                                                    {thread.isFlagged && (
                                                        <Badge
                                                            variant="destructive"
                                                            className="shrink-0"
                                                        >
                                                            <Flag className="mr-1 h-3 w-3" />
                                                            Flagged
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                    <span>
                                                        {thread.author.name}
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        {thread.replyCount}{' '}
                                                        replies
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        {formatRelativeTime(
                                                            thread.createdAt,
                                                        )}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="space-y-2">
                                        <CardTitle>
                                            {focusThread?.title ??
                                                'Select a thread'}
                                        </CardTitle>
                                        <CardDescription>
                                            {focusThread
                                                ? `Opened ${formatRelativeTime(
                                                      focusThread.createdAt,
                                                  )} by ${focusThread.author.name}.`
                                                : 'Choose a thread from the queue to inspect replies and moderate it.'}
                                        </CardDescription>
                                    </div>
                                    {focusThread && (
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    void withThreadAction(
                                                        focusThread.id,
                                                        () =>
                                                            focusThread.isPinned
                                                                ? forumApi.unpinThread(
                                                                      focusThread.id,
                                                                  )
                                                                : forumApi.pinThread(
                                                                      focusThread.id,
                                                                  ),
                                                        focusThread.isPinned
                                                            ? 'Thread unpinned.'
                                                            : 'Thread pinned.',
                                                    )
                                                }
                                                disabled={
                                                    actionThreadId ===
                                                    focusThread.id
                                                }
                                            >
                                                <Pin className="mr-2 h-4 w-4" />
                                                {focusThread.isPinned
                                                    ? 'Unpin'
                                                    : 'Pin'}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    void withThreadAction(
                                                        focusThread.id,
                                                        () =>
                                                            focusThread.isLocked
                                                                ? forumApi.unlockThread(
                                                                      focusThread.id,
                                                                  )
                                                                : forumApi.lockThread(
                                                                      focusThread.id,
                                                                  ),
                                                        focusThread.isLocked
                                                            ? 'Thread unlocked.'
                                                            : 'Thread locked.',
                                                    )
                                                }
                                                disabled={
                                                    actionThreadId ===
                                                    focusThread.id
                                                }
                                            >
                                                {focusThread.isLocked ? (
                                                    <Unlock className="mr-2 h-4 w-4" />
                                                ) : (
                                                    <Lock className="mr-2 h-4 w-4" />
                                                )}
                                                {focusThread.isLocked
                                                    ? 'Unlock'
                                                    : 'Lock'}
                                            </Button>
                                            {focusThread.isFlagged && (
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        void withThreadAction(
                                                            focusThread.id,
                                                            () =>
                                                                forumApi.resolveThreadFlag(
                                                                    focusThread.id,
                                                                ),
                                                            'Thread flag resolved.',
                                                        )
                                                    }
                                                    disabled={
                                                        actionThreadId ===
                                                        focusThread.id
                                                    }
                                                >
                                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                                    Resolve Flag
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {!focusThread ? (
                                    <div className="rounded-lg border border-dashed p-8 text-sm text-muted-foreground">
                                        The selected queue is empty right now.
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex flex-wrap gap-2">
                                            {focusThread.isPinned && (
                                                <Badge variant="secondary">
                                                    Pinned
                                                </Badge>
                                            )}
                                            {focusThread.isLocked && (
                                                <Badge variant="secondary">
                                                    Locked
                                                </Badge>
                                            )}
                                            {focusThread.isFlagged && (
                                                <Badge variant="destructive">
                                                    Flagged
                                                </Badge>
                                            )}
                                            {focusThread.status ===
                                                'resolved' && (
                                                <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10">
                                                    Resolved
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="rounded-xl border bg-muted/20 p-5">
                                            <p className="text-sm leading-6 whitespace-pre-wrap text-foreground">
                                                {focusThread.content}
                                            </p>
                                        </div>
                                        {selectedThreadSummary?.trainingPath && (
                                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                                <span>
                                                    {
                                                        selectedThreadSummary
                                                            .trainingPath.title
                                                    }
                                                </span>
                                                {selectedThreadSummary.trainingUnit && (
                                                    <>
                                                        <span>•</span>
                                                        <span>
                                                            {
                                                                selectedThreadSummary
                                                                    .trainingUnit
                                                                    .title
                                                            }
                                                        </span>
                                                    </>
                                                )}
                                                <span>•</span>
                                                <Link
                                                    href={`/forum/threads/${focusThread.id}`}
                                                    className="inline-flex items-center gap-1 text-primary hover:underline"
                                                >
                                                    View Public Thread
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                </Link>
                                            </div>
                                        )}
                                        <Separator />
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h2 className="font-semibold">
                                                    Replies
                                                </h2>
                                                <span className="text-sm text-muted-foreground">
                                                    {focusThread.replyCount}{' '}
                                                    total
                                                </span>
                                            </div>
                                            {isLoadingThread ? (
                                                <div className="py-8 text-center text-sm text-muted-foreground">
                                                    Loading replies...
                                                </div>
                                            ) : selectedThread?.replies &&
                                              selectedThread.replies.length >
                                                  0 ? (
                                                <div className="space-y-4">
                                                    {selectedThread.replies.map(
                                                        (reply) => (
                                                            <ReplyItem
                                                                key={reply.id}
                                                                reply={reply}
                                                                onMarkAnswer={
                                                                    handleMarkAnswer
                                                                }
                                                                actionReplyId={
                                                                    actionReplyId
                                                                }
                                                            />
                                                        ),
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                                                    No replies yet.
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
