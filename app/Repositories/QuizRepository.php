<?php

namespace App\Repositories;

use App\Models\Quiz;

/**
 * Repository for Quiz model operations.
 */
class QuizRepository
{
    /**
     * Find a quiz by ID with questions and options.
     */
    public function findByIdWithQuestions(int $id): ?Quiz
    {
        return Quiz::with(['questions.options'])->find($id);
    }

    /**
     * Find a quiz by lesson ID.
     */
    public function findByLessonId(int $lessonId): ?Quiz
    {
        return Quiz::where('lesson_id', $lessonId)->first();
    }

    /**
     * Find a quiz by lesson ID with questions.
     */
    public function findByLessonIdWithQuestions(int $lessonId): ?Quiz
    {
        return Quiz::with(['questions.options'])
            ->where('lesson_id', $lessonId)
            ->first();
    }

    /**
     * Create a new quiz.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Quiz
    {
        return Quiz::create($data);
    }

    /**
     * Update a quiz.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(Quiz $quiz, array $data): Quiz
    {
        $quiz->update($data);

        return $quiz->fresh();
    }

    /**
     * Delete a quiz.
     */
    public function delete(Quiz $quiz): bool
    {
        return $quiz->delete();
    }

    /**
     * Publish a quiz.
     */
    public function publish(Quiz $quiz): Quiz
    {
        $quiz->update(['is_published' => true]);

        return $quiz->fresh();
    }

    /**
     * Unpublish a quiz.
     */
    public function unpublish(Quiz $quiz): Quiz
    {
        $quiz->update(['is_published' => false]);

        return $quiz->fresh();
    }
}
