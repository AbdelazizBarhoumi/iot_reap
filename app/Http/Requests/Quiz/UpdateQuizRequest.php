<?php

namespace App\Http\Requests\Quiz;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Request validation for updating a quiz.
 */
class UpdateQuizRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('teach');
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'passing_score' => ['sometimes', 'integer', 'min:0', 'max:100'],
            'time_limit_minutes' => ['nullable', 'integer', 'min:1', 'max:180'],
            'max_attempts' => ['nullable', 'integer', 'min:1', 'max:10'],
            'shuffle_questions' => ['sometimes', 'boolean'],
            'shuffle_options' => ['sometimes', 'boolean'],
            'show_correct_answers' => ['sometimes', 'boolean'],
        ];
    }
}
