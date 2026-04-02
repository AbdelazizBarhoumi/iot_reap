<?php

namespace App\Http\Requests\Quiz;

use App\Enums\QuizQuestionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Request validation for creating a quiz question.
 */
class CreateQuestionRequest extends FormRequest
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
            'type' => ['required', 'string', Rule::enum(QuizQuestionType::class)],
            'question' => ['required', 'string', 'max:2000'],
            'explanation' => ['nullable', 'string', 'max:1000'],
            'points' => ['nullable', 'integer', 'min:1', 'max:100'],
            'correct_answer' => ['required_if:type,true_false', 'nullable', 'boolean'],
            'options' => ['required_if:type,multiple_choice', 'nullable', 'array', 'min:2', 'max:10'],
            'options.*.option_text' => ['required_with:options', 'string', 'max:500'],
            'options.*.is_correct' => ['required_with:options', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'options.required_if' => 'Multiple choice questions require at least 2 options.',
            'correct_answer.required_if' => 'True/false questions require a correct answer.',
        ];
    }
}
