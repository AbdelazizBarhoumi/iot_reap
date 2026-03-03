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
     */
    public function index(Request $request)
    {
        if ($request->wantsJson()) {
            $nodes = $this->nodeRepository->all();

            return response()->json([
                'data' => GatewayNodeResource::collection($nodes),
            ]);
        }

        // Render Inertia page
        return Inertia::render('hardware/HardwarePage');
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

        if (!$result['success']) {
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
        if (!$device->isAvailable()) {
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

        if (!$device->isBound()) {
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
        if (!$device->isBound()) {
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
        if (!$device->isAttached()) {
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
        if (!$device->isPendingAttach()) {
            return response()->json([
                'success' => false,
                'message' => 'Device does not have a pending attachment',
            ], 422);
        }

        $cancelled = $this->gatewayService->cancelPendingAttachment($device);

        if (!$cancelled) {
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
        if (!$verified) {
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

            if (!empty($unbindErrors)) {
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

            return response()->json([
                'success' => true,
                'message' => "Discovered {$discovered->count()} gateway(s): {$onlineCount} online, {$offlineCount} offline",
                'discovered_count' => $discovered->count(),
                'online_count' => $onlineCount,
                'offline_count' => $offlineCount,
                'gateways' => GatewayNodeResource::collection($discovered->load('usbDevices')),
            ]);
        } catch (\Exception $e) {
            // log the exception for diagnostics, including stacktrace in case unexpected
            Log::error('Error during gateway discovery', [
                'exception' => $e,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to discover gateways: ' . $e->getMessage(),
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
}
