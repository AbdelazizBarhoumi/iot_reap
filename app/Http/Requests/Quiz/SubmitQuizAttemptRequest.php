<?php

namespace App\Http\Requests\Quiz;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Request validation for submitting a quiz attempt.
 */
class SubmitQuizAttemptRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'answers' => ['required', 'array', 'min:1'],
            'answers.*.question_id' => ['required', 'integer', 'exists:quiz_questions,id'],
            'answers.*.selected_option_id' => ['nullable', 'integer', 'exists:quiz_question_options,id'],
            'answers.*.text_answer' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'answers.required' => 'You must provide answers to submit the quiz.',
            'answers.*.question_id.required' => 'Each answer must reference a question.',
            'answers.*.question_id.exists' => 'Invalid question reference.',
        ];
    }
}
