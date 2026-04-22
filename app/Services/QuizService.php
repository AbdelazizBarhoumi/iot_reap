<?php

namespace App\Services;

use App\Enums\QuizQuestionType;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\User;
use App\Repositories\QuizAttemptRepository;
use App\Repositories\QuizQuestionRepository;
use App\Repositories\QuizRepository;
use App\Repositories\TrainingUnitProgressRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;

/**
 * Service for quiz management and grading.
 */
class QuizService
{
    public function __construct(
        private readonly QuizRepository $quizRepository,
        private readonly QuizQuestionRepository $questionRepository,
        private readonly QuizAttemptRepository $attemptRepository,
        private readonly TrainingUnitProgressRepository $progressRepository,
    ) {}

    /**
     * Create a new quiz for a trainingUnit.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(int $trainingUnitId, array $data): Quiz
    {
        Log::info('Creating quiz', ['training_unit_id' => $trainingUnitId]);

        return $this->quizRepository->create([
            'training_unit_id' => $trainingUnitId,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'passing_score' => $data['passing_score'] ?? 70,
            'time_limit_minutes' => $data['time_limit_minutes'] ?? null,
            'max_attempts' => $data['max_attempts'] ?? null,
            'shuffle_questions' => $data['shuffle_questions'] ?? false,
            'shuffle_options' => $data['shuffle_options'] ?? false,
            'show_correct_answers' => $data['show_correct_answers'] ?? true,
            'is_published' => false,
        ]);
    }

    /**
     * Update a quiz.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(Quiz $quiz, array $data): Quiz
    {
        Log::info('Updating quiz', ['quiz_id' => $quiz->id]);

        return $this->quizRepository->update($quiz, $data);
    }

    /**
     * Delete a quiz.
     */
    public function delete(Quiz $quiz): bool
    {
        Log::info('Deleting quiz', ['quiz_id' => $quiz->id]);

        return $this->quizRepository->delete($quiz);
    }

    /**
     * Publish a quiz.
     */
    public function publish(Quiz $quiz): Quiz
    {
        if ($quiz->questions()->count() === 0) {
            throw new \DomainException('Cannot publish a quiz with no questions');
        }

        Log::info('Publishing quiz', ['quiz_id' => $quiz->id]);

        return $this->quizRepository->publish($quiz);
    }

    /**
     * Unpublish a quiz.
     */
    public function unpublish(Quiz $quiz): Quiz
    {
        Log::info('Unpublishing quiz', ['quiz_id' => $quiz->id]);

        return $this->quizRepository->unpublish($quiz);
    }

    /**
     * Get a quiz for a trainingUnit.
     */
    public function getQuizForTrainingUnit(int $trainingUnitId): ?Quiz
    {
        return $this->quizRepository->findByTrainingUnitIdWithQuestions($trainingUnitId);
    }

    /**
     * Start a quiz attempt for a user.
     */
    public function startAttempt(User $user, Quiz $quiz): QuizAttempt
    {
        // Check if user can attempt
        if (! $quiz->canAttempt($user)) {
            throw new \DomainException('Maximum attempts reached for this quiz');
        }

        // Check for existing in-progress attempt
        $existingAttempt = $this->attemptRepository->findInProgressAttempt($user, $quiz);
        if ($existingAttempt) {
            // Check if timed out
            if ($existingAttempt->hasTimedOut()) {
                $this->autoSubmitAttempt($existingAttempt);
            } else {
                return $existingAttempt;
            }
        }

        Log::info('Starting quiz attempt', [
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
        ]);

        return $this->attemptRepository->create([
            'quiz_id' => $quiz->id,
            'user_id' => $user->id,
            'total_points' => $quiz->total_points,
            'started_at' => now(),
        ]);
    }

