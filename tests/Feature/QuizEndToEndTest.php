<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Quiz;
use App\Models\TrainingPath;
use App\Models\TrainingPathModule;
use App\Models\TrainingUnit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QuizEndToEndTest extends TestCase
{
    use RefreshDatabase;

    private User $teacher;

    private User $engineer;

    private TrainingUnit $trainingUnit;

    protected function setUp(): void
    {
        parent::setUp();

        $this->teacher = User::factory()->teacher()->create();
        $this->engineer = User::factory()->create(['role' => UserRole::ENGINEER]);

        $trainingPath = TrainingPath::factory()->approved()->create(['instructor_id' => $this->teacher->id]);
        $module = TrainingPathModule::factory()->create(['training_path_id' => $trainingPath->id]);
        $this->trainingUnit = TrainingUnit::factory()->practice()->create(['module_id' => $module->id]);
    }

    public function test_quiz_lifecycle_end_to_end(): void
    {
        // 1. Teacher creates a quiz
        $quizData = [
            'title' => 'E2E Assessment',
            'description' => 'Testing everything from start to finish',
            'passing_score' => 70,
            'show_correct_answers' => true,
        ];

        $response = $this->actingAs($this->teacher)
            ->postJson("/teaching/trainingUnits/{$this->trainingUnit->id}/quiz", $quizData);

        $response->assertStatus(201);
        $quizId = $response->json('quiz.id');

        // 2. Teacher adds questions
        // Multiple Choice
        $this->actingAs($this->teacher)->postJson("/teaching/quizzes/{$quizId}/questions", [
            'question' => 'What is the capital of France?',
            'type' => 'multiple_choice',
            'points' => 10,
            'options' => [
                ['option_text' => 'London', 'is_correct' => false],
                ['option_text' => 'Paris', 'is_correct' => true],
                ['option_text' => 'Berlin', 'is_correct' => false],
            ],
        ])->assertStatus(201);

        // Short Answer
        $this->actingAs($this->teacher)->postJson("/teaching/quizzes/{$quizId}/questions", [
            'question' => 'What is 5 + 5?',
            'type' => 'short_answer',
            'points' => 5,
            'options' => [
                ['option_text' => '10', 'is_correct' => true],
            ],
        ])->assertStatus(201);

        // 3. Teacher publishes the quiz
        $this->actingAs($this->teacher)->postJson("/teaching/quizzes/{$quizId}/publish")
            ->assertOk();

        // 4. Engineer views the quiz
        $response = $this->actingAs($this->engineer)->getJson("/trainingUnits/{$this->trainingUnit->id}/quiz");
        $response->assertOk()
            ->assertJsonPath('quiz.title', 'E2E Assessment');

        // 5. Engineer starts an attempt
        $response = $this->actingAs($this->engineer)->postJson("/quizzes/{$quizId}/start");
        $response->assertOk();
        $attemptId = $response->json('attempt.id');
        $questions = $response->json('quiz.questions');

        $mcQuestion = collect($questions)->where('type', 'multiple_choice')->first();
        $saQuestion = collect($questions)->where('type', 'short_answer')->first();
        $parisOption = collect($mcQuestion['options'])->where('option_text', 'Paris')->first();

        // 6. Engineer submits the attempt
        $answers = [
            [
                'question_id' => $mcQuestion['id'],
                'selected_option_id' => $parisOption['id'],
            ],
            [
                'question_id' => $saQuestion['id'],
                'text_answer' => '10',
            ],
        ];

        $response = $this->actingAs($this->engineer)
            ->postJson("/quiz-attempts/{$attemptId}/submit", ['answers' => $answers]);

        $response->assertOk()
            ->assertJsonPath('attempt.passed', true)
            ->assertJsonPath('attempt.score', 15)
            ->assertJsonPath('attempt.percentage', 100);

        // 7. Verify training unit progress is updated
        $this->assertDatabaseHas('training_unit_progress', [
            'user_id' => $this->engineer->id,
            'training_unit_id' => $this->trainingUnit->id,
            'quiz_passed' => true,
            'completed' => true,
        ]);

        // 8. Engineer views the results (final stage)
        $response = $this->actingAs($this->engineer)->getJson("/quiz-attempts/{$attemptId}");
        $response->assertOk()
            ->assertJsonStructure([
                'attempt' => [
                    'score',
                    'percentage',
                    'passed',
                    'answers' => [
                        '*' => [
                            'question_id',
                            'is_correct',
                            'text_answer',
                            'selected_option_id',
                        ],
                    ],
                ],
            ]);

        // Check if correct answers are included in the detail view because show_correct_answers is true
        // The results in QuizResults.tsx reconstruct correct answers from quiz.questions
    }
}
