<?php

namespace Tests\Unit\Services;

use App\Models\Course;
use App\Models\DailyCourseStats;
use App\Models\User;
use App\Repositories\CourseStatsRepository;
use App\Services\CourseAnalyticsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DebugServiceCallTest extends TestCase
{
    use RefreshDatabase;

    public function test_debug_service_call(): void
    {
        $teacher = User::factory()->create();
        $course = Course::factory()->approved()->create(['instructor_id' => $teacher->id]);

        echo "\n\nTeacher ID: $teacher->id\n";
        echo "Course ID: $course->id\n";
        echo "Course instructor_id: $course->instructor_id\n";

        $date1 = now()->subDays(3)->toDateString();
        $date2 = now()->subDays(5)->toDateString();

        echo "Creating stats for dates: $date1 and $date2\n";

        DailyCourseStats::factory()
            ->forDate($date1)
            ->create(['course_id' => $course->id, 'enrollments' => 10]);

        DailyCourseStats::factory()
            ->forDate($date2)
            ->create(['course_id' => $course->id, 'enrollments' => 15]);

        $startDate = now()->subDays(29)->toDateString();
        $endDate = now()->toDateString();

        // Try calling sum on ::query()
        echo "\nTesting ::query()->join()->sum():\n";
        $result1 = DailyCourseStats::query()
            ->join('courses', 'daily_course_stats.course_id', '=', 'courses.id')
            ->where('courses.instructor_id', $teacher->id)
            ->whereBetween('daily_course_stats.date', [$startDate, $endDate])
            ->sum('daily_course_stats.enrollments');
        echo "Result: $result1\n";

        // Try calling get first
        echo "\nTesting ::query()->join()->get():\n";
        $results = DailyCourseStats::query()
            ->join('courses', 'daily_course_stats.course_id', '=', 'courses.id')
            ->where('courses.instructor_id', $teacher->id)
            ->whereBetween('daily_course_stats.date', [$startDate, $endDate])
            ->get();
        echo "Result count: " . $results->count() . "\n";

        // Try a different approach - store query first
        echo "\nTesting stored query builder->sum():\n";
        $query = DailyCourseStats::query()
            ->join('courses', 'daily_course_stats.course_id', '=', 'courses.id')
            ->where('courses.instructor_id', $teacher->id)
            ->whereBetween('daily_course_stats.date', [$startDate, $endDate]);
        $result2 = $query->sum('daily_course_stats.enrollments');
        echo "Result: $result2\n";

        $this->assertEquals(25, $result1);
    }
}
