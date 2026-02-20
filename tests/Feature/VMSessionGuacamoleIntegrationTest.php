<?php

namespace Tests\Feature;

use App\Enums\VMSessionStatus;
use App\Models\User;
use App\Models\VMSession;
use App\Models\VMTemplate;
use App\Models\ProxmoxNode;
use App\Services\ProxmoxClientFake;
use App\Services\ProxmoxClientInterface;
use App\Services\GuacamoleClientFake;
use App\Services\GuacamoleClientInterface;
use Tests\TestCase;

class VMSessionGuacamoleIntegrationTest extends TestCase
{
    protected ProxmoxClientFake $proxmoxClient;
    protected GuacamoleClientFake $guacamoleClient;

    protected function setUp(): void
    {
        parent::setUp();

        $this->proxmoxClient = new ProxmoxClientFake();
        $this->app->singleton(ProxmoxClientInterface::class, fn () => $this->proxmoxClient);

        $this->guacamoleClient = new GuacamoleClientFake();
        $this->app->singleton(GuacamoleClientInterface::class, fn () => $this->guacamoleClient);
    }

    protected function tearDown(): void
    {
        $this->guacamoleClient->resetAll();
        parent::tearDown();
    }

    public function test_provision_job_triggers_guacamole_connection_creation(): void
    {
        $vmId = 201;
        $user = User::factory()->engineer()->create();
        $template = VMTemplate::factory()->windows()->create();
        // Node name must match a key the ProxmoxClientFake node map uses (or we register the VM)
        $node = ProxmoxNode::factory()->create(['name' => 'pve-1']);

        // Pre-register the VM as stopped so startVM → running → IP resolved
        $this->proxmoxClient->registerVM('pve-1', $vmId, 'stopped');

        // Create a fresh fake client instance for this test
        $freshFake = new GuacamoleClientFake();
        $this->app->singleton(GuacamoleClientInterface::class, fn () => $freshFake);

        // Create session in pending state (no ip yet, connection not yet created)
        $session = VMSession::factory()
            ->for($user)
            ->create([
                'template_id'            => $template->id,
                'node_id'                => $node->id,
                'vm_id'                  => $vmId,
                'status'                 => VMSessionStatus::PENDING,
                'ip_address'             => null,
                'guacamole_connection_id' => null,
            ]);

        // Dispatch the event directly to trigger the listener
        event(new \App\Events\VMSessionActivated($session->fresh()));

        // Refresh session
        $session->refresh();

        // Verify session is now active (listener should have set it)
        $this->assertNotNull($session->guacamole_connection_id);
        $this->assertEquals(VMSessionStatus::ACTIVE, $session->status);
        // IP should have been resolved
        $this->assertNotNull($session->ip_address);

        // Verify session's connection ID exists in the created connections
        $connections = $freshFake->getAllConnections();
        $this->assertArrayHasKey($session->guacamole_connection_id, $connections);

        // Verify connection has correct protocol
        $connection = $connections[$session->guacamole_connection_id];
        $this->assertEquals('rdp', $connection['protocol']);
    }

    public function test_session_guacamole_url_points_to_token_endpoint(): void
    {
        $user = User::factory()->engineer()->create();
        $template = VMTemplate::factory()->windows()->create();
        $node = ProxmoxNode::factory()->create();

        $session = VMSession::factory()
            ->for($user)
            ->create([
                'template_id'            => $template->id,
                'node_id'                => $node->id,
                'status'                 => VMSessionStatus::ACTIVE,
                'guacamole_connection_id' => '1',
            ]);

        // Get session via API
        $response = $this->actingAs($user)
            ->getJson("/api/sessions/{$session->id}");

        $response->assertOk();

        // Check if the response contains guacamole_url
        $data = $response->json('data') ?? $response->json();
        $guacamoleUrl = $data['guacamole_url'] ?? null;

        $this->assertNotNull($guacamoleUrl, 'guacamole_url should not be null for active session');
        $this->assertStringContainsString("/api/sessions/{$session->id}/guacamole-token", $guacamoleUrl);
    }

    public function test_guacamole_url_is_null_for_pending_session(): void
    {
        $user = User::factory()->engineer()->create();
        $template = VMTemplate::factory()->windows()->create();
        $node = ProxmoxNode::factory()->create();

        $session = VMSession::factory()
            ->for($user)
            ->create([
                'template_id' => $template->id,
                'node_id'     => $node->id,
                'status'      => VMSessionStatus::PENDING,
            ]);

        $response = $this->actingAs($user)
            ->getJson("/api/sessions/{$session->id}");

        $response->assertOk();
        $this->assertNull($response->json('data.guacamole_url'));
    }

    public function test_token_endpoint_returns_valid_token_for_active_session(): void
    {
        $user = User::factory()->engineer()->create();
        $template = VMTemplate::factory()->windows()->create();
        $node = ProxmoxNode::factory()->create();

        // Reset and create a connection for this test
        $this->guacamoleClient->resetAll();
        $connectionId = $this->guacamoleClient->createConnection(['name' => 'test-token', 'protocol' => 'rdp']);

        $session = VMSession::factory()
            ->for($user)
            ->create([
                'template_id'            => $template->id,
                'node_id'                => $node->id,
                'status'                 => VMSessionStatus::ACTIVE,
                'guacamole_connection_id' => $connectionId,
                'expires_at'             => now()->addHours(1),
            ]);

        $response = $this->actingAs($user)
            ->getJson("/api/sessions/{$session->id}/guacamole-token");

        $response->assertOk();

        $this->assertNotEmpty($response->json('token'));
        $this->assertStringContainsString('token=', $response->json('viewer_url'));
        $this->assertEquals(300, $response->json('expires_in'));
    }

    public function test_session_show_returns_vm_ip_address_and_guacamole_connection_id(): void
    {
        $user = User::factory()->engineer()->create();
        $template = VMTemplate::factory()->windows()->create();
        $node = ProxmoxNode::factory()->create();

        $session = VMSession::factory()
            ->for($user)
            ->create([
                'template_id'            => $template->id,
                'node_id'                => $node->id,
                'status'                 => VMSessionStatus::ACTIVE,
                'ip_address'             => '192.168.1.100',
                'guacamole_connection_id' => 42,
            ]);

        $response = $this->actingAs($user)
            ->getJson("/api/sessions/{$session->id}");

        $response->assertOk();
        $response->assertJsonPath('vm_ip_address', '192.168.1.100');
        $response->assertJsonPath('guacamole_connection_id', 42);
    }

    public function test_page_refresh_returns_same_connection_id_without_creating_duplicate(): void
    {
        $user = User::factory()->engineer()->create();
        $template = VMTemplate::factory()->windows()->create();
        $node = ProxmoxNode::factory()->create();

        $session = VMSession::factory()
            ->for($user)
            ->create([
                'template_id'            => $template->id,
                'node_id'                => $node->id,
                'status'                 => VMSessionStatus::ACTIVE,
                'ip_address'             => '10.0.0.50',
                'guacamole_connection_id' => 99,
            ]);

        // Simulate page refresh: GET session twice
        $response1 = $this->actingAs($user)->getJson("/api/sessions/{$session->id}");
        $response2 = $this->actingAs($user)->getJson("/api/sessions/{$session->id}");

        // Both responses must return the same, unchanged connection_id
        $response1->assertOk();
        $response2->assertOk();
        $this->assertEquals(
            $response1->json('guacamole_connection_id'),
            $response2->json('guacamole_connection_id')
        );
        $this->assertEquals(99, $response1->json('guacamole_connection_id'));
    }
}
