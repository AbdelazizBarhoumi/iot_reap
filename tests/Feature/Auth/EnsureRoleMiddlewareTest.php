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

        Route::middleware('role:' . UserRole::ADMIN->value . ',' . UserRole::SECURITY_OFFICER->value)
            ->get('/test-admin-route', fn () => response()->json(['message' => 'ok']));
    }

    public function test_engineer_blocked_from_admin_route(): void
    {
        $user = User::factory()->engineer()->create();

        $response = $this->actingAs($user)->getJson('/test-admin-route');

        $response->assertForbidden()
            ->assertJson(['message' => 'Access denied. Insufficient role permissions.']);
    }

    public function test_admin_allowed_on_admin_route(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->getJson('/test-admin-route');

        $response->assertOk();
    }

    public function test_security_officer_allowed_on_admin_route(): void
    {
        $officer = User::factory()->securityOfficer()->create();

        $response = $this->actingAs($officer)->getJson('/test-admin-route');

        $response->assertOk();
    }

    public function test_unauthenticated_user_gets_401(): void
    {
        $response = $this->getJson('/test-admin-route');

        $response->assertUnauthorized();
    }
}
