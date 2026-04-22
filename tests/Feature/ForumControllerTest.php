<?php

namespace Tests\Feature;

use App\Models\TrainingPath;
use App\Models\TrainingPathModule;
use App\Models\DiscussionThread;
use App\Models\TrainingUnit;
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

    private TrainingPath $trainingPath;

    private TrainingUnit $trainingUnit;

    protected function setUp(): void
    {
        parent::setUp();

        $this->student = User::factory()->create();
        $this->teacher = User::factory()->teacher()->create();
        $this->admin = User::factory()->admin()->create();

        $this->trainingPath = TrainingPath::factory()->approved()->create([
            'instructor_id' => $this->teacher->id,
        ]);

        $module = TrainingPathModule::factory()->create(['training_path_id' => $this->trainingPath->id]);
        $this->trainingUnit = TrainingUnit::factory()->create(['module_id' => $module->id]);
    }

    // ────────────────────────────────────────────────────────────────────────
    // Thread Creation Tests
    // ────────────────────────────────────────────────────────────────────────

    public function test_authenticated_user_can_create_thread(): void
    {
        $response = $this->actingAs($this->student)
            ->postJson("/forum/trainingUnits/{$this->trainingUnit->id}/threads", [
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
            'training_unit_id' => $this->trainingUnit->id,
        ]);
    }

    public function test_unauthenticated_user_cannot_create_thread(): void
    {
        $response = $this->postJson("/forum/trainingUnits/{$this->trainingUnit->id}/threads", [
            'title' => 'Test Thread',
            'content' => 'Test content',
        ]);

        $response->assertUnauthorized();
    }

    public function test_thread_creation_validates_required_fields(): void
    {
        $response = $this->actingAs($this->student)
            ->postJson("/forum/trainingUnits/{$this->trainingUnit->id}/threads", []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['title', 'content']);
    }

    // ────────────────────────────────────────────────────────────────────────
    // Thread Reply Tests
    // ────────────────────────────────────────────────────────────────────────

    public function test_authenticated_user_can_reply_to_thread(): void
    {
        $thread = DiscussionThread::factory()->create([
            'training_unit_id' => $this->trainingUnit->id,
            'training_path_id' => $this->trainingPath->id,
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
            'training_unit_id' => $this->trainingUnit->id,
            'training_path_id' => $this->trainingPath->id,
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
            'training_unit_id' => $this->trainingUnit->id,
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
            'training_unit_id' => $this->trainingUnit->id,
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
            'training_unit_id' => $this->trainingUnit->id,
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
            'training_unit_id' => $this->trainingUnit->id,
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

    public function test_user_can_list_threads_for_trainingUnit(): void
    {
        DiscussionThread::factory()->count(3)->create([
            'training_unit_id' => $this->trainingUnit->id,
            'training_path_id' => $this->trainingPath->id,
        ]);

        $response = $this->actingAs($this->student)
            ->getJson("/forum/trainingUnits/{$this->trainingUnit->id}/threads");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'title', 'content', 'author'],
                ],
                'pagination',
            ])
            ->assertJsonCount(3, 'data');
    }

    public function test_user_can_list_threads_for_trainingPath(): void
    {
        DiscussionThread::factory()->count(2)->create([
            'training_path_id' => $this->trainingPath->id,
        ]);

        $response = $this->actingAs($this->student)
            ->getJson("/forum/trainingPaths/{$this->trainingPath->id}/threads");

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
            'training_unit_id' => $this->trainingUnit->id,
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

    public function test_teacher_can_pin_thread_in_their_trainingPath(): void
    {
        $thread = DiscussionThread::factory()->create([
            'training_unit_id' => $this->trainingUnit->id,
            'training_path_id' => $this->trainingPath->id,
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

    public function test_teacher_can_lock_thread_in_their_trainingPath(): void
    {
        $thread = DiscussionThread::factory()->create([
            'training_unit_id' => $this->trainingUnit->id,
            'training_path_id' => $this->trainingPath->id,
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
            'training_unit_id' => $this->trainingUnit->id,
            'training_path_id' => $this->trainingPath->id,
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
            'training_unit_id' => $this->trainingUnit->id,
            'training_path_id' => $this->trainingPath->id,
        ]);

        $response = $this->actingAs($this->student)
            ->postJson("/teaching/forum/threads/{$thread->id}/pin");

        $response->assertForbidden();
    }

    public function test_teacher_can_access_teacher_inbox(): void
    {
        DiscussionThread::factory()->count(3)->create([
            'training_path_id' => $this->trainingPath->id,
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
            'training_unit_id' => $this->trainingUnit->id,
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
            'training_unit_id' => $this->trainingUnit->id,
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

    public function test_admin_can_view_flagged_replies(): void
    {
        $thread = DiscussionThread::factory()->create([
            'training_unit_id' => $this->trainingUnit->id,
            'training_path_id' => $this->trainingPath->id,
        ]);

        ThreadReply::factory()->count(2)->create([
            'thread_id' => $thread->id,
            'is_flagged' => true,
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/admin/forum/flagged-replies');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'threadId', 'content'],
                ],
                'pagination',
            ])
            ->assertJsonCount(2, 'data');
    }

    public function test_admin_can_unflag_reply(): void
    {
        $thread = DiscussionThread::factory()->create([
            'training_unit_id' => $this->trainingUnit->id,
            'training_path_id' => $this->trainingPath->id,
        ]);

        $reply = ThreadReply::factory()->create([
            'thread_id' => $thread->id,
            'is_flagged' => true,
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson("/admin/forum/replies/{$reply->id}/unflag");

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
            'training_unit_id' => $this->trainingUnit->id,
        ]);

        $response = $this->actingAs($this->student)
            ->postJson("/forum/threads/{$thread->id}/flag");

        $response->assertOk()
            ->assertJson(['message' => 'Thread flagged for review']);
    }

    public function test_user_can_flag_inappropriate_reply(): void
    {
        $thread = DiscussionThread::factory()->create([
            'training_unit_id' => $this->trainingUnit->id,
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
            'training_unit_id' => $this->trainingUnit->id,
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
            'training_unit_id' => $this->trainingUnit->id,
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
            'training_unit_id' => $this->trainingUnit->id,
            'author_id' => $otherUser->id,
        ]);

        $response = $this->actingAs($this->student)
            ->deleteJson("/forum/threads/{$thread->id}");

        $response->assertForbidden();
    }

    public function test_teacher_can_delete_any_content_in_their_trainingPath(): void
    {
        $thread = DiscussionThread::factory()->create([
            'training_unit_id' => $this->trainingUnit->id,
            'training_path_id' => $this->trainingPath->id,
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

    public function test_returns_404_for_nonexistent_training_unit_threads(): void
    {
        $response = $this->actingAs($this->student)
            ->getJson('/forum/trainingUnits/999999/threads');

        $response->assertNotFound();
    }

    public function test_service_methods_are_called_correctly(): void
    {
        $mockForumService = \Mockery::mock(ForumService::class);

        $mockForumService->shouldReceive('createThread')
            ->once()
            ->with(
                \Mockery::type(User::class),
                \Mockery::type(TrainingUnit::class),
                'Test Thread',
                'Test Content'
            )
            ->andReturn(DiscussionThread::factory()->make());

        $this->app->instance(ForumService::class, $mockForumService);

        $this->actingAs($this->student)
            ->postJson("/forum/trainingUnits/{$this->trainingUnit->id}/threads", [
                'title' => 'Test Thread',
                'content' => 'Test Content',
            ]);
    }
}
