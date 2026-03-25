<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RejectVMAssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'admin_notes' => ['required', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'admin_notes.required' => 'A reason for rejection is required.',
        ];
    }
}
