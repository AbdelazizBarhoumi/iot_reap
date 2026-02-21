<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Form request for extending a VM session.
 * Validates user input and enforces authorization.
 */
class ExtendVMSessionRequest extends FormRequest
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
            'minutes' => [
                'nullable',
                'integer',
                'min:1',
                'max:240', // Max 4 hours per extension
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
            'minutes.min' => 'Extension duration must be at least 1 minute.',
            'minutes.max' => 'Extension duration cannot exceed 240 minutes.',
        ];
    }

    /**
     * Get the minutes to extend by, defaulting to configured increment.
     */
    public function getExtensionMinutes(): int
    {
        return $this->validated('minutes')
            ?? config('sessions.extension_increment_minutes', 30);
    }
}
