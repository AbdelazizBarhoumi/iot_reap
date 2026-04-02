<?php

namespace App\Http\Requests\Quiz;

use App\Enums\QuizQuestionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Request validation for updating a quiz question.
 */
class UpdateQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('teach');
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'type' => ['sometimes', 'string', Rule::enum(QuizQuestionType::class)],
            'question' => ['sometimes', 'string', 'max:2000'],
            'explanation' => ['nullable', 'string', 'max:1000'],
            'points' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'correct_answer' => ['nullable', 'boolean'],
            'options' => ['nullable', 'array', 'min:2', 'max:10'],
            'options.*.option_text' => ['required_with:options', 'string', 'max:500'],
            'options.*.is_correct' => ['required_with:options', 'boolean'],
        ];
    }
}
