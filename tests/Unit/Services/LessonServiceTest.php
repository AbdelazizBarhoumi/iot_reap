<?php

namespace Tests\Unit\Services;

use App\Models\Course;
use App\Models\CourseModule;
use App\Models\Lesson;
use App\Repositories\CourseModuleRepository;
use App\Repositories\LessonRepository;
use App\Services\LessonService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LessonServiceTest extends TestCase
{
    use RefreshDatabase;

    private LessonService $lessonService;

    protected function setUp(): void
    {
        parent::setUp();
        $moduleRepo = app(CourseModuleRepository::class);
        $lessonRepo = app(LessonRepository::class);
        $this->lessonService = new LessonService($moduleRepo, $lessonRepo);
    }

    public function test_create_module(): void
    {
        $course = Course::factory()->create();

        $module = $this->lessonService->addModule($course->id, ['title' => 'Module 1']);

        $this->assertInstanceOf(CourseModule::class, $module);
        $this->assertEquals('Module 1', $module->title);
        $this->assertEquals($course->id, $module->course_id);
        $this->assertDatabaseHas('course_modules', [
            'course_id' => $course->id,
            'title' => 'Module 1',
        ]);
    }

    public function test_update_module(): void
    {
        $module = CourseModule::factory()->create(['title' => 'Original Title']);

        $updated = $this->lessonService->updateModule($module, ['title' => 'Updated Title']);

        $this->assertEquals('Updated Title', $updated->title);
        $this->assertDatabaseHas('course_modules', [
            'id' => $module->id,
            'title' => 'Updated Title',
        ]);
    }

    public function test_delete_module(): void
    {
        $module = CourseModule::factory()->create();
        $moduleId = $module->id;

        $this->lessonService->deleteModule($module);

        $this->assertDatabaseMissing('course_modules', ['id' => $moduleId]);
    }

    public function test_create_lesson(): void
    {
        $module = CourseModule::factory()->create();

        $lessonData = [
            'title' => 'Lesson 1',
            'type' => 'video',
            'duration' => '30 min',
            'content' => 'Lesson content',
            'vm_enabled' => false,
        ];

        $lesson = $this->lessonService->addLesson($module->id, $lessonData);

        $this->assertInstanceOf(Lesson::class, $lesson);
        $this->assertEquals('Lesson 1', $lesson->title);
        $this->assertEquals($module->id, $lesson->module_id);
        $this->assertDatabaseHas('lessons', [
            'module_id' => $module->id,
            'title' => 'Lesson 1',
        ]);
    }

    public function test_update_lesson(): void
    {
        $lesson = Lesson::factory()->create(['title' => 'Original Lesson']);

        $updated = $this->lessonService->updateLesson($lesson, [
            'title' => 'Updated Lesson',
            'content' => 'New content',
        ]);

        $this->assertEquals('Updated Lesson', $updated->title);
        $this->assertEquals('New content', $updated->content);
        $this->assertDatabaseHas('lessons', [
            'id' => $lesson->id,
            'title' => 'Updated Lesson',
        ]);
    }

    public function test_delete_lesson(): void
    {
        $lesson = Lesson::factory()->create();
        $lessonId = $lesson->id;

        $this->lessonService->deleteLesson($lesson);

        $this->assertDatabaseMissing('lessons', ['id' => $lessonId]);
    }

    public function test_reorder_modules(): void
    {
        $course = Course::factory()->create();
        $module1 = CourseModule::factory()->create(['course_id' => $course->id, 'sort_order' => 0]);
        $module2 = CourseModule::factory()->create(['course_id' => $course->id, 'sort_order' => 1]);
        $module3 = CourseModule::factory()->create(['course_id' => $course->id, 'sort_order' => 2]);

        // Reorder: move module3 to first position
        $newOrder = [
            $module3->id => 0,
            $module1->id => 1,
            $module2->id => 2,
        ];

        $this->lessonService->reorderModules($course->id, $newOrder);

        $this->assertEquals(0, $module3->fresh()->sort_order);
        $this->assertEquals(1, $module1->fresh()->sort_order);
        $this->assertEquals(2, $module2->fresh()->sort_order);
    }

    public function test_reorder_lessons(): void
    {
        $module = CourseModule::factory()->create();
        $lesson1 = Lesson::factory()->create(['module_id' => $module->id, 'sort_order' => 0]);
        $lesson2 = Lesson::factory()->create(['module_id' => $module->id, 'sort_order' => 1]);
        $lesson3 = Lesson::factory()->create(['module_id' => $module->id, 'sort_order' => 2]);

        // Reorder: move lesson3 to first position
        $newOrder = [
            $lesson3->id => 0,
            $lesson1->id => 1,
            $lesson2->id => 2,
        ];

        $this->lessonService->reorderLessons($module->id, $newOrder);

        $this->assertEquals(0, $lesson3->fresh()->sort_order);
        $this->assertEquals(1, $lesson1->fresh()->sort_order);
        $this->assertEquals(2, $lesson2->fresh()->sort_order);
    }
}
