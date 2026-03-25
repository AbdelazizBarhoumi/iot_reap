<?php

namespace App\Services;

use App\Models\CourseModule;
use App\Models\Lesson;
use App\Repositories\CourseModuleRepository;
use App\Repositories\LessonRepository;
use Illuminate\Support\Facades\Log;

/**
 * Service for module and lesson management.
 */
class LessonService
{
    public function __construct(
        private readonly CourseModuleRepository $moduleRepository,
        private readonly LessonRepository $lessonRepository,
    ) {}

    /**
     * Add a module to a course.
     *
     * @param  array<string, mixed>  $data
     */
    public function addModule(int $courseId, array $data): CourseModule
    {
        // Get the next sort order
        $maxOrder = CourseModule::where('course_id', $courseId)->max('sort_order') ?? -1;

        $module = $this->moduleRepository->create([
            'course_id' => $courseId,
            'title' => $data['title'] ?? 'New Module',
            'sort_order' => $maxOrder + 1,
        ]);

        Log::info('Module added', [
            'module_id' => $module->id,
            'course_id' => $courseId,
        ]);

        return $module;
    }

    /**
     * Update a module.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateModule(CourseModule $module, array $data): CourseModule
    {
        return $this->moduleRepository->update($module, $data);
    }

    /**
     * Delete a module.
     */
    public function deleteModule(CourseModule $module): bool
    {
        Log::info('Module deleted', ['module_id' => $module->id]);

        return $this->moduleRepository->delete($module);
    }

    /**
     * Add a lesson to a module.
     *
     * @param  array<string, mixed>  $data
     */
    public function addLesson(int $moduleId, array $data): Lesson
    {
        // Get the next sort order
        $maxOrder = Lesson::where('module_id', $moduleId)->max('sort_order') ?? -1;

        $lesson = $this->lessonRepository->create([
            'module_id' => $moduleId,
            'title' => $data['title'] ?? 'New Lesson',
            'type' => $data['type'] ?? 'video',
            'duration' => $data['duration'] ?? null,
            'content' => $data['content'] ?? null,
            'objectives' => $data['objectives'] ?? null,
            'vm_enabled' => $data['vm_enabled'] ?? false,
            'video_url' => $data['video_url'] ?? null,
            'resources' => $data['resources'] ?? null,
            'sort_order' => $maxOrder + 1,
        ]);

        Log::info('Lesson added', [
            'lesson_id' => $lesson->id,
            'module_id' => $moduleId,
        ]);

        // Update course's has_virtual_machine flag if needed
        if ($lesson->vm_enabled) {
            $lesson->module->course->update(['has_virtual_machine' => true]);
        }

        return $lesson;
    }

    /**
     * Update a lesson.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateLesson(Lesson $lesson, array $data): Lesson
    {
        $updated = $this->lessonRepository->update($lesson, $data);

        // Refresh course's has_virtual_machine flag
        $updated->module->course->refreshHasVirtualMachine();

        return $updated;
    }

    /**
     * Delete a lesson.
     */
    public function deleteLesson(Lesson $lesson): bool
    {
        $course = $lesson->module->course;
        $result = $this->lessonRepository->delete($lesson);

        // Refresh course's has_virtual_machine flag
        $course->refreshHasVirtualMachine();

        Log::info('Lesson deleted', ['lesson_id' => $lesson->id]);

        return $result;
    }

    /**
     * Get a lesson by ID with context.
     */
    public function getLessonWithContext(int $id): ?Lesson
    {
        return $this->lessonRepository->findByIdWithContext($id);
    }

    /**
     * Reorder modules within a course.
     *
     * @param  array<int, int>  $order
     */
    public function reorderModules(int $courseId, array $order): void
    {
        $this->moduleRepository->reorder($courseId, $order);
    }

    /**
     * Reorder lessons within a module.
     *
     * @param  array<int, int>  $order
     */
    public function reorderLessons(int $moduleId, array $order): void
    {
        $this->lessonRepository->reorder($moduleId, $order);
    }
}
