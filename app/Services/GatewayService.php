<?php

namespace App\Services;

use App\Exceptions\GatewayApiException;
use App\Exceptions\ProxmoxApiException;
use App\Models\GatewayNode;
use App\Models\UsbDevice;
use App\Enums\UsbDeviceStatus;
use App\Models\VMSession;
use App\Repositories\GatewayNodeRepository;
use App\Repositories\UsbDeviceRepository;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Service for interacting with USB/IP Gateway agents.
 *
 * Each gateway container runs a REST API that exposes USB device
 * discovery, binding, and attachment operations.
 *
 * Attach/detach operations are executed inside VMs via Proxmox QEMU guest agent.
 */
class GatewayService
{
    /**
     * Windows usbip-win executable path using DOS 8.3 short names.
     *
     * This format is required because:
     * 1. "Program Files" has spaces which Proxmox guest agent struggles with
     * 2. Command arguments are not properly parsed with long paths
     *
     * Prerequisites: usbip-win must be installed in C:\Program Files\usbip-win\
     */
    private const WINDOWS_USBIP_PATH = 'C:\PROGRA~1\USBIP-~1\usbip.exe';

    public function __construct(
        private readonly GatewayNodeRepository $nodeRepository,
        private readonly UsbDeviceRepository $deviceRepository,
        private readonly ProxmoxClientFactory $proxmoxClientFactory,
    ) {}

    private function timeout(): int
    {
        return config('gateway.timeout', 5);
    }

    /**
     * Discover all USB devices from all gateway nodes.
     *
     * @return array<string, int> Summary of discovery results
     */
    public function discoverAllDevices(): array
    {
        $nodes = $this->nodeRepository->all();
        $summary = [
            'nodes_checked' => 0,
            'nodes_online' => 0,
            'devices_found' => 0,
            'devices_removed' => 0,
        ];

        foreach ($nodes as $node) {
            $summary['nodes_checked']++;
            $result = $this->discoverDevicesFromNode($node);

            if ($result['success']) {
                $summary['nodes_online']++;
                $summary['devices_found'] += $result['devices_count'];
                $summary['devices_removed'] += $result['removed_count'];
            }
        }

        return $summary;
    }

