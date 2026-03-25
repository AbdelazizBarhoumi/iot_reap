<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssignVMToLessonRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Teachers and admins can assign VMs
        return $this->user()?->hasRole(\App\Enums\UserRole::TEACHER)
            || $this->user()?->isAdmin();
    }

    public function rules(): array
    {
        return [
            'lesson_id' => ['required', 'integer', 'exists:lessons,id'],
            'vm_template_id' => ['required', 'integer', 'exists:vm_templates,id'],
            'teacher_notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'lesson_id.exists' => 'The selected lesson does not exist.',
            'vm_template_id.exists' => 'The selected VM template does not exist.',
        ];
    }
}
