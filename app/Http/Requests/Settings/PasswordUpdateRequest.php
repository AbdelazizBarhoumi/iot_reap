<?php

namespace App\Http\Requests\Settings;

use App\Concerns\PasswordValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class PasswordUpdateRequest extends FormRequest
{
    use PasswordValidationRules;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'password' => $this->passwordRules(),
        ];

        $user = $this->user();
        $isGoogle = $user && \Illuminate\Support\Facades\DB::table('users')
            ->where('id', $user->id)
            ->whereNotNull('google_id')
            ->exists();

        if (! $isGoogle) {
            $rules['current_password'] = $this->currentPasswordRules();
        }

        return $rules;
    }
}
