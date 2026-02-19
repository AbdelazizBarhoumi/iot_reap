<?php

namespace Tests\Unit;

use App\Models\ProxmoxServer;
use App\Models\ProxmoxNode;
use App\Models\VMSession;
use App\Models\User;
use App\Models\VMTemplate;
use App\Enums\VMSessionStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProxmoxServerModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_proxmox_server_tokens_encrypted_on_save(): void
    {
        $originalTokenId = 'PVEAPIToken=user@pam!token=abc123def456';
        $originalSecret = 'xyz789uvw012pqr345stu678vwx901yz';

        $server = ProxmoxServer::create([
            'name' => 'Test Cluster',
            'host' => '192.168.1.100',
            'port' => 8006,
            'realm' => 'pam',
            'token_id' => $originalTokenId,
            'token_secret' => $originalSecret,
            'verify_ssl' => true,
            'is_active' => true,
        ]);

        // Reload from database to get the decrypted version
        $server = ProxmoxServer::find($server->id);

        // Verify tokens are decrypted transparently
        $this->assertEquals($originalTokenId, $server->token_id);
        $this->assertEquals($originalSecret, $server->token_secret);
    }

    public function test_proxmox_server_tokens_encrypted_in_database(): void
    {
        $originalTokenId = 'PVEAPIToken=user@pam!token=abc123def456';
        $originalSecret = 'xyz789uvw012pqr345stu678vwx901yz';

        ProxmoxServer::create([
            'name' => 'Test Cluster',
            'host' => '192.168.1.100',
            'port' => 8006,
            'realm' => 'pam',
            'token_id' => $originalTokenId,
            'token_secret' => $originalSecret,
            'verify_ssl' => true,
            'is_active' => true,
        ]);

        // Use raw query to verify data is actually encrypted in database
        $rawData = \DB::table('proxmox_servers')->first();

        // Tokens in database should NOT match the original plaintext values
        $this->assertNotEquals($originalTokenId, $rawData->token_id);
        $this->assertNotEquals($originalSecret, $rawData->token_secret);
    }

    public function test_proxmox_server_has_nodes_relationship(): void
    {
        $server = ProxmoxServer::factory()->create();
        $node = ProxmoxNode::factory()->create(['proxmox_server_id' => $server->id]);

        $this->assertTrue($server->nodes->contains($node));
        $this->assertEquals($node->proxmox_server_id, $server->id);
    }

    public function test_proxmox_server_has_vm_sessions_relationship(): void
    {
        $user = User::factory()->create();
        $template = VMTemplate::factory()->create();
        $node = ProxmoxNode::factory()->create();
        $server = ProxmoxServer::factory()->create();

        $session = VMSession::factory()->create([
            'user_id' => $user->id,
            'template_id' => $template->id,
            'node_id' => $node->id,
            'proxmox_server_id' => $server->id,
        ]);

        $this->assertTrue($server->vmSessions->contains($session));
        $this->assertEquals($session->proxmox_server_id, $server->id);
    }

    public function test_proxmox_server_created_by_relationship(): void
    {
        $user = User::factory()->create();
        $server = ProxmoxServer::factory()->create(['created_by' => $user->id]);

        $this->assertEquals($server->createdBy->id, $user->id);
    }

    public function test_proxmox_server_api_url_generation(): void
    {
        $server = ProxmoxServer::create([
            'name' => 'Test Cluster',
            'host' => '192.168.1.100',
            'port' => 8006,
            'realm' => 'pam',
            'token_id' => 'test_token',
            'token_secret' => 'test_secret',
            'verify_ssl' => true,
            'is_active' => true,
        ]);

        $expectedUrl = 'https://192.168.1.100:8006/api2/json';
        $this->assertEquals($expectedUrl, $server->getApiUrl());
    }

    public function test_proxmox_node_belongs_to_server(): void
    {
        $server = ProxmoxServer::factory()->create();
        $node = ProxmoxNode::factory()->create(['proxmox_server_id' => $server->id]);

        $this->assertEquals($node->proxmoxServer->id, $server->id);
    }

    public function test_vm_session_belongs_to_server(): void
    {
        $user = User::factory()->create();
        $template = VMTemplate::factory()->create();
        $node = ProxmoxNode::factory()->create();
        $server = ProxmoxServer::factory()->create();

        $session = VMSession::factory()->create([
            'user_id' => $user->id,
            'template_id' => $template->id,
            'node_id' => $node->id,
            'proxmox_server_id' => $server->id,
        ]);

        $this->assertEquals($session->proxmoxServer->id, $server->id);
    }

    public function test_proxmox_server_is_active_filtering(): void
    {
        $activeServer = ProxmoxServer::factory()->create(['is_active' => true]);
        $inactiveServer = ProxmoxServer::factory()->create(['is_active' => false]);

        $activeServers = ProxmoxServer::where('is_active', true)->get();

        $this->assertTrue($activeServers->contains($activeServer));
        $this->assertFalse($activeServers->contains($inactiveServer));
    }
}
