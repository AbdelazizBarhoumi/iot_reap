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
                'nullable',
                'integer',
                'min:' . config('sessions.min_duration_minutes', 30),
                'max:' . config('sessions.max_duration_minutes', 240),
            ],
            'session_ty pe' => [
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
            'duration_minutes.min' => 'Session duration must be at least ' . config('sessions.min_duration_minutes', 30) . ' minutes.',
            'duration_minutes.max' => 'Session duration cannot exceed ' . config('sessions.max_duration_minutes', 240) . ' minutes.',
            'session_type.enum' => 'Session type must be either "ephemeral" or "persistent".',
        ];
    }

    /**
     * Get the session duration in minutes, using config default if not provided.
     */
    public function getDurationMinutes(): int
    {
        return $this->validated('duration_minutes')
            ?? config('sessions.default_duration_minutes', 120);
    }}