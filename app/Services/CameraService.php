<?php

namespace App\Services;

use App\Enums\CameraPTZDirection;
use App\Enums\CameraReservationStatus;
use App\Enums\CameraStatus;
use App\Exceptions\CameraControlConflictException;
use App\Exceptions\CameraNotControllableException;
use App\Models\Camera;
use App\Models\Reservation;
use App\Models\CameraSessionControl;
use App\Models\User;
use App\Repositories\CameraRepository;
use App\Repositories\CameraReservationRepository;
use App\Repositories\VMSessionRepository;
use App\Services\MqttService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;

/**
 * Camera service — all camera business logic.
 *
 * Handles camera viewing, PTZ control acquisition/release,
 * and movement commands. Movement commands are sent via MQTT
 * to the ESP32 controller.
 */
class CameraService
{
    public function __construct(
        private readonly CameraRepository $cameraRepository,
        private readonly CameraReservationRepository $reservationRepository,
        private readonly MqttService $mqttService,
        private readonly VMSessionRepository $vmSessionRepository,
    ) {}

    /**
     * Get cameras available for a session.
     *
     * Scoping rules:
     * - Sessions WITH a vm_id see: cameras assigned to that vm_id + unassigned cameras
     * - Sessions WITHOUT a vm_id see: only unassigned cameras
     *
     * Multiple sessions on the same VM will see the same cameras (shared viewing).
     * PTZ control remains exclusive via CameraSessionControl.
     */
    public function getCamerasForSession(string $sessionId): Collection
    {
        $session = $this->vmSessionRepository->findById($sessionId);

        if (! $session) {
            return new Collection();
        }

        return $this->cameraRepository->findByVmId($session->vm_id);
    }

