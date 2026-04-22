<?php

namespace Tests\Unit\Services;

use App\Models\VMSession;
use App\Repositories\VMSessionRepository;
use App\Services\GuacamoleClientInterface;
use App\Services\VMSessionCleanupService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Log;
use Mockery;

class VMSessionCleanupServiceTest extends BaseTestCase
{
    private VMSessionCleanupService $service;

    private VMSessionRepository|Mockery\MockInterface $vmSessionRepository;

    private GuacamoleClientInterface|Mockery\MockInterface $guacamoleClient;

    protected function setUp(): void
    {
        parent::setUp();

        $this->vmSessionRepository = Mockery::mock(VMSessionRepository::class);
        $this->guacamoleClient = Mockery::mock(GuacamoleClientInterface::class);

        $this->service = new VMSessionCleanupService(
            $this->vmSessionRepository,
            $this->guacamoleClient
        );
    }

    public function test_expire_overdue_sessions_marks_sessions_as_expired(): void
    {
        // Arrange
        $this->vmSessionRepository
            ->shouldReceive('findOverdueWithGuacamoleConnections')
            ->once()
            ->andReturn(new Collection);

        $this->vmSessionRepository
            ->shouldReceive('markOverdueAsExpired')
            ->once()
            ->andReturn(3);

        Log::shouldReceive('info')
            ->once()
            ->with('VM sessions expired', ['count' => 3]);

        // Act
        $result = $this->service->expireOverdueSessions();

        // Assert
        $this->assertEquals(3, $result);
    }

    public function test_expire_overdue_sessions_cleans_up_guacamole_connections(): void
    {
        // Arrange
        $session1 = Mockery::mock();
        $session1->id = 'session-1';
        $session1->guacamole_connection_id = 'conn-123';
        $session1->shouldReceive('update')->with(['guacamole_connection_id' => null])->once();

        $session2 = Mockery::mock();
        $session2->id = 'session-2';
        $session2->guacamole_connection_id = 'conn-456';
        $session2->shouldReceive('update')->with(['guacamole_connection_id' => null])->once();

        $this->vmSessionRepository
            ->shouldReceive('findOverdueWithGuacamoleConnections')
            ->once()
            ->andReturn(new Collection([$session1, $session2]));

        $this->guacamoleClient
            ->shouldReceive('deleteConnection')
            ->with('conn-123')
            ->once();

        $this->guacamoleClient
            ->shouldReceive('deleteConnection')
            ->with('conn-456')
            ->once();

        $this->vmSessionRepository
            ->shouldReceive('markOverdueAsExpired')
            ->once()
            ->andReturn(2);

        Log::shouldReceive('debug')
            ->twice()
            ->withArgs(function ($message, $context) {
                return $message === 'Guacamole connection cleaned up' &&
                    isset($context['session_id']) &&
                    isset($context['connection_id']);
            });

        Log::shouldReceive('info')
            ->once()
            ->with('VM sessions expired', ['count' => 2]);

        // Act
        $result = $this->service->expireOverdueSessions();

        // Assert
        $this->assertEquals(2, $result);
    }

    public function test_expire_overdue_sessions_continues_on_guacamole_failure(): void
    {
        // Arrange
        $session = (object) [
            'id' => 'session-1',
            'guacamole_connection_id' => 'conn-123',
            'update' => function ($data) { /* Mock update */
            },
        ];

        $this->vmSessionRepository
            ->shouldReceive('findOverdueWithGuacamoleConnections')
            ->once()
            ->andReturn(new Collection([$session]));

        $this->guacamoleClient
            ->shouldReceive('deleteConnection')
            ->with('conn-123')
            ->once()
            ->andThrow(new \Exception('Guacamole API error'));

        $this->vmSessionRepository
            ->shouldReceive('markOverdueAsExpired')
            ->once()
            ->andReturn(1);

        Log::shouldReceive('warning')
            ->once()
            ->withArgs(function ($message, $context) {
                return $message === 'Guacamole cleanup failed during expiration' &&
                    $context['session_id'] === 'session-1' &&
                    $context['connection_id'] === 'conn-123' &&
                    $context['error'] === 'Guacamole API error';
            });

        Log::shouldReceive('info')
            ->once()
            ->with('VM sessions expired', ['count' => 1]);

        // Act
        $result = $this->service->expireOverdueSessions();

        // Assert
        $this->assertEquals(1, $result);
    }

