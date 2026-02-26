<?php

namespace App\Http\Requests\Hardware;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

/**
 * Form request for attaching a USB device to a VM.
 */
class AttachDeviceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Users with active sessions can attach devices
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
            // Either session_id OR (vm_ip + vm_name) must be provided
            'session_id' => ['nullable', 'string', 'exists:vm_sessions,id'],
            'vm_ip' => ['nullable', 'required_without:session_id', 'ip'],
            'vm_name' => ['nullable', 'required_with:vm_ip', 'string', 'max:100'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'vm_ip.required_without' => 'Either a session ID or VM IP address is required.',
            'vm_name.required_with' => 'VM name is required when specifying VM IP.',
        ];
    }
}
