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
use Illuminate\Http\Request;

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

        $availableDevices = $this->queueService->getAvailableDevicesForSession($session);
        
        // Also get devices attached to this session
        $attachedDevices = $session->attachedDevices()
            ->with('gatewayNode')
            ->get();

        // Get queue entries for this session
        $queueEntries = $this->queueRepository->findBySession($session);

        return response()->json([
            'data' => [
                'available_devices' => $availableDevices->map(fn($item) => [
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
     */
    public function attach(VMSession $session, UsbDevice $device): JsonResponse
    {
        // Authorization
        if ($session->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to session');
        }

        // Validate session is active
        if (!in_array($session->status->value, ['active', 'expiring'])) {
            return response()->json([
                'success' => false,
                'message' => 'Session must be active to attach devices',
            ], 422);
        }

        // Check if device is from a verified gateway
        if (!$device->gatewayNode?->is_verified) {
            return response()->json([
                'success' => false,
                'message' => 'Device gateway is not verified',
            ], 422);
        }

        // Validate device is bound
        if (!$device->isBound()) {
            return response()->json([
                'success' => false,
                'message' => 'Device must be bound before attaching',
            ], 422);
        }

        // Check if user can attach (reservation check)
        $canAttach = $this->queueService->canUserAttachNow($device, auth()->user());
        if (!$canAttach['can_attach']) {
            return response()->json([
                'success' => false,
                'message' => $canAttach['reason'],
                'reserved_until' => $canAttach['until'] ?? null,
            ], 422);
        }

        try {
            $this->gatewayService->attachToSession($device, $session);

            // Remove from queue if they were waiting
            $this->queueService->leaveQueue($device, $session);

            return response()->json([
                'success' => true,
                'message' => 'Device attached successfully',
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
            $this->gatewayService->detachFromVm($device);

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
        if (!in_array($session->status->value, ['active', 'expiring'])) {
            return response()->json([
                'success' => false,
                'message' => 'Session must be active to queue for devices',
            ], 422);
        }

        // Validate device is attached to someone else
        if (!$device->isAttached()) {
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
        } catch (\InvalidArgumentException $e) {
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

        if (!$removed) {
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
