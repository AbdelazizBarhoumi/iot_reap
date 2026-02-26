<?php

namespace App\Http\Requests\Hardware;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Request validation for creating a device reservation.
 */
class CreateReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization handled in controller
    }

    public function rules(): array
    {
        return [
            'usb_device_id' => ['required', 'integer', 'exists:usb_devices,id'],
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
