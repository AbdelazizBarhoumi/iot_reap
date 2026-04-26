<?php

namespace Tests\Feature;

use App\Enums\ProxmoxNodeStatus;
use App\Enums\VMSessionStatus;
use App\Jobs\CleanupVMJob;
use App\Jobs\TerminateVMJob;
use App\Models\ProxmoxNode;
use App\Models\ProxmoxServer;
use App\Models\User;
use App\Models\VMSession;
use App\Services\GuacamoleClientInterface;
use App\Services\ProxmoxClientFake;
use App\Services\ProxmoxClientInterface;
use App\Services\VMSessionCleanupService;
use Carbon\Carbon;
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

    // template removed; we no longer track it
    private ProxmoxNode $node;

    private VMSession $session;

    private ProxmoxClientFake $proxmoxFake;

    protected function setUp(): void
    {
        parent::setUp();

        // Bind ProxmoxClientFake as singleton so tests can register VMs.
        $this->proxmoxFake = new ProxmoxClientFake;
        $this->app->instance(ProxmoxClientInterface::class, $this->proxmoxFake);

        // Mock GuacamoleClient — the sync listener and TerminateVMJob call it.
        $guacMock = \Mockery::mock(GuacamoleClientInterface::class);
        $guacMock->shouldReceive('createConnection')->andReturn('123');
        $guacMock->shouldReceive('deleteConnection')->andReturn(null);
        $guacMock->shouldReceive('generateAuthToken')->andReturn('fake-token');
        $guacMock->shouldReceive('getConnection')->andReturn([]);
        $guacMock->shouldReceive('getDataSource')->andReturn('mysql');
        $guacMock->shouldReceive('clearAuthToken')->andReturn(null);
        $this->app->instance(GuacamoleClientInterface::class, $guacMock);

        $this->user = User::factory()->create();
        $this->server = ProxmoxServer::factory()->create();

        $this->node = ProxmoxNode::factory()->create([
            'status' => ProxmoxNodeStatus::ONLINE,
            'proxmox_server_id' => $this->server->id,
        ]);

        // Create an active session on existing VM
        $this->session = VMSession::factory()->create([
            'user_id' => $this->user->id,
            'node_id' => $this->node->id,
            'status' => VMSessionStatus::ACTIVE,
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

    public function test_extend_does_not_dispatch_cleanup_job(): void
    {
        Queue::fake();

        $response = $this->actingAs($this->user)->postJson(
            "/sessions/{$this->session->id}/extend",
            ['minutes' => 30]
        );

        // no CleanupVMJob should be dispatched
        Queue::assertNotPushed(CleanupVMJob::class);
        $response->assertOk();
    }

    public function test_unauthenticated_user_cannot_extend_session(): void
    {
        $response = $this->postJson("/sessions/{$this->session->id}/extend");
        $response->assertUnauthorized();
    }

    public function test_expiring_overdue_sessions_does_not_dispatch_cleanup_job(): void
    {
        Queue::fake();

        // create a session that has already passed its expiry time
        $session = VMSession::factory()->create([
            'user_id' => $this->user->id,
            'node_id' => $this->node->id,
            'vm_id' => 500,
            'status' => VMSessionStatus::ACTIVE,
            'expires_at' => now()->subMinute(),
        ]);

        $count = app(VMSessionCleanupService::class)
            ->expireOverdueSessions();

        $this->assertSame(1, $count);
        Queue::assertNotPushed(CleanupVMJob::class);
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

    public function test_authenticated_user_can_terminate_own_session(): void
    {
        // by default the API will leave the VM running (stop_vm flag false)
        $response = $this->actingAs($this->user)->deleteJson(
            "/sessions/{$this->session->id}"
        );

        // Termination is now synchronous — returns 200
        $response->assertOk();

        // Session should be marked expired after sync termination
        $this->session->refresh();
        $this->assertEquals(VMSessionStatus::EXPIRED, $this->session->status);
    }

    public function test_terminate_with_stop_vm_flag_true(): void
    {
        // Register the VM so ProxmoxClientFake can handle stopVM
        $this->proxmoxFake->registerVM($this->node->name, 100, 'running', '10.0.0.1');

        $response = $this->actingAs($this->user)->deleteJson(
            "/sessions/{$this->session->id}",
            ['stop_vm' => true]
        );

        $response->assertOk();
        $this->session->refresh();
        $this->assertEquals(VMSessionStatus::EXPIRED, $this->session->status);
    }

    public function test_terminate_with_stop_vm_flag_false(): void
    {
        $response = $this->actingAs($this->user)->deleteJson(
            "/sessions/{$this->session->id}",
            ['stop_vm' => false]
        );

        $response->assertOk();
        $this->session->refresh();
        $this->assertEquals(VMSessionStatus::EXPIRED, $this->session->status);
    }

    public function test_terminate_accepts_return_snapshot_parameter(): void
    {
        // Register the VM so ProxmoxClientFake can handle snapshot revert + stop
        $this->proxmoxFake->registerVM($this->node->name, 100, 'running', '10.0.0.1');

        $snapshotName = 'snap-session-123-1708345200';

        $response = $this->actingAs($this->user)->deleteJson(
            "/sessions/{$this->session->id}",
            [
                'stop_vm' => true,
                'return_snapshot' => $snapshotName,
            ]
        );

        $response->assertOk();
        $this->session->refresh();
        $this->assertEquals(VMSessionStatus::EXPIRED, $this->session->status);
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

    public function test_default_duration_used_when_not_provided(): void
    {
        // Register the VM so the sync activation listener can resolve its IP
        $this->proxmoxFake->registerVM($this->node->name, 202, 'running', '10.0.0.202');

        // Create session without duration_minutes
        $response = $this->actingAs($this->user)->postJson('/sessions', [
            'vmid' => 202,
            'node_id' => $this->node->id,
            'protocol' => 'rdp',
            // duration_minutes intentionally omitted
        ]);

        $response->assertCreated();
        $data = $response->json();

        // Verify default duration was used by checking expires_at
        $expectedExpiry = now()->addMinutes(config('sessions.default_duration_minutes', 120));
        $responseExpiry = Carbon::parse($data['expires_at']);

        // Allow 1-2 second variance for execution time
        $this->assertTrue(
            $responseExpiry->diffInSeconds($expectedExpiry) <= 2,
            'Default duration was not applied correctly'
        );
    }

    // ===== INTEGRATION TESTS =====

    public function test_full_session_lifecycle(): void
    {
        // Delete the setUp session to avoid quota conflicts
        $this->session->delete();

        // Register the VM for sync activation
        $this->proxmoxFake->registerVM($this->node->name, 203, 'running', '10.0.0.203');

        // 1. Create session (sync activation → ACTIVE immediately)
        $createResponse = $this->actingAs($this->user)->postJson('/sessions', [
            'vmid' => 203,
            'node_id' => $this->node->id,
            'protocol' => 'rdp',
            'duration_minutes' => 60,
        ]);

        $createResponse->assertCreated();
        $sessionId = $createResponse->json('id');

        $session = VMSession::find($sessionId);
        // Session is already ACTIVE after sync activation
        $this->assertEquals(VMSessionStatus::ACTIVE, $session->status);
        $originalExpiry = $session->expires_at;

        // 2. Extend session
        $extendResponse = $this->actingAs($this->user)->postJson(
            "/sessions/{$sessionId}/extend",
            ['minutes' => 30]
        );

        $extendResponse->assertOk();
        $session->refresh();
        $this->assertTrue($session->expires_at->greaterThan($originalExpiry));

        // 3. Terminate session (sync termination → EXPIRED immediately)
        $terminateResponse = $this->actingAs($this->user)->deleteJson(
            "/sessions/{$sessionId}",
            ['stop_vm' => true]
        );

        $terminateResponse->assertOk();
        $session->refresh();
        $this->assertEquals(VMSessionStatus::EXPIRED, $session->status);
    }

    public function test_full_session_lifecycle_with_snapshot(): void
    {
        // Delete the setUp session to avoid quota conflicts
        $this->session->delete();

        // Register the VM for sync activation and termination
        $this->proxmoxFake->registerVM($this->node->name, 204, 'running', '10.0.0.204');

        // 1. Create session (sync activation → ACTIVE immediately)
        $createResponse = $this->actingAs($this->user)->postJson('/sessions', [
            'vmid' => 204,
            'node_id' => $this->node->id,
            'protocol' => 'rdp',
            'duration_minutes' => 120,
        ]);

        $createResponse->assertCreated();
        $sessionId = $createResponse->json('id');

        $session = VMSession::find($sessionId);
        $this->assertEquals(VMSessionStatus::ACTIVE, $session->status);

        // 2. Extend the session
        $extendResponse = $this->actingAs($this->user)->postJson(
            "/sessions/{$sessionId}/extend",
            ['minutes' => 60]
        );

        $extendResponse->assertOk();

        // 3. Terminate with snapshot revert
        $terminateResponse = $this->actingAs($this->user)->deleteJson(
            "/sessions/{$sessionId}",
            [
                'stop_vm' => true,
                'return_snapshot' => 'snap-session-123-initial',
            ]
        );

        $terminateResponse->assertOk();
        $session->refresh();
        $this->assertEquals(VMSessionStatus::EXPIRED, $session->status);
    }
}
