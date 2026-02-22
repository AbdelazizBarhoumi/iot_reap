<?php

namespace Tests\Unit\Listeners;

use App\Enums\VMSessionStatus;
use App\Events\VMSessionActivated;
use App\Exceptions\ProxmoxApiException;
use App\Listeners\CreateGuacamoleConnectionListener;
use App\Models\User;
use App\Models\VMSession;
use App\Models\VMTemplate;
use App\Models\ProxmoxNode;
use App\Services\GuacamoleClientFake;
use App\Services\GuacamoleClientInterface;
use App\Services\ProxmoxClientFake;
use App\Services\ProxmoxClientInterface;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

/**
 * Integration tests for CreateGuacamoleConnectionListener with IP resolution polls.
 *
 * Tests the full flow of VM state transitions, IP polling, and connection creation,
 * with focus on edge cases and failure modes.
 */
class CreateGuacamoleConnectionListenerIPPollingTest extends TestCase
{
    protected GuacamoleClientFake $guacamoleClient;
    protected ProxmoxClientFake $proxmoxClient;
    protected ProxmoxNode $node;

    protected function setUp(): void
    {
        parent::setUp();

        $this->proxmoxClient = new ProxmoxClientFake();
        $this->app->singleton(ProxmoxClientInterface::class, fn () => $this->proxmoxClient);

        $this->guacamoleClient = new GuacamoleClientFake();
        $this->app->singleton(GuacamoleClientInterface::class, fn () => $this->guacamoleClient);

        $this->node = ProxmoxNode::factory()->create(['name' => 'pve-1']);
    }

    protected function tearDown(): void
    {
        $this->guacamoleClient->resetAll();
        parent::tearDown();
    }

    /**
     * Full happy path: stopped VM → started → IP resolved → connection created.
     * Verifies that listener handles the entire provisioning saga.
     */
    public function test_full_provision_flow_from_stopped_to_active(): void
    {
        $vmId = 401;
        $user = User::factory()->engineer()->create();
        $template = VMTemplate::factory()->windows()->create();

        // Register VM as stopped
        $this->proxmoxClient->registerVM('pve-1', $vmId, 'stopped');

        $session = VMSession::factory()
            ->for($user)
            ->create([
                'template_id'             => $template->id,
                'node_id'                 => $this->node->id,
                'vm_id'                   => $vmId,
                'status'                  => VMSessionStatus::PENDING,
                'ip_address'              => null,
                'guacamole_connection_id' => null,
            ]);

        // Listener should:
        // 1. Detect VM is stopped
        // 2. Call startVM()
        // 3. Poll for IP
        // 4. Store IP in session
        // 5. Create Guacamole connection
        // 6. Mark session as ACTIVE
        
        $event    = new VMSessionActivated($session);
        $listener = app(CreateGuacamoleConnectionListener::class);
        $listener->handle($event);

        $session->refresh();

        // After listener execution, session should be fully provisioned
        $this->assertEquals(VMSessionStatus::ACTIVE, $session->status);
        $this->assertNotNull($session->ip_address);
        $this->assertNotNull($session->guacamole_connection_id);
        
        // IP should be valid
        $this->assertMatchesRegularExpression('/^\d+\.\d+\.\d+\.\d+$/', $session->ip_address);
        
        // Guacamole connection should exist with correct hostname
        $connections = $this->guacamoleClient->getAllConnections();
        $this->assertCount(1, $connections);
        $connection = reset($connections);
        $this->assertEquals($session->ip_address, $connection['parameters']['hostname']);
    }

    /**
     * VM already running with IP assigned — listener should skip startVM() and use existing IP.
     */
    public function test_running_vm_with_ip_skips_start_step(): void
    {
        $vmId = 402;
        $user = User::factory()->engineer()->create();
        $template = VMTemplate::factory()->linux()->create();

        // Register VM as already running with IP
        $this->proxmoxClient->registerVM('pve-1', $vmId, 'running', '10.0.0.50');

        $session = VMSession::factory()
            ->for($user)
            ->create([
                'template_id'             => $template->id,
                'node_id'                 => $this->node->id,
                'vm_id'                   => $vmId,
                'status'                  => VMSessionStatus::PENDING,
                'ip_address'              => null,
                'guacamole_connection_id' => null,
            ]);

        $event    = new VMSessionActivated($session);
        $listener = app(CreateGuacamoleConnectionListener::class);
        $listener->handle($event);

        $session->refresh();

        // Should use the existing IP and create connection
        $this->assertEquals(VMSessionStatus::ACTIVE, $session->status);
        $this->assertEquals('10.0.0.50', $session->ip_address);
        $this->assertNotNull($session->guacamole_connection_id);
    }

