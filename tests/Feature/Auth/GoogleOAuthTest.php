<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Enums\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Mockery\MockInterface;
use Tests\TestCase;

class GoogleOAuthTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test redirecting to Google OAuth.
     */
    public function test_redirect_to_google(): void
    {
        $response = $this->get('/auth/oauth/google/redirect');

        $this->assertStringContainsString('accounts.google.com', $response->getTargetUrl());
    }

    /**
     * Test OAuth callback redirects new user to role selection.
     */
    public function test_oauth_callback_redirects_new_user_to_role_selection(): void
    {
        $googleUser = [
            'id' => '123456789',
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'avatar' => 'https://example.com/avatar.jpg',
            'token' => 'fake_token',
        ];

        $this->mockSocialiteUser($googleUser);

        try {
            $response = $this->get('/auth/oauth/google/callback');

            // Should return successful response (Inertia page)
            $response->assertStatus(200);

            // User should NOT be created yet (awaiting role selection)
            $this->assertDatabaseMissing('users', [
                'email' => 'john@example.com',
            ]);

            // Session should contain OAuth pending data
            $this->assertNotNull(session('oauth_pending'));
            $this->assertEquals('john@example.com', session('oauth_pending.email'));
            $this->assertEquals('John Doe', session('oauth_pending.name'));

            // User should not be authenticated yet
            $this->assertGuest();
        } catch (\Exception $e) {
            $this->fail('Test failed with exception: '.$e->getMessage().'\n'.$e->getTraceAsString());
        }
    }

    /**
     * Test OAuth callback logs in existing user.
     */
    public function test_oauth_callback_logs_in_existing_user_by_google_id(): void
    {
        $user = User::factory()->create([
            'google_id' => '123456789',
        ]);

        $googleUser = [
            'id' => '123456789',
            'name' => 'Updated Name',
            'email' => $user->email,
            'avatar' => 'https://example.com/avatar2.jpg',
            'token' => 'fake_token',
        ];

        $this->mockSocialiteUser($googleUser);

        $response = $this->get('/auth/oauth/google/callback');

        $response->assertRedirectContains('/dashboard');

        // User should still exist (not duplicated)
        $this->assertEquals(1, User::count());

        // User's Google data should be updated
        $user->refresh();
        $this->assertEquals('Updated Name', $user->google_data['name']);

        // User should be logged in
        $this->assertAuthenticatedAs($user);
    }

    /**
     * Test OAuth callback links to existing user by email.
     */
    public function test_oauth_callback_links_to_existing_user_by_email(): void
    {
        $user = User::factory()->create([
            'email' => 'john@example.com',
            'google_id' => null,
        ]);

        $googleUser = [
            'id' => '123456789',
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'avatar' => 'https://example.com/avatar.jpg',
            'token' => 'fake_token',
        ];

        $this->mockSocialiteUser($googleUser);

        $response = $this->get('/auth/oauth/google/callback');

        $response->assertRedirectContains('/dashboard');

        // User should still exist (not duplicated)
        $this->assertEquals(1, User::count());

        // User's Google ID should be linked
        $user->refresh();
        $this->assertEquals('123456789', $user->google_id);

        // User should be logged in
        $this->assertAuthenticatedAs($user);
    }

    /**
     * Test OAuth callback handles errors gracefully.
     */
    public function test_oauth_callback_handles_errors(): void
    {
        // Mock Socialite to throw an exception
        Socialite::partialMock()
            ->shouldReceive('driver')
            ->with('google')
            ->once()
            ->andThrow(new \Exception('OAuth error'));

        $response = $this->get('/auth/oauth/google/callback');

        $response->assertRedirectContains('/login');
        $response->assertSessionHas('error');

        // No users should be created on error
        $this->assertEquals(0, User::count());

        // User should not be authenticated
        $this->assertGuest();
    }

    /**
     * Test completing signup with engineer role.
     */
    public function test_complete_signup_with_engineer_role(): void
    {
        $this->withSession([
            'oauth_pending' => [
                'google_id' => '123456789',
                'email' => 'engineer@example.com',
                'name' => 'Engineer User',
                'avatar' => 'https://example.com/avatar.jpg',
            ],
        ]);

        $response = $this->post(route('google.complete-signup'), [
            'role' => 'engineer',
        ]);

        $response->assertRedirect('/dashboard');

        // User should be created with engineer role
        $user = User::where('email', 'engineer@example.com')->first();
        $this->assertNotNull($user);
        $this->assertEquals(UserRole::ENGINEER, $user->role);
        $this->assertNotNull($user->email_verified_at);
        $this->assertEquals('123456789', $user->google_id);

        // Session should be cleared
        $this->assertNull(session('oauth_pending'));

        // User should be authenticated
        $this->assertAuthenticatedAs($user);
    }

    /**
     * Test completing signup with teacher role.
     */
    public function test_complete_signup_with_teacher_role(): void
    {
        $this->withSession([
            'oauth_pending' => [
                'google_id' => '987654321',
                'email' => 'teacher@example.com',
                'name' => 'Teacher User',
                'avatar' => 'https://example.com/avatar.jpg',
            ],
        ]);

        $response = $this->post(route('google.complete-signup'), [
            'role' => 'teacher',
        ]);

        $response->assertRedirect('/dashboard');

        // User should be created with teacher role
        $user = User::where('email', 'teacher@example.com')->first();
        $this->assertNotNull($user);
        $this->assertEquals(UserRole::TEACHER, $user->role);
        $this->assertNotNull($user->email_verified_at);
        $this->assertEquals('987654321', $user->google_id);

        // User should be authenticated
        $this->assertAuthenticatedAs($user);
    }

    /**
     * Test complete signup fails without OAuth session.
     */
    public function test_complete_signup_fails_without_oauth_session(): void
    {
        $response = $this->post(route('google.complete-signup'), [
            'role' => 'engineer',
        ]);

        $response->assertRedirect('/login');
        $response->assertSessionHas('error');

        // No users should be created
        $this->assertEquals(0, User::count());
    }

    /**
     * Test complete signup validates role.
     */
    public function test_complete_signup_validates_role(): void
    {
        $this->withSession([
            'oauth_pending' => [
                'google_id' => '555666777',
                'email' => 'user@example.com',
                'name' => 'User',
                'avatar' => 'https://example.com/avatar.jpg',
            ],
        ]);

        $response = $this->post(route('google.complete-signup'), [
            'role' => 'invalid_role',
        ]);

        $response->assertSessionHasErrors('role');

        // User should not be created
        $this->assertDatabaseMissing('users', [
            'email' => 'user@example.com',
        ]);
    }

    /**
     * Test handle auth code (JWT) with new user redirects to role selection.
     */
    public function test_handle_auth_code_with_new_user_redirects_to_role_selection(): void
    {
        $jwtToken = $this->generateGoogleJWT([
            'sub' => '123456789',
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'picture' => 'https://example.com/avatar.jpg',
        ]);

        $response = $this->post(route('google.auth-code'), [
            'credential' => $jwtToken,
        ]);

        // Should redirect to role selection
        $response->assertRedirectContains('role-selection');

        // User should NOT be created yet
        $this->assertDatabaseMissing('users', [
            'email' => 'john@example.com',
        ]);

        // OAuth pending session should be set
        $this->assertNotNull(session('oauth_pending'));
        $this->assertEquals('123456789', session('oauth_pending.google_id'));
    }

    /**
     * Test handle auth code with existing user logs in directly.
     */
    public function test_handle_auth_code_with_existing_user_logs_in(): void
    {
        $user = User::factory()->create([
            'email' => 'john@example.com',
            'google_id' => '123456789',
        ]);

        $jwtToken = $this->generateGoogleJWT([
            'sub' => '123456789',
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'picture' => 'https://example.com/avatar.jpg',
        ]);

        $response = $this->post(route('google.auth-code'), [
            'credential' => $jwtToken,
        ]);

        // Should redirect to dashboard
        $response->assertRedirectContains('/dashboard');

        // User should still be only one
        $this->assertEquals(1, User::count());

        // User should be logged in
        $this->assertAuthenticatedAs($user);
    }

    /**
     * Test handle auth code links to existing user by email.
     */
    public function test_handle_auth_code_links_to_existing_user_by_email(): void
    {
        $user = User::factory()->create([
            'email' => 'john@example.com',
            'google_id' => null,
        ]);

        $jwtToken = $this->generateGoogleJWT([
            'sub' => '123456789',
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'picture' => 'https://example.com/avatar.jpg',
        ]);

        $response = $this->post(route('google.auth-code'), [
            'credential' => $jwtToken,
        ]);

        // Should redirect to dashboard
        $response->assertRedirectContains('/dashboard');

        // User should still be only one
        $this->assertEquals(1, User::count());

        // User's Google ID should be linked
        $user->refresh();
        $this->assertEquals('123456789', $user->google_id);

        // User should be logged in
        $this->assertAuthenticatedAs($user);
    }

    /**
     * Test handle auth code with invalid JWT returns error.
     */
    public function test_handle_auth_code_with_invalid_jwt_returns_error(): void
    {
        $response = $this->post(route('google.auth-code'), [
            'credential' => 'invalid.jwt.token',
        ]);

        // Should redirect to login with error
        $response->assertRedirectContains('/login');
        $response->assertSessionHas('error');

        // No users should be created
        $this->assertEquals(0, User::count());

        // User should not be authenticated
        $this->assertGuest();
    }

    /**
     * Test show role selection renders page with session data.
     */
    public function test_show_role_selection_renders_page(): void
    {
        $this->withSession([
            'oauth_pending' => [
                'google_id' => '123456789',
                'email' => 'john@example.com',
                'name' => 'John Doe',
                'avatar' => 'https://example.com/avatar.jpg',
            ],
        ]);

        $response = $this->get(route('google.role-selection'));

        // Should render Inertia page
        $response->assertStatus(200);
        $response->assertViewHas('oauthUser');
    }

    /**
     * Test show role selection redirects without session data.
     */
    public function test_show_role_selection_redirects_without_session(): void
    {
        $response = $this->get(route('google.role-selection'));

        // Should redirect to login
        $response->assertRedirectContains('/login');
    }

    /**
     * Helper method to generate a Google JWT token for testing.
     */
    private function generateGoogleJWT(array $claims): string
    {
        // Base64url encode header
        $header = json_encode(['alg' => 'RS256', 'typ' => 'JWT']);
        $headerEncoded = rtrim(strtr(base64_encode($header), '+/', '-_'), '=');

        // Base64url encode payload with standard claims
        $payload = array_merge([
            'iss' => 'https://accounts.google.com',
            'azp' => 'test-client-id.apps.googleusercontent.com',
            'aud' => 'test-client-id.apps.googleusercontent.com',
            'iat' => time(),
            'exp' => time() + 3600,
            'email_verified' => true,
        ], $claims);
        $payloadEncoded = rtrim(strtr(base64_encode(json_encode($payload)), '+/', '-_'), '=');

        // For testing, we use a fake signature (the service doesn't verify it)
        $signature = rtrim(strtr(base64_encode('fake_signature'), '+/', '-_'), '=');

        return "{$headerEncoded}.{$payloadEncoded}.{$signature}";
    }

    /**
     * Helper method to mock Socialite's Google user response.
     */
    private function mockSocialiteUser(array $userData): void
    {
        $googleUserMock = \Mockery::mock();
        $googleUserMock->shouldReceive('getId')->andReturn($userData['id']);
        $googleUserMock->shouldReceive('getName')->andReturn($userData['name']);
        $googleUserMock->shouldReceive('getEmail')->andReturn($userData['email']);
        $googleUserMock->shouldReceive('getAvatar')->andReturn($userData['avatar']);
        $googleUserMock->token = $userData['token'];

        $driverMock = \Mockery::mock();
        $driverMock->shouldReceive('user')->andReturn($googleUserMock);

        Socialite::shouldReceive('driver')
            ->with('google')
            ->andReturn($driverMock);
    }
}