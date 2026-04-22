<?php

namespace Tests\Feature\Security;

use App\Models\Article;
use App\Models\TrainingPath;
use App\Models\TrainingPathModule;
use App\Models\TrainingUnit;
use App\Models\User;
use Tests\TestCase;

/**
 * IDOR security tests for ArticleController.
 *
 * Verifies that teachers cannot edit or delete articles for trainingUnits
 * in trainingPaths they do not own.
 */
class ArticleIdorTest extends TestCase
{
    private User $teacher;

    private User $otherTeacher;

    private TrainingUnit $ownTrainingUnit;

    private TrainingUnit $otherTeachersTrainingUnit;

    protected function setUp(): void
    {
        parent::setUp();

        // Create two teachers
        $this->teacher = User::factory()->teacher()->create();
        $this->otherTeacher = User::factory()->teacher()->create();

        // Create a trainingPath owned by the authenticated teacher
        $ownTrainingPath = TrainingPath::factory()->create([
            'instructor_id' => $this->teacher->id,
        ]);
        $ownModule = TrainingPathModule::factory()->create([
            'training_path_id' => $ownTrainingPath->id,
        ]);
        $this->ownTrainingUnit = TrainingUnit::factory()->create([
            'module_id' => $ownModule->id,
        ]);

        // Create a trainingPath owned by another teacher
        $otherTrainingPath = TrainingPath::factory()->create([
            'instructor_id' => $this->otherTeacher->id,
        ]);
        $otherModule = TrainingPathModule::factory()->create([
            'training_path_id' => $otherTrainingPath->id,
        ]);
        $this->otherTeachersTrainingUnit = TrainingUnit::factory()->create([
            'module_id' => $otherModule->id,
        ]);
    }

    public function test_teacher_cannot_create_article_for_another_teachers_training_unit(): void
    {
        $response = $this->actingAs($this->teacher)
            ->postJson("/teaching/trainingUnits/{$this->otherTeachersTrainingUnit->id}/article", [
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
            'training_unit_id' => $this->otherTeachersTrainingUnit->id,
        ]);
    }

    public function test_teacher_can_create_article_for_own_training_unit(): void
    {
        $response = $this->actingAs($this->teacher)
            ->postJson("/teaching/trainingUnits/{$this->ownTrainingUnit->id}/article", [
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
            'training_unit_id' => $this->ownTrainingUnit->id,
        ]);
    }

    public function test_teacher_cannot_update_article_for_another_teachers_training_unit(): void
    {
        // Create an article for the other teacher's trainingUnit
        Article::create([
            'training_unit_id' => $this->otherTeachersTrainingUnit->id,
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
            ->postJson("/teaching/trainingUnits/{$this->otherTeachersTrainingUnit->id}/article", [
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

        // Verify article was not modified (check training_unit_id only since content is JSON)
        $this->assertDatabaseHas('articles', [
            'training_unit_id' => $this->otherTeachersTrainingUnit->id,
        ]);

        // Verify content wasn't changed by checking the text content
        $article = Article::where('training_unit_id', $this->otherTeachersTrainingUnit->id)->first();
        $this->assertEquals('Original content', $article->content['content'][0]['content'][0]['text']);
    }

    public function test_teacher_cannot_delete_article_for_another_teachers_training_unit(): void
    {
        // Create an article for the other teacher's trainingUnit
        Article::create([
            'training_unit_id' => $this->otherTeachersTrainingUnit->id,
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
            ->deleteJson("/teaching/trainingUnits/{$this->otherTeachersTrainingUnit->id}/article");

        $response->assertForbidden();

        // Verify article still exists
        $this->assertDatabaseHas('articles', [
            'training_unit_id' => $this->otherTeachersTrainingUnit->id,
        ]);
    }

    public function test_teacher_can_delete_article_for_own_training_unit(): void
    {
        Article::create([
            'training_unit_id' => $this->ownTrainingUnit->id,
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
            ->deleteJson("/teaching/trainingUnits/{$this->ownTrainingUnit->id}/article");

        $response->assertOk();

        $this->assertDatabaseMissing('articles', [
            'training_unit_id' => $this->ownTrainingUnit->id,
        ]);
    }

    public function test_admin_can_edit_any_training_unit_article(): void
    {
        $admin = User::factory()->admin()->create();

        Article::create([
            'training_unit_id' => $this->otherTeachersTrainingUnit->id,
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
            ->postJson("/teaching/trainingUnits/{$this->otherTeachersTrainingUnit->id}/article", [
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
        $article = Article::where('training_unit_id', $this->otherTeachersTrainingUnit->id)->first();
        $this->assertEquals('Admin edited content', $article->content['content'][0]['content'][0]['text']);
    }

    public function test_unauthenticated_user_cannot_modify_article(): void
    {
        $response = $this->postJson("/teaching/trainingUnits/{$this->ownTrainingUnit->id}/article", [
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
            ->postJson("/teaching/trainingUnits/{$this->ownTrainingUnit->id}/article", [
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
