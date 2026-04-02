<?php

namespace App\Http\Requests\Forum;

use Illuminate\Foundation\Http\FormRequest;

class CreateThreadRequest extends FormRequest
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
            'title' => ['required', 'string', 'min:5', 'max:255'],
            'content' => ['required', 'string', 'min:10', 'max:10000'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.min' => 'Title must be at least 5 characters.',
            'content.min' => 'Content must be at least 10 characters.',
        ];
    }
}
