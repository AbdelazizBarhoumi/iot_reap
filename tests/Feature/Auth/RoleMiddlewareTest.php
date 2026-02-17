<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class RoleMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Route::middleware('role:admin,security_officer')->get('/admin-only', function () {
            return 'ok';
        });
    }

    public function test_engineer_cannot_access_admin_route(): void
    {
        $user = User::factory()->create(); // default: engineer

        $response = $this->actingAs($user)->get('/admin-only');

        $response->assertForbidden();
    }

    public function test_admin_can_access_admin_route(): void
    {
        $admin = User::factory()->create(['role' => UserRole::ADMIN->value]);

        $response = $this->actingAs($admin)->get('/admin-only');

        $response->assertOk();
    }
}
