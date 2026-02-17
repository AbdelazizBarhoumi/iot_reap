<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Exceptions\InvalidCredentialsException;
use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function __construct(private readonly UserRepository $users)
    {
    }

    /**
     * Register a new user (returns the created User).
     */
    public function register(array $data): User
    {
        // ensure role defaults to engineer if not supplied
        $data['role'] = $data['role'] ?? UserRole::ENGINEER->value;

        // creation relies on User model for password hashing
        return $this->users->create($data);
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
