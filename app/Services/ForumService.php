<?php

namespace App\Services;

use App\Enums\ThreadStatus;
use App\Models\DiscussionThread;
use App\Models\ThreadReply;
use App\Models\TrainingPath;
use App\Models\TrainingUnit;
use App\Models\User;
use App\Repositories\ForumRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;

/**
 * Service for forum/discussion functionality.
 */
class ForumService
{
    public function __construct(
        private readonly ForumRepository $forumRepository,
        private readonly NotificationService $notificationService,
    ) {}

    // ─────────────────────────────────────────────────────────────────────────
    // Thread Operations
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Get threads for a trainingUnit.
     */
    public function getThreads(
        int $trainingUnitId,
        string $sort = 'recent',
        ?string $filter = null,
        ?User $currentUser = null,
    ): LengthAwarePaginator {
        $threads = $this->forumRepository->getThreadsForTrainingUnit($trainingUnitId, $sort, $filter);

        if ($currentUser) {
            $this->attachUserVotes($threads, $currentUser);
        }

        return $threads;
    }

    /**
     * Get threads for a trainingPath.
     */
    public function getTrainingPathThreads(
        int $trainingPathId,
        string $sort = 'recent',
        ?string $filter = null,
        ?User $currentUser = null,
    ): LengthAwarePaginator {
        $threads = $this->forumRepository->getThreadsForTrainingPath($trainingPathId, $sort, $filter);

        if ($currentUser) {
            $this->attachUserVotes($threads, $currentUser);
        }

        return $threads;
    }

    /**
     * Get threads for a teacher's inbox.
     */
    public function getTeacherThreads(
        User $teacher,
        ?string $filter = null,
    ): LengthAwarePaginator {
        return $this->forumRepository->getThreadsForTeacher($teacher, $filter);
    }

    /**
     * Get a single thread with replies.
     */
    public function getThread(int $threadId, ?User $currentUser = null): ?DiscussionThread
    {
        $thread = $this->forumRepository->findThreadWithReplies($threadId);

        if (! $thread) {
            return null;
        }

        // Increment view count
        $thread->incrementViews();

        if ($currentUser) {
            // Get all reply IDs
            $replyIds = $thread->replies->pluck('id')->toArray();
            $childIds = $thread->replies->flatMap(fn ($r) => $r->children->pluck('id'))->toArray();

            $votes = $this->forumRepository->getUserVotes(
                $currentUser->id,
                [$thread->id],
                array_merge($replyIds, $childIds),
            );

            $thread->has_upvoted = in_array($thread->id, $votes['threads']);

            foreach ($thread->replies as $reply) {
                $reply->has_upvoted = in_array($reply->id, $votes['replies']);
                foreach ($reply->children as $child) {
                    $child->has_upvoted = in_array($child->id, $votes['replies']);
                }
            }
        }

        return $thread;
    }

    /**
     * Create a new thread.
     */
    public function createThread(
        User $author,
        TrainingUnit $trainingUnit,
        string $title,
        string $content,
    ): DiscussionThread {
        $thread = $this->forumRepository->createThread([
            'training_unit_id' => $trainingUnit->id,
            'training_path_id' => $trainingUnit->module->training_path_id,
            'author_id' => $author->id,
            'title' => $title,
            'content' => $content,
            'status' => ThreadStatus::OPEN,
        ]);

        Log::info('Discussion thread created', [
            'thread_id' => $thread->id,
            'training_unit_id' => $trainingUnit->id,
            'author_id' => $author->id,
        ]);

        return $thread->load('author');
    }

    /**
     * Reply to a thread.
     */
    public function replyToThread(
        DiscussionThread $thread,
        User $author,
        string $content,
        ?int $parentId = null,
    ): ThreadReply {
        if (! $thread->canReply()) {
            throw new \DomainException('Thread is locked and cannot accept replies.');
        }

        $reply = $this->forumRepository->createReply([
            'thread_id' => $thread->id,
            'author_id' => $author->id,
            'parent_id' => $parentId,
            'content' => $content,
        ]);

        $thread->updateReplyStats($reply);

        Log::info('Thread reply created', [
            'reply_id' => $reply->id,
            'thread_id' => $thread->id,
            'author_id' => $author->id,
        ]);

        // Notify thread author (if not replying to own thread)
        if ($thread->author_id !== $author->id) {
            $this->notificationService->notifyForumReply(
                $thread->author,
                $author->name,
                $thread->id,
                $thread->training_unit_id ?? 0,
            );
        }

        // Notify parent reply author (if replying to a reply)
        if ($parentId) {
            $parentReply = $this->forumRepository->findReplyById($parentId);
            if ($parentReply && $parentReply->author_id !== $author->id) {
                $this->notificationService->notifyForumReply(
                    $parentReply->author,
                    $author->name,
                    $thread->id,
                    $thread->training_unit_id ?? 0,
                );
            }
        }

        return $reply->load('author');
    }

