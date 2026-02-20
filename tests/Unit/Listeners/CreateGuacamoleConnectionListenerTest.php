<?php

namespace Tests\Unit\Listeners;

use App\Enums\VMSessionStatus;
use App\Events\VMSessionActivated;
use App\Listeners\CreateGuacamoleConnectionListener;
use App\Models\User;
use App\Models\VMSession;
use App\Models\VMTemplate;
use App\Models\ProxmoxNode;
use App\Services\GuacamoleClientFake;
use App\Services\GuacamoleClientInterface;
use App\Services\ProxmoxClientFake;
use App\Services\ProxmoxClientInterface;
use Tests\TestCase;

/**
 * Unit tests for CreateGuacamoleConnectionListener.
 *
 * Tests cover the full activation flow:
 *  - Stopped VM → startVM() called → IP resolved → Guacamole connection created
 *  - Running VM → startVM() skipped → IP resolved → Guacamole connection created
 *  - Existing connection_id → listener returns early (no duplicate)
 *  - Guacamole API failure → session marked as 'failed'
 */
class CreateGuacamoleConnectionListenerTest extends TestCase
{
    protected GuacamoleClientFake $guacamoleClient;
    protected ProxmoxClientFake $proxmoxClient;
    /** @var ProxmoxNode node with name matching what the fake expects */
    protected ProxmoxNode $node;

    protected function setUp(): void
    {
        parent::setUp();

        // Bind fakes in container so listener resolved via app() gets them
        $this->proxmoxClient = new ProxmoxClientFake();
        $this->app->singleton(ProxmoxClientInterface::class, fn () => $this->proxmoxClient);

        $this->guacamoleClient = new GuacamoleClientFake();
        $this->app->singleton(GuacamoleClientInterface::class, fn () => $this->guacamoleClient);

        // Create a node whose name matches a node the fake knows about ('pve-1')
        $this->node = ProxmoxNode::factory()->create(['name' => 'pve-1']);
    }

    protected function tearDown(): void
    {
        $this->guacamoleClient->resetAll();
        parent::tearDown();
    }

    // ─── VM stopped → startVM called → connection created ────────────────────

    public function test_stopped_vm_is_started_then_connection_created(): void
    {
        $vmId    = 201;
        $user    = User::factory()->engineer()->create();
        $template = VMTemplate::factory()->windows()->create();

        // Register the VM on the fake in 'stopped' state
        $this->proxmoxClient->registerVM('pve-1', $vmId, 'stopped');

        $session = VMSession::factory()
            ->for($user)
            ->create([
                'template_id'            => $template->id,
                'node_id'                => $this->node->id,
                'vm_id'                  => $vmId,
                'status'                 => VMSessionStatus::PENDING,
                'ip_address'             => null,
                'guacamole_connection_id' => null,
            ]);

        $event    = new VMSessionActivated($session);
        $listener = app(CreateGuacamoleConnectionListener::class);
        $listener->handle($event);

        $session->refresh();

        // Session should be active with a connection ID
        $this->assertEquals(VMSessionStatus::ACTIVE, $session->status);
        $this->assertNotNull($session->guacamole_connection_id);

        // The VM's IP should have been resolved and persisted
        $this->assertNotNull($session->ip_address);
        $this->assertMatchesRegularExpression('/^\d+\.\d+\.\d+\.\d+$/', $session->ip_address);

        // Guacamole should have a connection for this VM's protocol
        $connections = $this->guacamoleClient->getAllConnections();
        $this->assertCount(1, $connections);
        $connection = reset($connections);
        $this->assertEquals('rdp', $connection['protocol']);
        $this->assertEquals($session->ip_address, $connection['parameters']['hostname']);
    }

    // ─── VM already running → startVM skipped → connection created ───────────

