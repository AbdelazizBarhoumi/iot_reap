<?php

namespace App\Repositories;

use App\Models\Lesson;
use Illuminate\Database\Eloquent\Collection;

/**
 * Repository for lesson database access.
 */
class LessonRepository
{
    /**
     * Create a new lesson.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Lesson
    {
        return Lesson::create($data);
    }

    /**
     * Find a lesson by ID.
     */
    public function findById(int $id): ?Lesson
    {
        return Lesson::find($id);
    }

    /**
     * Find a lesson by ID with module and course.
     */
    public function findByIdWithContext(int $id): ?Lesson
    {
        return Lesson::with(['module.course.instructor'])->find($id);
    }

    /**
     * Find all lessons for a module.
     */
    public function findByModule(int $moduleId): Collection
    {
        return Lesson::where('module_id', $moduleId)
            ->orderBy('sort_order')
            ->get();
    }

    /**
     * Update a lesson.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(Lesson $lesson, array $data): Lesson
    {
        $lesson->update($data);

        return $lesson->fresh();
    }

    /**
     * Delete a lesson.
     */
    public function delete(Lesson $lesson): bool
    {
        return $lesson->delete();
    }

    /**
     * Reorder lessons within a module.
     *
     * @param  array<int, int>  $order  Map of lesson_id => sort_order
     */
    public function reorder(int $moduleId, array $order): void
    {
        foreach ($order as $lessonId => $sortOrder) {
            Lesson::where('id', $lessonId)
                ->where('module_id', $moduleId)
                ->update(['sort_order' => $sortOrder]);
        }
    }
}
