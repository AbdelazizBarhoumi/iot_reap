<?php

namespace App\Repositories;

use App\Models\TrainingPathModule;
use Illuminate\Database\Eloquent\Collection;

/**
 * Repository for trainingPath module database access.
 */
class TrainingPathModuleRepository
{
    /**
     * Create a new module.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): TrainingPathModule
    {
        return TrainingPathModule::create($data);
    }

    /**
     * Find a module by ID.
     */
    public function findById(int $id): ?TrainingPathModule
    {
        return TrainingPathModule::find($id);
    }

    /**
     * Find a module by ID with trainingUnits.
     */
    public function findByIdWithTrainingUnits(int $id): ?TrainingPathModule
    {
        return TrainingPathModule::with('trainingUnits')->find($id);
    }

    /**
     * Find all modules for a trainingPath.
     */
    public function findByTrainingPath(int $trainingPathId): Collection
    {
        return TrainingPathModule::where('training_path_id', $trainingPathId)
            ->with('trainingUnits')
            ->orderBy('sort_order')
            ->get();
    }

    /**
     * Update a module.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(TrainingPathModule $module, array $data): TrainingPathModule
    {
        $module->update($data);

        return $module->fresh();
    }

    /**
     * Delete a module.
     */
    public function delete(TrainingPathModule $module): bool
    {
        return $module->delete();
    }

    /**
     * Reorder modules for a trainingPath.
     *
     * @param  array<int>  $order  List of module_ids in order
     */
    public function reorder(int $trainingPathId, array $order): void
    {
        foreach ($order as $index => $moduleId) {
            TrainingPathModule::where('id', $moduleId)
                ->where('training_path_id', $trainingPathId)
                ->update(['sort_order' => $index]);
        }
    }
}
