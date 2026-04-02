<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\Course;
use App\Models\CourseModule;
use App\Models\Lesson;
use App\Models\User;
use App\Services\ArticleService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ArticleControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $teacher;

    private User $student;

    private User $admin;

    private Course $course;

    private Lesson $lesson;

    protected function setUp(): void
    {
        parent::setUp();

        $this->teacher = User::factory()->teacher()->create();
        $this->student = User::factory()->create();
        $this->admin = User::factory()->admin()->create();

        $this->course = Course::factory()->approved()->create(['instructor_id' => $this->teacher->id]);
        $module = CourseModule::factory()->create(['course_id' => $this->course->id]);
        $this->lesson = Lesson::factory()->reading()->create(['module_id' => $module->id]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Show Article Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_teacher_can_view_article_show_page(): void
    {
        $article = Article::factory()->create(['lesson_id' => $this->lesson->id]);

        $response = $this->actingAs($this->teacher)->get("/teaching/lessons/{$this->lesson->id}/article");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('teaching/article-edit')
            ->has('lessonId')
            ->has('article')
        );
    }

    public function test_teacher_can_view_article_show_page_with_no_article(): void
    {
        $response = $this->actingAs($this->teacher)->get("/teaching/lessons/{$this->lesson->id}/article");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('teaching/article-edit')
            ->where('lessonId', (string) $this->lesson->id)
            ->where('article', null)
        );
    }

    public function test_show_article_returns_json_when_requested(): void
    {
        $article = Article::factory()->create(['lesson_id' => $this->lesson->id]);

        $response = $this->actingAs($this->teacher)
            ->getJson("/teaching/lessons/{$this->lesson->id}/article");

        $response->assertOk()
            ->assertJsonStructure([
                'article' => ['id', 'content', 'word_count', 'estimated_read_time_minutes'],
            ]);
    }

    public function test_show_article_returns_null_when_no_article_exists(): void
    {
        $response = $this->actingAs($this->teacher)
            ->getJson("/teaching/lessons/{$this->lesson->id}/article");

        $response->assertOk()
            ->assertJson(['article' => null]);
    }

    public function test_show_article_fails_for_nonexistent_lesson(): void
    {
        $response = $this->actingAs($this->teacher)->get('/teaching/lessons/999/article');

        $response->assertNotFound();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Create/Update Article Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_teacher_can_create_article(): void
    {
        $content = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'paragraph',
                    'content' => [
                        ['type' => 'text', 'text' => 'This is a test article with content.'],
                    ],
                ],
            ],
        ];

        $response = $this->actingAs($this->teacher)
            ->postJson("/teaching/lessons/{$this->lesson->id}/article", [
                'content' => $content,
            ]);

        $response->assertOk()
            ->assertJson([
                'message' => 'Article saved successfully',
            ])
            ->assertJsonStructure([
                'article' => ['id', 'content', 'word_count'],
            ]);

        $this->assertDatabaseHas('articles', [
            'lesson_id' => $this->lesson->id,
        ]);

        $article = Article::where('lesson_id', $this->lesson->id)->first();
        $this->assertEquals($content, $article->content);
        $this->assertGreaterThan(0, $article->word_count);
    }

    public function test_teacher_can_update_existing_article(): void
    {
        $article = Article::factory()->create(['lesson_id' => $this->lesson->id]);

        $newContent = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'paragraph',
                    'content' => [
                        ['type' => 'text', 'text' => 'Updated article content with more words for testing.'],
                    ],
                ],
            ],
        ];

        $response = $this->actingAs($this->teacher)
            ->postJson("/teaching/lessons/{$this->lesson->id}/article", [
                'content' => $newContent,
            ]);

        $response->assertOk()
            ->assertJson([
                'message' => 'Article saved successfully',
            ]);

        $article->refresh();
        $this->assertEquals($newContent, $article->content);
    }

    public function test_upsert_article_validates_content_is_required(): void
    {
        $response = $this->actingAs($this->teacher)
            ->postJson("/teaching/lessons/{$this->lesson->id}/article", []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['content']);
    }

    public function test_upsert_article_validates_content_is_array(): void
    {
        $response = $this->actingAs($this->teacher)
            ->postJson("/teaching/lessons/{$this->lesson->id}/article", [
                'content' => 'not an array',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['content']);
    }

    public function test_upsert_article_fails_for_nonexistent_lesson(): void
    {
        $content = ['type' => 'doc', 'content' => []];

        $response = $this->actingAs($this->teacher)
            ->postJson('/lessons/999/article', ['content' => $content]);

        $response->assertNotFound();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Delete Article Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_teacher_can_delete_article(): void
    {
        $article = Article::factory()->create(['lesson_id' => $this->lesson->id]);

        $response = $this->actingAs($this->teacher)
            ->deleteJson("/teaching/lessons/{$this->lesson->id}/article");

        $response->assertOk()
            ->assertJson([
                'message' => 'Article deleted successfully',
            ]);

        $this->assertDatabaseMissing('articles', ['id' => $article->id]);
    }

    public function test_delete_article_returns_404_when_no_article_exists(): void
    {
        $response = $this->actingAs($this->teacher)
            ->deleteJson("/teaching/lessons/{$this->lesson->id}/article");

        $response->assertNotFound()
            ->assertJson([
                'error' => 'Article not found',
            ]);
    }

    public function test_delete_article_fails_for_nonexistent_lesson(): void
    {
        $response = $this->actingAs($this->teacher)
            ->deleteJson('/lessons/999/article');

        $response->assertNotFound();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Read Article Tests (Student View)
    // ─────────────────────────────────────────────────────────────────────────

    public function test_student_can_read_article(): void
    {
        $article = Article::factory()->create(['lesson_id' => $this->lesson->id]);

        $response = $this->actingAs($this->student)
            ->getJson("/lessons/{$this->lesson->id}/article/read");

        $response->assertOk()
            ->assertJsonStructure([
                'article' => ['id', 'content', 'word_count', 'estimated_read_time_minutes'],
            ]);
    }

    public function test_read_article_returns_404_when_no_article_exists(): void
    {
        $response = $this->actingAs($this->student)
            ->getJson("/lessons/{$this->lesson->id}/article/read");

        $response->assertNotFound()
            ->assertJson([
                'error' => 'Article not found',
            ]);
    }

    public function test_guest_cannot_read_article(): void
    {
        $article = Article::factory()->create(['lesson_id' => $this->lesson->id]);

        $response = $this->getJson("/lessons/{$this->lesson->id}/article/read");

        $response->assertUnauthorized();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Authorization Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_non_teacher_cannot_create_article(): void
    {
        $content = ['type' => 'doc', 'content' => []];

        $response = $this->actingAs($this->student)
            ->postJson("/teaching/lessons/{$this->lesson->id}/article", ['content' => $content]);

        $response->assertForbidden();
    }

    public function test_non_course_owner_cannot_create_article(): void
    {
        $otherTeacher = User::factory()->teacher()->create();
        $content = ['type' => 'doc', 'content' => []];

        $response = $this->actingAs($otherTeacher)
            ->postJson("/teaching/lessons/{$this->lesson->id}/article", ['content' => $content]);

        $response->assertForbidden();
    }

    public function test_admin_can_create_article_for_any_course(): void
    {
        $content = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'paragraph',
                    'content' => [
                        ['type' => 'text', 'text' => 'Admin created article.'],
                    ],
                ],
            ],
        ];

        $response = $this->actingAs($this->admin)
            ->postJson("/teaching/lessons/{$this->lesson->id}/article", ['content' => $content]);

        $response->assertOk()
            ->assertJson([
                'message' => 'Article saved successfully',
            ]);
    }

    public function test_non_course_owner_cannot_delete_article(): void
    {
        $article = Article::factory()->create(['lesson_id' => $this->lesson->id]);
        $otherTeacher = User::factory()->teacher()->create();

        $response = $this->actingAs($otherTeacher)
            ->deleteJson("/teaching/lessons/{$this->lesson->id}/article");

        $response->assertForbidden();
    }

    public function test_admin_can_delete_article_for_any_course(): void
    {
        $article = Article::factory()->create(['lesson_id' => $this->lesson->id]);

        $response = $this->actingAs($this->admin)
            ->deleteJson("/teaching/lessons/{$this->lesson->id}/article");

        $response->assertOk()
            ->assertJson([
                'message' => 'Article deleted successfully',
            ]);
    }

    public function test_guest_cannot_access_article_management(): void
    {
        $content = ['type' => 'doc', 'content' => []];

        $this->postJson("/teaching/lessons/{$this->lesson->id}/article", ['content' => $content])
            ->assertUnauthorized();

        $this->deleteJson("/teaching/lessons/{$this->lesson->id}/article")
            ->assertUnauthorized();

        $this->getJson("/teaching/lessons/{$this->lesson->id}/article")
            ->assertUnauthorized();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Service Integration Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_article_word_count_is_calculated_correctly(): void
    {
        $content = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'paragraph',
                    'content' => [
                        ['type' => 'text', 'text' => 'This is exactly ten words for testing word count calculation'],
                    ],
                ],
            ],
        ];

        $response = $this->actingAs($this->teacher)
            ->postJson("/teaching/lessons/{$this->lesson->id}/article", ['content' => $content]);

        $response->assertOk();

        $article = Article::where('lesson_id', $this->lesson->id)->first();
        $this->assertEquals(10, $article->word_count);
        $this->assertEquals(1, $article->estimated_read_time_minutes);
    }

    public function test_article_service_is_called_for_operations(): void
    {
        $articleService = $this->mock(ArticleService::class);

        $content = ['type' => 'doc', 'content' => []];

        $articleService->shouldReceive('upsert')
            ->once()
            ->with($this->lesson->id, $content)
            ->andReturn(Article::factory()->make(['lesson_id' => $this->lesson->id]));

        $this->actingAs($this->teacher)
            ->postJson("/teaching/lessons/{$this->lesson->id}/article", ['content' => $content]);
    }
}
