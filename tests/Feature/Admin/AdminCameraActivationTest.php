<?php

namespace Tests\Feature\Admin;

use App\Models\Camera;
use App\Models\GatewayNode;
use App\Models\User;
use App\Models\UsbDevice;
use App\Services\GatewayService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCameraActivationTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create([
            'email_verified_at' => now(),
        ]);
    }

    public function test_admin_activate_starts_a_usb_camera_stream_before_marking_it_active(): void
    {
        $node = GatewayNode::factory()->verified()->create();
        $usbDevice = UsbDevice::factory()->for($node)->create([
            'busid' => '5-1',
            'vendor_id' => '0c45',
            'product_id' => '6536',
        ]);

        $camera = Camera::factory()->inactive()->usb()->create([
            'robot_id' => null,
            'gateway_node_id' => $node->id,
            'usb_device_id' => $usbDevice->id,
            'source_url' => '/dev/video0',
            'stream_key' => 'usb-gateway-51',
        ]);

        $this->mock(GatewayService::class, function ($mock) {
            $mock->shouldReceive('getCameraStreamStatus')
                ->twice()
                ->andReturn(
                    [
                        'running' => false,
                        'mediamtx_status' => ['exists' => false],
                    ],
                    [
                        'running' => true,
                        'mediamtx_status' => ['exists' => true],
                    ]
                );

            $mock->shouldReceive('startCameraStream')
                ->once()
                ->withArgs(function ($gatewayNode, $streamKey, $devicePath, $options): bool {
                    return $streamKey === 'usb-gateway-51'
                        && $devicePath === '/dev/video0'
                        && ($options['usb_busid'] ?? null) === '5-1'
                        && ($options['vendor_id'] ?? null) === '0c45'
                        && ($options['product_id'] ?? null) === '6536';
                })
                ->andReturn([
                    'success' => true,
                    'device_path' => '/dev/video4',
                ]);
        });

        $response = $this->actingAs($this->admin)
            ->putJson("/admin/cameras/{$camera->id}/activate");

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'active');

        $this->assertDatabaseHas('cameras', [
            'id' => $camera->id,
            'status' => 'active',
            'source_url' => '/dev/video4',
        ]);
    }

    public function test_admin_activate_returns_validation_error_when_the_stream_cannot_be_started(): void
    {
        $node = GatewayNode::factory()->verified()->create();

        $camera = Camera::factory()->inactive()->usb()->create([
            'robot_id' => null,
            'gateway_node_id' => $node->id,
            'source_url' => '/dev/video0',
            'stream_key' => 'usb-gateway-51',
        ]);

        $this->mock(GatewayService::class, function ($mock) {
            $mock->shouldReceive('getCameraStreamStatus')
                ->once()
                ->andReturn([
                    'running' => false,
                    'mediamtx_status' => ['exists' => false],
                ]);

            $mock->shouldReceive('startCameraStream')
                ->once()
                ->andReturn([
                    'success' => false,
                    'error' => 'Camera management API unavailable for gateway gateway.',
                ]);
        });

        $response = $this->actingAs($this->admin)
            ->putJson("/admin/cameras/{$camera->id}/activate");

        $response->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Camera management API unavailable for gateway gateway.');

        $this->assertDatabaseHas('cameras', [
            'id' => $camera->id,
            'status' => 'inactive',
        ]);
    }
}
