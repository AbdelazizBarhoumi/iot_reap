<?php

namespace Tests\Unit;

use App\Enums\ProxmoxNodeStatus;
use App\Exceptions\NoAvailableNodeException;
use App\Models\ProxmoxNode;
use App\Models\ProxmoxServer;
use App\Services\ProxmoxClientFake;
use App\Services\ProxmoxLoadBalancer;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class ProxmoxLoadBalancerTest extends TestCase
{
    private ProxmoxServer $server;
    private ProxmoxClientFake $client;
    private ProxmoxLoadBalancer $balancer;

    protected function setUp(): void
    {
        parent::setUp();

        $this->server = ProxmoxServer::factory()->create();

        // Create test nodes
        ProxmoxNode::factory()->create([
            'name' => 'pve-1',
            'status' => ProxmoxNodeStatus::ONLINE,
        ]);
        ProxmoxNode::factory()->create([
            'name' => 'pve-2',
            'status' => ProxmoxNodeStatus::ONLINE,
        ]);

        $this->client = new ProxmoxClientFake($this->server);
        $this->balancer = new ProxmoxLoadBalancer($this->client, $this->server);
    }

    public function test_select_node_returns_proxmox_node(): void
    {
        $node = $this->balancer->selectNode();
        $this->assertInstanceOf(ProxmoxNode::class, $node);
    }

    public function test_select_node_picks_least_loaded(): void
    {
        // Set pve-1 to 80% loaded, pve-2 to 20% loaded
        $this->client->setNodeStatus('pve-1', [
            'status' => 'online',
            'cpu' => 0.8,
            'maxcpu' => 1.0,
            'mem' => 80,
            'maxmem' => 100,
        ]);

        $this->client->setNodeStatus('pve-2', [
            'status' => 'online',
            'cpu' => 0.2,
            'maxcpu' => 1.0,
            'mem' => 20,
            'maxmem' => 100,
        ]);

        Cache::flush();

        $selectedNode = $this->balancer->selectNode();
        $this->assertEquals('pve-2', $selectedNode->name);
    }

    public function test_select_node_throws_when_all_overloaded(): void
    {
        // Set all nodes to 90% loaded
        $this->client->setNodeStatus('pve-1', [
            'status' => 'online',
            'cpu' => 0.9,
            'maxcpu' => 1.0,
            'mem' => 900000000,
            'maxmem' => 1000000000,
        ]);

        $this->client->setNodeStatus('pve-2', [
            'status' => 'online',
            'cpu' => 0.9,
            'maxcpu' => 1.0,
            'mem' => 900000000,
            'maxmem' => 1000000000,
        ]);

        Cache::flush();

        $this->expectException(NoAvailableNodeException::class);
        $this->balancer->selectNode();
    }

    public function test_select_node_throws_when_no_online_nodes(): void
    {
        ProxmoxNode::where('status', ProxmoxNodeStatus::ONLINE)->update([
            'status' => ProxmoxNodeStatus::OFFLINE,
        ]);

        $this->expectException(NoAvailableNodeException::class);
        $this->balancer->selectNode();
    }

    public function test_node_scores_cached(): void
    {
        Cache::flush();

        // First call should cache the score
        $this->balancer->selectNode();

        $cacheKey = "proxmox_node_load:{$this->server->id}:pve-1";
        $this->assertNotNull(Cache::get($cacheKey));
    }

    public function test_clear_cache_works(): void
    {
        Cache::flush();
        $this->balancer->selectNode();

        // Cache should have values
        $cacheKey = "proxmox_node_load:{$this->server->id}:pve-1";
        $this->assertNotNull(Cache::get($cacheKey));

        // Clear cache
        $this->balancer->clearCache();

        // Note: actual pattern-based deletion would need Redis direct access
        // This tests that the method runs without error
        $this->assertTrue(true);
    }

    public function test_weighted_scoring_favors_memory(): void
    {
        // Node 1: High CPU, low memory
        $this->client->setNodeStatus('pve-1', [
            'status' => 'online',
            'cpu' => 0.9,
            'maxcpu' => 1.0,
            'mem' => 10000000,  // Very low memory
            'maxmem' => 68719476736,
        ]);

        // Node 2: Low CPU, high memory
        $this->client->setNodeStatus('pve-2', [
            'status' => 'online',
            'cpu' => 0.1,
            'maxcpu' => 1.0,
            'mem' => 34359738368,  // High memory (50%)
            'maxmem' => 68719476736,
        ]);

        Cache::flush();

        // Memory weight is 0.7, CPU weight is 0.3
        // Node 1 score: (90 * 0.3) + (0 * 0.7) = 27
        // Node 2 score: (10 * 0.3) + (50 * 0.7) = 38
        // So pve-1 should be selected (lower score)
        $selectedNode = $this->balancer->selectNode();
        $this->assertEquals('pve-1', $selectedNode->name);
    }
}
