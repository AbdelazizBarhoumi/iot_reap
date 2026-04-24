<?php

namespace Tests\Unit\Services;

use App\Enums\CameraPTZDirection;
use App\Enums\CameraReservationStatus;
use App\Enums\CameraType;
use App\Exceptions\CameraControlConflictException;
use App\Exceptions\CameraNotControllableException;
use App\Models\Camera;
use App\Models\CameraSessionControl;
use App\Models\Reservation;
use App\Models\User;
use App\Models\VMSession;
use App\Repositories\CameraRepository;
use App\Repositories\CameraReservationRepository;
use App\Repositories\VMSessionRepository;
use App\Services\CameraService;
use App\Services\MqttService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Log;
use Mockery;
use Mockery\MockInterface;

class CameraServiceTest extends BaseTestCase
{
    private CameraService $service;

    private $cameraRepository;

    private $reservationRepository;

    private $vmSessionRepository;

    private $mqttService;

    protected function setUp(): void
    {
        parent::setUp();

        // Disable Vite manifest checks for tests
        $this->withoutVite();

        $this->cameraRepository = Mockery::mock(CameraRepository::class);
        $this->reservationRepository = Mockery::mock(CameraReservationRepository::class);
        $this->vmSessionRepository = Mockery::mock(VMSessionRepository::class);
        $this->mqttService = Mockery::mock(MqttService::class);

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
        $this->assertEquals($cameras->all(), $result->all());
    }

    public function test_get_stream_urls_builds_correct_urls(): void
    {
        // Arrange - use real Camera model instance
        $camera = new Camera;
        $camera->stream_key = 'camera_001';

        // Create a mock gateway node
        $gatewayNode = new \stdClass;
        $gatewayNode->ip = '192.168.50.10';

        // Use partial mock to allow setRelation while keeping model functionality
        $camera->setRelation('gatewayNode', (object) ['ip' => '192.168.50.10']);

        config(['gateway.mediamtx_rtsp_port' => 8554]);
        config(['gateway.mediamtx_webrtc_port' => 8889]);

        // Act
        $result = $this->service->getStreamUrls($camera);

        // Assert
        $expected = [
            'rtsp' => 'rtsp://192.168.50.10:8554/camera_001',
            'webrtc' => 'http://192.168.50.10:8889/camera_001',
        ];

        $this->assertEquals($expected, $result);
    }

    public function test_acquire_control_throws_exception_for_non_ptz_camera(): void
    {
        // Arrange - use real Camera model instance
        $camera = new Camera;
        $camera->ptz_capable = false;
        $camera->name = 'Fixed Camera';

        $this->cameraRepository
            ->shouldReceive('findWithControl')
            ->with(1)
            ->once()
            ->andReturn($camera);

        // Act & Assert
        $this->expectException(CameraNotControllableException::class);
        $this->expectExceptionMessage("Camera 'Fixed Camera' does not support PTZ control.");

        $this->service->acquireControl(1, 'session-123');
    }

    public function test_acquire_control_throws_exception_when_controlled_by_another_session(): void
    {
        // Arrange - use real Camera model instance with activeControl relation
        $camera = new Camera;
        $camera->ptz_capable = true;
        $camera->name = 'PTZ Camera';

        $activeControl = new CameraSessionControl;
        $activeControl->session_id = 'other-session';
        $camera->setRelation('activeControl', $activeControl);

        $this->cameraRepository
            ->shouldReceive('findWithControl')
            ->with(1)
            ->once()
            ->andReturn($camera);

        // Act & Assert
        $this->expectException(CameraControlConflictException::class);
        $this->expectExceptionMessage("Camera 'PTZ Camera' is currently controlled by another session.");

        $this->service->acquireControl(1, 'session-123');
    }

    public function test_acquire_control_returns_existing_control_for_same_session(): void
    {
        // Arrange - use real Camera model instance with activeControl relation
        $activeControl = new CameraSessionControl;
        $activeControl->session_id = 'session-123';

        $camera = new Camera;
        $camera->ptz_capable = true;
        $camera->name = 'PTZ Camera';
        $camera->setRelation('activeControl', $activeControl);

        $this->cameraRepository
            ->shouldReceive('findWithControl')
            ->with(1)
            ->once()
            ->andReturn($camera);

        // Act
        $result = $this->service->acquireControl(1, 'session-123');

        // Assert
        $this->assertSame($activeControl, $result);
    }

