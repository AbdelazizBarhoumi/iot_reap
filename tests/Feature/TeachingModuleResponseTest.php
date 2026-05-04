<?php

namespace Tests\Feature;

use App\Models\TrainingPath;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeachingModuleResponseTest extends TestCase
{
    use RefreshDatabase;

    public function test_module_create_response_structure(): void
    {
        // Create a user and training path
        $user = User::factory()->teacher()->create();
        $trainingPath = TrainingPath::factory()
            ->for($user, 'instructor')
            ->create();

        // Create a new module
        $response = $this->actingAs($user)
            ->postJson("/teaching/{$trainingPath->id}/modules", [
                'title' => 'Test Module',
            ]);

        $response->assertCreated();

        $data = $response->json('data');
        // Assertions
        $this->assertIsArray($data);
        $this->assertArrayHasKey('id', $data);
        $this->assertArrayHasKey('title', $data);
        $this->assertEquals('Test Module', $data['title']);
    }
}
