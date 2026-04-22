<?php

namespace Tests\Feature;

use App\Enums\TrainingPathStatus;
use App\Models\TrainingPath;
use App\Models\TrainingPathEnrollment;
use App\Models\TrainingPathModule;
use App\Models\TrainingUnit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TrainingPathControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_browse_approved_training_paths(): void
    {
        TrainingPath::factory()->approved()->count(3)->create();
        TrainingPath::factory()->create(['status' => TrainingPathStatus::DRAFT]);
        TrainingPath::factory()->pendingReview()->create();

        $response = $this->get('/trainingPaths');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('trainingPaths/index')
            ->has('trainingPaths', 3)
            ->has('categories')
        );
    }

    public function test_guest_can_view_approved_training_path_details(): void
    {
        $trainingPath = TrainingPath::factory()->approved()->create();
        $module = TrainingPathModule::factory()->create(['training_path_id' => $trainingPath->id]);
        TrainingUnit::factory()->count(3)->create(['module_id' => $module->id]);

        $response = $this->get("/trainingPaths/{$trainingPath->id}");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('trainingPaths/show')
            ->has('trainingPath')
            ->where('trainingPath.id', $trainingPath->id)
            ->has('trainingPath.modules', 1)
        );
    }

    public function test_guest_cannot_view_draft_training_path(): void
    {
        $trainingPath = TrainingPath::factory()->create(['status' => TrainingPathStatus::DRAFT]);

        $response = $this->get("/trainingPaths/{$trainingPath->id}");

        $response->assertNotFound();
    }

    public function test_authenticated_user_can_enroll_in_training_path(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create();

        $response = $this->actingAs($user)->post("/trainingPaths/{$trainingPath->id}/enroll");

        $response->assertRedirect();
        $this->assertDatabaseHas('training_path_enrollments', [
            'user_id' => $user->id,
            'training_path_id' => $trainingPath->id,
        ]);
    }

    public function test_guest_cannot_enroll_in_training_path(): void
    {
        $trainingPath = TrainingPath::factory()->approved()->create();

        $response = $this->post("/trainingPaths/{$trainingPath->id}/enroll");

        $response->assertRedirect('/login');
    }

    public function test_user_cannot_enroll_twice_in_same_training_path(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create();

        TrainingPathEnrollment::factory()->create([
            'user_id' => $user->id,
            'training_path_id' => $trainingPath->id,
        ]);

        $response = $this->actingAs($user)->post("/trainingPaths/{$trainingPath->id}/enroll");

        $response->assertRedirect();
        $this->assertDatabaseCount('training_path_enrollments', 1);
    }

    public function test_enrolled_user_can_view_training_unit(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create();
        $module = TrainingPathModule::factory()->create(['training_path_id' => $trainingPath->id]);
        $trainingUnit = TrainingUnit::factory()->create(['module_id' => $module->id]);

        TrainingPathEnrollment::factory()->create([
            'user_id' => $user->id,
            'training_path_id' => $trainingPath->id,
        ]);

        $response = $this->actingAs($user)->get("/trainingPaths/{$trainingPath->id}/trainingUnit/{$trainingUnit->id}");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('trainingPaths/trainingUnit')
            ->has('trainingPath')
            ->has('trainingUnit')
            ->where('trainingUnit.id', (string) $trainingUnit->id)
        );
    }

    public function test_non_enrolled_user_cannot_view_training_unit(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create();
        $module = TrainingPathModule::factory()->create(['training_path_id' => $trainingPath->id]);
        $trainingUnit = TrainingUnit::factory()->create(['module_id' => $module->id]);

        $response = $this->actingAs($user)->get("/trainingPaths/{$trainingPath->id}/trainingUnit/{$trainingUnit->id}");

        $response->assertForbidden();
    }

    public function test_user_can_mark_training_unit_as_complete(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create();
        $module = TrainingPathModule::factory()->create(['training_path_id' => $trainingPath->id]);
        $trainingUnit = TrainingUnit::factory()->create(['module_id' => $module->id]);

        TrainingPathEnrollment::factory()->create([
            'user_id' => $user->id,
            'training_path_id' => $trainingPath->id,
        ]);

        $response = $this->actingAs($user)->post("/trainingPaths/{$trainingPath->id}/trainingUnits/{$trainingUnit->id}/complete");

        $response->assertOk();
        $this->assertDatabaseHas('training_unit_progress', [
            'user_id' => $user->id,
            'training_unit_id' => $trainingUnit->id,
        ]);
    }

    public function test_guest_cannot_mark_training_unit_complete(): void
    {
        $trainingPath = TrainingPath::factory()->approved()->create();
        $module = TrainingPathModule::factory()->create(['training_path_id' => $trainingPath->id]);
        $trainingUnit = TrainingUnit::factory()->create(['module_id' => $module->id]);

        $response = $this->post("/trainingPaths/{$trainingPath->id}/trainingUnits/{$trainingUnit->id}/complete");

        $response->assertRedirect('/login');
    }
}