    /**
     * VM provisioning - verify listener correctly delegates to IP resolver.
     * The timeout scenarios are comprehensively tested in ProxmoxIPResolverPollingTest.
     * This test verifies the integration points between listener and resolver.
     */
    public function test_listener_delegates_to_ip_resolver_and_persists_result(): void
    {
        $vmId = 403;
        $user = User::factory()->engineer()->create();
        $template = VMTemplate::factory()->windows()->create();

        // Register VM as stopped
        $this->proxmoxClient->registerVM('pve-1', $vmId, 'stopped');

        $session = VMSession::factory()
            ->for($user)
            ->create([
                'template_id'             => $template->id,
                'node_id'                 => $this->node->id,
                'vm_id'                   => $vmId,
                'status'                  => VMSessionStatus::PENDING,
                'ip_address'              => null,
                'guacamole_connection_id' => null,
            ]);

        $event    = new VMSessionActivated($session);
        $listener = app(CreateGuacamoleConnectionListener::class);
        
        // Listener will delegate to ProxmoxIPResolver which will:
        // 1. Start the VM
        // 2. Poll for IP (fake immediately returns one for running VMs)
        // 3. Return the IP
        // Listener then persists it to session.ip_address
        $listener->handle($event);

        $session->refresh();

        // After successful activation:
        $this->assertEquals(VMSessionStatus::ACTIVE, $session->status);
        // IP should be persisted (set by the resolver)
        $this->assertNotNull($session->ip_address);
        $this->assertMatchesRegularExpression('/^\d+\.\d+\.\d+\.\d+$/', $session->ip_address);
        // Guacamole connection should be created with this IP as hostname
        $this->assertNotNull($session->guacamole_connection_id);
    }

    /**
     * VM is missing required fields (vm_id is null) — listener should return early and fail.
     */
    public function test_missing_vm_id_marks_session_failed(): void
    {
        $user = User::factory()->engineer()->create();
        $template = VMTemplate::factory()->windows()->create();

        $session = VMSession::factory()
            ->for($user)
            ->create([
                'template_id'             => $template->id,
                'node_id'                 => $this->node->id,
                'vm_id'                   => null, // Missing!
                'status'                  => VMSessionStatus::PENDING,
                'ip_address'              => null,
                'guacamole_connection_id' => null,
            ]);

        $event    = new VMSessionActivated($session);
        $listener = app(CreateGuacamoleConnectionListener::class);
        $listener->handle($event);

        $session->refresh();

        // Should be marked as failed
        $this->assertEquals(VMSessionStatus::FAILED, $session->status);
    }

    /**
     * Session already has a connection from a retry — listener should skip duplicate creation.
     */
    public function test_prevents_duplicate_connection_creation_on_retry(): void
    {
        $vmId = 405;
        $user = User::factory()->engineer()->create();
        $template = VMTemplate::factory()->windows()->create();

        $this->proxmoxClient->registerVM('pve-1', $vmId, 'running', '192.168.1.77');

        // Session ALREADY has a connection from first attempt
        $existingConnectionId = 'guac-conn-12345';

        $session = VMSession::factory()
            ->for($user)
            ->create([
                'template_id'             => $template->id,
                'node_id'                 => $this->node->id,
                'vm_id'                   => $vmId,
                'status'                  => VMSessionStatus::PENDING,
                'ip_address'              => '192.168.1.77',
                'guacamole_connection_id' => $existingConnectionId, // Already set
            ]);

        // Pre-populate guacamole with a connection so we know it was already created
        $preExistingConnections = count($this->guacamoleClient->getAllConnections());

        $event    = new VMSessionActivated($session);
        $listener = app(CreateGuacamoleConnectionListener::class);
        $listener->handle($event);

        // No NEW connections should be created (listener returns early when connection_id exists)
        $postListener = count($this->guacamoleClient->getAllConnections());
        $this->assertEquals($preExistingConnections, $postListener, 'Should not create duplicate connection');
    }