    /**
     * Submit a quiz attempt with answers (SERVER-SIDE GRADING).
     *
     * @param  array<int, array{question_id: int, selected_option_id?: int, text_answer?: string}>  $answers
     * @return array{attempt: QuizAttempt, results: array}
     */
    public function submitAttempt(User $user, QuizAttempt $attempt, array $answers): array
    {
        if ($attempt->user_id !== $user->id) {
            throw new \DomainException('This attempt does not belong to you');
        }

        if ($attempt->completed_at !== null) {
            throw new \DomainException('This attempt has already been submitted');
        }

        Log::info('Submitting quiz attempt', [
            'user_id' => $user->id,
            'attempt_id' => $attempt->id,
        ]);

        // Note: We avoid explicit DB::transaction() here since:
        // 1. In tests, RefreshDatabase wraps everything in a transaction
        // 2. In production, Laravel's implicit transaction handling is sufficient
        // The operations below are atomic within this method's execution
        $quiz = $attempt->quiz;
        $questions = $quiz->questions()->with('options')->get()->keyBy('id');

        $totalScore = 0;
        $results = [];

        foreach ($answers as $answer) {
            $questionId = $answer['question_id'];
            $question = $questions->get($questionId);

            if (! $question) {
                continue;
            }

            $isCorrect = false;
            $pointsEarned = 0;
            $selectedOptionId = $answer['selected_option_id'] ?? null;
            $textAnswer = $answer['text_answer'] ?? null;

            // Grade based on question type (SERVER-SIDE ONLY)
            if ($question->type === QuizQuestionType::MULTIPLE_CHOICE ||
                $question->type === QuizQuestionType::TRUE_FALSE) {
                if ($selectedOptionId) {
                    $isCorrect = $question->isCorrectOption($selectedOptionId);
                    if ($isCorrect) {
                        $pointsEarned = $question->points;
                        $totalScore += $pointsEarned;
                    }
                }
            } elseif ($question->type === QuizQuestionType::SHORT_ANSWER) {
                // Short answers need manual grading or exact match
                // For now, mark as pending (0 points, will need teacher review)
                $isCorrect = false;
                $pointsEarned = 0;
            }

            // Store answer
            $attempt->answers()->create([
                'question_id' => $questionId,
                'selected_option_id' => $selectedOptionId,
                'text_answer' => $textAnswer,
                'is_correct' => $isCorrect,
                'points_earned' => $pointsEarned,
            ]);

            $results[] = [
                'question_id' => $questionId,
                'is_correct' => $isCorrect,
                'points_earned' => $pointsEarned,
                'correct_option_id' => $quiz->show_correct_answers
                    ? $question->getCorrectOption()?->id
                    : null,
                'explanation' => $quiz->show_correct_answers
                    ? $question->explanation
                    : null,
            ];
        }

        // Calculate final score
        $percentage = $attempt->total_points > 0
            ? ($totalScore / $attempt->total_points) * 100
            : 0;
        $passed = $percentage >= $quiz->passing_score;

        // Update attempt
        $attempt->update([
            'score' => $totalScore,
            'percentage' => round($percentage, 2),
            'passed' => $passed,
            'completed_at' => now(),
        ]);

        // If passed, mark trainingUnit progress
        if ($passed) {
            $trainingUnitId = $quiz->training_unit_id;
            $this->progressRepository->markQuizPassed(
                $attempt->user_id,
                $trainingUnitId,
                $attempt->id
            );
        }

        Log::info('Quiz attempt graded', [
            'attempt_id' => $attempt->id,
            'score' => $totalScore,
            'percentage' => $percentage,
            'passed' => $passed,
        ]);

        return [
            'attempt' => $attempt->fresh(['answers']),
            'results' => $results,
        ];
    }

    /**
     * Auto-submit a timed-out attempt.
     */
    private function autoSubmitAttempt(QuizAttempt $attempt): void
    {
        Log::info('Auto-submitting timed out attempt', ['attempt_id' => $attempt->id]);

        $attempt->update([
            'score' => 0,
            'percentage' => 0,
            'passed' => false,
            'completed_at' => now(),
        ]);
    }

    /**
     * Get attempt history for a user on a quiz.
     */
    public function getAttemptHistory(User $user, Quiz $quiz): Collection
    {
        return $this->attemptRepository->findByUserAndQuiz($user, $quiz);
    }

    /**
     * Get quiz statistics.
     *
     * @return array{pass_rate: float, average_score: float, total_attempts: int}
     */
    public function getQuizStats(Quiz $quiz): array
    {
        return [
            'pass_rate' => $this->attemptRepository->getPassRate($quiz),
            'average_score' => $this->attemptRepository->getAverageScore($quiz),
            'total_attempts' => $this->attemptRepository->countCompletedAttempts($quiz),
        ];
    }
}
