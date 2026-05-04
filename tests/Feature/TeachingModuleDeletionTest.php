<?php

namespace Tests\Feature;

use App\Models\TrainingPath;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeachingModuleDeletionTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_delete_newly_created_module_after_deletion(): void
    {
        // Create a user and training path
        $user = User::factory()->teacher()->create();
        $trainingPath = TrainingPath::factory()
            ->for($user, 'instructor')
            ->create();

        // Create initial modules
        $module1 = $trainingPath->modules()->create([
            'title' => 'Module 1',
            'sort_order' => 0,
        ]);
        $module2 = $trainingPath->modules()->create([
            'title' => 'Module 2',
            'sort_order' => 1,
        ]);

        // Delete first module
        $response = $this->actingAs($user)
            ->deleteJson("/teaching/{$trainingPath->id}/modules/{$module1->id}");
        $response->assertSuccessful();

        // Verify module 1 is deleted
        $this->assertDatabaseMissing('training_path_modules', ['id' => $module1->id]);

        // Create a new module
        $createResponse = $this->actingAs($user)
            ->postJson("/teaching/{$trainingPath->id}/modules", [
                'title' => 'New Module',
            ]);
        $createResponse->assertCreated();

        $newModuleData = $createResponse->json('data');
        $newModuleId = $newModuleData['id'];

        // Verify new module exists in database
        $this->assertDatabaseHas('training_path_modules', [
            'id' => $newModuleId,
            'training_path_id' => $trainingPath->id,
            'title' => 'New Module',
        ]);

        // Try to delete the newly created module - this should work!
        $deleteResponse = $this->actingAs($user)
            ->deleteJson("/teaching/{$trainingPath->id}/modules/{$newModuleId}");

        // This is where the bug manifests - 404 instead of 200
        $deleteResponse->assertSuccessful();

        // Verify module is deleted
        $this->assertDatabaseMissing('training_path_modules', ['id' => $newModuleId]);
    }
}
