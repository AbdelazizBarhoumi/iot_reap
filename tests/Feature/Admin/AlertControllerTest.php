<?php

namespace Tests\Feature\Admin;

use App\Models\SystemAlert;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AlertControllerTest extends TestCase
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

    public function test_admin_can_view_alerts_page(): void
    {
        $response = $this->actingAs($this->admin)
            ->get('/admin/alerts');

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/AlertsPage'));
    }

    public function test_admin_can_list_alerts_as_json(): void
    {
        SystemAlert::create([
            'severity' => 'critical',
            'title' => 'Node Offline',
            'description' => 'Gateway node is offline',
            'source' => 'hardware',
            'metadata' => ['node' => 'gw-1'],
            'acknowledged' => false,
            'resolved' => false,
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/admin/alerts');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'severity', 'title', 'acknowledged', 'resolved'],
                ],
                'meta' => ['current_page', 'last_page', 'total', 'per_page'],
            ]);
    }

    public function test_admin_can_acknowledge_and_resolve_alert(): void
    {
        $alert = SystemAlert::create([
            'severity' => 'warning',
            'title' => 'High CPU',
            'description' => 'CPU usage above threshold',
            'source' => 'proxmox',
            'metadata' => ['cpu' => 92],
            'acknowledged' => false,
            'resolved' => false,
        ]);

        $this->actingAs($this->admin)
            ->postJson("/admin/alerts/{$alert->id}/acknowledge")
            ->assertOk()
            ->assertJsonPath('data.acknowledged', true);

        $this->actingAs($this->admin)
            ->postJson("/admin/alerts/{$alert->id}/resolve")
            ->assertOk()
            ->assertJsonPath('data.resolved', true);
    }

    public function test_non_admin_cannot_access_alert_routes(): void
    {
        $this->actingAs($this->engineer)
            ->get('/admin/alerts')
            ->assertForbidden();

        $this->actingAs($this->engineer)
            ->getJson('/admin/alerts')
            ->assertForbidden();
    }
}
