<?php

namespace Tests\Feature\Security;

use App\Models\Article;
use App\Models\Course;
use App\Models\CourseModule;
use App\Models\Lesson;
use App\Models\User;
use Tests\TestCase;

/**
 * IDOR security tests for ArticleController.
 *
 * Verifies that teachers cannot edit or delete articles for lessons
 * in courses they do not own.
 */
class ArticleIdorTest extends TestCase
{
    private User $teacher;

    private User $otherTeacher;

    private Lesson $ownLesson;

    private Lesson $otherTeachersLesson;

    protected function setUp(): void
    {
        parent::setUp();

        // Create two teachers
        $this->teacher = User::factory()->teacher()->create();
        $this->otherTeacher = User::factory()->teacher()->create();

        // Create a course owned by the authenticated teacher
        $ownCourse = Course::factory()->create([
            'instructor_id' => $this->teacher->id,
        ]);
        $ownModule = CourseModule::factory()->create([
            'course_id' => $ownCourse->id,
        ]);
        $this->ownLesson = Lesson::factory()->create([
            'module_id' => $ownModule->id,
        ]);

        // Create a course owned by another teacher
        $otherCourse = Course::factory()->create([
            'instructor_id' => $this->otherTeacher->id,
        ]);
        $otherModule = CourseModule::factory()->create([
            'course_id' => $otherCourse->id,
        ]);
        $this->otherTeachersLesson = Lesson::factory()->create([
            'module_id' => $otherModule->id,
        ]);
    }

    public function test_teacher_cannot_create_article_for_another_teachers_lesson(): void
    {
        $response = $this->actingAs($this->teacher)
            ->postJson("/teaching/lessons/{$this->otherTeachersLesson->id}/article", [
                'content' => [
                    'type' => 'doc',
                    'content' => [
                        [
                            'type' => 'paragraph',
                            'content' => [
                                ['type' => 'text', 'text' => 'Attempting to create unauthorized article'],
                            ],
                        ],
                    ],
                ],
            ]);

        $response->assertForbidden();

        // Verify no article was created
        $this->assertDatabaseMissing('articles', [
            'lesson_id' => $this->otherTeachersLesson->id,
        ]);
    }

    public function test_teacher_can_create_article_for_own_lesson(): void
    {
        $response = $this->actingAs($this->teacher)
            ->postJson("/teaching/lessons/{$this->ownLesson->id}/article", [
                'content' => [
                    'type' => 'doc',
                    'content' => [
                        [
                            'type' => 'paragraph',
                            'content' => [
                                ['type' => 'text', 'text' => 'This is my article content'],
                            ],
                        ],
                    ],
                ],
            ]);

        $response->assertOk();

        $this->assertDatabaseHas('articles', [
            'lesson_id' => $this->ownLesson->id,
        ]);
    }

    public function test_teacher_cannot_update_article_for_another_teachers_lesson(): void
    {
        // Create an article for the other teacher's lesson
        Article::create([
            'lesson_id' => $this->otherTeachersLesson->id,
            'content' => [
                'type' => 'doc',
                'content' => [
                    [
                        'type' => 'paragraph',
                        'content' => [
                            ['type' => 'text', 'text' => 'Original content'],
                        ],
                    ],
                ],
            ],
        ]);

        $response = $this->actingAs($this->teacher)
            ->postJson("/teaching/lessons/{$this->otherTeachersLesson->id}/article", [
                'content' => [
                    'type' => 'doc',
                    'content' => [
                        [
                            'type' => 'paragraph',
                            'content' => [
                                ['type' => 'text', 'text' => 'Trying to modify unauthorized article'],
                            ],
                        ],
                    ],
                ],
            ]);

        $response->assertForbidden();

        // Verify article was not modified (check lesson_id only since content is JSON)
        $this->assertDatabaseHas('articles', [
            'lesson_id' => $this->otherTeachersLesson->id,
        ]);

        // Verify content wasn't changed by checking the text content
        $article = Article::where('lesson_id', $this->otherTeachersLesson->id)->first();
        $this->assertEquals('Original content', $article->content['content'][0]['content'][0]['text']);
    }

    public function test_teacher_cannot_delete_article_for_another_teachers_lesson(): void
    {
        // Create an article for the other teacher's lesson
        Article::create([
            'lesson_id' => $this->otherTeachersLesson->id,
            'content' => [
                'type' => 'doc',
                'content' => [
                    [
                        'type' => 'paragraph',
                        'content' => [
                            ['type' => 'text', 'text' => 'Article to be protected'],
                        ],
                    ],
                ],
            ],
        ]);

        $response = $this->actingAs($this->teacher)
            ->deleteJson("/teaching/lessons/{$this->otherTeachersLesson->id}/article");

        $response->assertForbidden();

        // Verify article still exists
        $this->assertDatabaseHas('articles', [
            'lesson_id' => $this->otherTeachersLesson->id,
        ]);
    }

    public function test_teacher_can_delete_article_for_own_lesson(): void
    {
        Article::create([
            'lesson_id' => $this->ownLesson->id,
            'content' => [
                'type' => 'doc',
                'content' => [
                    [
                        'type' => 'paragraph',
                        'content' => [
                            ['type' => 'text', 'text' => 'My article to delete'],
                        ],
                    ],
                ],
            ],
        ]);

        $response = $this->actingAs($this->teacher)
            ->deleteJson("/teaching/lessons/{$this->ownLesson->id}/article");

        $response->assertOk();

        $this->assertDatabaseMissing('articles', [
            'lesson_id' => $this->ownLesson->id,
        ]);
    }

    public function test_admin_can_edit_any_lesson_article(): void
    {
        $admin = User::factory()->admin()->create();

        Article::create([
            'lesson_id' => $this->otherTeachersLesson->id,
            'content' => [
                'type' => 'doc',
                'content' => [
                    [
                        'type' => 'paragraph',
                        'content' => [
                            ['type' => 'text', 'text' => 'Original content'],
                        ],
                    ],
                ],
            ],
        ]);

        $response = $this->actingAs($admin)
            ->postJson("/teaching/lessons/{$this->otherTeachersLesson->id}/article", [
                'content' => [
                    'type' => 'doc',
                    'content' => [
                        [
                            'type' => 'paragraph',
                            'content' => [
                                ['type' => 'text', 'text' => 'Admin edited content'],
                            ],
                        ],
                    ],
                ],
            ]);

        $response->assertOk();

        // Verify article was updated by checking the content text
        $article = Article::where('lesson_id', $this->otherTeachersLesson->id)->first();
        $this->assertEquals('Admin edited content', $article->content['content'][0]['content'][0]['text']);
    }

    public function test_unauthenticated_user_cannot_modify_article(): void
    {
        $response = $this->postJson("/teaching/lessons/{$this->ownLesson->id}/article", [
            'content' => [
                'type' => 'doc',
                'content' => [
                    [
                        'type' => 'paragraph',
                        'content' => [
                            ['type' => 'text', 'text' => 'Anonymous content'],
                        ],
                    ],
                ],
            ],
        ]);

        $response->assertUnauthorized();
    }

    public function test_non_teacher_cannot_modify_article(): void
    {
        $student = User::factory()->engineer()->create();

        $response = $this->actingAs($student)
            ->postJson("/teaching/lessons/{$this->ownLesson->id}/article", [
                'content' => [
                    'type' => 'doc',
                    'content' => [
                        [
                            'type' => 'paragraph',
                            'content' => [
                                ['type' => 'text', 'text' => 'Student trying to create article'],
                            ],
                        ],
                    ],
                ],
            ]);

        // Should be forbidden (role-based)
        $response->assertForbidden();
    }
}
