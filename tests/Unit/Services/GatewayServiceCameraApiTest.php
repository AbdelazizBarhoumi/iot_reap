<?php

namespace Tests\Unit\Services;

use App\Models\GatewayNode;
use App\Models\UsbDevice;
use App\Services\GatewayService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class GatewayServiceCameraApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_uses_the_dedicated_camera_api_port_when_available(): void
    {
        config(['gateway.camera_api_port' => 8001]);

        $node = GatewayNode::factory()->create([
            'ip' => '192.168.50.10',
            'port' => 8000,
            'proxmox_camera_api_url' => null,
        ]);

        Http::fake([
            'http://192.168.50.10:8001/streams' => Http::response(['streams' => []], 200),
            'http://192.168.50.10:8001/streams/start' => Http::response([
                'pid' => 1234,
                'device_path' => '/dev/video4',
                'rtsp_url' => 'rtsp://192.168.50.6:8554/usb-gateway-51',
                'hls_url' => 'http://192.168.50.6:8888/usb-gateway-51/index.m3u8',
            ], 200),
            '*' => Http::response(['detail' => 'Not Found'], 404),
        ]);

        $result = app(GatewayService::class)->startCameraStream(
            $node,
            'usb-gateway-51',
            '/dev/video0',
            [
                'usb_busid' => '5-1',
                'vendor_id' => '0C45',
                'product_id' => '6536',
            ]
        );

        $this->assertTrue($result['success']);
        $this->assertSame(1234, $result['pid']);
        $this->assertSame('/dev/video4', $result['device_path']);

        Http::assertSent(function ($request) {
            $payload = json_decode($request->body(), true);

            return $request->url() === 'http://192.168.50.10:8001/streams/start'
                && ($payload['usb_busid'] ?? null) === '5-1'
                && ($payload['vendor_id'] ?? null) === '0c45'
                && ($payload['product_id'] ?? null) === '6536';
        });
        Http::assertNotSent(fn ($request) => $request->url() === 'http://192.168.50.10:8000/camera/start');
    }

    public function test_it_falls_back_to_legacy_camera_routes_when_dedicated_api_is_unavailable(): void
    {
        config(['gateway.camera_api_port' => 8001]);

        $node = GatewayNode::factory()->create([
            'ip' => '192.168.50.11',
            'port' => 8000,
            'proxmox_camera_api_url' => null,
        ]);

        Http::fake([
            'http://192.168.50.11:8001/streams' => Http::response(['detail' => 'Not Found'], 404),
            'http://192.168.50.11:8000/camera/status' => Http::response(['streams' => []], 200),
            'http://192.168.50.11:8000/camera/start' => Http::response([
                'pid' => 4567,
                'rtsp_url' => 'rtsp://192.168.50.6:8554/usb-gateway-52',
            ], 200),
        ]);

        $result = app(GatewayService::class)->startCameraStream(
            $node,
            'usb-gateway-52',
            '/dev/video0'
        );

        $this->assertTrue($result['success']);
        $this->assertSame(4567, $result['pid']);

        Http::assertSent(fn ($request) => $request->url() === 'http://192.168.50.11:8000/camera/start');
    }

    public function test_it_returns_a_clear_error_when_no_camera_management_api_is_available(): void
    {
        config(['gateway.camera_api_port' => 8001]);

        $node = GatewayNode::factory()->create([
            'name' => 'gateway',
            'ip' => '192.168.50.12',
            'port' => 8000,
            'proxmox_camera_api_url' => null,
        ]);

        Http::fake([
            '*' => Http::response(['detail' => 'Not Found'], 404),
        ]);

        $result = app(GatewayService::class)->startCameraStream(
            $node,
            'usb-gateway-53',
            '/dev/video0'
        );

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('Camera management API unavailable', $result['error']);
        $this->assertStringContainsString('http://192.168.50.12:8001/streams', $result['error']);
        $this->assertStringContainsString('http://192.168.50.12:8000/camera/status', $result['error']);
    }

    public function test_it_marks_the_stream_as_running_when_the_mediamtx_path_exists_via_api(): void
    {
        config([
            'gateway.camera_api_port' => 8001,
            'gateway.mediamtx_url' => '192.168.50.99',
            'gateway.mediamtx_api_port' => 9997,
        ]);

        $node = GatewayNode::factory()->create([
            'ip' => '192.168.50.13',
            'port' => 8000,
            'proxmox_camera_api_url' => null,
        ]);

        Http::fake([
            'http://192.168.50.13:8001/streams' => Http::response(['detail' => 'Not Found'], 404),
            'http://192.168.50.13:8000/camera/status' => Http::response(['detail' => 'Not Found'], 404),
            'http://192.168.50.13:9997/v3/paths/get/usb-gateway-54' => Http::response([
                'name' => 'usb-gateway-54',
                'source' => ['type' => 'rtspSession'],
            ], 200),
        ]);

        $result = app(GatewayService::class)->getCameraStreamStatus($node, 'usb-gateway-54');

        $this->assertTrue($result['running']);
        $this->assertFalse($result['gateway_api_available']);
        $this->assertTrue($result['mediamtx_status']['exists']);
        $this->assertTrue($result['mediamtx_status']['publishing']);
        $this->assertSame(200, $result['mediamtx_status']['status']);

        Http::assertSent(fn ($request) => $request->url() === 'http://192.168.50.13:9997/v3/paths/get/usb-gateway-54');
    }

    public function test_it_can_list_capture_devices_from_the_camera_api(): void
    {
        config(['gateway.camera_api_port' => 8001]);

        $node = GatewayNode::factory()->create([
            'ip' => '192.168.50.14',
            'port' => 8000,
            'proxmox_camera_api_url' => null,
        ]);

        Http::fake([
            'http://192.168.50.14:8001/streams' => Http::response(['streams' => []], 200),
            'http://192.168.50.14:8001/cameras' => Http::response([
                'devices' => [
                    [
                        'device_path' => '/dev/video0',
                        'usb_busid' => '5-1',
                        'vendor_id' => '0c45',
                        'product_id' => '6536',
                    ],
                ],
            ], 200),
        ]);

        $devices = app(GatewayService::class)->listCameraCaptureDevices($node);

        $this->assertCount(1, $devices);
        $this->assertSame('/dev/video0', $devices[0]['device_path']);
        $this->assertSame('5-1', $devices[0]['usb_busid']);
    }

    public function test_it_can_list_gateway_camera_streams(): void
    {
        config(['gateway.camera_api_port' => 8001]);

        $node = GatewayNode::factory()->create([
            'ip' => '192.168.50.15',
            'port' => 8000,
            'proxmox_camera_api_url' => null,
        ]);

        Http::fake([
            'http://192.168.50.15:8001/streams' => Http::response([
                'streams' => [
                    ['stream_key' => 'api', 'running' => true],
                    ['stream_key' => 'usb-gateway-51', 'running' => true],
                    ['stream_key' => 'stale-stream', 'running' => false],
                ],
            ], 200),
        ]);

        $streams = app(GatewayService::class)->listCameraStreams($node);

        $this->assertCount(2, $streams);
        $this->assertSame('usb-gateway-51', $streams[0]['stream_key']);
        $this->assertTrue($streams[0]['running']);
        $this->assertSame('stale-stream', $streams[1]['stream_key']);
    }

    public function test_it_prefers_usb_busid_when_multiple_identical_cameras_exist_on_one_gateway(): void
    {
        config(['gateway.camera_api_port' => 8001]);

        $node = GatewayNode::factory()->create([
            'ip' => '192.168.50.16',
            'port' => 8000,
            'proxmox_camera_api_url' => null,
        ]);

        $device = UsbDevice::factory()->for($node)->create([
            'busid' => '5-3',
            'vendor_id' => '0c45',
            'product_id' => '6536',
        ]);

        Http::fake([
            'http://192.168.50.16:8001/streams' => Http::response(['streams' => []], 200),
            'http://192.168.50.16:8001/cameras' => Http::response([
                'devices' => [
                    [
                        'device_path' => '/dev/video0',
                        'usb_busid' => '5-1',
                        'vendor_id' => '0c45',
                        'product_id' => '6536',
                    ],
                    [
                        'device_path' => '/dev/video4',
                        'usb_busid' => '5-3',
                        'vendor_id' => '0c45',
                        'product_id' => '6536',
                    ],
                ],
            ], 200),
        ]);

        $resolvedPath = app(GatewayService::class)->findCaptureDeviceForUsbCamera($node, $device);

        $this->assertSame('/dev/video4', $resolvedPath);
    }
}
