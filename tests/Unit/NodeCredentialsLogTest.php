<?php

namespace Tests\Unit;

use App\Models\NodeCredentialsLog;
use App\Models\ProxmoxServer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NodeCredentialsLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_node_credentials_log_creation(): void
    {
        $server = ProxmoxServer::factory()->create();
        $user = User::factory()->create();

        $log = NodeCredentialsLog::create([
            'proxmox_server_id' => $server->id,
            'action' => 'registered',
            'ip_address' => '192.168.1.50',
            'changed_by' => $user->id,
            'details' => ['server_name' => $server->name],
        ]);

        $this->assertNotNull($log);
        $this->assertEquals('registered', $log->action);
        $this->assertEquals('192.168.1.50', $log->ip_address);
    }

    public function test_node_credentials_log_belongs_to_server(): void
    {
        $server = ProxmoxServer::factory()->create();
        $log = NodeCredentialsLog::factory()->create(['proxmox_server_id' => $server->id]);

        $this->assertEquals($log->proxmoxServer->id, $server->id);
    }

    public function test_node_credentials_log_belongs_to_user(): void
    {
        $server = ProxmoxServer::factory()->create();
        $user = User::factory()->create();
        $log = NodeCredentialsLog::factory()->create([
            'proxmox_server_id' => $server->id,
            'changed_by' => $user->id,
        ]);

        $this->assertEquals($log->user->id, $user->id);
    }

    public function test_node_credentials_log_details_json_cast(): void
    {
        $details = [
            'old_host' => '192.168.1.100',
            'new_host' => '192.168.1.101',
            'changes' => ['host'],
        ];

        $log = NodeCredentialsLog::create([
            'proxmox_server_id' => ProxmoxServer::factory()->create()->id,
            'action' => 'updated',
            'details' => $details,
        ]);

        $this->assertEquals($details, $log->details);
        $this->assertIsArray($log->details);
    }

    public function test_node_credentials_log_on_server_delete(): void
    {
        $server = ProxmoxServer::factory()->create();
        NodeCredentialsLog::factory()->count(3)->create(['proxmox_server_id' => $server->id]);

        $serverId = $server->id;
        $server->delete();

        // Logs should be cascade deleted
        $this->assertEquals(0, NodeCredentialsLog::where('proxmox_server_id', $serverId)->count());
    }
}
