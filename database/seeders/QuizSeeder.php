<?php

namespace Database\Seeders;

use App\Enums\QuizQuestionType;
use App\Models\TrainingPath;
use App\Models\TrainingPathEnrollment;
use App\Models\TrainingUnit;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
use App\Models\QuizQuestionOption;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Seeds quizzes, questions, and quiz attempts.
 */
class QuizSeeder extends Seeder
{
    public function run(): void
    {
        $trainingUnits = TrainingUnit::all();

        if ($trainingUnits->isEmpty()) {
            $this->command->warn('No trainingUnits found. Skipping quizzes.');
            return;
        }

        // Create 1 quiz per trainingUnit (50% chance)
        foreach ($trainingUnits as $trainingUnit) {
            if (rand(0, 1) === 0) {
                continue;
            }

            $this->createQuizWithQuestions($trainingUnit);
        }

        // Create quiz attempts for enrolled users
        $this->seedQuizAttempts();

        $this->command->info('Seeded quizzes and attempts.');
    }

    /**
     * Create a quiz with questions and options.
     */
    private function createQuizWithQuestions(TrainingUnit $trainingUnit): void
    {
        $quiz = Quiz::create([
            'training_unit_id' => $trainingUnit->id,
            'title' => 'Quiz: ' . $trainingUnit->title,
            'description' => 'Assessment for ' . $trainingUnit->title,
            'passing_score' => 70,
            'time_limit_minutes' => 30,
            'shuffle_questions' => false,
            'shuffle_options' => false,
            'show_correct_answers' => true,
            'is_published' => true,
        ]);

        // Create 5-8 questions per quiz
        $questionCount = rand(5, 8);
        for ($i = 0; $i < $questionCount; $i++) {
            $this->createQuestion($quiz, $i);
        }
    }

    /**
     * Create a quiz question with options.
     */
    private function createQuestion(Quiz $quiz, int $index): void
    {
        $questionTypes = [
            QuizQuestionType::MULTIPLE_CHOICE,
            QuizQuestionType::TRUE_FALSE,
            QuizQuestionType::SHORT_ANSWER,
        ];

        $type = $questionTypes[array_rand($questionTypes)];

        $question = QuizQuestion::create([
            'quiz_id' => $quiz->id,
            'type' => $type,
            'question' => 'Question ' . ($index + 1) . ': What is the correct answer?',
            'explanation' => 'This is the explanation for question ' . ($index + 1),
            'points' => rand(1, 5),
            'sort_order' => $index,
        ]);

        // Create options based on type
        if ($type === QuizQuestionType::MULTIPLE_CHOICE) {
            $correctAnswer = rand(0, 3);
            for ($i = 0; $i < 4; $i++) {
                QuizQuestionOption::create([
                    'question_id' => $question->id,
                    'option_text' => ['A) Option A', 'B) Option B', 'C) Option C', 'D) Option D'][$i],
                    'is_correct' => $i === $correctAnswer,
                ]);
            }
        } elseif ($type === QuizQuestionType::TRUE_FALSE) {
            QuizQuestionOption::create([
                'question_id' => $question->id,
                'option_text' => 'True',
                'is_correct' => rand(0, 1) === 1,
            ]);
            QuizQuestionOption::create([
                'question_id' => $question->id,
                'option_text' => 'False',
                'is_correct' => rand(0, 1) === 1,
            ]);
        }
    }

    /**
     * Seed quiz attempts for enrolled users.
     */
    private function seedQuizAttempts(): void
    {
        $quizzes = Quiz::with('questions.options')->get();
        $users = User::where('role', 'engineer')->get();

        foreach ($quizzes as $quiz) {
            // 50% chance each user attempts this quiz
            foreach ($users->random(min(2, count($users))) as $user) {
                $score = rand(50, 100);
                QuizAttempt::create([
                    'user_id' => $user->id,
                    'quiz_id' => $quiz->id,
                    'started_at' => now()->subDays(rand(1, 30)),
                    'completed_at' => now()->subDays(rand(0, 30)),
                    'score' => $score,
                    'total_points' => 100,
                    'percentage' => $score,
                    'passed' => $score >= $quiz->passing_score,
                ]);
            }
        }
    }
}
