<?php

namespace Tests\Unit\Services;

use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Models\CourseModule;
use App\Models\DailyCourseStats;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\User;
use App\Services\CourseAnalyticsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourseAnalyticsServiceTest extends TestCase
{
    use RefreshDatabase;

    private CourseAnalyticsService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(CourseAnalyticsService::class);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getTeacherKPIs Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_returns_teacher_kpis_with_correct_structure(): void
    {
        $teacher = User::factory()->create();
        $course = Course::factory()->approved()->create(['instructor_id' => $teacher->id]);

        // Create stats for last 30 days
        DailyCourseStats::factory()
            ->forDate(now()->subDays(5)->toDateString())
            ->create([
                'course_id' => $course->id,
                'enrollments' => 10,
                'completions' => 3,
                'revenue_cents' => 50000,
                'quiz_attempts' => 20,
                'quiz_passes' => 15,
                'video_minutes_watched' => 1200,
                'active_students' => 8,
            ]);

        $kpis = $this->service->getTeacherKPIs($teacher, '30d');

        $this->assertArrayHasKey('total_students', $kpis);
        $this->assertArrayHasKey('total_enrollments', $kpis);
        $this->assertArrayHasKey('enrollments_change', $kpis);
        $this->assertArrayHasKey('total_completions', $kpis);
        $this->assertArrayHasKey('completions_change', $kpis);
        $this->assertArrayHasKey('total_revenue', $kpis);
        $this->assertArrayHasKey('revenue_change', $kpis);
        $this->assertArrayHasKey('quiz_pass_rate', $kpis);
        $this->assertArrayHasKey('avg_video_minutes', $kpis);
        $this->assertArrayHasKey('period', $kpis);
    }

    public function test_calculates_total_enrollments_correctly(): void
    {
        $teacher = User::factory()->create();
        $course = Course::factory()->approved()->create(['instructor_id' => $teacher->id]);

        DailyCourseStats::factory()
            ->forDate(now()->subDays(3)->toDateString())
            ->create(['course_id' => $course->id, 'enrollments' => 10]);

        DailyCourseStats::factory()
            ->forDate(now()->subDays(5)->toDateString())
            ->create(['course_id' => $course->id, 'enrollments' => 15]);

        $kpis = $this->service->getTeacherKPIs($teacher, '30d');

        $this->assertEquals(25, $kpis['total_enrollments']);
    }

    public function test_calculates_revenue_in_dollars(): void
    {
        $teacher = User::factory()->create();
        $course = Course::factory()->approved()->create(['instructor_id' => $teacher->id]);

        DailyCourseStats::factory()
            ->forDate(now()->subDays(3)->toDateString())
            ->create(['course_id' => $course->id, 'revenue_cents' => 15000]); // $150.00

        $kpis = $this->service->getTeacherKPIs($teacher, '30d');

        $this->assertEquals(150.00, $kpis['total_revenue']);
    }

    public function test_calculates_quiz_pass_rate(): void
    {
        $teacher = User::factory()->create();
        $course = Course::factory()->approved()->create(['instructor_id' => $teacher->id]);

        DailyCourseStats::factory()
            ->forDate(now()->subDays(3)->toDateString())
            ->create([
                'course_id' => $course->id,
                'quiz_attempts' => 100,
                'quiz_passes' => 75,
            ]);

        $kpis = $this->service->getTeacherKPIs($teacher, '30d');

        $this->assertEquals(75.0, $kpis['quiz_pass_rate']);
    }

    public function test_handles_zero_quiz_attempts(): void
    {
        $teacher = User::factory()->create();
        $course = Course::factory()->approved()->create(['instructor_id' => $teacher->id]);

        DailyCourseStats::factory()
            ->forDate(now()->subDays(3)->toDateString())
            ->create([
                'course_id' => $course->id,
                'quiz_attempts' => 0,
                'quiz_passes' => 0,
            ]);

        $kpis = $this->service->getTeacherKPIs($teacher, '30d');

        $this->assertEquals(0, $kpis['quiz_pass_rate']);
    }

    public function test_calculates_average_video_minutes(): void
    {
        $teacher = User::factory()->create();
        $course = Course::factory()->approved()->create(['instructor_id' => $teacher->id]);

        DailyCourseStats::factory()
            ->forDate(now()->subDays(3)->toDateString())
            ->create([
                'course_id' => $course->id,
                'video_minutes_watched' => 600,
                'active_students' => 10, // 60 min avg
            ]);

        $kpis = $this->service->getTeacherKPIs($teacher, '30d');

        $this->assertEquals(60.0, $kpis['avg_video_minutes']);
    }

    public function test_calculates_positive_enrollment_change(): void
    {
        $teacher = User::factory()->create();
        $course = Course::factory()->approved()->create(['instructor_id' => $teacher->id]);

        // Current period (last 30 days): 20 enrollments
        DailyCourseStats::factory()
            ->forDate(now()->subDays(10)->toDateString())
            ->create(['course_id' => $course->id, 'enrollments' => 20]);

        // Previous period (31-60 days ago): 10 enrollments
        DailyCourseStats::factory()
            ->forDate(now()->subDays(40)->toDateString())
            ->create(['course_id' => $course->id, 'enrollments' => 10]);

        $kpis = $this->service->getTeacherKPIs($teacher, '30d');

        $this->assertEquals(100.0, $kpis['enrollments_change']); // +100%
    }

    public function test_handles_zero_previous_period(): void
    {
        $teacher = User::factory()->create();
        $course = Course::factory()->approved()->create(['instructor_id' => $teacher->id]);

        // Only current period stats, no previous period
        DailyCourseStats::factory()
            ->forDate(now()->subDays(5)->toDateString())
            ->create(['course_id' => $course->id, 'enrollments' => 10]);

        $kpis = $this->service->getTeacherKPIs($teacher, '30d');

        $this->assertEquals(100, $kpis['enrollments_change']); // 100% when previous is zero
    }

    public function test_counts_total_unique_students(): void
    {
        $teacher = User::factory()->create();
        $course1 = Course::factory()->approved()->create(['instructor_id' => $teacher->id]);
        $course2 = Course::factory()->approved()->create(['instructor_id' => $teacher->id]);

        // Student enrolled in both courses (should count once)
        $student1 = User::factory()->create();
        CourseEnrollment::factory()->create(['user_id' => $student1->id, 'course_id' => $course1->id]);
        CourseEnrollment::factory()->create(['user_id' => $student1->id, 'course_id' => $course2->id]);

        // Another student in first course only
        $student2 = User::factory()->create();
        CourseEnrollment::factory()->create(['user_id' => $student2->id, 'course_id' => $course1->id]);

        $kpis = $this->service->getTeacherKPIs($teacher, '30d');

        $this->assertEquals(2, $kpis['total_students']); // 2 unique students
    }

    public function test_respects_different_period_options(): void
    {
        $teacher = User::factory()->create();
        $course = Course::factory()->approved()->create(['instructor_id' => $teacher->id]);

        // Stats within 7 days
        DailyCourseStats::factory()
            ->forDate(now()->subDays(3)->toDateString())
            ->create(['course_id' => $course->id, 'enrollments' => 5]);

        // Stats between 7-30 days (should be excluded for 7d period)
        DailyCourseStats::factory()
            ->forDate(now()->subDays(15)->toDateString())
            ->create(['course_id' => $course->id, 'enrollments' => 10]);

        $kpis7d = $this->service->getTeacherKPIs($teacher, '7d');
        $kpis30d = $this->service->getTeacherKPIs($teacher, '30d');

        $this->assertEquals(5, $kpis7d['total_enrollments']);
        $this->assertEquals(15, $kpis30d['total_enrollments']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getEnrollmentChart Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_returns_enrollment_chart_data(): void
    {
        $teacher = User::factory()->create();
        $course = Course::factory()->approved()->create(['instructor_id' => $teacher->id]);

        DailyCourseStats::factory()
            ->forDate(now()->subDays(3)->toDateString())
            ->create([
                'course_id' => $course->id,
                'enrollments' => 5,
                'completions' => 2,
            ]);

        $chart = $this->service->getEnrollmentChart($teacher, '7d');

        $this->assertCount(7, $chart); // 7 days of data

        // Verify structure
        $this->assertArrayHasKey('date', $chart[0]);
        $this->assertArrayHasKey('enrollments', $chart[0]);
        $this->assertArrayHasKey('completions', $chart[0]);
    }

    public function test_fills_missing_dates_with_zeros(): void
    {
        $teacher = User::factory()->create();
        $course = Course::factory()->approved()->create(['instructor_id' => $teacher->id]);

        // Only one day has stats
        DailyCourseStats::factory()
            ->forDate(now()->subDays(3)->toDateString())
            ->create(['course_id' => $course->id, 'enrollments' => 10]);

        $chart = $this->service->getEnrollmentChart($teacher, '7d');

        // Days without stats should be 0
        $zeroCount = collect($chart)->where('enrollments', 0)->count();
        $this->assertEquals(6, $zeroCount);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getRevenueChart Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_returns_revenue_chart_in_dollars(): void
    {
        $teacher = User::factory()->create();
        $course = Course::factory()->approved()->create(['instructor_id' => $teacher->id]);

        $targetDate = now()->subDays(3)->toDateString();
        DailyCourseStats::factory()
            ->forDate($targetDate)
            ->create(['course_id' => $course->id, 'revenue_cents' => 5000]); // $50.00

        $chart = $this->service->getRevenueChart($teacher, '7d');

        $dayWithRevenue = collect($chart)->firstWhere('date', $targetDate);
        $this->assertEquals(50.00, $dayWithRevenue['revenue']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getCompletionFunnel Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_returns_completion_funnel_with_correct_stages(): void
    {
        $course = Course::factory()->approved()->create();
        $module = CourseModule::factory()->create(['course_id' => $course->id]);
        Lesson::factory()->count(4)->create(['module_id' => $module->id]);

        // Enroll some students
        $students = User::factory()->count(3)->create();
        foreach ($students as $student) {
            CourseEnrollment::factory()->create([
                'user_id' => $student->id,
                'course_id' => $course->id,
            ]);
        }

        $funnel = $this->service->getCompletionFunnel($course);

        $this->assertCount(6, $funnel);
        $this->assertEquals('Enrolled', $funnel[0]['stage']);
        $this->assertEquals('Started', $funnel[1]['stage']);
        $this->assertEquals('25% Complete', $funnel[2]['stage']);
        $this->assertEquals('50% Complete', $funnel[3]['stage']);
        $this->assertEquals('75% Complete', $funnel[4]['stage']);
        $this->assertEquals('Completed', $funnel[5]['stage']);
    }

    public function test_funnel_shows_decreasing_reach_per_stage(): void
    {
        $course = Course::factory()->approved()->create();
        $module = CourseModule::factory()->create(['course_id' => $course->id]);
        $lessons = Lesson::factory()->count(4)->create(['module_id' => $module->id]);

        // Create 10 students with varying progress
        $students = User::factory()->count(10)->create();
        foreach ($students as $index => $student) {
            CourseEnrollment::factory()->create([
                'user_id' => $student->id,
                'course_id' => $course->id,
            ]);

            // Graduated completion: first students complete more lessons
            $lessonsToComplete = max(0, 4 - (int) ($index / 2));
            foreach ($lessons->take($lessonsToComplete) as $lesson) {
                LessonProgress::factory()->create([
                    'user_id' => $student->id,
                    'lesson_id' => $lesson->id,
                    'completed' => true,
                    'completed_at' => now(),
                ]);
            }
        }

        $funnel = $this->service->getCompletionFunnel($course);

        // Enrolled should be 100%
        $this->assertEquals(100, $funnel[0]['percentage']);

        // Each subsequent stage should have <= users than the previous (decreasing funnel)
        for ($i = 1; $i < count($funnel); $i++) {
            $this->assertLessThanOrEqual(
                $funnel[$i - 1]['count'],
                $funnel[$i]['count'],
                "Stage {$funnel[$i]['stage']} should have <= users than {$funnel[$i - 1]['stage']}"
            );
        }
    }

    public function test_funnel_returns_zeros_for_empty_course(): void
    {
        $course = Course::factory()->approved()->create();

        $funnel = $this->service->getCompletionFunnel($course);

        foreach ($funnel as $stage) {
            $this->assertEquals(0, $stage['count']);
            $this->assertEquals(0, $stage['percentage']);
        }
    }

    public function test_funnel_handles_course_with_no_lessons(): void
    {
        $course = Course::factory()->approved()->create();

        // Enroll students but no lessons exist
        $student = User::factory()->create();
        CourseEnrollment::factory()->create([
            'user_id' => $student->id,
            'course_id' => $course->id,
        ]);

        $funnel = $this->service->getCompletionFunnel($course);

        $this->assertCount(3, $funnel); // Simplified funnel for courses without lessons
        $this->assertEquals('Enrolled', $funnel[0]['stage']);
        $this->assertEquals(1, $funnel[0]['count']);
        $this->assertEquals(100, $funnel[0]['percentage']);
    }

    public function test_funnel_calculates_completion_correctly(): void
    {
        $course = Course::factory()->approved()->create();
        $module = CourseModule::factory()->create(['course_id' => $course->id]);
        $lessons = Lesson::factory()->count(4)->create(['module_id' => $module->id]);

        // Student who completed all lessons
        $completedStudent = User::factory()->create();
        CourseEnrollment::factory()->create([
            'user_id' => $completedStudent->id,
            'course_id' => $course->id,
        ]);
        foreach ($lessons as $lesson) {
            LessonProgress::factory()->create([
                'user_id' => $completedStudent->id,
                'lesson_id' => $lesson->id,
                'completed' => true,
                'completed_at' => now(),
            ]);
        }

        // Student who hasn't started
        $notStartedStudent = User::factory()->create();
        CourseEnrollment::factory()->create([
            'user_id' => $notStartedStudent->id,
            'course_id' => $course->id,
        ]);

        $funnel = $this->service->getCompletionFunnel($course);

        $this->assertEquals(2, $funnel[0]['count']); // Enrolled
        $this->assertEquals(1, $funnel[5]['count']); // Completed
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getTopCourses Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_returns_top_courses_by_enrollments(): void
    {
        $teacher = User::factory()->create();

        $course1 = Course::factory()->approved()->create([
            'instructor_id' => $teacher->id,
            'title' => 'Popular Course',
        ]);
        $course2 = Course::factory()->approved()->create([
            'instructor_id' => $teacher->id,
            'title' => 'Less Popular',
        ]);

        DailyCourseStats::factory()
            ->forDate(now()->subDays(5)->toDateString())
            ->create(['course_id' => $course1->id, 'enrollments' => 50]);

        DailyCourseStats::factory()
            ->forDate(now()->subDays(5)->toDateString())
            ->create(['course_id' => $course2->id, 'enrollments' => 10]);

        $topCourses = $this->service->getTopCourses($teacher, '30d', 'enrollments');

        $this->assertCount(2, $topCourses);
        $this->assertEquals($course1->id, $topCourses[0]['id']);
        $this->assertEquals(50, $topCourses[0]['value']);
    }

    public function test_returns_top_courses_by_revenue(): void
    {
        $teacher = User::factory()->create();

        $course1 = Course::factory()->approved()->create([
            'instructor_id' => $teacher->id,
            'title' => 'High Revenue Course',
        ]);
        $course2 = Course::factory()->approved()->create([
            'instructor_id' => $teacher->id,
            'title' => 'Low Revenue',
        ]);

        DailyCourseStats::factory()
            ->forDate(now()->subDays(5)->toDateString())
            ->create(['course_id' => $course1->id, 'revenue_cents' => 100000]); // $1000

        DailyCourseStats::factory()
            ->forDate(now()->subDays(5)->toDateString())
            ->create(['course_id' => $course2->id, 'revenue_cents' => 5000]); // $50

        $topCourses = $this->service->getTopCourses($teacher, '30d', 'revenue');

        $this->assertCount(2, $topCourses);
        $this->assertEquals($course1->id, $topCourses[0]['id']);
        $this->assertEquals(1000.00, $topCourses[0]['value']);
        $this->assertEquals('$1,000.00', $topCourses[0]['formatted_value']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getStudentRoster Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_returns_student_roster_with_correct_structure(): void
    {
        $course = Course::factory()->approved()->create();
        $student = User::factory()->create(['name' => 'Test Student']);

        CourseEnrollment::factory()->create([
            'user_id' => $student->id,
            'course_id' => $course->id,
        ]);

        $roster = $this->service->getStudentRoster($course);

        $this->assertArrayHasKey('data', $roster);
        $this->assertArrayHasKey('meta', $roster);
        $this->assertCount(1, $roster['data']);

        $studentData = $roster['data'][0];
        $this->assertArrayHasKey('id', $studentData);
        $this->assertArrayHasKey('name', $studentData);
        $this->assertArrayHasKey('email', $studentData);
        $this->assertArrayHasKey('enrolled_at', $studentData);
        $this->assertArrayHasKey('progress', $studentData);
        $this->assertArrayHasKey('is_completed', $studentData);
    }

    public function test_calculates_student_progress_correctly(): void
    {
        $course = Course::factory()->approved()->create();
        $module = CourseModule::factory()->create(['course_id' => $course->id]);
        $lessons = Lesson::factory()->count(4)->create(['module_id' => $module->id]);

        $student = User::factory()->create();
        CourseEnrollment::factory()->create([
            'user_id' => $student->id,
            'course_id' => $course->id,
        ]);

        // Complete 2 of 4 lessons = 50%
        foreach ($lessons->take(2) as $lesson) {
            LessonProgress::factory()->create([
                'user_id' => $student->id,
                'lesson_id' => $lesson->id,
                'completed' => true,
                'completed_at' => now(),
            ]);
        }

        $roster = $this->service->getStudentRoster($course);

        $this->assertEquals(50.0, $roster['data'][0]['progress']);
        $this->assertFalse($roster['data'][0]['is_completed']);
    }

    public function test_marks_student_as_completed_when_all_lessons_done(): void
    {
        $course = Course::factory()->approved()->create();
        $module = CourseModule::factory()->create(['course_id' => $course->id]);
        $lessons = Lesson::factory()->count(2)->create(['module_id' => $module->id]);

        $student = User::factory()->create();
        CourseEnrollment::factory()->create([
            'user_id' => $student->id,
            'course_id' => $course->id,
        ]);

        // Complete all lessons
        foreach ($lessons as $lesson) {
            LessonProgress::factory()->create([
                'user_id' => $student->id,
                'lesson_id' => $lesson->id,
                'completed' => true,
                'completed_at' => now(),
            ]);
        }

        $roster = $this->service->getStudentRoster($course);

        $this->assertEquals(100.0, $roster['data'][0]['progress']);
        $this->assertTrue($roster['data'][0]['is_completed']);
        $this->assertNotNull($roster['data'][0]['completed_at']);
    }

    public function test_paginates_student_roster(): void
    {
        $course = Course::factory()->approved()->create();

        // Create 25 students
        $students = User::factory()->count(25)->create();
        foreach ($students as $student) {
            CourseEnrollment::factory()->create([
                'user_id' => $student->id,
                'course_id' => $course->id,
            ]);
        }

        $page1 = $this->service->getStudentRoster($course, page: 1, perPage: 10);
        $page2 = $this->service->getStudentRoster($course, page: 2, perPage: 10);

        $this->assertCount(10, $page1['data']);
        $this->assertCount(10, $page2['data']);
        $this->assertEquals(25, $page1['meta']['total']);
        $this->assertEquals(3, $page1['meta']['last_page']);
    }

    public function test_handles_course_with_no_students(): void
    {
        $course = Course::factory()->approved()->create();

        $roster = $this->service->getStudentRoster($course);

        $this->assertEmpty($roster['data']);
        $this->assertEquals(0, $roster['meta']['total']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Edge Cases & Integration Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_teacher_kpis_only_include_own_courses(): void
    {
        $teacher1 = User::factory()->create();
        $teacher2 = User::factory()->create();

        $course1 = Course::factory()->approved()->create(['instructor_id' => $teacher1->id]);
        $course2 = Course::factory()->approved()->create(['instructor_id' => $teacher2->id]);

        DailyCourseStats::factory()
            ->forDate(now()->subDays(5)->toDateString())
            ->create(['course_id' => $course1->id, 'enrollments' => 10]);

        DailyCourseStats::factory()
            ->forDate(now()->subDays(5)->toDateString())
            ->create(['course_id' => $course2->id, 'enrollments' => 20]);

        $kpis = $this->service->getTeacherKPIs($teacher1, '30d');

        $this->assertEquals(10, $kpis['total_enrollments']);
    }

    public function test_aggregates_stats_from_multiple_courses(): void
    {
        $teacher = User::factory()->create();

        $course1 = Course::factory()->approved()->create(['instructor_id' => $teacher->id]);
        $course2 = Course::factory()->approved()->create(['instructor_id' => $teacher->id]);

        DailyCourseStats::factory()
            ->forDate(now()->subDays(5)->toDateString())
            ->create(['course_id' => $course1->id, 'enrollments' => 10, 'revenue_cents' => 5000]);

        DailyCourseStats::factory()
            ->forDate(now()->subDays(5)->toDateString())
            ->create(['course_id' => $course2->id, 'enrollments' => 15, 'revenue_cents' => 7500]);

        $kpis = $this->service->getTeacherKPIs($teacher, '30d');

        $this->assertEquals(25, $kpis['total_enrollments']);
        $this->assertEquals(125.00, $kpis['total_revenue']); // $50 + $75
    }

    public function test_handles_new_teacher_with_no_data(): void
    {
        $teacher = User::factory()->create();

        $kpis = $this->service->getTeacherKPIs($teacher, '30d');

        $this->assertEquals(0, $kpis['total_students']);
        $this->assertEquals(0, $kpis['total_enrollments']);
        $this->assertEquals(0, $kpis['total_completions']);
        $this->assertEquals(0, $kpis['total_revenue']);
        $this->assertEquals(0, $kpis['quiz_pass_rate']);
        $this->assertEquals(0, $kpis['avg_video_minutes']);
    }

    public function test_handles_12_month_period(): void
    {
        $teacher = User::factory()->create();
        $course = Course::factory()->approved()->create(['instructor_id' => $teacher->id]);

        // Stats from 6 months ago
        DailyCourseStats::factory()
            ->forDate(now()->subMonths(6)->toDateString())
            ->create(['course_id' => $course->id, 'enrollments' => 100]);

        $kpis = $this->service->getTeacherKPIs($teacher, '12m');

        $this->assertEquals(100, $kpis['total_enrollments']);
        $this->assertEquals('12m', $kpis['period']);
    }
}
