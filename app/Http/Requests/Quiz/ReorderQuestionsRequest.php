<?php

namespace App\Http\Requests\Quiz;

use Illuminate\Foundation\Http\FormRequest;

class ReorderQuestionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Teacher authorization happens in controller via Gate
        return $this->user() !== null;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['required', 'integer', 'exists:quiz_questions,id'],
            'items.*.sort_order' => ['required', 'integer', 'min:0', 'max:1000'],
        ];
    }
}
