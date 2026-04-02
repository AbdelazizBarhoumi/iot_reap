<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\CourseModule;
use App\Models\Lesson;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
use App\Models\QuizQuestionOption;
use App\Models\User;
use App\Services\QuestionService;
use App\Services\QuizService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QuizControllerTest extends TestCase
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
        $this->lesson = Lesson::factory()->practice()->create(['module_id' => $module->id]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Teacher: Quiz Management Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_teacher_can_view_quiz_edit_page(): void
    {
        $quiz = $this->createQuizWithQuestions();

        $response = $this->actingAs($this->teacher)->get("/teaching/lessons/{$this->lesson->id}/quiz");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('teaching/quiz-edit')
            ->has('lessonId')
            ->has('quiz')
        );
    }

    public function test_teacher_can_view_quiz_edit_page_with_no_quiz(): void
    {
        $response = $this->actingAs($this->teacher)->get("/teaching/lessons/{$this->lesson->id}/quiz");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('teaching/quiz-edit')
            ->where('lessonId', (string) $this->lesson->id)
            ->where('quiz', null)
        );
    }

    public function test_teacher_can_create_quiz(): void
    {
        $quizData = [
            'title' => 'Test Quiz',
            'description' => 'A test quiz for learning',
            'passing_score' => 70,
            'time_limit_minutes' => 30,
            'max_attempts' => 3,
            'shuffle_questions' => true,
            'shuffle_options' => false,
            'show_correct_answers' => true,
        ];

        $response = $this->actingAs($this->teacher)
            ->postJson("/teaching/lessons/{$this->lesson->id}/quiz", $quizData);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Quiz created successfully',
            ])
            ->assertJsonStructure([
                'quiz' => ['id', 'title', 'description', 'passing_score'],
            ]);

        $this->assertDatabaseHas('quizzes', [
            'lesson_id' => $this->lesson->id,
            'title' => 'Test Quiz',
            'passing_score' => 70,
        ]);
    }

    public function test_cannot_create_quiz_when_one_already_exists(): void
    {
        $this->createQuizWithQuestions();

        $quizData = [
            'title' => 'Another Quiz',
            'passing_score' => 80,
        ];

        $response = $this->actingAs($this->teacher)
            ->postJson("/teaching/lessons/{$this->lesson->id}/quiz", $quizData);

        $response->assertStatus(422)
            ->assertJson([
                'error' => 'Quiz already exists for this lesson',
            ]);
    }

    public function test_teacher_can_update_quiz(): void
    {
        $quiz = $this->createQuizWithQuestions();

        $updateData = [
            'title' => 'Updated Quiz Title',
            'description' => 'Updated description',
            'passing_score' => 80,
        ];

        $response = $this->actingAs($this->teacher)
            ->patchJson("/teaching/quizzes/{$quiz->id}", $updateData);

        $response->assertOk()
            ->assertJson([
                'message' => 'Quiz updated successfully',
            ]);

        $quiz->refresh();
        $this->assertEquals('Updated Quiz Title', $quiz->title);
        $this->assertEquals(80, $quiz->passing_score);
    }

    public function test_teacher_can_delete_quiz(): void
    {
        $quiz = $this->createQuizWithQuestions();

        $response = $this->actingAs($this->teacher)
            ->deleteJson("/teaching/quizzes/{$quiz->id}");

        $response->assertOk()
            ->assertJson([
                'message' => 'Quiz deleted successfully',
            ]);

        $this->assertDatabaseMissing('quizzes', ['id' => $quiz->id]);
    }

    public function test_teacher_can_publish_quiz(): void
    {
        $quiz = $this->createQuizWithQuestions();

        $response = $this->actingAs($this->teacher)
            ->postJson("/teaching/quizzes/{$quiz->id}/publish");

        $response->assertOk()
            ->assertJson([
                'message' => 'Quiz published successfully',
            ]);

        $quiz->refresh();
        $this->assertTrue($quiz->is_published);
    }

    public function test_teacher_can_unpublish_quiz(): void
    {
        $quiz = $this->createQuizWithQuestions();
        $quiz->update(['is_published' => true]);

        $response = $this->actingAs($this->teacher)
            ->postJson("/teaching/quizzes/{$quiz->id}/unpublish");

        $response->assertOk()
            ->assertJson([
                'message' => 'Quiz unpublished successfully',
            ]);

        $quiz->refresh();
        $this->assertFalse($quiz->is_published);
    }

    public function test_cannot_publish_quiz_without_questions(): void
    {
        $quiz = Quiz::factory()->create(['lesson_id' => $this->lesson->id]);

        $response = $this->actingAs($this->teacher)
            ->postJson("/teaching/quizzes/{$quiz->id}/publish");

        $response->assertStatus(422)
            ->assertJsonStructure(['error']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Teacher: Question Management Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_teacher_can_add_question_to_quiz(): void
    {
        $quiz = Quiz::factory()->create(['lesson_id' => $this->lesson->id]);

        $questionData = [
            'question' => 'What is 2 + 2?',
            'type' => 'multiple_choice',
            'points' => 5,
            'options' => [
                ['option_text' => '3', 'is_correct' => false],
                ['option_text' => '4', 'is_correct' => true],
                ['option_text' => '5', 'is_correct' => false],
            ],
        ];

        $response = $this->actingAs($this->teacher)
            ->postJson("/teaching/quizzes/{$quiz->id}/questions", $questionData);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Question added successfully',
            ])
            ->assertJsonStructure([
                'question' => ['id', 'question', 'type', 'points', 'options'],
            ]);

        $this->assertDatabaseHas('quiz_questions', [
            'quiz_id' => $quiz->id,
            'question' => 'What is 2 + 2?',
            'points' => 5,
        ]);

        $this->assertDatabaseHas('quiz_question_options', [
            'option_text' => '4',
            'is_correct' => true,
        ]);
    }

    public function test_teacher_can_update_question(): void
    {
        $quiz = $this->createQuizWithQuestions();
        $question = $quiz->questions->first();

        $updateData = [
            'question' => 'Updated question text?',
            'type' => 'multiple_choice',
            'points' => 10,
            'options' => [
                ['option_text' => 'Option A', 'is_correct' => true],
                ['option_text' => 'Option B', 'is_correct' => false],
            ],
        ];

        $response = $this->actingAs($this->teacher)
            ->patchJson("/teaching/questions/{$question->id}", $updateData);

        $response->assertOk()
            ->assertJson([
                'message' => 'Question updated successfully',
            ]);

        $question->refresh();
        $this->assertEquals('Updated question text?', $question->question);
        $this->assertEquals(10, $question->points);
    }

    public function test_teacher_can_delete_question(): void
    {
        $quiz = $this->createQuizWithQuestions();
        $question = $quiz->questions->first();

        $response = $this->actingAs($this->teacher)
            ->deleteJson("/teaching/questions/{$question->id}");

        $response->assertOk()
            ->assertJson([
                'message' => 'Question deleted successfully',
            ]);

        $this->assertDatabaseMissing('quiz_questions', ['id' => $question->id]);
    }

    public function test_teacher_can_reorder_questions(): void
    {
        $quiz = $this->createQuizWithQuestions();
        $questions = $quiz->questions;

        $reorderData = [
            'items' => [
                ['id' => $questions[1]->id, 'sort_order' => 0],
                ['id' => $questions[0]->id, 'sort_order' => 1],
            ],
        ];

        $response = $this->actingAs($this->teacher)
            ->postJson("/teaching/quizzes/{$quiz->id}/reorder", $reorderData);

        $response->assertOk()
            ->assertJson([
                'message' => 'Questions reordered successfully',
            ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Student: Quiz Taking Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_student_can_view_published_quiz(): void
    {
        $quiz = $this->createQuizWithQuestions();
        $quiz->update(['is_published' => true]);

        $response = $this->actingAs($this->student)
            ->getJson("/lessons/{$this->lesson->id}/quiz");

        $response->assertOk()
            ->assertJsonStructure([
                'quiz' => ['id', 'title', 'description'],
                'can_attempt',
                'attempt_count',
                'max_attempts',
            ]);
    }

    public function test_student_cannot_view_unpublished_quiz(): void
    {
        $quiz = $this->createQuizWithQuestions();

        $response = $this->actingAs($this->student)
            ->getJson("/lessons/{$this->lesson->id}/quiz");

        $response->assertNotFound()
            ->assertJson(['error' => 'Quiz not found']);
    }

    public function test_student_can_start_quiz_attempt(): void
    {
        $quiz = $this->createQuizWithQuestions();
        $quiz->update(['is_published' => true]);

        $response = $this->actingAs($this->student)
            ->postJson("/quizzes/{$quiz->id}/start");

        $response->assertOk()
            ->assertJson([
                'message' => 'Quiz attempt started',
            ])
            ->assertJsonStructure([
                'attempt' => ['id', 'user_id', 'quiz_id', 'started_at'],
                'quiz' => ['questions'],
            ]);

        $this->assertDatabaseHas('quiz_attempts', [
            'user_id' => $this->student->id,
            'quiz_id' => $quiz->id,
        ]);
    }

    public function test_student_can_submit_quiz_attempt(): void
    {
        $quiz = $this->createQuizWithQuestions();
        $quiz->update(['is_published' => true]);

        // Load questions with options explicitly for total_points calculation
        $quiz = $quiz->load('questions.options');
        
        // Must set total_points from quiz questions sum
        $attempt = QuizAttempt::factory()->create([
            'user_id' => $this->student->id,
            'quiz_id' => $quiz->id,
            'total_points' => $quiz->total_points,
        ]);

        $question = $quiz->questions->first();
        $correctOption = $question->options->where('is_correct', true)->first();

        $answers = [
            [
                'question_id' => $question->id,
                'selected_option_id' => $correctOption->id,
            ],
        ];

        $response = $this->actingAs($this->student)
            ->postJson("/quiz-attempts/{$attempt->id}/submit", ['answers' => $answers]);

        $response->assertOk()
            ->assertJsonStructure([
                'message',
                'attempt' => ['id', 'score', 'percentage', 'passed'],
                'results',
            ]);

        $attempt->refresh();
        $this->assertNotNull($attempt->completed_at);
        $this->assertGreaterThan(0, $attempt->score);
    }

    public function test_student_can_view_attempt_history(): void
    {
        $quiz = $this->createQuizWithQuestions();
        $quiz->update(['is_published' => true]);

        // Create completed attempts
        QuizAttempt::factory()->count(2)->create([
            'user_id' => $this->student->id,
            'quiz_id' => $quiz->id,
            'completed_at' => now(),
        ]);

        $response = $this->actingAs($this->student)
            ->getJson("/quizzes/{$quiz->id}/history");

        $response->assertOk()
            ->assertJsonStructure([
                'attempts' => [
                    '*' => ['id', 'score', 'percentage', 'passed', 'completed_at'],
                ],
            ]);
    }

    public function test_student_can_view_specific_attempt_results(): void
    {
        $quiz = $this->createQuizWithQuestions();
        $attempt = QuizAttempt::factory()->create([
            'user_id' => $this->student->id,
            'quiz_id' => $quiz->id,
            'completed_at' => now(),
        ]);

        $response = $this->actingAs($this->student)
            ->getJson("/quiz-attempts/{$attempt->id}");

        $response->assertOk()
            ->assertJsonStructure([
                'attempt' => ['id', 'user_id', 'quiz_id', 'answers'],
            ]);
    }

    public function test_student_cannot_view_other_users_attempts(): void
    {
        $otherUser = User::factory()->create();
        $quiz = $this->createQuizWithQuestions();
        $attempt = QuizAttempt::factory()->create([
            'user_id' => $otherUser->id,
            'quiz_id' => $quiz->id,
        ]);

        $response = $this->actingAs($this->student)
            ->getJson("/quiz-attempts/{$attempt->id}");

        $response->assertForbidden()
            ->assertJson(['error' => 'Unauthorized']);
    }

    public function test_student_cannot_exceed_max_attempts(): void
    {
        $quiz = $this->createQuizWithQuestions();
        $quiz->update(['is_published' => true, 'max_attempts' => 1]);

        // Create a completed attempt
        QuizAttempt::factory()->create([
            'user_id' => $this->student->id,
            'quiz_id' => $quiz->id,
            'completed_at' => now(),
        ]);

        $response = $this->actingAs($this->student)
            ->postJson("/quizzes/{$quiz->id}/start");

        $response->assertStatus(422)
            ->assertJsonStructure(['error']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Teacher: Quiz Statistics Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_teacher_can_view_quiz_statistics(): void
    {
        $quiz = $this->createQuizWithQuestions();

        // Create some attempts for statistics
        QuizAttempt::factory()->count(3)->create([
            'quiz_id' => $quiz->id,
            'completed_at' => now(),
        ]);

        $response = $this->actingAs($this->teacher)
            ->getJson("/teaching/quizzes/{$quiz->id}/stats");

        $response->assertOk()
            ->assertJsonStructure(['stats']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Authorization Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_non_course_owner_cannot_manage_quiz(): void
    {
        $otherTeacher = User::factory()->teacher()->create();
        $quiz = $this->createQuizWithQuestions();

        $this->actingAs($otherTeacher)
            ->postJson("/teaching/lessons/{$this->lesson->id}/quiz", ['title' => 'Test'])
            ->assertForbidden();

        $this->actingAs($otherTeacher)
            ->patchJson("/teaching/quizzes/{$quiz->id}", ['title' => 'Updated'])
            ->assertForbidden();

        $this->actingAs($otherTeacher)
            ->deleteJson("/teaching/quizzes/{$quiz->id}")
            ->assertForbidden();
    }

    public function test_admin_can_manage_any_quiz(): void
    {
        $quiz = $this->createQuizWithQuestions();

        $response = $this->actingAs($this->admin)
            ->patchJson("/teaching/quizzes/{$quiz->id}", [
                'title' => 'Admin Updated Title',
                'passing_score' => 90,
            ]);

        $response->assertOk();

        $quiz->refresh();
        $this->assertEquals('Admin Updated Title', $quiz->title);
    }

    public function test_guest_cannot_access_quiz_endpoints(): void
    {
        $quiz = $this->createQuizWithQuestions();

        $this->postJson("/teaching/lessons/{$this->lesson->id}/quiz", ['title' => 'Test'])
            ->assertUnauthorized();

        $this->getJson("/lessons/{$this->lesson->id}/quiz")
            ->assertUnauthorized();

        $this->postJson("/quizzes/{$quiz->id}/start")
            ->assertUnauthorized();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Validation Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_create_quiz_validates_required_fields(): void
    {
        $response = $this->actingAs($this->teacher)
            ->postJson("/teaching/lessons/{$this->lesson->id}/quiz", []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title']);
    }

    public function test_create_question_validates_required_fields(): void
    {
        $quiz = Quiz::factory()->create(['lesson_id' => $this->lesson->id]);

        $response = $this->actingAs($this->teacher)
            ->postJson("/teaching/quizzes/{$quiz->id}/questions", []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['question', 'type']);
    }

    public function test_quiz_creation_validates_score_range(): void
    {
        $response = $this->actingAs($this->teacher)
            ->postJson("/teaching/lessons/{$this->lesson->id}/quiz", [
                'title' => 'Test Quiz',
                'passing_score' => 150, // Invalid - over 100
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['passing_score']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Service Integration Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_quiz_service_is_called_for_operations(): void
    {
        // This is a functional test - services are called through the request
        $quizData = ['title' => 'Test Quiz', 'passing_score' => 70];

        $response = $this->actingAs($this->teacher)
            ->postJson("/teaching/lessons/{$this->lesson->id}/quiz", $quizData);

        $response->assertStatus(201);
        $this->assertDatabaseHas('quizzes', ['title' => 'Test Quiz']);
    }

    public function test_question_service_is_called_for_question_operations(): void
    {
        // This is a functional test - services are called through the request
        $quiz = Quiz::factory()->create(['lesson_id' => $this->lesson->id]);

        $questionData = [
            'question' => 'Test Question',
            'type' => 'multiple_choice',
            'points' => 5,
            'options' => [
                ['option_text' => 'Option A', 'is_correct' => true],
                ['option_text' => 'Option B', 'is_correct' => false],
            ],
        ];

        $response = $this->actingAs($this->teacher)
            ->postJson("/teaching/quizzes/{$quiz->id}/questions", $questionData);

        $response->assertStatus(201);
        $this->assertDatabaseHas('quiz_questions', ['question' => 'Test Question']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helper Methods
    // ─────────────────────────────────────────────────────────────────────────

    private function createQuizWithQuestions(): Quiz
    {
        $quiz = Quiz::factory()->create(['lesson_id' => $this->lesson->id]);

        // Create questions with options
        for ($i = 0; $i < 2; $i++) {
            $question = QuizQuestion::factory()->create([
                'quiz_id' => $quiz->id,
                'question' => 'Question '.($i + 1).'?',
                'sort_order' => $i,
            ]);

            // Create options for each question
            QuizQuestionOption::factory()->create([
                'question_id' => $question->id,
                'option_text' => 'Correct Answer',
                'is_correct' => true,
            ]);

            QuizQuestionOption::factory()->count(2)->create([
                'question_id' => $question->id,
                'is_correct' => false,
            ]);
        }

        return $quiz->load('questions.options');
    }
}
