<?php

namespace App\Http\Controllers;

use App\Http\Requests\Forum\CreateReplyRequest;
use App\Http\Requests\Forum\CreateThreadRequest;
use App\Http\Resources\DiscussionThreadResource;
use App\Http\Resources\ThreadReplyResource;
use App\Models\DiscussionThread;
use App\Models\TrainingUnit;
use App\Models\ThreadReply;
use App\Services\ForumService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

/**
 * Controller for discussion forum functionality.
 */
class ForumController extends Controller
{
    public function __construct(
        private readonly ForumService $forumService,
    ) {}

    /**
     * List threads for a trainingUnit.
     */
    public function index(Request $request, int $trainingUnitId): JsonResponse
    {
        $trainingUnit = TrainingUnit::findOrFail($trainingUnitId);
        
        $sort = $request->query('sort', 'recent');
        $filter = $request->query('filter');

        $threads = $this->forumService->getThreads(
            trainingUnitId: $trainingUnitId,
            sort: $sort,
            filter: $filter,
            currentUser: $request->user(),
        );

        return response()->json([
            'data' => DiscussionThreadResource::collection($threads),
            'pagination' => [
                'current_page' => $threads->currentPage(),
                'last_page' => $threads->lastPage(),
                'per_page' => $threads->perPage(),
                'total' => $threads->total(),
            ],
        ]);
    }

    /**
     * List threads for a trainingPath.
     */
    public function trainingPathThreads(Request $request, int $trainingPathId): JsonResponse
    {
        $sort = $request->query('sort', 'recent');
        $filter = $request->query('filter');

        $threads = $this->forumService->getTrainingPathThreads(
            trainingPathId: $trainingPathId,
            sort: $sort,
            filter: $filter,
            currentUser: $request->user(),
        );

        return response()->json([
            'data' => DiscussionThreadResource::collection($threads),
            'pagination' => [
                'current_page' => $threads->currentPage(),
                'last_page' => $threads->lastPage(),
                'per_page' => $threads->perPage(),
                'total' => $threads->total(),
            ],
        ]);
    }

    /**
     * Show a single thread with replies.
     */
    public function show(Request $request, int $threadId): JsonResponse
    {
        $thread = $this->forumService->getThread($threadId, $request->user());

        if (! $thread) {
            return response()->json(['error' => 'Thread not found'], 404);
        }

        return response()->json([
            'data' => new DiscussionThreadResource($thread),
        ]);
    }

    /**
     * Create a new thread.
     */
    public function store(CreateThreadRequest $request, int $trainingUnitId): JsonResponse
    {
        $trainingUnit = TrainingUnit::findOrFail($trainingUnitId);
        $user = $request->user();

        $thread = $this->forumService->createThread(
            author: $user,
            trainingUnit: $trainingUnit,
            title: $request->validated('title'),
            content: $request->validated('content'),
        );

        return response()->json([
            'data' => new DiscussionThreadResource($thread),
            'message' => 'Thread created successfully',
        ], 201);
    }

