<?php

namespace App\Http\Requests\VM;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class ApproveVMReservationRequest extends FormRequest
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
}
