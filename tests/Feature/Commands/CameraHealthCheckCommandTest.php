<?php

namespace Tests\Feature\Commands;

use App\Enums\CameraStatus;
use App\Models\Camera;
use App\Models\GatewayNode;
use App\Models\UsbDevice;
use App\Services\GatewayService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CameraHealthCheckCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_recovers_an_active_usb_camera_and_updates_the_device_path(): void
    {
        $node = GatewayNode::factory()->verified()->create([
            'ip' => '192.168.50.6',
        ]);

        $device = UsbDevice::factory()->for($node)->create([
            'busid' => '5-1',
            'vendor_id' => '0c45',
            'product_id' => '6536',
            'is_camera' => true,
        ]);

        $camera = Camera::factory()->usb()->active()->create([
            'gateway_node_id' => $node->id,
            'usb_device_id' => $device->id,
            'stream_key' => 'usb-gateway-51',
            'source_url' => '/dev/video9',
        ]);

        $this->mock(GatewayService::class, function ($mock) use ($camera, $device, $node) {
            $mock->shouldReceive('getCameraStreamStatus')
                ->twice()
                ->withArgs(fn ($gatewayNode, $streamKey) => $gatewayNode->is($node) && $streamKey === 'usb-gateway-51')
                ->andReturn(
                    [
                        'running' => false,
                        'gateway_api_available' => true,
                    ],
                    [
                        'running' => true,
                        'gateway_api_available' => true,
                    ]
                );

            $mock->shouldReceive('findCaptureDeviceForUsbCamera')
                ->once()
                ->withArgs(fn ($gatewayNode, $usbDevice) => $gatewayNode->is($node) && $usbDevice->is($device))
                ->andReturn('/dev/video0');

            $mock->shouldReceive('startCameraStream')
                ->once()
                ->withArgs(function ($gatewayNode, $streamKey, $devicePath, $options) use ($node): bool {
                    return $gatewayNode->is($node)
                        && $streamKey === 'usb-gateway-51'
                        && $devicePath === '/dev/video0'
                        && ($options['usb_busid'] ?? null) === '5-1'
                        && ($options['vendor_id'] ?? null) === '0c45'
                        && ($options['product_id'] ?? null) === '6536';
                })
                ->andReturn([
                    'success' => true,
                    'device_path' => '/dev/video0',
                ]);

            $mock->shouldReceive('listCameraStreams')
                ->once()
                ->withArgs(fn ($gatewayNode) => $gatewayNode->is($node))
                ->andReturn([
                    ['stream_key' => 'usb-gateway-51', 'running' => true],
                ]);
        });

        $this->artisan('camera:health-check', [
            '--fix' => true,
            '--heal' => true,
            '--cleanup-orphans' => true,
        ])->assertSuccessful();

        $camera->refresh();

        $this->assertSame(CameraStatus::ACTIVE, $camera->status);
        $this->assertSame('/dev/video0', $camera->source_url);
    }

    public function test_it_marks_missing_usb_cameras_inactive_and_removes_orphan_streams(): void
    {
        $node = GatewayNode::factory()->verified()->create([
            'ip' => '192.168.50.6',
        ]);

        $device = UsbDevice::factory()->for($node)->create([
            'busid' => '5-1',
            'vendor_id' => '0c45',
            'product_id' => '6536',
            'is_camera' => true,
        ]);

        $camera = Camera::factory()->usb()->active()->create([
            'gateway_node_id' => $node->id,
            'usb_device_id' => $device->id,
            'stream_key' => 'usb-gateway-51',
            'source_url' => '/dev/video0',
        ]);

        $this->mock(GatewayService::class, function ($mock) use ($device, $node) {
            $mock->shouldReceive('getCameraStreamStatus')
                ->once()
                ->withArgs(fn ($gatewayNode, $streamKey) => $gatewayNode->is($node) && $streamKey === 'usb-gateway-51')
                ->andReturn([
                    'running' => false,
                    'gateway_api_available' => true,
                ]);

            $mock->shouldReceive('findCaptureDeviceForUsbCamera')
                ->once()
                ->withArgs(fn ($gatewayNode, $usbDevice) => $gatewayNode->is($node) && $usbDevice->is($device))
                ->andReturn(null);

            $mock->shouldReceive('listCameraStreams')
                ->once()
                ->withArgs(fn ($gatewayNode) => $gatewayNode->is($node))
                ->andReturn([
                    ['stream_key' => 'usb-gateway-51', 'running' => false],
                    ['stream_key' => 'stale-stream', 'running' => true],
                ]);

            $mock->shouldReceive('stopCameraStream')
                ->once()
                ->withArgs(fn ($gatewayNode, $streamKey) => $gatewayNode->is($node) && $streamKey === 'stale-stream')
                ->andReturn(['success' => true]);
        });

        $this->artisan('camera:health-check', [
            '--fix' => true,
            '--heal' => true,
            '--cleanup-orphans' => true,
        ])->assertSuccessful();

        $camera->refresh();

        $this->assertSame(CameraStatus::INACTIVE, $camera->status);
    }

    public function test_it_removes_orphan_streams_even_when_no_camera_rows_exist(): void
    {
        $node = GatewayNode::factory()->verified()->create([
            'ip' => '192.168.50.6',
        ]);

        $this->mock(GatewayService::class, function ($mock) use ($node) {
            $mock->shouldReceive('listCameraStreams')
                ->once()
                ->withArgs(fn ($gatewayNode) => $gatewayNode->is($node))
                ->andReturn([
                    ['stream_key' => 'stale-stream-a', 'running' => true],
                    ['stream_key' => 'stale-stream-b', 'running' => false],
                ]);

            $mock->shouldReceive('stopCameraStream')
                ->twice()
                ->withArgs(fn ($gatewayNode, $streamKey) => $gatewayNode->is($node) && in_array($streamKey, ['stale-stream-a', 'stale-stream-b'], true))
                ->andReturn(['success' => true]);
        });

        $this->artisan('camera:health-check', [
            '--cleanup-orphans' => true,
        ])->assertSuccessful();
    }
}