    public function test_expire_overdue_sessions_logs_nothing_when_no_sessions_expired(): void
    {
        // Arrange
        $this->vmSessionRepository
            ->shouldReceive('findOverdueWithGuacamoleConnections')
            ->once()
            ->andReturn(new Collection);

        $this->vmSessionRepository
            ->shouldReceive('markOverdueAsExpired')
            ->once()
            ->andReturn(0);

        Log::shouldReceive('info')
            ->never();

        // Act
        $result = $this->service->expireOverdueSessions();

        // Assert
        $this->assertEquals(0, $result);
    }

    public function test_cleanup_session_guacamole_succeeds_when_session_has_connection(): void
    {
        // Arrange
        $session = Mockery::mock(VMSession::class)->shouldIgnoreMissing();
        $session->shouldReceive('offsetGet')
            ->with('id')
            ->andReturn('session-1');
        $session->shouldReceive('offsetGet')
            ->with('guacamole_connection_id')
            ->andReturn('conn-123');
        $session->shouldReceive('getAttribute')
            ->with('id')
            ->andReturn('session-1');
        $session->shouldReceive('getAttribute')
            ->with('guacamole_connection_id')
            ->andReturn('conn-123');
        $session->id = 'session-1';
        $session->guacamole_connection_id = 'conn-123';
        $session->shouldReceive('update')
            ->with(['guacamole_connection_id' => null])
            ->once()
            ->andReturn(true);

        $this->vmSessionRepository
            ->shouldReceive('findById')
            ->with('session-1')
            ->once()
            ->andReturn($session);

        $this->guacamoleClient
            ->shouldReceive('deleteConnection')
            ->with('conn-123')
            ->once();

        Log::shouldReceive('info')
            ->once()
            ->with('Guacamole connection manually cleaned up', ['session_id' => 'session-1']);

        // Act
        $result = $this->service->cleanupSessionGuacamole('session-1');

        // Assert
        $this->assertTrue($result);
    }

    public function test_cleanup_session_guacamole_returns_false_when_session_not_found(): void
    {
        // Arrange
        $this->vmSessionRepository
            ->shouldReceive('findById')
            ->with('invalid-session')
            ->once()
            ->andReturn(null);

        Log::shouldReceive('info')
            ->never();

        // Act
        $result = $this->service->cleanupSessionGuacamole('invalid-session');

        // Assert
        $this->assertFalse($result);
    }

    public function test_cleanup_session_guacamole_returns_false_when_no_connection_id(): void
    {
        // Arrange
        $session = Mockery::mock(VMSession::class)->shouldIgnoreMissing();
        $session->id = 'session-1';
        $session->guacamole_connection_id = null;

        $this->vmSessionRepository
            ->shouldReceive('findById')
            ->with('session-1')
            ->once()
            ->andReturn($session);

        Log::shouldReceive('info')
            ->never();

        // Act
        $result = $this->service->cleanupSessionGuacamole('session-1');

        // Assert
        $this->assertFalse($result);
    }

    public function test_cleanup_session_guacamole_handles_api_failure(): void
    {
        // Arrange
        $session = Mockery::mock(VMSession::class)->shouldIgnoreMissing();
        $session->shouldReceive('offsetGet')
            ->with('id')
            ->andReturn('session-1');
        $session->shouldReceive('offsetGet')
            ->with('guacamole_connection_id')
            ->andReturn('conn-123');
        $session->shouldReceive('getAttribute')
            ->with('id')
            ->andReturn('session-1');
        $session->shouldReceive('getAttribute')
            ->with('guacamole_connection_id')
            ->andReturn('conn-123');
        $session->id = 'session-1';
        $session->guacamole_connection_id = 'conn-123';

        $this->vmSessionRepository
            ->shouldReceive('findById')
            ->with('session-1')
            ->once()
            ->andReturn($session);

        $this->guacamoleClient
            ->shouldReceive('deleteConnection')
            ->with('conn-123')
            ->once()
            ->andThrow(new \Exception('Connection already deleted'));

        Log::shouldReceive('error')
            ->once()
            ->withArgs(function ($message, $context) {
                return $message === 'Manual Guacamole cleanup failed' &&
                    $context['session_id'] === 'session-1' &&
                    $context['error'] === 'Connection already deleted';
            });

        // Act
        $result = $this->service->cleanupSessionGuacamole('session-1');

        // Assert
        $this->assertFalse($result);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
