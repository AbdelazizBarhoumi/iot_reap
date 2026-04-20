<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Exceptions\InvalidCredentialsException;
use App\Models\User;
use App\Notifications\TeacherAccountPendingApprovalNotification;
use App\Repositories\UserRepository;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function __construct(private readonly UserRepository $users) {}

    /**
     * Register a new user (returns the created User) and signs them in.
     */
    public function register(array $data): User
    {
        $allowedSelfRegister = [UserRole::ENGINEER->value, UserRole::TEACHER->value];
        $role = $data['role'] ?? UserRole::ENGINEER->value;

        if (! in_array($role, $allowedSelfRegister, true)) {
            $role = UserRole::ENGINEER->value;
        }

        $data['role'] = $role;

        if ($role === UserRole::TEACHER->value) {
            $data['teacher_approved_at'] = null;
            $data['teacher_approved_by'] = null;
        }

        // creation relies on User model for password hashing
        $user = $this->users->create($data);

        // Trigger verification email flow for newly created users.
        event(new Registered($user));

        // Send pending approval notification to new teachers
        if ($role === UserRole::TEACHER->value) {
            $user->notify(new TeacherAccountPendingApprovalNotification($user));
        }

        // Log the newly created user into the session
        Auth::login($user);

        return $user;
    }

    /**
     * Log a user in using session (throws on invalid credentials).
     */
    public function login(string $email, string $password): User
    {
        $user = $this->users->findByEmail($email);

        if (! $user || ! Hash::check($password, $user->password)) {
            throw new InvalidCredentialsException('Invalid credentials provided.');
        }

        Auth::login($user);

        return $user;
    }
}
