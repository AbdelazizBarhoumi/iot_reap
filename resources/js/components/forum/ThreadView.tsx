/**
 * Thread View Component
 *
 * Full thread view with:
 * - Thread details and content
 * - Status management (lock, pin, resolve)
 * - Reply composer
 * - Nested replies
 * - Breadcrumb navigation
 */
import { motion } from 'framer-motion';
import {
    ArrowUp,
    ArrowLeft,
    MessageSquare,
    Eye,
    Clock,
    Pin,
    Lock,
    CheckCircle2,
    Flag,
    Share2,
    Bookmark,
    MoreHorizontal,
    Edit2,
    Trash2,
    Send,
} from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type {
    DiscussionThread,
} from '@/types/forum.types';
import { ThreadReply } from './ThreadReply';
interface ThreadViewProps {
    thread: DiscussionThread;
    currentUserId?: number;
    onBack?: () => void;
    onUpvote?: (threadId: string) => void;
    onUpvoteReply?: (replyId: string) => void;
    onReply?: (content: string, parentId?: string) => void;
    onMarkAnswer?: (replyId: string) => void;
    onPin?: (threadId: string) => void;
    onLock?: (threadId: string) => void;
    onResolve?: (threadId: string) => void;
    onFlag?: (threadId: string) => void;
    onEdit?: (threadId: string) => void;
    onDelete?: (threadId: string) => void;
}
// Format relative time
function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}
export function ThreadView({
    thread,
    currentUserId,
    onBack,
    onUpvote,
    onUpvoteReply,
    onReply,
    onMarkAnswer,
    onPin,
    onLock,
    onResolve,
    onFlag,
    onEdit,
    onDelete,
}: ThreadViewProps) {
    const [replyContent, setReplyContent] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isAuthor = thread.author.id === currentUserId;
    const canModerate =
        thread.author.role === 'teacher' || thread.author.role === 'admin';
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };
    const roleBadgeStyles: Record<string, string> = {
        teacher: 'bg-primary/10 text-primary border-primary/20',
        admin: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
        student: '',
    };
    const handleSubmitReply = async () => {
        if (!replyContent.trim()) return;
        setIsSubmitting(true);
        try {
            await onReply?.(replyContent, replyingTo || undefined);
            setReplyContent('');
            setReplyingTo(null);
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleReplyToReply = (replyId: string) => {
        setReplyingTo(replyId);
        // Scroll to reply input
        document
            .getElementById('reply-composer')
            ?.scrollIntoView({ behavior: 'smooth' });
    };
    return (
        <div className="space-y-6">
            {/* Back Button */}
            {onBack && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onBack}
                    className="-ml-2 gap-1.5 text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to discussions
                </Button>
            )}
            {/* Thread Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border bg-card p-6"
            >
                {/* Status Badges */}
                <div className="mb-4 flex flex-wrap items-center gap-2">
                    {thread.isPinned && (
                        <Badge
                            variant="outline"
                            className="gap-1 border-primary/30 text-primary"
                        >
                            <Pin className="h-3 w-3" />
                            Pinned
                        </Badge>
                    )}
                    {thread.status === 'resolved' && (
                        <Badge
                            variant="outline"
                            className="gap-1 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                        >
                            <CheckCircle2 className="h-3 w-3" />
                            Resolved
                        </Badge>
                    )}
                    {thread.isLocked && (
                        <Badge
                            variant="outline"
                            className="gap-1 border-muted-foreground/30 text-muted-foreground"
                        >
                            <Lock className="h-3 w-3" />
                            Locked
                        </Badge>
                    )}
                    {thread.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary">
                            {tag}
                        </Badge>
                    ))}
                </div>
                {/* Title */}
                <h1 className="mb-4 font-heading text-2xl font-bold">
                    {thread.title}
                </h1>
                {/* Author & Meta */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage
                                src={thread.author.avatar}
                                alt={thread.author.name}
                            />
                            <AvatarFallback className="bg-primary/10 text-primary">
                                {getInitials(thread.author.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium">
                                    {thread.author.name}
                                </span>
                                {thread.author.role !== 'student' && (
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            'text-xs',
                                            roleBadgeStyles[thread.author.role],
                                        )}
                                    >
                                        {thread.author.role}
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    {formatRelativeTime(thread.createdAt)}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Eye className="h-3.5 w-3.5" />
                                    {thread.viewCount} views
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground"
                        >
                            <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground"
                        >
                            <Bookmark className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    aria-label="Thread options"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {isAuthor && (
                                    <>
                                        <DropdownMenuItem
                                            onClick={() => onEdit?.(thread.id)}
                                        >
                                            <Edit2 className="mr-2 h-4 w-4" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() =>
                                                onDelete?.(thread.id)
                                            }
                                            className="text-destructive focus:text-destructive"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                    </>
                                )}
                                {(isAuthor || canModerate) && (
                                    <>
                                        <DropdownMenuItem
                                            onClick={() =>
                                                onResolve?.(thread.id)
                                            }
                                        >
                                            <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" />
                                            {thread.status === 'resolved'
                                                ? 'Unresolve'
                                                : 'Mark Resolved'}
                                        </DropdownMenuItem>
                                    </>
                                )}
                                {canModerate && (
                                    <>
                                        <DropdownMenuItem
                                            onClick={() => onPin?.(thread.id)}
                                        >
                                            <Pin className="mr-2 h-4 w-4 text-primary" />
                                            {thread.isPinned ? 'Unpin' : 'Pin'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => onLock?.(thread.id)}
                                        >
                                            <Lock className="mr-2 h-4 w-4" />
                                            {thread.isLocked
                                                ? 'Unlock'
                                                : 'Lock'}
                                        </DropdownMenuItem>
                                    </>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => onFlag?.(thread.id)}
                                >
                                    <Flag className="mr-2 h-4 w-4 text-amber-500" />
                                    Report
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                {/* Content */}
                <div className="prose prose-sm dark:prose-invert mb-6 max-w-none">
                    <p className="leading-relaxed whitespace-pre-wrap text-foreground">
                        {thread.content}
                    </p>
                </div>
                {/* Footer Actions */}
                <div className="flex items-center gap-3 border-t pt-4">
                    <Button
                        variant={thread.hasUpvoted ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onUpvote?.(thread.id)}
                        className="gap-1.5"
                    >
                        <ArrowUp
                            className={cn(
                                'h-4 w-4',
                                thread.hasUpvoted && 'fill-current',
                            )}
                        />
                        Upvote ({thread.upvotes})
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            document
                                .getElementById('reply-composer')
                                ?.scrollIntoView({ behavior: 'smooth' })
                        }
                        className="gap-1.5"
                    >
                        <MessageSquare className="h-4 w-4" />
                        Reply ({thread.replyCount})
                    </Button>
                </div>
            </motion.div>
            {/* Replies Section */}
            <div className="space-y-4">
                <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    {thread.replyCount}{' '}
                    {thread.replyCount === 1 ? 'Reply' : 'Replies'}
                </h2>
                {thread.replies && thread.replies.length > 0 ? (
                    <div className="space-y-4">
                        {thread.replies.map((reply) => (
                            <ThreadReply
                                key={reply.id}
                                reply={reply}
                                isThreadOwner={isAuthor}
                                currentUserId={currentUserId}
                                onUpvote={onUpvoteReply}
                                onReply={handleReplyToReply}
                                onMarkAnswer={onMarkAnswer}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="py-8 text-center text-muted-foreground">
                        <MessageSquare className="mx-auto mb-3 h-10 w-10 opacity-50" />
                        <p>No replies yet. Be the first to respond!</p>
                    </div>
                )}
            </div>
            {/* Reply Composer */}
            {!thread.isLocked && (
                <motion.div
                    id="reply-composer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border bg-card p-4"
                >
                    <h3 className="mb-3 font-medium">
                        {replyingTo ? 'Reply to comment' : 'Add your reply'}
                    </h3>
                    {replyingTo && (
                        <div className="mb-3 flex items-center justify-between rounded-lg bg-muted/50 p-2">
                            <span className="text-sm text-muted-foreground">
                                Replying to a comment
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setReplyingTo(null)}
                                className="h-6 px-2 text-xs"
                            >
                                Cancel
                            </Button>
                        </div>
                    )}
                    <Textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write your reply... Use markdown for formatting."
                        className="mb-3 min-h-[120px] resize-none"
                    />
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                            Markdown supported
                        </span>
                        <Button
                            onClick={handleSubmitReply}
                            disabled={!replyContent.trim() || isSubmitting}
                            className="gap-1.5"
                        >
                            <Send className="h-4 w-4" />
                            {isSubmitting ? 'Posting...' : 'Post Reply'}
                        </Button>
                    </div>
                </motion.div>
            )}
            {thread.isLocked && (
                <div className="rounded-xl border bg-muted/50 p-4 text-center text-muted-foreground">
                    <Lock className="mx-auto mb-2 h-6 w-6" />
                    <p className="font-medium">This discussion is locked</p>
                    <p className="text-sm">New replies are not allowed.</p>
                </div>
            )}
        </div>
    );
}


