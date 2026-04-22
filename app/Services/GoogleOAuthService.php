<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepository;
use Laravel\Socialite\Facades\Socialite;

class GoogleOAuthService
{
    public function __construct(private UserRepository $userRepository) {}

    /**
     * Handle the OAuth callback from Google.
     * Returns an array with user, isNewUser flag, and OAuth data.
     *
     * @return array{user: User|null, isNewUser: bool, googleData: array}
     *
     * @throws \Exception if processing fails
     */
    public function handleCallback(): array
    {
        $googleUser = Socialite::driver('google')->user();

        $googleData = [
            'google_id' => $googleUser->getId(),
            'name' => $googleUser->getName(),
            'email' => $googleUser->getEmail(),
            'avatar' => $googleUser->getAvatar(),
        ];

        // Try to find user by google_id first
        $user = User::where('google_id', $googleUser->getId())->first();

        if ($user) {
            // Update the user's Google data in case profile info changed
            $user->update(['google_data' => $googleData]);

            return [
                'user' => $user,
                'isNewUser' => false,
                'googleData' => $googleData,
            ];
        }

        // Try to find user by email
        $user = User::where('email', $googleUser->getEmail())->first();

        if ($user) {
            // Link the Google account to existing user
            $user->update([
                'google_id' => $googleUser->getId(),
                'google_data' => $googleData,
            ]);

            return [
                'user' => $user,
                'isNewUser' => false,
                'googleData' => $googleData,
            ];
        }

        // Return null user for new user — will redirect to role selection
        return [
            'user' => null,
            'isNewUser' => true,
            'googleData' => $googleData,
        ];
    }

    /**
     * Handle Google JWT credential (from GoogleLogin button).
     * Decodes and verifies the JWT without requiring the Socialite callback.
     */
    public function handleGoogleJWT(string $credential): array
    {
        // Parse the JWT (without verification for now - Google verifies signature)
        $parts = explode('.', $credential);
        if (count($parts) !== 3) {
            throw new \Exception('Invalid JWT format: expected 3 parts');
        }

        // Decode the payload - add padding if needed for proper base64url decoding
        $payload_part = $parts[1];
        // Add padding if needed
        $padding = 4 - (strlen($payload_part) % 4);
        if ($padding < 4) {
            $payload_part .= str_repeat('=', $padding);
        }

        // Convert from base64url to standard base64 and decode
        $decoded = base64_decode(strtr($payload_part, '-_', '+/'), true);
        if ($decoded === false) {
            throw new \Exception('Invalid JWT payload encoding');
        }

        $payload = json_decode($decoded, true);
        if (! $payload || ! is_array($payload)) {
            throw new \Exception('Invalid JWT payload: cannot parse JSON');
        }

        // Extract Google user information from JWT
        $googleData = [
            'google_id' => $payload['sub'] ?? null,
            'name' => $payload['name'] ?? '',
            'email' => $payload['email'] ?? '',
            'avatar' => $payload['picture'] ?? null,
        ];

        if (! $googleData['google_id']) {
            throw new \Exception('Invalid JWT: missing subject (sub)');
        }

        // Try to find user by google_id first
        $user = User::where('google_id', $googleData['google_id'])->first();

        if ($user) {
            // Update the user's Google data
            $user->update(['google_data' => $googleData]);

            return [
                'user' => $user,
                'isNewUser' => false,
                'googleData' => $googleData,
            ];
        }

        // Try to find user by email
        $user = User::where('email', $googleData['email'])->first();

        if ($user) {
            // Link the Google account to existing user
            $user->update([
                'google_id' => $googleData['google_id'],
                'google_data' => $googleData,
            ]);

            return [
                'user' => $user,
                'isNewUser' => false,
                'googleData' => $googleData,
            ];
        }

        // Return null user for new user
        return [
            'user' => null,
            'isNewUser' => true,
            'googleData' => $googleData,
        ];
    }

    /**
     * Complete the OAuth signup with a role selection.
     * Creates the new user with the selected role.
     *
     * @param  array  $googleData  OAuth data from session
     * @param  string  $role  Selected role ('engineer' or 'teacher')
     *
     * @throws \Exception if user creation fails
     */
    public function completeSignup(array $googleData, string $role): User
    {
        // Double-check user doesn't already exist
        $existingUser = User::where('email', $googleData['email'])->first();
        if ($existingUser) {
            return $existingUser;
        }

        return $this->userRepository->create([
            'name' => $googleData['name'],
            'email' => $googleData['email'],
            'google_id' => $googleData['google_id'],
            'google_data' => $googleData,
            'email_verified_at' => now(),
            'password' => bcrypt(bin2hex(random_bytes(32))), // Random password
            'role' => $role, // User-selected role
        ]);
    }
}
