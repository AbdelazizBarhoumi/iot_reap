<?php

namespace App\Http\Requests\Quiz;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Request validation for creating a quiz.
 */
class CreateQuizRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'passing_score' => ['nullable', 'integer', 'min:0', 'max:100'],
            'time_limit_minutes' => ['nullable', 'integer', 'min:1', 'max:180'],
            'max_attempts' => ['nullable', 'integer', 'min:1', 'max:10'],
            'shuffle_questions' => ['nullable', 'boolean'],
            'shuffle_options' => ['nullable', 'boolean'],
            'show_correct_answers' => ['nullable', 'boolean'],
        ];
    }
}
