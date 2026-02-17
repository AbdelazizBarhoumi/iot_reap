<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class PasswordResetApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_always_returns_200_and_sends_notification_for_existing_user()
    {
        Notification::fake();

        $user = User::factory()->create();

        $response = $this->postJson('/auth/forgot-password', ['email' => $user->email]);
        $response->assertOk();

        Notification::assertSentTo($user, ResetPassword::class);

        // unknown email: still 200 and no notification sent
        Notification::fake();
        $response = $this->postJson('/auth/forgot-password', ['email' => 'missing@example.com']);
        $response->assertOk();
        Notification::assertNothingSent();
    }

    public function test_reset_password_with_valid_token_resets_and_hashes_password()
    {
        $user = User::factory()->create(['password' => 'old-password']);

        $token = Password::createToken($user);

        $response = $this->postJson('/auth/reset-password', [
            'token' => $token,
            'email' => $user->email,
            'password' => 'new-secure-password',
            'password_confirmation' => 'new-secure-password',
        ]);

        $response->assertOk();

        $this->assertTrue(Hash::check('new-secure-password', $user->refresh()->password));
    }

    public function test_reset_token_expires_after_60_minutes()
    {
        $user = User::factory()->create(['password' => 'old-password']);

        $token = Password::createToken($user);

        // make the stored token appear older than 60 minutes
        DB::table(config('auth.passwords.users.table'))
            ->where('email', $user->email)
            ->update(['created_at' => now()->subMinutes(61)]);

        $response = $this->postJson('/auth/reset-password', [
            'token' => $token,
            'email' => $user->email,
            'password' => 'newpassword',
            'password_confirmation' => 'newpassword',
        ]);

        $response->assertStatus(400);
        $this->assertTrue(Hash::check('old-password', $user->refresh()->password));
    }
}
