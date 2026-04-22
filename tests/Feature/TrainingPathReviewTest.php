<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\TrainingPath;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TrainingPathReviewTest extends TestCase
{
    use RefreshDatabase;

    public function test_engineer_can_review_enrolled_course()
    {
        $engineer = User::factory()->create(['role' => UserRole::ENGINEER]);
        $trainingPath = TrainingPath::factory()->approved()->create();

        // Enroll engineer
        $engineer->enrolledTrainingPaths()->attach($trainingPath->id, ['enrolled_at' => now()]);

        $this->actingAs($engineer);

        $response = $this->postJson("/trainingPaths/{$trainingPath->id}/reviews", [
            'rating' => 5,
            'review' => 'Great course!',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('training_path_reviews', [
            'user_id' => $engineer->id,
            'training_path_id' => $trainingPath->id,
            'rating' => 5,
        ]);
    }

    public function test_engineer_cannot_review_unenrolled_course()
    {
        $engineer = User::factory()->create(['role' => UserRole::ENGINEER]);
        $trainingPath = TrainingPath::factory()->approved()->create();

        $this->actingAs($engineer);

        $response = $this->postJson("/trainingPaths/{$trainingPath->id}/reviews", [
            'rating' => 5,
            'review' => 'Great course!',
        ]);

        $response->assertStatus(403);
    }

    public function test_admin_can_review_unenrolled_course()
    {
        $admin = User::factory()->admin()->create();
        $trainingPath = TrainingPath::factory()->approved()->create();

        $this->actingAs($admin);

        $response = $this->postJson("/trainingPaths/{$trainingPath->id}/reviews", [
            'rating' => 5,
            'review' => 'Admin test review',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('training_path_reviews', [
            'user_id' => $admin->id,
            'training_path_id' => $trainingPath->id,
            'rating' => 5,
        ]);
    }
}
