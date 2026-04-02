/**
 * Discussion Thread Card Component
 *
 * Displays a single discussion thread in a list view with:
 * - Author avatar and info
 * - Title and preview
 * - Status badges (pinned, resolved, locked)
 * - Upvote count and reply count
 * - Last activity timestamp
 */
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    MessageSquare,
    ArrowUp,
    Eye,
    Pin,
    Lock,
    CheckCircle2,
    Flag,
    Clock,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DiscussionThread } from '@/types/forum.types';
interface ThreadCardProps {
    thread: DiscussionThread;
    courseSlug?: string;
    lessonSlug?: string;
    onUpvote?: (threadId: string) => void;
    index?: number;
}
// Format relative time
function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    const weeks = Math.floor(days / 7);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    if (weeks < 4) return `${weeks}w ago`;
    return date.toLocaleDateString();
}
export function ThreadCard({
    thread,
    courseSlug,
    lessonSlug,
    onUpvote,
    index = 0,
}: ThreadCardProps) {
    const threadUrl = lessonSlug
        ? `/courses/${courseSlug}/lessons/${lessonSlug}/discussion/${thread.id}`
        : `/courses/${courseSlug}/discussion/${thread.id}`;
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
        student: 'bg-muted text-muted-foreground',
    };
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
                'group relative rounded-xl border bg-card p-4 transition-all duration-200',
                'hover:border-primary/30 hover:shadow-md',
                thread.isPinned && 'border-primary/20 bg-primary/5',
                thread.isFlagged &&
                    'border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20',
            )}
        >
            <div className="flex gap-4">
                {/* Upvote Section */}
                <div className="flex flex-col items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUpvote?.(thread.id)}
                        className={cn(
                            'h-8 w-8 rounded-lg p-0 transition-colors',
                            thread.hasUpvoted
                                ? 'bg-primary/10 text-primary hover:bg-primary/20'
                                : 'text-muted-foreground hover:bg-muted',
                        )}
                    >
                        <ArrowUp
                            className={cn(
                                'h-4 w-4',
                                thread.hasUpvoted && 'fill-current',
                            )}
                        />
                    </Button>
                    <span
                        className={cn(
                            'text-sm font-medium',
                            thread.hasUpvoted
                                ? 'text-primary'
                                : 'text-muted-foreground',
                        )}
                    >
                        {thread.upvotes}
                    </span>
                </div>
                {/* Content Section */}
                <div className="min-w-0 flex-1">
                    {/* Status Badges */}
                    <div className="mb-2 flex flex-wrap items-center gap-1.5">
                        {thread.isPinned && (
                            <Badge
                                variant="outline"
                                className="gap-1 border-primary/30 text-xs text-primary"
                            >
                                <Pin className="h-3 w-3" />
                                Pinned
                            </Badge>
                        )}
                        {thread.status === 'resolved' && (
                            <Badge
                                variant="outline"
                                className="gap-1 border-emerald-500/30 text-xs text-emerald-600 dark:text-emerald-400"
                            >
                                <CheckCircle2 className="h-3 w-3" />
                                Resolved
                            </Badge>
                        )}
                        {thread.isLocked && (
                            <Badge
                                variant="outline"
                                className="gap-1 border-muted-foreground/30 text-xs text-muted-foreground"
                            >
                                <Lock className="h-3 w-3" />
                                Locked
                            </Badge>
                        )}
                        {thread.isFlagged && (
                            <Badge
                                variant="outline"
                                className="gap-1 border-amber-500/30 text-xs text-amber-600 dark:text-amber-400"
                            >
                                <Flag className="h-3 w-3" />
                                Flagged
                            </Badge>
                        )}
                        {thread.tags?.map((tag) => (
                            <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs"
                            >
                                {tag}
                            </Badge>
                        ))}
                    </div>
                    {/* Title */}
                    <Link href={threadUrl} className="block">
                        <h3 className="line-clamp-1 font-semibold text-foreground transition-colors group-hover:text-primary">
                            {thread.title}
                        </h3>
                    </Link>
                    {/* Preview */}
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {thread.content}
                    </p>
                    {/* Footer */}
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                        {/* Author */}
                        <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                                <AvatarImage
                                    src={thread.author.avatar}
                                    alt={thread.author.name}
                                />
                                <AvatarFallback className="bg-muted text-[10px]">
                                    {getInitials(thread.author.name)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-foreground">
                                {thread.author.name}
                            </span>
                            {thread.author.role !== 'student' && (
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        'px-1.5 py-0 text-[10px]',
                                        roleBadgeStyles[thread.author.role],
                                    )}
                                >
                                    {thread.author.role}
                                </Badge>
                            )}
                        </div>
                        {/* Stats */}
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                                <MessageSquare className="h-3.5 w-3.5" />
                                {thread.replyCount}{' '}
                                {thread.replyCount === 1 ? 'reply' : 'replies'}
                            </span>
                            <span className="flex items-center gap-1">
                                <Eye className="h-3.5 w-3.5" />
                                {thread.viewCount}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {formatRelativeTime(thread.createdAt)}
                            </span>
                        </div>
                    </div>
                    {/* Last Reply */}
                    {thread.lastReplyBy && thread.lastReplyAt && (
                        <div className="mt-2 flex items-center gap-2 border-t border-border/50 pt-2 text-xs text-muted-foreground">
                            <span>Last reply by</span>
                            <Avatar className="h-4 w-4">
                                <AvatarImage
                                    src={thread.lastReplyBy.avatar}
                                    alt={thread.lastReplyBy.name}
                                />
                                <AvatarFallback className="text-[8px]">
                                    {getInitials(thread.lastReplyBy.name)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-foreground">
                                {thread.lastReplyBy.name}
                            </span>
                            <span>•</span>
                            <span>
                                {formatRelativeTime(thread.lastReplyAt)}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}


