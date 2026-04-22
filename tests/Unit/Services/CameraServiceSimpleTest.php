<?php

namespace Tests\Unit\Services;

use App\Enums\CameraType;
use App\Models\Camera;
use App\Models\VMSession;
use App\Repositories\CameraRepository;
use App\Repositories\CameraReservationRepository;
use App\Repositories\VMSessionRepository;
use App\Services\CameraService;
use App\Services\MqttService;
use Illuminate\Database\Eloquent\Collection;
use Mockery;
use Tests\TestCase;

class CameraServiceSimpleTest extends TestCase
{
    private CameraService $service;

    private $cameraRepository;

    private $reservationRepository;

    private $vmSessionRepository;

    private $mqttService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->cameraRepository = Mockery::mock(CameraRepository::class);
        $this->reservationRepository = Mockery::mock(CameraReservationRepository::class);
        $this->mqttService = Mockery::mock(MqttService::class);
        $this->vmSessionRepository = Mockery::mock(VMSessionRepository::class);

        $this->service = new CameraService(
            $this->cameraRepository,
            $this->reservationRepository,
            $this->mqttService,
            $this->vmSessionRepository,
        );
    }

    public function test_get_cameras_for_session_returns_all_cameras(): void
    {
        // Arrange
        $cameras = new Collection;
        $session = new VMSession;
        $session->id = 'session-123';
        $session->vm_id = 1;

        $this->vmSessionRepository
            ->shouldReceive('findById')
            ->with('session-123')
            ->once()
            ->andReturn($session);

        $this->cameraRepository
            ->shouldReceive('findByVmId')
            ->with(1)
            ->once()
            ->andReturn($cameras);

        // Act
        $result = $this->service->getCamerasForSession('session-123');

        // Assert
        $this->assertSame($cameras, $result);
    }

    public function test_get_auto_resolution_returns_correct_values_for_usb_camera(): void
    {
        // Create a real Camera model instance (not persisted)
        $usbCamera = new Camera;
        $usbCamera->type = CameraType::USB;

        $result = $this->service->getAutoResolution($usbCamera);

        $expected = ['width' => 640, 'height' => 480, 'framerate' => 15];
        $this->assertEquals($expected, $result);
    }

    public function test_get_auto_resolution_returns_correct_values_for_esp32_camera(): void
    {
        // Create a real Camera model instance (not persisted)
        $esp32Camera = new Camera;
        $esp32Camera->type = CameraType::ESP32_CAM;

        $result = $this->service->getAutoResolution($esp32Camera);

        $expected = ['width' => 640, 'height' => 480, 'framerate' => 10];
        $this->assertEquals($expected, $result);
    }

    public function test_get_auto_resolution_returns_correct_values_for_ip_camera(): void
    {
        // Create a real Camera model instance (not persisted)
        $ipCamera = new Camera;
        $ipCamera->type = CameraType::IP;

        $result = $this->service->getAutoResolution($ipCamera);

        $expected = ['width' => 1280, 'height' => 720, 'framerate' => 25];
        $this->assertEquals($expected, $result);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
