<?php

namespace Tests\Unit\Services;

use App\Enums\LessonVMAssignmentStatus;
use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Models\CourseModule;
use App\Models\Lesson;
use App\Models\LessonVMAssignment;
use App\Models\User;
use App\Models\VMTemplate;
use App\Services\CheckCourseAccessService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class CheckCourseAccessServiceTest extends TestCase
{
    use RefreshDatabase;

    private CheckCourseAccessService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(CheckCourseAccessService::class);
        Cache::flush();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // canAccessCourse Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_allows_access_to_free_course(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->approved()->create([
            'is_free' => true,
            'price_cents' => 0,
        ]);

        $this->assertTrue($this->service->canAccessCourse($user, $course->id));
    }

    public function test_allows_access_to_zero_price_course(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->approved()->create([
            'is_free' => false,
            'price_cents' => 0,
        ]);

        $this->assertTrue($this->service->canAccessCourse($user, $course->id));
    }

    public function test_allows_access_when_enrolled(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->approved()->create([
            'is_free' => false,
            'price_cents' => 2999,
        ]);

        CourseEnrollment::factory()->create([
            'user_id' => $user->id,
            'course_id' => $course->id,
        ]);

        $this->assertTrue($this->service->canAccessCourse($user, $course->id));
    }

    public function test_allows_instructor_to_access_own_course(): void
    {
        $instructor = User::factory()->create();
        $course = Course::factory()->approved()->create([
            'instructor_id' => $instructor->id,
            'is_free' => false,
            'price_cents' => 4999,
        ]);

        $this->assertTrue($this->service->canAccessCourse($instructor, $course->id));
    }

    public function test_denies_access_to_paid_course_without_enrollment(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->approved()->create([
            'is_free' => false,
            'price_cents' => 2999,
        ]);

        $this->assertFalse($this->service->canAccessCourse($user, $course->id));
    }

    public function test_denies_access_to_unpublished_course(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create([
            'is_free' => true,
            'price_cents' => 0,
        ]); // Default is DRAFT status

        $this->assertFalse($this->service->canAccessCourse($user, $course->id));
    }

    public function test_denies_access_to_nonexistent_course(): void
    {
        $user = User::factory()->create();

        $this->assertFalse($this->service->canAccessCourse($user, 99999));
    }

    public function test_denies_access_to_pending_review_course(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->pendingReview()->create([
            'is_free' => true,
            'price_cents' => 0,
        ]);

        $this->assertFalse($this->service->canAccessCourse($user, $course->id));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // canAccessLesson Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_allows_access_to_preview_lesson(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->approved()->create([
            'is_free' => false,
            'price_cents' => 2999,
        ]);

        $module = CourseModule::factory()->create([
            'course_id' => $course->id,
            'sort_order' => 1,
        ]);

        $previewLesson = Lesson::factory()->create([
            'module_id' => $module->id,
            'sort_order' => 1,
        ]);

        // User not enrolled, but first lesson of first module is accessible
        $this->assertTrue($this->service->canAccessLesson($user, $previewLesson->id));
    }

    public function test_denies_access_to_non_preview_lesson_without_enrollment(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->approved()->create([
            'is_free' => false,
            'price_cents' => 2999,
        ]);

        $module = CourseModule::factory()->create([
            'course_id' => $course->id,
            'sort_order' => 1,
        ]);

        // First lesson (preview)
        Lesson::factory()->create([
            'module_id' => $module->id,
            'sort_order' => 1,
        ]);

        // Second lesson (not preview)
        $secondLesson = Lesson::factory()->create([
            'module_id' => $module->id,
            'sort_order' => 2,
        ]);

        $this->assertFalse($this->service->canAccessLesson($user, $secondLesson->id));
    }

    public function test_allows_enrolled_user_to_access_any_lesson(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->approved()->create([
            'is_free' => false,
            'price_cents' => 2999,
        ]);

        $module = CourseModule::factory()->create([
            'course_id' => $course->id,
            'sort_order' => 1,
        ]);

        $lesson = Lesson::factory()->create([
            'module_id' => $module->id,
            'sort_order' => 5, // Not a preview lesson
        ]);

        CourseEnrollment::factory()->create([
            'user_id' => $user->id,
            'course_id' => $course->id,
        ]);

        $this->assertTrue($this->service->canAccessLesson($user, $lesson->id));
    }

    public function test_allows_instructor_to_access_any_lesson_in_own_course(): void
    {
        $instructor = User::factory()->create();
        $course = Course::factory()->approved()->create([
            'instructor_id' => $instructor->id,
            'is_free' => false,
            'price_cents' => 4999,
        ]);

        $module = CourseModule::factory()->create([
            'course_id' => $course->id,
            'sort_order' => 2,
        ]);

        $lesson = Lesson::factory()->create([
            'module_id' => $module->id,
            'sort_order' => 5,
        ]);

        $this->assertTrue($this->service->canAccessLesson($instructor, $lesson->id));
    }

    public function test_denies_access_to_nonexistent_lesson(): void
    {
        $user = User::factory()->create();

        $this->assertFalse($this->service->canAccessLesson($user, 99999));
    }

    public function test_lesson_in_second_module_is_not_preview(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->approved()->create([
            'is_free' => false,
            'price_cents' => 2999,
        ]);

        // First module
        CourseModule::factory()->create([
            'course_id' => $course->id,
            'sort_order' => 1,
        ]);

        // Second module
        $secondModule = CourseModule::factory()->create([
            'course_id' => $course->id,
            'sort_order' => 2,
        ]);

        // First lesson in second module (not a preview)
        $lesson = Lesson::factory()->create([
            'module_id' => $secondModule->id,
            'sort_order' => 1,
        ]);

        $this->assertFalse($this->service->canAccessLesson($user, $lesson->id));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // canAccessLessonVM Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_allows_vm_access_when_enrolled_and_vm_approved(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->approved()->create([
            'is_free' => false,
            'price_cents' => 2999,
        ]);

        $module = CourseModule::factory()->create([
            'course_id' => $course->id,
            'sort_order' => 1,
        ]);

        $lesson = Lesson::factory()->vmLab()->create([
            'module_id' => $module->id,
            'sort_order' => 1,
        ]);

        // Create VM assignment
        LessonVMAssignment::create([
            'lesson_id' => $lesson->id,
            'status' => LessonVMAssignmentStatus::APPROVED,
        ]);

        CourseEnrollment::factory()->create([
            'user_id' => $user->id,
            'course_id' => $course->id,
        ]);

        $this->assertTrue($this->service->canAccessLessonVM($user, $lesson->id));
    }

    public function test_denies_vm_access_without_course_access(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->approved()->create([
            'is_free' => false,
            'price_cents' => 2999,
        ]);

        $module = CourseModule::factory()->create([
            'course_id' => $course->id,
            'sort_order' => 1,
        ]);

        $lesson = Lesson::factory()->vmLab()->create([
            'module_id' => $module->id,
            'sort_order' => 2, // Not preview
        ]);

        // Create VM assignment
        LessonVMAssignment::create([
            'lesson_id' => $lesson->id,
            'status' => LessonVMAssignmentStatus::APPROVED,
        ]);

        // User not enrolled
        $this->assertFalse($this->service->canAccessLessonVM($user, $lesson->id));
    }

    public function test_denies_vm_access_when_vm_not_enabled(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->approved()->create([
            'is_free' => true,
            'price_cents' => 0,
        ]);

        $module = CourseModule::factory()->create([
            'course_id' => $course->id,
            'sort_order' => 1,
        ]);

        // Lesson without VM enabled
        $lesson = Lesson::factory()->video()->create([
            'module_id' => $module->id,
            'sort_order' => 1,
            'vm_enabled' => false,
        ]);

        $this->assertFalse($this->service->canAccessLessonVM($user, $lesson->id));
    }

    public function test_denies_vm_access_when_vm_not_approved(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->approved()->create([
            'is_free' => true,
            'price_cents' => 0,
        ]);

        $module = CourseModule::factory()->create([
            'course_id' => $course->id,
            'sort_order' => 1,
        ]);

        $lesson = Lesson::factory()->vmLab()->create([
            'module_id' => $module->id,
            'sort_order' => 1,
        ]);

        // VM assignment is pending, not approved
        LessonVMAssignment::create([
            'lesson_id' => $lesson->id,
            'status' => LessonVMAssignmentStatus::PENDING,
        ]);

        $this->assertFalse($this->service->canAccessLessonVM($user, $lesson->id));
    }

    public function test_denies_vm_access_to_nonexistent_lesson(): void
    {
        $user = User::factory()->create();

        $this->assertFalse($this->service->canAccessLessonVM($user, 99999));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // isEnrolled Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_is_enrolled_returns_true_when_enrolled(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->approved()->create();

        CourseEnrollment::factory()->create([
            'user_id' => $user->id,
            'course_id' => $course->id,
        ]);

        $this->assertTrue($this->service->isEnrolled($user, $course->id));
    }

    public function test_is_enrolled_returns_false_when_not_enrolled(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->approved()->create();

        $this->assertFalse($this->service->isEnrolled($user, $course->id));
    }

    public function test_enrollment_check_is_cached(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->approved()->create();

        CourseEnrollment::factory()->create([
            'user_id' => $user->id,
            'course_id' => $course->id,
        ]);

        // First call - should cache
        $this->service->isEnrolled($user, $course->id);

        // Check cache key exists
        $cacheKey = "access:user:{$user->id}:course:{$course->id}";
        $this->assertTrue(Cache::has($cacheKey));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // isFree Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_is_free_returns_true_for_is_free_flag(): void
    {
        $course = Course::factory()->approved()->create([
            'is_free' => true,
            'price_cents' => 2999, // Even with price set
        ]);

        $this->assertTrue($this->service->isFree($course->id));
    }

    public function test_is_free_returns_true_for_zero_price(): void
    {
        $course = Course::factory()->approved()->create([
            'is_free' => false,
            'price_cents' => 0,
        ]);

        $this->assertTrue($this->service->isFree($course->id));
    }

    public function test_is_free_returns_false_for_paid_course(): void
    {
        $course = Course::factory()->approved()->create([
            'is_free' => false,
            'price_cents' => 2999,
        ]);

        $this->assertFalse($this->service->isFree($course->id));
    }

    public function test_is_free_returns_false_for_nonexistent_course(): void
    {
        $this->assertFalse($this->service->isFree(99999));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // isPreviewLesson Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_is_preview_lesson_for_first_lesson_of_first_module(): void
    {
        $course = Course::factory()->approved()->create();
        $module = CourseModule::factory()->create([
            'course_id' => $course->id,
            'sort_order' => 1,
        ]);
        $lesson = Lesson::factory()->create([
            'module_id' => $module->id,
            'sort_order' => 1,
        ]);

        $this->assertTrue($this->service->isPreviewLesson($lesson));
    }

    public function test_is_not_preview_for_second_lesson_of_first_module(): void
    {
        $course = Course::factory()->approved()->create();
        $module = CourseModule::factory()->create([
            'course_id' => $course->id,
            'sort_order' => 1,
        ]);

        Lesson::factory()->create([
            'module_id' => $module->id,
            'sort_order' => 1,
        ]);

        $secondLesson = Lesson::factory()->create([
            'module_id' => $module->id,
            'sort_order' => 2,
        ]);

        $this->assertFalse($this->service->isPreviewLesson($secondLesson));
    }

    public function test_is_not_preview_for_first_lesson_of_second_module(): void
    {
        $course = Course::factory()->approved()->create();

        CourseModule::factory()->create([
            'course_id' => $course->id,
            'sort_order' => 1,
        ]);

        $secondModule = CourseModule::factory()->create([
            'course_id' => $course->id,
            'sort_order' => 2,
        ]);

        $lesson = Lesson::factory()->create([
            'module_id' => $secondModule->id,
            'sort_order' => 1,
        ]);

        $this->assertFalse($this->service->isPreviewLesson($lesson));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Assert Methods Tests (Exception throwing)
    // ─────────────────────────────────────────────────────────────────────────

    public function test_assert_can_access_course_throws_when_denied(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->approved()->create([
            'is_free' => false,
            'price_cents' => 2999,
        ]);

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessage('You do not have access to this course');

        $this->service->assertCanAccessCourse($user, $course->id);
    }

    public function test_assert_can_access_course_passes_when_allowed(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->approved()->create([
            'is_free' => true,
            'price_cents' => 0,
        ]);

        // Should not throw
        $this->service->assertCanAccessCourse($user, $course->id);
        $this->assertTrue(true);
    }

    public function test_assert_can_access_lesson_throws_when_denied(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->approved()->create([
            'is_free' => false,
            'price_cents' => 2999,
        ]);

        $module = CourseModule::factory()->create([
            'course_id' => $course->id,
            'sort_order' => 1,
        ]);

        // Not a preview lesson
        $lesson = Lesson::factory()->create([
            'module_id' => $module->id,
            'sort_order' => 2,
        ]);

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessage('You do not have access to this lesson');

        $this->service->assertCanAccessLesson($user, $lesson->id);
    }

    public function test_assert_can_access_lesson_vm_throws_when_denied(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->approved()->create([
            'is_free' => true,
            'price_cents' => 0,
        ]);

        $module = CourseModule::factory()->create([
            'course_id' => $course->id,
            'sort_order' => 1,
        ]);

        // VM not enabled
        $lesson = Lesson::factory()->video()->create([
            'module_id' => $module->id,
            'sort_order' => 1,
        ]);

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessage("You do not have access to this lesson's virtual machine");

        $this->service->assertCanAccessLessonVM($user, $lesson->id);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Cache Invalidation Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_invalidate_enrollment_cache_clears_cache(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->approved()->create();

        CourseEnrollment::factory()->create([
            'user_id' => $user->id,
            'course_id' => $course->id,
        ]);

        // Populate cache
        $this->service->isEnrolled($user, $course->id);

        $cacheKey = "access:user:{$user->id}:course:{$course->id}";
        $this->assertTrue(Cache::has($cacheKey));

        // Invalidate
        $this->service->invalidateEnrollmentCache($user, $course->id);

        $this->assertFalse(Cache::has($cacheKey));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getAccessSummary Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_get_access_summary_for_instructor(): void
    {
        $instructor = User::factory()->create();
        $course = Course::factory()->approved()->create([
            'instructor_id' => $instructor->id,
            'is_free' => false,
            'price_cents' => 4999,
        ]);

        $summary = $this->service->getAccessSummary($instructor, $course->id);

        $this->assertTrue($summary['can_access']);
        $this->assertEquals('You are the course instructor', $summary['reason']);
        $this->assertTrue($summary['is_instructor']);
        $this->assertFalse($summary['is_free']);
        $this->assertFalse($summary['is_enrolled']);
    }

    public function test_get_access_summary_for_free_course(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->approved()->create([
            'is_free' => true,
            'price_cents' => 0,
        ]);

        $summary = $this->service->getAccessSummary($user, $course->id);

        $this->assertTrue($summary['can_access']);
        $this->assertEquals('This course is free', $summary['reason']);
        $this->assertFalse($summary['is_instructor']);
        $this->assertTrue($summary['is_free']);
        $this->assertFalse($summary['is_enrolled']);
    }

    public function test_get_access_summary_for_enrolled_user(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->approved()->create([
            'is_free' => false,
            'price_cents' => 2999,
        ]);

        CourseEnrollment::factory()->create([
            'user_id' => $user->id,
            'course_id' => $course->id,
        ]);

        $summary = $this->service->getAccessSummary($user, $course->id);

        $this->assertTrue($summary['can_access']);
        $this->assertEquals('You are enrolled in this course', $summary['reason']);
        $this->assertFalse($summary['is_instructor']);
        $this->assertFalse($summary['is_free']);
        $this->assertTrue($summary['is_enrolled']);
    }

    public function test_get_access_summary_for_non_enrolled_user(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->approved()->create([
            'is_free' => false,
            'price_cents' => 2999,
        ]);

        $summary = $this->service->getAccessSummary($user, $course->id);

        $this->assertFalse($summary['can_access']);
        $this->assertEquals('Enrollment required', $summary['reason']);
        $this->assertFalse($summary['is_instructor']);
        $this->assertFalse($summary['is_free']);
        $this->assertFalse($summary['is_enrolled']);
    }

    public function test_get_access_summary_for_nonexistent_course(): void
    {
        $user = User::factory()->create();

        $summary = $this->service->getAccessSummary($user, 99999);

        $this->assertFalse($summary['can_access']);
        $this->assertEquals('Course not found', $summary['reason']);
        $this->assertFalse($summary['is_instructor']);
        $this->assertFalse($summary['is_free']);
        $this->assertFalse($summary['is_enrolled']);
    }
}
