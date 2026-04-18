<?php

namespace Tests\Feature;

use App\Enums\TrainingPathStatus;
use App\Enums\UserRole;
use App\Models\TrainingPath;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminTrainingPathControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_pending_trainingPaths(): void
    {
        $admin = User::factory()->create(['role' => UserRole::ADMIN]);
        TrainingPath::factory()->pendingReview()->count(2)->create();
        TrainingPath::factory()->approved()->create();

        $response = $this->actingAs($admin)->get('/admin/trainingPaths');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('admin/TrainingPathsPage')
            ->has('pendingTrainingPaths', 2)
        );
    }

    public function test_non_admin_cannot_view_pending_trainingPaths(): void
    {
        $user = User::factory()->create(['role' => UserRole::ENGINEER]);

        $response = $this->actingAs($user)->get('/admin/trainingPaths');

        $response->assertForbidden();
    }

    public function test_guest_cannot_view_pending_trainingPaths(): void
    {
        $response = $this->get('/admin/trainingPaths');

        $response->assertRedirect('/login');
    }

    public function test_admin_can_approve_trainingPath(): void
    {
        $admin = User::factory()->create(['role' => UserRole::ADMIN]);
        $trainingPath = TrainingPath::factory()->pendingReview()->create();

        $response = $this->actingAs($admin)->post("/admin/trainingPaths/{$trainingPath->id}/approve");

        $response->assertOk();
        $this->assertDatabaseHas('training_paths', [
            'id' => $trainingPath->id,
            'status' => TrainingPathStatus::APPROVED->value,
        ]);
    }

    public function test_non_admin_cannot_approve_trainingPath(): void
    {
        $user = User::factory()->create(['role' => UserRole::ENGINEER]);
        $trainingPath = TrainingPath::factory()->pendingReview()->create();

        $response = $this->actingAs($user)->post("/admin/trainingPaths/{$trainingPath->id}/approve");

        $response->assertForbidden();
        $this->assertDatabaseHas('training_paths', [
            'id' => $trainingPath->id,
            'status' => TrainingPathStatus::PENDING_REVIEW->value,
        ]);
    }

    public function test_admin_can_reject_training_path_with_feedback(): void
    {
        $admin = User::factory()->create(['role' => UserRole::ADMIN]);
        $trainingPath = TrainingPath::factory()->pendingReview()->create();

        $response = $this->actingAs($admin)->post("/admin/trainingPaths/{$trainingPath->id}/reject", [
            'feedback' => 'Content needs improvement',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('training_paths', [
            'id' => $trainingPath->id,
            'status' => TrainingPathStatus::REJECTED->value,
            'admin_feedback' => 'Content needs improvement',
        ]);
    }

    public function test_non_admin_cannot_reject_trainingPath(): void
    {
        $user = User::factory()->create(['role' => UserRole::ENGINEER]);
        $trainingPath = TrainingPath::factory()->pendingReview()->create();

        $response = $this->actingAs($user)->post("/admin/trainingPaths/{$trainingPath->id}/reject", [
            'feedback' => 'Not allowed',
        ]);

        $response->assertForbidden();
        $this->assertDatabaseHas('training_paths', [
            'id' => $trainingPath->id,
            'status' => TrainingPathStatus::PENDING_REVIEW->value,
        ]);
    }

    public function test_reject_requires_feedback(): void
    {
        $admin = User::factory()->create(['role' => UserRole::ADMIN]);
        $trainingPath = TrainingPath::factory()->pendingReview()->create();

        $response = $this->actingAs($admin)->post("/admin/trainingPaths/{$trainingPath->id}/reject", [
            'feedback' => '',
        ]);

        $response->assertSessionHasErrors(['feedback']);
    }
}
