<?php

namespace Tests\Unit\Listeners;

use App\Enums\VMSessionStatus;
use App\Events\VMSessionActivated;
use App\Listeners\CreateGuacamoleConnectionListener;
use App\Models\VMSession;
use App\Models\VMTemplate;
use App\Models\ProxmoxNode;
use App\Models\User;
use App\Services\GuacamoleClientFake;
use App\Services\GuacamoleClientInterface;
use Tests\TestCase;

class CreateGuacamoleConnectionListenerTest extends TestCase
{
    protected GuacamoleClientFake $guacamoleClient;

    protected function setUp(): void
    {
        parent::setUp();

        $this->guacamoleClient = new GuacamoleClientFake();
        $this->app->singleton(GuacamoleClientInterface::class, fn () => $this->guacamoleClient);
    }

    public function test_listener_creates_guacamole_connection_when_session_activated(): void
    {
        $user = User::factory()->engineer()->create();
        $template = VMTemplate::factory()->windows()->create();
        $node = ProxmoxNode::factory()->create();
        
        $session = VMSession::factory()
            ->for($user)
            ->create([
                'template_id' => $template->id,
                'node_id' => $node->id,
                'status' => VMSessionStatus::PENDING,
                'ip_address' => '10.0.0.50',
                'guacamole_connection_id' => null,
            ]);

        $event = new VMSessionActivated($session);
        $listener = app(CreateGuacamoleConnectionListener::class);
        $listener->handle($event);

        // Refresh session to get updated data
        $session->refresh();

        // Verify connection was created
        $this->assertNotNull($session->guacamole_connection_id);
        $this->assertEquals(VMSessionStatus::ACTIVE, $session->status);
        
        // Verify it's in the fake client's connections
        $this->assertCount(1, $this->guacamoleClient->getAllConnections());
    }

    public function test_listener_handles_guacamole_api_failure(): void
    {
        $user = User::factory()->engineer()->create();
        $template = VMTemplate::factory()->windows()->create();
        $node = ProxmoxNode::factory()->create();
        
        $session = VMSession::factory()
            ->for($user)
            ->create([
                'template_id' => $template->id,
                'node_id' => $node->id,
                'status' => VMSessionStatus::PENDING,
                'guacamole_connection_id' => null,
            ]);

        // Simulate API failure
        $this->guacamoleClient->setFailCreateConnection(true);

        $event = new VMSessionActivated($session);
        $listener = app(CreateGuacamoleConnectionListener::class);
        $listener->handle($event);

        // Refresh session
        $session->refresh();

        // Verify session is marked as failed
        $this->assertEquals(VMSessionStatus::FAILED, $session->status);
        $this->assertNull($session->guacamole_connection_id);
    }

    public function test_listener_uses_correct_protocol_for_rdp(): void
    {
        $user = User::factory()->engineer()->create();
        $template = VMTemplate::factory()->windows()->create();
        $node = ProxmoxNode::factory()->create();
        
        $session = VMSession::factory()
            ->for($user)
            ->create([
                'template_id' => $template->id,
                'node_id' => $node->id,
                'status' => VMSessionStatus::PENDING,
                'ip_address' => '10.0.0.50',
            ]);

        $event = new VMSessionActivated($session);
        $listener = app(CreateGuacamoleConnectionListener::class);
        $listener->handle($event);

        $connections = $this->guacamoleClient->getAllConnections();
        $connection = reset($connections);

        $this->assertEquals('rdp', $connection['protocol']);
        $this->assertEquals('10.0.0.50', $connection['parameters']['hostname']);
        $this->assertEquals('3389', $connection['parameters']['port']);
    }

    public function test_listener_uses_correct_protocol_for_vnc(): void
    {
        $user = User::factory()->engineer()->create();
        $template = VMTemplate::factory()->kaliLinux()->create();
        $node = ProxmoxNode::factory()->create();
        
        $session = VMSession::factory()
            ->for($user)
            ->create([
                'template_id' => $template->id,
                'node_id' => $node->id,
                'status' => VMSessionStatus::PENDING,
                'ip_address' => '10.0.0.60',
            ]);

        $event = new VMSessionActivated($session);
        $listener = app(CreateGuacamoleConnectionListener::class);
        $listener->handle($event);

        $connections = $this->guacamoleClient->getAllConnections();
        $connection = reset($connections);

        $this->assertEquals('vnc', $connection['protocol']);
        $this->assertEquals('10.0.0.60', $connection['parameters']['hostname']);
        $this->assertEquals('5900', $connection['parameters']['port']);
    }
}
