<?php

namespace Tests\Unit;

use App\Exceptions\ProxmoxApiException;
use App\Models\ProxmoxServer;
use App\Services\ProxmoxClient;
use App\Services\ProxmoxClientFake;
use Tests\TestCase;

class ProxmoxClientTest extends TestCase
{
    private ProxmoxServer $server;
    private ProxmoxClientFake $client;

    protected function setUp(): void
    {
        parent::setUp();

        $this->server = ProxmoxServer::factory()->create();
        $this->client = new ProxmoxClientFake($this->server);
    }

    public function test_can_instantiate_with_proxmox_server(): void
    {
        $client = new ProxmoxClientFake($this->server);
        $this->assertNotNull($client);
    }

    public function test_get_nodes_returns_array(): void
    {
        $nodes = $this->client->getNodes();
        $this->assertIsArray($nodes);
        $this->assertContains('pve-1', $nodes);
        $this->assertContains('pve-2', $nodes);
    }

    public function test_get_node_status_returns_data(): void
    {
        $status = $this->client->getNodeStatus('pve-1');
        $this->assertIsArray($status);
        $this->assertArrayHasKey('status', $status);
        $this->assertEquals('online', $status['status']);
    }

    public function test_clone_template_returns_vmid(): void
    {
        $newVmid = $this->client->cloneTemplate(
            templateVmid: 100,
            nodeName: 'pve-1'
        );

        $this->assertIsInt($newVmid);
        $this->assertGreaterThanOrEqual(200, $newVmid);
    }

    public function test_start_vm_updates_status(): void
    {
        $vmid = $this->client->cloneTemplate(100, 'pve-1');
        $result = $this->client->startVM('pve-1', $vmid);

        $this->assertTrue($result);

        $status = $this->client->getVMStatus('pve-1', $vmid);
        $this->assertEquals('running', $status['status']);
    }

    public function test_stop_vm_updates_status(): void
    {
        $vmid = $this->client->cloneTemplate(100, 'pve-1');
        $this->client->startVM('pve-1', $vmid);
        $result = $this->client->stopVM('pve-1', $vmid);

        $this->assertTrue($result);

        $status = $this->client->getVMStatus('pve-1', $vmid);
        $this->assertEquals('stopped', $status['status']);
    }

    public function test_delete_vm_removes_vm(): void
    {
        $vmid = $this->client->cloneTemplate(100, 'pve-1');
        $result = $this->client->deleteVM('pve-1', $vmid);

        $this->assertTrue($result);

        $createdVMs = $this->client->getCreatedVMs();
        $this->assertEmpty($createdVMs['pve-1'] ?? []);
    }

    public function test_fake_client_can_set_next_vmid(): void
    {
        $this->client->setNextVmid('pve-1', 500);
        $vmid = $this->client->cloneTemplate(100, 'pve-1');

        $this->assertEquals(500, $vmid);
    }

    public function test_fake_client_can_retrieve_created_vms(): void
    {
        $vmid1 = $this->client->cloneTemplate(100, 'pve-1');
        $vmid2 = $this->client->cloneTemplate(100, 'pve-1');

        $createdVMs = $this->client->getCreatedVMs();

        $this->assertCount(2, $createdVMs['pve-1']);
        $this->assertContains($vmid1, array_column($createdVMs['pve-1'], 'vmid'));
        $this->assertContains($vmid2, array_column($createdVMs['pve-1'], 'vmid'));
    }

    public function test_fake_client_reset_clears_data(): void
    {
        $this->client->cloneTemplate(100, 'pve-1');
        $this->client->reset();

        $createdVMs = $this->client->getCreatedVMs();
        $this->assertEmpty($createdVMs['pve-1'] ?? []);
    }
}
