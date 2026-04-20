<?php

namespace App\Http\Controllers;

use App\Exceptions\GatewayApiException;
use App\Http\Resources\UsbDeviceQueueResource;
use App\Http\Resources\UsbDeviceResource;
use App\Models\UsbDevice;
use App\Models\VMSession;
use App\Repositories\UsbDeviceQueueRepository;
use App\Repositories\UsbDeviceRepository;
use App\Services\GatewayService;
use App\Services\UsbDeviceQueueService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

/**
 * Controller for managing USB devices within a session context.
 *
 * Provides endpoints for:
 * - Listing available devices for a session
 * - Attaching/detaching devices to a session
 * - Managing device queue (join/leave)
 */
class SessionHardwareController extends Controller
{
    public function __construct(
        private readonly GatewayService $gatewayService,
        private readonly UsbDeviceQueueService $queueService,
        private readonly UsbDeviceRepository $deviceRepository,
        private readonly UsbDeviceQueueRepository $queueRepository,
    ) {}

    /**
     * Get all available USB devices for a session.
     * Only shows devices from verified gateways.
     */
    public function index(VMSession $session): JsonResponse
    {
        // Ensure the session belongs to the authenticated user
        if ($session->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to session');
        }

        // Get devices attached to this session and reconcile their real runtime state
        // so the UI only shows "Detach" for genuinely attached devices.
        $attachedDevices = $session->attachedDevices()
            ->with('gatewayNode')
            ->get();

        $reconciledAttachedDevices = collect();

        foreach ($attachedDevices as $attachedDevice) {
            $verification = $this->gatewayService->verifySessionAttachmentState($attachedDevice, $session);

            $attachedDevice->setAttribute('is_verified_attached', $verification['verified']);
            $attachedDevice->setAttribute(
                'attachment_verification_state',
                $verification['verified']
                    ? 'verified'
                    : ($verification['can_verify'] ? 'failed' : 'unverifiable')
            );
            $attachedDevice->setAttribute('attachment_verification_reason', $verification['reason']);

            // If we can verify and it is definitely not attached, heal stale DB state.
            if ($verification['can_verify'] && ! $verification['verified']) {
                Log::warning('Session attached device failed verification during hardware index; marking detached', [
                    'device_id' => $attachedDevice->id,
                    'session_id' => $session->id,
                    'reason' => $verification['reason'],
                    'detected_port' => $verification['port'] ?? null,
                ]);

                $this->deviceRepository->markDetached($attachedDevice);

                continue;
            }

            $reconciledAttachedDevices->push($attachedDevice);
        }

        $attachedDevices = $reconciledAttachedDevices->values();

        // Build available device list after reconciliation to avoid stale states.
        $availableDevices = $this->queueService->getAvailableDevicesForSession($session);

        // Get queue entries for this session
        $queueEntries = $this->queueRepository->findBySession($session);

        return response()->json([
            'data' => [
                'available_devices' => $availableDevices->map(fn ($item) => [
                    'device' => new UsbDeviceResource($item['device']),
                    'can_attach' => $item['can_attach'],
                    'is_attached_to_me' => $item['is_attached_to_me'],
                    'queue_position' => $item['queue_position'],
                    'queue_length' => $item['queue_length'],
                    'reason' => $item['attachment_reason'],
                    'gateway_verified' => $item['gateway_verified'] ?? true,
                ]),
                'attached_devices' => UsbDeviceResource::collection($attachedDevices),
                'queue_entries' => UsbDeviceQueueResource::collection($queueEntries),
            ],
        ]);
    }

