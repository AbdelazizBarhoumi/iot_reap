<?php

namespace Tests\Unit;

use App\Enums\ThreadStatus;
use App\Models\TrainingPath;
use App\Models\TrainingPathModule;
use App\Models\DiscussionThread;
use App\Models\TrainingUnit;
use App\Models\ThreadReply;
use App\Models\ThreadVote;
use App\Models\User;
use App\Repositories\ForumRepository;
use App\Services\ForumService;
use App\Services\NotificationService;
use DomainException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class ForumServiceTest extends TestCase
{
    use RefreshDatabase;

    private ForumService $service;

    private NotificationService $notificationService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->notificationService = Mockery::mock(NotificationService::class);
        $this->notificationService->shouldReceive('notifyForumReply')->byDefault();

        $this->service = new ForumService(
            new ForumRepository,
            $this->notificationService,
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Thread Creation
    // ─────────────────────────────────────────────────────────────────────────

    public function test_creates_thread_for_trainingUnit(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->create();
        $module = TrainingPathModule::factory()->for($trainingPath)->create();
        $trainingUnit = TrainingUnit::factory()->for($module, 'module')->create();

        $thread = $this->service->createThread(
            author: $user,
            trainingUnit: $trainingUnit,
            title: 'How do I configure GPIO pins?',
            content: 'I need help with the GPIO setup on the Raspberry Pi.',
        );

        $this->assertInstanceOf(DiscussionThread::class, $thread);
        $this->assertEquals($trainingUnit->id, $thread->training_unit_id);
        $this->assertEquals($trainingPath->id, $thread->training_path_id);
        $this->assertEquals($user->id, $thread->author_id);
        $this->assertEquals('How do I configure GPIO pins?', $thread->title);
        $this->assertEquals(ThreadStatus::OPEN, $thread->status);
        $this->assertDatabaseHas('discussion_threads', [
            'id' => $thread->id,
            'training_unit_id' => $trainingUnit->id,
            'author_id' => $user->id,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Thread Replies
    // ─────────────────────────────────────────────────────────────────────────

    public function test_replies_to_existing_thread(): void
    {
        $author = User::factory()->create();
        $replier = User::factory()->create();
        $thread = $this->createThread($author);

        $this->notificationService
            ->shouldReceive('notifyForumReply')
            ->once()
            ->with(
                Mockery::on(fn ($user) => $user->id === $author->id),
                $replier->name,
                $thread->id,
                $thread->training_unit_id
            );

        $reply = $this->service->replyToThread(
            thread: $thread,
            author: $replier,
            content: 'You need to enable I2C in raspi-config first.',
        );

        $this->assertInstanceOf(ThreadReply::class, $reply);
        $this->assertEquals($thread->id, $reply->thread_id);
        $this->assertEquals($replier->id, $reply->author_id);
        $this->assertNull($reply->parent_id);
        $this->assertDatabaseHas('thread_replies', [
            'id' => $reply->id,
            'thread_id' => $thread->id,
        ]);
    }

    public function test_replies_to_existing_reply(): void
    {
        $author = User::factory()->create();
        $replier = User::factory()->create();
        $secondReplier = User::factory()->create();

        $thread = $this->createThread($author);
        $parentReply = ThreadReply::create([
            'thread_id' => $thread->id,
            'author_id' => $replier->id,
            'content' => 'Try this...',
        ]);

        $this->notificationService
            ->shouldReceive('notifyForumReply')
            ->twice();

        $childReply = $this->service->replyToThread(
            thread: $thread,
            author: $secondReplier,
            content: 'This helped, thanks!',
            parentId: $parentReply->id,
        );

        $this->assertEquals($parentReply->id, $childReply->parent_id);
        $this->assertDatabaseHas('thread_replies', [
            'id' => $childReply->id,
            'parent_id' => $parentReply->id,
        ]);
    }

    public function test_reply_updates_thread_reply_stats(): void
    {
        $author = User::factory()->create();
        $replier = User::factory()->create();
        $thread = $this->createThread($author);

        $this->assertEquals(0, $thread->reply_count);
        $this->assertNull($thread->last_reply_at);

        $this->service->replyToThread($thread, $replier, 'Here is my response.');

        $thread->refresh();
        $this->assertEquals(1, $thread->reply_count);
        $this->assertNotNull($thread->last_reply_at);
        $this->assertEquals($replier->id, $thread->last_reply_by);
    }

    public function test_cannot_reply_to_locked_thread(): void
    {
        $author = User::factory()->create();
        $thread = $this->createThread($author);
        $thread->update(['is_locked' => true]);

        $this->expectException(DomainException::class);
        $this->expectExceptionMessage('Thread is locked and cannot accept replies.');

        $this->service->replyToThread($thread, $author, 'This should fail.');
    }

    public function test_author_replying_to_own_thread_does_not_send_notification(): void
    {
        $author = User::factory()->create();
        $thread = $this->createThread($author);

        $this->notificationService
            ->shouldNotReceive('notifyForumReply');

        $this->service->replyToThread($thread, $author, 'I found the solution myself.');

        $this->assertTrue(true);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Upvotes
    // ─────────────────────────────────────────────────────────────────────────

    public function test_toggles_upvote_adds_then_removes(): void
    {
        $author = User::factory()->create();
        $voter = User::factory()->create();
        $thread = $this->createThread($author);

        // First toggle adds the vote
        $added = $this->service->toggleThreadUpvote($thread, $voter);
        $this->assertTrue($added);
        $this->assertDatabaseHas('thread_votes', [
            'user_id' => $voter->id,
            'votable_type' => 'thread',
            'votable_id' => $thread->id,
        ]);

        $thread->refresh();
        $this->assertEquals(1, $thread->upvote_count);

        // Second toggle removes the vote
        $removed = $this->service->toggleThreadUpvote($thread, $voter);
        $this->assertFalse($removed);
        $this->assertDatabaseMissing('thread_votes', [
            'user_id' => $voter->id,
            'votable_type' => 'thread',
            'votable_id' => $thread->id,
        ]);

        $thread->refresh();
        $this->assertEquals(0, $thread->upvote_count);
    }

    public function test_toggles_reply_upvote(): void
    {
        $author = User::factory()->create();
        $voter = User::factory()->create();
        $thread = $this->createThread($author);
        $reply = ThreadReply::create([
            'thread_id' => $thread->id,
            'author_id' => $author->id,
            'content' => 'A helpful reply',
        ]);

        $added = $this->service->toggleReplyUpvote($reply, $voter);
        $this->assertTrue($added);
        $this->assertDatabaseHas('thread_votes', [
            'user_id' => $voter->id,
            'votable_type' => 'reply',
            'votable_id' => $reply->id,
        ]);

        $reply->refresh();
        $this->assertEquals(1, $reply->upvote_count);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Moderation: Pin/Unpin
    // ─────────────────────────────────────────────────────────────────────────

    public function test_teacher_can_pin_thread(): void
    {
        $author = User::factory()->create();
        $thread = $this->createThread($author);

        $this->assertFalse($thread->is_pinned);
        $this->assertEquals(ThreadStatus::OPEN, $thread->status);

        $pinnedThread = $this->service->pinThread($thread);

        $this->assertTrue($pinnedThread->is_pinned);
        $this->assertEquals(ThreadStatus::PINNED, $pinnedThread->status);
    }

    public function test_teacher_can_unpin_thread(): void
    {
        $author = User::factory()->create();
        $thread = $this->createThread($author);
        $thread->update(['is_pinned' => true, 'status' => ThreadStatus::PINNED]);

        $unpinnedThread = $this->service->unpinThread($thread);

        $this->assertFalse($unpinnedThread->is_pinned);
        $this->assertEquals(ThreadStatus::OPEN, $unpinnedThread->status);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Moderation: Lock/Unlock
    // ─────────────────────────────────────────────────────────────────────────

    public function test_locks_thread(): void
    {
        $author = User::factory()->create();
        $thread = $this->createThread($author);

        $lockedThread = $this->service->lockThread($thread);

        $this->assertTrue($lockedThread->is_locked);
        $this->assertEquals(ThreadStatus::LOCKED, $lockedThread->status);
    }

    public function test_unlocks_thread(): void
    {
        $author = User::factory()->create();
        $thread = $this->createThread($author);
        $thread->update(['is_locked' => true, 'status' => ThreadStatus::LOCKED]);

        $unlockedThread = $this->service->unlockThread($thread);

        $this->assertFalse($unlockedThread->is_locked);
        $this->assertEquals(ThreadStatus::OPEN, $unlockedThread->status);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Moderation: Mark as Answered
    // ─────────────────────────────────────────────────────────────────────────

    public function test_marks_reply_as_answer(): void
    {
        $author = User::factory()->create();
        $thread = $this->createThread($author);
        $reply = ThreadReply::create([
            'thread_id' => $thread->id,
            'author_id' => $author->id,
            'content' => 'This is the correct answer.',
        ]);

        $this->assertFalse($reply->is_answer);

        $markedReply = $this->service->markAsAnswer($reply);

        $this->assertTrue($markedReply->is_answer);

        $thread->refresh();
        $this->assertEquals(ThreadStatus::RESOLVED, $thread->status);
    }

    public function test_marking_new_answer_removes_previous_answer(): void
    {
        $author = User::factory()->create();
        $thread = $this->createThread($author);

        $firstReply = ThreadReply::create([
            'thread_id' => $thread->id,
            'author_id' => $author->id,
            'content' => 'First answer',
            'is_answer' => true,
        ]);

        $secondReply = ThreadReply::create([
            'thread_id' => $thread->id,
            'author_id' => $author->id,
            'content' => 'Better answer',
        ]);

        $this->service->markAsAnswer($secondReply);

        $firstReply->refresh();
        $secondReply->refresh();

        $this->assertFalse($firstReply->is_answer);
        $this->assertTrue($secondReply->is_answer);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Moderation: Flagging
    // ─────────────────────────────────────────────────────────────────────────

    public function test_flags_inappropriate_thread(): void
    {
        $author = User::factory()->create();
        $thread = $this->createThread($author);

        $this->assertFalse($thread->is_flagged);

        $flaggedThread = $this->service->flagThread($thread);

        $this->assertTrue($flaggedThread->is_flagged);
    }

    public function test_unflags_thread(): void
    {
        $author = User::factory()->create();
        $thread = $this->createThread($author);
        $thread->update(['is_flagged' => true]);

        $unflaggedThread = $this->service->unflagThread($thread);

        $this->assertFalse($unflaggedThread->is_flagged);
    }

    public function test_flags_reply(): void
    {
        $author = User::factory()->create();
        $thread = $this->createThread($author);
        $reply = ThreadReply::create([
            'thread_id' => $thread->id,
            'author_id' => $author->id,
            'content' => 'Some reply',
        ]);

        $flaggedReply = $this->service->flagReply($reply);

        $this->assertTrue($flaggedReply->is_flagged);
    }

    public function test_unflags_reply(): void
    {
        $author = User::factory()->create();
        $thread = $this->createThread($author);
        $reply = ThreadReply::create([
            'thread_id' => $thread->id,
            'author_id' => $author->id,
            'content' => 'Some reply',
            'is_flagged' => true,
        ]);

        $unflaggedReply = $this->service->unflagReply($reply);

        $this->assertFalse($unflaggedReply->is_flagged);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Deletion
    // ─────────────────────────────────────────────────────────────────────────

    public function test_deletes_thread(): void
    {
        $author = User::factory()->create();
        $thread = $this->createThread($author);
        $threadId = $thread->id;

        $result = $this->service->deleteThread($thread);

        $this->assertTrue($result);
        $this->assertDatabaseMissing('discussion_threads', ['id' => $threadId]);
    }

    public function test_deletes_reply_and_updates_count(): void
    {
        $author = User::factory()->create();
        $thread = $this->createThread($author);
        $reply = ThreadReply::create([
            'thread_id' => $thread->id,
            'author_id' => $author->id,
            'content' => 'A reply to delete',
        ]);
        $thread->update(['reply_count' => 1]);
        $replyId = $reply->id;

        $result = $this->service->deleteReply($reply);

        $this->assertTrue($result);
        $this->assertDatabaseMissing('thread_replies', ['id' => $replyId]);

        $thread->refresh();
        $this->assertEquals(0, $thread->reply_count);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Thread Retrieval
    // ─────────────────────────────────────────────────────────────────────────

    public function test_gets_threads_for_trainingUnit(): void
    {
        $author = User::factory()->create();
        $trainingPath = TrainingPath::factory()->create();
        $module = TrainingPathModule::factory()->for($trainingPath)->create();
        $trainingUnit = TrainingUnit::factory()->for($module, 'module')->create();

        // Create threads for the trainingUnit
        DiscussionThread::create([
            'training_unit_id' => $trainingUnit->id,
            'training_path_id' => $trainingPath->id,
            'author_id' => $author->id,
            'title' => 'Thread 1',
            'content' => 'Content 1',
            'status' => ThreadStatus::OPEN,
        ]);
        DiscussionThread::create([
            'training_unit_id' => $trainingUnit->id,
            'training_path_id' => $trainingPath->id,
            'author_id' => $author->id,
            'title' => 'Thread 2',
            'content' => 'Content 2',
            'status' => ThreadStatus::OPEN,
        ]);

        $threads = $this->service->getThreads($trainingUnit->id);

        $this->assertEquals(2, $threads->total());
    }

    public function test_filters_unanswered_threads(): void
    {
        $author = User::factory()->create();
        $trainingPath = TrainingPath::factory()->create();
        $module = TrainingPathModule::factory()->for($trainingPath)->create();
        $trainingUnit = TrainingUnit::factory()->for($module, 'module')->create();

        // Create answered thread (has replies)
        $answeredThread = DiscussionThread::create([
            'training_unit_id' => $trainingUnit->id,
            'training_path_id' => $trainingPath->id,
            'author_id' => $author->id,
            'title' => 'Answered thread',
            'content' => 'Content',
            'status' => ThreadStatus::OPEN,
            'reply_count' => 1,
        ]);

        // Create unanswered thread (no replies)
        $unansweredThread = DiscussionThread::create([
            'training_unit_id' => $trainingUnit->id,
            'training_path_id' => $trainingPath->id,
            'author_id' => $author->id,
            'title' => 'Unanswered thread',
            'content' => 'Content',
            'status' => ThreadStatus::OPEN,
            'reply_count' => 0,
        ]);

        $threads = $this->service->getThreads($trainingUnit->id, filter: 'unanswered');

        $this->assertEquals(1, $threads->total());
        $this->assertEquals($unansweredThread->id, $threads->first()->id);
    }

    public function test_gets_teacher_threads_across_trainingPaths(): void
    {
        $teacher = User::factory()->teacher()->create();
        $student = User::factory()->create();

        // Create two trainingPaths for the teacher
        $trainingPath1 = TrainingPath::factory()->create(['instructor_id' => $teacher->id]);
        $trainingPath2 = TrainingPath::factory()->create(['instructor_id' => $teacher->id]);

        $module1 = TrainingPathModule::factory()->for($trainingPath1)->create();
        $module2 = TrainingPathModule::factory()->for($trainingPath2)->create();

        $trainingUnit1 = TrainingUnit::factory()->for($module1, 'module')->create();
        $trainingUnit2 = TrainingUnit::factory()->for($module2, 'module')->create();

        // Thread in trainingPath 1
        DiscussionThread::create([
            'training_unit_id' => $trainingUnit1->id,
            'training_path_id' => $trainingPath1->id,
            'author_id' => $student->id,
            'title' => 'TrainingPath 1 Thread',
            'content' => 'Content',
            'status' => ThreadStatus::OPEN,
        ]);

        // Thread in trainingPath 2
        DiscussionThread::create([
            'training_unit_id' => $trainingUnit2->id,
            'training_path_id' => $trainingPath2->id,
            'author_id' => $student->id,
            'title' => 'TrainingPath 2 Thread',
            'content' => 'Content',
            'status' => ThreadStatus::OPEN,
        ]);

        // Thread in another teacher's trainingPath
        $otherTeacher = User::factory()->teacher()->create();
        $otherTrainingPath = TrainingPath::factory()->create(['instructor_id' => $otherTeacher->id]);
        $otherModule = TrainingPathModule::factory()->for($otherTrainingPath)->create();
        $otherTrainingUnit = TrainingUnit::factory()->for($otherModule, 'module')->create();

        DiscussionThread::create([
            'training_unit_id' => $otherTrainingUnit->id,
            'training_path_id' => $otherTrainingPath->id,
            'author_id' => $student->id,
            'title' => 'Other Teacher Thread',
            'content' => 'Content',
            'status' => ThreadStatus::OPEN,
        ]);

        $threads = $this->service->getTeacherThreads($teacher);

        $this->assertEquals(2, $threads->total());
    }

    public function test_gets_single_thread_with_replies(): void
    {
        $author = User::factory()->create();
        $thread = $this->createThread($author);

        // Add some replies
        ThreadReply::create([
            'thread_id' => $thread->id,
            'author_id' => $author->id,
            'content' => 'Reply 1',
        ]);
        ThreadReply::create([
            'thread_id' => $thread->id,
            'author_id' => $author->id,
            'content' => 'Reply 2',
        ]);

        $fetchedThread = $this->service->getThread($thread->id);

        $this->assertNotNull($fetchedThread);
        $this->assertEquals($thread->id, $fetchedThread->id);
        $this->assertTrue($fetchedThread->relationLoaded('replies'));
        $this->assertCount(2, $fetchedThread->replies);
    }

    public function test_get_thread_increments_view_count(): void
    {
        $author = User::factory()->create();
        $thread = $this->createThread($author);

        $this->assertEquals(0, $thread->view_count);

        $this->service->getThread($thread->id);

        $thread->refresh();
        $this->assertEquals(1, $thread->view_count);
    }

    public function test_get_thread_attaches_user_vote_status(): void
    {
        $author = User::factory()->create();
        $voter = User::factory()->create();
        $thread = $this->createThread($author);

        // User has voted on the thread
        ThreadVote::create([
            'user_id' => $voter->id,
            'votable_type' => 'thread',
            'votable_id' => $thread->id,
            'value' => 1,
        ]);

        $fetchedThread = $this->service->getThread($thread->id, $voter);

        $this->assertTrue($fetchedThread->has_upvoted);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Flagged Content Retrieval
    // ─────────────────────────────────────────────────────────────────────────

    public function test_gets_flagged_threads(): void
    {
        $author = User::factory()->create();

        $normalThread = $this->createThread($author);
        $flaggedThread = $this->createThread($author);
        $flaggedThread->update(['is_flagged' => true]);

        $flaggedThreads = $this->service->getFlaggedThreads();

        $this->assertEquals(1, $flaggedThreads->total());
        $this->assertEquals($flaggedThread->id, $flaggedThreads->first()->id);
    }

    public function test_gets_flagged_replies(): void
    {
        $author = User::factory()->create();
        $thread = $this->createThread($author);

        $normalReply = ThreadReply::create([
            'thread_id' => $thread->id,
            'author_id' => $author->id,
            'content' => 'Normal reply',
        ]);

        $flaggedReply = ThreadReply::create([
            'thread_id' => $thread->id,
            'author_id' => $author->id,
            'content' => 'Flagged reply',
            'is_flagged' => true,
        ]);

        $flaggedReplies = $this->service->getFlaggedReplies();

        $this->assertEquals(1, $flaggedReplies->total());
        $this->assertEquals($flaggedReply->id, $flaggedReplies->first()->id);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TrainingPath Threads
    // ─────────────────────────────────────────────────────────────────────────

    public function test_gets_threads_for_trainingPath(): void
    {
        $author = User::factory()->create();
        $trainingPath = TrainingPath::factory()->create();
        $module = TrainingPathModule::factory()->for($trainingPath)->create();
        $trainingUnit1 = TrainingUnit::factory()->for($module, 'module')->create();
        $trainingUnit2 = TrainingUnit::factory()->for($module, 'module')->create();

        // Threads across different trainingUnits in the same trainingPath
        DiscussionThread::create([
            'training_unit_id' => $trainingUnit1->id,
            'training_path_id' => $trainingPath->id,
            'author_id' => $author->id,
            'title' => 'TrainingUnit 1 Thread',
            'content' => 'Content',
            'status' => ThreadStatus::OPEN,
        ]);

        DiscussionThread::create([
            'training_unit_id' => $trainingUnit2->id,
            'training_path_id' => $trainingPath->id,
            'author_id' => $author->id,
            'title' => 'TrainingUnit 2 Thread',
            'content' => 'Content',
            'status' => ThreadStatus::OPEN,
        ]);

        $threads = $this->service->getTrainingPathThreads($trainingPath->id);

        $this->assertEquals(2, $threads->total());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helper Methods
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Create a thread with necessary relationships.
     */
    private function createThread(User $author): DiscussionThread
    {
        $trainingPath = TrainingPath::factory()->create();
        $module = TrainingPathModule::factory()->for($trainingPath)->create();
        $trainingUnit = TrainingUnit::factory()->for($module, 'module')->create();

        return DiscussionThread::create([
            'training_unit_id' => $trainingUnit->id,
            'training_path_id' => $trainingPath->id,
            'author_id' => $author->id,
            'title' => 'Test Thread',
            'content' => 'Test content',
            'status' => ThreadStatus::OPEN,
            'is_pinned' => false,
            'is_flagged' => false,
        ]);
    }
}
