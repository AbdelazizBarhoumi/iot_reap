/**
 * Forum API module for discussion thread and reply operations.
 */
import type { DiscussionThread, ThreadReply } from '@/types/forum.types';
import client from './client';
// ─────────────────────────────────────────────────────────────────────────────
// Response Types
// ─────────────────────────────────────────────────────────────────────────────
interface ThreadsResponse {
    data: DiscussionThread[];
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

interface FlaggedRepliesResponse {
    data: ThreadReply[];
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}
interface ThreadResponse {
    data: DiscussionThread;
    message?: string;
}
interface ReplyResponse {
    data: ThreadReply;
    message?: string;
}
interface UpvoteResponse {
    upvoted: boolean;
    upvote_count: number;
}
interface MessageResponse {
    message: string;
}
// ─────────────────────────────────────────────────────────────────────────────
// Request Types
// ─────────────────────────────────────────────────────────────────────────────
export interface CreateThreadData {
    title: string;
    content: string;
}
export interface CreateReplyData {
    content: string;
    parent_id?: string | null;
}
export type ThreadSort = 'recent' | 'popular' | 'unanswered';
export type ThreadFilter = 'all' | 'open' | 'resolved' | 'pinned';
// ─────────────────────────────────────────────────────────────────────────────
// Thread Operations
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Get threads for a specific trainingUnit.
 */
export async function getTrainingUnitThreads(
    trainingUnitId: number,
    sort: ThreadSort = 'recent',
    filter?: ThreadFilter,
    page = 1,
): Promise<ThreadsResponse> {
    const params = new URLSearchParams({
        sort,
        page: String(page),
    });
    if (filter && filter !== 'all') {
        params.append('filter', filter);
    }
    const response = await client.get<ThreadsResponse>(
        `/forum/trainingUnits/${trainingUnitId}/threads?${params.toString()}`,
    );
    return response.data;
}
/**
 * Get threads for an entire trainingPath.
 */
export async function getTrainingPathThreads(
    trainingPathId: number,
    sort: ThreadSort = 'recent',
    filter?: ThreadFilter,
    page = 1,
): Promise<ThreadsResponse> {
    const params = new URLSearchParams({
        sort,
        page: String(page),
    });
    if (filter && filter !== 'all') {
        params.append('filter', filter);
    }
    const response = await client.get<ThreadsResponse>(
        `/forum/trainingPaths/${trainingPathId}/threads?${params.toString()}`,
    );
    return response.data;
}
/**
 * Get a single thread with its replies.
 */
export async function getThread(threadId: string): Promise<DiscussionThread> {
    const response = await client.get<ThreadResponse>(
        `/forum/threads/${threadId}`,
    );
    return response.data.data;
}
/**
 * Create a new thread in a trainingUnit.
 */
export async function createThread(
    trainingUnitId: number,
    data: CreateThreadData,
): Promise<DiscussionThread> {
    const response = await client.post<ThreadResponse>(
        `/forum/trainingUnits/${trainingUnitId}/threads`,
        data,
    );
    return response.data.data;
}
/**
 * Delete a thread.
 */
export async function deleteThread(threadId: string): Promise<void> {
    await client.delete(`/forum/threads/${threadId}`);
}
// ─────────────────────────────────────────────────────────────────────────────
// Reply Operations
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Reply to a thread.
 */
export async function replyToThread(
    threadId: string,
    data: CreateReplyData,
): Promise<ThreadReply> {
    const response = await client.post<ReplyResponse>(
        `/forum/threads/${threadId}/reply`,
        data,
    );
    return response.data.data;
}
/**
 * Delete a reply.
 */
export async function deleteReply(replyId: string): Promise<void> {
    await client.delete(`/forum/replies/${replyId}`);
}
// ─────────────────────────────────────────────────────────────────────────────
// Voting Operations
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Toggle upvote on a thread.
 */
export async function upvoteThread(threadId: string): Promise<UpvoteResponse> {
    const response = await client.post<UpvoteResponse>(
        `/forum/threads/${threadId}/upvote`,
    );
    return response.data;
}
/**
 * Toggle upvote on a reply.
 */
export async function upvoteReply(replyId: string): Promise<UpvoteResponse> {
    const response = await client.post<UpvoteResponse>(
        `/forum/replies/${replyId}/upvote`,
    );
    return response.data;
}
// ─────────────────────────────────────────────────────────────────────────────
// Flagging Operations
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Flag a thread for review.
 */
export async function flagThread(threadId: string): Promise<MessageResponse> {
    const response = await client.post<MessageResponse>(
        `/forum/threads/${threadId}/flag`,
    );
    return response.data;
}
/**
 * Flag a reply for review.
 */
export async function flagReply(replyId: string): Promise<MessageResponse> {
    const response = await client.post<MessageResponse>(
        `/forum/replies/${replyId}/flag`,
    );
    return response.data;
}
// ─────────────────────────────────────────────────────────────────────────────
// Teacher Operations (require teaching routes)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Get teacher's forum inbox (threads from their trainingPaths).
 */
export async function getTeacherInbox(
    filter?: 'flagged' | 'unanswered' | 'recent',
): Promise<ThreadsResponse> {
    const params = filter ? `?filter=${filter}` : '';
    const response = await client.get<ThreadsResponse>(
        `/teaching/forum/inbox${params}`,
    );
    return response.data;
}
/**
 * Pin a thread (teacher/admin only).
 */
export async function pinThread(threadId: string): Promise<DiscussionThread> {
    const response = await client.post<ThreadResponse>(
        `/teaching/forum/threads/${threadId}/pin`,
    );
    return response.data.data;
}
/**
 * Unpin a thread (teacher/admin only).
 */
export async function unpinThread(threadId: string): Promise<DiscussionThread> {
    const response = await client.post<ThreadResponse>(
        `/teaching/forum/threads/${threadId}/unpin`,
    );
    return response.data.data;
}

/**
 * Resolve a flagged thread (teacher/admin only).
 */
export async function resolveThreadFlag(
    threadId: string,
): Promise<DiscussionThread> {
    const response = await client.post<ThreadResponse>(
        `/teaching/forum/threads/${threadId}/resolve-flag`,
    );
    return response.data.data;
}
/**
 * Lock a thread (teacher/admin only).
 */
export async function lockThread(threadId: string): Promise<DiscussionThread> {
    const response = await client.post<ThreadResponse>(
        `/teaching/forum/threads/${threadId}/lock`,
    );
    return response.data.data;
}
/**
 * Unlock a thread (teacher/admin only).
 */
export async function unlockThread(
    threadId: string,
): Promise<DiscussionThread> {
    const response = await client.post<ThreadResponse>(
        `/teaching/forum/threads/${threadId}/unlock`,
    );
    return response.data.data;
}
/**
 * Mark a reply as the answer (teacher/admin only).
 */
export async function markAsAnswer(replyId: string): Promise<ThreadReply> {
    const response = await client.post<ReplyResponse>(
        `/teaching/forum/replies/${replyId}/answer`,
    );
    return response.data.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin Moderation Operations
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Get flagged threads for admin moderation.
 */
export async function getFlaggedThreadsForAdmin(
    page = 1,
): Promise<ThreadsResponse> {
    const response = await client.get<ThreadsResponse>(
        `/admin/forum/flagged?page=${page}`,
    );

    return response.data;
}

/**
 * Get flagged replies for admin moderation.
 */
export async function getFlaggedRepliesForAdmin(
    page = 1,
): Promise<FlaggedRepliesResponse> {
    const response = await client.get<FlaggedRepliesResponse>(
        `/admin/forum/flagged-replies?page=${page}`,
    );

    return response.data;
}

/**
 * Unflag a thread as admin.
 */
export async function unflagThreadAsAdmin(
    threadId: string,
): Promise<DiscussionThread> {
    const response = await client.post<ThreadResponse>(
        `/admin/forum/threads/${threadId}/unflag`,
    );

    return response.data.data;
}

/**
 * Unflag a reply as admin.
 */
export async function unflagReplyAsAdmin(
    replyId: string,
): Promise<ThreadReply> {
    const response = await client.post<ReplyResponse>(
        `/admin/forum/replies/${replyId}/unflag`,
    );

    return response.data.data;
}
// ─────────────────────────────────────────────────────────────────────────────
// Exported API Object
// ─────────────────────────────────────────────────────────────────────────────
export const forumApi = {
    // Thread operations
    getTrainingUnitThreads,
    getTrainingPathThreads,
    getThread,
    createThread,
    deleteThread,
    // Reply operations
    replyToThread,
    deleteReply,
    // Voting
    upvoteThread,
    upvoteReply,
    // Flagging
    flagThread,
    flagReply,
    // Teacher operations
    getTeacherInbox,
    pinThread,
    unpinThread,
    resolveThreadFlag,
    lockThread,
    unlockThread,
    markAsAnswer,
    // Admin moderation
    getFlaggedThreadsForAdmin,
    getFlaggedRepliesForAdmin,
    unflagThreadAsAdmin,
    unflagReplyAsAdmin,
};
