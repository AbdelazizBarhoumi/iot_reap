<?php

namespace Tests\Feature;

use App\Models\Camera;
use App\Models\Robot;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Feature tests for admin camera VM assignment endpoints.
 */
class AdminCameraAssignmentTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $engineer;

    private Camera $camera;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->admin()->create();
        $this->engineer = User::factory()->engineer()->create();

        $robot = Robot::factory()->create();
        $this->camera = Camera::factory()->create([
            'robot_id' => $robot->id,
            'assigned_vm_id' => null,
        ]);
    }

    // ─── Assign Camera to VM ───────────────────────────────────

    public function test_admin_can_assign_camera_to_vm(): void
    {
        $response = $this->actingAs($this->admin)
            ->putJson("/admin/cameras/{$this->camera->id}/assign", [
                'vm_id' => 100,
            ]);

        $response->assertOk()
            ->assertJsonPath('success', true);

        $this->camera->refresh();
        $this->assertEquals(100, $this->camera->assigned_vm_id);
    }

    public function test_non_admin_cannot_assign_camera_to_vm(): void
    {
        $response = $this->actingAs($this->engineer)
            ->putJson("/admin/cameras/{$this->camera->id}/assign", [
                'vm_id' => 100,
            ]);

        $response->assertForbidden();
    }

    public function test_assign_camera_requires_valid_vm_id(): void
    {
        $response = $this->actingAs($this->admin)
            ->putJson("/admin/cameras/{$this->camera->id}/assign", [
                'vm_id' => 'not-a-number',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['vm_id']);
    }

    public function test_assign_camera_requires_positive_vm_id(): void
    {
        $response = $this->actingAs($this->admin)
            ->putJson("/admin/cameras/{$this->camera->id}/assign", [
                'vm_id' => 0,
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['vm_id']);
    }

    // ─── Unassign Camera from VM ───────────────────────────────

    public function test_admin_can_unassign_camera_from_vm(): void
    {
        $this->camera->update(['assigned_vm_id' => 100]);

        $response = $this->actingAs($this->admin)
            ->deleteJson("/admin/cameras/{$this->camera->id}/assign");

        $response->assertOk()
            ->assertJsonPath('success', true);

        $this->camera->refresh();
        $this->assertNull($this->camera->assigned_vm_id);
    }

    public function test_non_admin_cannot_unassign_camera(): void
    {
        $this->camera->update(['assigned_vm_id' => 100]);

        $response = $this->actingAs($this->engineer)
            ->deleteJson("/admin/cameras/{$this->camera->id}/assign");

        $response->assertForbidden();
    }

    // ─── Bulk Assign ───────────────────────────────────────────

    public function test_admin_can_bulk_assign_cameras(): void
    {
        $robot = Robot::factory()->create();
        $camera2 = Camera::factory()->create([
            'robot_id' => $robot->id,
            'assigned_vm_id' => null,
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson('/admin/cameras/bulk-assign', [
                'assignments' => [
                    ['camera_id' => $this->camera->id, 'vm_id' => 100],
                    ['camera_id' => $camera2->id, 'vm_id' => 200],
                ],
            ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
            ]);

        $this->camera->refresh();
        $camera2->refresh();

        $this->assertEquals(100, $this->camera->assigned_vm_id);
        $this->assertEquals(200, $camera2->assigned_vm_id);
    }

    public function test_bulk_assign_can_unassign_with_null(): void
    {
        $this->camera->update(['assigned_vm_id' => 100]);

        $response = $this->actingAs($this->admin)
            ->postJson('/admin/cameras/bulk-assign', [
                'assignments' => [
                    ['camera_id' => $this->camera->id, 'vm_id' => null],
                ],
            ]);

        $response->assertOk();

        $this->camera->refresh();
        $this->assertNull($this->camera->assigned_vm_id);
    }

    public function test_bulk_assign_validates_camera_ids(): void
    {
        // Validation rejects non-existent cameras
        $response = $this->actingAs($this->admin)
            ->postJson('/admin/cameras/bulk-assign', [
                'assignments' => [
                    ['camera_id' => 99999, 'vm_id' => 200], // Non-existent
                ],
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['assignments.0.camera_id']);
    }

    public function test_non_admin_cannot_bulk_assign(): void
    {
        $response = $this->actingAs($this->engineer)
            ->postJson('/admin/cameras/bulk-assign', [
                'assignments' => [
                    ['camera_id' => $this->camera->id, 'vm_id' => 100],
                ],
            ]);

        $response->assertForbidden();
    }

    // ─── Camera List Includes assigned_vm_id ───────────────────

    public function test_admin_camera_list_includes_assigned_vm_id(): void
    {
        $this->camera->update(['assigned_vm_id' => 100]);

        $response = $this->actingAs($this->admin)
            ->getJson('/admin/cameras');

        $response->assertOk();

        $camera = collect($response->json('data'))
            ->firstWhere('id', $this->camera->id);

        $this->assertEquals(100, $camera['assigned_vm_id']);
    }
}
