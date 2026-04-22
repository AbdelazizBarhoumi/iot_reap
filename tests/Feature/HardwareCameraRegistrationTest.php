<?php

namespace Tests\Feature;

use App\Models\GatewayNode;
use App\Models\User;
use App\Models\UsbDevice;
use App\Services\GatewayService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HardwareCameraRegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_convert_to_camera_resolves_the_real_capture_device_and_starts_the_stream(): void
    {
        $user = User::factory()->admin()->create([
            'email_verified_at' => now(),
        ]);

        $node = GatewayNode::factory()->verified()->create([
            'name' => 'gateway',
        ]);

        $device = UsbDevice::factory()->for($node)->create([
            'busid' => '5-3',
            'vendor_id' => '0c45',
            'product_id' => '6536',
            'name' => 'Microdia Camera',
            'is_camera' => false,
        ]);

        $this->mock(GatewayService::class, function ($mock) use ($node, $device) {
            $mock->shouldReceive('findCaptureDeviceForUsbCamera')
                ->once()
                ->withArgs(fn ($gatewayNode, $usbDevice) => $gatewayNode->is($node) && $usbDevice->is($device))
                ->andReturn('/dev/video4');

            $mock->shouldReceive('startCameraStream')
                ->once()
                ->withArgs(function ($gatewayNode, $streamKey, $devicePath, $options) use ($node): bool {
                    return $gatewayNode->is($node)
                        && $streamKey === 'usb-gateway-53'
                        && $devicePath === '/dev/video4'
                        && ($options['usb_busid'] ?? null) === '5-3'
                        && ($options['vendor_id'] ?? null) === '0c45'
                        && ($options['product_id'] ?? null) === '6536';
                })
                ->andReturn([
                    'success' => true,
                    'device_path' => '/dev/video4',
                ]);
        });

        $response = $this->actingAs($user)
            ->postJson("/hardware/devices/{$device->id}/convert-to-camera");

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('camera.status', 'active')
            ->assertJsonPath('stream_started', true);

        $this->assertDatabaseHas('cameras', [
            'usb_device_id' => $device->id,
            'gateway_node_id' => $node->id,
            'source_url' => '/dev/video4',
            'status' => 'active',
            'stream_key' => 'usb-gateway-53',
        ]);

        $this->assertDatabaseHas('usb_devices', [
            'id' => $device->id,
            'is_camera' => true,
        ]);
    }
}
