import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    ArrowUp,
    CheckCircle2,
    Flag,
    Lock,
    MessageSquare,
    Send,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { forumApi } from '@/api/forum.api';
import { ThreadReply } from '@/components/forum/ThreadReply';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';
import type {
    DiscussionThread,
    ThreadReply as ThreadReplyType,
} from '@/types/forum.types';

interface PageProps extends Record<string, unknown> {
    auth?: {
        user?: {
            id: number;
        } | null;
    };
}

interface ForumThreadPageProps {
    thread: DiscussionThread;
}

function formatRelativeTime(dateString: string): string {
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

function updateReplies(
    replies: ThreadReplyType[],
    replyId: string,
    updater: (reply: ThreadReplyType) => ThreadReplyType,
): ThreadReplyType[] {
    return replies.map((reply) => {
        if (reply.id === replyId) {
            return updater(reply);
        }

        if (reply.replies && reply.replies.length > 0) {
            return {
                ...reply,
                replies: updateReplies(reply.replies, replyId, updater),
            };
        }

        return reply;
    });
}

export default function ForumThreadPage({
    thread: initialThread,
}: ForumThreadPageProps) {
    const { auth } = usePage<PageProps>().props;
    const [thread, setThread] = useState(initialThread);
    const [replyContent, setReplyContent] = useState('');
    const [replyLoading, setReplyLoading] = useState(false);
    const [threadActionLoading, setThreadActionLoading] = useState(false);

    const currentUserId = auth?.user?.id ?? null;
    const isAuthenticated = !!currentUserId;
    const canReply = isAuthenticated && !thread.isLocked;
    const backHref = thread.trainingPath
        ? `/trainingPaths/${thread.trainingPath.id}`
        : '/trainingPaths';

    const breadcrumbs: BreadcrumbItem[] = useMemo(() => {
        const items: BreadcrumbItem[] = [
            { title: 'Training Paths', href: '/trainingPaths' },
        ];

        if (thread.trainingPath) {
            items.push({
                title: thread.trainingPath.title,
                href: `/trainingPaths/${thread.trainingPath.id}`,
            });
        }

        items.push({
            title: 'Discussion',
            href: `/forum/threads/${thread.id}`,
        });

        return items;
    }, [thread.id, thread.trainingPath]);

    const handleUpvoteThread = async () => {
        if (!isAuthenticated) {
            toast.error('Sign in to upvote discussions.');
            return;
        }

        setThreadActionLoading(true);

        try {
            const result = await forumApi.upvoteThread(thread.id);
            setThread((current) => ({
                ...current,
                upvotes: result.upvote_count,
                hasUpvoted: result.upvoted,
            }));
        } catch {
            toast.error('Unable to upvote this thread right now.');
        } finally {
            setThreadActionLoading(false);
        }
    };

    const handleFlagThread = async () => {
        if (!isAuthenticated) {
            toast.error('Sign in to report discussions.');
            return;
        }

        setThreadActionLoading(true);

        try {
            await forumApi.flagThread(thread.id);
            setThread((current) => ({
                ...current,
                isFlagged: true,
            }));
            toast.success('Thread reported for review.');
        } catch {
            toast.error('Unable to report this thread right now.');
        } finally {
            setThreadActionLoading(false);
        }
    };

    const handleReply = async () => {
        const content = replyContent.trim();

        if (!content) {
            toast.error('Write a reply before posting.');
            return;
        }

        setReplyLoading(true);

        try {
            const reply = await forumApi.replyToThread(thread.id, { content });
            setThread((current) => ({
                ...current,
                replyCount: current.replyCount + 1,
                replies: [...(current.replies ?? []), reply],
                lastReplyAt: reply.createdAt,
                lastReplyBy: reply.author,
            }));
            setReplyContent('');
            toast.success('Reply posted.');
        } catch {
            toast.error('Unable to post your reply right now.');
        } finally {
            setReplyLoading(false);
        }
    };

    const handleUpvoteReply = async (replyId: string) => {
        if (!isAuthenticated) {
            toast.error('Sign in to upvote replies.');
            return;
        }

        try {
            const result = await forumApi.upvoteReply(replyId);
            setThread((current) => ({
                ...current,
                replies: updateReplies(
                    current.replies ?? [],
                    replyId,
                    (reply) => ({
                        ...reply,
                        upvotes: result.upvote_count,
                        hasUpvoted: result.upvoted,
                    }),
                ),
            }));
        } catch {
            toast.error('Unable to upvote this reply right now.');
        }
    };

    const handleFlagReply = async (replyId: string) => {
        if (!isAuthenticated) {
            toast.error('Sign in to report replies.');
            return;
        }

        try {
            await forumApi.flagReply(replyId);
            setThread((current) => ({
                ...current,
                replies: updateReplies(
                    current.replies ?? [],
                    replyId,
                    (reply) => ({
                        ...reply,
                        isFlagged: true,
                    }),
                ),
            }));
            toast.success('Reply reported for review.');
        } catch {
            toast.error('Unable to report this reply right now.');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={thread.title} />

            <div className="min-h-screen bg-gradient-to-b from-muted/20 to-background">
                <div className="container max-w-5xl py-8">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={backHref}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                    </Button>

                    <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                        <div className="space-y-6">
                            <Card>
                                <CardHeader className="space-y-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {thread.isPinned && (
                                            <Badge variant="secondary">
                                                Pinned
                                            </Badge>
                                        )}
                                        {thread.isLocked && (
                                            <Badge variant="secondary">
                                                <Lock className="mr-1 h-3 w-3" />
                                                Locked
                                            </Badge>
                                        )}
                                        {thread.isFlagged && (
                                            <Badge variant="destructive">
                                                Flagged
                                            </Badge>
                                        )}
                                        {thread.status === 'resolved' && (
                                            <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10">
                                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                                Resolved
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <CardTitle className="text-2xl">
                                            {thread.title}
                                        </CardTitle>
                                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                            <span>{thread.author.name}</span>
                                            <span>•</span>
                                            <span>
                                                {formatRelativeTime(
                                                    thread.createdAt,
                                                )}
                                            </span>
                                            {thread.trainingUnit && (
                                                <>
                                                    <span>•</span>
                                                    <span>
                                                        {
                                                            thread.trainingUnit
                                                                .title
                                                        }
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-6">
                                    <div className="rounded-xl border bg-muted/20 p-5">
                                        <p className="leading-7 whitespace-pre-wrap text-foreground">
                                            {thread.content}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                void handleUpvoteThread()
                                            }
                                            disabled={
                                                threadActionLoading ||
                                                !isAuthenticated
                                            }
                                            className={cn(
                                                thread.hasUpvoted &&
                                                    'border-primary text-primary',
                                            )}
                                        >
                                            <ArrowUp
                                                className={cn(
                                                    'mr-2 h-4 w-4',
                                                    thread.hasUpvoted &&
                                                        'fill-current',
                                                )}
                                            />
                                            {thread.upvotes}
                                        </Button>

                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                void handleFlagThread()
                                            }
                                            disabled={
                                                threadActionLoading ||
                                                !isAuthenticated
                                            }
                                        >
                                            <Flag className="mr-2 h-4 w-4" />
                                            Report
                                        </Button>

                                        {!isAuthenticated && (
                                            <Button variant="secondary" asChild>
                                                <Link href="/login">
                                                    Sign in to participate
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MessageSquare className="h-5 w-5 text-primary" />
                                        Replies
                                        <Badge variant="secondary">
                                            {thread.replyCount}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {thread.replies &&
                                    thread.replies.length > 0 ? (
                                        <div className="space-y-4">
                                            {thread.replies.map((reply) => (
                                                <ThreadReply
                                                    key={reply.id}
                                                    reply={reply}
                                                    currentUserId={
                                                        currentUserId ??
                                                        undefined
                                                    }
                                                    onUpvote={
                                                        isAuthenticated
                                                            ? (replyId) =>
                                                                  void handleUpvoteReply(
                                                                      replyId,
                                                                  )
                                                            : undefined
                                                    }
                                                    onFlag={
                                                        isAuthenticated
                                                            ? (replyId) =>
                                                                  void handleFlagReply(
                                                                      replyId,
                                                                  )
                                                            : undefined
                                                    }
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                                            No replies yet.
                                        </div>
                                    )}

                                    <Separator />

                                    {!isAuthenticated ? (
                                        <Alert>
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertTitle>
                                                Read-only for guests
                                            </AlertTitle>
                                            <AlertDescription>
                                                Sign in to reply, upvote, or
                                                report discussion content.
                                            </AlertDescription>
                                        </Alert>
                                    ) : thread.isLocked ? (
                                        <Alert>
                                            <Lock className="h-4 w-4" />
                                            <AlertTitle>
                                                Thread locked
                                            </AlertTitle>
                                            <AlertDescription>
                                                This discussion is read-only
                                                right now, so new replies are
                                                disabled.
                                            </AlertDescription>
                                        </Alert>
                                    ) : (
                                        <div className="space-y-3">
                                            <Textarea
                                                value={replyContent}
                                                onChange={(event) =>
                                                    setReplyContent(
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Share your reply..."
                                                rows={5}
                                            />
                                            <div className="flex justify-end">
                                                <Button
                                                    onClick={() =>
                                                        void handleReply()
                                                    }
                                                    disabled={
                                                        replyLoading ||
                                                        !canReply
                                                    }
                                                >
                                                    <Send className="mr-2 h-4 w-4" />
                                                    {replyLoading
                                                        ? 'Posting...'
                                                        : 'Post Reply'}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        Discussion Context
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm text-muted-foreground">
                                    {thread.trainingPath ? (
                                        <div>
                                            <p className="text-xs tracking-wide uppercase">
                                                Training Path
                                            </p>
                                            <Link
                                                href={`/trainingPaths/${thread.trainingPath.id}`}
                                                className="mt-1 block font-medium text-foreground hover:text-primary"
                                            >
                                                {thread.trainingPath.title}
                                            </Link>
                                        </div>
                                    ) : null}

                                    {thread.trainingUnit ? (
                                        <div>
                                            <p className="text-xs tracking-wide uppercase">
                                                Training Unit
                                            </p>
                                            <p className="mt-1 font-medium text-foreground">
                                                {thread.trainingUnit.title}
                                            </p>
                                        </div>
                                    ) : null}

                                    <Separator />

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span>Replies</span>
                                            <span>{thread.replyCount}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Views</span>
                                            <span>{thread.viewCount}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Upvotes</span>
                                            <span>{thread.upvotes}</span>
                                        </div>
                                        {thread.lastReplyAt && (
                                            <div className="flex items-center justify-between gap-4">
                                                <span>Last activity</span>
                                                <span className="text-right">
                                                    {formatRelativeTime(
                                                        thread.lastReplyAt,
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
