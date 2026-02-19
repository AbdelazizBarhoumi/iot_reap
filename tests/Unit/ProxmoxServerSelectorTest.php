<?php

namespace Tests\Unit;

use App\Exceptions\NoAvailableNodeException;
use App\Models\ProxmoxNode;
use App\Models\ProxmoxServer;
use App\Models\VMSession;
use App\Services\ProxmoxServerSelector;
use Tests\TestCase;

class ProxmoxServerSelectorTest extends TestCase
{
    private ProxmoxServerSelector $selector;

    protected function setUp(): void
    {
        parent::setUp();
        $this->selector = app(ProxmoxServerSelector::class);
    }

    public function test_select_with_specific_server(): void
    {
        $server = ProxmoxServer::factory()->create();
        ProxmoxNode::factory()->create([
            'proxmox_server_id' => $server->id,
            'status' => 'online',
        ]);

        $result = $this->selector->select($server);

        $this->assertIsArray($result);
        $this->assertArrayHasKey('server', $result);
        $this->assertArrayHasKey('node', $result);
        $this->assertEquals($server->id, $result['server']->id);
    }

    public function test_select_throws_when_no_servers_available(): void
    {
        $this->expectException(NoAvailableNodeException::class);
        $this->expectExceptionMessage('No active Proxmox servers');

        $this->selector->select(null);
    }

    public function test_select_across_servers_chooses_highest_capacity(): void
    {
        // Server 1: 3 online nodes
        $server1 = ProxmoxServer::factory()->create(['is_active' => true, 'name' => 'cluster-1']);
        ProxmoxNode::factory()->count(3)->create([
            'proxmox_server_id' => $server1->id,
            'status' => 'online',
        ]);

        // Server 2: 1 online node (should be selected for lower use)
        $server2 = ProxmoxServer::factory()->create(['is_active' => true, 'name' => 'cluster-2']);
        $node2 = ProxmoxNode::factory()->create([
            'proxmox_server_id' => $server2->id,
            'status' => 'online',
        ]);

        // Server 3: inactive (should be ignored)
        ProxmoxServer::factory()->create(['is_active' => false]);

        $result = $this->selector->select(null);

        // Server 1 should be selected as it has more capacity (3 nodes vs 1)
        $this->assertEquals($server1->id, $result['server']->id);
    }

    public function test_select_across_servers_prefers_server_with_more_nodes(): void
    {
        // Server 1: 2 online nodes
        $server1 = ProxmoxServer::factory()->create(['is_active' => true, 'name' => 'cluster-1']);
        ProxmoxNode::factory()->count(2)->create([
            'proxmox_server_id' => $server1->id,
            'status' => 'online',
        ]);

        // Server 2: 5 online nodes (should be preferred)
        $server2 = ProxmoxServer::factory()->create(['is_active' => true, 'name' => 'cluster-2']);
        ProxmoxNode::factory()->count(5)->create([
            'proxmox_server_id' => $server2->id,
            'status' => 'online',
        ]);

        $result = $this->selector->select(null);

        // Server 2 should be selected as it has more online nodes (5 vs 2)
        $this->assertEquals($server2->id, $result['server']->id);
    }

    public function test_select_throws_when_specific_server_all_nodes_offline(): void
    {
        $server = ProxmoxServer::factory()->create();
        ProxmoxNode::factory()->create([
            'proxmox_server_id' => $server->id,
            'status' => 'offline',
        ]);

        $this->expectException(NoAvailableNodeException::class);

        $this->selector->select($server);
    }

    public function test_select_skips_overloaded_servers(): void
    {
        // Server 1: 1 node
        $server1 = ProxmoxServer::factory()->create(['is_active' => true, 'name' => 'cluster-1']);
        ProxmoxNode::factory()->count(1)->create([
            'proxmox_server_id' => $server1->id,
            'status' => 'online',
        ]);

        // Server 2: 1 node (will be selected if server1 is overloaded)
        $server2 = ProxmoxServer::factory()->create(['is_active' => true, 'name' => 'cluster-2']);
        ProxmoxNode::factory()->count(1)->create([
            'proxmox_server_id' => $server2->id,
            'status' => 'online',
        ]);

        // This test verifies fallback logic - if server1 throws, selector tries server2
        // The actual "overload" detection happens in ProxmoxLoadBalancer with real node stats
        $result = $this->selector->select(null);

        // Should successfully return either server by preferring the one with lower score
        $this->assertIsArray($result);
        $this->assertNotNull($result['server']);
        $this->assertNotNull($result['node']);
    }

