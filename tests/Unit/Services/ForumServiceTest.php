<?php

namespace Tests\Unit\Services;

use App\Enums\ThreadStatus;
use App\Models\DiscussionThread;
use App\Models\Lesson;
use App\Models\ThreadReply;
use App\Models\User;
use App\Repositories\ForumRepository;
use App\Services\ForumService;
use App\Services\NotificationService;
use DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Mockery;
use Tests\TestCase;

class ForumServiceTest extends TestCase
{
    private ForumService $service;

    private $mockRepository;

    private $mockNotificationService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->mockRepository = Mockery::mock(ForumRepository::class);
        $this->mockNotificationService = Mockery::mock(NotificationService::class);

        $this->service = new ForumService(
            $this->mockRepository,
            $this->mockNotificationService
        );
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Thread Operations Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_get_threads_returns_paginated_threads_for_lesson(): void
    {
        $lessonId = 1;
        $mockPaginator = Mockery::mock(LengthAwarePaginator::class);

        $this->mockRepository
            ->shouldReceive('getThreadsForLesson')
            ->once()
            ->with($lessonId, 'recent', null)
            ->andReturn($mockPaginator);

        $result = $this->service->getThreads($lessonId);

        $this->assertSame($mockPaginator, $result);
    }

    public function test_get_course_threads_returns_paginated_threads_for_course(): void
    {
        $courseId = 1;
        $mockPaginator = Mockery::mock(LengthAwarePaginator::class);

        $this->mockRepository
            ->shouldReceive('getThreadsForCourse')
            ->once()
            ->with($courseId, 'recent', null)
            ->andReturn($mockPaginator);

        $result = $this->service->getCourseThreads($courseId);

        $this->assertSame($mockPaginator, $result);
    }

    public function test_get_thread_returns_null_when_thread_not_found(): void
    {
        $this->mockRepository
            ->shouldReceive('findThreadWithReplies')
            ->once()
            ->with(999)
            ->andReturn(null);

        $result = $this->service->getThread(999);

        $this->assertNull($result);
    }

    public function test_get_thread_increments_views_and_returns_thread(): void
    {
        $thread = Mockery::mock(DiscussionThread::class);
        $thread->shouldReceive('incrementViews')->once();

        $this->mockRepository
            ->shouldReceive('findThreadWithReplies')
            ->once()
            ->with(1)
            ->andReturn($thread);

        $result = $this->service->getThread(1);

        $this->assertSame($thread, $result);
    }

    public function test_create_thread_creates_and_returns_thread_with_author(): void
    {
        $author = User::factory()->create();
        $lesson = Lesson::factory()->create();
        $module = $lesson->module;

        $threadData = [
            'lesson_id' => $lesson->id,
            'course_id' => $module->course_id,
            'author_id' => $author->id,
            'title' => 'Test Thread',
            'content' => 'Test content',
            'status' => ThreadStatus::OPEN,
        ];

        $createdThread = DiscussionThread::factory()->create($threadData);
        $threadWithAuthor = $createdThread->load('author');

        $this->mockRepository
            ->shouldReceive('createThread')
            ->once()
            ->with(Mockery::subset([
                'lesson_id' => $lesson->id,
                'author_id' => $author->id,
                'title' => 'Test Thread',
                'content' => 'Test content',
                'status' => ThreadStatus::OPEN,
            ]))
            ->andReturn($createdThread);

        Log::shouldReceive('info')
            ->once()
            ->with('Discussion thread created', Mockery::type('array'));

        $result = $this->service->createThread($author, $lesson, 'Test Thread', 'Test content');

        $this->assertEquals($threadWithAuthor->id, $result->id);
    }

    public function test_reply_to_thread_throws_exception_when_thread_locked(): void
    {
        $thread = Mockery::mock(DiscussionThread::class);
        $thread->shouldReceive('canReply')->once()->andReturn(false);

        $author = User::factory()->make();

        $this->expectException(DomainException::class);
        $this->expectExceptionMessage('Thread is locked and cannot accept replies.');

        $this->service->replyToThread($thread, $author, 'Reply content');
    }

