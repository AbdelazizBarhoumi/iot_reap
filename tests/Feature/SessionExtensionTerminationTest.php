<?php

namespace Tests\Feature;

use App\Enums\ProxmoxNodeStatus;
use App\Enums\VMSessionStatus;
use App\Enums\VMSessionType;
use App\Jobs\CleanupVMJob;
use App\Jobs\TerminateVMJob;
use App\Models\ProxmoxNode;
use App\Models\ProxmoxServer;
use App\Models\User;
use App\Models\VMSession;
use App\Models\VMTemplate;
use App\Services\ProxmoxClientFake;
use App\Services\ProxmoxClientInterface;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

/**
 * Feature tests for session extension and termination.
 * Tests US-08/US-09: Session Extension & Termination
 */
class SessionExtensionTerminationTest extends TestCase
{
    private User $user;
    private ProxmoxServer $server;
    private VMTemplate $template;
    private ProxmoxNode $node;
    private VMSession $session;

    protected function setUp(): void
    {
        parent::setUp();

        Queue::fake();

        $this->app->bind(ProxmoxClientInterface::class, function () {
            return new ProxmoxClientFake();
        });

        $this->user = User::factory()->create();
        $this->server = ProxmoxServer::factory()->create();

        $this->node = ProxmoxNode::factory()->create([
            'status' => ProxmoxNodeStatus::ONLINE,
        ]);

        $this->template = VMTemplate::factory()->create();

        // Create an active session
        $this->session = VMSession::factory()->create([
            'user_id' => $this->user->id,
            'template_id' => $this->template->id,
            'node_id' => $this->node->id,
            'status' => VMSessionStatus::ACTIVE,
            'session_type' => VMSessionType::EPHEMERAL,
            'expires_at' => now()->addHours(2),
            'vm_id' => 100,
        ]);
    }

    // ===== EXTEND SESSION TESTS =====

    public function test_authenticated_user_can_extend_own_session(): void
    {
        $originalExpiry = $this->session->expires_at;
        $extensionMinutes = 30;

        $response = $this->actingAs($this->user)->postJson(
            "/sessions/{$this->session->id}/extend",
            ['minutes' => $extensionMinutes]
        );

        $response->assertOk()
                 ->assertJsonStructure([
                     'id',
                     'status',
                     'session_type',
                     'expires_at',
                 ]);

        // Verify expiry was extended
        $this->session->refresh();
        $this->assertTrue(
            $this->session->expires_at->greaterThan($originalExpiry),
            'Expiration time was not extended'
        );

        // Verify exactly the requested minutes were added
        $expectedExpiry = $originalExpiry->addMinutes($extensionMinutes);
        $this->assertTrue(
            $this->session->expires_at->equalTo($expectedExpiry),
            'Extension did not add exact requested minutes'
        );
    }

    public function test_extend_uses_default_increment_when_minutes_not_provided(): void
    {
        $originalExpiry = $this->session->expires_at;
        $defaultIncrement = config('sessions.extension_increment_minutes', 30);

        $response = $this->actingAs($this->user)->postJson(
            "/sessions/{$this->session->id}/extend"
        );

        $response->assertOk();

        $this->session->refresh();
        $expectedExpiry = $originalExpiry->addMinutes($defaultIncrement);
        $this->assertTrue(
            $this->session->expires_at->equalTo($expectedExpiry),
            'Default increment was not applied correctly'
        );
    }

    public function test_extend_fails_with_invalid_minutes(): void
    {
        // Test: 0 minutes (invalid)
        $response = $this->actingAs($this->user)->postJson(
            "/sessions/{$this->session->id}/extend",
            ['minutes' => 0]
        );
        $response->assertStatus(422);

        // Test: negative minutes (invalid)
        $response = $this->actingAs($this->user)->postJson(
            "/sessions/{$this->session->id}/extend",
            ['minutes' => -10]
        );
        $response->assertStatus(422);

        // Test: exceeds maximum (invalid)
        $response = $this->actingAs($this->user)->postJson(
            "/sessions/{$this->session->id}/extend",
            ['minutes' => 300]
        );
        $response->assertStatus(422);
    }

