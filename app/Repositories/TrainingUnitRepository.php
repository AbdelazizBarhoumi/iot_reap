<?php

namespace App\Repositories;

use App\Models\TrainingUnit;
use Illuminate\Database\Eloquent\Collection;

/**
 * Repository for trainingUnit database access.
 */
class TrainingUnitRepository
{
    /**
     * Create a new trainingUnit.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): TrainingUnit
    {
        return TrainingUnit::create($data);
    }

    /**
     * Find a trainingUnit by ID.
     */
    public function findById(int $id): ?TrainingUnit
    {
        return TrainingUnit::find($id);
    }

    /**
     * Find a trainingUnit by ID with module and trainingPath.
     */
    public function findByIdWithContext(int $id): ?TrainingUnit
    {
        return TrainingUnit::with(['module.trainingPath.instructor', 'video'])->find($id);
    }

    /**
     * Find all trainingUnits for a module.
     */
    public function findByModule(int $moduleId): Collection
    {
        return TrainingUnit::where('module_id', $moduleId)
            ->orderBy('sort_order')
            ->get();
    }

    /**
     * Update a trainingUnit.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(TrainingUnit $trainingUnit, array $data): TrainingUnit
    {
        $trainingUnit->update($data);

        return $trainingUnit->fresh();
    }

    /**
     * Delete a trainingUnit.
     */
    public function delete(TrainingUnit $trainingUnit): bool
    {
        return $trainingUnit->delete();
    }

    /**
     * Reorder trainingUnits within a module.
     *
     * @param  array<int>  $order  List of training_unit_ids in order
     */
    public function reorder(int $moduleId, array $order): void
    {
        foreach ($order as $index => $trainingUnitId) {
            TrainingUnit::where('id', $trainingUnitId)
                ->where('module_id', $moduleId)
                ->update(['sort_order' => $index]);
        }
    }
}