    /**
     * Discover USB devices from a specific gateway node.
     *
     * @return array{success: bool, devices_count: int, removed_count: int, error?: string}
     */
    public function discoverDevicesFromNode(GatewayNode $node): array
    {
        try {
            $response = Http::timeout($this->timeout())
                ->get("{$node->api_url}/devices");

            if (!$response->ok()) {
                $this->nodeRepository->markOffline($node);
                return [
                    'success' => false,
                    'devices_count' => 0,
                    'removed_count' => 0,
                    'error' => "HTTP {$response->status()}: {$response->body()}",
                ];
            }

            $this->nodeRepository->markOnline($node);

            $devices = $response->json('devices', []);
            $currentBusIds = [];

            foreach ($devices as $device) {
                $currentBusIds[] = $device['busid'];

                $this->deviceRepository->updateOrCreate(
                    [
                        'gateway_node_id' => $node->id,
                        'busid' => $device['busid'],
                    ],
                    [
                        'vendor_id' => $device['vendor_id'],
                        'product_id' => $device['product_id'],
                        'name' => $device['name'],
                    ]
                );
            }

            // Remove devices that are no longer present
            $removedCount = $this->deviceRepository->removeStaleDevices($node, $currentBusIds);

            return [
                'success' => true,
                'devices_count' => count($devices),
                'removed_count' => $removedCount,
            ];
        } catch (\Exception $e) {
            Log::warning('Gateway discovery failed', [
                'node_id' => $node->id,
                'node_ip' => $node->ip,
                'error' => $e->getMessage(),
            ]);

            $this->nodeRepository->markOffline($node);

            return [
                'success' => false,
                'devices_count' => 0,
                'removed_count' => 0,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Check health of a gateway node.
     */
    public function checkHealth(GatewayNode $node): bool
    {
        try {
            $response = Http::timeout($this->timeout())
                ->get("{$node->api_url}/health");

            $online = $response->ok();

            if ($online) {
                $this->nodeRepository->markOnline($node);
            } else {
                $this->nodeRepository->markOffline($node);
            }

            return $online;
        } catch (\Exception $e) {
            $this->nodeRepository->markOffline($node);
            return false;
        }
    }

    /**
     * Bind a USB device for sharing via USB/IP.
     *
     * @throws GatewayApiException
     */
    public function bindDevice(UsbDevice $device): void
    {
        $node = $device->gatewayNode;

        if (!$node) {
            throw new GatewayApiException(
                'Device has no associated gateway node',
                operation: 'bind'
            );
        }

        try {
            $response = Http::timeout($this->timeout())
                ->post("{$node->api_url}/bind", [
                    'busid' => $device->busid,
                ]);

            if (!$response->ok()) {
                throw new GatewayApiException(
                    $response->json('detail', 'Bind operation failed'),
                    gatewayHost: $node->ip,
                    operation: 'bind'
                );
            }

            $this->deviceRepository->markBound($device);

            Log::info('USB device bound', [
                'device_id' => $device->id,
                'busid' => $device->busid,
                'node' => $node->name,
            ]);
        } catch (GatewayApiException $e) {
            throw $e;
        } catch (\Exception $e) {
            throw new GatewayApiException(
                "Failed to bind device: {$e->getMessage()}",
                gatewayHost: $node->ip,
                operation: 'bind',
                previous: $e
            );
        }
    }

    /**
     * Unbind a USB device from USB/IP sharing.
     *
     * @throws GatewayApiException
     */
    public function unbindDevice(UsbDevice $device): void
    {
        $node = $device->gatewayNode;

        if (!$node) {
            throw new GatewayApiException(
                'Device has no associated gateway node',
                operation: 'unbind'
            );
        }

        try {
            $response = Http::timeout($this->timeout())
                ->post("{$node->api_url}/unbind", [
                    'busid' => $device->busid,
                ]);

            if (!$response->ok()) {
                throw new GatewayApiException(
                    $response->json('detail', 'Unbind operation failed'),
                    gatewayHost: $node->ip,
                    operation: 'unbind'
                );
            }

            $this->deviceRepository->markAvailable($device);

            Log::info('USB device unbound', [
                'device_id' => $device->id,
                'busid' => $device->busid,
                'node' => $node->name,
            ]);
        } catch (GatewayApiException $e) {
            throw $e;
        } catch (\Exception $e) {
            throw new GatewayApiException(
                "Failed to unbind device: {$e->getMessage()}",
                gatewayHost: $node->ip,
                operation: 'unbind',
                previous: $e
            );
        }
    }

    /**
     * Attach a USB device to a VM via USB/IP using Proxmox guest agent.
     *
     * This method executes `usbip attach` inside the VM via the QEMU guest agent,
     * ensuring the device is properly attached from the VM's perspective.
     *
     * @param UsbDevice $device   The USB device to attach
     * @param VMSession $session  The VM session to attach the device to
     *
     * @throws GatewayApiException If the attach operation fails
     */
    public function attachToSession(UsbDevice $device, VMSession $session): void
    {
        $node = $device->gatewayNode;

        if (!$node) {
            throw new GatewayApiException(
                'Device has no associated gateway node',
                operation: 'attach'
            );
        }

        // Ensure device is bound for sharing
        if (!$device->isBound() && !$device->isAvailable()) {
            throw new GatewayApiException(
                'Device must be bound before attaching',
                operation: 'attach'
            );
        }

        // Ensure session has required data
        if (!$session->vm_id || !$session->node_id) {
            throw new GatewayApiException(
                'Session missing VM ID or node information',
                operation: 'attach'
            );
        }

        // Load the node relationship to get the node name
        $session->loadMissing(['node', 'proxmoxServer']);
        $proxmoxNode = $session->node;

        if (!$proxmoxNode) {
            throw new GatewayApiException(
                'Session has no associated Proxmox node',
                operation: 'attach'
            );
        }

        // Build the usbip attach command to run inside the VM
        $gatewayIp = $node->ip;
        $busid = $device->busid;

        try {
            // Get the Proxmox client for this session's server
            $proxmoxClient = $this->proxmoxClientFactory->make($session->proxmoxServer);

            // Query the guest agent for the actual OS type
            $osType = $proxmoxClient->getGuestOsType($proxmoxNode->name, $session->vm_id);
            $isWindows = ($osType === 'windows');

            // Execute the attach command inside the VM via guest agent
            Log::info('Executing usbip attach inside VM via guest agent', [
                'device_id' => $device->id,
                'busid' => $busid,
                'gateway_ip' => $gatewayIp,
                'session_id' => $session->id,
                'node' => $proxmoxNode->name,
                'vmid' => $session->vm_id,
                'os_type' => $osType,
            ]);

            // Execute the command differently based on OS type
            $result = $this->executeUsbipCommand(
                proxmoxClient: $proxmoxClient,
                nodeName: $proxmoxNode->name,
                vmid: $session->vm_id,
                command: "attach -r {$gatewayIp} -b {$busid}",
                isWindows: $isWindows,
                timeoutSeconds: 30
            );

            if (!$result['success']) {
                $errorMsg = $result['err-data'] ?? $result['out-data'] ?? 'Unknown error';

                // If the device is no longer bound on the gateway, mark it available
                if (str_contains(strtolower($errorMsg), 'not found') ||
                    str_contains(strtolower($errorMsg), 'no such')
                ) {
                    Log::warning('usbip attach failed because device appears missing from gateway; marking available', [
                        'device_id' => $device->id,
                        'error' => $errorMsg,
                    ]);
                    $device->status = UsbDeviceStatus::AVAILABLE;
                    $device->attached_session_id = null;
                    $device->save();
                    throw new GatewayApiException(
                        "usbip attach failed: {$errorMsg}",
                        gatewayHost: $gatewayIp,
                        operation: 'attach'
                    );
                }

                // If the attach command timed out, check if device is already attached in VM
                if (str_contains(strtolower($errorMsg), 'timeout')) {
                    Log::warning('usbip attach command timed out, checking device state in VM', [
                        'device_id' => $device->id,
                        'session_id' => $session->id,
                        'error' => $errorMsg,
                    ]);
                    // Try to get the port number; if found, mark as attached
                    $port = $this->getAttachedPort(
                        proxmoxClient: $proxmoxClient,
                        nodeName: $proxmoxNode->name,
                        vmid: $session->vm_id,
                        busid: $busid,
                        isWindows: $isWindows
                    );
                    if ($port !== null) {
                        $vmName = "session-{$session->id}";
                        $this->deviceRepository->markAttached($device, $vmName, $session->id, $session->ip_address, $port);
                        Log::info('USB device marked attached after timeout (port found)', [
                            'device_id' => $device->id,
                            'session_id' => $session->id,
                            'port' => $port,
                        ]);
                        return;
                    }
                    // If not found, mark as available
                    $device->status = UsbDeviceStatus::AVAILABLE;
                    $device->attached_session_id = null;
                    $device->save();
                    throw new GatewayApiException(
                        "usbip attach failed: timeout and device not found in VM",
                        gatewayHost: $gatewayIp,
                        operation: 'attach'
                    );
                }

                throw new GatewayApiException(
                    "usbip attach failed: {$errorMsg}",
                    gatewayHost: $gatewayIp,
                    operation: 'attach'
                );
            }

            // Get the port number from usbip port command
            $port = $this->getAttachedPort(
                proxmoxClient: $proxmoxClient,
                nodeName: $proxmoxNode->name,
                vmid: $session->vm_id,
                busid: $busid,
                isWindows: $isWindows
            );

            $vmName = "session-{$session->id}";
            $this->deviceRepository->markAttached($device, $vmName, $session->id, $session->ip_address, $port);

            Log::info('USB device attached to VM via guest agent', [
                'device_id' => $device->id,
                'busid' => $busid,
                'session_id' => $session->id,
                'port' => $port,
            ]);
        } catch (ProxmoxApiException $e) {
            Log::error('Proxmox guest agent attach failed', [
                'device_id' => $device->id,
                'session_id' => $session->id,
                'error' => $e->getMessage(),
            ]);

            throw new GatewayApiException(
                "Failed to attach device via guest agent: {$e->getMessage()}",
                gatewayHost: $gatewayIp,
                operation: 'attach',
                previous: $e
            );
        }
    }

    /**
     * Execute a usbip command inside a VM via guest agent.
     *
     * Handles the differences between Linux and Windows VMs:
     * - Linux: Direct command execution works fine
     * - Windows: Uses a batch file because Proxmox guest agent struggles with command arguments
     *
     * @param ProxmoxClientInterface $proxmoxClient The Proxmox client
     * @param string $nodeName       The Proxmox node name
     * @param int    $vmid           The VM ID
     * @param string $command        The usbip subcommand and arguments (e.g., "attach -r 192.168.1.1 -b 1-2")
     * @param bool   $isWindows      Whether this is a Windows VM
     * @param int    $timeoutSeconds Command timeout
     *
     * @return array{exitcode: int, out-data?: string, err-data?: string, success: bool}
     */
    private function executeUsbipCommand(
        ProxmoxClientInterface $proxmoxClient,
        string $nodeName,
        int $vmid,
        string $command,
        bool $isWindows,
        int $timeoutSeconds = 30
    ): array {
        // Always attempt the direct invocation first. On Linux this will be the only
        // path taken; on Windows we may need to fallback if the guest agent can't
        // handle the path with spaces or arguments correctly.
        //
        // We wrap in try-catch because ProxmoxClient may throw ProxmoxApiException
        // if the guest agent returns 500 (e.g., "No such file or directory" when
        // the command isn't in PATH). For Windows, we want to catch that and try
        // the batch file fallback.
        $direct = null;
        $directException = null;

        try {
            $direct = $proxmoxClient->execInVmAndWait(
                nodeName: $nodeName,
                vmid: $vmid,
                command: "usbip {$command}",
                timeoutSeconds: $timeoutSeconds
            );

            if ($direct['success']) {
                return $direct;
            }
        } catch (ProxmoxApiException $e) {
            // Store the exception - we'll use it for logging and rethrow if no fallback
            $directException = $e;
        }

        // If the direct execution failed and we know the VM is Windows, try the
        // batch file approach as a last resort. For Linux we'll just return the
        // failing result (or rethrow the exception) so the caller can handle the error.
        if (!$isWindows) {
            if ($directException) {
                throw $directException;
            }
            return $direct;
        }

        Log::warning('Direct usbip command failed, falling back to batch file', [
            'node' => $nodeName,
            'vmid' => $vmid,
            'command' => $command,
            'direct_result' => $direct,
            'direct_exception' => $directException?->getMessage(),
        ]);

        // Windows: Write a batch file first, then execute it
        $batchPath = 'C:\usbip-cmd.bat';
        $batchContent = self::WINDOWS_USBIP_PATH . ' ' . $command;

        Log::debug('Writing Windows usbip batch file', [
            'node' => $nodeName,
            'vmid' => $vmid,
            'batch_content' => $batchContent,
        ]);

        $proxmoxClient->writeFileInVm(
            nodeName: $nodeName,
            vmid: $vmid,
            filePath: $batchPath,
            content: $batchContent
        );

        return $proxmoxClient->execInVmAndWait(
            nodeName: $nodeName,
            vmid: $vmid,
            command: $batchPath,
            timeoutSeconds: $timeoutSeconds
        );
    }

    /**
     * Get the USB/IP port number for a recently attached device.
     *
     * Runs `usbip port` inside the VM and parses the output to find the port.
     */
    private function getAttachedPort(
        ProxmoxClientInterface $proxmoxClient,
        string $nodeName,
        int $vmid,
        string $busid,
        bool $isWindows = false
    ): ?string {
        try {
            $result = $this->executeUsbipCommand(
                proxmoxClient: $proxmoxClient,
                nodeName: $nodeName,
                vmid: $vmid,
                command: 'port',
                isWindows: $isWindows,
                timeoutSeconds: 10
            );

            if (!$result['success']) {
                Log::warning('Could not get usbip port list', [
                    'vmid' => $vmid,
                    'error' => $result['err-data'] ?? 'Unknown',
                ]);
                return null;
            }

            // Parse the output to find the port number
            // Example output:
            // Port 00:  <device>
            //     busid: 1-1.2
            //     ...
            $output = $result['out-data'] ?? '';
            $lines = explode("\n", $output);
            $currentPort = null;

            foreach ($lines as $line) {
                // Match "Port 00:" pattern
                if (preg_match('/Port\s+(\d+):/', $line, $matches)) {
                    $currentPort = $matches[1];
                }
                // Match busid line
                if ($currentPort !== null && str_contains($line, $busid)) {
                    return $currentPort;
                }
            }

            // If we couldn't find the exact busid, return the latest port
            // (the most recently attached device)
            return $currentPort;
        } catch (\Throwable $e) {
            Log::warning('Failed to get usbip port', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Attach a USB device to a VM via USB/IP (legacy method).
     *
     * @deprecated Use attachToSession() instead for proper Proxmox integration.
     *
     * @throws GatewayApiException
     */
    public function attachToVm(UsbDevice $device, string $vmIp, string $vmName, ?string $sessionId = null): void
    {
        $node = $device->gatewayNode;

        if (!$node) {
            throw new GatewayApiException(
                'Device has no associated gateway node',
                operation: 'attach'
            );
        }

        // If we have a session ID, try to use the new method
        if ($sessionId) {
            $session = VMSession::find($sessionId);
            if ($session && $session->vm_id && $session->node_id) {
                $this->attachToSession($device, $session);
                return;
            }
        }

        // Fallback to gateway API call (legacy behavior)
        try {
            $response = Http::timeout($this->timeout())
                ->post("{$node->api_url}/attach", [
                    'server_ip' => $node->ip,
                    'busid' => $device->busid,
                    'target_ip' => $vmIp,
                ]);

            if (!$response->ok()) {
                throw new GatewayApiException(
                    $response->json('detail', 'Attach operation failed'),
                    gatewayHost: $node->ip,
                    operation: 'attach'
                );
            }

            $port = $response->json('port');
            $this->deviceRepository->markAttached($device, $vmName, $sessionId, $vmIp, $port);

            Log::info('USB device attached to VM (legacy)', [
                'device_id' => $device->id,
                'busid' => $device->busid,
                'vm_name' => $vmName,
                'vm_ip' => $vmIp,
                'session_id' => $sessionId,
            ]);
        } catch (GatewayApiException $e) {
            throw $e;
        } catch (\Exception $e) {
            throw new GatewayApiException(
                "Failed to attach device to VM: {$e->getMessage()}",
                gatewayHost: $node->ip,
                operation: 'attach',
                previous: $e
            );
        }
    }

    /**
     * Detach a USB device from a VM session via Proxmox guest agent.
     *
     * This method executes `usbip detach` inside the VM via the QEMU guest agent.
     *
     * @param UsbDevice $device   The USB device to detach
     * @param VMSession $session  The VM session to detach the device from
     *
     * @throws GatewayApiException If the detach operation fails
     */
    public function detachFromSession(UsbDevice $device, VMSession $session): void
    {
        $node = $device->gatewayNode;

        if (!$node) {
            throw new GatewayApiException(
                'Device has no associated gateway node',
                operation: 'detach'
            );
        }

        // Ensure session has required data
        if (!$session->vm_id || !$session->node_id) {
            throw new GatewayApiException(
                'Session missing VM ID or node information',
                operation: 'detach'
            );
        }

        // Load the node relationship
        $session->loadMissing(['node', 'proxmoxServer']);
        $proxmoxNode = $session->node;

        if (!$proxmoxNode) {
            throw new GatewayApiException(
                'Session has no associated Proxmox node',
                operation: 'detach'
            );
        }

        // Get the Proxmox client and OS type once
        $proxmoxClient = $this->proxmoxClientFactory->make($session->proxmoxServer);
        $osType = $proxmoxClient->getGuestOsType($proxmoxNode->name, $session->vm_id);
        $isWindows = ($osType === 'windows');

        $port = $device->usbip_port;

        if (!$port) {
            // Try to find the port by running usbip port and matching busid
            Log::warning('No port recorded, attempting to find port for device', [
                'device_id' => $device->id,
                'busid' => $device->busid,
            ]);

            try {
                $port = $this->getAttachedPort(
                    proxmoxClient: $proxmoxClient,
                    nodeName: $proxmoxNode->name,
                    vmid: $session->vm_id,
                    busid: $device->busid,
                    isWindows: $isWindows
                );
            } catch (\Throwable $e) {
                Log::warning('Could not auto-detect port', ['error' => $e->getMessage()]);
            }
        }

        if (!$port) {
            // Device may already have been removed inside the guest or the
            // usbip binding cleared manually. Treat this as a successful detach
            // to avoid leaving the record in an attached state.
            Log::info('No usbip port found during detach; marking device detached anyway', [
                'device_id' => $device->id,
                'session_id' => $session->id,
            ]);
            $device->status = UsbDeviceStatus::BOUND;
            $device->attached_session_id = null;
            $device->usbip_port = null;
            $device->save();
            return;
        }

        try {
            Log::info('Executing usbip detach inside VM via guest agent', [
                'device_id' => $device->id,
                'port' => $port,
                'session_id' => $session->id,
                'node' => $proxmoxNode->name,
                'vmid' => $session->vm_id,
                'os_type' => $osType,
            ]);

            $result = $this->executeUsbipCommand(
                proxmoxClient: $proxmoxClient,
                nodeName: $proxmoxNode->name,
                vmid: $session->vm_id,
                command: "detach -p {$port}",
                isWindows: $isWindows,
                timeoutSeconds: 15
            );

            if (!$result['success']) {
                $errorMsg = $result['err-data'] ?? $result['out-data'] ?? 'Unknown error';

                // If the error indicates the device or port is gone, just log and
                // continue like a successful detach. This covers cases where the
                // user removed the device inside the VM or it was unbound
                // manually; we don't want to leave the record marked attached.
                if (str_contains(strtolower($errorMsg), 'not found') ||
                    str_contains(strtolower($errorMsg), 'no such') ||
                    str_contains(strtolower($errorMsg), 'error 125')
                ) {
                    Log::warning('usbip detach reported missing device, marking detached anyway', [
                        'device_id' => $device->id,
                        'error' => $errorMsg,
                    ]);
                } else {
                    throw new GatewayApiException(
                        "usbip detach failed: {$errorMsg}",
                        gatewayHost: $node->ip,
                        operation: 'detach'
                    );
                }
            }

            $this->deviceRepository->markDetached($device);

            Log::info('USB device detached from VM via guest agent', [
                'device_id' => $device->id,
                'port' => $port,
                'session_id' => $session->id,
            ]);
        } catch (ProxmoxApiException $e) {
            Log::error('Proxmox guest agent detach failed', [
                'device_id' => $device->id,
                'session_id' => $session->id,
                'error' => $e->getMessage(),
            ]);

            throw new GatewayApiException(
                "Failed to detach device via guest agent: {$e->getMessage()}",
                gatewayHost: $node->ip,
                operation: 'detach',
                previous: $e
            );
        }
    }

    /**
     * Detach a USB device from a VM.
     *
     * If the device is attached to a session, uses the guest agent method.
     * Otherwise, falls back to the legacy gateway API call.
     *
     * @throws GatewayApiException
     */
    public function detachFromVm(UsbDevice $device): void
    {
        $node = $device->gatewayNode;

        if (!$node) {
            throw new GatewayApiException(
                'Device has no associated gateway node',
                operation: 'detach'
            );
        }

        // If device has an attached session, use the guest agent method
        if ($device->attached_session_id) {
            $session = $device->attachedSession;
            if ($session && $session->vm_id && $session->node_id) {
                $this->detachFromSession($device, $session);
                return;
            }
        }

        // Fallback to legacy gateway API call
        if (!$device->usbip_port) {
            Log::warning('Detaching device without port reference (legacy)', [
                'device_id' => $device->id,
                'busid' => $device->busid,
            ]);
        }

        try {
            $response = Http::timeout($this->timeout())
                ->post("{$node->api_url}/detach", [
                    'busid' => $device->busid,
                    'port' => $device->usbip_port,
                ]);

            if (!$response->ok()) {
                throw new GatewayApiException(
                    $response->json('detail', 'Detach operation failed'),
                    gatewayHost: $node->ip,
                    operation: 'detach'
                );
            }

            $this->deviceRepository->markDetached($device);

            Log::info('USB device detached from VM (legacy)', [
                'device_id' => $device->id,
                'busid' => $device->busid,
                'previous_vm' => $device->attached_to,
            ]);
        } catch (GatewayApiException $e) {
            throw $e;
        } catch (\Exception $e) {
            throw new GatewayApiException(
                "Failed to detach device from VM: {$e->getMessage()}",
                gatewayHost: $node->ip,
                operation: 'detach',
                previous: $e
            );
        }
    }

    /**
     * Create a new gateway node.
     */
    public function createNode(string $name, string $ip, int $port = 8000): GatewayNode
    {
        $node = $this->nodeRepository->create([
            'name' => $name,
            'ip' => $ip,
            'port' => $port,
            'online' => false,
        ]);

        // Try to check if it's online
        $this->checkHealth($node);

        return $node->fresh();
    }

    /**
     * Delete a gateway node and all its devices.
     */
    public function deleteNode(GatewayNode $node): void
    {
        // Devices are cascade deleted via FK constraint
        $this->nodeRepository->delete($node);

        Log::info('Gateway node deleted', [
            'node_id' => $node->id,
            'node_name' => $node->name,
        ]);
    }
}
