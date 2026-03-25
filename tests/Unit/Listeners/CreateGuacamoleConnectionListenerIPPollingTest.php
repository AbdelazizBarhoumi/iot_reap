<?php

namespace Tests\Unit\Listeners;

use App\Enums\VMSessionProtocol;
use App\Enums\VMSessionStatus;
use App\Events\VMSessionActivated;
use App\Listeners\CreateGuacamoleConnectionListener;
use App\Models\ProxmoxNode;
use App\Models\User;
use App\Models\VMSession;
use App\Services\GuacamoleClientFake;
use App\Services\GuacamoleClientInterface;
use App\Services\ProxmoxClientFake;
use App\Services\ProxmoxClientInterface;
use Tests\TestCase;

/**
 * Listener tests focusing on IP polling; template support has already been removed.
 */
class CreateGuacamoleConnectionListenerIPPollingTest extends TestCase
{
    protected GuacamoleClientFake $guacamoleClient;

    protected ProxmoxClientFake $proxmoxClient;

    protected ProxmoxNode $node;

    protected function setUp(): void
    {
        parent::setUp();

        $this->proxmoxClient = new ProxmoxClientFake;
        $this->app->singleton(ProxmoxClientInterface::class, fn () => $this->proxmoxClient);

        $this->guacamoleClient = new GuacamoleClientFake;
        $this->app->singleton(GuacamoleClientInterface::class, fn () => $this->guacamoleClient);

        $this->node = ProxmoxNode::factory()->create(['name' => 'pve-1']);
    }

    public function test_full_flow_resolves_ip_and_creates_connection(): void
    {
        $vmId = 501;
        $user = User::factory()->engineer()->create();

        $this->proxmoxClient->registerVM('pve-1', $vmId, 'stopped');

        $session = VMSession::factory()
            ->for($user)
            ->create([
                'node_id' => $this->node->id,
                'vm_id' => $vmId,
                'status' => VMSessionStatus::PENDING,
                'ip_address' => null,
                'guacamole_connection_id' => null,
                'protocol' => VMSessionProtocol::RDP->value,
            ]);

        $listener = app(CreateGuacamoleConnectionListener::class);
        $listener->handle(new VMSessionActivated($session));

        $session->refresh();
        $this->assertEquals(VMSessionStatus::ACTIVE, $session->status);
        $this->assertNotNull($session->ip_address);
        $this->assertNotNull($session->guacamole_connection_id);
    }

    public function test_listener_handles_different_protocols(): void
    {
        $protocols = ['rdp', 'vnc', 'ssh'];
        foreach ($protocols as $protocol) {
            $vmId = rand(600, 700);
            $user = User::factory()->engineer()->create();
            $this->proxmoxClient->registerVM('pve-1', $vmId, 'running', "10.0.0.$vmId");

            $session = VMSession::factory()
                ->for($user)
                ->create([
                    'node_id' => $this->node->id,
                    'vm_id' => $vmId,
                    'status' => VMSessionStatus::PENDING,
                    'ip_address' => null,
                    'protocol' => $protocol,
                ]);

            $listener = app(CreateGuacamoleConnectionListener::class);
            $listener->handle(new VMSessionActivated($session));

            $session->refresh();
            $this->assertEquals(VMSessionStatus::ACTIVE, $session->status);
            $this->assertNotNull($session->ip_address);
            $connections = $this->guacamoleClient->getAllConnections();
            $conn = reset($connections);
            $this->assertEquals($protocol, $conn['protocol']);
            $this->guacamoleClient->resetAll();
        }
    }
}
