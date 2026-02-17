<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthEndpointsTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_endpoint_returns_201_with_valid_data(): void
    {
        $response = $this->postJson('/auth/register', [
            'name' => 'Api User',
            'email' => 'api@example.com',
            'password' => 'secretpassword',
            'password_confirmation' => 'secretpassword',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'name', 'email', 'role']])
            ->assertJsonPath('data.email', 'api@example.com')
            ->assertJsonPath('data.role', UserRole::ENGINEER->value);

        $this->assertDatabaseHas('users', ['email' => 'api@example.com']);
    }

    public function test_register_endpoint_returns_422_on_duplicate_email(): void
    {
        User::factory()->create(['email' => 'taken@example.com']);

        $response = $this->postJson('/auth/register', [
            'name' => 'Another User',
            'email' => 'taken@example.com',
            'password' => 'secretpassword',
            'password_confirmation' => 'secretpassword',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_register_endpoint_returns_422_on_password_mismatch(): void
    {
        $response = $this->postJson('/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'secretpassword',
            'password_confirmation' => 'differentpassword',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_login_endpoint_returns_200_and_creates_session(): void
    {
        $user = User::factory()->create(['password' => 'hunter2']);

        $response = $this->postJson('/auth/login', [
            'email' => $user->email,
            'password' => 'hunter2',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['data' => ['id', 'name', 'email', 'role']]);
        $this->assertAuthenticatedAs($user);
    }

    public function test_invalid_login_returns_401(): void
    {
        User::factory()->create();

        $response = $this->postJson('/auth/login', [
            'email' => 'no-such@example.com',
            'password' => 'bad',
        ]);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Invalid credentials.']);
        $this->assertGuest();
    }

    public function test_me_endpoint_returns_authenticated_user(): void
    {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user)->getJson('/auth/me');

        $response->assertOk()
            ->assertJsonPath('data.email', $user->email)
            ->assertJsonPath('data.role', $user->role->value)
            ->assertJsonMissingPath('data.password');
    }

    public function test_me_endpoint_requires_auth(): void
    {
        $response = $this->getJson('/auth/me');
        
        $response->assertStatus(401);
    }

    public function test_logout_endpoint_invalidates_session(): void
    {
        $user = User::factory()->create(['password' => 'hunter2']);

        $this->actingAs($user);

        $response = $this->postJson('/auth/logout');

        $response->assertStatus(204);
        $this->assertGuest();
    }
}
