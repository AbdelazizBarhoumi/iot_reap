<?php

namespace Tests\Unit\Services;

use App\Enums\VMSessionStatus;
use App\Models\ProxmoxNode;
use App\Models\ProxmoxServer;
use App\Models\User;
use App\Models\VMSession;
use App\Services\ExtendSessionService;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

/**
 * Unit tests for session extension service.
 */
class ExtendSessionServiceTest extends TestCase
{
    private ExtendSessionService $service;

    private User $user;

    private VMSession $session;

    protected function setUp(): void
    {
        parent::setUp();

        Queue::fake();

        $this->service = new ExtendSessionService();

        $this->user = User::factory()->create();

        $server = ProxmoxServer::factory()->create();
        $node = ProxmoxNode::factory()->create();
        $this->session = VMSession::factory()->create([
            'user_id' => $this->user->id,
            'node_id' => $node->id,
            'status' => VMSessionStatus::ACTIVE,
            'expires_at' => now()->addHours(2),
            'vm_id' => 100,
        ]);
    }

    public function test_extend_session_adds_exact_requested_minutes(): void
    {
        $originalExpiry = $this->session->expires_at;
        $minutesToAdd = 45;

        $extended = $this->service->extend($this->session, $minutesToAdd);

        $expectedExpiry = $originalExpiry->addMinutes($minutesToAdd);
        $this->assertTrue(
            $extended->expires_at->equalTo($expectedExpiry),
            'Session was not extended by exact requested minutes'
        );
    }

    public function test_extend_updates_database(): void
    {
        $originalExpiry = $this->session->expires_at;
        $minutesToAdd = 30;

        $this->service->extend($this->session, $minutesToAdd);

        $refreshedSession = VMSession::find($this->session->id);
        $this->assertTrue(
            $refreshedSession->expires_at->greaterThan($originalExpiry)
        );
    }

    public function test_extend_fails_for_non_active_sessions(): void
    {
        $this->session->update(['status' => VMSessionStatus::EXPIRED]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Cannot extend session with status');

        $this->service->extend($this->session, 30);
    }

    public function test_extend_returns_updated_session(): void
    {
        $originalExpiry = $this->session->expires_at;
        $extended = $this->service->extend($this->session, 30);

        $this->assertInstanceOf(VMSession::class, $extended);
        $this->assertEquals($this->session->id, $extended->id);
        $this->assertTrue($extended->expires_at->greaterThan($originalExpiry), 'Expires_at should be greater than original');
    }

    public function test_extend_allows_multiple_incremental_extensions(): void
    {
        $originalExpiry = $this->session->expires_at;

        // First extension
        $this->service->extend($this->session, 30);
        $firstExpiry = $this->session->expires_at;

        // Second extension
        $this->service->extend($this->session, 30);
        $secondExpiry = $this->session->expires_at;

        $expectedExpiry = $originalExpiry->addMinutes(60);
        $this->assertTrue($secondExpiry->equalTo($expectedExpiry));
    }
}
