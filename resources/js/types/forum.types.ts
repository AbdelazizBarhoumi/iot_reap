/**
 * Discussion Forum types for lesson and course discussions
 */
export type ThreadStatus = 'open' | 'resolved' | 'pinned' | 'locked';
export interface ThreadAuthor {
    id: number;
    name: string;
    avatar?: string;
    role: 'student' | 'teacher' | 'admin';
    badge?: string;
}
export interface ThreadReply {
    id: string;
    threadId: string;
    content: string;
    author: ThreadAuthor;
    upvotes: number;
    hasUpvoted: boolean;
    isAnswer?: boolean;
    isFlagged?: boolean;
    parentId?: string;
    replies?: ThreadReply[];
    createdAt: string;
    updatedAt: string;
}
export interface DiscussionThread {
    id: string;
    lessonId?: number;
    courseId: number;
    title: string;
    content: string;
    author: ThreadAuthor;
    status: ThreadStatus;
    upvotes: number;
    hasUpvoted: boolean;
    replyCount: number;
    viewCount: number;
    lastReplyAt?: string;
    lastReplyBy?: ThreadAuthor;
    tags?: string[];
    isPinned: boolean;
    isLocked: boolean;
    isFlagged: boolean;
    replies?: ThreadReply[];
    createdAt: string;
    updatedAt: string;
}
export interface ForumFilters {
    status?: ThreadStatus;
    sortBy?: 'recent' | 'popular' | 'unanswered';
    search?: string;
}

