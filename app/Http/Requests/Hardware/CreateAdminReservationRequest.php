<?php

namespace App\Http\Requests\Hardware;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

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
            'mode' => ['nullable', Rule::in(['block', 'reserve_to_user', 'reserve_to_vm'])],
            'target_user_id' => [
                'nullable',
                'string',
                'exists:users,id',
                Rule::requiredIf(fn () => $this->input('mode') === 'reserve_to_user'),
            ],
            'target_vm_id' => [
                'nullable',
                'integer',
                'min:1',
                Rule::requiredIf(fn () => $this->input('mode') === 'reserve_to_vm'),
            ],
            'start_at' => ['required', 'date'],
            'end_at' => ['required', 'date', 'after:start_at'],
            'purpose' => ['nullable', 'string', 'max:500'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'end_at.after' => 'End time must be after start time.',
            'target_user_id.required' => 'Please select a target user for user reservations.',
            'target_vm_id.required' => 'Please provide a target VM ID for VM reservations.',
        ];
    }
}
