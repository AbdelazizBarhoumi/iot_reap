<?php

namespace App\Http\Requests;

use App\Enums\VMSessionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateVMSessionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create-vm-session');
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'template_id' => [
                'required',
                'integer',
                'exists:vm_templates,id',
                // Additional validation: template must be active
                Rule::exists('vm_templates', 'id')->where('is_active', true),
            ],
            'duration_minutes' => [
                'required',
                'integer',
                'min:30',
                'max:480', // Maximum 8 hours
            ],
            'session_type' => [
                'required',
                Rule::in([
                    VMSessionType::EPHEMERAL->value,
                    VMSessionType::PERSISTENT->value,
                ]),
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'template_id.required' => 'A VM template must be selected',
            'template_id.exists' => 'The selected template does not exist or is inactive',
            'duration_minutes.required' => 'A session duration must be specified',
            'duration_minutes.min' => 'Session duration must be at least 30 minutes',
            'duration_minutes.max' => 'Session duration cannot exceed 480 minutes (8 hours)',
            'session_type.required' => 'A session type must be specified',
            'session_type.in' => 'Invalid session type',
        ];
    }
}