    public function test_already_running_vm_skips_start_and_creates_connection(): void
    {
        $vmId = 202;
        $user = User::factory()->engineer()->create();
        $template = VMTemplate::factory()->windows()->create();

        // Register the VM already in 'running' state with an IP
        $this->proxmoxClient->registerVM('pve-1', $vmId, 'running', '10.10.10.202');

        $session = VMSession::factory()
            ->for($user)
            ->create([
                'template_id'            => $template->id,
                'node_id'                => $this->node->id,
                'vm_id'                  => $vmId,
                'status'                 => VMSessionStatus::PENDING,
                'ip_address'             => null,
                'guacamole_connection_id' => null,
            ]);

        $event    = new VMSessionActivated($session);
        $listener = app(CreateGuacamoleConnectionListener::class);
        $listener->handle($event);

        $session->refresh();

        $this->assertEquals(VMSessionStatus::ACTIVE, $session->status);
        $this->assertEquals('10.10.10.202', $session->ip_address);
        $this->assertCount(1, $this->guacamoleClient->getAllConnections());
    }

    // ─── Existing connection → no duplicate created ───────────────────────────

    public function test_listener_skips_when_guacamole_connection_already_exists(): void
    {
        $vmId = 203;
        $user = User::factory()->engineer()->create();
        $template = VMTemplate::factory()->windows()->create();
        $this->proxmoxClient->registerVM('pve-1', $vmId, 'running', '10.0.0.1');

        // Session already has a connection from a previous attempt
        $session = VMSession::factory()
            ->for($user)
            ->create([
                'template_id'            => $template->id,
                'node_id'                => $this->node->id,
                'vm_id'                  => $vmId,
                'status'                 => VMSessionStatus::ACTIVE,
                'guacamole_connection_id' => 9999, // already set
                'ip_address'             => '10.0.0.1',
            ]);

        $event    = new VMSessionActivated($session);
        $listener = app(CreateGuacamoleConnectionListener::class);
        $listener->handle($event);

        // No new connections should be created
        $this->assertCount(0, $this->guacamoleClient->getAllConnections());
    }

    // ─── Guacamole API failure → session marked failed ────────────────────────

    public function test_guacamole_failure_marks_session_as_failed(): void
    {
        $vmId = 204;
        $user = User::factory()->engineer()->create();
        $template = VMTemplate::factory()->windows()->create();

        $this->proxmoxClient->registerVM('pve-1', $vmId, 'running', '10.0.0.2');
        $this->guacamoleClient->setFailCreateConnection(true);

        $session = VMSession::factory()
            ->for($user)
            ->create([
                'template_id'            => $template->id,
                'node_id'                => $this->node->id,
                'vm_id'                  => $vmId,
                'status'                 => VMSessionStatus::PENDING,
                'ip_address'             => null,
                'guacamole_connection_id' => null,
            ]);

        $event    = new VMSessionActivated($session);
        $listener = app(CreateGuacamoleConnectionListener::class);
        $listener->handle($event);

        $session->refresh();

        $this->assertEquals(VMSessionStatus::FAILED, $session->status);
        $this->assertNull($session->guacamole_connection_id);
    }

    // ─── Correct protocol used ────────────────────────────────────────────────

    public function test_listener_uses_correct_protocol_and_ip_for_rdp(): void
    {
        $vmId = 205;
        $user = User::factory()->engineer()->create();
        $template = VMTemplate::factory()->windows()->create();
        $this->proxmoxClient->registerVM('pve-1', $vmId, 'running', '10.0.0.50');

        $session = VMSession::factory()
            ->for($user)
            ->create([
                'template_id' => $template->id,
                'node_id'     => $this->node->id,
                'vm_id'       => $vmId,
                'status'      => VMSessionStatus::PENDING,
                'ip_address'  => null,
            ]);

        $listener = app(CreateGuacamoleConnectionListener::class);
        $listener->handle(new VMSessionActivated($session));

        $connections = $this->guacamoleClient->getAllConnections();
        $connection  = reset($connections);

        $this->assertEquals('rdp', $connection['protocol']);
        $this->assertEquals('10.0.0.50', $connection['parameters']['hostname']);
        $this->assertEquals('3389', $connection['parameters']['port']);
    }
}
