<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVMTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'os_type' => ['sometimes', Rule::in(['windows', 'linux', 'other'])],
            'protocol' => ['sometimes', Rule::in(['rdp', 'vnc', 'ssh'])],
            'admin_description' => ['nullable', 'string', 'max:5000'],
            'is_active' => ['sometimes', 'boolean'],
            'maintenance_mode' => ['sometimes', 'boolean'],
            'maintenance_notes' => ['nullable', 'required_if:maintenance_mode,true', 'string', 'max:2000'],
            'maintenance_until' => ['nullable', 'date', 'after:now'],
        ];
    }

    public function messages(): array
    {
        return [
            'maintenance_notes.required_if' => 'Maintenance notes are required when enabling maintenance mode.',
        ];
    }
}
