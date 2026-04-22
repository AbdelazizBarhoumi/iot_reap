<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class BulkAssignCamerasRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Gate::allows('admin-only');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'assignments' => ['required', 'array', 'min:1'],
            'assignments.*.camera_id' => ['required', 'integer', 'exists:cameras,id'],
            'assignments.*.vm_id' => ['nullable', 'integer', 'min:1'],
        ];
    }

    /**
     * Custom error messages.
     */
    public function messages(): array
    {
        return [
            'assignments.required' => 'At least one assignment is required',
            'assignments.*.camera_id.required' => 'Camera ID is required for each assignment',
            'assignments.*.camera_id.exists' => 'Camera not found',
            'assignments.*.vm_id.integer' => 'VM ID must be a valid integer',
            'assignments.*.vm_id.min' => 'VM ID must be at least 1',
        ];
    }
}