    /**
     * IP resolved successfully but Guacamole connection fails — session marked failed.
     */
    public function test_guacamole_failure_after_ip_resolution(): void
    {
        $vmId = 406;
        $user = User::factory()->engineer()->create();
        $template = VMTemplate::factory()->windows()->create();

        $this->proxmoxClient->registerVM('pve-1', $vmId, 'running', '10.10.10.100');
        
        // Make Guacamole fail on connection creation
        $this->guacamoleClient->setFailCreateConnection(true);

        $session = VMSession::factory()
            ->for($user)
            ->create([
                'template_id'             => $template->id,
                'node_id'                 => $this->node->id,
                'vm_id'                   => $vmId,
                'status'                  => VMSessionStatus::PENDING,
                'ip_address'              => null,
                'guacamole_connection_id' => null,
            ]);

        $event    = new VMSessionActivated($session);
        $listener = app(CreateGuacamoleConnectionListener::class);
        
        try {
            $listener->handle($event);
        } catch (\App\Exceptions\GuacamoleApiException $e) {
            // Expected to throw
        }

        $session->refresh();

        // Session should be marked as failed
        $this->assertEquals(VMSessionStatus::FAILED, $session->status);
        
        // But IP should have been persisted before the Guacamole call
        $this->assertNotNull($session->ip_address);
    }

    /**
     * Different protocols (RDP, VNC, SSH) should all work with resolved IP.
     */
    public function test_resolves_ip_and_creates_connection_for_different_protocols(): void
    {
        $protocols = ['Windows RDP', 'Linux VNC', 'Kali SSH'];
        $vmIds = [410, 411, 412];
        
        foreach ($protocols as $idx => $templateName) {
            $vmId = $vmIds[$idx];
            $user = User::factory()->engineer()->create();
            
            // Create template with matching protocol
            $protocol = match ($idx) {
                0 => 'rdp',
                1 => 'vnc',
                2 => 'ssh',
            };
            $template = VMTemplate::factory()->create(['protocol' => $protocol]);

            $this->proxmoxClient->registerVM('pve-1', $vmId, 'running', "192.168.1.$vmId");

            $session = VMSession::factory()
                ->for($user)
                ->create([
                    'template_id'             => $template->id,
                    'node_id'                 => $this->node->id,
                    'vm_id'                   => $vmId,
                    'status'                  => VMSessionStatus::PENDING,
                    'ip_address'              => null,
                    'guacamole_connection_id' => null,
                ]);

            $event    = new VMSessionActivated($session);
            $listener = app(CreateGuacamoleConnectionListener::class);
            $listener->handle($event);

            $session->refresh();

            $this->assertEquals(VMSessionStatus::ACTIVE, $session->status, "Protocol $protocol should activate");
            $this->assertNotNull($session->ip_address);
            $this->assertNotNull($session->guacamole_connection_id);
        }
    }

    /**
     * Multiple sessions being provisioned concurrently — each should resolve their own IP.
     */
    public function test_multiple_concurrent_sessions_resolve_independently(): void
    {
        $vmIds = [420, 421, 422];
        $user = User::factory()->engineer()->create();
        $template = VMTemplate::factory()->windows()->create();

        // Register all VMs
        foreach ($vmIds as $vmId) {
            $this->proxmoxClient->registerVM('pve-1', $vmId, 'running', "10.0.0.$vmId");
        }

        $sessions = [];
        foreach ($vmIds as $vmId) {
            $sessions[$vmId] = VMSession::factory()
                ->for($user)
                ->create([
                    'template_id'             => $template->id,
                    'node_id'                 => $this->node->id,
                    'vm_id'                   => $vmId,
                    'status'                  => VMSessionStatus::PENDING,
                    'ip_address'              => null,
                    'guacamole_connection_id' => null,
                ]);
        }

        $listener = app(CreateGuacamoleConnectionListener::class);

        // Invoke listener for each session
        foreach ($vmIds as $vmId) {
            $session = $sessions[$vmId];
            $event = new VMSessionActivated($session);
            $listener->handle($event);
            $sessions[$vmId]->refresh();
        }

        // Verify each session has correct IP and connection
        foreach ($vmIds as $vmId) {
            $session = $sessions[$vmId];
            $this->assertEquals(VMSessionStatus::ACTIVE, $session->status);
            $this->assertEquals("10.0.0.$vmId", $session->ip_address);
            $this->assertNotNull($session->guacamole_connection_id);
        }

        // All 3 connections should exist
        $this->assertCount(3, $this->guacamoleClient->getAllConnections());
    }
}
