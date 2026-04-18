<?php

namespace Tests\Feature;

use App\Enums\CameraType;
use App\Models\Camera;
use App\Models\GatewayNode;
use App\Models\Robot;
use App\Models\User;
use App\Models\VMSession;
use App\Services\GatewayService;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * Feature tests for the camera streaming flow:
 * - Session camera listing
 * - Resolution change (manual + auto)
 * - Resolution presets endpoint
 * - Camera detection → session flow
 */
class CameraStreamingFlowTest extends TestCase
{
    private User $user;

    private VMSession $session;

    private Camera $camera;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->engineer()->create();
        $this->session = VMSession::factory()->active()->create([
            'user_id' => $this->user->id,
            'vm_id' => 100, // Use fixed VM ID for predictable testing
        ]);

        $robot = Robot::factory()->create();
        $this->camera = Camera::factory()->active()->usb()->create([
            'robot_id' => $robot->id,
            'assigned_vm_id' => 100, // Assign to session's VM
            'stream_width' => 640,
            'stream_height' => 480,
            'stream_framerate' => 15,
            'stream_input_format' => 'mjpeg',
        ]);
    }

    // ─── Session Camera List ───────────────────────────────────

    public function test_authenticated_user_can_list_session_cameras(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson("/sessions/{$this->session->id}/cameras");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'stream_key',
                        'type',
                        'status',
                        'stream_settings' => ['width', 'height', 'framerate', 'input_format', 'resolution_label'],
                        'stream_urls' => ['hls', 'webrtc'],
                    ],
                ],
            ]);
    }

    public function test_session_camera_list_includes_webrtc_url(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson("/sessions/{$this->session->id}/cameras");

        $response->assertOk();

        $cameras = $response->json('data');
        $this->assertNotEmpty($cameras);

        foreach ($cameras as $cam) {
            $this->assertArrayHasKey('webrtc', $cam['stream_urls']);
            $this->assertArrayHasKey('hls', $cam['stream_urls']);
            // WebRTC URL should contain the stream_key
            $this->assertStringContainsString($cam['stream_key'], $cam['stream_urls']['webrtc']);
        }
    }

    public function test_unauthenticated_user_cannot_list_cameras(): void
    {
        $response = $this->getJson("/sessions/{$this->session->id}/cameras");
        $response->assertUnauthorized();
    }

    // ─── Resolution Presets ────────────────────────────────────

    public function test_user_can_get_resolution_presets(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson("/sessions/{$this->session->id}/cameras/resolutions");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['width', 'height', 'label', 'recommended_framerate'],
                ],
            ]);

        $resolutions = $response->json('data');
        $this->assertGreaterThanOrEqual(3, count($resolutions));

        // Verify known presets exist
        $widths = array_column($resolutions, 'width');
        $this->assertContains(640, $widths);
        $this->assertContains(1280, $widths);
    }

    // ─── Resolution Change (Manual) ───────────────────────────

    public function test_user_can_change_camera_resolution_manually(): void
    {
        // Mock HTTP for API availability check
        Http::fake([
            '*/camera/start' => Http::response('', 405), // Method not allowed = endpoint exists
        ]);

        // Mock the GatewayService to avoid actual HTTP calls
        $this->mock(GatewayService::class, function ($mock) {
            $mock->shouldReceive('stopCameraStream')->once();
            $mock->shouldReceive('startCameraStream')
                ->once()
                ->andReturn(['success' => true, 'pid' => 1234]);
        });

        // Camera needs a gateway node for stream restart
        $node = GatewayNode::factory()->create();
        $this->camera->update([
            'gateway_node_id' => $node->id,
            'robot_id' => null,
        ]);

        $response = $this->actingAs($this->user)
            ->putJson("/sessions/{$this->session->id}/cameras/{$this->camera->id}/resolution", [
                'mode' => 'manual',
                'width' => 1280,
                'height' => 720,
                'framerate' => 10,
            ]);

        $response->assertOk()
            ->assertJson([
                'stream_restarted' => true,
            ])
            ->assertJsonPath('data.stream_settings.width', 1280)
            ->assertJsonPath('data.stream_settings.height', 720)
            ->assertJsonPath('data.stream_settings.framerate', 10);

        // Verify DB was updated
        $this->camera->refresh();
        $this->assertEquals(1280, $this->camera->stream_width);
        $this->assertEquals(720, $this->camera->stream_height);
        $this->assertEquals(10, $this->camera->stream_framerate);
    }

    public function test_user_can_change_camera_resolution_to_auto(): void
    {
        // Mock HTTP for API availability check
        Http::fake([
            '*/camera/start' => Http::response('', 405),
        ]);

        $this->mock(GatewayService::class, function ($mock) {
            $mock->shouldReceive('stopCameraStream')->once();
            $mock->shouldReceive('startCameraStream')
                ->once()
                ->andReturn(['success' => true]);
        });

        $node = GatewayNode::factory()->create();
        $this->camera->update([
            'gateway_node_id' => $node->id,
            'robot_id' => null,
            'type' => CameraType::USB,
        ]);

        $response = $this->actingAs($this->user)
            ->putJson("/sessions/{$this->session->id}/cameras/{$this->camera->id}/resolution", [
                'mode' => 'auto',
            ]);

        $response->assertOk();

        // USB auto should default to 640x480@15fps
        $this->camera->refresh();
        $this->assertEquals(640, $this->camera->stream_width);
        $this->assertEquals(480, $this->camera->stream_height);
        $this->assertEquals(15, $this->camera->stream_framerate);
    }

    public function test_auto_resolution_for_ip_camera_selects_720p(): void
    {
        // Mock HTTP for API availability check
        Http::fake([
            '*/camera/start' => Http::response('', 405),
        ]);

        $this->mock(GatewayService::class, function ($mock) {
            $mock->shouldReceive('stopCameraStream')->once();
            $mock->shouldReceive('startCameraStream')
                ->once()
                ->andReturn(['success' => true]);
        });

        $node = GatewayNode::factory()->create();
        $this->camera->update([
            'gateway_node_id' => $node->id,
            'robot_id' => null,
            'type' => CameraType::IP,
        ]);

        $response = $this->actingAs($this->user)
            ->putJson("/sessions/{$this->session->id}/cameras/{$this->camera->id}/resolution", [
                'mode' => 'auto',
            ]);

        $response->assertOk();

        $this->camera->refresh();
        $this->assertEquals(1280, $this->camera->stream_width);
        $this->assertEquals(720, $this->camera->stream_height);
        $this->assertEquals(25, $this->camera->stream_framerate);
    }

    // ─── Validation ────────────────────────────────────────────

    public function test_resolution_change_rejects_invalid_mode(): void
    {
        $response = $this->actingAs($this->user)
            ->putJson("/sessions/{$this->session->id}/cameras/{$this->camera->id}/resolution", [
                'mode' => 'invalid',
            ]);

        $response->assertUnprocessable();
    }

    public function test_manual_mode_requires_width_and_height(): void
    {
        $response = $this->actingAs($this->user)
            ->putJson("/sessions/{$this->session->id}/cameras/{$this->camera->id}/resolution", [
                'mode' => 'manual',
                // missing width and height
            ]);

        $response->assertUnprocessable();
    }

    public function test_rejects_invalid_resolution_dimensions(): void
    {
        $response = $this->actingAs($this->user)
            ->putJson("/sessions/{$this->session->id}/cameras/{$this->camera->id}/resolution", [
                'mode' => 'manual',
                'width' => 999,
                'height' => 555,
            ]);

        $response->assertUnprocessable();
    }

    // ─── Authorization ─────────────────────────────────────────

    public function test_other_user_cannot_change_resolution_on_another_session(): void
    {
        $otherUser = User::factory()->engineer()->create();

        $response = $this->actingAs($otherUser)
            ->putJson("/sessions/{$this->session->id}/cameras/{$this->camera->id}/resolution", [
                'mode' => 'auto',
            ]);

        $response->assertForbidden();
    }

    public function test_admin_can_change_resolution_on_any_session(): void
    {
        $admin = User::factory()->admin()->create();

        // Mock HTTP for API availability check
        Http::fake([
            '*/camera/start' => Http::response('', 405),
        ]);

        $this->mock(GatewayService::class, function ($mock) {
            $mock->shouldReceive('stopCameraStream')->once();
            $mock->shouldReceive('startCameraStream')
                ->once()
                ->andReturn(['success' => true]);
        });

        $node = GatewayNode::factory()->create();
        $this->camera->update([
            'gateway_node_id' => $node->id,
            'robot_id' => null,
        ]);

        $response = $this->actingAs($admin)
            ->putJson("/sessions/{$this->session->id}/cameras/{$this->camera->id}/resolution", [
                'mode' => 'manual',
                'width' => 320,
                'height' => 240,
                'framerate' => 30,
            ]);

        $response->assertOk();
    }

    // ─── Stream URLs Structure ─────────────────────────────────

    public function test_camera_resource_contains_correct_stream_url_structure(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson("/sessions/{$this->session->id}/cameras/{$this->camera->id}");

        $response->assertOk();

        $data = $response->json('data');
        $streamKey = $data['stream_key'];

        // HLS URL must end with /index.m3u8
        $this->assertStringEndsWith('/index.m3u8', $data['stream_urls']['hls']);
        $this->assertStringContainsString($streamKey, $data['stream_urls']['hls']);

        // WebRTC URL must contain the stream_key
        $this->assertStringContainsString($streamKey, $data['stream_urls']['webrtc']);

        // Stream settings must have all fields
        $this->assertArrayHasKey('width', $data['stream_settings']);
        $this->assertArrayHasKey('height', $data['stream_settings']);
        $this->assertArrayHasKey('framerate', $data['stream_settings']);
        $this->assertArrayHasKey('resolution_label', $data['stream_settings']);
    }

    // ─── Available Resolutions Model ───────────────────────────

    public function test_camera_model_returns_available_resolutions(): void
    {
        $resolutions = Camera::getAvailableResolutions();

        $this->assertIsArray($resolutions);
        $this->assertGreaterThanOrEqual(4, count($resolutions));

        foreach ($resolutions as $res) {
            $this->assertArrayHasKey('width', $res);
            $this->assertArrayHasKey('height', $res);
            $this->assertArrayHasKey('label', $res);
            $this->assertArrayHasKey('recommended_framerate', $res);
        }

        // Check 1080p is included
        $widths = array_column($resolutions, 'width');
        $this->assertContains(1920, $widths);
    }

    // ─── Auto Resolution Service ───────────────────────────────

    public function test_auto_resolution_returns_correct_preset_for_each_type(): void
    {
        $service = app(\App\Services\CameraService::class);

        $usbCamera = Camera::factory()->usb()->make();
        $auto = $service->getAutoResolution($usbCamera);
        $this->assertEquals(640, $auto['width']);
        $this->assertEquals(480, $auto['height']);

        $ipCamera = Camera::factory()->ipCamera()->make();
        $auto = $service->getAutoResolution($ipCamera);
        $this->assertEquals(1280, $auto['width']);
        $this->assertEquals(720, $auto['height']);

        $esp32Camera = Camera::factory()->esp32Cam()->make();
        $auto = $service->getAutoResolution($esp32Camera);
        $this->assertEquals(640, $auto['width']);
        $this->assertEquals(10, $auto['framerate']);
    }

    // ─── WHEP Proxy ────────────────────────────────────────────

    public function test_whep_proxy_forwards_sdp_to_mediamtx(): void
    {
        $sdpOffer = "v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n";
        $sdpAnswer = "v=0\r\no=- 1 1 IN IP4 192.168.50.6\r\ns=-\r\nt=0 0\r\n";

        $baseHost = config('gateway.mediamtx_url', '192.168.50.6');
        $webrtcPort = config('gateway.mediamtx_webrtc_port', 8889);
        $expectedUrl = "http://{$baseHost}:{$webrtcPort}/{$this->camera->stream_key}/whep";

        Http::fake([
            $expectedUrl => Http::response($sdpAnswer, 201, [
                'Content-Type' => 'application/sdp',
                'Location' => '/session/abc123',
            ]),
        ]);

        $response = $this->actingAs($this->user)
            ->call(
                'POST',
                "/sessions/{$this->session->id}/cameras/{$this->camera->id}/whep",
                [],
                [],
                [],
                ['CONTENT_TYPE' => 'application/sdp'],
                $sdpOffer
            );

        $response->assertStatus(201);
        $this->assertStringContainsString('192.168.50.6', $response->getContent());
        $this->assertEquals('application/sdp', $response->headers->get('Content-Type'));
    }

    public function test_whep_proxy_returns_error_when_mediamtx_unreachable(): void
    {
        $sdpOffer = "v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\n";

        Http::fake([
            '*' => Http::response('Connection refused', 502),
        ]);

        $response = $this->actingAs($this->user)
            ->call(
                'POST',
                "/sessions/{$this->session->id}/cameras/{$this->camera->id}/whep",
                [],
                [],
                [],
                ['CONTENT_TYPE' => 'application/sdp'],
                $sdpOffer
            );

        $response->assertStatus(502);
    }

    public function test_whep_proxy_rejects_unauthenticated_user(): void
    {
        $response = $this->postJson(
            "/sessions/{$this->session->id}/cameras/{$this->camera->id}/whep"
        );

        $response->assertUnauthorized();
    }

    public function test_whep_proxy_rejects_other_users_session(): void
    {
        $otherUser = User::factory()->engineer()->create();

        $response = $this->actingAs($otherUser)
            ->call(
                'POST',
                "/sessions/{$this->session->id}/cameras/{$this->camera->id}/whep",
                [],
                [],
                [],
                ['CONTENT_TYPE' => 'application/sdp'],
                'v=0'
            );

        $response->assertForbidden();
    }
}
