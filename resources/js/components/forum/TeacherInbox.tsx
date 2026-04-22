/**
 * Teacher Forum Inbox Component
 *
 * Dashboard for teachers to manage forum activity:
 * - Flagged posts needing review
 * - Unanswered questions
 * - Recent activity in their trainingPaths
 * - Quick actions (pin, lock, resolve)
 */
import { motion } from 'framer-motion';
import {
    Inbox,
    Flag,
    HelpCircle,
    Clock,
    CheckCircle2,
    Pin,
    Lock,
    Unlock,
    MessageSquare,
    ArrowRight,
    RefreshCw,
} from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { DiscussionThread } from '@/types/forum.types';
interface TeacherInboxProps {
    flaggedThreads: DiscussionThread[];
    unansweredThreads: DiscussionThread[];
    recentThreads: DiscussionThread[];
    onViewThread?: (
        threadId: string,
        trainingPathId: string,
        filter: 'flagged' | 'unanswered' | 'recent',
    ) => void;
    onResolveFlag?: (threadId: string) => void;
    onPinThread?: (threadId: string) => void;
    onUnpinThread?: (threadId: string) => void;
    onLockThread?: (threadId: string) => void;
    onUnlockThread?: (threadId: string) => void;
    onRefresh?: () => void;
    isLoading?: boolean;
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
function getInitials(name: string) {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}
interface ThreadItemProps {
    thread: DiscussionThread;
    onView?: () => void;
    onAction?: () => void;
    actionLabel?: string;
    actionIcon?: typeof Flag;
    onSecondaryAction?: () => void;
    secondaryActionLabel?: string;
    secondaryActionIcon?: typeof Lock;
    showFlag?: boolean;
}
function ThreadItem({
    thread,
    onView,
    onAction,
    actionLabel,
    actionIcon: ActionIcon,
    onSecondaryAction,
    secondaryActionLabel,
    secondaryActionIcon: SecondaryActionIcon,
    showFlag = false,
}: ThreadItemProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="group flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
        >
            <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage
                    src={thread.author.avatar}
                    alt={thread.author.name}
                />
                <AvatarFallback className="bg-primary/10 text-xs text-primary">
                    {getInitials(thread.author.name)}
                </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                    <button
                        onClick={onView}
                        className="truncate text-sm font-medium text-foreground transition-colors hover:text-primary"
                    >
                        {thread.title}
                    </button>
                    {showFlag && thread.isFlagged && (
                        <Badge
                            variant="outline"
                            className="shrink-0 border-amber-500/30 px-1.5 py-0 text-[10px] text-amber-600"
                        >
                            <Flag className="mr-1 h-2.5 w-2.5" />
                            Flagged
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{thread.author.name}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(thread.createdAt)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {thread.replyCount}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                {onAction && ActionIcon && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onAction}
                        className="h-7 px-2 text-xs"
                    >
                        <ActionIcon className="mr-1 h-3.5 w-3.5" />
                        {actionLabel}
                    </Button>
                )}
                {onSecondaryAction && SecondaryActionIcon && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onSecondaryAction}
                        className="h-7 px-2 text-xs"
                    >
                        <SecondaryActionIcon className="mr-1 h-3.5 w-3.5" />
                        {secondaryActionLabel}
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onView}
                    className="h-7 w-7 p-0"
                >
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </motion.div>
    );
}
export function TeacherInbox({
    flaggedThreads,
    unansweredThreads,
    recentThreads,
    onViewThread,
    onResolveFlag,
    onPinThread,
    onUnpinThread,
    onLockThread,
    onUnlockThread,
    onRefresh,
    isLoading = false,
}: TeacherInboxProps) {
    const [activeTab, setActiveTab] = useState('flagged');
    const totalItems = flaggedThreads.length + unansweredThreads.length;
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                            <Inbox className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">
                                Forum Inbox
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                                {totalItems > 0
                                    ? `${totalItems} items need attention`
                                    : 'All caught up!'}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onRefresh}
                        disabled={isLoading}
                        className="text-muted-foreground"
                    >
                        <RefreshCw
                            className={cn(
                                'h-4 w-4',
                                isLoading && 'animate-spin',
                            )}
                        />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4 grid w-full grid-cols-3">
                        <TabsTrigger
                            value="flagged"
                            className="gap-1.5 text-xs"
                        >
                            <Flag className="h-3.5 w-3.5" />
                            Flagged
                            {flaggedThreads.length > 0 && (
                                <Badge
                                    variant="destructive"
                                    className="ml-1 h-4 px-1 text-[10px]"
                                >
                                    {flaggedThreads.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger
                            value="unanswered"
                            className="gap-1.5 text-xs"
                        >
                            <HelpCircle className="h-3.5 w-3.5" />
                            Unanswered
                            {unansweredThreads.length > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="ml-1 h-4 px-1 text-[10px]"
                                >
                                    {unansweredThreads.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="recent" className="gap-1.5 text-xs">
                            <Clock className="h-3.5 w-3.5" />
                            Recent
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="flagged" className="mt-0">
                        {flaggedThreads.length > 0 ? (
                            <div className="divide-y divide-border/50">
                                {flaggedThreads.map((thread) => (
                                    <ThreadItem
                                        key={thread.id}
                                        thread={thread}
                                        onView={() =>
                                            onViewThread?.(
                                                thread.id,
                                                String(thread.trainingPathId),
                                                'flagged',
                                            )
                                        }
                                        onAction={() =>
                                            onResolveFlag?.(thread.id)
                                        }
                                        actionLabel="Resolve"
                                        actionIcon={CheckCircle2}
                                        onSecondaryAction={() =>
                                            thread.isLocked
                                                ? onUnlockThread?.(thread.id)
                                                : onLockThread?.(thread.id)
                                        }
                                        secondaryActionLabel={
                                            thread.isLocked ? 'Unlock' : 'Lock'
                                        }
                                        secondaryActionIcon={
                                            thread.isLocked ? Unlock : Lock
                                        }
                                        showFlag
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-500/50" />
                                <p className="text-sm text-muted-foreground">
                                    No flagged posts
                                </p>
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="unanswered" className="mt-0">
                        {unansweredThreads.length > 0 ? (
                            <div className="divide-y divide-border/50">
                                {unansweredThreads.map((thread) => (
                                    <ThreadItem
                                        key={thread.id}
                                        thread={thread}
                                        onView={() =>
                                            onViewThread?.(
                                                thread.id,
                                                String(thread.trainingPathId),
                                                'unanswered',
                                            )
                                        }
                                        onAction={() =>
                                            thread.isPinned
                                                ? onUnpinThread?.(thread.id)
                                                : onPinThread?.(thread.id)
                                        }
                                        actionLabel={
                                            thread.isPinned ? 'Unpin' : 'Pin'
                                        }
                                        actionIcon={Pin}
                                        onSecondaryAction={() =>
                                            thread.isLocked
                                                ? onUnlockThread?.(thread.id)
                                                : onLockThread?.(thread.id)
                                        }
                                        secondaryActionLabel={
                                            thread.isLocked ? 'Unlock' : 'Lock'
                                        }
                                        secondaryActionIcon={
                                            thread.isLocked ? Unlock : Lock
                                        }
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-500/50" />
                                <p className="text-sm text-muted-foreground">
                                    All questions answered!
                                </p>
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="recent" className="mt-0">
                        {recentThreads.length > 0 ? (
                            <div className="divide-y divide-border/50">
                                {recentThreads.map((thread) => (
                                    <ThreadItem
                                        key={thread.id}
                                        thread={thread}
                                        onView={() =>
                                            onViewThread?.(
                                                thread.id,
                                                String(thread.trainingPathId),
                                                'recent',
                                            )
                                        }
                                        onAction={() =>
                                            thread.isPinned
                                                ? onUnpinThread?.(thread.id)
                                                : onPinThread?.(thread.id)
                                        }
                                        actionLabel={
                                            thread.isPinned ? 'Unpin' : 'Pin'
                                        }
                                        actionIcon={Pin}
                                        onSecondaryAction={() =>
                                            thread.isLocked
                                                ? onUnlockThread?.(thread.id)
                                                : onLockThread?.(thread.id)
                                        }
                                        secondaryActionLabel={
                                            thread.isLocked ? 'Unlock' : 'Lock'
                                        }
                                        secondaryActionIcon={
                                            thread.isLocked ? Unlock : Lock
                                        }
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <MessageSquare className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
                                <p className="text-sm text-muted-foreground">
                                    No recent discussions
                                </p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
