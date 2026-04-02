<?php

namespace App\Http\Requests\Search;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SearchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'q' => ['required', 'string', 'min:2', 'max:255'],
            'category' => ['nullable', 'string', 'max:100'],
            'level' => ['nullable', Rule::in(['Beginner', 'Intermediate', 'Advanced'])],
            'price_min' => ['nullable', 'numeric', 'min:0'],
            'price_max' => ['nullable', 'numeric', 'min:0'],
            'is_free' => ['nullable', 'boolean'],
            'has_virtual_machine' => ['nullable', 'boolean'],
            'sort' => ['nullable', Rule::in(['relevance', 'newest', 'rating', 'enrollments', 'price_low', 'price_high'])],
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'q.required' => 'Please enter a search query.',
            'q.min' => 'Search query must be at least 2 characters.',
        ];
    }

    /**
     * Get validated filters array.
     *
     * @return array<string, mixed>
     */
    public function getFilters(): array
    {
        return array_filter([
            'category' => $this->validated('category'),
            'level' => $this->validated('level'),
            'price_min' => $this->validated('price_min'),
            'price_max' => $this->validated('price_max'),
            'is_free' => $this->boolean('is_free'),
            'has_virtual_machine' => $this->boolean('has_virtual_machine'),
        ], fn ($value) => $value !== null && $value !== false);
    }
}