    /**
     * Get stream URLs for a camera.
     * Always derived from stream_key — never hardcoded.
     *
     * @deprecated Unused - stream URLs built inline in controllers. Candidate for removal.
     */
    public function getStreamUrls(Camera $camera): array
    {
        // Use the camera's gateway node IP — each camera streams from its own gateway
        $camera->loadMissing('gatewayNode');
        $baseHost = $camera->gatewayNode?->ip ?? config('gateway.mediamtx_url', '192.168.50.6');
        $rtspPort = config('gateway.mediamtx_rtsp_port', 8554);
        $hlsPort = config('gateway.mediamtx_hls_port', 8888);
        $webrtcPort = config('gateway.mediamtx_webrtc_port', 8889);

        return [
            'rtsp' => "rtsp://{$baseHost}:{$rtspPort}/{$camera->stream_key}",
            'hls' => "http://{$baseHost}:{$hlsPort}/{$camera->stream_key}/index.m3u8",
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
     *
     * @deprecated Unused - session cleanup handled elsewhere. Candidate for removal.
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

        // Send PTZ command via MQTT to ESP32
        if ($camera->robot_id) {
            $published = $this->mqttService->publishPtzCommand(
                robotId: $camera->robot_id,
                direction: $direction->value,
                sessionId: $sessionId
            );

            if (! $published) {
                Log::warning('Failed to publish PTZ command via MQTT', [
                    'camera_id' => $cameraId,
                    'session_id' => $sessionId,
                    'direction' => $direction->value,
                ]);
            }
        }

        Log::info('Camera PTZ move command', [
            'camera_id' => $cameraId,
            'session_id' => $sessionId,
            'direction' => $direction->value,
            'camera_name' => $camera->name,
            'robot_id' => $camera->robot_id,
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
    ): Reservation {
        // Check for conflicts
        if ($this->reservationRepository->hasConflict($camera, $startAt, $endAt)) {
            throw new \DomainException('Time slot conflicts with existing reservation');
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
        Reservation $reservation,
        User $approver,
        ?\DateTimeInterface $modifiedStartAt = null,
        ?\DateTimeInterface $modifiedEndAt = null,
        ?string $adminNotes = null
    ): Reservation {
        $startAt = $modifiedStartAt ?? $reservation->requested_start_at;
        $endAt = $modifiedEndAt ?? $reservation->requested_end_at;

        // Check for conflicts (excluding this reservation)
        if ($this->reservationRepository->hasConflict($reservation->reservable, $startAt, $endAt, $reservation->id)) {
            throw new \DomainException('Modified time slot conflicts with existing reservation');
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
        Reservation $reservation,
        User $approver,
        ?string $adminNotes = null
    ): Reservation {
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
    public function cancelReservation(Reservation $reservation): Reservation
    {
        if (! $reservation->canModify()) {
            throw new \DomainException('Reservation cannot be cancelled in current state');
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
        ?string $notes = null,
        string $mode = 'block',
        ?string $targetUserId = null,
        ?int $targetVmId = null,
        ?string $purpose = null,
    ): Reservation {
        // Check for conflicts
        if ($this->reservationRepository->hasConflict($camera, $startAt, $endAt)) {
            throw new \DomainException('Time slot conflicts with existing reservation');
        }

        if ($mode === 'reserve_to_user' && ! $targetUserId) {
            throw new \InvalidArgumentException('Target user is required for user reservation mode');
        }

        if ($mode === 'reserve_to_vm' && ! $targetVmId) {
            throw new \InvalidArgumentException('Target VM ID is required for VM reservation mode');
        }

        $isBlock = $mode === 'block';
        $reservationUserId = $mode === 'reserve_to_user'
            ? (string) $targetUserId
            : (string) $admin->id;
        $reservationPurpose = $isBlock
            ? 'Admin block'
            : ($purpose ?: ($mode === 'reserve_to_vm' ? 'Admin VM reservation' : 'Admin user reservation'));
        $reservationPriority = $isBlock ? 100 : 80;

        $reservation = $this->reservationRepository->create([
            'camera_id' => $camera->id,
            'user_id' => $reservationUserId,
            'target_vm_id' => $mode === 'reserve_to_vm' ? $targetVmId : null,
            'target_user_id' => $mode === 'reserve_to_user' ? $targetUserId : null,
            'approved_by' => $admin->id,
            'status' => CameraReservationStatus::APPROVED->value,
            'requested_start_at' => $startAt,
            'requested_end_at' => $endAt,
            'approved_start_at' => $startAt,
            'approved_end_at' => $endAt,
            'purpose' => $reservationPurpose,
            'admin_notes' => $notes,
            'priority' => $reservationPriority,
        ]);

        Log::info('Camera admin reservation created', [
            'reservation_id' => $reservation->id,
            'camera_id' => $camera->id,
            'admin_id' => $admin->id,
            'mode' => $mode,
            'target_user_id' => $targetUserId,
            'target_vm_id' => $targetVmId,
        ]);

        return $reservation;
    }

    /**
     * Check if a user can use a camera now (considering reservations).
     *
     * @deprecated Unused - permission checks handled inline in controllers. Candidate for removal.
     */
    public function canUserUseNow(Camera $camera, User $user): array
    {
        $now = now();

        $activeReservation = Reservation::where('reservable_type', Camera::class)
            ->where('reservable_id', $camera->id)
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
                'until' => $activeReservation->approved_end_at?->format('Y-m-d H:i:s'),
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

    /**
     * Change camera stream resolution.
     *
     * Handles the business logic for resolution changes:
     * 1. Auto mode resolution selection based on camera type
     * 2. Gateway API availability check
     * 3. Stream restart coordination
     * 4. Camera status updates
     *
     * @param  array<string, mixed>  $validated
     * @return array{camera: Camera, success: bool, message: string, stream_restarted: bool, api_available: bool}
     */
    public function changeResolution(Camera $camera, array $validated, GatewayService $gatewayService): array
    {
        // Auto mode: pick optimal resolution based on camera type
        if ($validated['mode'] === 'auto') {
            $auto = $this->getAutoResolution($camera);
            $validated['width'] = $auto['width'];
            $validated['height'] = $auto['height'];
            $validated['framerate'] = $auto['framerate'];
        }

        $width = (int) $validated['width'];
        $height = (int) $validated['height'];
        $framerate = (int) ($validated['framerate'] ?? $camera->stream_framerate ?? 15);

        // Check if gateway has camera management API available
        $apiAvailable = $this->checkGatewayApiAvailable($camera, $gatewayService);

        // Update camera record (always do this)
        $camera->update([
            'stream_width' => $width,
            'stream_height' => $height,
            'stream_framerate' => $framerate,
        ]);

        // Only attempt stream restart if gateway API is available
        $streamResult = ['success' => false, 'skipped' => true];
        if ($apiAvailable) {
            $streamResult = $this->restartCameraStream($camera, $gatewayService, [
                'width' => $width,
                'height' => $height,
                'framerate' => $framerate,
                'input_format' => $camera->stream_input_format ?? 'mjpeg',
            ]);
            $streamResult['skipped'] = false;

            // Only mark inactive if restart was attempted and failed
            if (! $streamResult['success']) {
                $camera->update(['status' => \App\Enums\CameraStatus::INACTIVE]);
            }
        }
        // If no API available, keep camera status unchanged (stream managed externally)

        $message = match (true) {
            $streamResult['success'] => "Resolution changed to {$width}x{$height}@{$framerate}fps",
            $streamResult['skipped'] ?? false => "Settings saved ({$width}x{$height}@{$framerate}fps). Stream managed externally.",
            default => 'Resolution updated but stream restart failed',
        };

        return [
            'camera' => $camera->fresh()->load(['activeControl', 'gatewayNode', 'usbDevice']),
            'success' => $streamResult['success'],
            'message' => $message,
            'stream_restarted' => $streamResult['success'],
            'api_available' => $apiAvailable,
        ];
    }

    /**
     * Check if the gateway API is available for camera management.
     */
    private function checkGatewayApiAvailable(Camera $camera, GatewayService $gatewayService): bool
    {
        // Check if gateway has camera management API available
        if (! $camera->gatewayNode) {
            return false;
        }

        return $gatewayService->hasCameraManagementApi($camera->gatewayNode);
    }

    /**
     * Restart camera stream with new settings.
     *
     * @param  array<string, mixed>  $streamParams
     * @return array{success: bool}
     */
    private function restartCameraStream(Camera $camera, GatewayService $gatewayService, array $streamParams): array
    {
        try {
            $camera->loadMissing('usbDevice');

            // Stop current stream
            if ($camera->status === \App\Enums\CameraStatus::ACTIVE) {
                $gatewayService->stopCameraStream($camera->gatewayNode, $camera->stream_key);
            }

            // Restart stream with new settings
            $result = $gatewayService->startCameraStream(
                $camera->gatewayNode,
                $camera->stream_key,
                $camera->source_url,
                $this->buildGatewayStreamOptions($camera, $streamParams)
            );

            $this->syncResolvedDevicePath($camera, $result);

            return ['success' => $result['success'] ?? false];
        } catch (\Exception $e) {
            Log::error('Failed to restart camera stream', [
                'camera_id' => $camera->id,
                'error' => $e->getMessage(),
            ]);

            return ['success' => false];
        }
    }

    /**
     * Activate a camera.
     * Changes status from inactive to active.
     */
    public function activate(Camera $camera, GatewayService $gatewayService): Camera
    {
        $camera->loadMissing(['gatewayNode', 'usbDevice']);

        if ($camera->gatewayNode) {
            $streamStatus = $gatewayService->getCameraStreamStatus(
                $camera->gatewayNode,
                $camera->stream_key
            );

            if (! ($streamStatus['running'] ?? false)) {
                $streamResult = $gatewayService->startCameraStream(
                    $camera->gatewayNode,
                    $camera->stream_key,
                    $camera->source_url,
                    $this->buildGatewayStreamOptions($camera, [
                        'width' => $camera->stream_width ?? 640,
                        'height' => $camera->stream_height ?? 480,
                        'framerate' => $camera->stream_framerate ?? 15,
                        'input_format' => $camera->stream_input_format ?? 'mjpeg',
                    ])
                );

                if (! ($streamResult['success'] ?? false)) {
                    throw new \RuntimeException($streamResult['error'] ?? 'Failed to start camera stream.');
                }

                $this->syncResolvedDevicePath($camera, $streamResult);

                $streamStatus = $gatewayService->getCameraStreamStatus(
                    $camera->gatewayNode,
                    $camera->stream_key
                );

                if (! ($streamStatus['running'] ?? false)) {
                    throw new \RuntimeException(
                        'Camera stream start was accepted, but the stream is still unavailable in MediaMTX.'
                    );
                }
            }
        }

        $camera->update(['status' => CameraStatus::ACTIVE]);

        Log::info('Camera activated', [
            'camera_id' => $camera->id,
            'camera_name' => $camera->name,
        ]);

        return $camera->fresh()->load(['robot', 'gatewayNode', 'activeControl']);
    }

    /**
     * Deactivate a camera.
     * Changes status from active to inactive.
     *
     * @param  ?string  $reason  Optional reason for deactivation
     */
    public function deactivate(Camera $camera, GatewayService $gatewayService, ?string $reason = null): Camera
    {
        $camera->loadMissing('gatewayNode');

        if ($camera->gatewayNode && $gatewayService->hasCameraManagementApi($camera->gatewayNode)) {
            $gatewayService->stopCameraStream($camera->gatewayNode, $camera->stream_key);
        }

        $camera->update(['status' => CameraStatus::INACTIVE]);

        Log::info('Camera deactivated', [
            'camera_id' => $camera->id,
            'camera_name' => $camera->name,
            'reason' => $reason,
        ]);

        return $camera->fresh()->load(['robot', 'gatewayNode', 'activeControl']);
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function buildGatewayStreamOptions(Camera $camera, array $overrides = []): array
    {
        $camera->loadMissing('usbDevice');

        $options = array_merge([
            'width' => $camera->stream_width ?? 640,
            'height' => $camera->stream_height ?? 480,
            'framerate' => $camera->stream_framerate ?? 15,
            'input_format' => $camera->stream_input_format ?? 'mjpeg',
        ], $overrides);

        if ($camera->usbDevice) {
            $options['usb_busid'] = $camera->usbDevice->busid;
            $options['vendor_id'] = $camera->usbDevice->vendor_id;
            $options['product_id'] = $camera->usbDevice->product_id;
        }

        return $options;
    }

    /**
     * Persist the device path returned by the gateway when it resolves a specific capture device.
     *
     * @param  array<string, mixed>  $streamResult
     */
    private function syncResolvedDevicePath(Camera $camera, array $streamResult): void
    {
        $resolvedDevicePath = $streamResult['device_path'] ?? null;

        if (! is_string($resolvedDevicePath) || $resolvedDevicePath === '' || $resolvedDevicePath === $camera->source_url) {
            return;
        }

        $camera->update(['source_url' => $resolvedDevicePath]);
    }
}
