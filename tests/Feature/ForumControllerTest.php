<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\CourseModule;
use App\Models\DiscussionThread;
use App\Models\Lesson;
use App\Models\ThreadReply;
use App\Models\User;
use App\Services\ForumService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ForumControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $student;

    private User $teacher;

    private User $admin;

    private Course $course;

    private Lesson $lesson;

    protected function setUp(): void
    {
        parent::setUp();

        $this->student = User::factory()->create();
        $this->teacher = User::factory()->teacher()->create();
        $this->admin = User::factory()->admin()->create();

        $this->course = Course::factory()->approved()->create([
            'instructor_id' => $this->teacher->id,
        ]);

        $module = CourseModule::factory()->create(['course_id' => $this->course->id]);
        $this->lesson = Lesson::factory()->create(['module_id' => $module->id]);
    }

    // ────────────────────────────────────────────────────────────────────────
    // Thread Creation Tests
    // ────────────────────────────────────────────────────────────────────────

    public function test_authenticated_user_can_create_thread(): void
    {
        $response = $this->actingAs($this->student)
            ->postJson("/forum/lessons/{$this->lesson->id}/threads", [
                'title' => 'Need help with assignment',
                'content' => 'I am struggling with the IoT sensor setup.',
            ]);

        $response->assertCreated()
            ->assertJsonStructure([
                'data' => ['id', 'title', 'content', 'author'],
                'message',
            ]);

        $this->assertDatabaseHas('discussion_threads', [
            'title' => 'Need help with assignment',
            'content' => 'I am struggling with the IoT sensor setup.',
            'author_id' => $this->student->id,
            'lesson_id' => $this->lesson->id,
        ]);
    }

    public function test_unauthenticated_user_cannot_create_thread(): void
    {
        $response = $this->postJson("/forum/lessons/{$this->lesson->id}/threads", [
            'title' => 'Test Thread',
            'content' => 'Test content',
        ]);

        $response->assertUnauthorized();
    }

    public function test_thread_creation_validates_required_fields(): void
    {
        $response = $this->actingAs($this->student)
            ->postJson("/forum/lessons/{$this->lesson->id}/threads", []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['title', 'content']);
    }

    // ────────────────────────────────────────────────────────────────────────
    // Thread Reply Tests
    // ────────────────────────────────────────────────────────────────────────

    public function test_authenticated_user_can_reply_to_thread(): void
    {
        $thread = DiscussionThread::factory()->create([
            'lesson_id' => $this->lesson->id,
            'course_id' => $this->course->id,
        ]);

        $response = $this->actingAs($this->student)
            ->postJson("/forum/threads/{$thread->id}/reply", [
                'content' => 'Here is my answer to your question.',
            ]);

        $response->assertCreated()
            ->assertJsonStructure([
                'data' => ['id', 'content', 'author'],
                'message',
            ]);

        $this->assertDatabaseHas('thread_replies', [
            'thread_id' => $thread->id,
            'author_id' => $this->student->id,
            'content' => 'Here is my answer to your question.',
        ]);
    }

    public function test_user_can_reply_to_existing_reply(): void
    {
        $thread = DiscussionThread::factory()->create([
            'lesson_id' => $this->lesson->id,
            'course_id' => $this->course->id,
        ]);

        $parentReply = ThreadReply::factory()->create([
            'thread_id' => $thread->id,
        ]);

        $response = $this->actingAs($this->student)
            ->postJson("/forum/threads/{$thread->id}/reply", [
                'content' => 'This is a nested reply.',
                'parent_id' => $parentReply->id,
            ]);

        $response->assertCreated();

        $this->assertDatabaseHas('thread_replies', [
            'thread_id' => $thread->id,
            'parent_id' => $parentReply->id,
            'content' => 'This is a nested reply.',
        ]);
    }

    public function test_reply_creation_validates_content(): void
    {
        $thread = DiscussionThread::factory()->create([
            'lesson_id' => $this->lesson->id,
        ]);

        $response = $this->actingAs($this->student)
            ->postJson("/forum/threads/{$thread->id}/reply", []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['content']);
    }

    // ────────────────────────────────────────────────────────────────────────
    // Upvoting Tests
    // ────────────────────────────────────────────────────────────────────────

    public function test_user_can_upvote_thread(): void
    {
        $thread = DiscussionThread::factory()->create([
            'lesson_id' => $this->lesson->id,
            'upvote_count' => 0,
        ]);

        $response = $this->actingAs($this->student)
            ->postJson("/forum/threads/{$thread->id}/upvote");

        $response->assertOk()
            ->assertJson([
                'upvoted' => true,
                'upvote_count' => 1,
            ]);
    }

    public function test_user_can_toggle_thread_upvote(): void
    {
        $thread = DiscussionThread::factory()->create([
            'lesson_id' => $this->lesson->id,
            'upvote_count' => 1,
        ]);

        // First upvote
        $response = $this->actingAs($this->student)
            ->postJson("/forum/threads/{$thread->id}/upvote");

        $response->assertJson(['upvoted' => true]);

        // Remove upvote
        $response = $this->actingAs($this->student)
            ->postJson("/forum/threads/{$thread->id}/upvote");

        $response->assertJson(['upvoted' => false]);
    }

    public function test_user_can_upvote_reply(): void
    {
        $thread = DiscussionThread::factory()->create([
            'lesson_id' => $this->lesson->id,
        ]);

        $reply = ThreadReply::factory()->create([
            'thread_id' => $thread->id,
            'upvote_count' => 0,
        ]);

        $response = $this->actingAs($this->student)
            ->postJson("/forum/replies/{$reply->id}/upvote");

        $response->assertOk()
            ->assertJson([
                'upvoted' => true,
                'upvote_count' => 1,
            ]);
    }

    // ────────────────────────────────────────────────────────────────────────
    // Thread Listing Tests
    // ────────────────────────────────────────────────────────────────────────

    public function test_user_can_list_threads_for_lesson(): void
    {
        DiscussionThread::factory()->count(3)->create([
            'lesson_id' => $this->lesson->id,
            'course_id' => $this->course->id,
        ]);

        $response = $this->actingAs($this->student)
            ->getJson("/forum/lessons/{$this->lesson->id}/threads");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'title', 'content', 'author'],
                ],
                'pagination',
            ])
            ->assertJsonCount(3, 'data');
    }

    public function test_user_can_list_threads_for_course(): void
    {
        DiscussionThread::factory()->count(2)->create([
            'course_id' => $this->course->id,
        ]);

        $response = $this->actingAs($this->student)
            ->getJson("/forum/courses/{$this->course->id}/threads");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'title', 'content', 'author'],
                ],
                'pagination',
            ])
            ->assertJsonCount(2, 'data');
    }

    public function test_user_can_view_single_thread_with_replies(): void
    {
        $thread = DiscussionThread::factory()->create([
            'lesson_id' => $this->lesson->id,
        ]);

        ThreadReply::factory()->count(2)->create([
            'thread_id' => $thread->id,
        ]);

        $response = $this->actingAs($this->student)
            ->getJson("/forum/threads/{$thread->id}");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => ['id', 'title', 'content', 'replies'],
            ]);
    }

    // ────────────────────────────────────────────────────────────────────────
    // Teacher Actions Tests
    // ────────────────────────────────────────────────────────────────────────

    public function test_teacher_can_pin_thread_in_their_course(): void
    {
        $thread = DiscussionThread::factory()->create([
            'lesson_id' => $this->lesson->id,
            'course_id' => $this->course->id,
            'is_pinned' => false,
        ]);

        $response = $this->actingAs($this->teacher)
            ->postJson("/teaching/forum/threads/{$thread->id}/pin");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => ['id'],
                'message',
            ]);
    }

    public function test_teacher_can_lock_thread_in_their_course(): void
    {
        $thread = DiscussionThread::factory()->create([
            'lesson_id' => $this->lesson->id,
            'course_id' => $this->course->id,
            'is_locked' => false,
        ]);

        $response = $this->actingAs($this->teacher)
            ->postJson("/teaching/forum/threads/{$thread->id}/lock");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => ['id'],
                'message',
            ]);
    }

    public function test_teacher_can_mark_reply_as_answer(): void
    {
        $thread = DiscussionThread::factory()->create([
            'lesson_id' => $this->lesson->id,
            'course_id' => $this->course->id,
        ]);

        $reply = ThreadReply::factory()->create([
            'thread_id' => $thread->id,
            'is_answer' => false,
        ]);

        $response = $this->actingAs($this->teacher)
            ->postJson("/teaching/forum/replies/{$reply->id}/answer");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => ['id'],
                'message',
            ]);
    }

    public function test_student_cannot_perform_teacher_actions(): void
    {
        $thread = DiscussionThread::factory()->create([
            'lesson_id' => $this->lesson->id,
            'course_id' => $this->course->id,
        ]);

        $response = $this->actingAs($this->student)
            ->postJson("/teaching/forum/threads/{$thread->id}/pin");

        $response->assertForbidden();
    }

    public function test_teacher_can_access_teacher_inbox(): void
    {
        DiscussionThread::factory()->count(3)->create([
            'course_id' => $this->course->id,
        ]);

        $response = $this->actingAs($this->teacher)
            ->getJson('/teaching/forum/inbox');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'title', 'content'],
                ],
                'pagination',
            ]);
    }

    // ────────────────────────────────────────────────────────────────────────
    // Admin Actions Tests
    // ────────────────────────────────────────────────────────────────────────

    public function test_admin_can_view_flagged_threads(): void
    {
        DiscussionThread::factory()->count(2)->create([
            'lesson_id' => $this->lesson->id,
            'is_flagged' => true,
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/admin/forum/flagged');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'title'],
                ],
                'pagination',
            ])
            ->assertJsonCount(2, 'data');
    }

    public function test_admin_can_unflag_thread(): void
    {
        $thread = DiscussionThread::factory()->create([
            'lesson_id' => $this->lesson->id,
            'is_flagged' => true,
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson("/admin/forum/threads/{$thread->id}/unflag");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => ['id'],
                'message',
            ]);
    }

    public function test_student_cannot_access_admin_endpoints(): void
    {
        $response = $this->actingAs($this->student)
            ->getJson('/admin/forum/flagged');

        $response->assertForbidden();
    }

    // ────────────────────────────────────────────────────────────────────────
    // Content Moderation Tests
    // ────────────────────────────────────────────────────────────────────────

    public function test_user_can_flag_inappropriate_thread(): void
    {
        $thread = DiscussionThread::factory()->create([
            'lesson_id' => $this->lesson->id,
        ]);

        $response = $this->actingAs($this->student)
            ->postJson("/forum/threads/{$thread->id}/flag");

        $response->assertOk()
            ->assertJson(['message' => 'Thread flagged for review']);
    }

    public function test_user_can_flag_inappropriate_reply(): void
    {
        $thread = DiscussionThread::factory()->create([
            'lesson_id' => $this->lesson->id,
        ]);

        $reply = ThreadReply::factory()->create([
            'thread_id' => $thread->id,
        ]);

        $response = $this->actingAs($this->student)
            ->postJson("/forum/replies/{$reply->id}/flag");

        $response->assertOk()
            ->assertJson(['message' => 'Reply flagged for review']);
    }

    // ────────────────────────────────────────────────────────────────────────
    // Deletion Tests
    // ────────────────────────────────────────────────────────────────────────

    public function test_author_can_delete_own_thread(): void
    {
        $thread = DiscussionThread::factory()->create([
            'lesson_id' => $this->lesson->id,
            'author_id' => $this->student->id,
        ]);

        $response = $this->actingAs($this->student)
            ->deleteJson("/forum/threads/{$thread->id}");

        $response->assertOk()
            ->assertJson(['message' => 'Thread deleted']);
    }

    public function test_author_can_delete_own_reply(): void
    {
        $thread = DiscussionThread::factory()->create([
            'lesson_id' => $this->lesson->id,
        ]);

        $reply = ThreadReply::factory()->create([
            'thread_id' => $thread->id,
            'author_id' => $this->student->id,
        ]);

        $response = $this->actingAs($this->student)
            ->deleteJson("/forum/replies/{$reply->id}");

        $response->assertOk()
            ->assertJson(['message' => 'Reply deleted']);
    }

    public function test_user_cannot_delete_others_content(): void
    {
        $otherUser = User::factory()->create();
        $thread = DiscussionThread::factory()->create([
            'lesson_id' => $this->lesson->id,
            'author_id' => $otherUser->id,
        ]);

        $response = $this->actingAs($this->student)
            ->deleteJson("/forum/threads/{$thread->id}");

        $response->assertForbidden();
    }

    public function test_teacher_can_delete_any_content_in_their_course(): void
    {
        $thread = DiscussionThread::factory()->create([
            'lesson_id' => $this->lesson->id,
            'course_id' => $this->course->id,
            'author_id' => $this->student->id,
        ]);

        $response = $this->actingAs($this->teacher)
            ->deleteJson("/forum/threads/{$thread->id}");

        $response->assertOk()
            ->assertJson(['message' => 'Thread deleted']);
    }

    // ────────────────────────────────────────────────────────────────────────
    // Error Handling Tests
    // ────────────────────────────────────────────────────────────────────────

    public function test_returns_404_for_nonexistent_thread(): void
    {
        $response = $this->actingAs($this->student)
            ->getJson('/forum/threads/999999');

        $response->assertNotFound();
    }

    public function test_returns_404_for_nonexistent_lesson_threads(): void
    {
        $response = $this->actingAs($this->student)
            ->getJson('/forum/lessons/999999/threads');

        $response->assertNotFound();
    }

    public function test_service_methods_are_called_correctly(): void
    {
        $mockForumService = \Mockery::mock(ForumService::class);

        $mockForumService->shouldReceive('createThread')
            ->once()
            ->with(
                \Mockery::type(User::class),
                \Mockery::type(Lesson::class),
                'Test Thread',
                'Test Content'
            )
            ->andReturn(DiscussionThread::factory()->make());

        $this->app->instance(ForumService::class, $mockForumService);

        $this->actingAs($this->student)
            ->postJson("/forum/lessons/{$this->lesson->id}/threads", [
                'title' => 'Test Thread',
                'content' => 'Test Content',
            ]);
    }
}
