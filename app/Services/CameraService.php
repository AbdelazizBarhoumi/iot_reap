<?php

namespace App\Services;

use App\Enums\CameraPTZDirection;
use App\Exceptions\CameraControlConflictException;
use App\Exceptions\CameraNotControllableException;
use App\Models\Camera;
use App\Models\CameraSessionControl;
use App\Repositories\CameraRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;

/**
 * Camera service — all camera business logic.
 *
 * Handles camera viewing, PTZ control acquisition/release,
 * and movement commands. In production, movement commands
 * will be sent via MQTT to the ESP32; for now they are logged.
 */
class CameraService
{
    public function __construct(
        private readonly CameraRepository $cameraRepository,
    ) {}

    /**
     * Get all cameras available for a session (all cameras from all robots).
     * Returns cameras with their control state so the frontend knows
     * which ones are controllable.
     */
    public function getCamerasForSession(string $sessionId): Collection
    {
        $cameras = $this->cameraRepository->findAll();

        // Eager-load the control info is already handled in the repository.
        // Each camera will have `activeControl` loaded — either null (free)
        // or a CameraSessionControl record with session_id.
        return $cameras;
    }

    /**
     * Get stream URLs for a camera.
     * Always derived from stream_key — never hardcoded.
     */
    public function getStreamUrls(Camera $camera): array
    {
        $baseHost = config('gateway.mediamtx_url', '192.168.50.3');
        $rtspPort = config('gateway.mediamtx_rtsp_port', 8554);
        $hlsPort = config('gateway.mediamtx_hls_port', 8888);
        $webrtcPort = config('gateway.mediamtx_webrtc_port', 8889);

        return [
            'rtsp'   => "rtsp://{$baseHost}:{$rtspPort}/{$camera->stream_key}",
            'hls'    => "http://{$baseHost}:{$hlsPort}/{$camera->stream_key}/index.m3u8",
            'webrtc' => "http://{$baseHost}:{$webrtcPort}/{$camera->stream_key}",
        ];
    }

    /**
     * Acquire exclusive PTZ control of a camera for a session.
     *
     * @throws CameraControlConflictException if another session already controls it
     * @throws CameraNotControllableException if the camera doesn't support PTZ
     */
    public function acquireControl(int $cameraId, string $sessionId): CameraSessionControl
    {
        $camera = $this->cameraRepository->findWithControl($cameraId);

        if (! $camera->ptz_capable) {
            throw new CameraNotControllableException(
                "Camera '{$camera->name}' does not support PTZ control."
            );
        }

        // Check if camera is already controlled by another session
        $activeControl = $camera->activeControl;
        if ($activeControl !== null) {
            if ($activeControl->session_id === $sessionId) {
                // Already controlled by this session — return existing
                return $activeControl;
            }

            throw new CameraControlConflictException(
                "Camera '{$camera->name}' is currently controlled by another session."
            );
        }

        Log::info('Camera control acquired', [
            'camera_id' => $cameraId,
            'session_id' => $sessionId,
            'camera_name' => $camera->name,
        ]);

        return $this->cameraRepository->acquireControl($cameraId, $sessionId);
    }

    /**
     * Release PTZ control of a camera for a session.
     */
    public function releaseControl(int $cameraId, string $sessionId): bool
    {
        $released = $this->cameraRepository->releaseControl($cameraId, $sessionId);

        if ($released) {
            Log::info('Camera control released', [
                'camera_id' => $cameraId,
                'session_id' => $sessionId,
            ]);
        }

        return $released;
    }

    /**
     * Release all camera controls for a session.
     * Called when a session ends/expires/terminates.
     */
    public function releaseAllForSession(string $sessionId): int
    {
        $count = $this->cameraRepository->releaseAllForSession($sessionId);

        if ($count > 0) {
            Log::info('All camera controls released for session', [
                'session_id' => $sessionId,
                'released_count' => $count,
            ]);
        }

        return $count;
    }

    /**
     * Send a PTZ movement command to a camera.
     *
     * In production this will publish an MQTT command to the ESP32.
     * For now it validates and logs the command.
     *
     * @throws CameraControlConflictException if the session doesn't control the camera
     * @throws CameraNotControllableException if the camera doesn't support PTZ
     */
    public function move(int $cameraId, string $sessionId, CameraPTZDirection $direction): void
    {
        $camera = $this->cameraRepository->findWithControl($cameraId);

        if (! $camera->ptz_capable) {
            throw new CameraNotControllableException(
                "Camera '{$camera->name}' does not support PTZ control."
            );
        }

        // Verify the session actually controls this camera
        if (! $camera->isControlledBySession($sessionId)) {
            throw new CameraControlConflictException(
                "Session does not have control of camera '{$camera->name}'. Acquire control first."
            );
        }

        // TODO: In production, publish MQTT command:
        // $this->mqtt->publish("robot/{$camera->robot_id}/camera/command", [
        //     'action' => "ptz_{$direction->value}",
        //     'params' => ['step' => 10],
        //     'timestamp' => now()->toISOString(),
        //     'session_id' => $sessionId,
        // ]);

        Log::info('Camera PTZ move command', [
            'camera_id' => $cameraId,
            'session_id' => $sessionId,
            'direction' => $direction->value,
            'camera_name' => $camera->name,
        ]);
    }
}
