<?php

namespace Tests\Feature;

use App\Models\TrainingPath;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeachingModuleSyncTest extends TestCase
{
    use RefreshDatabase;

    public function test_modules_are_synced_with_database(): void
    {
        // Create a user and training path
        $user = User::factory()->teacher()->create();
        $trainingPath = TrainingPath::factory()
            ->for($user, 'instructor')
            ->create();

        // Create module 1
        $module1 = $trainingPath->modules()->create([
            'title' => 'Module 1',
            'sort_order' => 0,
        ]);

        // Verify module 1 is in database
        $this->assertDatabaseHas('training_path_modules', ['id' => $module1->id, 'title' => 'Module 1']);

        // Get the edit page response
        $response = $this->actingAs($user)
            ->getJson("/teaching/{$trainingPath->id}/edit");

        $response->assertSuccessful();
        $modules = $response->json('data.modules');

        // Verify module 1 is in the response
        $this->assertCount(1, $modules);
        $this->assertEquals($module1->id, $modules[0]['id']);

        // Create a new module via API
        $createResponse = $this->actingAs($user)
            ->postJson("/teaching/{$trainingPath->id}/modules", [
                'title' => 'Module 2',
            ]);

        $createResponse->assertCreated();
        $newModuleId = $createResponse->json('data.id');

        // Verify module 2 is in database
        $this->assertDatabaseHas('training_path_modules', [
            'id' => $newModuleId,
            'training_path_id' => $trainingPath->id,
            'title' => 'Module 2',
        ]);

        // Get the edit page again
        $response2 = $this->actingAs($user)
            ->getJson("/teaching/{$trainingPath->id}/edit");

        $response2->assertSuccessful();
        $modules2 = $response2->json('data.modules');

        // Both modules should be in the response
        $this->assertCount(2, $modules2, 'Both modules should be returned after creation');

        // Delete module 1
        $deleteResponse = $this->actingAs($user)
            ->deleteJson("/teaching/{$trainingPath->id}/modules/{$module1->id}");

        $deleteResponse->assertSuccessful();

        // Verify module 1 is deleted from database
        $this->assertDatabaseMissing('training_path_modules', ['id' => $module1->id]);

        // Get the edit page again
        $response3 = $this->actingAs($user)
            ->getJson("/teaching/{$trainingPath->id}/edit");

        $response3->assertSuccessful();
        $modules3 = $response3->json('data.modules');

        // Only module 2 should remain
        $this->assertCount(1, $modules3);
        $this->assertEquals($newModuleId, $modules3[0]['id']);
    }
}