    /**
     * Attach a USB device to the session.
     *
        * This endpoint is synchronous and blocks until the attachment operation
        * completes (Windows VMs may take up to ~120 seconds while drivers load).
     *
     * Uses database-level locking to prevent race conditions when
     * multiple users attempt to attach the same device simultaneously.
     */
    public function attach(VMSession $session, UsbDevice $device): JsonResponse
    {
        // Authorization
        if ($session->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to session');
        }

        // Validate session is active
        if (! in_array($session->status->value, ['active', 'expiring'])) {
            return response()->json([
                'success' => false,
                'message' => 'Session must be active to attach devices',
            ], 422);
        }

        // Check if device is from a verified gateway
        if (! $device->gatewayNode?->is_verified) {
            return response()->json([
                'success' => false,
                'message' => 'Device gateway is not verified',
            ], 422);
        }

        try {
            // Use row-level locking to prevent race conditions
            // Lock the device row for update to prevent concurrent attach attempts
            $lockedDevice = UsbDevice::where('id', $device->id)
                ->lockForUpdate()
                ->first();

            if (! $lockedDevice) {
                return response()->json([
                    'success' => false,
                    'message' => 'Device not found',
                ], 404);
            }

            // Re-validate device state (may have changed while waiting for lock).
            // If we detect a stale "attached" record that points to a non-active
            // session, auto-heal it to detached/bound and continue.
            if (! $lockedDevice->isBound() && ! $lockedDevice->isAvailable()) {
                if ($lockedDevice->isAttached()) {
                    $attachedSession = $lockedDevice->attachedSession;
                    $attachedStatus = $attachedSession?->status?->value;
                    $attachedSessionIsActive = in_array($attachedStatus, ['active', 'expiring'], true);

                    // Only auto-heal non-active states when the attached session exists.
                    // If session cannot be resolved, keep conservative behavior and do not
                    // silently convert an in-use device into attachable state.
                    $staleAttachedState = $attachedSession !== null && ! $attachedSessionIsActive;

                    // Even if session looks active in DB, verify runtime truth in VM.
                    // If verification says it's not really attached, treat as stale.
                    if (! $staleAttachedState && $attachedSession) {
                        // For safety, only auto-heal active-session runtime mismatches
                        // when both sessions belong to the same user.
                        $sameUserSession = (string) $attachedSession->user_id === (string) $session->user_id;

                        if ($sameUserSession) {
                            $verification = $this->gatewayService->verifySessionAttachmentState($lockedDevice, $attachedSession);

                            if ($verification['can_verify'] && ! $verification['verified']) {
                                $staleAttachedState = true;

                                Log::warning('Detected stale USB attached state during session attach (active same-user session runtime mismatch)', [
                                    'device_id' => $lockedDevice->id,
                                    'stale_attached_session_id' => $lockedDevice->attached_session_id,
                                    'stale_attached_session_status' => $attachedStatus,
                                    'verification_reason' => $verification['reason'],
                                    'target_session_id' => $session->id,
                                ]);
                            }
                        }
                    }

                    if ($staleAttachedState) {
                        Log::warning('Detected stale USB attached state during session attach; auto-healing record', [
                            'device_id' => $lockedDevice->id,
                            'stale_attached_session_id' => $lockedDevice->attached_session_id,
                            'stale_attached_session_status' => $attachedStatus,
                            'target_session_id' => $session->id,
                        ]);

                        $this->deviceRepository->markDetached($lockedDevice);
                        $lockedDevice = $lockedDevice->fresh();
                    }
                }

                if (! $lockedDevice->isBound() && ! $lockedDevice->isAvailable()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Device is no longer available for attachment',
                    ], 422);
                }
            }

            // Check if user can attach (reservation check)
            $canAttach = $this->queueService->canUserAttachNow($lockedDevice, $session);
            if (! $canAttach['can_attach']) {
                return response()->json([
                    'success' => false,
                    'message' => $canAttach['reason'],
                    'reserved_until' => $canAttach['until'] ?? null,
                ], 422);
            }

            // Attach immediately (synchronous path)
            $this->gatewayService->attachToSession($lockedDevice, $session);

            // Remove from queue if they were waiting
            $this->queueService->leaveQueue($lockedDevice, $session);

            $responseDevice = $lockedDevice->fresh()->load('gatewayNode');
            $responseDevice->setAttribute('is_verified_attached', true);
            $responseDevice->setAttribute('attachment_verification_state', 'verified');
            $responseDevice->setAttribute('attachment_verification_reason', 'verified-on-attach');

            return response()->json([
                'success' => true,
                'async' => false,
                'message' => 'Device attached successfully',
                'device' => new UsbDeviceResource($responseDevice),
            ]);
        } catch (GatewayApiException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 502);
        }
    }

    /**
     * Detach a USB device from the session.
     */
    public function detach(VMSession $session, UsbDevice $device): JsonResponse
    {
        // Authorization
        if ($session->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to session');
        }

        // Validate device is attached to this session
        if ($device->attached_session_id !== $session->id) {
            return response()->json([
                'success' => false,
                'message' => 'Device is not attached to this session',
            ], 422);
        }

        try {
            $this->gatewayService->detachFromSession($device, $session);

            // Process queue - notify next user
            $this->queueService->processQueueOnDetach($device);

            return response()->json([
                'success' => true,
                'message' => 'Device detached successfully',
                'device' => new UsbDeviceResource($device->fresh()->load('gatewayNode')),
            ]);
        } catch (GatewayApiException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 502);
        }
    }

    /**
     * Join the queue for a device.
     */
    public function joinQueue(VMSession $session, UsbDevice $device): JsonResponse
    {
        // Authorization
        if ($session->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to session');
        }

        // Validate session is active
        if (! in_array($session->status->value, ['active', 'expiring'])) {
            return response()->json([
                'success' => false,
                'message' => 'Session must be active to queue for devices',
            ], 422);
        }

        // Validate device is attached to someone else
        if (! $device->isAttached()) {
            return response()->json([
                'success' => false,
                'message' => 'Device is not currently in use - you can attach it directly',
            ], 422);
        }

        if ($device->attached_session_id === $session->id) {
            return response()->json([
                'success' => false,
                'message' => 'Device is already attached to your session',
            ], 422);
        }

        try {
            $entry = $this->queueService->joinQueue($device, $session, auth()->user());

            return response()->json([
                'success' => true,
                'message' => "Added to queue at position {$entry->position}",
                'queue_entry' => new UsbDeviceQueueResource($entry->load('device.gatewayNode')),
            ]);
        } catch (\InvalidArgumentException|\DomainException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Leave the queue for a device.
     */
    public function leaveQueue(VMSession $session, UsbDevice $device): JsonResponse
    {
        // Authorization
        if ($session->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to session');
        }

        $removed = $this->queueService->leaveQueue($device, $session);

        if (! $removed) {
            return response()->json([
                'success' => false,
                'message' => 'You are not in the queue for this device',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Removed from queue',
        ]);
    }
}
