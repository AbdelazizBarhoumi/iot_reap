<?php

namespace Tests\Unit\Services;

use App\Models\ProxmoxNode;
use App\Models\ProxmoxServer;
use App\Services\ProxmoxNodeSyncService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProxmoxNodeSyncServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_sync_nodes_creates_multiple_distinct_records(): void
    {
        $server = ProxmoxServer::factory()->create();

        // partially mock the service so we can control the API payload
        $service = $this->partialMock(ProxmoxNodeSyncService::class, function ($mock) use ($server) {
            $mock->shouldAllowMockingProtectedMethods();
            $mock->shouldReceive('fetchNodesFromApi')
                ->with($server)
                ->andReturn([
                    ['node' => 'node-A', 'status' => 'online', 'hostname' => 'node-a.local'],
                    ['node' => 'node-B', 'status' => 'online', 'hostname' => 'node-b.local'],
                ]);
        });

        $result = $service->syncNodes($server);

        $this->assertEquals(2, $result['synced']);
        $this->assertDatabaseHas('proxmox_nodes', ['name' => 'node-A', 'hostname' => 'node-a.local']);
        $this->assertDatabaseHas('proxmox_nodes', ['name' => 'node-B', 'hostname' => 'node-b.local']);
    }

    public function test_hostname_uniqueness_is_scoped_to_server(): void
    {
        $server1 = ProxmoxServer::factory()->create();
        $server2 = ProxmoxServer::factory()->create();

        ProxmoxNode::factory()->create([
            'proxmox_server_id' => $server1->id,
            'hostname' => 'shared.host',
        ]);

        // when we create another node with the same hostname but a different
        // server id it should succeed now that the index is scoped.
        ProxmoxNode::factory()->create([
            'proxmox_server_id' => $server2->id,
            'hostname' => 'shared.host',
        ]);

        $this->assertDatabaseCount('proxmox_nodes', 2);
    }
}
