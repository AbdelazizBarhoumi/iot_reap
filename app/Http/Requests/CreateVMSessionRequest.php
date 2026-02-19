<?php

namespace App\Http\Requests;

use App\Enums\VMSessionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Form request for creating a new VM session.
 * Validates user input and enforces authorization.
 */
class CreateVMSessionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'template_id' => [
                'required',
                'integer',
                'exists:vm_templates,id',
            ],
            'duration_minutes' => [
                'required',
                'integer',
                'min:30',
                'max:240',
            ],
            'session_type' => [
                'required',
                Rule::enum(VMSessionType::class),
            ],
        ];
    }

    /**
     * Get custom messages for validation errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'template_id.exists' => 'The selected template does not exist.',
            'duration_minutes.min' => 'Session duration must be at least 30 minutes.',
            'duration_minutes.max' => 'Session duration cannot exceed 240 minutes.',
            'session_type.enum' => 'Session type must be either "ephemeral" or "persistent".',
        ];
    }
}
