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
}
