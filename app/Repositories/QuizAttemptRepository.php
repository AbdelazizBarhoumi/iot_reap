<?php

namespace App\Repositories;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

/**
 * Repository for QuizAttempt model operations.
 */
class QuizAttemptRepository
{
    /**
     * Find an attempt by ID with answers.
     */
    public function findByIdWithAnswers(int $id): ?QuizAttempt
    {
        return QuizAttempt::with(['answers.question.options', 'answers.selectedOption'])
            ->find($id);
    }

    /**
     * Get all attempts for a user on a quiz.
     */
    public function findByUserAndQuiz(User $user, Quiz $quiz): Collection
    {
        return QuizAttempt::where('user_id', $user->id)
            ->where('quiz_id', $quiz->id)
            ->whereNotNull('completed_at')
            ->orderByDesc('completed_at')
            ->get();
    }

    /**
     * Get the current in-progress attempt for a user on a quiz.
     */
    public function findInProgressAttempt(User $user, Quiz $quiz): ?QuizAttempt
    {
        return QuizAttempt::where('user_id', $user->id)
            ->where('quiz_id', $quiz->id)
            ->whereNull('completed_at')
            ->first();
    }

    /**
     * Get the best attempt for a user on a quiz.
     */
    public function findBestAttempt(User $user, Quiz $quiz): ?QuizAttempt
    {
        return QuizAttempt::where('user_id', $user->id)
            ->where('quiz_id', $quiz->id)
            ->whereNotNull('completed_at')
            ->orderByDesc('percentage')
            ->first();
    }

    /**
     * Count completed attempts for a user on a quiz.
     */
    public function countUserAttempts(User $user, Quiz $quiz): int
    {
        return QuizAttempt::where('user_id', $user->id)
            ->where('quiz_id', $quiz->id)
            ->whereNotNull('completed_at')
            ->count();
    }

    /**
     * Create a new attempt.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): QuizAttempt
    {
        return QuizAttempt::create($data);
    }

    /**
     * Update an attempt.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(QuizAttempt $attempt, array $data): QuizAttempt
    {
        $attempt->update($data);

        return $attempt->fresh();
    }

    /**
     * Get recent attempts for a quiz (for analytics).
     */
    public function getRecentAttempts(Quiz $quiz, int $limit = 50): Collection
    {
        return QuizAttempt::where('quiz_id', $quiz->id)
            ->whereNotNull('completed_at')
            ->with('user')
            ->orderByDesc('completed_at')
            ->limit($limit)
            ->get();
    }

    /**
     * Get pass rate for a quiz.
     */
    public function getPassRate(Quiz $quiz): float
    {
        $total = QuizAttempt::where('quiz_id', $quiz->id)
            ->whereNotNull('completed_at')
            ->count();

        if ($total === 0) {
            return 0;
        }

        $passed = QuizAttempt::where('quiz_id', $quiz->id)
            ->whereNotNull('completed_at')
            ->where('passed', true)
            ->count();

        return ($passed / $total) * 100;
    }

    /**
     * Get average score for a quiz.
     */
    public function getAverageScore(Quiz $quiz): float
    {
        return QuizAttempt::where('quiz_id', $quiz->id)
            ->whereNotNull('completed_at')
            ->avg('percentage') ?? 0;
    }

    /**
     * Count completed attempts for a quiz.
     */
    public function countCompletedAttempts(Quiz $quiz): int
    {
        return QuizAttempt::where('quiz_id', $quiz->id)
            ->whereNotNull('completed_at')
            ->count();
    }
}
