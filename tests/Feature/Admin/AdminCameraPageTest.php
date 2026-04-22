<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminCameraPageTest extends TestCase
{
    public function test_admin_can_open_cameras_page_in_browser(): void
    {
        $admin = User::factory()->create(['role' => UserRole::ADMIN]);

        $this->actingAs($admin)
            ->get('/admin/cameras')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/InfrastructurePage')
                ->where('initialTab', 'cameras')
            );
    }
}
