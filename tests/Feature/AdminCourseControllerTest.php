<?php

namespace Tests\Feature;

use App\Enums\CourseStatus;
use App\Enums\UserRole;
use App\Models\Course;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCourseControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_pending_courses(): void
    {
        $admin = User::factory()->create(['role' => UserRole::ADMIN]);
        Course::factory()->pendingReview()->count(2)->create();
        Course::factory()->approved()->create();

        $response = $this->actingAs($admin)->get('/admin/courses');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('admin/CoursesPage')
            ->has('pendingCourses', 2)
        );
    }

    public function test_non_admin_cannot_view_pending_courses(): void
    {
        $user = User::factory()->create(['role' => UserRole::ENGINEER]);

        $response = $this->actingAs($user)->get('/admin/courses');

        $response->assertForbidden();
    }

    public function test_guest_cannot_view_pending_courses(): void
    {
        $response = $this->get('/admin/courses');

        $response->assertRedirect('/login');
    }

    public function test_admin_can_approve_course(): void
    {
        $admin = User::factory()->create(['role' => UserRole::ADMIN]);
        $course = Course::factory()->pendingReview()->create();

        $response = $this->actingAs($admin)->post("/admin/courses/{$course->id}/approve");

        $response->assertOk();
        $this->assertDatabaseHas('courses', [
            'id' => $course->id,
            'status' => CourseStatus::APPROVED->value,
        ]);
    }

    public function test_non_admin_cannot_approve_course(): void
    {
        $user = User::factory()->create(['role' => UserRole::ENGINEER]);
        $course = Course::factory()->pendingReview()->create();

        $response = $this->actingAs($user)->post("/admin/courses/{$course->id}/approve");

        $response->assertForbidden();
        $this->assertDatabaseHas('courses', [
            'id' => $course->id,
            'status' => CourseStatus::PENDING_REVIEW->value,
        ]);
    }

    public function test_admin_can_reject_course_with_feedback(): void
    {
        $admin = User::factory()->create(['role' => UserRole::ADMIN]);
        $course = Course::factory()->pendingReview()->create();

        $response = $this->actingAs($admin)->post("/admin/courses/{$course->id}/reject", [
            'feedback' => 'Content needs improvement',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('courses', [
            'id' => $course->id,
            'status' => CourseStatus::REJECTED->value,
            'admin_feedback' => 'Content needs improvement',
        ]);
    }

    public function test_non_admin_cannot_reject_course(): void
    {
        $user = User::factory()->create(['role' => UserRole::ENGINEER]);
        $course = Course::factory()->pendingReview()->create();

        $response = $this->actingAs($user)->post("/admin/courses/{$course->id}/reject", [
            'feedback' => 'Not allowed',
        ]);

        $response->assertForbidden();
        $this->assertDatabaseHas('courses', [
            'id' => $course->id,
            'status' => CourseStatus::PENDING_REVIEW->value,
        ]);
    }

    public function test_reject_requires_feedback(): void
    {
        $admin = User::factory()->create(['role' => UserRole::ADMIN]);
        $course = Course::factory()->pendingReview()->create();

        $response = $this->actingAs($admin)->post("/admin/courses/{$course->id}/reject", [
            'feedback' => '',
        ]);

        $response->assertSessionHasErrors(['feedback']);
    }
}
