<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Form request for terminating a VM session.
 * Validates user input and enforces authorization.
 */
class TerminateVMSessionRequest extends FormRequest
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
            'stop_vm' => [
                'nullable',
                'boolean',
            ],
            'return_snapshot' => [
                'nullable',
                'string',
                'max:255',
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
            'stop_vm.boolean' => 'The stop_vm flag must be a boolean value.',
            'return_snapshot.string' => 'The snapshot name must be a string.',
            'return_snapshot.max' => 'The snapshot name cannot exceed 255 characters.',
        ];
    }

    /**
     * Check if the VM should be stopped/deleted.
     */
    public function shouldStopVm(): bool
    {
        return $this->validated('stop_vm') ?? true;
    }

    /**
     * Get the snapshot name to revert to, if provided.
     */
    public function getReturnSnapshot(): ?string
    {
        return $this->validated('return_snapshot');
    }
}
