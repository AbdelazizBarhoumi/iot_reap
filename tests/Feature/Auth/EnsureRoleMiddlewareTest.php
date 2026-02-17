<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class EnsureRoleMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Route::middleware('ensure.role:' . UserRole::ADMIN->value . ',' . UserRole::SECURITY_OFFICER->value)
            ->get('/ensure-admin', fn () => 'ok');
    }

    public function test_engineer_blocked_from_admin_route(): void
    {
        $user = User::factory()->create(); // default: engineer

        $response = $this->actingAs($user)->get('/ensure-admin');

        $response->assertForbidden();
    }

    public function test_admin_allowed_on_admin_route(): void
    {
        $admin = User::factory()->create(['role' => UserRole::ADMIN->value]);

        $response = $this->actingAs($admin)->get('/ensure-admin');

        $response->assertOk();
    }
}
