<?php

namespace App\Http\Controllers;

use App\Enums\UsbDeviceStatus;
use App\Exceptions\GatewayApiException;
use App\Http\Requests\Hardware\AttachDeviceRequest;
use App\Http\Requests\Hardware\CreateGatewayNodeRequest;
use App\Http\Resources\GatewayNodeResource;
use App\Http\Resources\UsbDeviceResource;
use App\Models\GatewayNode;
use App\Models\ProxmoxServer;
use App\Models\UsbDevice;
use App\Models\VMSession;
use App\Repositories\GatewayNodeRepository;
use App\Repositories\UsbDeviceRepository;
use App\Services\GatewayDiscoveryService;
use App\Services\GatewayService;
use App\Services\ProxmoxClientFactory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

/**
 * Controller for USB/IP hardware gateway management.
 *
 * Provides endpoints for discovering, binding, and attaching
 * USB devices to VMs via USB/IP gateway agents.
 */
class HardwareController extends Controller
{
    public function __construct(
        private readonly GatewayService $gatewayService,
        private readonly GatewayDiscoveryService $discoveryService,
        private readonly GatewayNodeRepository $nodeRepository,
        private readonly UsbDeviceRepository $deviceRepository,
        private readonly ProxmoxClientFactory $proxmoxClientFactory,
    ) {}

    /**
     * Display the hardware dashboard or return JSON data.
     * 
     * @deprecated Hardware management is now unified in /admin/infrastructure page
     * This method now only serves JSON for API clients.
     */
    public function index(Request $request)
    {
        // Always return JSON - use the unified infrastructure page instead
        $nodes = $this->nodeRepository->all();

        return response()->json([
            'data' => GatewayNodeResource::collection($nodes),
        ]);
    }

    /**
     * Get all USB devices across all gateway nodes.
     */
    public function devices(Request $request): JsonResponse
    {
        $devices = $this->deviceRepository->all();

        return response()->json([
            'data' => UsbDeviceResource::collection($devices),
        ]);
    }

    /**
     * Refresh device list from all gateway nodes.
     */
    public function refresh(): JsonResponse
    {
        $summary = $this->gatewayService->discoverAllDevices();

        return response()->json([
            'success' => true,
            'message' => "Discovered {$summary['devices_found']} devices from {$summary['nodes_online']} online nodes",
            'summary' => $summary,
        ]);
    }

