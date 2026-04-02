<?php

namespace Tests\Unit\Services;

use App\Models\Course;
use App\Models\DailyCourseStats;
use App\Models\User;
use App\Repositories\CourseStatsRepository;
use App\Services\CourseAnalyticsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourseAnalyticsServiceManualTest extends TestCase
{
    use RefreshDatabase;

    public function test_service_with_manually_injected_repository(): void
    {
        $teacher = User::factory()->create();
        $course = Course::factory()->approved()->create(['instructor_id' => $teacher->id]);

        DailyCourseStats::factory()
            ->forDate(now()->subDays(3)->toDateString())
            ->create(['course_id' => $course->id, 'enrollments' => 10]);

        DailyCourseStats::factory()
            ->forDate(now()->subDays(5)->toDateString())
            ->create(['course_id' => $course->id, 'enrollments' => 15]);

        // Manually instantiate the repository and service
        $repo = new CourseStatsRepository(new DailyCourseStats());
        $service = new CourseAnalyticsService($repo);

        $kpis = $service->getTeacherKPIs($teacher, '30d');

        $this->assertEquals(25, $kpis['total_enrollments']);
    }

    public function test_service_with_app_resolve(): void
    {
        $teacher = User::factory()->create();
        $course = Course::factory()->approved()->create(['instructor_id' => $teacher->id]);

        DailyCourseStats::factory()
            ->forDate(now()->subDays(3)->toDateString())
            ->create(['course_id' => $course->id, 'enrollments' => 10]);

        DailyCourseStats::factory()
            ->forDate(now()->subDays(5)->toDateString())
            ->create(['course_id' => $course->id, 'enrollments' => 15]);

        // Use app() like the original test does
        $service = app(CourseAnalyticsService::class);

        $kpis = $service->getTeacherKPIs($teacher, '30d');

        $this->assertEquals(25, $kpis['total_enrollments']);
    }
}
