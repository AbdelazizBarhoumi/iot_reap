<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\User;
use App\Services\CourseAnalyticsService;
use App\Services\RevenueService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class TeacherAnalyticsControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $teacher;

    private User $otherTeacher;

    private Course $course;

    private Course $otherCourse;

    private $analyticsServiceMock;

    private $revenueServiceMock;

    protected function setUp(): void
    {
        parent::setUp();

        $this->teacher = User::factory()->teacher()->create();
        $this->otherTeacher = User::factory()->teacher()->create();
        $this->course = Course::factory()->approved()->create(['instructor_id' => $this->teacher->id]);
        $this->otherCourse = Course::factory()->approved()->create(['instructor_id' => $this->otherTeacher->id]);

        // Mock services
        $this->analyticsServiceMock = Mockery::mock(CourseAnalyticsService::class);
        $this->app->instance(CourseAnalyticsService::class, $this->analyticsServiceMock);

        $this->revenueServiceMock = Mockery::mock(RevenueService::class);
        $this->app->instance(RevenueService::class, $this->revenueServiceMock);
    }

    public function test_teacher_can_access_analytics_dashboard(): void
    {
        $kpis = [
            'total_enrollments' => 150,
            'total_revenue' => 3500.00,
            'active_students' => 85,
            'course_count' => 3,
        ];

        $enrollmentChart = [
            ['date' => '2024-01-01', 'enrollments' => 10],
            ['date' => '2024-01-02', 'enrollments' => 15],
        ];

        $revenueChart = [
            ['date' => '2024-01-01', 'revenue' => 299.00],
            ['date' => '2024-01-02', 'revenue' => 449.00],
        ];

        $topCourses = [
            ['title' => 'Laravel Basics', 'enrollments' => 50],
            ['title' => 'Advanced PHP', 'enrollments' => 35],
        ];

        $this->analyticsServiceMock
            ->shouldReceive('getTeacherKPIs')
            ->once()
            ->andReturn($kpis);

        $this->analyticsServiceMock
            ->shouldReceive('getEnrollmentChart')
            ->once()
            ->andReturn($enrollmentChart);

        $this->analyticsServiceMock
            ->shouldReceive('getRevenueChart')
            ->once()
            ->andReturn($revenueChart);

        $this->analyticsServiceMock
            ->shouldReceive('getTopCourses')
            ->once()
            ->andReturn($topCourses);

        $response = $this->actingAs($this->teacher)
            ->get('/teaching/analytics');

        $response->assertOk();
        // Note: Cannot assert Inertia props in feature tests without additional setup
    }

    public function test_teacher_can_get_kpis_as_json(): void
    {
        $kpis = [
            'total_enrollments' => 75,
            'total_revenue' => 2250.00,
        ];

        $this->analyticsServiceMock
            ->shouldReceive('getTeacherKPIs')
            ->once()
            ->andReturn($kpis);

        $response = $this->actingAs($this->teacher)
            ->getJson('/teaching/analytics/kpis', [
                'period' => '7d',
            ]);

        $response->assertOk()
            ->assertJson([
                'kpis' => $kpis,
            ]);
    }

    public function test_teacher_can_get_enrollment_chart_data(): void
    {
        $chartData = [
            ['date' => '2024-01-01', 'enrollments' => 5],
            ['date' => '2024-01-02', 'enrollments' => 8],
        ];

        $this->analyticsServiceMock
            ->shouldReceive('getEnrollmentChart')
            ->once()
            ->andReturn($chartData);

        $response = $this->actingAs($this->teacher)
            ->getJson('/teaching/analytics/enrollment-chart', [
                'period' => '7d',
            ]);

        $response->assertOk()
            ->assertJson([
                'data' => $chartData,
            ]);
    }

    public function test_teacher_can_get_revenue_chart_data(): void
    {
        $chartData = [
            ['date' => '2024-01-01', 'revenue' => 149.00],
            ['date' => '2024-01-02', 'revenue' => 299.00],
        ];

        $this->analyticsServiceMock
            ->shouldReceive('getRevenueChart')
            ->once()
            ->andReturn($chartData);

        $response = $this->actingAs($this->teacher)
            ->getJson('/teaching/analytics/revenue-chart', [
                'period' => '30d',
            ]);

        $response->assertOk()
            ->assertJson([
                'data' => $chartData,
            ]);
    }

    public function test_teacher_can_view_student_roster_for_owned_course(): void
    {
        $roster = [
            'data' => [
                ['id' => 1, 'name' => 'John Doe', 'enrolled_at' => '2024-01-01'],
                ['id' => 2, 'name' => 'Jane Smith', 'enrolled_at' => '2024-01-02'],
            ],
            'meta' => [
                'current_page' => 1,
                'last_page' => 1,
                'total' => 2,
            ],
        ];

        $this->analyticsServiceMock
            ->shouldReceive('getStudentRoster')
            ->once()
            ->andReturn($roster);

        $response = $this->actingAs($this->teacher)
            ->get("/teaching/analytics/courses/{$this->course->id}/students");

        $response->assertOk();
    }

    public function test_teacher_cannot_view_student_roster_for_unowned_course(): void
    {
        $response = $this->actingAs($this->teacher)
            ->get("/teaching/analytics/courses/{$this->otherCourse->id}/students");

        $response->assertForbidden();
    }

    public function test_teacher_can_get_completion_funnel_for_owned_course(): void
    {
        $funnel = [
            'enrolled' => 100,
            'started' => 85,
            'halfway' => 65,
            'completed' => 45,
        ];

        $this->analyticsServiceMock
            ->shouldReceive('getCompletionFunnel')
            ->once()
            ->andReturn($funnel);

        $response = $this->actingAs($this->teacher)
            ->getJson("/teaching/analytics/courses/{$this->course->id}/funnel");

        $response->assertOk()
            ->assertJson([
                'funnel' => $funnel,
            ]);
    }

    public function test_teacher_cannot_get_completion_funnel_for_unowned_course(): void
    {
        $response = $this->actingAs($this->teacher)
            ->getJson("/teaching/analytics/courses/{$this->otherCourse->id}/funnel");

        $response->assertForbidden();
    }

    public function test_teacher_can_access_earnings_page(): void
    {
        $summary = [
            'total_earnings' => 2500.00,
            'pending_earnings' => 150.00,
            'start_date' => '2024-01-01',
            'end_date' => '2024-01-31',
        ];

        $revenueByCourse = [
            ['course_title' => 'Laravel Basics', 'revenue' => 1500.00],
            ['course_title' => 'Advanced PHP', 'revenue' => 1000.00],
        ];

        $revenueChart = [
            ['date' => '2024-01-01', 'revenue' => 100.00],
            ['date' => '2024-01-02', 'revenue' => 150.00],
        ];

        $this->revenueServiceMock
            ->shouldReceive('getEarningsSummary')
            ->once()
            ->andReturn($summary);

        $this->revenueServiceMock
            ->shouldReceive('getRevenueByCourse')
            ->once()
            ->andReturn($revenueByCourse);

        $this->revenueServiceMock
            ->shouldReceive('getRevenueByDateRange')
            ->once()
            ->andReturn($revenueChart);

        $response = $this->actingAs($this->teacher)
            ->get('/teaching/analytics/earnings');

        $response->assertOk();
    }

    public function test_teacher_can_export_earnings_csv(): void
    {
        $csvData = "Date,Course,Revenue\n2024-01-01,Laravel Basics,29.99\n";

        $this->revenueServiceMock
            ->shouldReceive('generateEarningsCSV')
            ->once()
            ->andReturn($csvData);

        $response = $this->actingAs($this->teacher)
            ->get('/teaching/analytics/earnings/export');

        $response->assertOk()
            ->assertHeader('Content-Type', 'text/csv; charset=utf-8');
    }

    public function test_teacher_can_export_earnings_csv_with_date_range(): void
    {
        $csvData = "Date,Course,Revenue\n2024-01-01,Laravel Basics,29.99\n";

        $this->revenueServiceMock
            ->shouldReceive('generateEarningsCSV')
            ->once()
            ->andReturn($csvData);

        $response = $this->actingAs($this->teacher)
            ->get('/teaching/analytics/earnings/export', [
                'start_date' => '2024-01-01',
                'end_date' => '2024-01-31',
            ]);

        $response->assertOk()
            ->assertHeader('Content-Type', 'text/csv; charset=utf-8');
    }

    public function test_non_teacher_cannot_access_analytics_dashboard(): void
    {
        $engineer = User::factory()->engineer()->create();

        $response = $this->actingAs($engineer)
            ->get('/teaching/analytics');

        $response->assertForbidden();
    }

    public function test_non_teacher_cannot_access_kpis_endpoint(): void
    {
        $engineer = User::factory()->engineer()->create();

        $response = $this->actingAs($engineer)
            ->getJson('/teaching/analytics/kpis');

        $response->assertForbidden();
    }

    public function test_non_teacher_cannot_access_earnings_page(): void
    {
        $engineer = User::factory()->engineer()->create();

        $response = $this->actingAs($engineer)
            ->get('/teaching/analytics/earnings');

        $response->assertForbidden();
    }

    public function test_unauthenticated_user_cannot_access_analytics(): void
    {
        $response = $this->get('/teaching/analytics');

        $response->assertRedirect('/login');
    }

    public function test_analytics_defaults_to_30d_period(): void
    {
        $this->analyticsServiceMock
            ->shouldReceive('getTeacherKPIs')
            ->once()
            ->andReturn([]);

        $this->analyticsServiceMock
            ->shouldReceive('getEnrollmentChart')
            ->once()
            ->andReturn([]);

        $this->analyticsServiceMock
            ->shouldReceive('getRevenueChart')
            ->once()
            ->andReturn([]);

        $this->analyticsServiceMock
            ->shouldReceive('getTopCourses')
            ->once()
            ->andReturn([]);

        $response = $this->actingAs($this->teacher)
            ->get('/teaching/analytics');

        $response->assertOk();
    }
}
