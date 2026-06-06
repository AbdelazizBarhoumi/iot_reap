<?php

namespace Tests\Feature;

use App\Enums\CameraStatus;
use App\Models\Camera;
use App\Models\CameraSessionControl;
use App\Models\ProxmoxNode;
use App\Models\Reservation;
use App\Models\Robot;
use App\Models\User;
use App\Models\VMSession;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Feature tests for Session Camera endpoints.
 *
 * Covers:
 *  - Listing cameras for a session
 *  - Acquiring/releasing PTZ control
 *  - PTZ move commands
 *  - Authorization and conflict handling
 */
class SessionCameraTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private VMSession $session;

    private Robot $robot;

    private Camera $ptzCamera;

    private Camera $viewOnlyCamera;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $node = ProxmoxNode::factory()->online()->create();

        $this->session = VMSession::factory()->active()->create([
            'user_id' => $this->user->id,
            'node_id' => $node->id,
        ]);

        $this->robot = Robot::factory()->create([
            'name' => 'Test Robot',
            'identifier' => 'robot-test',
        ]);

        $this->ptzCamera = Camera::factory()->ptzCapable()->create([
            'robot_id' => $this->robot->id,
            'name' => 'PTZ Camera',
            'stream_key' => 'test-ptz-cam',
            'status' => CameraStatus::ACTIVE,
            'assigned_vm_id' => $this->session->vm_id,
        ]);

        $this->viewOnlyCamera = Camera::factory()->create([
            'robot_id' => $this->robot->id,
            'name' => 'View Only Camera',
            'stream_key' => 'test-view-cam',
            'status' => CameraStatus::ACTIVE,
            'ptz_capable' => false,
            'assigned_vm_id' => $this->session->vm_id,
        ]);
    }

    // ── List cameras ──

    public function test_user_can_list_cameras_for_session(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson("/sessions/{$this->session->id}/cameras");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'robot_id',
                        'robot_name',
                        'name',
                        'stream_key',
                        'type',
                        'type_label',
                        'status',
                        'status_label',
                        'ptz_capable',
                        'stream_urls' => ['webrtc'],
                        'is_controlled',
                        'created_at',
                    ],
                ],
            ]);

        $response->assertJsonCount(2, 'data');
    }

    public function test_user_sees_assigned_camera_even_when_inactive(): void
    {
        $assignedInactiveCamera = Camera::factory()->usb()->inactive()->create([
            'robot_id' => $this->robot->id,
            'name' => 'Dedicated Inactive Camera',
            'stream_key' => 'dedicated-inactive-cam',
            'assigned_vm_id' => $this->session->vm_id,
        ]);

        $otherVmSession = VMSession::factory()->active()->create([
            'user_id' => $this->user->id,
            'node_id' => $this->session->node_id,
            'vm_id' => $this->session->vm_id + 1,
        ]);

        $hiddenForOtherVm = Camera::factory()->usb()->inactive()->create([
            'robot_id' => $this->robot->id,
            'name' => 'Other VM Dedicated Camera',
            'stream_key' => 'other-vm-dedicated-cam',
            'assigned_vm_id' => $otherVmSession->vm_id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/sessions/{$this->session->id}/cameras");

        $response->assertOk();

        $cameraIds = collect($response->json('data'))->pluck('id')->all();

        $this->assertContains($assignedInactiveCamera->id, $cameraIds);
        $this->assertNotContains($hiddenForOtherVm->id, $cameraIds);
    }

    public function test_user_cannot_access_camera_assigned_to_another_vm(): void
    {
        $otherVmSession = VMSession::factory()->active()->create([
            'user_id' => $this->user->id,
            'node_id' => $this->session->node_id,
            'vm_id' => $this->session->vm_id + 11,
        ]);

        $camera = Camera::factory()->usb()->inactive()->create([
            'robot_id' => $this->robot->id,
            'name' => 'Restricted Camera',
            'stream_key' => 'restricted-camera',
            'assigned_vm_id' => $otherVmSession->vm_id,
        ]);

        $this->actingAs($this->user)
            ->getJson("/sessions/{$this->session->id}/cameras/{$camera->id}")
            ->assertForbidden();
    }

    public function test_unauthenticated_user_cannot_list_cameras(): void
    {
        $response = $this->getJson("/sessions/{$this->session->id}/cameras");

        $response->assertUnauthorized();
    }

    public function test_user_cannot_list_cameras_for_other_users_session(): void
    {
        $otherUser = User::factory()->create();

        $response = $this->actingAs($otherUser)
            ->getJson("/sessions/{$this->session->id}/cameras");

        $response->assertForbidden();
    }

    public function test_reservation_overrides_camera_dedication_for_reserving_user(): void
    {
        $reservingUser = User::factory()->create();
        $reservingNode = ProxmoxNode::factory()->online()->create();
        $reservingSession = VMSession::factory()->active()->create([
            'user_id' => $reservingUser->id,
            'node_id' => $reservingNode->id,
            'vm_id' => $this->session->vm_id + 99,
        ]);

        $camera = Camera::factory()->usb()->inactive()->create([
            'robot_id' => $this->robot->id,
            'name' => 'Dedicated Reserved Camera',
            'stream_key' => 'dedicated-reserved-camera',
            'assigned_vm_id' => $this->session->vm_id,
        ]);

        Reservation::factory()->forCamera($camera)->active()->create([
            'user_id' => $reservingUser->id,
            'requested_start_at' => now()->subHour(),
            'requested_end_at' => now()->addHour(),
            'approved_start_at' => now()->subHour(),
            'approved_end_at' => now()->addHour(),
        ]);

        $ownerResponse = $this->actingAs($this->user)
            ->getJson("/sessions/{$this->session->id}/cameras");
        $ownerResponse->assertOk();

        $ownerCameraIds = collect($ownerResponse->json('data'))->pluck('id')->all();
        $this->assertNotContains($camera->id, $ownerCameraIds);

        $reservingResponse = $this->actingAs($reservingUser)
            ->getJson("/sessions/{$reservingSession->id}/cameras");
        $reservingResponse->assertOk();

        $reservingCameraIds = collect($reservingResponse->json('data'))->pluck('id')->all();
        $this->assertContains($camera->id, $reservingCameraIds);
    }

    public function test_camera_returns_to_dedicated_vm_after_reservation_ends(): void
    {
        $reservingUser = User::factory()->create();
        $reservingNode = ProxmoxNode::factory()->online()->create();
        $reservingSession = VMSession::factory()->active()->create([
            'user_id' => $reservingUser->id,
            'node_id' => $reservingNode->id,
            'vm_id' => $this->session->vm_id + 77,
        ]);

        $camera = Camera::factory()->usb()->inactive()->create([
            'robot_id' => $this->robot->id,
            'name' => 'Expiring Dedicated Camera',
            'stream_key' => 'expiring-dedicated-camera',
            'assigned_vm_id' => $this->session->vm_id,
        ]);

        $reservation = Reservation::factory()->forCamera($camera)->active()->create([
            'user_id' => $reservingUser->id,
            'requested_start_at' => now()->subHour(),
            'requested_end_at' => now()->addHour(),
            'approved_start_at' => now()->subHour(),
            'approved_end_at' => now()->addHour(),
        ]);

        $dedicatedResponseDuringReservation = $this->actingAs($this->user)
            ->getJson("/sessions/{$this->session->id}/cameras");
        $dedicatedResponseDuringReservation->assertOk();

        $dedicatedIdsDuringReservation = collect($dedicatedResponseDuringReservation->json('data'))->pluck('id')->all();
        $this->assertNotContains($camera->id, $dedicatedIdsDuringReservation);

        $reservingResponse = $this->actingAs($reservingUser)
            ->getJson("/sessions/{$reservingSession->id}/cameras");
        $reservingResponse->assertOk();

        $reservingIdsDuringReservation = collect($reservingResponse->json('data'))->pluck('id')->all();
        $this->assertContains($camera->id, $reservingIdsDuringReservation);

        $reservation->update([
            'status' => 'completed',
            'approved_end_at' => now()->subMinute(),
            'actual_end_at' => now()->subMinute(),
        ]);

        $dedicatedResponseAfterEnd = $this->actingAs($this->user)
            ->getJson("/sessions/{$this->session->id}/cameras");
        $dedicatedResponseAfterEnd->assertOk();

        $dedicatedIdsAfterEnd = collect($dedicatedResponseAfterEnd->json('data'))->pluck('id')->all();
        $this->assertContains($camera->id, $dedicatedIdsAfterEnd);

        $reservingResponseAfterEnd = $this->actingAs($reservingUser)
            ->getJson("/sessions/{$reservingSession->id}/cameras");
        $reservingResponseAfterEnd->assertOk();

        $reservingIdsAfterEnd = collect($reservingResponseAfterEnd->json('data'))->pluck('id')->all();
        $this->assertNotContains($camera->id, $reservingIdsAfterEnd);
    }

    // ── Acquire control ──

    public function test_user_can_acquire_ptz_control(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson("/sessions/{$this->session->id}/cameras/{$this->ptzCamera->id}/control");

        $response->assertOk()
            ->assertJson([
                'message' => 'Camera control acquired.',
                'data' => [
                    'id' => $this->ptzCamera->id,
                    'is_controlled' => true,
                ],
            ]);

        $this->assertDatabaseHas('camera_session_controls', [
            'camera_id' => $this->ptzCamera->id,
            'session_id' => $this->session->id,
            'released_at' => null,
        ]);
    }

    public function test_cannot_acquire_control_of_non_ptz_camera(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson("/sessions/{$this->session->id}/cameras/{$this->viewOnlyCamera->id}/control");

        $response->assertStatus(422)
            ->assertJson([
                'message' => "Camera 'View Only Camera' does not support PTZ control.",
            ]);
    }

    public function test_cannot_acquire_control_when_another_session_controls_it(): void
    {
        // Another session already controls this camera
        $otherUser = User::factory()->create();
        $otherNode = ProxmoxNode::factory()->online()->create();
        $otherSession = VMSession::factory()->active()->create([
            'user_id' => $otherUser->id,
            'node_id' => $otherNode->id,
        ]);

        CameraSessionControl::create([
            'camera_id' => $this->ptzCamera->id,
            'session_id' => $otherSession->id,
            'acquired_at' => now(),
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/sessions/{$this->session->id}/cameras/{$this->ptzCamera->id}/control");

        $response->assertStatus(409)
            ->assertJsonFragment([
                'message' => "Camera 'PTZ Camera' is currently controlled by another session.",
            ]);
    }

    public function test_acquiring_control_when_already_controlling_returns_existing(): void
    {
        // First acquire
        $this->actingAs($this->user)
            ->postJson("/sessions/{$this->session->id}/cameras/{$this->ptzCamera->id}/control")
            ->assertOk();

        // Second acquire — should return existing control, not error
        $response = $this->actingAs($this->user)
            ->postJson("/sessions/{$this->session->id}/cameras/{$this->ptzCamera->id}/control");

        $response->assertOk()
            ->assertJson([
                'data' => [
                    'id' => $this->ptzCamera->id,
                    'is_controlled' => true,
                ],
            ]);

        // Only one control record
        $this->assertDatabaseCount('camera_session_controls', 1);
    }

    // ── Release control ──

    public function test_user_can_release_ptz_control(): void
    {
        // First acquire control
        CameraSessionControl::create([
            'camera_id' => $this->ptzCamera->id,
            'session_id' => $this->session->id,
            'acquired_at' => now(),
        ]);

        $response = $this->actingAs($this->user)
            ->deleteJson("/sessions/{$this->session->id}/cameras/{$this->ptzCamera->id}/control");

        $response->assertOk()
            ->assertJson([
                'message' => 'Camera control released.',
                'data' => [
                    'id' => $this->ptzCamera->id,
                    'is_controlled' => false,
                ],
            ]);

        $this->assertDatabaseMissing('camera_session_controls', [
            'camera_id' => $this->ptzCamera->id,
            'session_id' => $this->session->id,
            'released_at' => null,
        ]);
    }

    public function test_release_control_when_not_controlling_returns_422(): void
    {
        $response = $this->actingAs($this->user)
            ->deleteJson("/sessions/{$this->session->id}/cameras/{$this->ptzCamera->id}/control");

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'You do not control this camera.',
            ]);
    }

    // ── PTZ Move ──

    public function test_user_can_move_controlled_camera(): void
    {
        // Acquire control first
        CameraSessionControl::create([
            'camera_id' => $this->ptzCamera->id,
            'session_id' => $this->session->id,
            'acquired_at' => now(),
        ]);

        foreach (['up', 'down', 'left', 'right'] as $direction) {
            $response = $this->actingAs($this->user)
                ->postJson("/sessions/{$this->session->id}/cameras/{$this->ptzCamera->id}/move", [
                    'direction' => $direction,
                ]);

            $response->assertOk()
                ->assertJson([
                    'message' => "Camera moved {$direction}.",
                ]);
        }
    }

    public function test_cannot_move_camera_without_control(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson("/sessions/{$this->session->id}/cameras/{$this->ptzCamera->id}/move", [
                'direction' => 'up',
            ]);

        $response->assertStatus(409);
    }

    public function test_cannot_move_non_ptz_camera(): void
    {
        // Even if we somehow had a control record (shouldn't happen but testing defense)
        $response = $this->actingAs($this->user)
            ->postJson("/sessions/{$this->session->id}/cameras/{$this->viewOnlyCamera->id}/move", [
                'direction' => 'up',
            ]);

        $response->assertStatus(422);
    }

    public function test_move_validates_direction(): void
    {
        CameraSessionControl::create([
            'camera_id' => $this->ptzCamera->id,
            'session_id' => $this->session->id,
            'acquired_at' => now(),
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/sessions/{$this->session->id}/cameras/{$this->ptzCamera->id}/move", [
                'direction' => 'diagonal',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['direction']);
    }

    // ── Show single camera ──

    public function test_user_can_get_single_camera(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson("/sessions/{$this->session->id}/cameras/{$this->ptzCamera->id}");

        $response->assertOk()
            ->assertJson([
                'data' => [
                    'id' => $this->ptzCamera->id,
                    'name' => 'PTZ Camera',
                    'ptz_capable' => true,
                    'stream_urls' => [
                        'webrtc' => 'http://192.168.50.6:8889/test-ptz-cam',
                    ],
                ],
            ]);
    }
}
