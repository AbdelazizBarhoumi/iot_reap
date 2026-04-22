<?php

namespace Tests\Feature;

use App\Models\Camera;
use App\Models\GatewayNode;
use App\Models\UsbDevice;
use App\Models\User;
use App\Services\GatewayService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class HardwareCameraRegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_engineer_can_convert_usb_device_to_camera(): void
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

        $this->mock(GatewayService::class, function ($mock) use ($node) {
            $mock->shouldReceive('findCaptureDeviceForUsbCamera')
                ->once()
                ->withArgs(fn ($gatewayNode, $usbDevice) => $gatewayNode->is($node))
                ->andReturn('/dev/video2');

            $mock->shouldReceive('startCameraStream')
                ->once()
                ->andReturn([
                    'success' => true,
                    'device_path' => '/dev/video2',
                ]);
        });

        $this->actingAs($user)
            ->postJson("/hardware/devices/{$device->id}/convert-to-camera")
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('stream_started', true);

        $this->assertDatabaseHas('usb_devices', [
            'id' => $device->id,
            'is_camera' => true,
        ]);

        $this->assertDatabaseHas('cameras', [
            'usb_device_id' => $device->id,
            'gateway_node_id' => $node->id,
            'source_url' => '/dev/video2',
            'status' => 'active',
        ]);
    }

    public function test_engineer_can_manage_camera_lifecycle_from_hardware_endpoints(): void
    {
        $user = User::factory()->admin()->create([
            'email_verified_at' => now(),
        ]);

        $node = GatewayNode::factory()->verified()->create();
        $device = UsbDevice::factory()->for($node)->create([
            'is_camera' => true,
        ]);

        Camera::factory()->inactive()->usb()->create([
            'gateway_node_id' => $node->id,
            'usb_device_id' => $device->id,
            'robot_id' => null,
        ]);

        $this->mock(GatewayService::class, function ($mock) {
            $mock->shouldReceive('stopCameraStream')
                ->atLeast()->once();

            $mock->shouldReceive('startCameraStream')
                ->atLeast()->once()
                ->andReturn([
                    'success' => true,
                    'device_path' => '/dev/video3',
                ]);

            $mock->shouldReceive('getCameraStreamStatus')
                ->atLeast()->once()
                ->andReturn([
                    'running' => true,
                    'pid' => 12345,
                ]);
        });

        $this->actingAs($user)
            ->postJson("/hardware/devices/{$device->id}/activate-camera")
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->actingAs($user)
            ->putJson("/hardware/devices/{$device->id}/camera-settings", [
                'width' => 800,
                'height' => 600,
                'framerate' => 20,
            ])
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->actingAs($user)
            ->deleteJson("/hardware/devices/{$device->id}/camera")
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('cameras', [
            'usb_device_id' => $device->id,
        ]);
    }

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

    public function test_gateway_refresh_removes_stale_usb_camera_records(): void
    {
        $user = User::factory()->admin()->create([
            'email_verified_at' => now(),
        ]);

        $node = GatewayNode::factory()->verified()->create([
            'name' => 'gateway-refresh',
            'ip' => '192.168.50.77',
            'port' => 8000,
        ]);

        $device = UsbDevice::factory()->for($node)->create([
            'busid' => '8-1',
            'vendor_id' => '0c45',
            'product_id' => '6536',
            'name' => 'Microdia Camera',
            'is_camera' => true,
        ]);

        $camera = Camera::factory()->inactive()->usb()->create([
            'gateway_node_id' => $node->id,
            'usb_device_id' => $device->id,
            'stream_key' => 'usb-gateway-refresh-81',
            'source_url' => '/dev/video5',
            'robot_id' => null,
        ]);

        Http::fake([
            "{$node->api_url}/devices" => Http::response(['devices' => []], 200),
        ]);

        $this->actingAs($user)
            ->postJson("/hardware/nodes/{$node->id}/refresh")
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('cameras', [
            'id' => $camera->id,
        ]);

        $this->assertDatabaseMissing('usb_devices', [
            'id' => $device->id,
        ]);
    }

    public function test_reconnected_usb_camera_can_be_converted_again_after_refresh_cleanup(): void
    {
        $user = User::factory()->admin()->create([
            'email_verified_at' => now(),
        ]);

        $node = GatewayNode::factory()->verified()->create([
            'name' => 'gateway-reconnect',
            'ip' => '192.168.50.78',
            'port' => 8000,
        ]);

        $staleDevice = UsbDevice::factory()->for($node)->create([
            'busid' => '9-1',
            'vendor_id' => '0c45',
            'product_id' => '6536',
            'name' => 'Microdia Camera',
            'is_camera' => true,
        ]);

        Camera::factory()->inactive()->usb()->create([
            'gateway_node_id' => $node->id,
            'usb_device_id' => $staleDevice->id,
            'stream_key' => 'usb-gateway-reconnect-91',
            'source_url' => '/dev/video6',
            'robot_id' => null,
        ]);

        Http::fake([
            "{$node->api_url}/devices" => Http::response(['devices' => []], 200),
        ]);

        $this->actingAs($user)
            ->postJson("/hardware/nodes/{$node->id}/refresh")
            ->assertOk();

        $reconnectedDevice = UsbDevice::factory()->for($node)->create([
            'busid' => '9-1',
            'vendor_id' => '0c45',
            'product_id' => '6536',
            'name' => 'Microdia Camera',
            'is_camera' => false,
        ]);

        $this->mock(GatewayService::class, function ($mock) {
            $mock->shouldReceive('findCaptureDeviceForUsbCamera')
                ->once()
                ->andReturn('/dev/video6');

            $mock->shouldReceive('startCameraStream')
                ->once()
                ->andReturn([
                    'success' => true,
                    'device_path' => '/dev/video6',
                ]);
        });

        $response = $this->actingAs($user)
            ->postJson("/hardware/devices/{$reconnectedDevice->id}/convert-to-camera");

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('stream_started', true);

        $this->assertDatabaseHas('cameras', [
            'usb_device_id' => $reconnectedDevice->id,
            'gateway_node_id' => $node->id,
            'stream_key' => 'usb-gateway-reconnect-91',
        ]);
    }
}