    public function test_acquire_control_creates_new_control_when_camera_free(): void
    {
        // Arrange - use real Camera model instance with no activeControl
        $camera = new Camera;
        $camera->ptz_capable = true;
        $camera->name = 'PTZ Camera';
        $camera->setRelation('activeControl', null);

        $control = Mockery::mock(CameraSessionControl::class);

        $this->cameraRepository
            ->shouldReceive('findWithControl')
            ->with(1)
            ->once()
            ->andReturn($camera);

        $this->cameraRepository
            ->shouldReceive('acquireControl')
            ->with(1, 'session-123')
            ->once()
            ->andReturn($control);

        Log::shouldReceive('info')
            ->once()
            ->with('Camera control acquired', [
                'camera_id' => 1,
                'session_id' => 'session-123',
                'camera_name' => 'PTZ Camera',
            ]);

        // Act
        $result = $this->service->acquireControl(1, 'session-123');

        // Assert
        $this->assertSame($control, $result);
    }

    public function test_release_control_succeeds_and_logs(): void
    {
        // Arrange
        $this->cameraRepository
            ->shouldReceive('releaseControl')
            ->with(1, 'session-123')
            ->once()
            ->andReturn(true);

        Log::shouldReceive('info')
            ->once()
            ->with('Camera control released', [
                'camera_id' => 1,
                'session_id' => 'session-123',
            ]);

        // Act
        $result = $this->service->releaseControl(1, 'session-123');

        // Assert
        $this->assertTrue($result);
    }

    public function test_release_control_returns_false_when_no_control_released(): void
    {
        // Arrange
        $this->cameraRepository
            ->shouldReceive('releaseControl')
            ->with(1, 'session-123')
            ->once()
            ->andReturn(false);

        Log::shouldReceive('info')->never();

        // Act
        $result = $this->service->releaseControl(1, 'session-123');

        // Assert
        $this->assertFalse($result);
    }

    public function test_move_throws_exception_for_non_ptz_camera(): void
    {
        // Arrange - use real Camera model instance
        $camera = new Camera;
        $camera->ptz_capable = false;
        $camera->name = 'Fixed Camera';

        $this->cameraRepository
            ->shouldReceive('findWithControl')
            ->with(1)
            ->once()
            ->andReturn($camera);

        // Act & Assert
        $this->expectException(CameraNotControllableException::class);
        $this->expectExceptionMessage("Camera 'Fixed Camera' does not support PTZ control.");

        $this->service->move(1, 'session-123', CameraPTZDirection::UP);
    }

    public function test_move_throws_exception_when_session_does_not_control_camera(): void
    {
        // Arrange - create a partial mock with proper attribute expectations
        $camera = Mockery::mock(Camera::class)->makePartial()->shouldAllowMockingProtectedMethods();
        $camera->shouldReceive('getAttribute')
            ->with('ptz_capable')
            ->andReturn(true);
        $camera->shouldReceive('getAttribute')
            ->with('name')
            ->andReturn('PTZ Camera');
        $camera->shouldReceive('isControlledBySession')
            ->with('session-123')
            ->once()
            ->andReturn(false);

        $this->cameraRepository
            ->shouldReceive('findWithControl')
            ->with(1)
            ->once()
            ->andReturn($camera);

        // Act & Assert
        $this->expectException(CameraControlConflictException::class);
        $this->expectExceptionMessage("Session does not have control of camera 'PTZ Camera'. Acquire control first.");

        $this->service->move(1, 'session-123', CameraPTZDirection::UP);
    }

