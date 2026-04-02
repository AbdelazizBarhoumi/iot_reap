<?php

namespace App\Http\Requests\Quiz;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Request validation for creating/updating an article.
 */
class UpsertArticleRequest extends FormRequest
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
            'content' => ['required', 'array'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'content.required' => 'Article content is required.',
            'content.array' => 'Article content must be valid TipTap JSON.',
        ];
    }
}
