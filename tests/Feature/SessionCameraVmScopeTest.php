<?php

namespace Tests\Feature;

use App\Models\Camera;
use App\Models\Robot;
use App\Models\User;
use App\Models\VMSession;
use App\Services\CameraService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Feature tests for camera VM scoping:
 * - Users see cameras assigned to their session's VM
 * - Users also see cameras that are not attached to any VM
 * - Users with different VMs see different VM-specific cameras
 * - Multiple users with same VM see the same cameras
 */
class SessionCameraVmScopeTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private VMSession $session;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->engineer()->create();
    }

    // ─── VM Scoping Tests ───────────────────────────────────

    public function test_user_sees_assigned_and_unassigned_cameras_for_their_session_vm(): void
    {
        // Create a session with vm_id = 100
        $session = VMSession::factory()->active()->create([
            'user_id' => $this->user->id,
            'vm_id' => 100,
        ]);

        // Create robot for cameras
        $robot = Robot::factory()->create();

        // Camera assigned to VM 100 (should be visible)
        $assignedCamera = Camera::factory()->active()->create([
            'robot_id' => $robot->id,
            'assigned_vm_id' => 100,
            'name' => 'Assigned Camera',
        ]);

        // Camera assigned to different VM (should NOT be visible)
        $otherVmCamera = Camera::factory()->active()->create([
            'robot_id' => $robot->id,
            'assigned_vm_id' => 200,
            'name' => 'Other VM Camera',
        ]);

        // Unassigned camera (should NOT be visible)
        $unassignedCamera = Camera::factory()->active()->create([
            'robot_id' => $robot->id,
            'assigned_vm_id' => null,
            'name' => 'Unassigned Camera',
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/sessions/{$session->id}/cameras");

        $response->assertOk();

        $cameraNames = collect($response->json('data'))->pluck('name')->toArray();

        $this->assertContains('Assigned Camera', $cameraNames);
        $this->assertNotContains('Other VM Camera', $cameraNames);
        $this->assertContains('Unassigned Camera', $cameraNames);
    }

    public function test_unassigned_cameras_are_visible_to_sessions_without_vm_id(): void
    {
        $session = VMSession::factory()->create([
            'user_id' => $this->user->id,
            'vm_id' => null,
            'status' => 'pending',
        ]);

        $robot = Robot::factory()->create();

        $unassignedCamera = Camera::factory()->active()->create([
            'robot_id' => $robot->id,
            'assigned_vm_id' => null,
            'name' => 'Unassigned Camera',
        ]);

        Camera::factory()->active()->create([
            'robot_id' => $robot->id,
            'assigned_vm_id' => 100,
            'name' => 'Assigned Camera',
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/sessions/{$session->id}/cameras");

        $response->assertOk();

        $cameraNames = collect($response->json('data'))->pluck('name')->toArray();
        $this->assertContains('Unassigned Camera', $cameraNames);
        $this->assertNotContains('Assigned Camera', $cameraNames);
    }

    public function test_users_with_different_vms_see_different_cameras(): void
    {
        $user2 = User::factory()->engineer()->create();

        // Create sessions with different vm_ids
        $session1 = VMSession::factory()->active()->create([
            'user_id' => $this->user->id,
            'vm_id' => 100,
        ]);

        $session2 = VMSession::factory()->active()->create([
            'user_id' => $user2->id,
            'vm_id' => 200,
        ]);

        $robot = Robot::factory()->create();

        // Camera for VM 100
        $camera1 = Camera::factory()->active()->create([
            'robot_id' => $robot->id,
            'assigned_vm_id' => 100,
            'name' => 'VM100 Camera',
        ]);

        // Camera for VM 200
        $camera2 = Camera::factory()->active()->create([
            'robot_id' => $robot->id,
            'assigned_vm_id' => 200,
            'name' => 'VM200 Camera',
        ]);

        // User 1 sees only VM100 camera
        $response1 = $this->actingAs($this->user)
            ->getJson("/sessions/{$session1->id}/cameras");

        $cameraNames1 = collect($response1->json('data'))->pluck('name')->toArray();
        $this->assertContains('VM100 Camera', $cameraNames1);
        $this->assertNotContains('VM200 Camera', $cameraNames1);

        // User 2 sees only VM200 camera
        $response2 = $this->actingAs($user2)
            ->getJson("/sessions/{$session2->id}/cameras");

        $cameraNames2 = collect($response2->json('data'))->pluck('name')->toArray();
        $this->assertContains('VM200 Camera', $cameraNames2);
        $this->assertNotContains('VM100 Camera', $cameraNames2);
    }

    public function test_multiple_users_on_same_vm_see_same_cameras(): void
    {
        $user2 = User::factory()->engineer()->create();

        // Both sessions on same VM
        $session1 = VMSession::factory()->active()->create([
            'user_id' => $this->user->id,
            'vm_id' => 100,
        ]);

        $session2 = VMSession::factory()->active()->create([
            'user_id' => $user2->id,
            'vm_id' => 100,
        ]);

        $robot = Robot::factory()->create();

        $camera = Camera::factory()->active()->create([
            'robot_id' => $robot->id,
            'assigned_vm_id' => 100,
            'name' => 'Shared Camera',
        ]);

        // User 1 sees the camera
        $response1 = $this->actingAs($this->user)
            ->getJson("/sessions/{$session1->id}/cameras");

        $cameraNames1 = collect($response1->json('data'))->pluck('name')->toArray();
        $this->assertContains('Shared Camera', $cameraNames1);

        // User 2 sees the same camera
        $response2 = $this->actingAs($user2)
            ->getJson("/sessions/{$session2->id}/cameras");

        $cameraNames2 = collect($response2->json('data'))->pluck('name')->toArray();
        $this->assertContains('Shared Camera', $cameraNames2);
    }

    public function test_session_without_vm_id_sees_unassigned_cameras(): void
    {
        // Session with no VM assigned should still see unassigned cameras.
        $session = VMSession::factory()->create([
            'user_id' => $this->user->id,
            'vm_id' => null,
            'status' => 'pending',
        ]);

        $robot = Robot::factory()->create();

        $unassignedCamera = Camera::factory()->active()->create([
            'robot_id' => $robot->id,
            'assigned_vm_id' => null,
            'name' => 'Unassigned Camera',
        ]);

        Camera::factory()->active()->create([
            'robot_id' => $robot->id,
            'assigned_vm_id' => 100,
            'name' => 'Assigned Camera',
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/sessions/{$session->id}/cameras");

        $response->assertOk();
        $cameraNames = collect($response->json('data'))->pluck('name')->toArray();
        $this->assertContains('Unassigned Camera', $cameraNames);
        $this->assertNotContains('Assigned Camera', $cameraNames);
    }

    public function test_unassigned_cameras_are_visible_to_regular_users(): void
    {
        $session = VMSession::factory()->active()->create([
            'user_id' => $this->user->id,
            'vm_id' => 100,
        ]);

        $robot = Robot::factory()->create();

        // Unassigned camera
        Camera::factory()->active()->create([
            'robot_id' => $robot->id,
            'assigned_vm_id' => null,
            'name' => 'Unassigned Camera',
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/sessions/{$session->id}/cameras");

        $response->assertOk();
        $cameraNames = collect($response->json('data'))->pluck('name')->toArray();
        $this->assertContains('Unassigned Camera', $cameraNames);
    }

    // ─── Service Level Tests ───────────────────────────────────

    public function test_camera_service_returns_assigned_and_unassigned_cameras_for_session(): void
    {
        $session = VMSession::factory()->active()->create([
            'user_id' => $this->user->id,
            'vm_id' => 100,
        ]);

        $robot = Robot::factory()->create();

        $assignedCamera = Camera::factory()->active()->create([
            'robot_id' => $robot->id,
            'assigned_vm_id' => 100,
        ]);

        Camera::factory()->active()->create([
            'robot_id' => $robot->id,
            'assigned_vm_id' => 200,
        ]);

        $unassignedCamera = Camera::factory()->active()->create([
            'robot_id' => $robot->id,
            'assigned_vm_id' => null,
        ]);

        $service = app(CameraService::class);
        $cameras = $service->getCamerasForSession($session->id);

        $this->assertCount(2, $cameras);
        $this->assertTrue($cameras->pluck('id')->contains($assignedCamera->id));
        $this->assertTrue($cameras->pluck('id')->contains($unassignedCamera->id));
    }

    // ─── Camera Model Scopes ───────────────────────────────────

    public function test_camera_scope_for_vm_id(): void
    {
        $robot = Robot::factory()->create();

        $camera1 = Camera::factory()->create([
            'robot_id' => $robot->id,
            'assigned_vm_id' => 100,
        ]);

        $camera2 = Camera::factory()->create([
            'robot_id' => $robot->id,
            'assigned_vm_id' => 200,
        ]);

        $camera3 = Camera::factory()->create([
            'robot_id' => $robot->id,
            'assigned_vm_id' => null,
        ]);

        $vm100Cameras = Camera::forVmId(100)->get();

        $this->assertCount(1, $vm100Cameras);
        $this->assertEquals($camera1->id, $vm100Cameras->first()->id);
    }

    public function test_camera_scope_unassigned(): void
    {
        $robot = Robot::factory()->create();

        Camera::factory()->create([
            'robot_id' => $robot->id,
            'assigned_vm_id' => 100,
        ]);

        $unassigned = Camera::factory()->create([
            'robot_id' => $robot->id,
            'assigned_vm_id' => null,
        ]);

        $unassignedCameras = Camera::unassigned()->get();

        $this->assertCount(1, $unassignedCameras);
        $this->assertEquals($unassigned->id, $unassignedCameras->first()->id);
    }

    public function test_camera_is_assigned_to_method(): void
    {
        $robot = Robot::factory()->create();

        $camera = Camera::factory()->create([
            'robot_id' => $robot->id,
            'assigned_vm_id' => 100,
        ]);

        $this->assertTrue($camera->isAssignedTo(100));
        $this->assertFalse($camera->isAssignedTo(200));
        $this->assertTrue($camera->isAssigned());
    }

    public function test_camera_assign_and_unassign_methods(): void
    {
        $robot = Robot::factory()->create();

        $camera = Camera::factory()->create([
            'robot_id' => $robot->id,
            'assigned_vm_id' => null,
        ]);

        // Initially unassigned
        $this->assertFalse($camera->isAssigned());

        // Assign to VM
        $camera->assignToVm(100);
        $camera->refresh();

        $this->assertTrue($camera->isAssigned());
        $this->assertTrue($camera->isAssignedTo(100));

        // Unassign
        $camera->unassignFromVm();
        $camera->refresh();

        $this->assertFalse($camera->isAssigned());
        $this->assertNull($camera->assigned_vm_id);
    }
}
