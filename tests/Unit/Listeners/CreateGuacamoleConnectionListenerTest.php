<?php

namespace Tests\Unit\Listeners;

use App\Enums\VMSessionProtocol;
use App\Enums\VMSessionStatus;
use App\Events\VMSessionActivated;
use App\Listeners\CreateGuacamoleConnectionListener;
use App\Models\ProxmoxNode;
use App\Models\User;
use App\Models\VMSession;
use App\Notifications\SessionActivationFailed;
use App\Services\GuacamoleClient;
use App\Services\GuacamoleClientFake;
use App\Services\GuacamoleClientInterface;
use App\Services\ProxmoxClientFake;
use App\Services\ProxmoxClientInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

/**
 * Unit tests for CreateGuacamoleConnectionListener.
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

        $this->proxmoxClient = new ProxmoxClientFake;
        $this->app->singleton(ProxmoxClientInterface::class, fn () => $this->proxmoxClient);

        $this->guacamoleClient = new GuacamoleClientFake;
        $this->app->singleton(GuacamoleClientInterface::class, fn () => $this->guacamoleClient);

        $this->node = ProxmoxNode::factory()->create(['name' => 'pve-1']);
    }

    protected function tearDown(): void
    {
        $this->guacamoleClient->resetAll();
        parent::tearDown();
    }

    public function test_stopped_vm_is_started_then_connection_created(): void
    {
        $vmId = 201;
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
        $this->assertNotNull($session->guacamole_connection_id);
        $this->assertNotNull($session->ip_address);

        $connections = $this->guacamoleClient->getAllConnections();
        $this->assertCount(1, $connections);
        $connection = reset($connections);
        $this->assertEquals('rdp', $connection['protocol']);
        $this->assertEquals($session->ip_address, $connection['parameters']['hostname']);
    }

    public function test_already_running_vm_skips_start_and_creates_connection(): void
    {
        $vmId = 202;
        $user = User::factory()->engineer()->create();

        $this->proxmoxClient->registerVM('pve-1', $vmId, 'running', '10.10.10.202');

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
        $this->assertEquals('10.10.10.202', $session->ip_address);
        $this->assertCount(1, $this->guacamoleClient->getAllConnections());
    }

    public function test_listener_skips_when_guacamole_connection_already_exists(): void
    {
        $vmId = 203;
        $user = User::factory()->engineer()->create();
        $this->proxmoxClient->registerVM('pve-1', $vmId, 'running', '10.0.0.1');

        $session = VMSession::factory()
            ->for($user)
            ->create([
                'node_id' => $this->node->id,
                'vm_id' => $vmId,
                'status' => VMSessionStatus::ACTIVE,
                'guacamole_connection_id' => 9999,
                'ip_address' => '10.0.0.1',
                'protocol' => VMSessionProtocol::RDP->value,
            ]);

        $listener = app(CreateGuacamoleConnectionListener::class);
        $listener->handle(new VMSessionActivated($session));

        $this->assertCount(0, $this->guacamoleClient->getAllConnections());
    }

    public function test_guacamole_failure_marks_session_as_failed(): void
    {
        Notification::fake();

        $vmId = 204;
        $user = User::factory()->engineer()->create();
        $admin = User::factory()->admin()->create();

        $this->proxmoxClient->registerVM('pve-1', $vmId, 'running', '10.0.0.2');
        $this->guacamoleClient->setFailCreateConnection(true);

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

        // The listener now propagates exceptions after marking the session FAILED.
        $this->expectException(\App\Exceptions\GuacamoleApiException::class);

        try {
            $listener->handle(new VMSessionActivated($session));
        } finally {
            // Session should still be marked FAILED even though exception is thrown
            $session->refresh();
            $this->assertEquals(VMSessionStatus::FAILED, $session->status);
            $this->assertNull($session->guacamole_connection_id);

            $this->assertNotEmpty(Notification::sentNotifications());
            Notification::assertSentTimes(SessionActivationFailed::class, 1);
        }
    }

    public function test_listener_retries_on_token_expiry_and_does_not_fail(): void
    {
        // replace the fake with the real HTTP-backed client and simulate a
        // 403 response on the first connection creation attempt
        Http::fakeSequence()
            ->push(['authToken' => 'first', 'dataSource' => 'mysql'], 200) // initial auth
            ->push(['message' => 'Permission Denied'], 403) // initial create fails
            ->push(['authToken' => 'second', 'dataSource' => 'mysql'], 200) // reauth
            ->push(['identifier' => 'okay'], 200); // success on retry

        $this->app->singleton(GuacamoleClientInterface::class, fn () => new GuacamoleClient);

        $vmId = 207;
        $user = User::factory()->engineer()->create();
        $this->proxmoxClient->registerVM('pve-1', $vmId, 'running', '10.0.0.77');

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
        $this->assertNotNull($session->guacamole_connection_id);
    }

    public function test_user_saved_preferences_are_applied_during_connection_creation(): void
    {
        $vmId = 206;
        $user = User::factory()->engineer()->create();

        $this->proxmoxClient->registerVM('pve-1', $vmId, 'running', '10.0.0.55');

        \App\Models\GuacamoleConnectionPreference::create([
            'user_id' => $user->id,
            'vm_session_type' => 'rdp',
            'parameters' => [
                'port' => 13390,
                'width' => 1600,
                'height' => 900,
                'username' => 'preferred-user',
                'enable-printing' => true,
                'enable-audio' => false,
            ],
        ]);

        $session = VMSession::factory()
            ->for($user)
            ->create([
                'node_id' => $this->node->id,
                'vm_id' => $vmId,
                'status' => VMSessionStatus::PENDING,
                'ip_address' => null,
                'protocol' => VMSessionProtocol::RDP->value,
            ]);

        $listener = app(CreateGuacamoleConnectionListener::class);
        $listener->handle(new VMSessionActivated($session));

        $connections = $this->guacamoleClient->getAllConnections();
        $this->assertCount(1, $connections);
        $connection = reset($connections);

        $this->assertEquals('rdp', $connection['protocol']);
        $this->assertEquals('10.0.0.55', $connection['parameters']['hostname']);
        $this->assertEquals('13390', $connection['parameters']['port']);
        $this->assertEquals('1600', $connection['parameters']['width']);
        $this->assertEquals('900', $connection['parameters']['height']);
        $this->assertEquals('preferred-user', $connection['parameters']['username']);
        $this->assertEquals('true', $connection['parameters']['enable-printing']);
        $this->assertEquals('false', $connection['parameters']['enable-audio']);
    }

    public function test_listener_uses_correct_protocol_and_ip_for_rdp(): void
    {
        $vmId = 205;
        $user = User::factory()->engineer()->create();
        $this->proxmoxClient->registerVM('pve-1', $vmId, 'running', '10.0.0.50');

        $session = VMSession::factory()
            ->for($user)
            ->create([
                'node_id' => $this->node->id,
                'vm_id' => $vmId,
                'status' => VMSessionStatus::PENDING,
                'ip_address' => null,
                'protocol' => VMSessionProtocol::RDP->value,
            ]);

        $listener = app(CreateGuacamoleConnectionListener::class);
        $listener->handle(new VMSessionActivated($session));

        $connections = $this->guacamoleClient->getAllConnections();
        $connection = reset($connections);

        $this->assertEquals('rdp', $connection['protocol']);
        $this->assertEquals('10.0.0.50', $connection['parameters']['hostname']);
        $this->assertEquals('3389', $connection['parameters']['port']);
    }
}
