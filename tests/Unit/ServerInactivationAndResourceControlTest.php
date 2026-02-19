<?php

namespace Tests\Unit;

use App\Models\ProxmoxServer;
use App\Models\ProxmoxNode;
use App\Models\VMSession;
use App\Models\VMTemplate;
use App\Models\User;
use App\Enums\VMSessionStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Tests for US-51: Server Inactivation, Resource Control & Encryption
 */
class ServerInactivationAndResourceControlTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that host and port are encrypted in the database
     */
    public function test_host_and_port_encrypted_in_database(): void
    {
        $host = '192.168.1.100';
        $port = 8006;

        $server = ProxmoxServer::create([
            'name' => 'Test Cluster',
            'host' => $host,
            'port' => $port,
            'realm' => 'pam',
            'token_id' => 'test_token_id',
            'token_secret' => 'test_secret',
            'verify_ssl' => true,
            'is_active' => true,
        ]);

        // Query the database directly to verify encryption
        $databaseRecord = \DB::table('proxmox_servers')
            ->where('id', $server->id)
            ->first();

        // The database value should NOT be plain text
        $this->assertNotEquals($host, $databaseRecord->host);
        $this->assertNotEquals((string)$port, $databaseRecord->port);

        // But the model should decrypt transparently
        $server = ProxmoxServer::find($server->id);
        $this->assertEquals($host, $server->host);
        $this->assertEquals($port, $server->port);
    }

    /**
     * Test that scopeActive() filters only active servers
     */
    public function test_scope_active_filters_only_active_servers(): void
    {
        ProxmoxServer::create([
            'name' => 'Active Server',
            'host' => '192.168.1.100',
            'port' => 8006,
            'realm' => 'pam',
            'token_id' => 'token1',
            'token_secret' => 'secret1',
            'is_active' => true,
        ]);

        ProxmoxServer::create([
            'name' => 'Inactive Server',
            'host' => '192.168.1.101',
            'port' => 8006,
            'realm' => 'pam',
            'token_id' => 'token2',
            'token_secret' => 'secret2',
            'is_active' => false,
        ]);

        $activeServers = ProxmoxServer::active()->get();

        $this->assertCount(1, $activeServers);
        $this->assertEquals('Active Server', $activeServers->first()->name);
    }

    /**
     * Test canProvisionsMore() rejects when max VMs per node exceeded
     */
    public function test_can_provisions_more_rejects_when_max_vms_exceeded(): void
    {
        $server = ProxmoxServer::create([
            'name' => 'Test Cluster',
            'host' => '192.168.1.100',
            'port' => 8006,
            'realm' => 'pam',
            'token_id' => 'token',
            'token_secret' => 'secret',
            'is_active' => true,
            'max_vms_per_node' => 2,
            'max_concurrent_sessions' => 20,
            'cpu_overcommit_ratio' => 2.0,
            'memory_overcommit_ratio' => 1.5,
        ]);

        $node = ProxmoxNode::create([
            'proxmox_server_id' => $server->id,
            'name' => 'node1',
            'hostname' => 'pve.example.com',
            'api_url' => 'https://pve.example.com:8006/api2/json',
            'status' => 'online',
            'max_vms' => 5,
        ]);

        $user = User::factory()->create();
        $template = VMTemplate::factory()->create();

        // Create 2 active sessions on this node
        for ($i = 0; $i < 2; $i++) {
            VMSession::create([
                'user_id' => $user->id,
                'template_id' => $template->id,
                'proxmox_server_id' => $server->id,
                'node_id' => $node->id,
                'vm_id' => 100 + $i,
                'status' => VMSessionStatus::ACTIVE,
                'session_type' => 'ephemeral',
                'expires_at' => now()->addHours(2),
            ]);
        }

        // Should be unable to provision more (max_vms_per_node = 2)
        $this->assertFalse($server->canProvisionsMore($node));
    }

    /**
     * Test canProvisionsMore() rejects when max concurrent sessions exceeded
     */
    public function test_can_provisions_more_rejects_when_max_sessions_exceeded(): void
    {
        $server = ProxmoxServer::create([
            'name' => 'Test Cluster',
            'host' => '192.168.1.100',
            'port' => 8006,
            'realm' => 'pam',
            'token_id' => 'token',
            'token_secret' => 'secret',
            'is_active' => true,
            'max_vms_per_node' => 10,
            'max_concurrent_sessions' => 2,
            'cpu_overcommit_ratio' => 2.0,
            'memory_overcommit_ratio' => 1.5,
        ]);

        $node = ProxmoxNode::create([
            'proxmox_server_id' => $server->id,
            'name' => 'node1',
            'hostname' => 'pve.example.com',
            'api_url' => 'https://pve.example.com:8006/api2/json',
            'status' => 'online',
            'max_vms' => 5,
        ]);

        $user = User::factory()->create();
        $template = VMTemplate::factory()->create();

        // Create 2 sessions to hit max_concurrent_sessions limit
        for ($i = 0; $i < 2; $i++) {
            VMSession::create([
                'user_id' => $user->id,
                'template_id' => $template->id,
                'proxmox_server_id' => $server->id,
                'node_id' => $node->id,
                'vm_id' => 100 + $i,
                'status' => VMSessionStatus::ACTIVE,
                'session_type' => 'ephemeral',
                'expires_at' => now()->addHours(2),
            ]);
        }

        // Should be unable to provision more (max_concurrent_sessions = 2)
        $this->assertFalse($server->canProvisionsMore($node));
    }

    /**
     * Test canProvisionsMore() allows when resources available
     */
    public function test_can_provisions_more_allows_when_resources_available(): void
    {
        $server = ProxmoxServer::create([
            'name' => 'Test Cluster',
            'host' => '192.168.1.100',
            'port' => 8006,
            'realm' => 'pam',
            'token_id' => 'token',
            'token_secret' => 'secret',
            'is_active' => true,
            'max_vms_per_node' => 5,
            'max_concurrent_sessions' => 10,
            'cpu_overcommit_ratio' => 2.0,
            'memory_overcommit_ratio' => 1.5,
        ]);

        $node = ProxmoxNode::create([
            'proxmox_server_id' => $server->id,
            'name' => 'node1',
            'hostname' => 'pve.example.com',
            'api_url' => 'https://pve.example.com:8006/api2/json',
            'status' => 'online',
            'max_vms' => 5,
        ]);

        // Should be able to provision (no active sessions)
        $this->assertTrue($server->canProvisionsMore($node));
    }

    /**
     * Test countActiveVMs counts only active, non-expired sessions
     */
    public function test_count_active_vms_counts_only_active_non_expired(): void
    {
        // Create a server for FK integrity
        $server = ProxmoxServer::create([
            'name' => 'Server For Node',
            'host' => '127.0.0.1',
            'port' => 8006,
            'realm' => 'pam',
            'token_id' => 'token',
            'token_secret' => 'secret',
            'is_active' => true,
        ]);

        $node = ProxmoxNode::create([
            'proxmox_server_id' => $server->id,
            'name' => 'node1',
            'hostname' => 'pve.example.com',
            'api_url' => 'https://pve.example.com:8006/api2/json',
            'status' => 'online',
            'max_vms' => 5,
        ]);

        $user = User::factory()->create();
        $template = VMTemplate::factory()->create();

        // Create active session
        VMSession::create([
            'user_id' => $user->id,
            'template_id' => $template->id,
            'node_id' => $node->id,
            'status' => VMSessionStatus::ACTIVE,
            'session_type' => 'ephemeral',
            'expires_at' => now()->addHours(2),
        ]);

        // Create expired session
        VMSession::create([
            'user_id' => $user->id,
            'template_id' => $template->id,
            'node_id' => $node->id,
            'status' => VMSessionStatus::ACTIVE,
            'session_type' => 'ephemeral',
            'expires_at' => now()->subHours(1),
        ]);

        // Create terminated session
        VMSession::create([
            'user_id' => $user->id,
            'template_id' => $template->id,
            'node_id' => $node->id,
            'status' => VMSessionStatus::TERMINATED,
            'session_type' => 'ephemeral',
            'expires_at' => now()->addHours(2),
        ]);

        // Should only count the active non-expired session
        $count = $node->countActiveVMs();
        $this->assertEquals(1, $count);
    }

    /**
     * Test resource columns have correct defaults
     */
    public function test_resource_columns_have_correct_defaults(): void
    {
        $server = ProxmoxServer::create([
            'name' => 'Test Cluster',
            'host' => '192.168.1.100',
            'port' => 8006,
            'realm' => 'pam',
            'token_id' => 'token',
            'token_secret' => 'secret',
            'is_active' => true,
        ]);

        // Reload so DB defaults are reflected on the model
        $server = $server->fresh();

        $this->assertEquals(5, $server->max_vms_per_node);
        $this->assertEquals(20, $server->max_concurrent_sessions);
        $this->assertEquals(2.0, $server->cpu_overcommit_ratio);
        $this->assertEquals(1.5, $server->memory_overcommit_ratio);
    }
}
