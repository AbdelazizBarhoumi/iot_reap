<?php

namespace Tests\Unit;

use App\Enums\VMSessionStatus;
use App\Exceptions\GuacamoleApiException;
use App\Models\VMSession;
use App\Repositories\VMSessionRepository;
use App\Services\GuacamoleClientInterface;
use App\Services\VMSessionCleanupService;
use Illuminate\Support\Facades\Log;
use Mockery;
use Mockery\MockInterface;
use Tests\TestCase;

class VMSessionCleanupServiceTest extends TestCase
{
    private VMSessionCleanupService $service;

    private MockInterface $guacamoleMock;

    protected function setUp(): void
    {
        parent::setUp();

        $this->guacamoleMock = Mockery::mock(GuacamoleClientInterface::class);
        $this->app->instance(GuacamoleClientInterface::class, $this->guacamoleMock);

        $this->service = new VMSessionCleanupService(
            new VMSessionRepository,
            $this->guacamoleMock,
        );
    }

    // -------------------------------------------------------------------------
    // expireOverdueSessions() tests
    // -------------------------------------------------------------------------

    public function test_expire_overdue_sessions_marks_active_expired_sessions(): void
    {
        // Arrange: create overdue active session without Guacamole connection
        $session = VMSession::factory()->active()->create([
            'expires_at' => now()->subHour(),
            'guacamole_connection_id' => null,
        ]);

        // Act
        $expiredCount = $this->service->expireOverdueSessions();

        // Assert
        $this->assertEquals(1, $expiredCount);
        $this->assertEquals(VMSessionStatus::EXPIRED, $session->fresh()->status);
    }

    public function test_expire_overdue_sessions_cleans_guacamole_connections(): void
    {
        // Arrange: create overdue session with Guacamole connection
        $session = VMSession::factory()->active()->create([
            'expires_at' => now()->subHour(),
            'guacamole_connection_id' => 12345,
        ]);

        $this->guacamoleMock
            ->shouldReceive('deleteConnection')
            ->with('12345')
            ->once();

        // Act
        $expiredCount = $this->service->expireOverdueSessions();

        // Assert
        $this->assertEquals(1, $expiredCount);
        $this->assertNull($session->fresh()->guacamole_connection_id);
        $this->assertEquals(VMSessionStatus::EXPIRED, $session->fresh()->status);
    }

    public function test_expire_overdue_sessions_handles_multiple_sessions(): void
    {
        // Arrange: create multiple overdue sessions
        $session1 = VMSession::factory()->active()->create([
            'expires_at' => now()->subHours(2),
            'guacamole_connection_id' => 111,
        ]);
        $session2 = VMSession::factory()->active()->create([
            'expires_at' => now()->subHour(),
            'guacamole_connection_id' => 222,
        ]);
        $session3 = VMSession::factory()->pending()->create([
            'expires_at' => now()->subMinutes(30),
            'guacamole_connection_id' => null,
        ]);

        $this->guacamoleMock
            ->shouldReceive('deleteConnection')
            ->with('111')
            ->once();
        $this->guacamoleMock
            ->shouldReceive('deleteConnection')
            ->with('222')
            ->once();

        // Act
        $expiredCount = $this->service->expireOverdueSessions();

        // Assert
        $this->assertEquals(3, $expiredCount);
        $this->assertEquals(VMSessionStatus::EXPIRED, $session1->fresh()->status);
        $this->assertEquals(VMSessionStatus::EXPIRED, $session2->fresh()->status);
        $this->assertEquals(VMSessionStatus::EXPIRED, $session3->fresh()->status);
    }

    public function test_expire_overdue_sessions_ignores_non_expired_sessions(): void
    {
        // Arrange: create session that hasn't expired yet
        $activeSession = VMSession::factory()->active()->create([
            'expires_at' => now()->addHours(2),
            'guacamole_connection_id' => 999,
        ]);

        $this->guacamoleMock->shouldNotReceive('deleteConnection');

        // Act
        $expiredCount = $this->service->expireOverdueSessions();

        // Assert
        $this->assertEquals(0, $expiredCount);
        $this->assertEquals(VMSessionStatus::ACTIVE, $activeSession->fresh()->status);
        $this->assertEquals(999, $activeSession->fresh()->guacamole_connection_id);
    }

    public function test_expire_overdue_sessions_ignores_already_expired_sessions(): void
    {
        // Arrange: create session already in expired status
        $expiredSession = VMSession::factory()->expired()->create([
            'guacamole_connection_id' => null,
        ]);

        $this->guacamoleMock->shouldNotReceive('deleteConnection');

        // Act
        $expiredCount = $this->service->expireOverdueSessions();

        // Assert
        $this->assertEquals(0, $expiredCount);
    }

