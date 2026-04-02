<?php

namespace App\Services;

use App\Enums\QuizQuestionType;
use App\Models\Quiz;
use App\Models\QuizQuestion;
use App\Repositories\QuizQuestionRepository;
use Illuminate\Support\Facades\Log;

/**
 * Service for quiz question management.
 */
class QuestionService
{
    public function __construct(
        private readonly QuizQuestionRepository $questionRepository,
    ) {}

    /**
     * Create a question with options.
     *
     * @param  array<string, mixed>  $data
     * @param  array<array{option_text: string, is_correct: bool}>  $options
     */
    public function create(Quiz $quiz, array $data, array $options = []): QuizQuestion
    {
        $type = QuizQuestionType::from($data['type']);

        // Validate options based on question type
        $this->validateOptions($type, $options);

        // If true/false, auto-create options
        if ($type === QuizQuestionType::TRUE_FALSE && empty($options)) {
            $options = [
                ['option_text' => 'True', 'is_correct' => $data['correct_answer'] === true],
                ['option_text' => 'False', 'is_correct' => $data['correct_answer'] === false],
            ];
        }

        $sortOrder = $this->questionRepository->getNextSortOrder($quiz->id);

        Log::info('Creating quiz question', [
            'quiz_id' => $quiz->id,
            'type' => $type->value,
        ]);

        return $this->questionRepository->createWithOptions([
            'quiz_id' => $quiz->id,
            'type' => $type,
            'question' => $data['question'],
            'explanation' => $data['explanation'] ?? null,
            'points' => $data['points'] ?? 1,
            'sort_order' => $sortOrder,
        ], $options);
    }

    /**
     * Update a question with options.
     *
     * @param  array<string, mixed>  $data
     * @param  array<array{option_text: string, is_correct: bool}>  $options
     */
    public function update(QuizQuestion $question, array $data, array $options = []): QuizQuestion
    {
        $type = isset($data['type'])
            ? QuizQuestionType::from($data['type'])
            : $question->type;

        // Validate options based on question type
        if (! empty($options)) {
            $this->validateOptions($type, $options);
        }

        Log::info('Updating quiz question', ['question_id' => $question->id]);

        if (! empty($options)) {
            return $this->questionRepository->updateWithOptions($question, [
                'type' => $type,
                'question' => $data['question'] ?? $question->question,
                'explanation' => $data['explanation'] ?? $question->explanation,
                'points' => $data['points'] ?? $question->points,
            ], $options);
        }

        return $this->questionRepository->update($question, $data);
    }

    /**
     * Delete a question.
     */
    public function delete(QuizQuestion $question): bool
    {
        Log::info('Deleting quiz question', ['question_id' => $question->id]);

        return $this->questionRepository->delete($question);
    }

    /**
     * Reorder questions.
     *
     * @param  array<array{id: int, sort_order: int}>  $items
     */
    public function reorder(array $items): void
    {
        Log::info('Reordering quiz questions', ['count' => count($items)]);

        $this->questionRepository->reorder($items);
    }

    /**
     * Validate options based on question type.
     *
     * @param  array<array{option_text: string, is_correct: bool}>  $options
     */
    private function validateOptions(QuizQuestionType $type, array $options): void
    {
        if ($type === QuizQuestionType::SHORT_ANSWER) {
            // Short answer questions don't need options
            return;
        }

        if ($type === QuizQuestionType::TRUE_FALSE && empty($options)) {
            // True/False questions can have empty options (they'll be auto-created)
            return;
        }

        if (empty($options)) {
            throw new \DomainException(
                "{$type->label()} questions require at least one option"
            );
        }

        // Ensure at least one correct answer
        $hasCorrect = collect($options)->contains('is_correct', true);
        if (! $hasCorrect) {
            throw new \DomainException('At least one option must be marked as correct');
        }

        // True/false must have exactly 2 options
        if ($type === QuizQuestionType::TRUE_FALSE && count($options) !== 2) {
            throw new \DomainException('True/False questions must have exactly 2 options');
        }

        // Multiple choice must have at least 2 options
        if ($type === QuizQuestionType::MULTIPLE_CHOICE && count($options) < 2) {
            throw new \DomainException('Multiple choice questions must have at least 2 options');
        }
    }
}
