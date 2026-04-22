import { Head } from '@inertiajs/react';
import { MessageSquareWarning, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { forumApi } from '@/api/forum.api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { getHttpErrorMessage } from '@/lib/http-errors';
import AppLayout from '@/layouts/app-layout';
import type { DiscussionThread, ThreadReply } from '@/types/forum.types';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'Forum Moderation', href: '/admin/forum/flagged' },
];

interface ModerationPagination {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

export default function ForumModerationPage() {
    const [flaggedThreads, setFlaggedThreads] = useState<DiscussionThread[]>([]);
    const [flaggedReplies, setFlaggedReplies] = useState<ThreadReply[]>([]);
    const [threadMeta, setThreadMeta] = useState<ModerationPagination>({
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0,
    });
    const [replyMeta, setReplyMeta] = useState<ModerationPagination>({
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0,
    });
    const [threadPage, setThreadPage] = useState(1);
    const [replyPage, setReplyPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [actionKey, setActionKey] = useState<string | null>(null);

    const loadModerationData = useCallback(async () => {
        setLoading(true);

        try {
            const [threadsResponse, repliesResponse] = await Promise.all([
                forumApi.getFlaggedThreadsForAdmin(threadPage),
                forumApi.getFlaggedRepliesForAdmin(replyPage),
            ]);

            setFlaggedThreads(threadsResponse.data);
            setThreadMeta(threadsResponse.pagination);
            setFlaggedReplies(repliesResponse.data);
            setReplyMeta(repliesResponse.pagination);
        } catch (error) {
            toast.error(
                getHttpErrorMessage(error, 'Failed to load forum moderation data'),
            );
        } finally {
            setLoading(false);
        }
    }, [replyPage, threadPage]);

    useEffect(() => {
        void loadModerationData();
    }, [loadModerationData]);

    const handleUnflagThread = async (threadId: string) => {
        setActionKey(`thread-${threadId}`);
        try {
            await forumApi.unflagThreadAsAdmin(threadId);
            toast.success('Thread unflagged');
            await loadModerationData();
        } catch (error) {
            toast.error(getHttpErrorMessage(error, 'Failed to unflag thread'));
        } finally {
            setActionKey(null);
        }
    };

    const handleUnflagReply = async (replyId: string) => {
        setActionKey(`reply-${replyId}`);
        try {
            await forumApi.unflagReplyAsAdmin(replyId);
            toast.success('Reply unflagged');
            await loadModerationData();
        } catch (error) {
            toast.error(getHttpErrorMessage(error, 'Failed to unflag reply'));
        } finally {
            setActionKey(null);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Forum Moderation" />

            <div className="container space-y-6 py-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Forum Moderation</h1>
                        <p className="text-muted-foreground">
                            Review flagged forum threads and replies.
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => {
                            void loadModerationData();
                        }}
                        disabled={loading}
                    >
                        <RefreshCw
                            className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                        />
                        Refresh
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <MessageSquareWarning className="h-5 w-5" />
                            Flagged Threads ({threadMeta.total})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Author</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {flaggedThreads.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                                            No flagged threads.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    flaggedThreads.map((thread) => (
                                        <TableRow key={thread.id}>
                                            <TableCell>
                                                <div className="max-w-[340px]">
                                                    <p className="truncate font-medium">{thread.title}</p>
                                                    <p className="truncate text-xs text-muted-foreground">
                                                        {thread.content}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>{thread.author?.name ?? 'Unknown'}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{thread.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {new Date(thread.createdAt).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        void handleUnflagThread(thread.id);
                                                    }}
                                                    disabled={actionKey === `thread-${thread.id}`}
                                                >
                                                    Unflag Thread
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {threadMeta.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Page {threadMeta.current_page} of {threadMeta.last_page}
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setThreadPage((prev) => Math.max(prev - 1, 1))
                                        }
                                        disabled={loading || threadPage <= 1}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setThreadPage((prev) =>
                                                Math.min(prev + 1, threadMeta.last_page),
                                            )
                                        }
                                        disabled={loading || threadPage >= threadMeta.last_page}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">
                            Flagged Replies ({replyMeta.total})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Reply</TableHead>
                                    <TableHead>Author</TableHead>
                                    <TableHead>Thread ID</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {flaggedReplies.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                                            No flagged replies.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    flaggedReplies.map((reply) => (
                                        <TableRow key={reply.id}>
                                            <TableCell>
                                                <p className="max-w-[420px] truncate text-sm">
                                                    {reply.content}
                                                </p>
                                            </TableCell>
                                            <TableCell>{reply.author?.name ?? 'Unknown'}</TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">
                                                {reply.threadId}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {new Date(reply.createdAt).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        void handleUnflagReply(reply.id);
                                                    }}
                                                    disabled={actionKey === `reply-${reply.id}`}
                                                >
                                                    Unflag Reply
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {replyMeta.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Page {replyMeta.current_page} of {replyMeta.last_page}
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setReplyPage((prev) => Math.max(prev - 1, 1))
                                        }
                                        disabled={loading || replyPage <= 1}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setReplyPage((prev) =>
                                                Math.min(prev + 1, replyMeta.last_page),
                                            )
                                        }
                                        disabled={loading || replyPage >= replyMeta.last_page}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
