<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthEndpointsTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_endpoint_returns_201()
    {
        $response = $this->postJson('/auth/register', [
            'name' => 'Api User',
            'email' => 'api@example.com',
            'password' => 'secret',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', ['email' => 'api@example.com']);
    }

    public function test_login_endpoint_returns_200_and_creates_session()
    {
        $user = User::factory()->create(['password' => 'hunter2']);

        $response = $this->postJson('/auth/login', [
            'email' => $user->email,
            'password' => 'hunter2',
        ]);

        $response->assertOk();
        $this->assertAuthenticatedAs($user);
    }

    public function test_invalid_login_returns_401()
    {
        $user = User::factory()->create();

        $response = $this->postJson('/auth/login', [
            'email' => 'no-such@example.com',
            'password' => 'bad',
        ]);

        $response->assertStatus(401);
        $this->assertGuest();
    }

    public function test_me_endpoint_returns_authenticated_user_and_requires_auth()
    {
        // unauthenticated JSON request should return 401
        $response = $this->getJson('/auth/me');
        $response->assertStatus(401); // unauthorized

        $user = User::factory()->create();
        $response = $this->actingAs($user)->getJson('/auth/me');

        $response->assertOk()
            ->assertJsonPath('data.email', $user->email)
            ->assertJsonMissing(['password']);
    }

    public function test_logout_endpoint_invalidates_session()
    {
        $user = User::factory()->create(['password' => 'hunter2']);

        $this->actingAs($user);

        $response = $this->postJson('/auth/logout');

        $response->assertStatus(204);
        $this->assertGuest();
    }
}
