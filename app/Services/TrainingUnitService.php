<?php

namespace App\Services;

use App\Models\TrainingPath;
use App\Models\TrainingPathModule;
use App\Models\TrainingUnit;
use App\Repositories\TrainingPathModuleRepository;
use App\Repositories\TrainingUnitRepository;
use Illuminate\Support\Facades\Log;

/**
 * Service for module and trainingUnit management.
 */
class TrainingUnitService
{
    public function __construct(
        private readonly TrainingPathModuleRepository $moduleRepository,
        private readonly TrainingUnitRepository $trainingUnitRepository,
        private readonly TrainingPathCacheService $cacheService,
    ) {}

    /**
     * Add a module to a trainingPath.
     *
     * @param  array<string, mixed>  $data
     */
    public function addModule(int $trainingPathId, array $data): TrainingPathModule
    {
        // Get the next sort order
        $maxOrder = TrainingPathModule::where('training_path_id', $trainingPathId)->max('sort_order') ?? -1;

        $module = $this->moduleRepository->create([
            'training_path_id' => $trainingPathId,
            'title' => $data['title'] ?? 'New Module',
            'sort_order' => $maxOrder + 1,
        ]);

        Log::info('Module added', [
            'module_id' => $module->id,
            'training_path_id' => $trainingPathId,
        ]);

        // Invalidate the training path cache so edit endpoint returns fresh data
        $this->invalidateTrainingPathCacheById($trainingPathId);

        return $module;
    }

    /**
     * Update a module.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateModule(TrainingPathModule $module, array $data): TrainingPathModule
    {
        $updatedModule = $this->moduleRepository->update($module, $data);

        // Invalidate the training path cache so edit endpoint returns fresh data
        $this->invalidateTrainingPathCacheById($module->training_path_id);

        return $updatedModule;
    }

    /**
     * Delete a module.
     */
    public function deleteModule(TrainingPathModule $module): bool
    {
        Log::info('Module deleted', ['module_id' => $module->id]);

        $result = $this->moduleRepository->delete($module);

        // Invalidate the training path cache so edit endpoint returns fresh data
        $this->invalidateTrainingPathCacheById($module->training_path_id);

        return $result;
    }

    /**
     * Add a trainingUnit to a module.
     *
     * @param  array<string, mixed>  $data
     */
    public function addTrainingUnit(int $moduleId, array $data): TrainingUnit
    {
        // Get the next sort order
        $maxOrder = TrainingUnit::where('module_id', $moduleId)->max('sort_order') ?? -1;

        $trainingUnit = $this->trainingUnitRepository->create([
            'module_id' => $moduleId,
            'title' => $data['title'] ?? 'New TrainingUnit',
            'type' => $data['type'] ?? 'video',
            'duration' => $data['duration'] ?? null,
            'content' => $data['content'] ?? null,
            'objectives' => $data['objectives'] ?? null,
            'vm_enabled' => $data['vm_enabled'] ?? false,
            'video_url' => $data['video_url'] ?? null,
            'resources' => $data['resources'] ?? null,
            'sort_order' => $maxOrder + 1,
        ]);

        Log::info('TrainingUnit added', [
            'training_unit_id' => $trainingUnit->id,
            'module_id' => $moduleId,
        ]);

        // Update trainingPath's has_virtual_machine flag if needed
        if ($trainingUnit->vm_enabled) {
            $trainingUnit->module->trainingPath->update(['has_virtual_machine' => true]);
        }

        $this->invalidateTrainingPathCacheById($moduleId);

        return $trainingUnit;
    }

    /**
     * Update a trainingUnit.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateTrainingUnit(TrainingUnit $trainingUnit, array $data): TrainingUnit
    {
        $updated = $this->trainingUnitRepository->update($trainingUnit, $data);

        // Refresh trainingPath's has_virtual_machine flag
        $updated->module->trainingPath->refreshHasVirtualMachine();

        $this->invalidateTrainingPathCacheById($updated->module->training_path_id);

        return $updated;
    }

    /**
     * Delete a trainingUnit.
     */
    public function deleteTrainingUnit(TrainingUnit $trainingUnit): bool
    {
        $trainingPath = $trainingUnit->module->trainingPath;
        $result = $this->trainingUnitRepository->delete($trainingUnit);

        // Refresh trainingPath's has_virtual_machine flag
        $trainingPath->refreshHasVirtualMachine();

        $this->invalidateTrainingPathCacheById($trainingPath->id);

        Log::info('TrainingUnit deleted', ['training_unit_id' => $trainingUnit->id]);

        return $result;
    }

    /**
     * Get a trainingUnit by ID with context.
     */
    public function getTrainingUnitWithContext(int $id): ?TrainingUnit
    {
        return $this->trainingUnitRepository->findByIdWithContext($id);
    }

    /**
     * Reorder modules within a trainingPath.
     *
     * @param  array<int, int>  $order
     */
    public function reorderModules(int $trainingPathId, array $order): void
    {
        $this->moduleRepository->reorder($trainingPathId, $order);
        $this->invalidateTrainingPathCacheById($trainingPathId);
    }

    /**
     * Reorder trainingUnits within a module.
     *
     * @param  array<int, int>  $order
     */
    public function reorderTrainingUnits(int $moduleId, array $order): void
    {
        $this->trainingUnitRepository->reorder($moduleId, $order);

        $module = $this->moduleRepository->findById($moduleId);
        if ($module) {
            $this->invalidateTrainingPathCacheById($module->training_path_id);
        }
    }

    /**
     * Invalidate cached trainingPath content if the trainingPath still exists.
     */
    private function invalidateTrainingPathCacheById(int $trainingPathId): void
    {
        $trainingPath = TrainingPath::find($trainingPathId);

        if ($trainingPath) {
            $this->cacheService->invalidateTrainingPath($trainingPath);
        }
    }
}