    /**
     * Reply to a thread.
     */
    public function reply(CreateReplyRequest $request, int $threadId): JsonResponse
    {
        $thread = DiscussionThread::findOrFail($threadId);
        $user = $request->user();

        try {
            $reply = $this->forumService->replyToThread(
                thread: $thread,
                author: $user,
                content: $request->validated('content'),
                parentId: $request->validated('parent_id'),
            );

            return response()->json([
                'data' => new ThreadReplyResource($reply),
                'message' => 'Reply posted successfully',
            ], 201);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Upvote a thread.
     */
    public function upvoteThread(Request $request, int $threadId): JsonResponse
    {
        $thread = DiscussionThread::findOrFail($threadId);
        $user = $request->user();

        $upvoted = $this->forumService->toggleThreadUpvote($thread, $user);

        return response()->json([
            'upvoted' => $upvoted,
            'upvote_count' => $thread->fresh()->upvote_count,
        ]);
    }

    /**
     * Upvote a reply.
     */
    public function upvoteReply(Request $request, int $replyId): JsonResponse
    {
        $reply = ThreadReply::findOrFail($replyId);
        $user = $request->user();

        $upvoted = $this->forumService->toggleReplyUpvote($reply, $user);

        return response()->json([
            'upvoted' => $upvoted,
            'upvote_count' => $reply->fresh()->upvote_count,
        ]);
    }

    /**
     * Flag a thread.
     */
    public function flagThread(Request $request, int $threadId): JsonResponse
    {
        $thread = DiscussionThread::findOrFail($threadId);
        $this->forumService->flagThread($thread);

        return response()->json(['message' => 'Thread flagged for review']);
    }

    /**
     * Flag a reply.
     */
    public function flagReply(Request $request, int $replyId): JsonResponse
    {
        $reply = ThreadReply::findOrFail($replyId);
        $this->forumService->flagReply($reply);

        return response()->json(['message' => 'Reply flagged for review']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Teacher/Admin Actions
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Get teacher inbox threads.
     */
    public function teacherInbox(Request $request): JsonResponse
    {
        $user = $request->user();
        Gate::authorize('teach');

        $filter = $request->query('filter');
        $threads = $this->forumService->getTeacherThreads($user, $filter);

        return response()->json([
            'data' => DiscussionThreadResource::collection($threads),
            'pagination' => [
                'current_page' => $threads->currentPage(),
                'last_page' => $threads->lastPage(),
                'per_page' => $threads->perPage(),
                'total' => $threads->total(),
            ],
        ]);
    }

    /**
     * Pin a thread.
     */
    public function pin(Request $request, int $threadId): JsonResponse
    {
        $thread = DiscussionThread::findOrFail($threadId);
        $this->authorizeTeacherAction($request->user(), $thread);

        $thread = $this->forumService->pinThread($thread);

        return response()->json([
            'data' => new DiscussionThreadResource($thread),
            'message' => 'Thread pinned',
        ]);
    }

    /**
     * Unpin a thread.
     */
    public function unpin(Request $request, int $threadId): JsonResponse
    {
        $thread = DiscussionThread::findOrFail($threadId);
        $this->authorizeTeacherAction($request->user(), $thread);

        $thread = $this->forumService->unpinThread($thread);

        return response()->json([
            'data' => new DiscussionThreadResource($thread),
            'message' => 'Thread unpinned',
        ]);
    }

    /**
     * Lock a thread.
     */
    public function lock(Request $request, int $threadId): JsonResponse
    {
        $thread = DiscussionThread::findOrFail($threadId);
        $this->authorizeTeacherAction($request->user(), $thread);

        $thread = $this->forumService->lockThread($thread);

        return response()->json([
            'data' => new DiscussionThreadResource($thread),
            'message' => 'Thread locked',
        ]);
    }

    /**
     * Unlock a thread.
     */
    public function unlock(Request $request, int $threadId): JsonResponse
    {
        $thread = DiscussionThread::findOrFail($threadId);
        $this->authorizeTeacherAction($request->user(), $thread);

        $thread = $this->forumService->unlockThread($thread);

        return response()->json([
            'data' => new DiscussionThreadResource($thread),
            'message' => 'Thread unlocked',
        ]);
    }

    /**
     * Mark a reply as the answer.
     */
    public function markAnswer(Request $request, int $replyId): JsonResponse
    {
        $reply = ThreadReply::with('thread')->findOrFail($replyId);
        $this->authorizeTeacherAction($request->user(), $reply->thread);

        $reply = $this->forumService->markAsAnswer($reply);

        return response()->json([
            'data' => new ThreadReplyResource($reply),
            'message' => 'Reply marked as answer',
        ]);
    }

    /**
     * Delete a thread.
     */
    public function destroyThread(Request $request, int $threadId): JsonResponse
    {
        $thread = DiscussionThread::findOrFail($threadId);
        $user = $request->user();

        // Author can delete own thread, or teacher/admin
        if ($thread->author_id !== $user->id) {
            $this->authorizeTeacherAction($user, $thread);
        }

        $this->forumService->deleteThread($thread);

        return response()->json(['message' => 'Thread deleted']);
    }

    /**
     * Delete a reply.
     */
    public function destroyReply(Request $request, int $replyId): JsonResponse
    {
        $reply = ThreadReply::with('thread')->findOrFail($replyId);
        $user = $request->user();

        // Author can delete own reply, or teacher/admin
        if ($reply->author_id !== $user->id) {
            $this->authorizeTeacherAction($user, $reply->thread);
        }

        $this->forumService->deleteReply($reply);

        return response()->json(['message' => 'Reply deleted']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Flagged Content (Admin)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Get flagged threads.
     */
    public function flaggedThreads(Request $request): JsonResponse
    {
        Gate::authorize('admin');

        $threads = $this->forumService->getFlaggedThreads();

        return response()->json([
            'data' => DiscussionThreadResource::collection($threads),
            'pagination' => [
                'current_page' => $threads->currentPage(),
                'last_page' => $threads->lastPage(),
                'per_page' => $threads->perPage(),
                'total' => $threads->total(),
            ],
        ]);
    }

    /**
     * Unflag a thread.
     */
    public function unflagThread(Request $request, int $threadId): JsonResponse
    {
        Gate::authorize('admin');

        $thread = DiscussionThread::findOrFail($threadId);
        $thread = $this->forumService->unflagThread($thread);

        return response()->json([
            'data' => new DiscussionThreadResource($thread),
            'message' => 'Thread unflagged',
        ]);
    }

    /**
     * Unflag a reply.
     */
    public function unflagReply(Request $request, int $replyId): JsonResponse
    {
        Gate::authorize('admin');

        $reply = ThreadReply::findOrFail($replyId);
        $reply = $this->forumService->unflagReply($reply);

        return response()->json([
            'data' => new ThreadReplyResource($reply),
            'message' => 'Reply unflagged',
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private function authorizeTeacherAction($user, DiscussionThread $thread): void
    {
        $trainingPath = $thread->trainingPath;

        // Admin can manage any thread
        if ($user->hasRole(\App\Enums\UserRole::ADMIN)) {
            return;
        }

        // Teacher can only manage threads in their own trainingPaths
        if ($user->hasRole(\App\Enums\UserRole::TEACHER) && $trainingPath->instructor_id === $user->id) {
            return;
        }

        abort(403, 'Unauthorized action.');
    }
}
