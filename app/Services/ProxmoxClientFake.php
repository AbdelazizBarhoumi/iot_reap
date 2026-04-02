<?php

namespace App\Services;

use App\Exceptions\ProxmoxApiException;
use App\Models\ProxmoxServer;

/**
 * Fake ProxmoxClient for testing.
 * Provides deterministic responses without hitting the real Proxmox API.
 */
class ProxmoxClientFake extends ProxmoxClient
{
    // Use a global static counter to track VMIDs across all instances
    // This ensures uniqueness even in concurrent scenarios
    private static array $globalNextVmid = [];

    private static object $lock;

    private array $createdVMs = [];

    private array $nodeStatuses = [];

    /**
     * Optional override of the next VMID for a given node.
     * Tests can set this so cloneTemplate returns a predictable ID.
     *
     * @var array<string,int>
     */
    private array $nextVmid = [];

    /**
     * Create a new fake ProxmoxClient instance.
     */
    public function __construct(?ProxmoxServer $server = null)
    {
        // If no server supplied (container binding / tests), create an in-memory dummy server
        $server = $server ?? ProxmoxServer::factory()->make();

        parent::__construct($server);
        $this->initializeDefaults();
    }

    /**
     * Initialize default fake data.
     */
    private function initializeDefaults(): void
    {
        // Default nodes
        $this->nodeStatuses = [
            'pve-1' => [
                'status' => 'online',
                'uptime' => 86400,
                'cpus' => 16,
                'maxcpu' => 16,
                'cpu' => 0.25,
                'maxmem' => 68719476736,
                'mem' => 17179869184,
            ],
            'pve-2' => [
                'status' => 'online',
                'uptime' => 86400,
                'cpus' => 16,
                'maxcpu' => 16,
                'cpu' => 0.15,
                'maxmem' => 68719476736,
                'mem' => 8589934592,
            ],
        ];

        // Initialize global counter for each node (only once)
        foreach ($this->nodeStatuses as $nodeName => $status) {
            if (! isset(self::$globalNextVmid[$nodeName])) {
                self::$globalNextVmid[$nodeName] = 200;
            }
        }
    }

    /**
     * Get all nodes in the cluster.
     *
     * @return array<string, mixed>
     */
    public function getNodes(): array
    {
        return array_keys($this->nodeStatuses);
    }

    /**
     * Get the status of a specific node.
     *
     * @return array<string, mixed>
     */
    public function getNodeStatus(string $nodeName): array
    {
        return $this->nodeStatuses[$nodeName] ?? [];
    }

    /**
     * Clone a template to create a new VM.
     * Uses a global counter to ensure VMID uniqueness even in concurrent scenarios.
     */
    public function cloneTemplate(int $templateVmid, string $nodeName, ?int $newVmid = null): int
    {
        if ($newVmid === null) {
            // honor any value previously set by tests
            if (isset($this->nextVmid[$nodeName])) {
                $newVmid = $this->nextVmid[$nodeName];
                // once consumed, remove so subsequent clones increment normally
                unset($this->nextVmid[$nodeName]);
            } else {
                // Use atomic increment for concurrency safety
                $newVmid = self::$globalNextVmid[$nodeName] ?? 200;
                self::$globalNextVmid[$nodeName] = $newVmid + 1;
            }
        }

        $this->createdVMs[$nodeName][] = [
            'vmid' => $newVmid,
            'status' => 'stopped',
            'template' => $templateVmid,
        ];

        return $newVmid;
    }

