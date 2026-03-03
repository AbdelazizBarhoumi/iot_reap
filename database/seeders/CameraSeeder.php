<?php

namespace Database\Seeders;

use App\Enums\CameraStatus;
use App\Enums\CameraType;
use App\Models\Camera;
use App\Models\Robot;
use Illuminate\Database\Seeder;

/**
 * Seeds mock robots and cameras for development.
 *
 * Creates 3 robots, each with 2-3 cameras of different types.
 * Some cameras are PTZ-capable, some are not.
 */
class CameraSeeder extends Seeder
{
    public function run(): void
    {
        // ── Robot Alpha — industrial arm with 2 cameras ──
        $robotAlpha = Robot::create([
            'name' => 'Alpha Arm',
            'identifier' => 'robot-alpha',
            'description' => 'Industrial robotic arm in Cell A — pick-and-place operations',
            'status' => 'online',
            'ip_address' => '192.168.50.10',
        ]);

        Camera::create([
            'robot_id' => $robotAlpha->id,
            'name' => 'Alpha Overview',
            'stream_key' => 'robot-alpha-overview',
            'source_url' => 'rtsp://192.168.50.10:554/stream',
            'type' => CameraType::ESP32_CAM,
            'status' => CameraStatus::ACTIVE,
            'ptz_capable' => true,
            'recording_enabled' => false,
            'detection_enabled' => false,
        ]);

        Camera::create([
            'robot_id' => $robotAlpha->id,
            'name' => 'Alpha Gripper Cam',
            'stream_key' => 'robot-alpha-gripper',
            'source_url' => 'rtsp://192.168.50.11:554/stream',
            'type' => CameraType::ESP32_CAM,
            'status' => CameraStatus::ACTIVE,
            'ptz_capable' => false,
            'recording_enabled' => false,
            'detection_enabled' => false,
        ]);

        // ── Robot Beta — mobile platform with 3 cameras ──
        $robotBeta = Robot::create([
            'name' => 'Beta Rover',
            'identifier' => 'robot-beta',
            'description' => 'Mobile robot platform for warehouse inspection',
            'status' => 'online',
            'ip_address' => '192.168.50.20',
        ]);

        Camera::create([
            'robot_id' => $robotBeta->id,
            'name' => 'Beta Front Cam',
            'stream_key' => 'robot-beta-front',
            'source_url' => 'rtsp://192.168.50.20:554/stream',
            'type' => CameraType::ESP32_CAM,
            'status' => CameraStatus::ACTIVE,
            'ptz_capable' => true,
            'recording_enabled' => false,
            'detection_enabled' => false,
        ]);

        Camera::create([
            'robot_id' => $robotBeta->id,
            'name' => 'Beta Rear Cam',
            'stream_key' => 'robot-beta-rear',
            'source_url' => 'rtsp://192.168.50.21:554/stream',
            'type' => CameraType::ESP32_CAM,
            'status' => CameraStatus::ACTIVE,
            'ptz_capable' => true,
            'recording_enabled' => false,
            'detection_enabled' => false,
        ]);

        Camera::create([
            'robot_id' => $robotBeta->id,
            'name' => 'Beta USB Webcam',
            'stream_key' => 'robot-beta-usb',
            'source_url' => '/dev/video0',
            'type' => CameraType::USB,
            'status' => CameraStatus::ACTIVE,
            'ptz_capable' => false,
            'recording_enabled' => false,
            'detection_enabled' => false,
        ]);

        // ── Robot Gamma — stationary monitoring station ──
        $robotGamma = Robot::create([
            'name' => 'Gamma Station',
            'identifier' => 'robot-gamma',
            'description' => 'Fixed monitoring station at entrance — camera only (no actuators)',
            'status' => 'online',
            'ip_address' => '192.168.50.30',
        ]);

        Camera::create([
            'robot_id' => $robotGamma->id,
            'name' => 'Entrance IP Camera',
            'stream_key' => 'gamma-entrance',
            'source_url' => 'rtsp://192.168.50.30:554/stream1',
            'type' => CameraType::IP,
            'status' => CameraStatus::ACTIVE,
            'ptz_capable' => true,
            'recording_enabled' => true,
            'detection_enabled' => true,
        ]);

        Camera::create([
            'robot_id' => $robotGamma->id,
            'name' => 'Gamma Side Cam',
            'stream_key' => 'gamma-side',
            'source_url' => 'rtsp://192.168.50.31:554/stream',
            'type' => CameraType::ESP32_CAM,
            'status' => CameraStatus::INACTIVE,
            'ptz_capable' => false,
            'recording_enabled' => false,
            'detection_enabled' => false,
        ]);
    }
}
