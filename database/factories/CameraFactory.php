<?php

namespace Database\Factories;

use App\Enums\CameraStatus;
use App\Enums\CameraType;
use App\Models\Camera;
use App\Models\Robot;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Camera>
 */
class CameraFactory extends Factory
{
    protected $model = Camera::class;

    public function definition(): array
    {
        return [
            'robot_id' => Robot::factory(),
            'name' => $this->faker->unique()->word() . ' Camera',
            'stream_key' => $this->faker->unique()->slug(2),
            'source_url' => 'rtsp://' . $this->faker->localIpv4() . ':554/stream',
            'type' => CameraType::ESP32_CAM,
            'status' => CameraStatus::ACTIVE,
            'ptz_capable' => false,
            'recording_enabled' => false,
            'detection_enabled' => false,
        ];
    }

    /**
     * Camera supports PTZ control.
     */
    public function ptzCapable(): static
    {
        return $this->state(fn() => ['ptz_capable' => true]);
    }

    /**
     * Camera is active.
     */
    public function active(): static
    {
        return $this->state(fn() => ['status' => CameraStatus::ACTIVE]);
    }

    /**
     * Camera is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn() => ['status' => CameraStatus::INACTIVE]);
    }

    /**
     * USB webcam type.
     */
    public function usb(): static
    {
        return $this->state(fn() => [
            'type' => CameraType::USB,
            'source_url' => '/dev/video0',
        ]);
    }

    /**
     * IP camera type.
     */
    public function ipCamera(): static
    {
        return $this->state(fn(array $attrs) => [
            'type' => CameraType::IP,
            'source_url' => 'rtsp://' . $this->faker->localIpv4() . ':554/stream1',
        ]);
    }

    /**
     * ESP32-CAM type.
     */
    public function esp32Cam(): static
    {
        return $this->state(fn(array $attrs) => [
            'type' => CameraType::ESP32_CAM,
            'source_url' => 'rtsp://' . $this->faker->localIpv4() . ':554/stream',
        ]);
    }
}
