<?php

namespace Tests\Unit\Services;

use App\Services\SystemHealthService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Mockery;
use Tests\TestCase;

class SystemHealthServiceSimpleTest extends TestCase
{
    private SystemHealthService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new SystemHealthService;
    }

    public function test_check_database_returns_healthy_status_on_success(): void
    {
        // Arrange
        DB::shouldReceive('select')
            ->with('SELECT 1')
            ->once()
            ->andReturn([]);

        // Act
        $result = $this->service->checkDatabase();

        // Assert
        $this->assertEquals('healthy', $result['status']);
        $this->assertArrayHasKey('latency_ms', $result);
        $this->assertEquals('Database connection OK', $result['message']);
    }

    public function test_check_database_returns_critical_status_on_failure(): void
    {
        // Arrange
        $exception = new \Exception('Connection refused');
        DB::shouldReceive('select')
            ->with('SELECT 1')
            ->once()
            ->andThrow($exception);

        Log::shouldReceive('error')
            ->once()
            ->with('Database health check failed', ['error' => 'Connection refused']);

        // Act
        $result = $this->service->checkDatabase();

        // Assert
        $this->assertEquals('critical', $result['status']);
        $this->assertNull($result['latency_ms']);
        $this->assertEquals('Database connection failed: Connection refused', $result['message']);
    }

    public function test_check_cache_returns_healthy_status_on_success(): void
    {
        // Arrange
        Cache::shouldReceive('put')
            ->once()
            ->andReturn(true);
        Cache::shouldReceive('get')
            ->once()
            ->andReturn('ok');
        Cache::shouldReceive('forget')
            ->once()
            ->andReturn(true);

        config(['cache.default' => 'redis']);

        // Act
        $result = $this->service->checkCache();

        // Assert
        $this->assertEquals('healthy', $result['status']);
        $this->assertArrayHasKey('latency_ms', $result);
        $this->assertEquals('redis', $result['driver']);
        $this->assertEquals('Cache read/write OK', $result['message']);
    }

    public function test_check_queue_returns_healthy_for_sync_driver(): void
    {
        // Arrange
        config(['queue.default' => 'sync']);

        // Act
        $result = $this->service->checkQueue();

        // Assert
        $this->assertEquals('healthy', $result['status']);
        $this->assertEquals('sync', $result['driver']);
        $this->assertEquals('Sync queue (no workers needed)', $result['message']);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
