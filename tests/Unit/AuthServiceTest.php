<?php

namespace Tests\Unit;

use App\Enums\UserRole;
use App\Exceptions\InvalidCredentialsException;
use App\Repositories\UserRepository;
use App\Services\AuthService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class AuthServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_creates_user(): void
    {
        $repo = new UserRepository();
        $service = new AuthService($repo);

        $user = $service->register([
            'name' => 'New User',
            'email' => 'new@example.com',
            'password' => 'secret',
        ]);

        $this->assertDatabaseHas('users', ['email' => 'new@example.com']);
        $this->assertEquals(UserRole::ENGINEER, $user->role);
    }

    public function test_login_initializes_session_on_success(): void
    {
        $user = User::factory()->create(['password' => 'hunter2']);

        $service = new AuthService(new UserRepository());

        $service->login($user->email, 'hunter2');

        $this->assertAuthenticatedAs($user);
    }

    public function test_login_throws_on_invalid_credentials(): void
    {
        $this->expectException(InvalidCredentialsException::class);

        $service = new AuthService(new UserRepository());

        $service->login('no-such-user@example.com', 'bad-password');
    }
}
