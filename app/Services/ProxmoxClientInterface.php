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

    /**
     * Get the dynamically assigned IPv4 address of a running VM via the guest agent.
     * Returns null when the guest agent is not ready or DHCP has not yet assigned an IP.
     *
     * @throws ProxmoxApiException
     */
    public function getVMNetworkIP(string $nodeName, int $vmid): ?string;

    /**
     * List all snapshots of a VM.
     *
     * @return array<int, array{name: string, description: string, snaptime?: int, parent?: string}>
     *
     * @throws ProxmoxApiException
     */
    public function listSnapshots(string $nodeName, int $vmid): array;

    /**
     * Revert a VM to a named snapshot.
     *
     * @throws ProxmoxApiException
     */
    public function revertSnapshot(string $nodeName, int $vmid, string $snapshotName): bool;

    /**
     * List VMs on a node without per-VM status enrichment (lightweight).
     * Returns basic data from /nodes/{node}/qemu directly.
     *
     * @return array<int, array<string, mixed>>
     */
    public function listVMsLight(string $nodeName): array;

    /**
     * Get all LXC containers on a node.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getContainers(string $nodeName): array;

    /**
     * Get the IPv4 address of an LXC container.
     * Uses /nodes/{node}/lxc/{vmid}/interfaces endpoint.
     *
     * @return string|null The IP address or null if not available
     */
    public function getContainerNetworkIP(string $nodeName, int $vmid): ?string;

    /**
     * Get container configuration.
     *
     * @return array<string, mixed>
     */
    public function getContainerConfig(string $nodeName, int $vmid): array;

    /**
     * Execute a command inside a VM via the QEMU guest agent.
     *
     * The guest agent (qemu-guest-agent) must be installed and running in the VM.
     * Returns the PID of the executed command; use getExecStatus() to poll for results.
     *
     * @param  string  $nodeName  The node name where the VM is running
     * @param  int  $vmid  The VM ID
     * @param  string  $command  The command to execute
     * @param  int  $timeout  Optional timeout for the command in seconds
     * @return array{pid: int} Returns the process ID of the executed command
     *
     * @throws ProxmoxApiException
     */
    public function execInVm(string $nodeName, int $vmid, string $command, int $timeout = 60): array;

    /**
     * Get the result of a command executed via guest agent.
     *
     * @param  string  $nodeName  The node name where the VM is running
     * @param  int  $vmid  The VM ID
     * @param  int  $pid  The process ID returned by execInVm()
     * @return array{exited: bool, exitcode?: int, out-data?: string, err-data?: string}
     *
     * @throws ProxmoxApiException
     */
    public function getExecStatus(string $nodeName, int $vmid, int $pid): array;

    /**
     * Execute a command inside a VM and wait for completion.
     *
     * Combines execInVm() and getExecStatus() with polling.
     *
     * @param  string  $nodeName  The node name where the VM is running
     * @param  int  $vmid  The VM ID
     * @param  string  $command  The command to execute
     * @param  int  $timeoutSeconds  Maximum time to wait for command completion
     * @return array{exitcode: int, out-data?: string, err-data?: string, success: bool}
     *
     * @throws ProxmoxApiException
     */
    public function execInVmAndWait(string $nodeName, int $vmid, string $command, int $timeoutSeconds = 60): array;

    /**
     * Write a file inside a VM via the QEMU guest agent.
     *
     * Creates or overwrites a file with the specified content. Useful for creating
     * batch/script files that can then be executed via execInVm().
     *
     * @param  string  $nodeName  The node name where the VM is running
     * @param  int  $vmid  The VM ID
     * @param  string  $filePath  The file path inside the VM
     * @param  string  $content  The content to write to the file
     *
     * @throws ProxmoxApiException
     */
    public function writeFileInVm(string $nodeName, int $vmid, string $filePath, string $content): void;

    /**
     * Get the guest OS type from the QEMU guest agent.
     *
     * Queries the guest agent for OS information and returns a simplified type.
     * Returns 'windows', 'linux', or 'unknown'.
     *
     * @param  string  $nodeName  The node name where the VM is running
     * @param  int  $vmid  The VM ID
     * @return string 'windows' | 'linux' | 'unknown'
     *
     * @throws ProxmoxApiException
     */
    public function getGuestOsType(string $nodeName, int $vmid): string;
}
