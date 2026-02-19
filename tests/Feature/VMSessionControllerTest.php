<?php

namespace Tests\Feature;

use App\Enums\ProxmoxNodeStatus;
use App\Enums\VMSessionStatus;
use App\Enums\VMSessionType;
use App\Models\ProxmoxNode;
use App\Models\ProxmoxServer;
use App\Models\User;
use App\Models\VMSession;
use App\Models\VMTemplate;
use App\Services\ProxmoxClientFake;
use App\Services\ProxmoxClientInterface;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class VMSessionControllerTest extends TestCase
{
    private User $user;
    private ProxmoxServer $server;
    private VMTemplate $template;
    private ProxmoxNode $node;

    protected function setUp(): void
    {
        parent::setUp();

        // Fake the queue to prevent actual job execution
        Queue::fake();

        // Bind the fake ProxmoxClient
        $this->app->bind(ProxmoxClientInterface::class, function () {
            return new ProxmoxClientFake();
        });

        $this->user = User::factory()->create();
        $this->server = ProxmoxServer::factory()->create();

        $this->node = ProxmoxNode::factory()->create([
            'status' => ProxmoxNodeStatus::ONLINE,
        ]);

        $this->template = VMTemplate::factory()->create();
    }

    public function test_unauthenticated_user_cannot_access_sessions(): void
    {
        $response = $this->getJson('/sessions');
        $response->assertUnauthorized();
    }

    public function test_authenticated_user_can_list_sessions(): void
    {
        $session = VMSession::factory()->create([
            'user_id' => $this->user->id,
            'template_id' => $this->template->id,
            'node_id' => $this->node->id,
        ]);

        $response = $this->actingAs($this->user)->getJson('/sessions');

        $response->assertOk()
                 ->assertJsonStructure([
                     'data' => [
                         '*' => [
                             'id',
                             'status',
                             'session_type',
                             'template',
                             'node_name',
                             'expires_at',
                             'time_remaining_seconds',
                             'guacamole_url',
                         ],
                     ],
                 ]);

        $this->assertCount(1, $response->json('data'));
    }

    public function test_user_cannot_see_other_users_sessions(): void
    {
        $otherUser = User::factory()->create();

        VMSession::factory()->create([
            'user_id' => $otherUser->id,
            'template_id' => $this->template->id,
            'node_id' => $this->node->id,
        ]);

        $response = $this->actingAs($this->user)->getJson('/sessions');

        $this->assertEmpty($response->json('data'));
    }

    public function test_authenticated_user_can_create_session(): void
    {
        $response = $this->actingAs($this->user)->postJson('/sessions', [
            'template_id' => $this->template->id,
            'duration_minutes' => 60,
            'session_type' => VMSessionType::EPHEMERAL->value,
        ]);

        $response->assertCreated()
                 ->assertJsonStructure([
                     'id',
                     'status',
                     'session_type',
                     'template',
                     'node_name',
                     'expires_at',
                     'time_remaining_seconds',
                 ]);

        $this->assertDatabaseHas('vm_sessions', [
            'user_id' => $this->user->id,
            'template_id' => $this->template->id,
            'status' => VMSessionStatus::PENDING->value,
        ]);
    }

    public function test_create_session_validates_template_id(): void
    {
        $response = $this->actingAs($this->user)->postJson('/sessions', [
            'template_id' => 99999,
            'duration_minutes' => 60,
            'session_type' => VMSessionType::EPHEMERAL->value,
        ]);

        $response->assertUnprocessable()
                 ->assertJsonValidationErrors(['template_id']);
    }

    public function test_create_session_validates_duration_minutes(): void
    {
        $response = $this->actingAs($this->user)->postJson('/sessions', [
            'template_id' => $this->template->id,
            'duration_minutes' => 20, // Below minimum
            'session_type' => VMSessionType::EPHEMERAL->value,
        ]);

        $response->assertUnprocessable()
                 ->assertJsonValidationErrors(['duration_minutes']);
    }

    public function test_create_session_validates_session_type(): void
    {
        $response = $this->actingAs($this->user)->postJson('/sessions', [
            'template_id' => $this->template->id,
            'duration_minutes' => 60,
            'session_type' => 'invalid_type',
        ]);

        $response->assertUnprocessable()
                 ->assertJsonValidationErrors(['session_type']);
    }

    public function test_authenticated_user_can_get_session(): void
    {
        $session = VMSession::factory()->create([
            'user_id' => $this->user->id,
            'template_id' => $this->template->id,
            'node_id' => $this->node->id,
        ]);

        $response = $this->actingAs($this->user)->getJson("/sessions/{$session->id}");

        $response->assertOk()
                 ->assertJsonStructure([
                     'id',
                     'status',
                     'session_type',
                     'template',
                     'node_name',
                 ]);
    }

    public function test_user_cannot_get_other_users_session(): void
    {
        $otherUser = User::factory()->create();

        $session = VMSession::factory()->create([
            'user_id' => $otherUser->id,
            'template_id' => $this->template->id,
            'node_id' => $this->node->id,
        ]);

        $response = $this->actingAs($this->user)->getJson("/sessions/{$session->id}");

        $response->assertForbidden();
    }

    public function test_authenticated_user_can_delete_session(): void
    {
        $session = VMSession::factory()->create([
            'user_id' => $this->user->id,
            'template_id' => $this->template->id,
            'node_id' => $this->node->id,
        ]);

        $response = $this->actingAs($this->user)->deleteJson("/sessions/{$session->id}");

        $response->assertOk();

        $this->assertDatabaseMissing('vm_sessions', [
            'id' => $session->id,
        ]);
    }

    public function test_user_cannot_delete_other_users_session(): void
    {
        $otherUser = User::factory()->create();

        $session = VMSession::factory()->create([
            'user_id' => $otherUser->id,
            'template_id' => $this->template->id,
            'node_id' => $this->node->id,
        ]);

        $response = $this->actingAs($this->user)->deleteJson("/sessions/{$session->id}");

        $response->assertForbidden();
    }

    public function test_guacamole_url_is_null_for_pending_session(): void
    {
        $session = VMSession::factory()->create([
            'user_id' => $this->user->id,
            'template_id' => $this->template->id,
            'node_id' => $this->node->id,
            'status' => VMSessionStatus::PENDING,
        ]);

        $response = $this->actingAs($this->user)->getJson("/sessions/{$session->id}");

        $this->assertNull($response->json('guacamole_url'));
    }

    public function test_guacamole_url_is_present_for_active_session(): void
    {
        $session = VMSession::factory()->create([
            'user_id' => $this->user->id,
            'template_id' => $this->template->id,
            'node_id' => $this->node->id,
            'status' => VMSessionStatus::ACTIVE,
        ]);

        $response = $this->actingAs($this->user)->getJson("/sessions/{$session->id}");

        $this->assertNotNull($response->json('guacamole_url'));
    }

    public function test_response_does_not_expose_internal_fields(): void
    {
        $session = VMSession::factory()->create([
            'user_id' => $this->user->id,
            'template_id' => $this->template->id,
            'node_id' => $this->node->id,
            'vm_id' => 12345,
            'ip_address' => '192.168.1.50',
            'guacamole_connection_id' => 'secret-connection-id',
        ]);

        $response = $this->actingAs($this->user)->getJson("/sessions/{$session->id}");

        // Verify internal fields are NOT exposed
        $this->assertArrayNotHasKey('vm_id', $response->json());
        // ip_address is internal
        $this->assertArrayNotHasKey('ip_address', $response->json());
        // guacamole_connection_id is internal
        $this->assertArrayNotHasKey('guacamole_connection_id', $response->json());
    }
}
