<?php

namespace Tests\Unit\Services;

use App\Services\SystemHealthService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;
use Mockery;
use Tests\TestCase;

class SystemHealthServiceTest extends TestCase
{
    private SystemHealthService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new SystemHealthService;
    }

    public function test_get_system_health_returns_complete_health_status(): void
    {
        // Arrange - Mock all dependencies
        DB::shouldReceive('select')
            ->with('SELECT 1')
            ->andReturn([]);

        Cache::shouldReceive('put')
            ->andReturn(true);
        Cache::shouldReceive('get')
            ->andReturn('ok');
        Cache::shouldReceive('forget')
            ->andReturn(true);

        config(['queue.default' => 'sync']);
        config(['cache.default' => 'array']);

        // Mock DB table queries with flexible expectations
        DB::shouldReceive('table')
            ->andReturnSelf();
        DB::shouldReceive('where')
            ->andReturnSelf();
        DB::shouldReceive('count')
            ->andReturn(0);

        // Act
        $result = $this->service->getSystemHealth();

        // Assert
        $this->assertArrayHasKey('status', $result);
        $this->assertArrayHasKey('timestamp', $result);
        $this->assertArrayHasKey('services', $result);
        $this->assertArrayHasKey('metrics', $result);

        // System health status should be either 'healthy', 'warning', or 'critical'
        // It depends on actual disk usage, so we just verify it's one of the valid statuses
        $this->assertContains($result['status'], ['healthy', 'warning', 'critical']);
        
        $this->assertArrayHasKey('database', $result['services']);
        $this->assertArrayHasKey('cache', $result['services']);
        $this->assertArrayHasKey('queue', $result['services']);
        $this->assertArrayHasKey('storage', $result['services']);
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

    public function test_check_cache_returns_warning_on_mismatch(): void
    {
        // Arrange
        Cache::shouldReceive('put')
            ->once()
            ->andReturn(true);
        Cache::shouldReceive('get')
            ->once()
            ->andReturn('wrong-value');
        Cache::shouldReceive('forget')
            ->once()
            ->andReturn(true);

        config(['cache.default' => 'array']);

        // Act
        $result = $this->service->checkCache();

        // Assert
        $this->assertEquals('warning', $result['status']);
        $this->assertEquals('array', $result['driver']);
        $this->assertEquals('Cache read/write mismatch', $result['message']);
    }

    public function test_check_cache_returns_critical_on_exception(): void
    {
        // Arrange
        $exception = new \Exception('Redis connection failed');
        Cache::shouldReceive('put')
            ->once()
            ->andThrow($exception);

        Log::shouldReceive('error')
            ->once()
            ->with('Cache health check failed', ['error' => 'Redis connection failed']);

        config(['cache.default' => 'redis']);

        // Act
        $result = $this->service->checkCache();

        // Assert
        $this->assertEquals('critical', $result['status']);
        $this->assertNull($result['latency_ms']);
        $this->assertEquals('redis', $result['driver']);
        $this->assertEquals('Cache failed: Redis connection failed', $result['message']);
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

    public function test_check_queue_returns_healthy_for_redis_driver(): void
    {
        // Arrange
        config(['queue.default' => 'redis']);

        $connection = Mockery::mock();
        $connection->shouldReceive('ping')->once();

        Redis::shouldReceive('connection')
            ->with('default')
            ->once()
            ->andReturn($connection);

        // Act
        $result = $this->service->checkQueue();

        // Assert
        $this->assertEquals('healthy', $result['status']);
        $this->assertEquals('redis', $result['driver']);
        $this->assertEquals('Redis queue connection OK', $result['message']);
    }

    public function test_check_queue_returns_warning_for_database_with_many_failed_jobs(): void
    {
        // Arrange
        config(['queue.default' => 'database']);

        DB::shouldReceive('table')
            ->with('jobs')
            ->once()
            ->andReturnSelf();
        DB::shouldReceive('count')
            ->once()
            ->andReturn(5);

        DB::shouldReceive('table')
            ->with('failed_jobs')
            ->once()
            ->andReturnSelf();
        DB::shouldReceive('count')
            ->once()
            ->andReturn(15); // More than 10

        // Act
        $result = $this->service->checkQueue();

        // Assert
        $this->assertEquals('warning', $result['status']);
        $this->assertEquals('database', $result['driver']);
        $this->assertEquals(5, $result['pending_jobs']);
        $this->assertEquals(15, $result['failed_jobs']);
        $this->assertEquals('Pending: 5, Failed: 15', $result['message']);
    }

    public function test_check_queue_returns_healthy_for_database_with_few_failed_jobs(): void
    {
        // Arrange
        config(['queue.default' => 'database']);

        DB::shouldReceive('table')
            ->with('jobs')
            ->once()
            ->andReturnSelf();
        DB::shouldReceive('count')
            ->once()
            ->andReturn(3);

        DB::shouldReceive('table')
            ->with('failed_jobs')
            ->once()
            ->andReturnSelf();
        DB::shouldReceive('count')
            ->once()
            ->andReturn(5); // Less than or equal to 10

        // Act
        $result = $this->service->checkQueue();

        // Assert
        $this->assertEquals('healthy', $result['status']);
        $this->assertEquals('database', $result['driver']);
        $this->assertEquals(3, $result['pending_jobs']);
        $this->assertEquals(5, $result['failed_jobs']);
        $this->assertEquals('Pending: 3, Failed: 5', $result['message']);
    }

    public function test_check_queue_returns_unknown_for_unsupported_driver(): void
    {
        // Arrange
        config(['queue.default' => 'unknown-driver']);

        // Act
        $result = $this->service->checkQueue();

        // Assert
        $this->assertEquals('unknown', $result['status']);
        $this->assertEquals('unknown-driver', $result['driver']);
        $this->assertEquals('Unknown queue driver', $result['message']);
    }

    public function test_check_storage_returns_healthy_status(): void
    {
        // This test is hard to mock because disk_free_space and disk_total_space
        // are native PHP functions. We'll test the logic structure instead.

        // Act
        $result = $this->service->checkStorage();

        // Assert
        $this->assertArrayHasKey('status', $result);
        $this->assertArrayHasKey('message', $result);

        // The exact values depend on the actual disk space, but structure should be correct
        if ($result['status'] !== 'unknown') {
            $this->assertArrayHasKey('used_percent', $result);
            $this->assertArrayHasKey('free_gb', $result);
            $this->assertArrayHasKey('total_gb', $result);
        }
    }

    public function test_get_system_metrics_returns_complete_metrics(): void
    {
        // Arrange
        DB::shouldReceive('table')
            ->with('vm_sessions')
            ->once()
            ->andReturnSelf();
        DB::shouldReceive('where')
            ->with('status', 'active')
            ->once()
            ->andReturnSelf();
        DB::shouldReceive('count')
            ->once()
            ->andReturn(3);

        DB::shouldReceive('table')
            ->with('sessions')
            ->once()
            ->andReturnSelf();
        DB::shouldReceive('where')
            ->with('last_activity', '>=', Mockery::any())
            ->once()
            ->andReturnSelf();
        DB::shouldReceive('count')
            ->once()
            ->andReturn(7);

        DB::shouldReceive('table')
            ->with('jobs')
            ->once()
            ->andReturnSelf();
        DB::shouldReceive('count')
            ->once()
            ->andReturn(2);

        DB::shouldReceive('table')
            ->with('failed_jobs')
            ->once()
            ->andReturnSelf();
        DB::shouldReceive('count')
            ->once()
            ->andReturn(1);

        // Act
        $result = $this->service->getSystemMetrics();

        // Assert
        $this->assertArrayHasKey('php_memory', $result);
        $this->assertArrayHasKey('used_mb', $result['php_memory']);
        $this->assertArrayHasKey('peak_mb', $result['php_memory']);

        $this->assertEquals(3, $result['active_vm_sessions']);
        $this->assertEquals(7, $result['active_users']);

        $this->assertArrayHasKey('queue', $result);
        $this->assertEquals(2, $result['queue']['pending']);
        $this->assertEquals(1, $result['queue']['failed']);
    }

    public function test_get_system_metrics_handles_database_errors(): void
    {
        // Arrange
        DB::shouldReceive('table')
            ->andThrow(new \Exception('Database error'));

        // Act
        $result = $this->service->getSystemMetrics();

        // Assert - Should handle errors gracefully
        $this->assertArrayHasKey('php_memory', $result);
        $this->assertNull($result['active_vm_sessions']);
        $this->assertNull($result['active_users']);
        $this->assertNull($result['queue']);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
