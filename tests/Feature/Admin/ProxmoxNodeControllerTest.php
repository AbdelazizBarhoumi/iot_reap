<?php

namespace Tests\Feature\Admin;

use App\Models\ProxmoxNode;
use App\Models\ProxmoxServer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProxmoxNodeControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_get_vms_rejected_when_server_inactive(): void
    {
        $admin = User::factory()->admin()->create();

        $server = ProxmoxServer::create([
            'name' => 'Server A',
            'host' => '10.0.0.1',
            'port' => 8006,
            'token_id' => 't',
            'token_secret' => 's',
            'is_active' => false,
        ]);

        $node = ProxmoxNode::create([
            'proxmox_server_id' => $server->id,
            'name' => 'node1',
            'hostname' => 'pve1.example.com',
            'api_url' => 'https://pve1.example.com:8006/api2/json',
            'status' => 'online',
            'max_vms' => 5,
        ]);

        $response = $this->actingAs($admin)->getJson("/admin/nodes/{$node->id}/vms");

        $response->assertStatus(422);
        $response->assertJsonPath('error', 'Proxmox server is inactive');
    }

    public function test_vm_actions_rejected_when_server_inactive(): void
    {
        $admin = User::factory()->admin()->create();

        $server = ProxmoxServer::create([
            'name' => 'Server A',
            'host' => '10.0.0.1',
            'port' => 8006,
            'token_id' => 't',
            'token_secret' => 's',
            'is_active' => false,
        ]);

        $node = ProxmoxNode::create([
            'proxmox_server_id' => $server->id,
            'name' => 'node1',
            'hostname' => 'pve1.example.com',
            'api_url' => 'https://pve1.example.com:8006/api2/json',
            'status' => 'online',
            'max_vms' => 5,
        ]);

        $response = $this->actingAs($admin)->postJson("/admin/nodes/{$node->id}/vms/100/start");
        $response->assertStatus(422)->assertJsonPath('error', 'Proxmox server is inactive');

        $response = $this->actingAs($admin)->postJson("/admin/nodes/{$node->id}/vms/100/stop");
        $response->assertStatus(422)->assertJsonPath('error', 'Proxmox server is inactive');
    }
}
