<?php

namespace Tests\Unit\Services;

use App\Models\Course;
use App\Models\DailyCourseStats;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DataVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_data_can_be_queried_after_creation(): void
    {
        $teacher = User::factory()->create();
        $course = Course::factory()->approved()->create(['instructor_id' => $teacher->id]);

        DailyCourseStats::factory()
            ->forDate(now()->subDays(3)->toDateString())
            ->create(['course_id' => $course->id, 'enrollments' => 10]);

        // Verify data exists
        $allStats = DailyCourseStats::all();
        $this->assertGreaterThan(0, $allStats->count(), 'Stats should exist');

        $allCourses = Course::all();
        $this->assertGreaterThan(0, $allCourses->count(), 'Courses should exist');

        $statsForCourse = DailyCourseStats::where('course_id', $course->id)->get();
        $this->assertGreaterThan(0, $statsForCourse->count(), 'Stats for course should exist');

        $thisTeacherCourses = Course::where('instructor_id', $teacher->id)->get();
        $this->assertGreaterThan(0, $thisTeacherCourses->count(), 'Courses for teacher should exist');

        // Now test the JOIN
        $statsWithCourses = DailyCourseStats::join('courses', 'daily_course_stats.course_id', '=', 'courses.id')
            ->where('courses.instructor_id', $teacher->id)
            ->get();

        $this->assertGreaterThan(0, $statsWithCourses->count(), 'Stats with course JOIN should exist');

        // Now test with date range
        $startDate = now()->subDays(29)->toDateString();
        $endDate = now()->toDateString();

        $statsWithDateRange = DailyCourseStats::join('courses', 'daily_course_stats.course_id', '=', 'courses.id')
            ->where('courses.instructor_id', $teacher->id)
            ->whereBetween('daily_course_stats.date', [$startDate, $endDate])
            ->get();

        $this->assertGreaterThan(0, $statsWithDateRange->count(), 'Stats within date range should exist');

        // Finally, test the sum
        $sumResult = DailyCourseStats::join('courses', 'daily_course_stats.course_id', '=', 'courses.id')
            ->where('courses.instructor_id', $teacher->id)
            ->whereBetween('daily_course_stats.date', [$startDate, $endDate])
            ->sum('daily_course_stats.enrollments');

        $this->assertEquals(10, $sumResult, 'Sum should match created value');
    }
}