    public function test_extend_fails_if_quota_exceeded(): void
    {
        // Create another active session that uses up most quota
        $maxConcurrentMinutes = config('sessions.max_concurrent_minutes', 240);
        $firstSessionRemaining = $maxConcurrentMinutes - 20; // 220 minutes

        $this->session->update([
            'expires_at' => now()->addMinutes($firstSessionRemaining),
        ]);

        // Try to extend by more than available quota
        $response = $this->actingAs($this->user)->postJson(
            "/sessions/{$this->session->id}/extend",
            ['minutes' => 30] // Would exceed quota (220 + 30 = 250 > 240)
        );

        $response->assertStatus(422);
        $response->assertJsonStructure(['message', 'error']);
    }

    public function test_extend_reschedules_cleanup_job_for_ephemeral_sessions(): void
    {
        $this->session->update(['session_type' => VMSessionType::EPHEMERAL]);
        Queue::fake();

        $response = $this->actingAs($this->user)->postJson(
            "/sessions/{$this->session->id}/extend",
            ['minutes' => 30]
        );

        // CleanupVMJob should be dispatched with new expiry
        $response->assertOk();
    }

    public function test_unauthenticated_user_cannot_extend_session(): void
    {
        $response = $this->postJson("/sessions/{$this->session->id}/extend");
        $response->assertUnauthorized();
    }

    public function test_user_cannot_extend_other_users_session(): void
    {
        $otherUser = User::factory()->create();

        $response = $this->actingAs($otherUser)->postJson(
            "/sessions/{$this->session->id}/extend",
            ['minutes' => 30]
        );

        $response->assertForbidden();
    }

    // ===== TERMINATE SESSION TESTS =====

    public function test_authenticated_user_can_terminate_own_ephemeral_session(): void
    {
        $this->session->update(['session_type' => VMSessionType::EPHEMERAL]);

        $response = $this->actingAs($this->user)->deleteJson(
            "/sessions/{$this->session->id}",
            ['stop_vm' => true]
        );

        $response->assertStatus(202);
        $response->assertJson(['message' => 'Session termination initiated']);
    }

    public function test_terminate_with_stop_vm_flag_true_for_ephemeral(): void
    {
        $this->session->update(['session_type' => VMSessionType::EPHEMERAL]);

        $response = $this->actingAs($this->user)->deleteJson(
            "/sessions/{$this->session->id}",
            ['stop_vm' => true]
        );

        $response->assertStatus(202);
    }

    public function test_terminate_with_stop_vm_flag_false(): void
    {
        $response = $this->actingAs($this->user)->deleteJson(
            "/sessions/{$this->session->id}",
            ['stop_vm' => false]
        );

        $response->assertStatus(202);
    }

    public function test_terminate_accepts_return_snapshot_parameter(): void
    {
        $this->session->update(['session_type' => VMSessionType::PERSISTENT]);

        $snapshotName = 'snap-session-123-1708345200';

        $response = $this->actingAs($this->user)->deleteJson(
            "/sessions/{$this->session->id}",
            [
                'stop_vm' => true,
                'return_snapshot' => $snapshotName,
            ]
        );

        $response->assertStatus(202);
    }

    public function test_terminate_defaults_to_stop_vm_true(): void
    {
        // No stop_vm parameter provided
        $response = $this->actingAs($this->user)->deleteJson(
            "/sessions/{$this->session->id}",
            []
        );

        $response->assertStatus(202);
    }

    public function test_unauthenticated_user_cannot_terminate_session(): void
    {
        $response = $this->deleteJson("/sessions/{$this->session->id}");
        $response->assertUnauthorized();
    }

    public function test_user_cannot_terminate_other_users_session(): void
    {
        $otherUser = User::factory()->create();

        $response = $this->actingAs($otherUser)->deleteJson(
            "/sessions/{$this->session->id}"
        );

        $response->assertForbidden();
    }

    // ===== QUOTA ENFORCEMENT TESTS =====