    public function test_reply_to_thread_creates_reply_and_sends_notification(): void
    {
        $author = User::factory()->create(['name' => 'John Doe']);
        $threadAuthor = User::factory()->create();
        $lesson = Lesson::factory()->create();
        $thread = DiscussionThread::factory()->create([
            'author_id' => $threadAuthor->id,
            'lesson_id' => $lesson->id,
        ]);

        $replyData = [
            'thread_id' => $thread->id,
            'author_id' => $author->id,
            'parent_id' => null,
            'content' => 'Reply content',
        ];

        $reply = ThreadReply::factory()->create($replyData);
        $replyWithAuthor = $reply->load('author');

        $this->mockRepository
            ->shouldReceive('createReply')
            ->once()
            ->with(Mockery::subset([
                'thread_id' => $thread->id,
                'author_id' => $author->id,
                'parent_id' => null,
                'content' => 'Reply content',
            ]))
            ->andReturn($reply);

        Log::shouldReceive('info')
            ->once()
            ->with('Thread reply created', Mockery::type('array'));

        $this->mockNotificationService
            ->shouldReceive('notifyForumReply')
            ->once()
            ->with(
                Mockery::on(fn ($u) => $u->id === $threadAuthor->id),
                'John Doe',
                $thread->id,
                $lesson->id
            );

        $result = $this->service->replyToThread($thread, $author, 'Reply content');

        $this->assertEquals($replyWithAuthor->id, $result->id);
    }

    public function test_toggle_thread_upvote_calls_repository(): void
    {
        $thread = Mockery::mock(DiscussionThread::class);
        $thread->shouldReceive('getAttribute')->with('id')->andReturn(1);
        $user = User::factory()->make(['id' => 1]);

        $this->mockRepository
            ->shouldReceive('toggleVote')
            ->once()
            ->with(1, 'thread', 1)
            ->andReturn(true);

        $result = $this->service->toggleThreadUpvote($thread, $user);

        $this->assertTrue($result);
    }

    public function test_toggle_reply_upvote_calls_repository(): void
    {
        $reply = Mockery::mock(ThreadReply::class);
        $reply->shouldReceive('getAttribute')->with('id')->andReturn(1);
        $user = User::factory()->make(['id' => 1]);

        $this->mockRepository
            ->shouldReceive('toggleVote')
            ->once()
            ->with(1, 'reply', 1)
            ->andReturn(false);

        $result = $this->service->toggleReplyUpvote($reply, $user);

        $this->assertFalse($result);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Moderation Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_pin_thread_updates_thread_status(): void
    {
        $thread = Mockery::mock(DiscussionThread::class);
        $updatedThread = Mockery::mock(DiscussionThread::class);

        $this->mockRepository
            ->shouldReceive('updateThread')
            ->once()
            ->with($thread, [
                'is_pinned' => true,
                'status' => ThreadStatus::PINNED,
            ])
            ->andReturn($updatedThread);

        $result = $this->service->pinThread($thread);

        $this->assertSame($updatedThread, $result);
    }

    public function test_mark_as_answer_marks_reply_as_answer(): void
    {
        $reply = Mockery::mock(ThreadReply::class);
        $freshReply = Mockery::mock(ThreadReply::class);

        $reply->shouldReceive('markAsAnswer')->once();
        $reply->shouldReceive('fresh')->once()->andReturn($freshReply);

        $result = $this->service->markAsAnswer($reply);

        $this->assertSame($freshReply, $result);
    }

    public function test_flag_thread_logs_warning_and_updates_thread(): void
    {
        $thread = Mockery::mock(DiscussionThread::class);
        $thread->shouldReceive('getAttribute')->with('id')->andReturn(1);
        $flaggedThread = Mockery::mock(DiscussionThread::class);

        Log::shouldReceive('warning')
            ->once()
            ->with('Thread flagged', ['thread_id' => 1]);

        $this->mockRepository
            ->shouldReceive('updateThread')
            ->once()
            ->with($thread, ['is_flagged' => true])
            ->andReturn($flaggedThread);

        $result = $this->service->flagThread($thread);

        $this->assertSame($flaggedThread, $result);
    }

    public function test_delete_thread_logs_and_calls_repository(): void
    {
        $thread = Mockery::mock(DiscussionThread::class);
        $thread->shouldReceive('getAttribute')->with('id')->andReturn(1);

        Log::shouldReceive('info')
            ->once()
            ->with('Thread deleted', ['thread_id' => 1]);

        $this->mockRepository
            ->shouldReceive('deleteThread')
            ->once()
            ->with($thread)
            ->andReturn(true);

        $result = $this->service->deleteThread($thread);

        $this->assertTrue($result);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Flagged Content Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_get_flagged_threads_calls_repository(): void
    {
        $mockPaginator = Mockery::mock(LengthAwarePaginator::class);

        $this->mockRepository
            ->shouldReceive('getFlaggedThreads')
            ->once()
            ->andReturn($mockPaginator);

        $result = $this->service->getFlaggedThreads();

        $this->assertSame($mockPaginator, $result);
    }

    public function test_get_flagged_replies_calls_repository(): void
    {
        $mockPaginator = Mockery::mock(LengthAwarePaginator::class);

        $this->mockRepository
            ->shouldReceive('getFlaggedReplies')
            ->once()
            ->andReturn($mockPaginator);

        $result = $this->service->getFlaggedReplies();

        $this->assertSame($mockPaginator, $result);
    }
}
