<?php

namespace Tests\Feature;

use App\Enums\ProxmoxNodeStatus;
use App\Enums\UserRole;
use App\Enums\VMSessionStatus;
use App\Enums\VMSessionType;
use App\Models\ProxmoxNode;
use App\Models\ProxmoxServer;
use App\Models\User;
use App\Models\VMSession;
use App\Models\VMTemplate;
use App\Services\ProxmoxClientInterface;
use App\Services\ProxmoxClientFake;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class VMSessionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Fake the queue to prevent actual job execution
        Queue::fake();

        // Bind the fake ProxmoxClient
        $this->app->bind(ProxmoxClientInterface::class, function () {
            return new ProxmoxClientFake();
        });

        // Create required test data
        $this->createTestData();
    }

    protected function createTestData(): void
    {
        // Create Proxmox server (required for provisioning)
        ProxmoxServer::factory()->create();

        // Create Proxmox nodes
        ProxmoxNode::factory()->count(3)->create([
            'status' => ProxmoxNodeStatus::ONLINE,
        ]);

        // Create VM templates
        VMTemplate::factory()->count(2)->create();
    }

    /**
     * Test that an authenticated engineer can create a VM session.
     */
    public function test_engineer_can_create_vm_session(): void
    {
        $user = User::factory()->engineer()->create();
        $template = VMTemplate::factory()->active()->create();

        $response = $this->actingAs($user)->postJson('/sessions', [
            'template_id' => $template->id,
            'duration_minutes' => 60,
            'session_type' => VMSessionType::EPHEMERAL->value,
        ]);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'id',
            'status',
            'session_type',
            'created_at',
            'expires_at',
            'time_remaining_seconds',
            'template' => ['id', 'name', 'os_type', 'protocol'],
            'node_name',
            'guacamole_url',
        ]);

        // Verify session was created
        $this->assertDatabaseHas('vm_sessions', [
            'user_id' => $user->id,
            'template_id' => $template->id,
            'status' => VMSessionStatus::PENDING->value,
        ]);
    }

    /**
     * Test that an unauthenticated user cannot create a VM session.
     */
    public function test_unauthenticated_user_cannot_create_vm_session(): void
    {
        $template = VMTemplate::factory()->active()->create();

        $response = $this->postJson('/sessions', [
            'template_id' => $template->id,
            'duration_minutes' => 60,
            'session_type' => VMSessionType::EPHEMERAL->value,
        ]);

        $response->assertUnauthorized();
    }

    /**
     * Test that session creation fails with invalid template ID.
     */
    public function test_session_creation_fails_with_invalid_template(): void
    {
        $user = User::factory()->engineer()->create();

        $response = $this->actingAs($user)->postJson('/sessions', [
            'template_id' => 99999,
            'duration_minutes' => 60,
            'session_type' => VMSessionType::EPHEMERAL->value,
        ]);

        $response->assertUnprocessable();
    }

    /**
     * Test that session creation validates duration bounds.
     */
    public function test_session_duration_must_be_within_bounds(): void
    {
        $user = User::factory()->engineer()->create();
        $template = VMTemplate::factory()->active()->create();

        // Too short (< 30 minutes)
        $response = $this->actingAs($user)->postJson('/sessions', [
            'template_id' => $template->id,
            'duration_minutes' => 15,
            'session_type' => VMSessionType::EPHEMERAL->value,
        ]);
        $response->assertUnprocessable();

        // Too long (> 240 minutes per validation rules)
        $response = $this->actingAs($user)->postJson('/sessions', [
            'template_id' => $template->id,
            'duration_minutes' => 300,
            'session_type' => VMSessionType::EPHEMERAL->value,
        ]);
        $response->assertUnprocessable();
    }

    /**
     * Test retrieving a user's VM sessions.
     */
    public function test_user_can_retrieve_their_sessions(): void
    {
        $user = User::factory()->engineer()->create();
        $otherUser = User::factory()->engineer()->create();
        $template = VMTemplate::factory()->create();
        $node = ProxmoxNode::first();

        // Create sessions for both users
        VMSession::factory()->count(2)->create([
            'user_id' => $user->id,
            'template_id' => $template->id,
            'node_id' => $node->id,
        ]);
        VMSession::factory()->create([
            'user_id' => $otherUser->id,
            'template_id' => $template->id,
            'node_id' => $node->id,
        ]);

        $response = $this->actingAs($user)->getJson('/sessions');

        $response->assertOk();
        $this->assertCount(2, $response->json('data'));
    }

    /**
     * Test that a user cannot view another user's session.
     */
    public function test_user_cannot_view_other_users_session(): void
    {
        $user = User::factory()->engineer()->create();
        $otherUser = User::factory()->engineer()->create();
        $template = VMTemplate::factory()->create();
        $node = ProxmoxNode::first();

        $session = VMSession::factory()->create([
            'user_id' => $otherUser->id,
            'template_id' => $template->id,
            'node_id' => $node->id,
        ]);

        $response = $this->actingAs($user)->getJson("/sessions/{$session->id}");

        $response->assertForbidden();
    }

    /**
     * Test retrieving a specific VM session.
     */
    public function test_user_can_retrieve_specific_session(): void
    {
        $user = User::factory()->engineer()->create();
        $template = VMTemplate::factory()->create();
        $node = ProxmoxNode::first();

        $session = VMSession::factory()->create([
            'user_id' => $user->id,
            'template_id' => $template->id,
            'node_id' => $node->id,
        ]);

        $response = $this->actingAs($user)->getJson("/sessions/{$session->id}");

        $response->assertOk();
        $response->assertJsonPath('id', $session->id);
    }

    /**
     * Test that a user can terminate their session.
     */
    public function test_user_can_terminate_their_session(): void
    {
        $user = User::factory()->engineer()->create();
        $template = VMTemplate::factory()->create();
        $node = ProxmoxNode::first();

        $session = VMSession::factory()->create([
            'user_id' => $user->id,
            'template_id' => $template->id,
            'node_id' => $node->id,
        ]);

        $response = $this->actingAs($user)->deleteJson("/sessions/{$session->id}");

        $response->assertOk();
        $response->assertJson(['message' => 'Session terminated']);
    }

    /**
     * Test that a user cannot terminate another user's session.
     */
    public function test_user_cannot_terminate_other_users_session(): void
    {
        $user = User::factory()->engineer()->create();
        $otherUser = User::factory()->engineer()->create();
        $template = VMTemplate::factory()->create();
        $node = ProxmoxNode::first();

        $session = VMSession::factory()->create([
            'user_id' => $otherUser->id,
            'template_id' => $template->id,
            'node_id' => $node->id,
        ]);

        $response = $this->actingAs($user)->deleteJson("/sessions/{$session->id}");

        $response->assertForbidden();
    }
}
