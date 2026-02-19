<?php

namespace App\Services;

/**
 * Interface for Proxmox API clients.
 * Enables mocking/faking in tests without hitting real Proxmox API.
 */
interface ProxmoxClientInterface
{
    /**
     * Get all nodes in the cluster.
     *
     * @return array<string, mixed>
     */
    public function getNodes(): array;

    /**
     * Get the status of a specific node.
     *
     * @return array<string, mixed>
     */
    public function getNodeStatus(string $nodeName): array;

    /**
     * Clone a template to create a new VM.
     *
     * @return int The new VM ID
     */
    public function cloneTemplate(int $templateVmid, string $nodeName, ?int $newVmid = null): int;

    /**
     * Start a VM.
     */
    public function startVM(string $nodeName, int $vmid): bool;

    /**
     * Stop a VM.
     */
    public function stopVM(string $nodeName, int $vmid): bool;

    /**
     * Delete a VM.
     */
    public function deleteVM(string $nodeName, int $vmid): bool;

    /**
     * Get VM status.
     *
     * @return array<string, mixed>
     */
    public function getVMStatus(string $nodeName, int $vmid): array;

    /**
     * Get all VMs on a node (running + stopped).
     *
     * @return array<int, array<string, mixed>>
     */
    public function getVMs(string $nodeName): array;

    /**
     * Reboot a VM.
     */
    public function rebootVM(string $nodeName, int $vmid): bool;

    /**
     * Shutdown a VM gracefully.
     */
    public function shutdownVM(string $nodeName, int $vmid): bool;
}
