<?php

namespace Tests\Feature\Admin;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ActivityLogControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $engineer;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create();
        $this->engineer = User::factory()->engineer()->create();
    }

    public function test_admin_can_view_activity_logs_page(): void
    {
        $response = $this->actingAs($this->admin)
            ->get('/admin/activity-logs');

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/ActivityLogsPage'));
    }

    public function test_admin_can_list_activity_logs_as_json(): void
    {
        ActivityLog::create([
            'type' => 'security',
            'action' => 'login',
            'description' => 'Admin logged in',
            'user_id' => $this->admin->id,
            'ip_address' => '127.0.0.1',
            'metadata' => ['context' => 'auth'],
            'status' => 'completed',
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/admin/activity-logs');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'type', 'action', 'description', 'status', 'created_at'],
                ],
                'meta' => ['current_page', 'last_page', 'total', 'per_page'],
            ]);
    }

    public function test_admin_can_filter_activity_logs_by_user(): void
    {
        ActivityLog::create([
            'type' => 'vm',
            'action' => 'vm_started',
            'description' => 'Engineer started VM',
            'user_id' => $this->engineer->id,
            'ip_address' => '127.0.0.1',
            'metadata' => ['vm_id' => 201],
            'status' => 'completed',
        ]);

        ActivityLog::create([
            'type' => 'security',
            'action' => 'admin_login',
            'description' => 'Admin login',
            'user_id' => $this->admin->id,
            'ip_address' => '127.0.0.1',
            'metadata' => ['scope' => 'admin'],
            'status' => 'completed',
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson("/admin/activity-logs/user?user_id={$this->engineer->id}");

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.user_id', $this->engineer->id);
    }

    public function test_non_admin_cannot_access_activity_logs_routes(): void
    {
        $this->actingAs($this->engineer)
            ->get('/admin/activity-logs')
            ->assertForbidden();

        $this->actingAs($this->engineer)
            ->getJson('/admin/activity-logs')
            ->assertForbidden();
    }
}
