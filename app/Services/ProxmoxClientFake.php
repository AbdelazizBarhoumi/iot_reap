<?php

namespace App\Services;

use App\Models\ProxmoxServer;

/**
 * Fake ProxmoxClient for testing.
 * Provides deterministic responses without hitting the real Proxmox API.
 */
class ProxmoxClientFake extends ProxmoxClient
{
    private array $nextVmid = [];
    private array $createdVMs = [];
    private array $nodeStatuses = [];

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

        foreach ($this->nodeStatuses as $nodeName => $status) {
            $this->nextVmid[$nodeName] = 200;
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
     */
    public function cloneTemplate(int $templateVmid, string $nodeName, ?int $newVmid = null): int
    {
        $newVmid = $newVmid ?? $this->nextVmid[$nodeName] ?? 200;

        $this->createdVMs[$nodeName][] = [
            'vmid' => $newVmid,
            'status' => 'stopped',
            'template' => $templateVmid,
        ];

        $this->nextVmid[$nodeName] = $newVmid + 1;

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
}
