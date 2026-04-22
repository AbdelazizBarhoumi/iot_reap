<?php

namespace Tests\Feature;

use App\Enums\CameraStatus;
use App\Models\Camera;
use App\Models\CameraSessionControl;
use App\Models\ProxmoxNode;
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
                        'stream_urls' => ['hls', 'webrtc'],
                        'is_controlled',
                        'created_at',
                    ],
                ],
            ]);

        $response->assertJsonCount(2, 'data');
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
                        'hls' => 'http://192.168.50.6:8888/test-ptz-cam/index.m3u8',
                        'webrtc' => 'http://192.168.50.6:8889/test-ptz-cam',
                    ],
                ],
            ]);
    }
}
