<?php

namespace Tests\Feature;

use App\Models\TrainingPath;
use App\Models\TrainingPathModule;
use App\Models\TrainingUnit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeachingReorderTest extends TestCase
{
    use RefreshDatabase;

    protected User $teacher;

    protected TrainingPath $trainingPath;

    protected function setUp(): void
    {
        parent::setUp();
        $this->teacher = User::factory()->teacher()->create();
        $this->trainingPath = TrainingPath::factory()->create(['instructor_id' => $this->teacher->id]);
    }

    public function test_can_reorder_modules(): void
    {
        $module1 = TrainingPathModule::factory()->create([
            'training_path_id' => $this->trainingPath->id,
            'sort_order' => 0,
        ]);
        $module2 = TrainingPathModule::factory()->create([
            'training_path_id' => $this->trainingPath->id,
            'sort_order' => 1,
        ]);

        // Swap them
        $response = $this->actingAs($this->teacher)
            ->patchJson("/teaching/{$this->trainingPath->id}/modules/reorder", [
                'order' => [$module2->id, $module1->id],
            ]);

        $response->assertOk();

        $this->assertEquals(0, $module2->fresh()->sort_order);
        $this->assertEquals(1, $module1->fresh()->sort_order);
    }

    public function test_can_reorder_training_units(): void
    {
        $module = TrainingPathModule::factory()->create([
            'training_path_id' => $this->trainingPath->id,
        ]);

        $unit1 = TrainingUnit::factory()->create([
            'module_id' => $module->id,
            'sort_order' => 0,
        ]);
        $unit2 = TrainingUnit::factory()->create([
            'module_id' => $module->id,
            'sort_order' => 1,
        ]);

        // Swap them
        $response = $this->actingAs($this->teacher)
            ->patchJson("/teaching/{$this->trainingPath->id}/modules/{$module->id}/trainingUnits/reorder", [
                'order' => [$unit2->id, $unit1->id],
            ]);

        $response->assertOk();

        $this->assertEquals(0, $unit2->fresh()->sort_order);
        $this->assertEquals(1, $unit1->fresh()->sort_order);
    }

    public function test_cannot_reorder_items_belonging_to_other_module(): void
    {
        $module1 = TrainingPathModule::factory()->create(['training_path_id' => $this->trainingPath->id]);
        $module2 = TrainingPathModule::factory()->create(['training_path_id' => $this->trainingPath->id]);

        $unit1 = TrainingUnit::factory()->create(['module_id' => $module1->id]);
        $unit2 = TrainingUnit::factory()->create(['module_id' => $module2->id]);

        // Try to "reorder" unit from module 2 into module 1
        $response = $this->actingAs($this->teacher)
            ->patchJson("/teaching/{$this->trainingPath->id}/modules/{$module1->id}/trainingUnits/reorder", [
                'order' => [$unit2->id],
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['order']);
    }
}
