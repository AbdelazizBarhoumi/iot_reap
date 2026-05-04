<?php

namespace Tests\Feature;

use App\Models\TrainingPath;
use App\Models\TrainingPathModule;
use App\Models\TrainingUnit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeachingTrainingUnitSyncTest extends TestCase
{
    use RefreshDatabase;

    public function test_training_units_stay_in_sync_with_edit_response(): void
    {
        $teacher = User::factory()->teacher()->create();
        $trainingPath = TrainingPath::factory()->for($teacher, 'instructor')->create();
        $module = TrainingPathModule::factory()->create([
            'training_path_id' => $trainingPath->id,
            'sort_order' => 0,
        ]);
        $unit1 = TrainingUnit::factory()->create([
            'module_id' => $module->id,
            'sort_order' => 0,
            'title' => 'Unit 1',
        ]);

        $firstResponse = $this->actingAs($teacher)
            ->getJson("/teaching/{$trainingPath->id}/edit");

        $firstResponse->assertOk();
        $firstModules = $firstResponse->json('data.modules');
        $this->assertCount(1, $firstModules);
        $this->assertCount(1, $firstModules[0]['trainingUnits']);
        $this->assertEquals($unit1->id, $firstModules[0]['trainingUnits'][0]['id']);

        $createResponse = $this->actingAs($teacher)
            ->postJson("/teaching/{$trainingPath->id}/modules/{$module->id}/trainingUnits", [
                'title' => 'Unit 2',
                'type' => 'video',
            ]);

        $createResponse->assertCreated();
        $unit2Id = $createResponse->json('data.id');

        $secondResponse = $this->actingAs($teacher)
            ->getJson("/teaching/{$trainingPath->id}/edit");

        $secondResponse->assertOk();
        $secondModules = $secondResponse->json('data.modules');
        $this->assertCount(1, $secondModules);
        $this->assertCount(2, $secondModules[0]['trainingUnits']);

        $deleteResponse = $this->actingAs($teacher)
            ->deleteJson("/teaching/{$trainingPath->id}/modules/{$module->id}/trainingUnits/{$unit1->id}");

        $deleteResponse->assertOk();

        $thirdResponse = $this->actingAs($teacher)
            ->getJson("/teaching/{$trainingPath->id}/edit");

        $thirdResponse->assertOk();
        $thirdModules = $thirdResponse->json('data.modules');
        $this->assertCount(1, $thirdModules);
        $this->assertCount(1, $thirdModules[0]['trainingUnits']);
        $this->assertEquals($unit2Id, $thirdModules[0]['trainingUnits'][0]['id']);
    }
}
