<?php

namespace App\Http\Requests\Forum;

use Illuminate\Foundation\Http\FormRequest;

class CreateReplyRequest extends FormRequest
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
            'content' => ['required', 'string', 'min:1', 'max:10000'],
            'parent_id' => ['nullable', 'integer', 'exists:thread_replies,id'],
        ];
    }
}
