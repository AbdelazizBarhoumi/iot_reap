<?php

namespace App\Repositories;

use App\Models\QuizQuestion;
use App\Support\Database\TransactionManager;

/**
 * Repository for QuizQuestion model operations.
 */
class QuizQuestionRepository
{
    /**
     * Find a question by ID with options.
     */
    public function findByIdWithOptions(int $id): ?QuizQuestion
    {
        return QuizQuestion::with('options')->find($id);
    }

    /**
     * Create a question with options.
     *
     * @param  array<string, mixed>  $data
     * @param  array<array<string, mixed>>  $options
     */
    public function createWithOptions(array $data, array $options = []): QuizQuestion
    {
        $question = QuizQuestion::create($data);

        foreach ($options as $index => $optionData) {
            $question->options()->create([
                'option_text' => $optionData['option_text'],
                'is_correct' => $optionData['is_correct'] ?? false,
                'sort_order' => $optionData['sort_order'] ?? $index,
            ]);
        }

        return $question->fresh(['options']);
    }

    /**
     * Update a question.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(QuizQuestion $question, array $data): QuizQuestion
    {
        $question->update($data);

        return $question->fresh();
    }

    /**
     * Update a question with options (replaces all options).
     *
     * @param  array<string, mixed>  $data
     * @param  array<array<string, mixed>>  $options
     */
    public function updateWithOptions(QuizQuestion $question, array $data, array $options): QuizQuestion
    {
        $question->update($data);

        // Delete existing options and create new ones
        $question->options()->delete();

        foreach ($options as $index => $optionData) {
            $question->options()->create([
                'option_text' => $optionData['option_text'],
                'is_correct' => $optionData['is_correct'] ?? false,
                'sort_order' => $optionData['sort_order'] ?? $index,
            ]);
        }

        return $question->fresh(['options']);
    }

    /**
     * Delete a question.
     */
    public function delete(QuizQuestion $question): bool
    {
        return $question->delete();
    }

    /**
     * Reorder questions.
     *
     * @param  array<array{id: int, sort_order: int}>  $items
     */
    public function reorder(array $items): void
    {
        foreach ($items as $item) {
            QuizQuestion::where('id', $item['id'])
                ->update(['sort_order' => $item['sort_order']]);
        }
    }

    /**
     * Get the next sort order for a quiz.
     */
    public function getNextSortOrder(int $quizId): int
    {
        $maxOrder = QuizQuestion::where('quiz_id', $quizId)->max('sort_order');

        return ($maxOrder ?? -1) + 1;
    }
}