    public function test_expire_overdue_sessions_continues_on_guacamole_failure(): void
    {
        // Arrange: two overdue sessions, first Guacamole cleanup fails
        $session1 = VMSession::factory()->active()->create([
            'expires_at' => now()->subHour(),
            'guacamole_connection_id' => 111,
        ]);
        $session2 = VMSession::factory()->active()->create([
            'expires_at' => now()->subHour(),
            'guacamole_connection_id' => 222,
        ]);

        $this->guacamoleMock
            ->shouldReceive('deleteConnection')
            ->with('111')
            ->once()
            ->andThrow(new GuacamoleApiException('Connection not found'));

        $this->guacamoleMock
            ->shouldReceive('deleteConnection')
            ->with('222')
            ->once();

        Log::shouldReceive('warning')->once();
        Log::shouldReceive('debug')->once();
        Log::shouldReceive('info')->once();

        // Act
        $expiredCount = $this->service->expireOverdueSessions();

        // Assert: both sessions expired despite first cleanup failing
        $this->assertEquals(2, $expiredCount);
        $this->assertEquals(VMSessionStatus::EXPIRED, $session1->fresh()->status);
        $this->assertEquals(VMSessionStatus::EXPIRED, $session2->fresh()->status);
        // First session keeps its connection ID (cleanup failed)
        $this->assertEquals(111, $session1->fresh()->guacamole_connection_id);
        // Second session has connection cleared
        $this->assertNull($session2->fresh()->guacamole_connection_id);
    }

    public function test_expire_overdue_sessions_returns_zero_when_none_overdue(): void
    {
        // Arrange: no sessions at all
        $this->guacamoleMock->shouldNotReceive('deleteConnection');

        // Act
        $expiredCount = $this->service->expireOverdueSessions();

        // Assert
        $this->assertEquals(0, $expiredCount);
    }

    public function test_expire_overdue_sessions_handles_provisioning_status(): void
    {
        // Arrange: overdue session still in provisioning status
        $session = VMSession::factory()->provisioning()->create([
            'expires_at' => now()->subHour(),
            'guacamole_connection_id' => null,
        ]);

        // Act
        $expiredCount = $this->service->expireOverdueSessions();

        // Assert
        $this->assertEquals(1, $expiredCount);
        $this->assertEquals(VMSessionStatus::EXPIRED, $session->fresh()->status);
    }

    // -------------------------------------------------------------------------
    // cleanupSessionGuacamole() tests
    // -------------------------------------------------------------------------

    public function test_cleanup_session_guacamole_removes_connection(): void
    {
        // Arrange
        $session = VMSession::factory()->active()->create([
            'guacamole_connection_id' => 54321,
        ]);

        $this->guacamoleMock
            ->shouldReceive('deleteConnection')
            ->with('54321')
            ->once();

        // Act
        $result = $this->service->cleanupSessionGuacamole($session->id);

        // Assert
        $this->assertTrue($result);
        $this->assertNull($session->fresh()->guacamole_connection_id);
    }

    public function test_cleanup_session_guacamole_returns_false_for_nonexistent_session(): void
    {
        // Arrange
        $this->guacamoleMock->shouldNotReceive('deleteConnection');

        // Act
        $result = $this->service->cleanupSessionGuacamole('nonexistent-id');

        // Assert
        $this->assertFalse($result);
    }

    public function test_cleanup_session_guacamole_returns_false_when_no_connection(): void
    {
        // Arrange: session exists but has no Guacamole connection
        $session = VMSession::factory()->pending()->create([
            'guacamole_connection_id' => null,
        ]);

        $this->guacamoleMock->shouldNotReceive('deleteConnection');

        // Act
        $result = $this->service->cleanupSessionGuacamole($session->id);

        // Assert
        $this->assertFalse($result);
    }

    public function test_cleanup_session_guacamole_returns_false_on_api_failure(): void
    {
        // Arrange
        $session = VMSession::factory()->active()->create([
            'guacamole_connection_id' => 99999,
        ]);

        $this->guacamoleMock
            ->shouldReceive('deleteConnection')
            ->with('99999')
            ->once()
            ->andThrow(new GuacamoleApiException('Server error'));

        Log::shouldReceive('error')->once();

        // Act
        $result = $this->service->cleanupSessionGuacamole($session->id);

        // Assert
        $this->assertFalse($result);
        // Connection ID should remain (cleanup failed)
        $this->assertEquals(99999, $session->fresh()->guacamole_connection_id);
    }

    public function test_cleanup_session_guacamole_logs_success(): void
    {
        // Arrange
        $session = VMSession::factory()->active()->create([
            'guacamole_connection_id' => 11111,
        ]);

        $this->guacamoleMock
            ->shouldReceive('deleteConnection')
            ->with('11111')
            ->once();

        Log::shouldReceive('info')
            ->once()
            ->withArgs(function ($message, $context) use ($session) {
                return $message === 'Guacamole connection manually cleaned up'
                    && $context['session_id'] === $session->id;
            });

        // Act
        $result = $this->service->cleanupSessionGuacamole($session->id);

        // Assert
        $this->assertTrue($result);
    }
}
