<?php

namespace Tests\Unit\Repositories;

use App\Models\GatewayNode;
use App\Repositories\GatewayNodeRepository;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class GatewayNodeRepositoryTest extends TestCase
{
    private GatewayNodeRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();

        Cache::flush();
        $this->repository = new GatewayNodeRepository;
    }

    public function test_has_gateway_for_video_processing_requires_pct_metadata(): void
    {
        GatewayNode::factory()->online()->verified()->create([
            'proxmox_host' => null,
            'proxmox_node' => null,
            'proxmox_vmid' => null,
        ]);

        $this->assertFalse($this->repository->hasGatewayForVideoProcessing());

        GatewayNode::factory()->online()->verified()->forVideoProcessing(
            host: '192.168.50.3',
            node: 'local-node-1',
            vmid: 102,
        )->create();

        $this->assertTrue($this->repository->hasGatewayForVideoProcessing());
    }

    public function test_find_preferred_for_video_processing_round_robins_across_db_gateways(): void
    {
        $first = GatewayNode::factory()->online()->verified()->forVideoProcessing(
            host: '192.168.50.3',
            node: 'local-node-1',
            vmid: 102,
        )->create(['name' => 'gateway-a']);

        $second = GatewayNode::factory()->online()->verified()->forVideoProcessing(
            host: '192.168.50.4',
            node: 'local-node-2',
            vmid: 103,
        )->create(['name' => 'gateway-b']);

        $pickOne = $this->repository->findPreferredForVideoProcessing();
        $pickTwo = $this->repository->findPreferredForVideoProcessing();
        $pickThree = $this->repository->findPreferredForVideoProcessing();

        $this->assertNotNull($pickOne);
        $this->assertNotNull($pickTwo);
        $this->assertNotNull($pickThree);
        $this->assertSame($first->id, $pickOne->id);
        $this->assertSame($second->id, $pickTwo->id);
        $this->assertSame($first->id, $pickThree->id);
    }
}
