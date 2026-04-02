/**
 * Thread Reply Component
 *
 * Displays a single reply in a thread with:
 * - Author info and role badge
 * - Reply content with markdown support
 * - Upvote button
 * - Accept as answer (for thread owner)
 * - Nested replies support
 * - Flag/report functionality
 */
import { motion } from 'framer-motion';
import {
    ArrowUp,
    CheckCircle2,
    Flag,
    MoreHorizontal,
    MessageSquare,
    Reply,
    Trash2,
    Edit2,
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
import { cn } from '@/lib/utils';
import type { ThreadReply as ThreadReplyType } from '@/types/forum.types';
interface ThreadReplyProps {
    reply: ThreadReplyType;
    isThreadOwner?: boolean;
    currentUserId?: number;
    depth?: number;
    maxDepth?: number;
    onUpvote?: (replyId: string) => void;
    onReply?: (replyId: string) => void;
    onMarkAnswer?: (replyId: string) => void;
    onFlag?: (replyId: string) => void;
    onEdit?: (replyId: string) => void;
    onDelete?: (replyId: string) => void;
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
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}
export function ThreadReply({
    reply,
    isThreadOwner = false,
    currentUserId,
    depth = 0,
    maxDepth = 3,
    onUpvote,
    onReply,
    onMarkAnswer,
    onFlag,
    onEdit,
    onDelete,
}: ThreadReplyProps) {
    const [showReplies, setShowReplies] = useState(true);
    const isAuthor = reply.author.id === currentUserId;
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
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                'relative',
                depth > 0 && 'ml-8 border-l-2 border-border/50 pl-4',
            )}
        >
            <div
                className={cn(
                    'rounded-xl p-4 transition-colors',
                    reply.isAnswer
                        ? 'border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20'
                        : 'bg-muted/30 hover:bg-muted/50',
                    reply.isFlagged &&
                        'border border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20',
                )}
            >
                {/* Answer Badge */}
                {reply.isAnswer && (
                    <div className="mb-3 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm font-medium">
                            Accepted Answer
                        </span>
                    </div>
                )}
                {/* Header */}
                <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage
                                src={reply.author.avatar}
                                alt={reply.author.name}
                            />
                            <AvatarFallback className="bg-primary/10 text-xs text-primary">
                                {getInitials(reply.author.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                    {reply.author.name}
                                </span>
                                {reply.author.role !== 'student' && (
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            'px-1.5 py-0 text-[10px]',
                                            roleBadgeStyles[reply.author.role],
                                        )}
                                    >
                                        {reply.author.role}
                                    </Badge>
                                )}
                                {reply.author.badge && (
                                    <Badge
                                        variant="secondary"
                                        className="px-1.5 py-0 text-[10px]"
                                    >
                                        {reply.author.badge}
                                    </Badge>
                                )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {formatRelativeTime(reply.createdAt)}
                                {reply.updatedAt !== reply.createdAt &&
                                    ' (edited)'}
                            </span>
                        </div>
                    </div>
                    {/* Actions Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                aria-label="Reply options"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {isAuthor && (
                                <>
                                    <DropdownMenuItem
                                        onClick={() => onEdit?.(reply.id)}
                                    >
                                        <Edit2 className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => onDelete?.(reply.id)}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                </>
                            )}
                            {isThreadOwner && !reply.isAnswer && (
                                <DropdownMenuItem
                                    onClick={() => onMarkAnswer?.(reply.id)}
                                >
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" />
                                    Mark as Answer
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                                onClick={() => onFlag?.(reply.id)}
                            >
                                <Flag className="mr-2 h-4 w-4 text-amber-500" />
                                Report
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                {/* Content */}
                <div className="prose prose-sm dark:prose-invert mb-3 max-w-none">
                    <p className="text-sm whitespace-pre-wrap text-foreground">
                        {reply.content}
                    </p>
                </div>
                {/* Footer Actions */}
                <div className="flex items-center gap-2 border-t border-border/50 pt-2">
                    {/* Upvote */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUpvote?.(reply.id)}
                        className={cn(
                            'h-7 gap-1.5 px-2',
                            reply.hasUpvoted
                                ? 'text-primary hover:text-primary/80'
                                : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        <ArrowUp
                            className={cn(
                                'h-3.5 w-3.5',
                                reply.hasUpvoted && 'fill-current',
                            )}
                        />
                        <span className="text-xs">{reply.upvotes}</span>
                    </Button>
                    {/* Reply */}
                    {depth < maxDepth && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onReply?.(reply.id)}
                            className="h-7 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
                        >
                            <Reply className="h-3.5 w-3.5" />
                            <span className="text-xs">Reply</span>
                        </Button>
                    )}
                </div>
            </div>
            {/* Nested Replies */}
            {reply.replies && reply.replies.length > 0 && (
                <div className="mt-3">
                    {reply.replies.length > 2 && !showReplies ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowReplies(true)}
                            className="ml-4 text-muted-foreground"
                        >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Show {reply.replies.length} more{' '}
                            {reply.replies.length === 1 ? 'reply' : 'replies'}
                        </Button>
                    ) : (
                        <div className="mt-3 space-y-3">
                            {reply.replies.map((childReply) => (
                                <ThreadReply
                                    key={childReply.id}
                                    reply={childReply}
                                    isThreadOwner={isThreadOwner}
                                    currentUserId={currentUserId}
                                    depth={depth + 1}
                                    maxDepth={maxDepth}
                                    onUpvote={onUpvote}
                                    onReply={onReply}
                                    onMarkAnswer={onMarkAnswer}
                                    onFlag={onFlag}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
}


