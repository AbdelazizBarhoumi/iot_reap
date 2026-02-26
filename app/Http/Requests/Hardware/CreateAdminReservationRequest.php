<?php

namespace App\Http\Requests\Hardware;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

/**
 * Request validation for creating an admin device block.
 */
class CreateAdminReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Gate::allows('admin-only');
    }

    public function rules(): array
    {
        return [
            'usb_device_id' => ['required', 'integer', 'exists:usb_devices,id'],
            'start_at' => ['required', 'date'],
            'end_at' => ['required', 'date', 'after:start_at'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'end_at.after' => 'End time must be after start time.',
        ];
    }
}
