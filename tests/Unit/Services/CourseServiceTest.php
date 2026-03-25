<?php

namespace Tests\Unit\Services;

use App\Enums\CourseStatus;
use App\Models\Course;
use App\Models\User;
use App\Repositories\CourseModuleRepository;
use App\Repositories\CourseRepository;
use App\Repositories\LessonRepository;
use App\Services\CourseService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourseServiceTest extends TestCase
{
    use RefreshDatabase;

    private CourseService $courseService;

    private CourseRepository $courseRepository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->courseRepository = app(CourseRepository::class);
        $moduleRepository = app(CourseModuleRepository::class);
        $lessonRepository = app(LessonRepository::class);
        $this->courseService = new CourseService(
            $this->courseRepository,
            $moduleRepository,
            $lessonRepository
        );
    }

    public function test_create_course(): void
    {
        $instructor = User::factory()->create();

        $data = [
            'title' => 'Test Course',
            'description' => 'Test Description',
            'category' => 'Web Development',
            'level' => 'Beginner',
            'duration' => '40 hours',
        ];

        $course = $this->courseService->createCourse($instructor, $data);

        $this->assertInstanceOf(Course::class, $course);
        $this->assertEquals('Test Course', $course->title);
        $this->assertEquals($instructor->id, $course->instructor_id);
        $this->assertEquals(CourseStatus::DRAFT, $course->status);
        $this->assertDatabaseHas('courses', [
            'title' => 'Test Course',
            'instructor_id' => $instructor->id,
            'status' => CourseStatus::DRAFT->value,
        ]);
    }

    public function test_update_course(): void
    {
        $course = Course::factory()->create(['title' => 'Original Title']);

        $updated = $this->courseService->updateCourse($course, [
            'title' => 'Updated Title',
            'description' => 'Updated Description',
        ]);

        $this->assertEquals('Updated Title', $updated->title);
        $this->assertEquals('Updated Description', $updated->description);
        $this->assertDatabaseHas('courses', [
            'id' => $course->id,
            'title' => 'Updated Title',
        ]);
    }

    public function test_delete_course(): void
    {
        $course = Course::factory()->create();
        $courseId = $course->id;

        $this->courseService->deleteCourse($course);

        $this->assertDatabaseMissing('courses', ['id' => $courseId]);
    }

    public function test_submit_for_review(): void
    {
        $course = Course::factory()->create(['status' => CourseStatus::DRAFT]);

        $this->courseService->submitForReview($course);

        $this->assertEquals(CourseStatus::PENDING_REVIEW, $course->fresh()->status);
        $this->assertDatabaseHas('courses', [
            'id' => $course->id,
            'status' => CourseStatus::PENDING_REVIEW->value,
        ]);
    }

    public function test_approve_course(): void
    {
        $course = Course::factory()->pendingReview()->create();

        $this->courseService->approveCourse($course);

        $this->assertEquals(CourseStatus::APPROVED, $course->fresh()->status);
        $this->assertDatabaseHas('courses', [
            'id' => $course->id,
            'status' => CourseStatus::APPROVED->value,
        ]);
    }

    public function test_reject_course_with_feedback(): void
    {
        $course = Course::factory()->pendingReview()->create();
        $feedback = 'Content needs improvement';

        $this->courseService->rejectCourse($course, $feedback);

        $course->refresh();
        $this->assertEquals(CourseStatus::REJECTED, $course->status);
        $this->assertEquals($feedback, $course->admin_feedback);
        $this->assertDatabaseHas('courses', [
            'id' => $course->id,
            'status' => CourseStatus::REJECTED->value,
            'admin_feedback' => $feedback,
        ]);
    }

    public function test_list_approved_courses(): void
    {
        Course::factory()->approved()->count(3)->create();
        Course::factory()->create(['status' => CourseStatus::DRAFT]);
        Course::factory()->pendingReview()->create();

        $approvedCourses = $this->courseService->getApprovedCourses();

        $this->assertCount(3, $approvedCourses);
        foreach ($approvedCourses as $course) {
            $this->assertEquals(CourseStatus::APPROVED, $course->status);
        }
    }

    public function test_list_courses_by_instructor(): void
    {
        $instructor = User::factory()->create();
        $otherInstructor = User::factory()->create();

        Course::factory()->count(2)->create(['instructor_id' => $instructor->id]);
        Course::factory()->create(['instructor_id' => $otherInstructor->id]);

        $instructorCourses = $this->courseService->getCoursesByInstructor($instructor);

        $this->assertCount(2, $instructorCourses);
        foreach ($instructorCourses as $course) {
            $this->assertEquals($instructor->id, $course->instructor_id);
        }
    }

    public function test_list_pending_courses(): void
    {
        Course::factory()->pendingReview()->count(2)->create();
        Course::factory()->approved()->create();
        Course::factory()->create(['status' => CourseStatus::DRAFT]);

        $pendingCourses = $this->courseService->getPendingCourses();

        $this->assertCount(2, $pendingCourses);
        foreach ($pendingCourses as $course) {
            $this->assertEquals(CourseStatus::PENDING_REVIEW, $course->status);
        }
    }

    public function test_search_courses_by_title(): void
    {
        Course::factory()->approved()->create(['title' => 'Laravel Backend Development']);
        Course::factory()->approved()->create(['title' => 'React Frontend Development']);
        Course::factory()->approved()->create(['title' => 'Python Data Science']);

        $results = $this->courseService->getApprovedCourses(search: 'Development');

        $this->assertCount(2, $results);
    }

    public function test_filter_courses_by_category(): void
    {
        Course::factory()->approved()->create(['category' => 'Web Development']);
        Course::factory()->approved()->create(['category' => 'Web Development']);
        Course::factory()->approved()->create(['category' => 'Data Science']);

        $webCourses = $this->courseService->getApprovedCourses(category: 'Web Development');

        $this->assertCount(2, $webCourses);
        foreach ($webCourses as $course) {
            $this->assertEquals('Web Development', $course->category);
        }
    }
}