    /**
     * Refresh devices from a specific gateway node.
     */
    public function refreshNode(GatewayNode $node): JsonResponse
    {
        $result = $this->gatewayService->discoverDevicesFromNode($node);

        if (! $result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['error'] ?? 'Failed to contact gateway node',
            ], 502);
        }

        return response()->json([
            'success' => true,
            'message' => "Discovered {$result['devices_count']} devices",
            'devices_count' => $result['devices_count'],
            'removed_count' => $result['removed_count'],
        ]);
    }

    /**
     * Bind a USB device for USB/IP sharing.
     */
    public function bind(UsbDevice $device): JsonResponse
    {
        if (! $device->isAvailable()) {
            return response()->json([
                'success' => false,
                'message' => 'Device is not in available state',
            ], 422);
        }

        try {
            $this->gatewayService->bindDevice($device);

            return response()->json([
                'success' => true,
                'message' => 'Device bound successfully',
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
     * Unbind a USB device from USB/IP sharing.
     */
    public function unbind(UsbDevice $device): JsonResponse
    {
        if ($device->isAttached()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot unbind attached device. Detach it first.',
            ], 422);
        }

        if (! $device->isBound()) {
            return response()->json([
                'success' => false,
                'message' => 'Device is not in bound state',
            ], 422);
        }

        try {
            $this->gatewayService->unbindDevice($device);

            return response()->json([
                'success' => true,
                'message' => 'Device unbound successfully',
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
     * Attach a USB device to a VM or session.
     */
    public function attach(UsbDevice $device, AttachDeviceRequest $request): JsonResponse
    {
        if (! $device->isBound()) {
            return response()->json([
                'success' => false,
                'message' => 'Device must be bound before attaching',
            ], 422);
        }

        try {
            // If attaching to a session
            if ($sessionId = $request->validated('session_id')) {
                $session = VMSession::where('id', $sessionId)
                    ->where('user_id', auth()->id())
                    ->firstOrFail();

                $this->gatewayService->attachToSession($device, $session);
            } else {
                // Direct attach to VM via guest agent (admin function)
                $vmIp = $request->validated('vm_ip');
                $vmName = $request->validated('vm_name') ?? 'direct-attach';
                $vmid = $request->validated('vmid');
                $nodeName = $request->validated('node');
                $serverId = $request->validated('server_id');

                $server = ProxmoxServer::findOrFail($serverId);

                $result = $this->gatewayService->attachToVmDirect(
                    device: $device,
                    vmid: $vmid,
                    nodeName: $nodeName,
                    server: $server,
                    vmIp: $vmIp,
                    vmName: $vmName
                );

                // If attachment is pending (VM not running), return appropriate response
                if ($result['pending']) {
                    return response()->json([
                        'success' => true,
                        'pending' => true,
                        'message' => $result['message'],
                        'device' => new UsbDeviceResource($device->fresh()->load('gatewayNode')),
                    ]);
                }
            }

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
     * Detach a USB device from a VM.
     */
    public function detach(UsbDevice $device): JsonResponse
    {
        if (! $device->isAttached()) {
            return response()->json([
                'success' => false,
                'message' => 'Device is not attached to any VM',
            ], 422);
        }

        try {
            $this->gatewayService->detachFromVm($device);

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
     * Cancel a pending USB device attachment.
     */
    public function cancelPending(UsbDevice $device): JsonResponse
    {
        if (! $device->isPendingAttach()) {
            return response()->json([
                'success' => false,
                'message' => 'Device does not have a pending attachment',
            ], 422);
        }

        $cancelled = $this->gatewayService->cancelPendingAttachment($device);

        if (! $cancelled) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel pending attachment',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Pending attachment cancelled',
            'device' => new UsbDeviceResource($device->fresh()->load('gatewayNode')),
        ]);
    }

    /**
     * Convert a USB device to a Camera entity.
     * This marks the device as a camera and creates a Camera record
     * that integrates with the streaming system.
     */
    public function convertToCamera(Request $request, UsbDevice $device): JsonResponse
    {
        // Check if device already has a camera
        if ($device->hasCamera()) {
            return response()->json([
                'success' => false,
                'message' => 'This device is already registered as a camera',
                'camera' => new \App\Http\Resources\CameraResource($device->camera->load(['gatewayNode', 'usbDevice'])),
            ], 422);
        }

        // Validate optional stream settings
        $validated = $request->validate([
            'width' => 'nullable|integer|in:320,640,800,1280,1920',
            'height' => 'nullable|integer|in:240,480,600,720,1080',
            'framerate' => 'nullable|integer|min:5|max:30',
        ]);

        // Default stream settings (balanced for USB/IP bandwidth)
        $width = $validated['width'] ?? 640;
        $height = $validated['height'] ?? 480;
        $framerate = $validated['framerate'] ?? 15;

        // Generate a unique stream key
        $streamKey = 'usb-'.$device->gatewayNode->name.'-'.str_replace(['.', '-'], '', $device->busid);

        // Determine video device path - count existing cameras on this gateway
        $existingCameras = \App\Models\Camera::where('gateway_node_id', $device->gateway_node_id)->count();
        $videoDeviceIndex = $existingCameras * 2; // Each camera takes 2 /dev/video entries (video + metadata)
        $devicePath = "/dev/video{$videoDeviceIndex}";

        // Create the camera record
        $camera = \App\Models\Camera::create([
            'gateway_node_id' => $device->gateway_node_id,
            'usb_device_id' => $device->id,
            'name' => $device->name,
            'stream_key' => $streamKey,
            'source_url' => $devicePath,
            'stream_width' => $width,
            'stream_height' => $height,
            'stream_framerate' => $framerate,
            'stream_input_format' => 'mjpeg',
            'type' => \App\Enums\CameraType::USB,
            'status' => \App\Enums\CameraStatus::INACTIVE,
            'ptz_capable' => false,
        ]);

        // Mark the USB device as a camera
        $device->update(['is_camera' => true]);

        // Try to start the camera stream via gateway agent
        $streamResult = $this->gatewayService->startCameraStream(
            $device->gatewayNode,
            $streamKey,
            $devicePath,
            [
                'width' => $width,
                'height' => $height,
                'framerate' => $framerate,
                'input_format' => 'mjpeg',
            ]
        );

        if ($streamResult['success']) {
            $camera->update(['status' => \App\Enums\CameraStatus::ACTIVE]);
        }

        Log::info('USB device converted to camera', [
            'device_id' => $device->id,
            'camera_id' => $camera->id,
            'stream_key' => $streamKey,
            'device_path' => $devicePath,
            'resolution' => "{$width}x{$height}@{$framerate}fps",
            'stream_started' => $streamResult['success'],
            'stream_error' => $streamResult['error'] ?? null,
            'gateway_node_id' => $device->gateway_node_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => $streamResult['success'] 
                ? 'Device registered as camera successfully'
                : 'Device registered as camera (stream failed to start - use the activate endpoint to retry)',
            'camera' => new \App\Http\Resources\CameraResource($camera->fresh()->load(['gatewayNode', 'usbDevice'])),
            'device' => new UsbDeviceResource($device->fresh()->load('gatewayNode')),
            'stream_started' => $streamResult['success'],
            'stream_error' => $streamResult['error'] ?? null,
            'available_resolutions' => \App\Models\Camera::getAvailableResolutions(),
        ], 201);
    }

    /**
     * Remove camera registration from a USB device.
     * Deletes the Camera record and unmarks the device.
     */
    public function removeCamera(UsbDevice $device): JsonResponse
    {
        if (! $device->hasCamera()) {
            return response()->json([
                'success' => false,
                'message' => 'This device is not registered as a camera',
            ], 422);
        }

        $camera = $device->camera;

        // Check if camera has active controls or reservations
        if ($camera->isControlled()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot remove camera while it is being used by a session',
            ], 422);
        }

        // Stop the camera stream if running
        if ($camera->gatewayNode) {
            $this->gatewayService->stopCameraStream(
                $camera->gatewayNode,
                $camera->stream_key
            );
        }

        // Delete the camera record
        $camera->delete();

        // Unmark the device
        $device->update(['is_camera' => false]);

        Log::info('Camera registration removed from USB device', [
            'device_id' => $device->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Camera registration removed',
            'device' => new UsbDeviceResource($device->fresh()->load('gatewayNode')),
        ]);
    }

    /**
     * Manually activate/restart a camera stream.
     * Useful when the initial stream startup failed.
     * Returns detailed error information if activation fails.
     */
    public function activateCamera(UsbDevice $device): JsonResponse
    {
        if (! $device->hasCamera()) {
            return response()->json([
                'success' => false,
                'message' => 'This device is not registered as a camera',
            ], 422);
        }

        $camera = $device->camera;

        if (! $camera->gatewayNode) {
            return response()->json([
                'success' => false,
                'message' => 'Camera is not associated with a gateway node',
            ], 422);
        }

        // First, try to stop any existing stream
        try {
            $this->gatewayService->stopCameraStream(
                $camera->gatewayNode,
                $camera->stream_key
            );
        } catch (\Exception $e) {
            Log::debug('Could not stop existing stream (may not be running)', [
                'camera_id' => $camera->id,
                'error' => $e->getMessage(),
            ]);
        }

        // Now try to start the stream
        $streamResult = $this->gatewayService->startCameraStream(
            $camera->gatewayNode,
            $camera->stream_key,
            $camera->source_url,
            [
                'width' => $camera->stream_width,
                'height' => $camera->stream_height,
                'framerate' => $camera->stream_framerate,
                'input_format' => $camera->stream_input_format ?? 'mjpeg',
            ]
        );

        if ($streamResult['success']) {
            // Validate that the stream is actually running after 2 seconds
            // (give FFmpeg time to start and connect to MediaMTX)
            sleep(2);
            $currentStatus = $this->gatewayService->getCameraStreamStatus(
                $camera->gatewayNode,
                $camera->stream_key
            );

            if ($currentStatus['running'] ?? false) {
                $camera->update(['status' => \App\Enums\CameraStatus::ACTIVE]);

                Log::info('Camera stream activated and verified', [
                    'camera_id' => $camera->id,
                    'device_id' => $device->id,
                    'stream_key' => $camera->stream_key,
                    'process_id' => $currentStatus['pid'] ?? null,
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Camera stream activated successfully',
                    'camera' => new \App\Http\Resources\CameraResource($camera->fresh()->load(['gatewayNode', 'usbDevice'])),
                    'stream_status' => $currentStatus,
                ]);
            } else {
                // Stream start returned success but stream isn't actually running
                Log::warning('Camera stream started but not actually running', [
                    'camera_id' => $camera->id,
                    'device_id' => $device->id,
                    'stream_key' => $camera->stream_key,
                    'status_check' => $currentStatus,
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Stream startup command accepted but stream not detected running',
                    'error' => 'The gateway reported success but MediaMTX is not receiving the stream. Check FFmpeg logs on the gateway.',
                    'camera' => new \App\Http\Resources\CameraResource($camera->fresh()->load(['gatewayNode', 'usbDevice'])),
                    'status_check' => $currentStatus,
                    'debug_info' => [
                        'device_path' => $camera->source_url,
                        'gateway_node_ip' => $camera->gatewayNode->ip,
                        'stream_key' => $camera->stream_key,
                    ],
                ], 422);
            }
        }

        $errorMessage = $streamResult['error'] ?? 'Unknown error occurred while starting stream';

        Log::warning('Failed to activate camera stream', [
            'camera_id' => $camera->id,
            'device_id' => $device->id,
            'stream_key' => $camera->stream_key,
            'gateway_node_id' => $camera->gateway_node_id,
            'device_path' => $camera->source_url,
            'error' => $errorMessage,
        ]);

        return response()->json([
            'success' => false,
            'message' => 'Failed to start camera stream',
            'error' => $errorMessage,
            'camera' => new \App\Http\Resources\CameraResource($camera->fresh()->load(['gatewayNode', 'usbDevice'])),
            'debug_info' => [
                'device_path' => $camera->source_url,
                'gateway_node_ip' => $camera->gatewayNode->ip,
                'stream_key' => $camera->stream_key,
            ],
        ], 422);
    }

    /**
     * Update camera stream settings (resolution, framerate).
     * Restarts the stream with new settings if camera is active.
     */
    public function updateCameraSettings(Request $request, UsbDevice $device): JsonResponse
    {
        if (! $device->hasCamera()) {
            return response()->json([
                'success' => false,
                'message' => 'This device is not registered as a camera',
            ], 422);
        }

        $camera = $device->camera;

        // Validate stream settings
        $validated = $request->validate([
            'width' => 'required|integer|in:320,640,800,1280,1920',
            'height' => 'required|integer|in:240,480,600,720,1080',
            'framerate' => 'required|integer|min:5|max:30',
        ]);

        // Stop existing stream
        if ($camera->status === \App\Enums\CameraStatus::ACTIVE && $camera->gatewayNode) {
            $this->gatewayService->stopCameraStream(
                $camera->gatewayNode,
                $camera->stream_key
            );
        }

        // Update camera settings
        $camera->update([
            'stream_width' => $validated['width'],
            'stream_height' => $validated['height'],
            'stream_framerate' => $validated['framerate'],
        ]);

        // Restart stream with new settings
        $streamResult = ['success' => false, 'error' => null];
        if ($camera->gatewayNode) {
            $streamResult = $this->gatewayService->startCameraStream(
                $camera->gatewayNode,
                $camera->stream_key,
                $camera->source_url,
                [
                    'width' => $validated['width'],
                    'height' => $validated['height'],
                    'framerate' => $validated['framerate'],
                    'input_format' => $camera->stream_input_format ?? 'mjpeg',
                ]
            );

            $camera->update([
                'status' => $streamResult['success']
                    ? \App\Enums\CameraStatus::ACTIVE
                    : \App\Enums\CameraStatus::INACTIVE,
            ]);
        }

        Log::info('Camera stream settings updated', [
            'camera_id' => $camera->id,
            'new_resolution' => "{$validated['width']}x{$validated['height']}@{$validated['framerate']}fps",
            'stream_restarted' => $streamResult['success'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Camera settings updated'.($streamResult['success'] ? ' and stream restarted' : ''),
            'camera' => new \App\Http\Resources\CameraResource($camera->fresh()->load(['gatewayNode', 'usbDevice'])),
            'stream_restarted' => $streamResult['success'],
            'stream_error' => $streamResult['error'] ?? null,
        ]);
    }

    // ─── Admin-only endpoints ─────────────────────────────────────────────

    /**
     * Create a new gateway node (admin only).
     */
    public function storeNode(CreateGatewayNodeRequest $request): JsonResponse
    {
        $node = $this->gatewayService->createNode(
            name: $request->validated('name'),
            ip: $request->validated('ip'),
            port: $request->validated('port', 8000),
        );

        return response()->json([
            'success' => true,
            'message' => 'Gateway node created',
            'node' => new GatewayNodeResource($node->load('usbDevices')),
        ], 201);
    }

    /**
     * Delete a gateway node (admin only).
     */
    public function destroyNode(GatewayNode $node): JsonResponse
    {
        Gate::authorize('admin-only');

        $this->gatewayService->deleteNode($node);

        return response()->json([
            'success' => true,
            'message' => 'Gateway node deleted',
        ]);
    }

    /**
     * Update a gateway node (admin only).
     */
    public function updateNode(GatewayNode $node, Request $request): JsonResponse
    {
        Gate::authorize('admin-only');

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'ip' => ['sometimes', 'ip'],
            'port' => ['sometimes', 'integer', 'min:1', 'max:65535'],
            'description' => ['nullable', 'string', 'max:1000'],
            'proxmox_camera_api_url' => ['nullable', 'url', 'max:255'],
        ]);

        $this->nodeRepository->update($node, $validated);

        return response()->json([
            'success' => true,
            'message' => 'Gateway node updated',
            'node' => new GatewayNodeResource($node->fresh()->load('usbDevices')),
        ]);
    }

    /**
     * Verify/unverify a gateway node (admin only).
     * Only verified gateways are shown to users.
     * When unverifying, all devices on this gateway will be unbound.
     */
    public function verifyNode(GatewayNode $node, Request $request): JsonResponse
    {
        Gate::authorize('admin-only');

        $verified = $request->boolean('verified', true);

        // When unverifying, unbind all devices on this gateway
        if (! $verified) {
            $boundDevices = $node->usbDevices()
                ->whereIn('status', [UsbDeviceStatus::BOUND, UsbDeviceStatus::ATTACHED])
                ->get();

            $unbindErrors = [];
            foreach ($boundDevices as $device) {
                try {
                    // If device is attached, mark it as bound first (can't unbind attached devices)
                    if ($device->isAttached()) {
                        Log::warning('Skipping unbind for attached device during gateway unverify', [
                            'device_id' => $device->id,
                            'busid' => $device->busid,
                            'attached_to' => $device->attached_to,
                        ]);

                        continue;
                    }

                    $this->gatewayService->unbindDevice($device);
                    Log::info('Device unbound during gateway unverify', [
                        'device_id' => $device->id,
                        'busid' => $device->busid,
                        'gateway_id' => $node->id,
                    ]);
                } catch (\Throwable $e) {
                    Log::error('Failed to unbind device during gateway unverify', [
                        'device_id' => $device->id,
                        'busid' => $device->busid,
                        'error' => $e->getMessage(),
                    ]);
                    $unbindErrors[] = $device->busid;
                }
            }

            if (! empty($unbindErrors)) {
                Log::warning('Some devices failed to unbind during gateway unverify', [
                    'gateway_id' => $node->id,
                    'failed_busids' => $unbindErrors,
                ]);
            }
        }

        $this->nodeRepository->update($node, ['is_verified' => $verified]);

        return response()->json([
            'success' => true,
            'message' => $verified ? 'Gateway verified' : 'Gateway unverified',
            'node' => new GatewayNodeResource($node->fresh()->load('usbDevices')),
        ]);
    }

    /**
     * Check health of a specific gateway node.
     */
    public function healthCheck(GatewayNode $node): JsonResponse
    {
        $online = $this->gatewayService->checkHealth($node);

        return response()->json([
            'success' => true,
            'online' => $online,
            'node' => new GatewayNodeResource($node->fresh()),
        ]);
    }

    /**
     * Discover gateway nodes from Proxmox LXC containers (admin only).
     *
     * Queries all active Proxmox servers for LXC containers with "gateway"
     * in the name and registers them as gateway nodes.
     */
    public function discoverGateways(): JsonResponse
    {
        Gate::authorize('admin-only');

        try {
            $discovered = $this->discoveryService->discoverAll();

            $onlineCount = $discovered->where('online', true)->count();
            $offlineCount = $discovered->where('online', false)->count();

            $discovered->each(fn ($gateway) => $gateway->load('usbDevices'));

            return response()->json([
                'success' => true,
                'message' => "Discovered {$discovered->count()} gateway(s): {$onlineCount} online, {$offlineCount} offline",
                'discovered_count' => $discovered->count(),
                'online_count' => $onlineCount,
                'offline_count' => $offlineCount,
                'gateways' => GatewayNodeResource::collection($discovered),
            ]);
        } catch (\Exception $e) {
            // log the exception for diagnostics, including stacktrace in case unexpected
            Log::error('Error during gateway discovery', [
                'exception' => $e,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to discover gateways: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Refresh the online status of all known gateways.
     */
    public function refreshGatewayStatus(): JsonResponse
    {
        $this->discoveryService->refreshAllGatewayStatus();

        $nodes = $this->nodeRepository->all();
        $onlineCount = $nodes->where('online', true)->count();

        return response()->json([
            'success' => true,
            'message' => "{$onlineCount} of {$nodes->count()} gateways online",
            'data' => GatewayNodeResource::collection($nodes),
        ]);
    }

    /**
     * Get list of running VMs from all Proxmox servers (admin only).
     *
     * Returns a list of VMs that can be used as targets for USB device attachment.
     * Includes VM ID, name, IP address (if available via guest agent), and node.
     */
    public function runningVms(): JsonResponse
    {
        Gate::authorize('admin-only');

        $servers = ProxmoxServer::where('is_active', true)->get();
        $runningVms = [];

        foreach ($servers as $server) {
            try {
                $client = $this->proxmoxClientFactory->make($server);

                // Get all nodes on this server
                $nodes = $client->getNodes();

                foreach ($nodes as $nodeData) {
                    $nodeName = $nodeData['node'];

                    // Get all VMs on this node
                    $vms = $client->getVMs($nodeName);

                    foreach ($vms as $vm) {
                        if (($vm['status'] ?? 'stopped') !== 'running') {
                            continue;
                        }

                        $vmId = $vm['vmid'];
                        $vmName = $vm['name'] ?? "VM-{$vmId}";

                        // Try to get IP address via guest agent
                        $ipAddress = null;
                        try {
                            $ipAddress = $client->getVMNetworkIP($nodeName, $vmId);
                        } catch (\Throwable $e) {
                            // Guest agent not available or not running
                        }

                        $runningVms[] = [
                            'vmid' => $vmId,
                            'name' => $vmName,
                            'ip_address' => $ipAddress,
                            'node' => $nodeName,
                            'server_id' => $server->id,
                            'server_name' => $server->name,
                            'display_name' => $ipAddress
                                ? "{$vmName} ({$ipAddress})"
                                : "{$vmName} (No IP)",
                        ];
                    }
                }
            } catch (\Throwable $e) {
                // Log but continue with other servers
                Log::warning('Failed to get VMs from Proxmox server', [
                    'server_id' => $server->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $runningVms,
        ]);
    }

    /**
     * Dedicate a USB device to a VM (admin only).
     *
     * When a device is dedicated to a VM, it will automatically attach
     * whenever the VM starts. This uses VID:PID for identification which
     * is more reliable than bus ID (which changes with USB port).
     */
    public function dedicateDevice(Request $request, UsbDevice $device): JsonResponse
    {
        Gate::authorize('admin-only');

        $validated = $request->validate([
            'vmid' => ['required', 'integer', 'min:100'],
            'node' => ['required', 'string', 'max:255'],
            'server_id' => ['required', 'integer', 'exists:proxmox_servers,id'],
        ]);

        // Camera devices cannot be dedicated
        if ($device->is_camera) {
            return response()->json([
                'success' => false,
                'message' => 'Camera devices cannot be dedicated to VMs',
            ], 422);
        }

        $server = ProxmoxServer::findOrFail($validated['server_id']);

        try {
            $this->gatewayService->dedicateDeviceToVm(
                device: $device,
                vmid: $validated['vmid'],
                nodeName: $validated['node'],
                server: $server
            );

            return response()->json([
                'success' => true,
                'message' => "Device dedicated to VM {$validated['vmid']}. It will auto-attach on VM start.",
                'device' => new UsbDeviceResource($device->fresh()->load('gatewayNode')),
            ]);
        } catch (GatewayApiException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Remove dedication from a USB device (admin only).
     */
    public function removeDedication(UsbDevice $device): JsonResponse
    {
        Gate::authorize('admin-only');

        if (! $device->isDedicated()) {
            return response()->json([
                'success' => false,
                'message' => 'Device is not dedicated to any VM',
            ], 422);
        }

        $previousVmid = $device->dedicated_vmid;
        $this->gatewayService->removeDedication($device);

        return response()->json([
            'success' => true,
            'message' => "Dedication to VM {$previousVmid} removed",
            'device' => new UsbDeviceResource($device->fresh()->load('gatewayNode')),
        ]);
    }

    /**
     * Get all dedicated device assignments (admin only).
     */
    public function dedicatedDevices(): JsonResponse
    {
        Gate::authorize('admin-only');

        $devices = $this->deviceRepository->findAllDedicated();

        return response()->json([
            'success' => true,
            'data' => UsbDeviceResource::collection($devices),
        ]);
    }
}
