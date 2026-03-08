<?php

namespace App\Services;

use App\Enums\CameraPTZDirection;
use App\Enums\CameraReservationStatus;
use App\Exceptions\CameraControlConflictException;
use App\Exceptions\CameraNotControllableException;
use App\Models\Camera;
use App\Models\CameraReservation;
use App\Models\CameraSessionControl;
use App\Models\User;
use App\Repositories\CameraRepository;
use App\Repositories\CameraReservationRepository;
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
        private readonly CameraReservationRepository $reservationRepository,
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
        // Use the camera's gateway node IP — each camera streams from its own gateway
        $camera->loadMissing('gatewayNode');
        $baseHost = $camera->gatewayNode?->ip ?? config('gateway.mediamtx_url', '192.168.50.7');
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

    // ────────────────────────────────────────────────────────────────────
    // Reservation Management
    // ────────────────────────────────────────────────────────────────────

    /**
     * Request a reservation for a camera.
     */
    public function requestReservation(
        Camera $camera,
        User $user,
        \DateTimeInterface $startAt,
        \DateTimeInterface $endAt,
        ?string $purpose = null
    ): CameraReservation {
        // Check for conflicts
        if ($this->reservationRepository->hasConflict($camera, $startAt, $endAt)) {
            throw new \InvalidArgumentException('Time slot conflicts with existing reservation');
        }

        $reservation = $this->reservationRepository->create([
            'camera_id' => $camera->id,
            'user_id' => $user->id,
            'status' => CameraReservationStatus::PENDING->value,
            'requested_start_at' => $startAt,
            'requested_end_at' => $endAt,
            'purpose' => $purpose,
        ]);

        Log::info('Camera reservation requested', [
            'reservation_id' => $reservation->id,
            'camera_id' => $camera->id,
            'user_id' => $user->id,
            'requested_start' => $startAt->format('Y-m-d H:i:s'),
            'requested_end' => $endAt->format('Y-m-d H:i:s'),
        ]);

        return $reservation;
    }

    /**
     * Approve a camera reservation (admin action).
     */
    public function approveReservation(
        CameraReservation $reservation,
        User $approver,
        ?\DateTimeInterface $modifiedStartAt = null,
        ?\DateTimeInterface $modifiedEndAt = null,
        ?string $adminNotes = null
    ): CameraReservation {
        $startAt = $modifiedStartAt ?? $reservation->requested_start_at;
        $endAt = $modifiedEndAt ?? $reservation->requested_end_at;

        // Check for conflicts (excluding this reservation)
        if ($this->reservationRepository->hasConflict($reservation->camera, $startAt, $endAt, $reservation->id)) {
            throw new \InvalidArgumentException('Modified time slot conflicts with existing reservation');
        }

        $this->reservationRepository->update($reservation, [
            'status' => CameraReservationStatus::APPROVED->value,
            'approved_by' => $approver->id,
            'approved_start_at' => $startAt,
            'approved_end_at' => $endAt,
            'admin_notes' => $adminNotes,
        ]);

        Log::info('Camera reservation approved', [
            'reservation_id' => $reservation->id,
            'approved_by' => $approver->id,
            'approved_start' => $startAt->format('Y-m-d H:i:s'),
            'approved_end' => $endAt->format('Y-m-d H:i:s'),
        ]);

        return $reservation->fresh();
    }

    /**
     * Reject a camera reservation (admin action).
     */
    public function rejectReservation(
        CameraReservation $reservation,
        User $approver,
        ?string $adminNotes = null
    ): CameraReservation {
        $this->reservationRepository->update($reservation, [
            'status' => CameraReservationStatus::REJECTED->value,
            'approved_by' => $approver->id,
            'admin_notes' => $adminNotes,
        ]);

        Log::info('Camera reservation rejected', [
            'reservation_id' => $reservation->id,
            'rejected_by' => $approver->id,
        ]);

        return $reservation->fresh();
    }

    /**
     * Cancel a camera reservation (user or admin).
     */
    public function cancelReservation(CameraReservation $reservation): CameraReservation
    {
        if (!$reservation->canModify()) {
            throw new \InvalidArgumentException('Reservation cannot be cancelled in current state');
        }

        $this->reservationRepository->update($reservation, [
            'status' => CameraReservationStatus::CANCELLED->value,
        ]);

        Log::info('Camera reservation cancelled', [
            'reservation_id' => $reservation->id,
        ]);

        return $reservation->fresh();
    }

    /**
     * Create an admin block reservation (prevents others from using camera).
     */
    public function createAdminBlock(
        Camera $camera,
        User $admin,
        \DateTimeInterface $startAt,
        \DateTimeInterface $endAt,
        ?string $notes = null
    ): CameraReservation {
        // Check for conflicts
        if ($this->reservationRepository->hasConflict($camera, $startAt, $endAt)) {
            throw new \InvalidArgumentException('Time slot conflicts with existing reservation');
        }

        $reservation = $this->reservationRepository->create([
            'camera_id' => $camera->id,
            'user_id' => $admin->id,
            'approved_by' => $admin->id,
            'status' => CameraReservationStatus::APPROVED->value,
            'requested_start_at' => $startAt,
            'requested_end_at' => $endAt,
            'approved_start_at' => $startAt,
            'approved_end_at' => $endAt,
            'purpose' => 'Admin block',
            'admin_notes' => $notes,
            'priority' => 100,
        ]);

        Log::info('Camera admin block created', [
            'reservation_id' => $reservation->id,
            'camera_id' => $camera->id,
            'admin_id' => $admin->id,
        ]);

        return $reservation;
    }

    /**
     * Check if a user can use a camera now (considering reservations).
     */
    public function canUserUseNow(Camera $camera, User $user): array
    {
        $now = now();

        $activeReservation = CameraReservation::where('camera_id', $camera->id)
            ->whereIn('status', [CameraReservationStatus::APPROVED->value, CameraReservationStatus::ACTIVE->value])
            ->whereNotNull('approved_start_at')
            ->where('approved_start_at', '<=', $now)
            ->where('approved_end_at', '>=', $now)
            ->first();

        if ($activeReservation) {
            if ($activeReservation->user_id === $user->id) {
                return ['can_use' => true, 'reason' => 'User has active reservation'];
            }
            return [
                'can_use' => false,
                'reason' => 'Camera is reserved by another user',
                'reserved_by' => $activeReservation->user->name,
                'until' => $activeReservation->approved_end_at->toDateTimeString(),
            ];
        }

        return ['can_use' => true, 'reason' => 'No blocking reservation'];
    }

    /**
     * Get all cameras with their reservation status for admin view.
     */
    public function getAllCamerasWithReservations(): Collection
    {
        return Camera::with(['robot', 'gatewayNode', 'usbDevice', 'activeControl', 'reservations' => function ($q) {
            $q->whereIn('status', [
                CameraReservationStatus::PENDING->value,
                CameraReservationStatus::APPROVED->value,
                CameraReservationStatus::ACTIVE->value,
            ])->orderBy('requested_start_at');
        }])->get();
    }

    /**
     * Determine ideal auto-resolution for a camera.
     *
     * USB cameras over USB/IP have bandwidth constraints.
     * ESP32-CAM has hardware limits. IP cameras can do higher res.
     *
     * @return array{width: int, height: int, framerate: int}
     */
    public function getAutoResolution(Camera $camera): array
    {
        return match ($camera->type) {
            \App\Enums\CameraType::USB => [
                'width' => 640,
                'height' => 480,
                'framerate' => 15,
            ],
            \App\Enums\CameraType::ESP32_CAM => [
                'width' => 640,
                'height' => 480,
                'framerate' => 10,
            ],
            \App\Enums\CameraType::IP => [
                'width' => 1280,
                'height' => 720,
                'framerate' => 25,
            ],
        };
    }
}
