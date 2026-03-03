<?php

namespace App\Http\Requests\Camera;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Request validation for creating a camera reservation.
 */
class CreateCameraReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization handled in controller
    }

    public function rules(): array
    {
        return [
            'camera_id' => ['required', 'integer', 'exists:cameras,id'],
            'start_at' => ['required', 'date', 'after:now'],
            'end_at' => ['required', 'date', 'after:start_at'],
            'purpose' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'start_at.after' => 'Start time must be in the future.',
            'end_at.after' => 'End time must be after start time.',
        ];
    }
}
