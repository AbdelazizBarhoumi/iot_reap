<?php

namespace Tests\Feature;

use App\Enums\CourseStatus;
use App\Models\Course;
use App\Models\CourseModule;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeachingControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_view_teaching_dashboard(): void
    {
        $user = User::factory()->create();
        Course::factory()->count(2)->create(['instructor_id' => $user->id]);

        $response = $this->actingAs($user)->get('/teaching');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('teaching/index')
            ->has('courses', 2)
            ->has('stats')
        );
    }

    public function test_guest_cannot_access_teaching_dashboard(): void
    {
        $response = $this->get('/teaching');

        $response->assertRedirect('/login');
    }

    public function test_instructor_can_create_course(): void
    {
        $user = User::factory()->create();

        $courseData = [
            'title' => 'New Course',
            'description' => 'Course Description',
            'category' => 'Web Development',
            'level' => 'Beginner',
            'duration' => '40 hours',
            'has_virtual_machine' => true,
        ];

        $response = $this->actingAs($user)->post('/teaching', $courseData);

        $response->assertRedirect();
        $this->assertDatabaseHas('courses', [
            'title' => 'New Course',
            'instructor_id' => $user->id,
            'status' => CourseStatus::DRAFT->value,
        ]);
    }

    public function test_instructor_can_update_own_course(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create([
            'instructor_id' => $user->id,
            'title' => 'Original Title',
        ]);

        $response = $this->actingAs($user)->patch("/teaching/{$course->id}", [
            'title' => 'Updated Title',
            'description' => 'Updated Description',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('courses', [
            'id' => $course->id,
            'title' => 'Updated Title',
        ]);
    }

    public function test_instructor_cannot_update_other_instructor_course(): void
    {
        $instructor1 = User::factory()->create();
        $instructor2 = User::factory()->create();
        $course = Course::factory()->create(['instructor_id' => $instructor1->id]);

        $response = $this->actingAs($instructor2)->patch("/teaching/{$course->id}", [
            'title' => 'Hacked Title',
        ]);

        $response->assertForbidden();
        $this->assertDatabaseHas('courses', [
            'id' => $course->id,
            'instructor_id' => $instructor1->id,
        ]);
    }

    public function test_instructor_can_delete_own_course(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['instructor_id' => $user->id]);
        $courseId = $course->id;

        $response = $this->actingAs($user)->delete("/teaching/{$course->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('courses', ['id' => $courseId]);
    }

    public function test_instructor_cannot_delete_other_instructor_course(): void
    {
        $instructor1 = User::factory()->create();
        $instructor2 = User::factory()->create();
        $course = Course::factory()->create(['instructor_id' => $instructor1->id]);

        $response = $this->actingAs($instructor2)->delete("/teaching/{$course->id}");

        $response->assertForbidden();
        $this->assertDatabaseHas('courses', ['id' => $course->id]);
    }

    public function test_instructor_can_submit_course_for_review(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create([
            'instructor_id' => $user->id,
            'status' => CourseStatus::DRAFT,
        ]);

        $response = $this->actingAs($user)->post("/teaching/{$course->id}/submit");

        $response->assertOk();
        $this->assertDatabaseHas('courses', [
            'id' => $course->id,
            'status' => CourseStatus::PENDING_REVIEW->value,
        ]);
    }

    public function test_instructor_can_add_module_to_course(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['instructor_id' => $user->id]);

        $response = $this->actingAs($user)->post("/teaching/{$course->id}/modules", [
            'title' => 'Module 1',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('course_modules', [
            'course_id' => $course->id,
            'title' => 'Module 1',
        ]);
    }

    public function test_instructor_can_update_module(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['instructor_id' => $user->id]);
        $module = CourseModule::factory()->create(['course_id' => $course->id]);

        $response = $this->actingAs($user)->patch("/teaching/{$course->id}/modules/{$module->id}", [
            'title' => 'Updated Module',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('course_modules', [
            'id' => $module->id,
            'title' => 'Updated Module',
        ]);
    }

    public function test_instructor_can_delete_module(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['instructor_id' => $user->id]);
        $module = CourseModule::factory()->create(['course_id' => $course->id]);
        $moduleId = $module->id;

        $response = $this->actingAs($user)->delete("/teaching/{$course->id}/modules/{$module->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('course_modules', ['id' => $moduleId]);
    }

    public function test_instructor_can_add_lesson_to_module(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['instructor_id' => $user->id]);
        $module = CourseModule::factory()->create(['course_id' => $course->id]);

        $lessonData = [
            'title' => 'Lesson 1',
            'type' => 'video',
            'duration' => '30 min',
            'content' => 'Lesson content',
        ];

        $response = $this->actingAs($user)->post("/teaching/{$course->id}/modules/{$module->id}/lessons", $lessonData);

        $response->assertCreated();
        $this->assertDatabaseHas('lessons', [
            'module_id' => $module->id,
            'title' => 'Lesson 1',
        ]);
    }

    public function test_instructor_can_update_lesson(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['instructor_id' => $user->id]);
        $module = CourseModule::factory()->create(['course_id' => $course->id]);
        $lesson = Lesson::factory()->create(['module_id' => $module->id]);

        $response = $this->actingAs($user)->patch("/teaching/{$course->id}/modules/{$module->id}/lessons/{$lesson->id}", [
            'title' => 'Updated Lesson',
            'type' => 'video',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('lessons', [
            'id' => $lesson->id,
            'title' => 'Updated Lesson',
        ]);
    }

    public function test_instructor_can_delete_lesson(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['instructor_id' => $user->id]);
        $module = CourseModule::factory()->create(['course_id' => $course->id]);
        $lesson = Lesson::factory()->create(['module_id' => $module->id]);
        $lessonId = $lesson->id;

        $response = $this->actingAs($user)->delete("/teaching/{$course->id}/modules/{$module->id}/lessons/{$lesson->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('lessons', ['id' => $lessonId]);
    }
}
