<?php

namespace Tests\Unit;

use App\Models\ProxmoxNode;
use App\Models\ProxmoxServer;
use App\Repositories\ProxmoxServerRepository;
use Tests\TestCase;

class ProxmoxServerRepositoryTest extends TestCase
{
    private ProxmoxServerRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = app(ProxmoxServerRepository::class);
    }

    public function test_find_active_returns_only_active_servers(): void
    {
        $active1 = ProxmoxServer::factory()->create(['is_active' => true, 'name' => 'cluster-1']);
        $active2 = ProxmoxServer::factory()->create(['is_active' => true, 'name' => 'cluster-2']);
        $inactive = ProxmoxServer::factory()->create(['is_active' => false, 'name' => 'cluster-3']);

        $results = $this->repository->findActive();

        $this->assertCount(2, $results);
        $this->assertTrue($results->contains($active1));
        $this->assertTrue($results->contains($active2));
        $this->assertFalse($results->contains($inactive));
    }

    public function test_find_active_includes_nodes(): void
    {
        $server = ProxmoxServer::factory()->create(['is_active' => true]);
        ProxmoxNode::factory()->count(3)->create(['proxmox_server_id' => $server->id]);

        $result = $this->repository->findActive()->first();

        $this->assertCount(3, $result->nodes);
    }

    public function test_find_by_id_returns_server_with_relations(): void
    {
        $server = ProxmoxServer::factory()->create();
        ProxmoxNode::factory()->count(2)->create(['proxmox_server_id' => $server->id]);

        $result = $this->repository->findById($server->id);

        $this->assertEquals($server->id, $result->id);
        $this->assertCount(2, $result->nodes);
    }

    public function test_find_by_id_throws_on_not_found(): void
    {
        $this->expectException(\Illuminate\Database\Eloquent\ModelNotFoundException::class);
        $this->repository->findById(999);
    }

    public function test_find_by_node_returns_correct_server(): void
    {
        $server1 = ProxmoxServer::factory()->create(['name' => 'server-1']);
        $server2 = ProxmoxServer::factory()->create(['name' => 'server-2']);

        $node1 = ProxmoxNode::factory()->create(['proxmox_server_id' => $server1->id, 'name' => 'node-1']);
        $node2 = ProxmoxNode::factory()->create(['proxmox_server_id' => $server2->id, 'name' => 'node-2']);

        $result1 = $this->repository->findByNode($node1);
        $result2 = $this->repository->findByNode($node2);

        $this->assertEquals($server1->id, $result1->id);
        $this->assertEquals($server2->id, $result2->id);
    }

    public function test_find_default_returns_configured_server(): void
    {
        $server1 = ProxmoxServer::factory()->create(['is_active' => true, 'name' => 'default']);
        $server2 = ProxmoxServer::factory()->create(['is_active' => true, 'name' => 'secondary']);

        config(['proxmox.default_server_id' => $server1->id]);

        $result = $this->repository->findDefault();

        $this->assertEquals($server1->id, $result->id);
    }

    public function test_find_default_returns_first_active_when_no_config(): void
    {
        config(['proxmox.default_server_id' => null]);

        $server1 = ProxmoxServer::factory()->create(['is_active' => true, 'created_at' => now()]);
        $server2 = ProxmoxServer::factory()->create(['is_active' => true, 'created_at' => now()->addSecond()]);

        $result = $this->repository->findDefault();

        $this->assertEquals($server1->id, $result->id);
    }

    public function test_find_default_returns_null_when_no_active_servers(): void
    {
        config(['proxmox.default_server_id' => null]);
        ProxmoxServer::factory()->create(['is_active' => false]);

        $result = $this->repository->findDefault();

        $this->assertNull($result);
    }

    public function test_find_active_with_node_stats(): void
    {
        $server1 = ProxmoxServer::factory()->create(['is_active' => true, 'name' => 'server-1']);
        $server2 = ProxmoxServer::factory()->create(['is_active' => true, 'name' => 'server-2']);
        ProxmoxServer::factory()->create(['is_active' => false]);

        ProxmoxNode::factory()->count(3)->create([
            'proxmox_server_id' => $server1->id,
            'status' => 'online',
        ]);
        ProxmoxNode::factory()->count(2)->create([
            'proxmox_server_id' => $server1->id,
            'status' => 'offline',
        ]);
        ProxmoxNode::factory()->count(1)->create([
            'proxmox_server_id' => $server2->id,
            'status' => 'online',
        ]);

        $results = $this->repository->findActiveWithNodeStats();

        $this->assertCount(2, $results);

        $result1 = $results->firstWhere('id', $server1->id);
        $this->assertEquals(3, $result1->online_node_count);

        $result2 = $results->firstWhere('id', $server2->id);
        $this->assertEquals(1, $result2->online_node_count);
    }
}
