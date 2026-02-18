<?php

namespace Tests\Unit;

use App\Exceptions\ProxmoxApiException;
use App\Models\ProxmoxNode;
use App\Services\ProxmoxLoadBalancer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProxmoxLoadBalancerTest extends TestCase
{
    use RefreshDatabase;

    protected ProxmoxLoadBalancer $loadBalancer;

    protected function setUp(): void
    {
        parent::setUp();

        // Create a mock ProxmoxClient
        $proxmoxClientMock = $this->createMock(\App\Services\ProxmoxClient::class);

        // Create the load balancer with the mock
        $this->loadBalancer = new ProxmoxLoadBalancer($proxmoxClientMock);

        // Bind the mock to the service container
        $this->app->bind(\App\Services\ProxmoxClient::class, function () use ($proxmoxClientMock) {
            return $proxmoxClientMock;
        });
    }

    /**
     * Test that selectNode picks the least-loaded node.
     */
    public function test_select_node_picks_least_loaded_node(): void
    {
        // Create test nodes
        $node1 = ProxmoxNode::factory()->create(['name' => 'node-1']);
        $node2 = ProxmoxNode::factory()->create(['name' => 'node-2']);
        $node3 = ProxmoxNode::factory()->create(['name' => 'node-3']);

        // Mock the ProxmoxClient to return different loads for each node
        $proxmoxClientMock = $this->createMock(\App\Services\ProxmoxClient::class);
        $proxmoxClientMock->method('getNodeStatus')
            ->willReturnMap([
                ['node-1', ['mem' => 60000000000, 'maxmem' => 64000000000, 'cpu' => 0.8, 'maxcpu' => 16]],
                ['node-2', ['mem' => 20000000000, 'maxmem' => 64000000000, 'cpu' => 0.2, 'maxcpu' => 16]],
                ['node-3', ['mem' => 40000000000, 'maxmem' => 64000000000, 'cpu' => 0.5, 'maxcpu' => 16]],
            ]);

        $loadBalancer = new ProxmoxLoadBalancer($proxmoxClientMock);

        $selected = $loadBalancer->selectNode();

        // node-2 should be selected (lowest load)
        $this->assertEquals('node-2', $selected->name);
    }

    /**
     * Test that selectNode throws when all nodes are overloaded.
     */
    public function test_select_node_throws_when_all_nodes_overloaded(): void
    {
        // Create test nodes
        $node1 = ProxmoxNode::factory()->create(['name' => 'node-1']);
        $node2 = ProxmoxNode::factory()->create(['name' => 'node-2']);

        // Mock the ProxmoxClient to return high loads (> 85%)
        $proxmoxClientMock = $this->createMock(\App\Services\ProxmoxClient::class);
        $proxmoxClientMock->method('getNodeStatus')
            ->willReturnMap([
                ['node-1', ['mem' => 63000000000, 'maxmem' => 64000000000, 'cpu' => 15, 'maxcpu' => 16]],
                ['node-2', ['mem' => 62000000000, 'maxmem' => 64000000000, 'cpu' => 14, 'maxcpu' => 16]],
            ]);

        $loadBalancer = new ProxmoxLoadBalancer($proxmoxClientMock);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('above');

        $loadBalancer->selectNode();
    }

    /**
     * Test that getNodeLoad calculates correct score.
     */
    public function test_get_node_load_calculates_correct_score(): void
    {
        $node = ProxmoxNode::factory()->create(['name' => 'test-node']);

        $proxmoxClientMock = $this->createMock(\App\Services\ProxmoxClient::class);
        $proxmoxClientMock->method('getNodeStatus')
            ->with('test-node')
            ->willReturn([
                'mem' => 32000000000, // 50% of 64GB
                'maxmem' => 64000000000,
                'cpu' => 8, // 50% of 16
                'maxcpu' => 16,
            ]);

        $loadBalancer = new ProxmoxLoadBalancer($proxmoxClientMock);

        $score = $loadBalancer->getNodeLoad($node);

        // Score should be: (0.7 * 0.5) + (0.3 * 0.5) = 0.35 + 0.15 = 0.5
        $this->assertEquals(0.5, $score);
    }

    /**
     * Test that selectNode throws when no nodes are available.
     */
    public function test_select_node_throws_when_no_nodes_available(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('No online');

        $this->loadBalancer->selectNode();
    }
}
