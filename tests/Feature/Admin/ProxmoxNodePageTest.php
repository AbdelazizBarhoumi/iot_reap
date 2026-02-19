<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ProxmoxNodePageTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_nodes_page_renders_inertia_for_html_request(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get('/admin/nodes')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/NodesPage')
            );
    }

    public function test_admin_nodes_index_returns_json_for_api_request(): void
    {
        $admin = User::factory()->admin()->create();

        // Ensure at least one node exists so the response contains an item
        \App\Models\ProxmoxNode::factory()->create();

        $response = $this->actingAs($admin)->getJson('/admin/nodes');

        $response->assertOk()
            ->assertJsonStructure(['data' => [['id', 'name', 'status', 'max_vms', 'active_vm_count']]]);
    }

    public function test_index_skips_node_stats_for_inactive_server(): void
    {
        $admin = User::factory()->admin()->create();

        $server = \App\Models\ProxmoxServer::create([
            'name' => 'Inactive Cluster',
            'host' => '10.0.0.5',
            'port' => 8006,
            'token_id' => 't',
            'token_secret' => 's',
            'is_active' => false,
        ]);

        $node = \App\Models\ProxmoxNode::create([
            'proxmox_server_id' => $server->id,
            'name' => 'inactive-node',
            'hostname' => 'inactive.example',
            'api_url' => 'https://inactive.example:8006/api2/json',
            'status' => 'online',
            'max_vms' => 10,
        ]);

        $response = $this->actingAs($admin)->getJson('/admin/nodes');

        $response->assertOk();

        $nodeData = collect($response->json('data'))->firstWhere('id', $node->id);

        $this->assertNotNull($nodeData);
        $this->assertFalse($nodeData['server_active']);

        // Stats should be omitted for nodes whose server is inactive
        $this->assertArrayNotHasKey('cpu_percent', $nodeData);
        $this->assertArrayNotHasKey('ram_used_mb', $nodeData);
        $this->assertArrayNotHasKey('ram_total_mb', $nodeData);
        $this->assertArrayNotHasKey('uptime_seconds', $nodeData);
    }

    public function test_engineer_cannot_access_admin_nodes_route(): void
    {
        $user = User::factory()->engineer()->create();

        $this->actingAs($user)
            ->get('/admin/nodes')
            ->assertForbidden();

        $this->actingAs($user)
            ->getJson('/admin/nodes')
            ->assertForbidden();
    }
}
