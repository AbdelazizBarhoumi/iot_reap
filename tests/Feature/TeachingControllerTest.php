<?php

namespace Tests\Feature;

use App\Enums\TrainingPathStatus;
use App\Models\TrainingPath;
use App\Models\TrainingPathModule;
use App\Models\TrainingUnit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeachingControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_teacher_can_view_teaching_dashboard(): void
    {
        $user = User::factory()->teacher()->create();
        TrainingPath::factory()->count(2)->create(['instructor_id' => $user->id]);

        $response = $this->actingAs($user)->get('/teaching');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('teaching/index')
            ->has('trainingPaths', 2)
            ->has('stats')
            ->where('stats.completionRate', 0)
        );
    }

    public function test_guest_cannot_access_teaching_dashboard(): void
    {
        $response = $this->get('/teaching');

        $response->assertRedirect('/login');
    }

    public function test_instructor_can_create_trainingPath(): void
    {
        $user = User::factory()->teacher()->create();

        $trainingPathData = [
            'title' => 'New Training Path',
            'description' => 'Training path description',
            'category' => 'Smart Manufacturing',
            'level' => 'Beginner',
            'duration' => '40 hours',
            'has_virtual_machine' => true,
        ];

        $response = $this->actingAs($user)->post('/teaching', $trainingPathData);

        $response->assertRedirect();
        $this->assertDatabaseHas('training_paths', [
            'title' => 'New Training Path',
            'instructor_id' => $user->id,
            'status' => TrainingPathStatus::DRAFT->value,
        ]);
    }

    public function test_instructor_can_update_own_trainingPath(): void
    {
        $user = User::factory()->teacher()->create();
        $trainingPath = TrainingPath::factory()->create([
            'instructor_id' => $user->id,
            'title' => 'Original Path Title',
        ]);

        $response = $this->actingAs($user)->patch("/teaching/{$trainingPath->id}", [
            'title' => 'Updated Path Title',
            'description' => 'Updated Path Description',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('training_paths', [
            'id' => $trainingPath->id,
            'title' => 'Updated Path Title',
        ]);
    }

    public function test_instructor_cannot_update_other_instructor_trainingPath(): void
    {
        $instructor1 = User::factory()->teacher()->create();
        $instructor2 = User::factory()->teacher()->create();
        $trainingPath = TrainingPath::factory()->create(['instructor_id' => $instructor1->id]);

        $response = $this->actingAs($instructor2)->patch("/teaching/{$trainingPath->id}", [
            'title' => 'Hacked Path Title',
        ]);

        $response->assertForbidden();
        $this->assertDatabaseHas('training_paths', [
            'id' => $trainingPath->id,
            'instructor_id' => $instructor1->id,
        ]);
    }

    public function test_instructor_can_delete_own_trainingPath(): void
    {
        $user = User::factory()->teacher()->create();
        $trainingPath = TrainingPath::factory()->create(['instructor_id' => $user->id]);
        $trainingPathId = $trainingPath->id;

        $response = $this->actingAs($user)->delete("/teaching/{$trainingPath->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('training_paths', ['id' => $trainingPathId]);
    }

    public function test_instructor_cannot_delete_other_instructor_trainingPath(): void
    {
        $instructor1 = User::factory()->teacher()->create();
        $instructor2 = User::factory()->teacher()->create();
        $trainingPath = TrainingPath::factory()->create(['instructor_id' => $instructor1->id]);

        $response = $this->actingAs($instructor2)->delete("/teaching/{$trainingPath->id}");

        $response->assertForbidden();
        $this->assertDatabaseHas('training_paths', ['id' => $trainingPath->id]);
    }

    public function test_instructor_can_submit_training_path_for_review(): void
    {
        $user = User::factory()->teacher()->create();
        $trainingPath = TrainingPath::factory()->create([
            'instructor_id' => $user->id,
            'status' => TrainingPathStatus::DRAFT,
        ]);

        $response = $this->actingAs($user)->post("/teaching/{$trainingPath->id}/submit");

        $response->assertOk();
        $this->assertDatabaseHas('training_paths', [
            'id' => $trainingPath->id,
            'status' => TrainingPathStatus::PENDING_REVIEW->value,
        ]);
    }

    public function test_instructor_can_add_module_to_trainingPath(): void
    {
        $user = User::factory()->teacher()->create();
        $trainingPath = TrainingPath::factory()->create(['instructor_id' => $user->id]);

        $response = $this->actingAs($user)->post("/teaching/{$trainingPath->id}/modules", [
            'title' => 'Module 1',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('training_path_modules', [
            'training_path_id' => $trainingPath->id,
            'title' => 'Module 1',
        ]);
    }

    public function test_instructor_can_update_module(): void
    {
        $user = User::factory()->teacher()->create();
        $trainingPath = TrainingPath::factory()->create(['instructor_id' => $user->id]);
        $module = TrainingPathModule::factory()->create(['training_path_id' => $trainingPath->id]);

        $response = $this->actingAs($user)->patch("/teaching/{$trainingPath->id}/modules/{$module->id}", [
            'title' => 'Updated Module',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('training_path_modules', [
            'id' => $module->id,
            'title' => 'Updated Module',
        ]);
    }

    public function test_instructor_can_delete_module(): void
    {
        $user = User::factory()->teacher()->create();
        $trainingPath = TrainingPath::factory()->create(['instructor_id' => $user->id]);
        $module = TrainingPathModule::factory()->create(['training_path_id' => $trainingPath->id]);
        $moduleId = $module->id;

        $response = $this->actingAs($user)->delete("/teaching/{$trainingPath->id}/modules/{$module->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('training_path_modules', ['id' => $moduleId]);
    }

    public function test_instructor_can_add_training_unit_to_module(): void
    {
        $user = User::factory()->teacher()->create();
        $trainingPath = TrainingPath::factory()->create(['instructor_id' => $user->id]);
        $module = TrainingPathModule::factory()->create(['training_path_id' => $trainingPath->id]);

        $trainingUnitData = [
            'title' => 'TrainingUnit 1',
            'type' => 'video',
            'duration' => '30 min',
            'content' => 'TrainingUnit content',
        ];

        $response = $this->actingAs($user)->post("/teaching/{$trainingPath->id}/modules/{$module->id}/trainingUnits", $trainingUnitData);

        $response->assertCreated();
        $this->assertDatabaseHas('training_units', [
            'module_id' => $module->id,
            'title' => 'TrainingUnit 1',
        ]);
    }

    public function test_instructor_can_update_trainingUnit(): void
    {
        $user = User::factory()->teacher()->create();
        $trainingPath = TrainingPath::factory()->create(['instructor_id' => $user->id]);
        $module = TrainingPathModule::factory()->create(['training_path_id' => $trainingPath->id]);
        $trainingUnit = TrainingUnit::factory()->create(['module_id' => $module->id]);

        $response = $this->actingAs($user)->patch("/teaching/{$trainingPath->id}/modules/{$module->id}/trainingUnits/{$trainingUnit->id}", [
            'title' => 'Updated TrainingUnit',
            'type' => 'video',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('training_units', [
            'id' => $trainingUnit->id,
            'title' => 'Updated TrainingUnit',
        ]);
    }

    public function test_instructor_can_delete_trainingUnit(): void
    {
        $user = User::factory()->teacher()->create();
        $trainingPath = TrainingPath::factory()->create(['instructor_id' => $user->id]);
        $module = TrainingPathModule::factory()->create(['training_path_id' => $trainingPath->id]);
        $trainingUnit = TrainingUnit::factory()->create(['module_id' => $module->id]);
        $trainingUnitId = $trainingUnit->id;

        $response = $this->actingAs($user)->delete("/teaching/{$trainingPath->id}/modules/{$module->id}/trainingUnits/{$trainingUnit->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('training_units', ['id' => $trainingUnitId]);
    }

    public function test_engineer_cannot_access_teaching_dashboard(): void
    {
        $user = User::factory()->engineer()->create();

        $response = $this->actingAs($user)->get('/teaching');

        $response->assertForbidden();
    }
}