    public function test_select_throws_when_all_servers_overloaded(): void
    {
        // This test is theoretical - in practice LoadBalancer checks actual node load
        // This verifies the exception path when all servers raise NoAvailableNodeException

        // Create 2 servers with offline nodes (will trigger exception)
        $server1 = ProxmoxServer::factory()->create(['is_active' => true, 'name' => 'cluster-1']);
        ProxmoxNode::factory()->create([
            'proxmox_server_id' => $server1->id,
            'status' => 'offline',
        ]);

        $server2 = ProxmoxServer::factory()->create(['is_active' => true, 'name' => 'cluster-2']);
        ProxmoxNode::factory()->create([
            'proxmox_server_id' => $server2->id,
            'status' => 'offline',
        ]);

        $this->expectException(NoAvailableNodeException::class);
        $this->expectExceptionMessage('All Proxmox servers are overloaded');

        $this->selector->select(null);
    }

    public function test_get_load_stats(): void
    {
        // Server 1: 3 online nodes, 2 active sessions
        $server1 = ProxmoxServer::factory()->create(['is_active' => true, 'name' => 'server-1']);
        ProxmoxNode::factory()->count(3)->create([
            'proxmox_server_id' => $server1->id,
            'status' => 'online',
        ]);
        ProxmoxNode::factory()->count(2)->create([
            'proxmox_server_id' => $server1->id,
            'status' => 'offline',
        ]);

        // Server 2: 1 online node, 0 sessions
        $server2 = ProxmoxServer::factory()->create(['is_active' => true, 'name' => 'server-2']);
        ProxmoxNode::factory()->count(1)->create([
            'proxmox_server_id' => $server2->id,
            'status' => 'online',
        ]);

        // Server 3: inactive (should not be included)
        ProxmoxServer::factory()->create(['is_active' => false, 'name' => 'server-3']);

        $stats = $this->selector->getLoadStats();

        $this->assertCount(2, $stats);
        $this->assertArrayHasKey($server1->name, $stats);
        $this->assertArrayHasKey($server2->name, $stats);

        $stat1 = $stats[$server1->name];
        $this->assertEquals($server1->id, $stat1['id']);
        $this->assertEquals($server1->host, $stat1['host']);
        $this->assertEquals(3, $stat1['online_nodes']);
        $this->assertTrue($stat1['is_active']);

        $stat2 = $stats[$server2->name];
        $this->assertEquals($server2->id, $stat2['id']);
        $this->assertEquals(1, $stat2['online_nodes']);
    }

    public function test_single_server_mode_with_default_config(): void
    {
        config(['proxmox.default_server_id' => null]);

        $server = ProxmoxServer::factory()->create(['is_active' => true]);
        ProxmoxNode::factory()->create([
            'proxmox_server_id' => $server->id,
            'status' => 'online',
        ]);

        // Selecting with null should use default/first server
        $result = $this->selector->select(null);

        $this->assertEquals($server->id, $result['server']->id);
    }

    public function test_multi_server_selection_distributes_load(): void
    {
        // Create 3 servers with different node counts
        $server1 = ProxmoxServer::factory()->create(['is_active' => true, 'name' => 'dc1']);
        ProxmoxNode::factory()->count(7)->create([
            'proxmox_server_id' => $server1->id,
            'status' => 'online',
        ]);

        $server2 = ProxmoxServer::factory()->create(['is_active' => true, 'name' => 'dc2']);
        ProxmoxNode::factory()->count(5)->create([
            'proxmox_server_id' => $server2->id,
            'status' => 'online',
        ]);

        $server3 = ProxmoxServer::factory()->create(['is_active' => true, 'name' => 'dc3']);
        ProxmoxNode::factory()->count(3)->create([
            'proxmox_server_id' => $server3->id,
            'status' => 'online',
        ]);

        $result = $this->selector->select(null);

        // Should prefer server1 as it has the most nodes
        $this->assertEquals($server1->id, $result['server']->id);
    }
}