    /**
     * Start a VM.
     */
    public function startVM(string $nodeName, int $vmid): bool
    {
        if (isset($this->createdVMs[$nodeName])) {
            foreach ($this->createdVMs[$nodeName] as &$vm) {
                if ($vm['vmid'] === $vmid) {
                    $vm['status'] = 'running';

                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Stop a VM.
     */
    public function stopVM(string $nodeName, int $vmid): bool
    {
        if (isset($this->createdVMs[$nodeName])) {
            foreach ($this->createdVMs[$nodeName] as &$vm) {
                if ($vm['vmid'] === $vmid) {
                    $vm['status'] = 'stopped';

                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Delete a VM.
     */
    public function deleteVM(string $nodeName, int $vmid): bool
    {
        if (isset($this->createdVMs[$nodeName])) {
            $this->createdVMs[$nodeName] = array_filter(
                $this->createdVMs[$nodeName],
                fn ($vm) => $vm['vmid'] !== $vmid
            );

            return true;
        }

        return false;
    }

    /**
     * Get VM status.
     *
     * @return array<string, mixed>
     */
    public function getVMStatus(string $nodeName, int $vmid): array
    {
        if (isset($this->createdVMs[$nodeName])) {
            foreach ($this->createdVMs[$nodeName] as $vm) {
                if ($vm['vmid'] === $vmid) {
                    return [
                        'status' => $vm['status'],
                        'vmid' => $vmid,
                        'uptime' => $vm['status'] === 'running' ? 3600 : 0,
                        'cpu' => $vm['status'] === 'running' ? 0.05 : 0,
                        'mem' => $vm['status'] === 'running' ? 1073741824 : 0, // 1 GB
                        'maxmem' => 4294967296, // 4 GB
                    ];
                }
            }
        }

        return ['status' => 'stopped', 'vmid' => $vmid, 'uptime' => 0];
    }

    /**
     * Get all VMs on a node (running + stopped).
     *
     * @return array<int, array<string, mixed>>
     */
    public function getVMs(string $nodeName): array
    {
        $vms = $this->createdVMs[$nodeName] ?? [];

        return array_map(function ($vm) {
            return [
                'vmid' => $vm['vmid'],
                'name' => $vm['name'] ?? "vm-{$vm['vmid']}",
                'status' => $vm['status'],
                'cpu_usage' => $vm['status'] === 'running' ? 5.0 : 0,
                'mem_usage' => $vm['status'] === 'running' ? 1073741824 : 0,
                'maxmem' => 4294967296,
                'uptime' => $vm['status'] === 'running' ? 3600 : 0,
                'template' => $vm['template'] ?? 0,
            ];
        }, $vms);
    }

    /**
     * List VMs on a node without per-VM status enrichment (lightweight).
     *
     * @return array<int, array<string, mixed>>
     */
    public function listVMsLight(string $nodeName): array
    {
        return $this->getVMs($nodeName);
    }

    /**
     * Reboot a VM.
     */
    public function rebootVM(string $nodeName, int $vmid): bool
    {
        // For fake, reboot is a no-op - VM stays running
        return true;
    }

    /**
     * Shutdown a VM gracefully.
     */
    public function shutdownVM(string $nodeName, int $vmid): bool
    {
        return $this->stopVM($nodeName, $vmid);
    }

    /**
     * Get the DHCP-assigned IPv4 address for a running VM.
     * Returns the fake IP when the VM is in 'running' state, null otherwise.
     */
    public function getVMNetworkIP(string $nodeName, int $vmid): ?string
    {
        if (isset($this->createdVMs[$nodeName])) {
            foreach ($this->createdVMs[$nodeName] as $vm) {
                if ($vm['vmid'] === $vmid && $vm['status'] === 'running') {
                    // Return a deterministic fake IP based on VMID for testability
                    return $vm['ip_address'] ?? '192.168.1.'.($vmid % 254 ?: 10);
                }
            }
        }

        // VM not running or not found — guest agent not ready yet
        return null;
    }

    /**
     * Set the status of a node for testing.
     */
    public function setNodeStatus(string $nodeName, array $status): self
    {
        $this->nodeStatuses[$nodeName] = $status;

        return $this;
    }

    /**
     * Set the next VMID to use for a node.
     */
    public function setNextVmid(string $nodeName, int $vmid): self
    {
        $this->nextVmid[$nodeName] = $vmid;

        return $this;
    }

    /**
     * Get all created VMs for testing assertions.
     *
     * @return array<string, array>
     */
    public function getCreatedVMs(): array
    {
        return $this->createdVMs;
    }

    /**
     * Reset all fake data.
     */
    public function reset(): void
    {
        $this->createdVMs = [];
        $this->initializeDefaults();
    }

    /**
     * Set a specific IP address for a VM (used in tests to control IP resolution).
     */
    public function setVMIPAddress(string $nodeName, int $vmid, string $ip): self
    {
        if (isset($this->createdVMs[$nodeName])) {
            foreach ($this->createdVMs[$nodeName] as &$vm) {
                if ($vm['vmid'] === $vmid) {
                    $vm['ip_address'] = $ip;

                    return $this;
                }
            }
        }

        return $this;
    }

    /**
     * Register a VM (as if it were already cloned) with a given status and optional IP.
     * Useful in tests that need a VM to exist without going through cloneTemplate().
     */
    public function registerVM(string $nodeName, int $vmid, string $status = 'stopped', ?string $ip = null): self
    {
        if (! isset($this->createdVMs[$nodeName])) {
            $this->createdVMs[$nodeName] = [];
        }

        // Update existing entry if present
        foreach ($this->createdVMs[$nodeName] as &$vm) {
            if ($vm['vmid'] === $vmid) {
                $vm['status'] = $status;
                if ($ip !== null) {
                    $vm['ip_address'] = $ip;
                }

                return $this;
            }
        }

        // Add new entry
        $this->createdVMs[$nodeName][] = [
            'vmid' => $vmid,
            'status' => $status,
            'ip_address' => $ip,
        ];

        return $this;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LXC Container Methods (for gateway discovery)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Fake LXC containers registered for testing.
     *
     * @var array<string, array<array{vmid: int, name: string, status: string, ip_address: ?string}>>
     */
    private array $containers = [];

    /**
     * Get all LXC containers on a node.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getContainers(string $nodeName): array
    {
        $containers = $this->containers[$nodeName] ?? [];

        return array_map(function ($ct) {
            return [
                'vmid' => $ct['vmid'],
                'name' => $ct['name'],
                'status' => $ct['status'],
            ];
        }, $containers);
    }

    /**
     * Get the IPv4 address for a running LXC container.
     */
    public function getContainerNetworkIP(string $nodeName, int $vmid): ?string
    {
        if (isset($this->containers[$nodeName])) {
            foreach ($this->containers[$nodeName] as $ct) {
                if ($ct['vmid'] === $vmid && $ct['status'] === 'running') {
                    return $ct['ip_address'] ?? null;
                }
            }
        }

        return null;
    }

    /**
     * Get the configuration of an LXC container.
     *
     * @return array<string, mixed>
     */
    public function getContainerConfig(string $nodeName, int $vmid): array
    {
        if (isset($this->containers[$nodeName])) {
            foreach ($this->containers[$nodeName] as $ct) {
                if ($ct['vmid'] === $vmid) {
                    return [
                        'hostname' => $ct['name'],
                        'memory' => 512,
                        'cores' => 1,
                        'net0' => 'name=eth0,bridge=vmbr0,ip=dhcp',
                    ];
                }
            }
        }

        return [];
    }

    /**
     * Register a fake LXC container for testing.
     */
    public function registerContainer(
        string $nodeName,
        int $vmid,
        string $name,
        string $status = 'running',
        ?string $ip = null
    ): self {
        if (! isset($this->containers[$nodeName])) {
            $this->containers[$nodeName] = [];
        }

        // Update existing entry if present
        foreach ($this->containers[$nodeName] as &$ct) {
            if ($ct['vmid'] === $vmid) {
                $ct['name'] = $name;
                $ct['status'] = $status;
                $ct['ip_address'] = $ip;

                return $this;
            }
        }

        // Add new entry
        $this->containers[$nodeName][] = [
            'vmid' => $vmid,
            'name' => $name,
            'status' => $status,
            'ip_address' => $ip,
        ];

        return $this;
    }

    /**
     * Get all registered containers for testing assertions.
     *
     * @return array<string, array>
     */
    public function getRegisteredContainers(): array
    {
        return $this->containers;
    }

    // ─── Guest Agent Exec Methods (Fake Implementation) ──────────────────────

    /**
     * Track exec commands for testing assertions.
     *
     * @var array<int, array{node: string, vmid: int, command: string, result: array}>
     */
    private array $execHistory = [];

    /**
     * PID counter for fake exec operations.
     */
    private int $nextFakePid = 1000;

    /**
     * Predefined fake results for specific commands (for testing).
     * Key is a command substring to match, value is the result array.
     *
     * @var array<string, array{exitcode: int, out-data: string, err-data: string}>
     */
    private array $execResultOverrides = [];

    /**
     * Commands that should throw ProxmoxApiException (for testing).
     * Key is a command substring to match, value is the exception message.
     *
     * @var array<string, string>
     */
    private array $execExceptionOverrides = [];

    /**
     * Execute a command inside a VM via the QEMU guest agent (fake).
     *
     * @return array{pid: int}
     */
    public function execInVm(string $nodeName, int $vmid, string $command, int $timeout = 60): array
    {
        $pid = $this->nextFakePid++;

        $this->execHistory[$pid] = [
            'node' => $nodeName,
            'vmid' => $vmid,
            'command' => $command,
            'timeout' => $timeout,
            'result' => $this->determineExecResult($command),
        ];

        return ['pid' => $pid];
    }

    /**
     * Get the result of a command executed via guest agent (fake).
     *
     * @return array{exited: bool, exitcode?: int, out-data?: string, err-data?: string}
     */
    public function getExecStatus(string $nodeName, int $vmid, int $pid): array
    {
        if (! isset($this->execHistory[$pid])) {
            return ['exited' => true, 'exitcode' => 127, 'err-data' => 'Process not found'];
        }

        $result = $this->execHistory[$pid]['result'];

        return [
            'exited' => true,
            'exitcode' => $result['exitcode'],
            'out-data' => $result['out-data'],
            'err-data' => $result['err-data'],
        ];
    }

    /**
     * Execute a command inside a VM and wait for completion (fake).
     *
     * @return array{exitcode: int, out-data?: string, err-data?: string, success: bool}
     */
    public function execInVmAndWait(string $nodeName, int $vmid, string $command, int $timeoutSeconds = 60): array
    {
        // Check if this command should throw an exception
        foreach ($this->execExceptionOverrides as $pattern => $message) {
            if (str_contains($command, $pattern)) {
                throw new ProxmoxApiException($message);
            }
        }

        $execResult = $this->execInVm($nodeName, $vmid, $command, $timeoutSeconds);
        $pid = $execResult['pid'];

        $result = $this->execHistory[$pid]['result'];

        return [
            'exitcode' => $result['exitcode'],
            'out-data' => $result['out-data'],
            'err-data' => $result['err-data'],
            'success' => $result['exitcode'] === 0,
        ];
    }

    /**
     * Fake implementation: Track file writes for testing.
     * Stores all writes in sequence to allow asserting on all content written.
     *
     * @var array<int, array{key: string, content: string}> Sequential history of file writes
     */
    private array $writtenFilesHistory = [];

    /**
     * Map of file keys to their latest content (for getWrittenFile).
     *
     * @var array<string, string> Keyed by "nodeName:vmid:filePath"
     */
    private array $writtenFiles = [];

    /**
     * Write a file inside a VM via the QEMU guest agent (fake implementation).
     *
     * Stores the file content in memory for testing verification.
     *
     * @param  string  $nodeName  The node name where the VM is running
     * @param  int  $vmid  The VM ID
     * @param  string  $filePath  The file path inside the VM
     * @param  string  $content  The content to write to the file
     */
    public function writeFileInVm(string $nodeName, int $vmid, string $filePath, string $content): void
    {
        $key = "{$nodeName}:{$vmid}:{$filePath}";
        $this->writtenFiles[$key] = $content;
        $this->writtenFilesHistory[] = ['key' => $key, 'content' => $content];
    }

    /**
     * Get a file that was written via writeFileInVm (testing helper).
     *
     * @return string|null The file content or null if not written
     */
    public function getWrittenFile(string $nodeName, int $vmid, string $filePath): ?string
    {
        $key = "{$nodeName}:{$vmid}:{$filePath}";

        return $this->writtenFiles[$key] ?? null;
    }

    /**
     * Fake OS type overrides for testing.
     * Key is "nodeName:vmid", value is 'windows' | 'linux' | 'unknown'
     *
     * @var array<string, string>
     */
    private array $osTypeOverrides = [];

    /**
     * Default OS type for VMs that don't have an override.
     */
    private string $defaultOsType = 'linux';

    /**
     * Set the OS type for a specific VM (testing helper).
     */
    public function setGuestOsType(string $nodeName, int $vmid, string $osType): self
    {
        $this->osTypeOverrides["{$nodeName}:{$vmid}"] = $osType;

        return $this;
    }

    /**
     * Set the default OS type for all VMs (testing helper).
     */
    public function setDefaultOsType(string $osType): self
    {
        $this->defaultOsType = $osType;

        return $this;
    }

    /**
     * Get the guest OS type from the QEMU guest agent (fake implementation).
     *
     * Returns overridden value if set, otherwise returns the default.
     *
     * @return string 'windows' | 'linux' | 'unknown'
     */
    public function getGuestOsType(string $nodeName, int $vmid): string
    {
        $key = "{$nodeName}:{$vmid}";

        return $this->osTypeOverrides[$key] ?? $this->defaultOsType;
    }

    /**
     * Determine the fake result for a command.
     * Checks for overrides first, then returns success for known commands.
     *
     * @return array{exitcode: int, out-data: string, err-data: string}
     */
    private function determineExecResult(string $command): array
    {
        // Check for explicit overrides
        foreach ($this->execResultOverrides as $pattern => $result) {
            if (str_contains($command, $pattern)) {
                return $result;
            }
        }

        // Default: simulate success for usbip commands
        if (str_contains($command, 'usbip attach')) {
            return [
                'exitcode' => 0,
                'out-data' => '',
                'err-data' => '',
            ];
        }

        if (str_contains($command, 'usbip detach')) {
            return [
                'exitcode' => 0,
                'out-data' => '',
                'err-data' => '',
            ];
        }

        // Windows and Linux usbip port command - simulate a device attached on port 00
        if (str_contains($command, 'usbip port') || str_contains($command, 'usbip.exe port')) {
            return [
                'exitcode' => 0,
                'out-data' => "Port 00: <Device in Use> at High Speed(480Mbps)\n    Test Device (0000:0000)\n    1-1 -> usbip://192.168.50.6:3240/1-1\n        -> remote bus/dev 001/002",
                'err-data' => '',
            ];
        }

        // Windows batch files for usbip commands (written via writeFileInVm)
        // e.g., C:\usbip-cmd.bat
        if (str_contains($command, 'usbip-cmd') && str_contains($command, '.bat')) {
            return [
                'exitcode' => 0,
                'out-data' => '',
                'err-data' => '',
            ];
        }

        // Default: command not found
        return [
            'exitcode' => 127,
            'out-data' => '',
            'err-data' => 'command not found',
        ];
    }

    /**
     * Set a fake result for a specific command pattern (testing helper).
     *
     * @param  string  $commandPattern  Substring to match in the command
     * @param  int  $exitcode  Exit code to return
     * @param  string  $stdout  Standard output
     * @param  string  $stderr  Standard error
     */
    public function setExecResult(string $commandPattern, int $exitcode, string $stdout = '', string $stderr = ''): self
    {
        $this->execResultOverrides[$commandPattern] = [
            'exitcode' => $exitcode,
            'out-data' => $stdout,
            'err-data' => $stderr,
        ];

        return $this;
    }

    /**
     * Configure a command pattern to throw ProxmoxApiException (testing helper).
     *
     * This simulates what happens in production when the Proxmox API returns
     * a 500 error (e.g., "No such file or directory" from guest agent).
     *
     * @param  string  $commandPattern  Substring to match in the command
     * @param  string  $message  Exception message to throw
     */
    public function setExecException(string $commandPattern, string $message): self
    {
        $this->execExceptionOverrides[$commandPattern] = $message;

        return $this;
    }

    /**
     * Get all executed commands for testing assertions.
     *
     * @return array<int, array{node: string, vmid: int, command: string}>
     */
    public function getExecHistory(): array
    {
        return array_map(function ($entry) {
            return [
                'node' => $entry['node'],
                'vmid' => $entry['vmid'],
                'command' => $entry['command'],
            ];
        }, $this->execHistory);
    }

    /**
     * Assert that a command was executed in a VM (testing helper).
     * Also checks batch file contents for Windows VM commands.
     */
    public function assertCommandExecuted(string $expectedCommandSubstring): void
    {
        // Check direct command execution
        foreach ($this->execHistory as $entry) {
            if (str_contains($entry['command'], $expectedCommandSubstring)) {
                return;
            }
        }

        // Check written batch files content history (for Windows VM commands)
        foreach ($this->writtenFilesHistory as $entry) {
            if (str_contains($entry['content'], $expectedCommandSubstring)) {
                return;
            }
        }

        throw new \PHPUnit\Framework\ExpectationFailedException(
            "Expected command containing '{$expectedCommandSubstring}' was not executed. ".
            'Executed commands: '.json_encode(array_column($this->execHistory, 'command')).
            ' Written files: '.json_encode(array_column($this->writtenFilesHistory, 'content'))
        );
    }

    /**
     * Clear the exec history (testing helper).
     */
    public function clearExecHistory(): self
    {
        $this->execHistory = [];
        $this->execResultOverrides = [];
        $this->execExceptionOverrides = [];
        $this->writtenFiles = [];
        $this->writtenFilesHistory = [];

        return $this;
    }
}
