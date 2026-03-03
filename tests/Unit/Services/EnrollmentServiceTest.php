<?php

namespace Tests\Unit\Services;

use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Models\CourseModule;
use App\Models\Lesson;
use App\Models\User;
use App\Repositories\CourseEnrollmentRepository;
use App\Repositories\CourseRepository;
use App\Repositories\LessonProgressRepository;
use App\Services\EnrollmentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EnrollmentServiceTest extends TestCase
{
    use RefreshDatabase;

    private EnrollmentService $enrollmentService;

    protected function setUp(): void
    {
        parent::setUp();
        $enrollmentRepo = app(CourseEnrollmentRepository::class);
        $courseRepo = app(CourseRepository::class);
        $progressRepo = app(LessonProgressRepository::class);
        $this->enrollmentService = new EnrollmentService(
            $enrollmentRepo,
            $courseRepo,
            $progressRepo
        );
    }

    public function test_enroll_user_in_course(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->approved()->create();

        $enrollment = $this->enrollmentService->enroll($user, $course->id);

        $this->assertInstanceOf(CourseEnrollment::class, $enrollment);
        $this->assertEquals($user->id, $enrollment->user_id);
        $this->assertEquals($course->id, $enrollment->course_id);
        $this->assertDatabaseHas('course_enrollments', [
            'user_id' => $user->id,
            'course_id' => $course->id,
        ]);
    }

    public function test_cannot_enroll_twice_in_same_course(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->approved()->create();

        $enrollment1 = $this->enrollmentService->enroll($user, $course->id);
        $enrollment2 = $this->enrollmentService->enroll($user, $course->id);

        // Should return the same enrollment (firstOrCreate behavior)
        $this->assertEquals($enrollment1->id, $enrollment2->id);
        $this->assertDatabaseCount('course_enrollments', 1);
    }

    public function test_check_if_user_is_enrolled(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->approved()->create();
        $notEnrolledCourse = Course::factory()->approved()->create();

        $this->enrollmentService->enroll($user, $course->id);

        $this->assertTrue($this->enrollmentService->isEnrolled($user, $course->id));
        $this->assertFalse($this->enrollmentService->isEnrolled($user, $notEnrolledCourse->id));
    }

    public function test_get_user_enrollments(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        
        $course1 = Course::factory()->approved()->create();
        $course2 = Course::factory()->approved()->create();
        $course3 = Course::factory()->approved()->create();

        $this->enrollmentService->enroll($user, $course1->id);
        $this->enrollmentService->enroll($user, $course2->id);
        $this->enrollmentService->enroll($otherUser, $course3->id);

        $enrollments = $this->enrollmentService->getEnrolledCourses($user);

        $this->assertCount(2, $enrollments);
        $this->assertTrue($enrollments->contains('course_id', $course1->id));
        $this->assertTrue($enrollments->contains('course_id', $course2->id));
        $this->assertFalse($enrollments->contains('course_id', $course3->id));
    }

    public function test_mark_lesson_as_complete(): void
    {
        $user = User::factory()->create();
        $module = CourseModule::factory()->create();
        $lesson = Lesson::factory()->create(['module_id' => $module->id]);

        $progress = $this->enrollmentService->markLessonComplete($user, $lesson->id);

        $this->assertNotNull($progress);
        $this->assertEquals($user->id, $progress->user_id);
        $this->assertEquals($lesson->id, $progress->lesson_id);
        $this->assertDatabaseHas('lesson_progress', [
            'user_id' => $user->id,
            'lesson_id' => $lesson->id,
        ]);
    }

    public function test_cannot_mark_completed_lesson_twice(): void
    {
        $user = User::factory()->create();
        $module = CourseModule::factory()->create();
        $lesson = Lesson::factory()->create(['module_id' => $module->id]);

        $progress1 = $this->enrollmentService->markLessonComplete($user, $lesson->id);
        $progress2 = $this->enrollmentService->markLessonComplete($user, $lesson->id);

        // Should return the same progress record (updateOrCreate behavior)
        $this->assertEquals($progress1->id, $progress2->id);
        $this->assertDatabaseCount('lesson_progress', 1);
    }

    public function test_get_course_progress(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->approved()->create();
        
        // Create 3 modules with 2 lessons each = 6 total lessons
        $modules = CourseModule::factory()->count(3)->create(['course_id' => $course->id]);
        $allLessons = [];
        foreach ($modules as $module) {
            $lessons = Lesson::factory()->count(2)->create(['module_id' => $module->id]);
            $allLessons = array_merge($allLessons, $lessons->all());
        }

        // Complete 3 out of 6 lessons
        $this->enrollmentService->markLessonComplete($user, $allLessons[0]->id);
        $this->enrollmentService->markLessonComplete($user, $allLessons[1]->id);
        $this->enrollmentService->markLessonComplete($user, $allLessons[2]->id);

        $progress = $this->enrollmentService->getCourseProgress($user, $course);

        $this->assertEquals(6, $progress['total']);
        $this->assertEquals(3, $progress['completed']);
        $this->assertEquals(50, $progress['percentage']);
    }

    public function test_get_completed_lesson_ids(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->approved()->create();
        $module = CourseModule::factory()->create(['course_id' => $course->id]);
        
        $lesson1 = Lesson::factory()->create(['module_id' => $module->id]);
        $lesson2 = Lesson::factory()->create(['module_id' => $module->id]);
        $lesson3 = Lesson::factory()->create(['module_id' => $module->id]);

        $this->enrollmentService->markLessonComplete($user, $lesson1->id);
        $this->enrollmentService->markLessonComplete($user, $lesson2->id);

        $completedIds = $this->enrollmentService->getCompletedLessonIds($user, $course->id);

        $this->assertCount(2, $completedIds);
        $this->assertContains($lesson1->id, $completedIds);
        $this->assertContains($lesson2->id, $completedIds);
        $this->assertNotContains($lesson3->id, $completedIds);
    }
}
