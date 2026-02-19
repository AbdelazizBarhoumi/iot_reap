<?php

namespace Tests\Feature;

use App\Models\ProxmoxServer;
use App\Models\ProxmoxNode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProxmoxServerBackfillCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_backfill_creates_default_server_from_config(): void
    {
        // Setup environment
        config()->set('proxmox.host', '192.168.1.100');
        config()->set('proxmox.port', 8006);
        config()->set('proxmox.realm', 'pam');
        config()->set('proxmox.token_id', 'test_token_id');
        config()->set('proxmox.token_secret', 'test_token_secret');
        config()->set('proxmox.verify_ssl', true);

        // Run command
        $this->artisan('proxmox:backfill-default-server', ['--force' => true])
            ->assertExitCode(0);

        // Verify server was created
        $server = ProxmoxServer::where('host', '192.168.1.100')->first();
        $this->assertNotNull($server);
        $this->assertEquals('Default Cluster', $server->name);
        $this->assertEquals(8006, $server->port);
        $this->assertEquals('pam', $server->realm);
        $this->assertEquals('test_token_id', $server->token_id);
        $this->assertEquals('test_token_secret', $server->token_secret);
        $this->assertTrue($server->verify_ssl);
        $this->assertTrue($server->is_active);
    }

    public function test_backfill_links_orphaned_nodes(): void
    {
        // Create orphaned nodes
        ProxmoxNode::factory()->count(3)->create(['proxmox_server_id' => null]);

        // Setup environment
        config()->set('proxmox.host', '192.168.1.100');
        config()->set('proxmox.port', 8006);
        config()->set('proxmox.realm', 'pam');
        config()->set('proxmox.token_id', 'test_token_id');
        config()->set('proxmox.token_secret', 'test_token_secret');
        config()->set('proxmox.verify_ssl', true);

        // Run command
        $this->artisan('proxmox:backfill-default-server', ['--force' => true])
            ->assertExitCode(0);

        // Verify orphaned nodes are linked
        $orphanedNodes = ProxmoxNode::whereNull('proxmox_server_id')->count();
        $this->assertEquals(0, $orphanedNodes);

        // Verify nodes are linked to default server
        $server = ProxmoxServer::where('host', '192.168.1.100')->first();
        $this->assertEquals(3, $server->nodes()->count());
    }

    public function test_backfill_skips_if_server_already_exists(): void
    {
        // Create existing server
        $existingServer = ProxmoxServer::create([
            'name' => 'Existing Server',
            'host' => '192.168.1.100',
            'port' => 8006,
            'realm' => 'pam',
            'token_id' => 'existing_token',
            'token_secret' => 'existing_secret',
            'verify_ssl' => true,
            'is_active' => true,
        ]);

        // Setup environment
        config()->set('proxmox.host', '192.168.1.100');
        config()->set('proxmox.port', 8006);
        config()->set('proxmox.realm', 'pam');
        config()->set('proxmox.token_id', 'test_token_id');
        config()->set('proxmox.token_secret', 'test_token_secret');
        config()->set('proxmox.verify_ssl', true);

        // Run command
        $this->artisan('proxmox:backfill-default-server', ['--force' => true])
            ->assertExitCode(0);

        // Verify only one server exists with that host
        $count = ProxmoxServer::where('host', '192.168.1.100')->count();
        $this->assertEquals(1, $count);

        // Verify existing server wasn't modified
        $server = ProxmoxServer::find($existingServer->id);
        $this->assertEquals('existing_token', $server->token_id);
    }

    public function test_backfill_fails_without_credentials(): void
    {
        // Clear credentials
        config()->set('proxmox.token_id', null);
        config()->set('proxmox.token_secret', null);

        // Run command
        $this->artisan('proxmox:backfill-default-server', ['--force' => true])
            ->assertExitCode(1);
    }
}
