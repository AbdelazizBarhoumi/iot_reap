<?php

namespace App\Services;

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
            if (!isset(self::$globalNextVmid[$nodeName])) {
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
                fn($vm) => $vm['vmid'] !== $vmid
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
                    return $vm['ip_address'] ?? '192.168.1.' . ($vmid % 254 ?: 10);
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
            'vmid'       => $vmid,
            'status'     => $status,
            'ip_address' => $ip,
        ];

        return $this;
    }
}
