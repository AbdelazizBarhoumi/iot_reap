<?php

namespace Tests\Feature;

use App\Enums\CourseStatus;
use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Models\CourseModule;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourseControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_browse_approved_courses(): void
    {
        Course::factory()->approved()->count(3)->create();
        Course::factory()->create(['status' => CourseStatus::DRAFT]);
        Course::factory()->pendingReview()->create();

        $response = $this->get('/courses');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('courses/index')
            ->has('courses', 3)
            ->has('categories')
        );
    }

    public function test_guest_can_view_approved_course_details(): void
    {
        $course = Course::factory()->approved()->create();
        $module = CourseModule::factory()->create(['course_id' => $course->id]);
        Lesson::factory()->count(3)->create(['module_id' => $module->id]);

        $response = $this->get("/courses/{$course->id}");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('courses/show')
            ->has('course')
            ->where('course.id', $course->id)
            ->has('course.modules', 1)
        );
    }

    public function test_guest_cannot_view_draft_course(): void
    {
        $course = Course::factory()->create(['status' => CourseStatus::DRAFT]);

        $response = $this->get("/courses/{$course->id}");

        $response->assertNotFound();
    }

    public function test_authenticated_user_can_enroll_in_course(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->approved()->create();

        $response = $this->actingAs($user)->post("/courses/{$course->id}/enroll");

        $response->assertRedirect();
        $this->assertDatabaseHas('course_enrollments', [
            'user_id' => $user->id,
            'course_id' => $course->id,
        ]);
    }

    public function test_guest_cannot_enroll_in_course(): void
    {
        $course = Course::factory()->approved()->create();

        $response = $this->post("/courses/{$course->id}/enroll");

        $response->assertRedirect('/login');
    }

    public function test_user_cannot_enroll_twice_in_same_course(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->approved()->create();

        CourseEnrollment::factory()->create([
            'user_id' => $user->id,
            'course_id' => $course->id,
        ]);

        $response = $this->actingAs($user)->post("/courses/{$course->id}/enroll");

        $response->assertRedirect();
        $this->assertDatabaseCount('course_enrollments', 1);
    }

    public function test_enrolled_user_can_view_lesson(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->approved()->create();
        $module = CourseModule::factory()->create(['course_id' => $course->id]);
        $lesson = Lesson::factory()->create(['module_id' => $module->id]);

        CourseEnrollment::factory()->create([
            'user_id' => $user->id,
            'course_id' => $course->id,
        ]);

        $response = $this->actingAs($user)->get("/courses/{$course->id}/lesson/{$lesson->id}");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('courses/lesson')
            ->has('course')
            ->has('lesson')
            ->where('lesson.id', (string) $lesson->id)
        );
    }

    public function test_non_enrolled_user_cannot_view_lesson(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->approved()->create();
        $module = CourseModule::factory()->create(['course_id' => $course->id]);
        $lesson = Lesson::factory()->create(['module_id' => $module->id]);

        $response = $this->actingAs($user)->get("/courses/{$course->id}/lesson/{$lesson->id}");

        $response->assertForbidden();
    }

    public function test_user_can_mark_lesson_as_complete(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->approved()->create();
        $module = CourseModule::factory()->create(['course_id' => $course->id]);
        $lesson = Lesson::factory()->create(['module_id' => $module->id]);

        CourseEnrollment::factory()->create([
            'user_id' => $user->id,
            'course_id' => $course->id,
        ]);

        $response = $this->actingAs($user)->post("/courses/{$course->id}/lessons/{$lesson->id}/complete");

        $response->assertOk();
        $this->assertDatabaseHas('lesson_progress', [
            'user_id' => $user->id,
            'lesson_id' => $lesson->id,
        ]);
    }

    public function test_guest_cannot_mark_lesson_complete(): void
    {
        $course = Course::factory()->approved()->create();
        $module = CourseModule::factory()->create(['course_id' => $course->id]);
        $lesson = Lesson::factory()->create(['module_id' => $module->id]);

        $response = $this->post("/courses/{$course->id}/lessons/{$lesson->id}/complete");

        $response->assertRedirect('/login');
    }
}
