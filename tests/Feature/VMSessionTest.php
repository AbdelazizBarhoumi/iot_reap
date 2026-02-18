<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Enums\VMSessionStatus;
use App\Enums\VMSessionType;
use App\Models\ProxmoxNode;
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

        // Create test data
        $this->createTestData();
    }

    protected function createTestData(): void
    {
        // Create Proxmox nodes
        ProxmoxNode::factory()->count(3)->create();

        // Create VM templates
        VMTemplate::factory()->count(2)->create();
    }

    protected function defineEnvironment($app)
    {
        // Set up Proxmox config for testing
        $app['config']['proxmox'] = [
            'host' => 'localhost',
            'port' => 8006,
            'realm' => 'pam',
            'token_id' => 'test-token-id',
            'token_secret' => 'test-token-secret',
            'verify_ssl' => false,
            'timeout' => 30,
            'template_vmid_range' => [100, 199],
            'session_vmid_range' => [200, 999],
            'node_load_threshold' => 0.85,
            'retry_attempts' => 3,
            'retry_delay_initial' => 10,
            'retry_delay_multiplier' => 3,
            'clone_timeout' => 120,
            'clone_poll_interval' => 5,
            'cache_ttl' => 30,
            'node_score_weights' => ['ram' => 0.7, 'cpu' => 0.3],
        ];
    }

    protected function defineRoutes($router)
    {
        // Bind the fake ProxmoxClient for all tests
        $this->app->bind(ProxmoxClientInterface::class, function () {
            return new ProxmoxClientFake();
        });
    }

    /**
     * Test that an authenticated engineer can create a VM session.
     */
    public function test_engineer_can_create_vm_session(): void
    {
        Queue::fake();
        
        $user = User::factory()->engineer()->create();
        $template = VMTemplate::factory()->active()->create();

        $response = $this->actingAs($user)->postJson('/sessions', [
            'template_id' => $template->id,
            'duration_minutes' => 60,
            'session_type' => VMSessionType::EPHEMERAL->value,
        ]);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'data' => [
                'id',
                'status',
                'status_label',
                'session_type',
                'created_at',
                'expires_at',
                'time_remaining_seconds',
                'template' => ['id', 'name', 'os_type', 'protocol'],
                'node' => ['id', 'name', 'hostname', 'status'],
                'guacamole_url',
            ],
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
     * Test that a user without engineer role cannot create a VM session.
     */
    public function test_unauthorized_user_cannot_create_vm_session(): void
    {
        $user = User::factory()->create(['role' => UserRole::SECURITY_OFFICER]);
        // SECURITY_OFFICER role is not authorized to create VMs

        $template = VMTemplate::factory()->active()->create();

        $response = $this->actingAs($user)->postJson('/sessions', [
            'template_id' => $template->id,
            'duration_minutes' => 60,
            'session_type' => VMSessionType::EPHEMERAL->value,
        ]);

        $response->assertForbidden();
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
     * Test that session creation fails with inactive template.
     */
    public function test_session_creation_fails_with_inactive_template(): void
    {
        $user = User::factory()->engineer()->create();
        $template = VMTemplate::factory()->inactive()->create();

        $response = $this->actingAs($user)->postJson('/sessions', [
            'template_id' => $template->id,
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

        // Too long (> 480 minutes)
        $response = $this->actingAs($user)->postJson('/sessions', [
            'template_id' => $template->id,
            'duration_minutes' => 600,
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

        // Create sessions for both users
        VMSession::factory()->for($user)->count(2)->create();
        VMSession::factory()->for($otherUser)->count(1)->create();

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

        $session = VMSession::factory()->for($otherUser)->create();

        $response = $this->actingAs($user)->getJson("/sessions/{$session->id}");

        $response->assertForbidden();
    }

    /**
     * Test retrieving a specific VM session.
     */
    public function test_user_can_retrieve_specific_session(): void
    {
        $user = User::factory()->engineer()->create();
        $session = VMSession::factory()->for($user)->create();

        $response = $this->actingAs($user)->getJson("/sessions/{$session->id}");

        $response->assertOk();
        $response->assertJsonPath('data.id', $session->id);
    }

    /**
     * Test that a user can terminate their session.
     */
    public function test_user_can_terminate_their_session(): void
    {
        $user = User::factory()->engineer()->create();
        $session = VMSession::factory()->for($user)->create();

        $response = $this->actingAs($user)->deleteJson("/sessions/{$session->id}");

        $response->assertNoContent();

        // Verify session was marked as terminated
        $this->assertDatabaseHas('vm_sessions', [
            'id' => $session->id,
            'status' => 'terminated',
        ]);
    }

    /**
     * Test that a user cannot terminate another user's session.
     */
    public function test_user_cannot_terminate_other_users_session(): void
    {
        $user = User::factory()->engineer()->create();
        $otherUser = User::factory()->engineer()->create();

        $session = VMSession::factory()->for($otherUser)->create();

        $response = $this->actingAs($user)->deleteJson("/sessions/{$session->id}");

        $response->assertForbidden();
    }
}
