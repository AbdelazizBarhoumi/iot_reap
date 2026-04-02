<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class ForgotPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Guest can request password reset
    }

    public function rules(): array
    {
        // Don't check 'exists:users,email' to prevent user enumeration.
        // The controller always returns 200 regardless of whether the email exists.
        return [
            'email' => ['required', 'string', 'email', 'max:255'],
        ];
    }
}
