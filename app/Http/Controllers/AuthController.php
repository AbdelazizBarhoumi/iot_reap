<?php

namespace App\Http\Controllers;

use App\Exceptions\InvalidCredentialsException;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Password;

class AuthController
{
    public function __construct(private readonly AuthService $authService)
    {
    }

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
        ]);

        $user = $this->authService->register($data);

        return response()->json(['data' => $user], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        try {
            $user = $this->authService->login($data['email'], $data['password']);
        } catch (InvalidCredentialsException $e) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        return response()->json(['data' => $user], 200);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([], 204);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['data' => $request->user()]);
    }

    /**
     * Send a password reset link. Always return 200 to avoid user enumeration.
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        // Fire and forget — always return 200 to the client
        Password::sendResetLink($request->only('email'));

        return response()->json([], 200);
    }

    /**
     * Reset a user's password using a valid token (expires per config: 60 minutes).
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'confirmed', 'min:6'],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                // User model casts `password` => 'hashed'
                $user->forceFill(['password' => $password])->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([], 200);
        }

        return response()->json(['message' => 'Invalid or expired token.'], 400);
    }
}

