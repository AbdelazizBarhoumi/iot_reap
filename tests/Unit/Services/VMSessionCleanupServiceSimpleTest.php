<?php

namespace Tests\Unit\Services;

use App\Repositories\VMSessionRepository;
use App\Services\GuacamoleClientInterface;
use App\Services\VMSessionCleanupService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;
use Mockery;
use Tests\TestCase;

class VMSessionCleanupServiceSimpleTest extends TestCase
{
    private VMSessionCleanupService $service;

    private VMSessionRepository $vmSessionRepository;

    private GuacamoleClientInterface $guacamoleClient;

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

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