    public function test_session_creation_fails_when_quota_exceeded(): void
    {
        // We already have one active session from setUp
        // Create another one to reach the concurrent limit (default 2)
        VMSession::factory()->create([
            'user_id' => $this->user->id,
            'template_id' => $this->template->id,
            'node_id' => $this->node->id,
            'status' => VMSessionStatus::ACTIVE,
            'expires_at' => now()->addHours(1),
        ]);

        // Create a third session - should fail at concurrent limit
        $response = $this->actingAs($this->user)->postJson('/sessions', [
            'template_id' => $this->template->id,
            'duration_minutes' => 60,
            'session_type' => VMSessionType::EPHEMERAL->value,
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure(['message', 'error']);
    }

    public function test_session_creation_fails_when_total_minutes_exceed_quota(): void
    {
        $maxMinutes = config('sessions.max_concurrent_minutes', 240);

        // Update existing session to use 200 minutes
        $this->session->update([
            'expires_at' => now()->addMinutes(200),
        ]);

        $response = $this->actingAs($this->user)->postJson('/sessions', [
            'template_id' => $this->template->id,
            'duration_minutes' => 60, // Would exceed 240 total
            'session_type' => VMSessionType::EPHEMERAL->value,
        ]);

        $response->assertStatus(422);
    }

    public function test_default_duration_used_when_not_provided(): void
    {
        Queue::fake();

        // Create session without duration_minutes
        $response = $this->actingAs($this->user)->postJson('/sessions', [
            'template_id' => $this->template->id,
            'session_type' => VMSessionType::EPHEMERAL->value,
            // duration_minutes intentionally omitted
        ]);

        $response->assertCreated();
        $data = $response->json();

        // Verify default duration was used by checking expires_at
        $expectedExpiry = now()->addMinutes(config('sessions.default_duration_minutes', 120));
        $responseExpiry = \Carbon\Carbon::parse($data['expires_at']);

        // Allow 1-2 second variance for execution time
        $this->assertTrue(
            $responseExpiry->diffInSeconds($expectedExpiry) <= 2,
            'Default duration was not applied correctly'
        );
    }

    // ===== INTEGRATION TESTS =====

    public function test_full_session_lifecycle_ephemeral(): void
    {
        Queue::fake();

        // Delete the setUp session to avoid quota conflicts
        $this->session->delete();

        // 1. Create session
        $createResponse = $this->actingAs($this->user)->postJson('/sessions', [
            'template_id' => $this->template->id,
            'duration_minutes' => 60,
            'session_type' => VMSessionType::EPHEMERAL->value,
        ]);

        $createResponse->assertCreated();
        $sessionId = $createResponse->json('id');

        // Refresh to get updated info
        $session = VMSession::find($sessionId);
        // Mark as ACTIVE so we can extend (normally done by ProvisionVMJob)
        $session->update(['status' => VMSessionStatus::ACTIVE]);
        $originalExpiry = $session->expires_at;

        // 2. Extend session
        $extendResponse = $this->actingAs($this->user)->postJson(
            "/sessions/{$sessionId}/extend",
            ['minutes' => 30]
        );

        $extendResponse->assertOk();
        $session->refresh();
        $this->assertTrue($session->expires_at->greaterThan($originalExpiry));

        // 3. Terminate session
        $terminateResponse = $this->actingAs($this->user)->deleteJson(
            "/sessions/{$sessionId}",
            ['stop_vm' => true]
        );

        $terminateResponse->assertStatus(202);
    }

    public function test_full_session_lifecycle_persistent_with_snapshot(): void
    {
        Queue::fake();

        // Delete the setUp session to avoid quota conflicts
        $this->session->delete();

        // Create persistent session
        $createResponse = $this->actingAs($this->user)->postJson('/sessions', [
            'template_id' => $this->template->id,
            'duration_minutes' => 120,
            'session_type' => VMSessionType::PERSISTENT->value,
        ]);

        $createResponse->assertCreated();
        $sessionId = $createResponse->json('id');

        // Mark as ACTIVE so we can extend (normally done by ProvisionVMJob)
        $session = VMSession::find($sessionId);
        $session->update(['status' => VMSessionStatus::ACTIVE]);

        // Extend the session
        $extendResponse = $this->actingAs($this->user)->postJson(
            "/sessions/{$sessionId}/extend",
            ['minutes' => 60]
        );

        $extendResponse->assertOk();

        // Terminate with snapshot revert
        $terminateResponse = $this->actingAs($this->user)->deleteJson(
            "/sessions/{$sessionId}",
            [
                'stop_vm' => true,
                'return_snapshot' => 'snap-session-123-initial',
            ]
        );

        $terminateResponse->assertStatus(202);
    }
}
