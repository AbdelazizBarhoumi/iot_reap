<?php

namespace App\Services;

use App\Exceptions\GatewayApiException;
use App\Exceptions\ProxmoxApiException;
use App\Models\GatewayNode;
use App\Models\ProxmoxServer;
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
     * Safely extract an error message from a JSON response.
     * Handles cases where the 'detail' field could be an array or object.
     */
    private function extractErrorMessage(\Illuminate\Http\Client\Response $response, string $key = 'detail', string $default = 'Operation failed'): string
    {
        $value = $response->json($key, $default);
        
        if (is_string($value)) {
            return $value;
        }
        
        if (is_array($value)) {
            // Try common error array formats
            if (isset($value['message'])) {
                return (string) $value['message'];
            }
            if (isset($value['error'])) {
                return (string) $value['error'];
            }
            if (isset($value['msg'])) {
                return (string) $value['msg'];
            }
            // Fallback: JSON encode the error detail
            return json_encode($value) ?: $default;
        }
        
        return (string) $value;
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
     * Check if a device is actually exportable (can be seen by usbip clients).
     *
     * A device may be in "bound" state in the database but usbipd may not be
     * serving it properly (e.g., after container restart, usbipd restart).
     *
     * @param UsbDevice $device The device to check
     * @return bool True if device is visible via /devices/exported endpoint
     */
    public function isDeviceExportable(UsbDevice $device): bool
    {
        $node = $device->gatewayNode;

        if (!$node) {
            return false;
        }

        try {
            $response = Http::timeout($this->timeout())
                ->get("{$node->api_url}/devices/exported");

            if (!$response->ok()) {
                return false;
            }

            $output = $response->json('output', '');
            return str_contains($output, $device->busid);
        } catch (\Exception $e) {
            Log::warning('Failed to check device exportability', [
                'device_id' => $device->id,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Ensure a device is properly exportable by rebinding if necessary.
     *
     * This handles the edge case where a device is marked as "bound" in the DB
     * but usbipd isn't actually serving it (e.g., after daemon restart).
     *
     * @param UsbDevice $device The device to ensure is exportable
     * @return bool True if device is now exportable
     * @throws GatewayApiException If rebind fails
     */
    public function ensureDeviceExportable(UsbDevice $device): bool
    {
        // First check if already exportable
        if ($this->isDeviceExportable($device)) {
            return true;
        }

        // Device not exportable - try unbind then rebind
        $node = $device->gatewayNode;
        if (!$node) {
            throw new GatewayApiException(
                'Device has no associated gateway node',
                operation: 'ensure-exportable'
            );
        }

        Log::info('Device not exportable, attempting rebind', [
            'device_id' => $device->id,
            'busid' => $device->busid,
            'node' => $node->name,
        ]);

        try {
            // Try unbind first (ignore errors - device may not be bound)
            Http::timeout($this->timeout())
                ->post("{$node->api_url}/unbind", ['busid' => $device->busid]);
        } catch (\Exception $e) {
            // Ignore unbind errors
            Log::debug('Unbind during rebind attempt failed (expected)', [
                'error' => $e->getMessage(),
            ]);
        }

        // Small delay to let usbipd process the unbind
        usleep(500000); // 500ms

        // Now bind
        try {
            $response = Http::timeout($this->timeout())
                ->post("{$node->api_url}/bind", ['busid' => $device->busid]);

            if (!$response->ok()) {
                $detail = $this->extractErrorMessage($response, 'detail', 'Bind failed');
                
                // "already bound" is actually success
                if (!str_contains(strtolower($detail), 'already bound')) {
                    throw new GatewayApiException(
                        "Rebind failed: {$detail}",
                        gatewayHost: $node->ip,
                        operation: 'ensure-exportable'
                    );
                }
            }
        } catch (GatewayApiException $e) {
            throw $e;
        } catch (\Exception $e) {
            throw new GatewayApiException(
                "Failed to rebind device: {$e->getMessage()}",
                gatewayHost: $node->ip,
                operation: 'ensure-exportable',
                previous: $e
            );
        }

        // Update DB status
        $this->deviceRepository->markBound($device);

        // Wait a bit and verify
        usleep(500000); // 500ms

        if (!$this->isDeviceExportable($device)) {
            Log::error('Device still not exportable after rebind', [
                'device_id' => $device->id,
                'busid' => $device->busid,
            ]);
            return false;
        }

        Log::info('Device successfully rebound and now exportable', [
            'device_id' => $device->id,
            'busid' => $device->busid,
        ]);

        return true;
    }

    /**
     * Verify gateway and device state before an operation.
     *
     * Performs pre-flight checks:
     * 1. Gateway is online
     * 2. Device exists on the gateway
     * 3. Device is properly exportable (for attach operations)
     *
     * @param UsbDevice $device The device to verify
     * @param bool $requireExportable Whether device must be exportable (for attach)
     * @return array{ok: bool, error?: string, auto_fixed?: bool}
     */
    public function verifyDeviceState(UsbDevice $device, bool $requireExportable = false): array
    {
        $node = $device->gatewayNode;

        if (!$node) {
            return ['ok' => false, 'error' => 'Device has no associated gateway node'];
        }

        // Check gateway health
        if (!$this->checkHealth($node)) {
            return ['ok' => false, 'error' => "Gateway {$node->name} is offline"];
        }

        // Check device exists on gateway
        try {
            $response = Http::timeout($this->timeout())
                ->get("{$node->api_url}/devices");

            if (!$response->ok()) {
                return ['ok' => false, 'error' => 'Failed to query gateway devices'];
            }

            $devices = $response->json('devices', []);
            $found = collect($devices)->firstWhere('busid', $device->busid);

            if (!$found) {
                // Device not on gateway - mark as disconnected
                $device->update(['status' => UsbDeviceStatus::DISCONNECTED]);
                return ['ok' => false, 'error' => "Device {$device->busid} not found on gateway"];
            }
        } catch (\Exception $e) {
            return ['ok' => false, 'error' => "Gateway query failed: {$e->getMessage()}"];
        }

        // Check exportability if required
        if ($requireExportable) {
            if (!$this->isDeviceExportable($device)) {
                // Try to auto-fix
                try {
                    if ($this->ensureDeviceExportable($device)) {
                        return ['ok' => true, 'auto_fixed' => true];
                    } else {
                        return ['ok' => false, 'error' => 'Device is bound but not exportable (rebind failed)'];
                    }
                } catch (GatewayApiException $e) {
                    return ['ok' => false, 'error' => "Auto-rebind failed: {$e->getMessage()}"];
                }
            }
        }

        return ['ok' => true];
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
                    $this->extractErrorMessage($response, 'detail', 'Bind operation failed'),
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
                    $this->extractErrorMessage($response, 'detail', 'Unbind operation failed'),
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

        // Pre-flight check: verify gateway and device state, auto-fix if possible
        $verification = $this->verifyDeviceState($device, requireExportable: true);
        if (!$verification['ok']) {
            throw new GatewayApiException(
                $verification['error'] ?? 'Device verification failed',
                gatewayHost: $node->ip,
                operation: 'attach'
            );
        }

        if (!empty($verification['auto_fixed'])) {
            Log::info('Device was auto-fixed during attach pre-flight', [
                'device_id' => $device->id,
                'busid' => $device->busid,
            ]);
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
            // Windows USB/IP attach is slow due to driver loading, needs longer timeout
            $attachTimeout = $isWindows ? 60 : 30;
            
            $result = $this->executeUsbipCommand(
                proxmoxClient: $proxmoxClient,
                nodeName: $proxmoxNode->name,
                vmid: $session->vm_id,
                command: "attach -r {$gatewayIp} -b {$busid}",
                isWindows: $isWindows,
                timeoutSeconds: $attachTimeout
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

                // For any other error (timeout, already attached, generic failure, etc.),
                // verify if the device was actually attached before reporting failure.
                // This handles cases where the command succeeds but reports wrong exit code,
                // or when a fallback attempt fails because the device is already attached.
                Log::warning('usbip attach command reported failure, verifying device state in VM', [
                    'device_id' => $device->id,
                    'session_id' => $session->id,
                    'error' => $errorMsg,
                ]);

                $port = $this->getAttachedPort(
                    proxmoxClient: $proxmoxClient,
                    nodeName: $proxmoxNode->name,
                    vmid: $session->vm_id,
                    busid: $busid,
                    isWindows: $isWindows
                );

                if ($port !== null) {
                    // Device IS actually attached - mark success despite command reporting failure
                    $vmName = "session-{$session->id}";
                    $this->deviceRepository->markAttached($device, $vmName, $session->id, $session->ip_address, $port);
                    Log::info('USB device verified attached after command failure (port found)', [
                        'device_id' => $device->id,
                        'session_id' => $session->id,
                        'port' => $port,
                        'original_error' => $errorMsg,
                    ]);
                    return;
                }

                // Device not found in VM - genuine failure
                $device->status = UsbDeviceStatus::BOUND;
                $device->attached_session_id = null;
                $device->save();
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

            // If we have enough context, verify if the device was actually attached
            // despite the exception (e.g., timeout during response, but command succeeded)
            if (isset($proxmoxClient, $proxmoxNode, $busid, $isWindows)) {
                try {
                    $port = $this->getAttachedPort(
                        proxmoxClient: $proxmoxClient,
                        nodeName: $proxmoxNode->name,
                        vmid: $session->vm_id,
                        busid: $busid,
                        isWindows: $isWindows
                    );

                    if ($port !== null) {
                        // Device IS attached - mark success despite exception
                        $vmName = "session-{$session->id}";
                        $this->deviceRepository->markAttached($device, $vmName, $session->id, $session->ip_address, $port);
                        Log::info('USB device verified attached after ProxmoxApiException (port found)', [
                            'device_id' => $device->id,
                            'session_id' => $session->id,
                            'port' => $port,
                            'original_error' => $e->getMessage(),
                        ]);
                        return;
                    }
                } catch (\Throwable $verifyException) {
                    Log::warning('Failed to verify device attachment state after exception', [
                        'device_id' => $device->id,
                        'verify_error' => $verifyException->getMessage(),
                    ]);
                }
            }

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
     * Attach a USB device to a VM directly via USB/IP using Proxmox guest agent.
     *
     * This is for admin-initiated permanent VM attachments (not session-based).
     * It requires vmid, Proxmox node name, and server_id to execute usbip inside the VM.
     * 
     * If the VM is not running, the device will be marked as pending attachment
     * and auto-attached when the VM starts.
     *
     * @param UsbDevice      $device    The USB device to attach
     * @param int            $vmid      The Proxmox VM ID
     * @param string         $nodeName  The Proxmox node name
     * @param ProxmoxServer  $server    The Proxmox server
     * @param string         $vmIp      The VM's IP address
     * @param string         $vmName    Optional display name for the VM
     * @param bool           $allowPending  If true, save as pending when VM not running (default: true)
     *
     * @throws GatewayApiException If the attach operation fails
     * 
     * @return array{pending: bool, message: string}
     */
    public function attachToVmDirect(
        UsbDevice $device,
        int $vmid,
        string $nodeName,
        ProxmoxServer $server,
        string $vmIp,
        string $vmName = 'direct-attach',
        bool $allowPending = true
    ): array {
        $node = $device->gatewayNode;

        if (!$node) {
            throw new GatewayApiException(
                'Device has no associated gateway node',
                operation: 'attach'
            );
        }

        // Ensure device is bound for sharing, or pending attach
        if (!$device->isBound() && !$device->isAvailable() && !$device->isPendingAttach()) {
            throw new GatewayApiException(
                'Device must be bound before attaching',
                operation: 'attach'
            );
        }

        // Get the Proxmox client for this server
        $proxmoxClient = $this->proxmoxClientFactory->make($server);

        // Check if VM is running
        try {
            $vmStatus = $proxmoxClient->getVMStatus($nodeName, $vmid);
            $isRunning = ($vmStatus['status'] ?? 'stopped') === 'running';
        } catch (ProxmoxApiException $e) {
            Log::warning('Failed to get VM status, assuming stopped', [
                'vmid' => $vmid,
                'node' => $nodeName,
                'error' => $e->getMessage(),
            ]);
            $isRunning = false;
        }

        // If VM is not running, save as pending attachment
        if (!$isRunning) {
            if (!$allowPending) {
                throw new GatewayApiException(
                    'VM is not running and pending attachment not allowed',
                    operation: 'attach'
                );
            }

            $this->deviceRepository->markPendingAttach(
                device: $device,
                vmid: $vmid,
                nodeName: $nodeName,
                serverId: $server->id,
                vmIp: $vmIp,
                vmName: $vmName,
            );

            Log::info('USB device marked as pending attachment (VM not running)', [
                'device_id' => $device->id,
                'busid' => $device->busid,
                'vmid' => $vmid,
                'node' => $nodeName,
                'vm_name' => $vmName,
            ]);

            return [
                'pending' => true,
                'message' => "VM is not running. Device will be attached automatically when the VM starts.",
            ];
        }

        // Pre-flight check: verify gateway and device state, auto-fix if possible
        $verification = $this->verifyDeviceState($device, requireExportable: true);
        if (!$verification['ok']) {
            throw new GatewayApiException(
                $verification['error'] ?? 'Device verification failed',
                gatewayHost: $node->ip,
                operation: 'attach'
            );
        }

        if (!empty($verification['auto_fixed'])) {
            Log::info('Device was auto-fixed during direct attach pre-flight', [
                'device_id' => $device->id,
                'busid' => $device->busid,
            ]);
        }

        $gatewayIp = $node->ip;
        $busid = $device->busid;

        try {
            // Query the guest agent for the actual OS type
            $osType = $proxmoxClient->getGuestOsType($nodeName, $vmid);
            $isWindows = ($osType === 'windows');

            // Execute the attach command inside the VM via guest agent
            Log::info('Executing usbip attach inside VM via guest agent (direct)', [
                'device_id' => $device->id,
                'busid' => $busid,
                'gateway_ip' => $gatewayIp,
                'vmid' => $vmid,
                'node' => $nodeName,
                'server_id' => $server->id,
                'os_type' => $osType,
            ]);

            // Windows USB/IP attach is slow due to driver loading, needs longer timeout
            $attachTimeout = $isWindows ? 60 : 30;

            $result = $this->executeUsbipCommand(
                proxmoxClient: $proxmoxClient,
                nodeName: $nodeName,
                vmid: $vmid,
                command: "attach -r {$gatewayIp} -b {$busid}",
                isWindows: $isWindows,
                timeoutSeconds: $attachTimeout
            );

            if (!$result['success']) {
                $errorMsg = $result['err-data'] ?? $result['out-data'] ?? 'Unknown error';

                // Verify if the device was actually attached despite reported failure
                $port = $this->getAttachedPort(
                    proxmoxClient: $proxmoxClient,
                    nodeName: $nodeName,
                    vmid: $vmid,
                    busid: $busid,
                    isWindows: $isWindows
                );

                if ($port !== null) {
                    // Device IS attached - mark success
                    $this->deviceRepository->markAttached($device, $vmName, null, $vmIp, $port);
                    // Clear any pending attachment data
                    $device->clearPendingAttachment();
                    Log::info('USB device verified attached after command failure (direct)', [
                        'device_id' => $device->id,
                        'vmid' => $vmid,
                        'port' => $port,
                        'original_error' => $errorMsg,
                    ]);
                    return [
                        'pending' => false,
                        'message' => 'Device attached successfully.',
                    ];
                }

                // Device not found in VM - genuine failure
                $device->status = UsbDeviceStatus::BOUND;
                $device->save();
                throw new GatewayApiException(
                    "usbip attach failed: {$errorMsg}",
                    gatewayHost: $gatewayIp,
                    operation: 'attach'
                );
            }

            // Get the port number from usbip port command
            $port = $this->getAttachedPort(
                proxmoxClient: $proxmoxClient,
                nodeName: $nodeName,
                vmid: $vmid,
                busid: $busid,
                isWindows: $isWindows
            );

            $this->deviceRepository->markAttached($device, $vmName, null, $vmIp, $port);
            // Clear any pending attachment data
            $device->clearPendingAttachment();

            Log::info('USB device attached to VM via guest agent (direct)', [
                'device_id' => $device->id,
                'busid' => $busid,
                'vmid' => $vmid,
                'port' => $port,
            ]);

            return [
                'pending' => false,
                'message' => 'Device attached successfully.',
            ];
        } catch (ProxmoxApiException $e) {
            Log::error('Proxmox guest agent attach failed (direct)', [
                'device_id' => $device->id,
                'vmid' => $vmid,
                'error' => $e->getMessage(),
            ]);

            // Verify if device was attached despite exception
            if (isset($proxmoxClient, $isWindows)) {
                try {
                    $port = $this->getAttachedPort(
                        proxmoxClient: $proxmoxClient,
                        nodeName: $nodeName,
                        vmid: $vmid,
                        busid: $busid,
                        isWindows: $isWindows
                    );

                    if ($port !== null) {
                        $this->deviceRepository->markAttached($device, $vmName, null, $vmIp, $port);
                        // Clear any pending attachment data
                        $device->clearPendingAttachment();
                        Log::info('USB device verified attached after ProxmoxApiException (direct)', [
                            'device_id' => $device->id,
                            'vmid' => $vmid,
                            'port' => $port,
                            'original_error' => $e->getMessage(),
                        ]);
                        return [
                            'pending' => false,
                            'message' => 'Device attached successfully.',
                        ];
                    }
                } catch (\Throwable $verifyException) {
                    Log::warning('Failed to verify device attachment state after exception (direct)', [
                        'device_id' => $device->id,
                        'verify_error' => $verifyException->getMessage(),
                    ]);
                }
            }

            throw new GatewayApiException(
                "Failed to attach device via guest agent: {$e->getMessage()}",
                gatewayHost: $gatewayIp,
                operation: 'attach',
                previous: $e
            );
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
                    $this->extractErrorMessage($response, 'detail', 'Attach operation failed'),
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

            // Verify if device was actually detached despite exception
            // (e.g., timeout during response but command succeeded)
            try {
                $verifyPort = $this->getAttachedPort(
                    proxmoxClient: $proxmoxClient,
                    nodeName: $proxmoxNode->name,
                    vmid: $session->vm_id,
                    busid: $device->busid,
                    isWindows: $isWindows
                );

                if ($verifyPort === null) {
                    // Device IS detached - mark success despite exception
                    $this->deviceRepository->markDetached($device);
                    Log::info('USB device verified detached after ProxmoxApiException', [
                        'device_id' => $device->id,
                        'session_id' => $session->id,
                        'original_error' => $e->getMessage(),
                    ]);
                    return;
                }
            } catch (\Throwable $verifyException) {
                Log::warning('Failed to verify device detachment state after exception', [
                    'device_id' => $device->id,
                    'verify_error' => $verifyException->getMessage(),
                ]);
            }

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
                    $this->extractErrorMessage($response, 'detail', 'Detach operation failed'),
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

    /**
     * Process pending USB attachments for a specific VM.
     *
     * This should be called when a VM starts to attach any devices
     * that were waiting for it.
     *
     * @param int $vmid The Proxmox VM ID
     * @param ProxmoxServer $server The Proxmox server
     * @return array{attached: int, failed: int, errors: array<string>}
     */
    public function processPendingAttachmentsForVm(int $vmid, ProxmoxServer $server): array
    {
        $pendingDevices = $this->deviceRepository->findPendingForVm($vmid, $server->id);
        
        $result = [
            'attached' => 0,
            'failed' => 0,
            'errors' => [],
        ];

        if ($pendingDevices->isEmpty()) {
            return $result;
        }

        Log::info("Processing {$pendingDevices->count()} pending USB attachments for VM", [
            'vmid' => $vmid,
            'server_id' => $server->id,
        ]);

        foreach ($pendingDevices as $device) {
            try {
                $attachResult = $this->attachToVmDirect(
                    device: $device,
                    vmid: $vmid,
                    nodeName: $device->pending_node,
                    server: $server,
                    vmIp: $device->pending_vm_ip ?? '0.0.0.0',
                    vmName: $device->pending_vm_name ?? 'pending-attach',
                    allowPending: false
                );

                if ($attachResult['pending']) {
                    $result['failed']++;
                    $result['errors'][] = "Device {$device->id}: Still pending - {$attachResult['message']}";
                } else {
                    $result['attached']++;
                }
            } catch (GatewayApiException $e) {
                $result['failed']++;
                $result['errors'][] = "Device {$device->id}: {$e->getMessage()}";
                Log::error('Failed to attach pending device to VM', [
                    'device_id' => $device->id,
                    'vmid' => $vmid,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Log::info('Finished processing pending USB attachments for VM', [
            'vmid' => $vmid,
            'attached' => $result['attached'],
            'failed' => $result['failed'],
        ]);

        return $result;
    }

    /**
     * Cancel a pending attachment and return device to bound state.
     */
    public function cancelPendingAttachment(UsbDevice $device): bool
    {
        if (!$device->isPendingAttach()) {
            return false;
        }

        $this->deviceRepository->clearPendingAttach($device);

        Log::info('Pending USB attachment cancelled', [
            'device_id' => $device->id,
            'busid' => $device->busid,
            'previous_pending_vmid' => $device->pending_vmid,
        ]);

        return true;
    }
}
