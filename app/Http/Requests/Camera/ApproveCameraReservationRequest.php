<?php

namespace App\Http\Requests\Camera;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

/**
 * Request validation for approving a camera reservation.
 */
class ApproveCameraReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Gate::allows('admin-only');
    }

    public function rules(): array
    {
        return [
            'approved_start_at' => ['nullable', 'date'],
            'approved_end_at' => ['nullable', 'date', 'after:approved_start_at'],
            'admin_notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'approved_end_at.after' => 'End time must be after start time.',
        ];
    }
}
