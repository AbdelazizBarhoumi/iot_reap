<?php

namespace Tests\Unit\Services;

use App\Models\TrainingPath;
use App\Models\TrainingPathModule;
use App\Models\TrainingUnit;
use App\Repositories\TrainingPathModuleRepository;
use App\Repositories\TrainingUnitRepository;
use App\Services\TrainingUnitService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TrainingUnitServiceTest extends TestCase
{
    use RefreshDatabase;

    private TrainingUnitService $trainingUnitService;

    protected function setUp(): void
    {
        parent::setUp();
        $moduleRepo = app(TrainingPathModuleRepository::class);
        $trainingUnitRepo = app(TrainingUnitRepository::class);
        $this->trainingUnitService = new TrainingUnitService($moduleRepo, $trainingUnitRepo);
    }

    public function test_create_module(): void
    {
        $trainingPath = TrainingPath::factory()->create();

        $module = $this->trainingUnitService->addModule($trainingPath->id, ['title' => 'Module 1']);

        $this->assertInstanceOf(TrainingPathModule::class, $module);
        $this->assertEquals('Module 1', $module->title);
        $this->assertEquals($trainingPath->id, $module->training_path_id);
        $this->assertDatabaseHas('training_path_modules', [
            'training_path_id' => $trainingPath->id,
            'title' => 'Module 1',
        ]);
    }

    public function test_update_module(): void
    {
        $module = TrainingPathModule::factory()->create(['title' => 'Original Title']);

        $updated = $this->trainingUnitService->updateModule($module, ['title' => 'Updated Title']);

        $this->assertEquals('Updated Title', $updated->title);
        $this->assertDatabaseHas('training_path_modules', [
            'id' => $module->id,
            'title' => 'Updated Title',
        ]);
    }

    public function test_delete_module(): void
    {
        $module = TrainingPathModule::factory()->create();
        $moduleId = $module->id;

        $this->trainingUnitService->deleteModule($module);

        $this->assertDatabaseMissing('training_path_modules', ['id' => $moduleId]);
    }

    public function test_create_trainingUnit(): void
    {
        $module = TrainingPathModule::factory()->create();

        $trainingUnitData = [
            'title' => 'TrainingUnit 1',
            'type' => 'video',
            'duration' => '30 min',
            'content' => 'TrainingUnit content',
            'vm_enabled' => false,
        ];

        $trainingUnit = $this->trainingUnitService->addTrainingUnit($module->id, $trainingUnitData);

        $this->assertInstanceOf(TrainingUnit::class, $trainingUnit);
        $this->assertEquals('TrainingUnit 1', $trainingUnit->title);
        $this->assertEquals($module->id, $trainingUnit->module_id);
        $this->assertDatabaseHas('training_units', [
            'module_id' => $module->id,
            'title' => 'TrainingUnit 1',
        ]);
    }

    public function test_update_trainingUnit(): void
    {
        $trainingUnit = TrainingUnit::factory()->create(['title' => 'Original TrainingUnit']);

        $updated = $this->trainingUnitService->updateTrainingUnit($trainingUnit, [
            'title' => 'Updated TrainingUnit',
            'content' => 'New content',
        ]);

        $this->assertEquals('Updated TrainingUnit', $updated->title);
        $this->assertEquals('New content', $updated->content);
        $this->assertDatabaseHas('training_units', [
            'id' => $trainingUnit->id,
            'title' => 'Updated TrainingUnit',
        ]);
    }

    public function test_delete_trainingUnit(): void
    {
        $trainingUnit = TrainingUnit::factory()->create();
        $trainingUnitId = $trainingUnit->id;

        $this->trainingUnitService->deleteTrainingUnit($trainingUnit);

        $this->assertDatabaseMissing('training_units', ['id' => $trainingUnitId]);
    }

    public function test_reorder_modules(): void
    {
        $trainingPath = TrainingPath::factory()->create();
        $module1 = TrainingPathModule::factory()->create(['training_path_id' => $trainingPath->id, 'sort_order' => 0]);
        $module2 = TrainingPathModule::factory()->create(['training_path_id' => $trainingPath->id, 'sort_order' => 1]);
        $module3 = TrainingPathModule::factory()->create(['training_path_id' => $trainingPath->id, 'sort_order' => 2]);

        // Reorder: move module3 to first position
        $newOrder = [
            $module3->id => 0,
            $module1->id => 1,
            $module2->id => 2,
        ];

        $this->trainingUnitService->reorderModules($trainingPath->id, $newOrder);

        $this->assertEquals(0, $module3->fresh()->sort_order);
        $this->assertEquals(1, $module1->fresh()->sort_order);
        $this->assertEquals(2, $module2->fresh()->sort_order);
    }

    public function test_reorder_trainingUnits(): void
    {
        $module = TrainingPathModule::factory()->create();
        $trainingUnit1 = TrainingUnit::factory()->create(['module_id' => $module->id, 'sort_order' => 0]);
        $trainingUnit2 = TrainingUnit::factory()->create(['module_id' => $module->id, 'sort_order' => 1]);
        $trainingUnit3 = TrainingUnit::factory()->create(['module_id' => $module->id, 'sort_order' => 2]);

        // Reorder: move trainingUnit3 to first position
        $newOrder = [
            $trainingUnit3->id => 0,
            $trainingUnit1->id => 1,
            $trainingUnit2->id => 2,
        ];

        $this->trainingUnitService->reorderTrainingUnits($module->id, $newOrder);

        $this->assertEquals(0, $trainingUnit3->fresh()->sort_order);
        $this->assertEquals(1, $trainingUnit1->fresh()->sort_order);
        $this->assertEquals(2, $trainingUnit2->fresh()->sort_order);
    }
}
