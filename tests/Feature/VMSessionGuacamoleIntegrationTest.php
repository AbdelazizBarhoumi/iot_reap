<?php

namespace Tests\Feature;

use App\Enums\VMSessionStatus;
use App\Jobs\ProvisionVMJob;
use App\Models\User;
use App\Models\VMSession;
use App\Models\VMTemplate;
use App\Models\ProxmoxNode;
use App\Services\ProxmoxClientFake;
use App\Services\ProxmoxClientInterface;
use App\Services\GuacamoleClientFake;
use App\Services\GuacamoleClientInterface;
use Illuminate\Support\Facades\Bus;
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
        $user = User::factory()->engineer()->create();
        $template = VMTemplate::factory()->windows()->create();
        $node = ProxmoxNode::factory()->create();
        
        // Create a fresh fake client instance for this test
        $freshFake = new GuacamoleClientFake();
        $this->app->singleton(GuacamoleClientInterface::class, fn () => $freshFake);
        
        // Create session in pending state
        $session = VMSession::factory()
            ->for($user)
            ->create([
                'template_id' => $template->id,
                'node_id' => $node->id,
                'status' => VMSessionStatus::PENDING,
                'ip_address' => '10.0.0.100',
                'guacamole_connection_id' => null,
            ]);

        // Dispatch the event directly to trigger the listener
        event(new \App\Events\VMSessionActivated($session->fresh()));

        // Refresh session
        $session->refresh();

        // Verify session is now active (listener should have set it)
        $this->assertNotNull($session->guacamole_connection_id);
        $this->assertEquals(VMSessionStatus::ACTIVE, $session->status);

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
                'template_id' => $template->id,
                'node_id' => $node->id,
                'status' => VMSessionStatus::ACTIVE,
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
                'node_id' => $node->id,
                'status' => VMSessionStatus::PENDING,
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
                'template_id' => $template->id,
                'node_id' => $node->id,
                'status' => VMSessionStatus::ACTIVE,
                'guacamole_connection_id' => $connectionId,
                'expires_at' => now()->addHours(1),
            ]);

        $response = $this->actingAs($user)
            ->getJson("/api/sessions/{$session->id}/guacamole-token");

        $response->assertOk();
        
        $this->assertNotEmpty($response->json('token'));
        $this->assertStringContainsString('token=', $response->json('viewer_url'));
        $this->assertEquals(300, $response->json('expires_in'));
    }
}
