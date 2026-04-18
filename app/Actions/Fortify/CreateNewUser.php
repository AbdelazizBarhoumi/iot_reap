<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
            'role' => ['sometimes', 'string', Rule::in([
                UserRole::ENGINEER->value,
                UserRole::TEACHER->value,
            ])],
        ])->validate();

        $role = $input['role'] ?? UserRole::ENGINEER->value;

        $data = [
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => $input['password'],
            'role' => $role,
        ];

        // Teacher accounts must be explicitly approved by an admin.
        if ($role === UserRole::TEACHER->value) {
            $data['teacher_approved_at'] = null;
            $data['teacher_approved_by'] = null;
        }

        return User::create($data);
    }
}