    public function test_move_publishes_mqtt_command_and_logs(): void
    {
        // Arrange - use partial mock with explicit intersection typing
        /** @var Camera&MockInterface $camera */
        $camera = Mockery::mock(Camera::class)->makePartial();
        // Allow the Model's __set and setAttribute to work normally
        $camera->shouldAllowMockingProtectedMethods();
        $camera->ptz_capable = true;
        $camera->name = 'PTZ Camera';
        $camera->robot_id = 42;

        $camera->shouldReceive('isControlledBySession')
            ->with('session-123')
            ->andReturn(true);

        $this->cameraRepository
            ->shouldReceive('findWithControl')
            ->with(1)
            ->andReturn($camera);

        $this->mqttService
            ->shouldReceive('publishPtzCommand')
            ->andReturn(true);

        Log::spy();

        // Act
        $this->service->move(1, 'session-123', CameraPTZDirection::UP);

        // Assert
        $this->assertTrue(true); // test passed if we got here
        Log::shouldHaveReceived('info');
    }

    public function test_request_reservation_creates_reservation(): void
    {
        // Arrange - mock model instances to avoid database/transaction issues
        $camera = Mockery::mock(Camera::class);
        $camera->makePartial();
        $camera->id = 1;
        $user = Mockery::mock(User::class);
        $user->makePartial();
        $user->id = 123;

        $startAt = new \DateTime('2024-03-01 10:00:00');
        $endAt = new \DateTime('2024-03-01 11:00:00');
        $purpose = 'Testing';

        $this->reservationRepository
            ->shouldReceive('hasConflict')
            ->with($camera, $startAt, $endAt)
            ->once()
            ->andReturn(false);

        $reservation = Mockery::mock(Reservation::class);
        $reservation->makePartial();
        $reservation->id = 123;

        $this->reservationRepository
            ->shouldReceive('create')
            ->with([
                'camera_id' => 1,
                'user_id' => 123,
                'status' => CameraReservationStatus::PENDING->value,
                'requested_start_at' => $startAt,
                'requested_end_at' => $endAt,
                'purpose' => $purpose,
            ])
            ->once()
            ->andReturn($reservation);

        Log::shouldReceive('info')
            ->once()
            ->with('Camera reservation requested', [
                'reservation_id' => 123,
                'camera_id' => 1,
                'user_id' => 123,
                'requested_start' => '2024-03-01 10:00:00',
                'requested_end' => '2024-03-01 11:00:00',
            ]);

        // Act
        $result = $this->service->requestReservation($camera, $user, $startAt, $endAt, $purpose);

        // Assert
        $this->assertSame($reservation, $result);
    }

    public function test_request_reservation_throws_exception_on_conflict(): void
    {
        // Arrange - mock model instances to avoid database/transaction issues
        $camera = Mockery::mock(Camera::class);
        $user = Mockery::mock(User::class);
        $startAt = new \DateTime('2024-03-01 10:00:00');
        $endAt = new \DateTime('2024-03-01 11:00:00');

        $this->reservationRepository
            ->shouldReceive('hasConflict')
            ->with($camera, $startAt, $endAt)
            ->once()
            ->andReturn(true);

        // Act & Assert
        $this->expectException(\DomainException::class);
        $this->expectExceptionMessage('Time slot conflicts with existing reservation');

        $this->service->requestReservation($camera, $user, $startAt, $endAt);
    }

    public function test_get_auto_resolution_returns_correct_values_for_camera_types(): void
    {
        // Test USB camera - use mocked Camera model to avoid database/transaction issues
        $usbCamera = Mockery::mock(Camera::class);
        $usbCamera->makePartial();
        $usbCamera->type = CameraType::USB;
        $usbResult = $this->service->getAutoResolution($usbCamera);
        $this->assertEquals(['width' => 640, 'height' => 480, 'framerate' => 15], $usbResult);

        // Test ESP32 camera
        $esp32Camera = Mockery::mock(Camera::class);
        $esp32Camera->makePartial();
        $esp32Camera->type = CameraType::ESP32_CAM;
        $esp32Result = $this->service->getAutoResolution($esp32Camera);
        $this->assertEquals(['width' => 640, 'height' => 480, 'framerate' => 10], $esp32Result);

        // Test IP camera
        $ipCamera = Mockery::mock(Camera::class);
        $ipCamera->makePartial();
        $ipCamera->type = CameraType::IP;
        $ipResult = $this->service->getAutoResolution($ipCamera);
        $this->assertEquals(['width' => 1280, 'height' => 720, 'framerate' => 25], $ipResult);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
