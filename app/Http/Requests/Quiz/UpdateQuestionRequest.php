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
            'options' => [
                'nullable',
                'array',
                function ($attribute, $value, $fail) {
                    $type = $this->input('type') ?? $this->route('question')->type->value;
                    if ($type === QuizQuestionType::MULTIPLE_CHOICE->value && count($value) < 2) {
                        $fail('Multiple choice questions require at least 2 options.');
                    }
                    if ($type === QuizQuestionType::SHORT_ANSWER->value && count($value) < 1) {
                        $fail('Short answer questions require at least 1 correct answer option.');
                    }
                },
                'max:10',
            ],
            'options.*.option_text' => ['required_with:options', 'string', 'max:500'],
            'options.*.is_correct' => ['required_with:options', 'boolean'],
        ];
    }
}
