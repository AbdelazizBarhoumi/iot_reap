<?php

namespace Tests\Unit;

use App\Models\ProxmoxNode;
use App\Models\ProxmoxServer;
use App\Services\ProxmoxClient;
use App\Services\ProxmoxClientFactory;
use App\Services\ProxmoxClientInterface;
use Tests\TestCase;

class ProxmoxClientFactoryTest extends TestCase
{
    private ProxmoxClientFactory $factory;

    protected function setUp(): void
    {
        parent::setUp();
        $this->factory = app(ProxmoxClientFactory::class);
    }

    public function test_make_returns_client_interface(): void
    {
        $server = ProxmoxServer::factory()->create();

        $client = $this->factory->make($server);

        $this->assertInstanceOf(ProxmoxClientInterface::class, $client);
        $this->assertInstanceOf(ProxmoxClient::class, $client);
    }

    public function test_make_default_returns_configured_server(): void
    {
        $defaultServer = ProxmoxServer::factory()->create(['is_active' => true, 'name' => 'default']);
        config(['proxmox.default_server_id' => $defaultServer->id]);

        $client = $this->factory->makeDefault();

        $this->assertInstanceOf(ProxmoxClientInterface::class, $client);
    }

    public function test_make_default_uses_first_active_when_no_config(): void
    {
        config(['proxmox.default_server_id' => null]);

        $server1 = ProxmoxServer::factory()->create(['is_active' => true, 'created_at' => now()]);
        $server2 = ProxmoxServer::factory()->create(['is_active' => true, 'created_at' => now()->addSecond()]);

        $client = $this->factory->makeDefault();

        $this->assertInstanceOf(ProxmoxClientInterface::class, $client);
    }

    public function test_make_default_throws_when_no_servers(): void
    {
        config(['proxmox.default_server_id' => null]);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('No active Proxmox server configured');

        $this->factory->makeDefault();
    }

    public function test_make_for_server_id(): void
    {
        $server = ProxmoxServer::factory()->create();

        $client = $this->factory->makeForServerId($server->id);

        $this->assertInstanceOf(ProxmoxClientInterface::class, $client);
    }

    public function test_make_for_server_id_throws_on_not_found(): void
    {
        $this->expectException(\Illuminate\Database\Eloquent\ModelNotFoundException::class);

        $this->factory->makeForServerId(999);
    }

    public function test_make_for_node(): void
    {
        $server = ProxmoxServer::factory()->create();
        $node = ProxmoxNode::factory()->create(['proxmox_server_id' => $server->id, 'name' => 'pve-1']);

        $client = $this->factory->makeForNode('pve-1');

        $this->assertInstanceOf(ProxmoxClientInterface::class, $client);
    }

    public function test_make_for_node_throws_on_node_not_found(): void
    {
        $this->expectException(\Illuminate\Database\Eloquent\ModelNotFoundException::class);

        $this->factory->makeForNode('nonexistent-node');
    }

    public function test_can_create_multiple_clients_for_same_server(): void
    {
        $server = ProxmoxServer::factory()->create();

        $client1 = $this->factory->make($server);
        $client2 = $this->factory->make($server);

        // Both are ProxmoxClientInterface
        $this->assertInstanceOf(ProxmoxClientInterface::class, $client1);
        $this->assertInstanceOf(ProxmoxClientInterface::class, $client2);

        // They are NOT the same instance (factory creates new each time)
        $this->assertNotSame($client1, $client2);
    }

    public function test_can_create_clients_for_multiple_servers(): void
    {
        $server1 = ProxmoxServer::factory()->create(['name' => 'cluster-1']);
        $server2 = ProxmoxServer::factory()->create(['name' => 'cluster-2']);
        $server3 = ProxmoxServer::factory()->create(['name' => 'cluster-3']);

        $client1 = $this->factory->make($server1);
        $client2 = $this->factory->make($server2);
        $client3 = $this->factory->make($server3);

        $this->assertInstanceOf(ProxmoxClientInterface::class, $client1);
        $this->assertInstanceOf(ProxmoxClientInterface::class, $client2);
        $this->assertInstanceOf(ProxmoxClientInterface::class, $client3);
    }
}
