<?php

namespace App\Repositories;

use App\Models\DiscussionThread;
use App\Models\ThreadReply;
use App\Models\ThreadVote;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * Repository for forum database access.
 */
class ForumRepository
{
    // ─────────────────────────────────────────────────────────────────────────
    // Thread Operations
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Create a new thread.
     *
     * @param  array<string, mixed>  $data
     */
    public function createThread(array $data): DiscussionThread
    {
        return DiscussionThread::create($data);
    }

    /**
     * Find thread with replies.
     */
    public function findThreadWithReplies(int $id): ?DiscussionThread
    {
        return DiscussionThread::with([
            'author',
            'replies' => fn ($q) => $q->topLevel()->with(['author', 'children.author'])->orderByDesc('is_answer')->orderByDesc('upvote_count'),
        ])->find($id);
    }

    /**
     * Get paginated threads for a trainingUnit.
     */
    public function getThreadsForTrainingUnit(
        int $trainingUnitId,
        string $sort = 'recent',
        ?string $filter = null,
        int $perPage = 20,
    ): LengthAwarePaginator {
        $query = DiscussionThread::forTrainingUnit($trainingUnitId)
            ->with(['author', 'lastReplyAuthor']);

        $query = $this->applyFilters($query, $filter);
        $query = $this->applySorting($query, $sort);

        return $query->paginate($perPage);
    }

    /**
     * Get paginated threads for a trainingPath.
     */
    public function getThreadsForTrainingPath(
        int $trainingPathId,
        string $sort = 'recent',
        ?string $filter = null,
        int $perPage = 20,
    ): LengthAwarePaginator {
        $query = DiscussionThread::forTrainingPath($trainingPathId)
            ->with(['author', 'lastReplyAuthor', 'trainingUnit']);

        $query = $this->applyFilters($query, $filter);
        $query = $this->applySorting($query, $sort);

        return $query->paginate($perPage);
    }

    /**
     * Get threads by teacher (across all their trainingPaths).
     */
    public function getThreadsForTeacher(
        User $teacher,
        ?string $filter = null,
        int $perPage = 20,
    ): LengthAwarePaginator {
        $trainingPathIds = $teacher->taughtTrainingPaths()->pluck('id');

        $query = DiscussionThread::whereIn('training_path_id', $trainingPathIds)
            ->with(['author', 'trainingPath', 'trainingUnit', 'lastReplyAuthor']);

        $query = $this->applyFilters($query, $filter);
        $query = $query->orderByDesc('created_at');

        return $query->paginate($perPage);
    }

    /**
     * Update a thread.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateThread(DiscussionThread $thread, array $data): DiscussionThread
    {
        $thread->update($data);

        return $thread->fresh();
    }

    /**
     * Delete a thread.
     */
    public function deleteThread(DiscussionThread $thread): bool
    {
        return $thread->delete();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Reply Operations
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Create a new reply.
     *
     * @param  array<string, mixed>  $data
     */
    public function createReply(array $data): ThreadReply
    {
        return ThreadReply::create($data);
    }

    /**
     * Find a reply by ID.
     */
    public function findReplyById(int $id): ?ThreadReply
    {
        return ThreadReply::with(['author', 'thread'])->find($id);
    }

    /**
     * Get replies for a thread.
     *
     * @deprecated Unused - replies loaded via findThreadWithReplies() instead. Candidate for removal.
     */
    public function getRepliesForThread(int $threadId): Collection
    {
        return ThreadReply::where('thread_id', $threadId)
            ->topLevel()
            ->with(['author', 'children.author'])
            ->orderByDesc('is_answer')
            ->orderByDesc('upvote_count')
            ->orderBy('created_at')
            ->get();
    }

    /**
     * Update a reply.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateReply(ThreadReply $reply, array $data): ThreadReply
    {
        $reply->update($data);

        return $reply->fresh();
    }

    /**
     * Delete a reply.
     */
    public function deleteReply(ThreadReply $reply): bool
    {
        return $reply->delete();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Vote Operations
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Toggle vote on a thread or reply.
     */
    public function toggleVote(string $userId, string $type, int $id): bool
    {
        $vote = ThreadVote::where('user_id', $userId)
            ->where('votable_type', $type)
            ->where('votable_id', $id)
            ->first();

        if ($vote) {
            $vote->delete();
            $this->updateVoteCount($type, $id, -1);

            return false;
        }

        ThreadVote::create([
            'user_id' => $userId,
            'votable_type' => $type,
            'votable_id' => $id,
            'value' => 1,
        ]);

        $this->updateVoteCount($type, $id, 1);

        return true;
    }

    /**
     * Check if user has voted.
     *
     * @deprecated Unused - getUserVotes() returns all votes in batch. Candidate for removal.
     */
    public function hasVoted(string $userId, string $type, int $id): bool
    {
        return ThreadVote::where('user_id', $userId)
            ->where('votable_type', $type)
            ->where('votable_id', $id)
            ->exists();
    }

    /**
     * Get user's vote IDs for threads/replies.
     *
     * @param  array<int>  $threadIds
     * @param  array<int>  $replyIds
     * @return array{threads: array<int>, replies: array<int>}
     */
    public function getUserVotes(string $userId, array $threadIds = [], array $replyIds = []): array
    {
        $votes = ThreadVote::where('user_id', $userId)
            ->where(function ($q) use ($threadIds, $replyIds) {
                if (! empty($threadIds)) {
                    $q->orWhere(fn ($q) => $q->where('votable_type', 'thread')->whereIn('votable_id', $threadIds));
                }
                if (! empty($replyIds)) {
                    $q->orWhere(fn ($q) => $q->where('votable_type', 'reply')->whereIn('votable_id', $replyIds));
                }
            })
            ->get();

        return [
            'threads' => $votes->where('votable_type', 'thread')->pluck('votable_id')->toArray(),
            'replies' => $votes->where('votable_type', 'reply')->pluck('votable_id')->toArray(),
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Flagged Content
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Get flagged threads.
     */
    public function getFlaggedThreads(int $perPage = 20): LengthAwarePaginator
    {
        return DiscussionThread::flagged()
            ->with(['author', 'trainingPath', 'trainingUnit'])
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    /**
     * Get flagged replies.
     */
    public function getFlaggedReplies(int $perPage = 20): LengthAwarePaginator
    {
        return ThreadReply::flagged()
            ->with(['author', 'thread.trainingPath'])
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private function applyFilters($query, ?string $filter)
    {
        return match ($filter) {
            'unanswered' => $query->unanswered(),
            'flagged' => $query->flagged(),
            'resolved' => $query->resolved(),
            'pinned' => $query->pinned(),
            default => $query,
        };
    }

    private function applySorting($query, string $sort)
    {
        return match ($sort) {
            'popular' => $query->orderByDesc('upvote_count')->orderByDesc('reply_count'),
            'unanswered' => $query->orderBy('reply_count')->orderByDesc('created_at'),
            default => $query->orderByRaw("CASE WHEN status = 'pinned' THEN 0 ELSE 1 END")->orderByDesc('created_at'),
        };
    }

    private function updateVoteCount(string $type, int $id, int $change): void
    {
        if ($type === 'thread') {
            DiscussionThread::where('id', $id)->increment('upvote_count', $change);
        } else {
            ThreadReply::where('id', $id)->increment('upvote_count', $change);
        }
    }
}
