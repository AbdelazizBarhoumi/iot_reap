<?php

namespace App\Repositories;

use App\Models\CourseModule;
use Illuminate\Database\Eloquent\Collection;

/**
 * Repository for course module database access.
 */
class CourseModuleRepository
{
    /**
     * Create a new module.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): CourseModule
    {
        return CourseModule::create($data);
    }

    /**
     * Find a module by ID.
     */
    public function findById(int $id): ?CourseModule
    {
        return CourseModule::find($id);
    }

    /**
     * Find a module by ID with lessons.
     */
    public function findByIdWithLessons(int $id): ?CourseModule
    {
        return CourseModule::with('lessons')->find($id);
    }

    /**
     * Find all modules for a course.
     */
    public function findByCourse(int $courseId): Collection
    {
        return CourseModule::where('course_id', $courseId)
            ->with('lessons')
            ->orderBy('sort_order')
            ->get();
    }

    /**
     * Update a module.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(CourseModule $module, array $data): CourseModule
    {
        $module->update($data);

        return $module->fresh();
    }

    /**
     * Delete a module.
     */
    public function delete(CourseModule $module): bool
    {
        return $module->delete();
    }

    /**
     * Reorder modules for a course.
     *
     * @param  array<int, int>  $order  Map of module_id => sort_order
     */
    public function reorder(int $courseId, array $order): void
    {
        foreach ($order as $moduleId => $sortOrder) {
            CourseModule::where('id', $moduleId)
                ->where('course_id', $courseId)
                ->update(['sort_order' => $sortOrder]);
        }
    }
}
