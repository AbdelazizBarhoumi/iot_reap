<?php

namespace Tests\Unit\Services;

use App\Models\Course;
use App\Models\User;
use App\Models\VMSession;
use App\Repositories\CourseStatsRepository;
use App\Services\AdminAnalyticsService;
use App\Services\SystemHealthService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Mockery\MockInterface;
use Tests\TestCase;

class AdminAnalyticsServiceTest extends TestCase
{
    use RefreshDatabase;

    private AdminAnalyticsService $service;

    private CourseStatsRepository|MockInterface $mockStatsRepository;

    private SystemHealthService|MockInterface $mockSystemHealthService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->mockStatsRepository = Mockery::mock(CourseStatsRepository::class);
        $this->mockSystemHealthService = Mockery::mock(SystemHealthService::class);

        $this->service = new AdminAnalyticsService(
            $this->mockStatsRepository,
            $this->mockSystemHealthService
        );

        // Create test data
        User::factory()->count(5)->create();
        Course::factory()->count(3)->create(['status' => 'approved']);
    }

    public function test_get_platform_kpis_returns_comprehensive_metrics(): void
    {
        // Act
        $result = $this->service->getPlatformKPIs('30d');

        // Assert
        $this->assertArrayHasKey('total_users', $result);
        $this->assertArrayHasKey('new_users', $result);
        $this->assertArrayHasKey('new_users_change', $result);
        $this->assertArrayHasKey('total_enrollments', $result);
        $this->assertArrayHasKey('enrollments_change', $result);
        $this->assertArrayHasKey('total_completions', $result);
        $this->assertArrayHasKey('completions_change', $result);
        $this->assertArrayHasKey('total_revenue', $result);
        $this->assertArrayHasKey('revenue_change', $result);
        $this->assertArrayHasKey('total_vm_sessions', $result);
        $this->assertArrayHasKey('vm_sessions_change', $result);
        $this->assertArrayHasKey('active_courses', $result);
        $this->assertArrayHasKey('certificates_issued', $result);
        $this->assertArrayHasKey('period', $result);

        $this->assertEquals('30d', $result['period']);
        $this->assertEquals(3, $result['active_courses']);
        $this->assertIsNumeric($result['total_revenue']);
    }

    public function test_get_chart_data_builds_complete_date_range(): void
    {
        // Act
        $result = $this->service->getChartData('7d');

        // Assert
        $this->assertIsArray($result);

        foreach ($result as $dayData) {
            $this->assertArrayHasKey('date', $dayData);
            $this->assertArrayHasKey('enrollments', $dayData);
            $this->assertArrayHasKey('revenue', $dayData);
            $this->assertArrayHasKey('vm_sessions', $dayData);
            $this->assertIsNumeric($dayData['enrollments']);
            $this->assertIsNumeric($dayData['revenue']);
            $this->assertIsNumeric($dayData['vm_sessions']);
        }
    }

    public function test_get_system_health_combines_vm_and_system_metrics(): void
    {
        // Arrange
        VMSession::factory()->count(3)->create(['status' => 'active']);
        Course::factory()->count(1)->create(['status' => 'pending_review']);
        User::factory()->count(1)->create(['suspended_at' => now()]);

        $systemHealthData = [
            'status' => 'healthy',
            'services' => [
                'proxmox' => 'online',
                'guacamole' => 'online',
            ],
            'metrics' => [
                'cpu_usage' => 45.2,
                'memory_usage' => 67.8,
            ],
            'timestamp' => now()->toISOString(),
        ];

        $this->mockSystemHealthService->shouldReceive('getSystemHealth')
            ->once()
            ->andReturn($systemHealthData);

        // Act
        $result = $this->service->getSystemHealth();

        // Assert
        $this->assertArrayHasKey('status', $result);
        $this->assertArrayHasKey('active_vm_sessions', $result);
        $this->assertArrayHasKey('pending_courses', $result);
        $this->assertArrayHasKey('suspended_users', $result);
        $this->assertArrayHasKey('services', $result);
        $this->assertArrayHasKey('metrics', $result);
        $this->assertArrayHasKey('timestamp', $result);

        $this->assertEquals('healthy', $result['status']);
        $this->assertEquals(3, $result['active_vm_sessions']);
        $this->assertEquals(1, $result['pending_courses']);
        $this->assertEquals(1, $result['suspended_users']);
        $this->assertEquals($systemHealthData['services'], $result['services']);
        $this->assertEquals($systemHealthData['metrics'], $result['metrics']);
    }
}
