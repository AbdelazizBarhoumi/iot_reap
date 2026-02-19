<?php

namespace Tests\Feature;

use App\Enums\VMSessionStatus;
use App\Models\User;
use App\Models\VMSession;
use App\Models\VMTemplate;
use App\Models\ProxmoxNode;
use App\Services\GuacamoleClientFake;
use App\Services\GuacamoleClientInterface;
use Tests\TestCase;

class GuacamoleTokenControllerTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Use fake Guacamole client for all tests
        $this->app->singleton(GuacamoleClientInterface::class, function () {
            return new GuacamoleClientFake();
        });
    }

    public function test_user_can_get_token_for_their_active_session(): void
    {
        $user = User::factory()->engineer()->create();
        $template = VMTemplate::factory()->windows()->create();
        $node = ProxmoxNode::factory()->create();
        
        // Get a real connection ID from the fake client
        $connectionId = $this->app->make(GuacamoleClientInterface::class)
            ->createConnection(['name' => 'test-session', 'protocol' => 'rdp']);
        
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

        $response->assertOk()
            ->assertJsonStructure([
                'token',
                'viewer_url',
                'expires_in',
                'guacamole_url',
            ]);

        $this->assertStringContainsString('token=', $response->json('viewer_url'));
    }

    public function test_returns_403_for_non_session_owner(): void
    {
        $ownerUser = User::factory()->engineer()->create();
        $otherUser = User::factory()->engineer()->create();
        $template = VMTemplate::factory()->windows()->create();
        $node = ProxmoxNode::factory()->create();
        
        $session = VMSession::factory()
            ->for($ownerUser)
            ->create([
                'template_id' => $template->id,
                'node_id' => $node->id,
                'status' => VMSessionStatus::ACTIVE,
                'guacamole_connection_id' => 'test-connection-123',
            ]);

        $response = $this->actingAs($otherUser)
            ->getJson("/api/sessions/{$session->id}/guacamole-token");

        $response->assertForbidden()
            ->assertJsonPath('message', 'Unauthorized: You do not own this session.');
    }

    public function test_returns_422_for_pending_session(): void
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
            ->getJson("/api/sessions/{$session->id}/guacamole-token");

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Session not yet active. Please wait for VM to start.');
    }

    public function test_returns_422_for_failed_session(): void
    {
        $user = User::factory()->engineer()->create();
        $template = VMTemplate::factory()->windows()->create();
        $node = ProxmoxNode::factory()->create();
        
        $session = VMSession::factory()
            ->for($user)
            ->create([
                'template_id' => $template->id,
                'node_id' => $node->id,
                'status' => VMSessionStatus::FAILED,
            ]);

        $response = $this->actingAs($user)
            ->getJson("/api/sessions/{$session->id}/guacamole-token");

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Session not yet active. Please wait for VM to start.');
    }

    public function test_returns_422_for_expired_session(): void
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
                'expires_at' => now()->subHours(1),
                'guacamole_connection_id' => 'test-connection-123',
            ]);

        $response = $this->actingAs($user)
            ->getJson("/api/sessions/{$session->id}/guacamole-token");

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Session has expired.');
    }

    public function test_rate_limit_10_requests_per_minute(): void
    {
        $user = User::factory()->engineer()->create();
        $template = VMTemplate::factory()->windows()->create();
        $node = ProxmoxNode::factory()->create();
        $fake = $this->app->make(GuacamoleClientInterface::class);
        
        // Create 11 sessions with pre-created connection IDs
        $sessions = [];
        for ($i = 1; $i <= 11; $i++) {
            $connectionId = $fake->createConnection(['name' => "test-$i", 'protocol' => 'rdp']);
            $sessions[] = VMSession::factory()
                ->for($user)
                ->create([
                    'template_id' => $template->id,
                    'node_id' => $node->id,
                    'status' => VMSessionStatus::ACTIVE,
                    'guacamole_connection_id' => $connectionId,
                    'expires_at' => now()->addHours(1),
                ]);
        }

        // First 10 requests should succeed
        for ($i = 0; $i < 10; $i++) {
            $response = $this->actingAs($user)
                ->getJson("/api/sessions/{$sessions[$i]->id}/guacamole-token");
            $response->assertOk();
        }

        // 11th request should be rate limited
        $response = $this->actingAs($user)
            ->getJson("/api/sessions/{$sessions[10]->id}/guacamole-token");

        $response->assertStatus(429)
            ->assertJsonPath('message', 'Too many token requests. Please wait before trying again.');
    }

    public function test_requires_authentication(): void
    {
        $template = VMTemplate::factory()->windows()->create();
        $node = ProxmoxNode::factory()->create();
        $user = User::factory()->engineer()->create();
        
        $session = VMSession::factory()
            ->for($user)
            ->create([
                'template_id' => $template->id,
                'node_id' => $node->id,
                'status' => VMSessionStatus::ACTIVE,
            ]);

        $response = $this->getJson("/api/sessions/{$session->id}/guacamole-token");

        $response->assertUnauthorized();
    }
}