    /**
     * Toggle upvote on a thread.
     */
    public function toggleThreadUpvote(DiscussionThread $thread, User $user): bool
    {
        return $this->forumRepository->toggleVote($user->id, 'thread', $thread->id);
    }

    /**
     * Toggle upvote on a reply.
     */
    public function toggleReplyUpvote(ThreadReply $reply, User $user): bool
    {
        return $this->forumRepository->toggleVote($user->id, 'reply', $reply->id);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Moderation (Teacher/Admin)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Pin a thread (teacher only).
     */
    public function pinThread(DiscussionThread $thread): DiscussionThread
    {
        return $this->forumRepository->updateThread($thread, [
            'is_pinned' => true,
            'status' => ThreadStatus::PINNED,
        ]);
    }

    /**
     * Unpin a thread.
     */
    public function unpinThread(DiscussionThread $thread): DiscussionThread
    {
        return $this->forumRepository->updateThread($thread, [
            'is_pinned' => false,
            'status' => ThreadStatus::OPEN,
        ]);
    }

    /**
     * Lock a thread.
     */
    public function lockThread(DiscussionThread $thread): DiscussionThread
    {
        return $this->forumRepository->updateThread($thread, [
            'is_locked' => true,
            'status' => ThreadStatus::LOCKED,
        ]);
    }

    /**
     * Unlock a thread.
     */
    public function unlockThread(DiscussionThread $thread): DiscussionThread
    {
        return $this->forumRepository->updateThread($thread, [
            'is_locked' => false,
            'status' => ThreadStatus::OPEN,
        ]);
    }

    /**
     * Mark a reply as the answer.
     */
    public function markAsAnswer(ThreadReply $reply): ThreadReply
    {
        $reply->markAsAnswer();

        return $reply->fresh();
    }

    /**
     * Flag a thread.
     */
    public function flagThread(DiscussionThread $thread): DiscussionThread
    {
        Log::warning('Thread flagged', ['thread_id' => $thread->id]);

        return $this->forumRepository->updateThread($thread, ['is_flagged' => true]);
    }

    /**
     * Unflag a thread.
     */
    public function unflagThread(DiscussionThread $thread): DiscussionThread
    {
        return $this->forumRepository->updateThread($thread, ['is_flagged' => false]);
    }

    /**
     * Flag a reply.
     */
    public function flagReply(ThreadReply $reply): ThreadReply
    {
        Log::warning('Reply flagged', ['reply_id' => $reply->id]);

        return $this->forumRepository->updateReply($reply, ['is_flagged' => true]);
    }

    /**
     * Unflag a reply.
     */
    public function unflagReply(ThreadReply $reply): ThreadReply
    {
        return $this->forumRepository->updateReply($reply, ['is_flagged' => false]);
    }

    /**
     * Delete a thread.
     */
    public function deleteThread(DiscussionThread $thread): bool
    {
        Log::info('Thread deleted', ['thread_id' => $thread->id]);

        return $this->forumRepository->deleteThread($thread);
    }

    /**
     * Delete a reply.
     */
    public function deleteReply(ThreadReply $reply): bool
    {
        $thread = $reply->thread;
        $result = $this->forumRepository->deleteReply($reply);

        if ($result) {
            $thread->update(['reply_count' => $thread->replies()->count()]);
        }

        Log::info('Reply deleted', ['reply_id' => $reply->id]);

        return $result;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Flagged Content
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Get flagged threads.
     */
    public function getFlaggedThreads(): LengthAwarePaginator
    {
        return $this->forumRepository->getFlaggedThreads();
    }

    /**
     * Get flagged replies.
     */
    public function getFlaggedReplies(): LengthAwarePaginator
    {
        return $this->forumRepository->getFlaggedReplies();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private Helpers
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Attach user's vote status to threads.
     */
    private function attachUserVotes(LengthAwarePaginator $threads, User $user): void
    {
        $threadIds = $threads->getCollection()->pluck('id')->toArray();
        $votes = $this->forumRepository->getUserVotes($user->id, $threadIds);

        foreach ($threads as $thread) {
            $thread->has_upvoted = in_array($thread->id, $votes['threads']);
        }
    }
}
