<?php

namespace App\Services;

use App\Exceptions\ProxmoxApiException;
use App\Models\ProxmoxServer;
use Illuminate\Support\Facades\Log;

/**
 * Resolves a VM's dynamically assigned (DHCP) IP address from Proxmox.
 *
 * VMs are cloned from templates and start in a stopped state.
 * When the VM boots it receives a DHCP address that is unknown until Proxmox
 * reports it via the guest agent network interface endpoint.
 *
 * Flow:
 *   1. Start the VM (if not already running — checked by caller or via getVMStatus).
 *   2. Poll Proxmox every 2 seconds until:
 *      - VM status == 'running' AND
 *      - guest agent reports a non-link-local IPv4 address.
 *   3. Return the resolved IP or throw ProxmoxApiException on timeout.
 */
class ProxmoxIPResolver
{
    private const POLL_INTERVAL_SECONDS = 2;

    public function __construct(
        private readonly ProxmoxClientInterface $proxmoxClient,
    ) {}

    /**
     * Poll Proxmox until the VM is running and has a DHCP-assigned IPv4 address.
     *
     * @param  ProxmoxServer|null  $server  The server the VM belongs to (used for logging; may be null in tests)
     * @param  string  $nodeId  The Proxmox node name (e.g. "pve-1")
     * @param  int     $vmId    The VMID of the running VM
     * @param  int     $maxWaitSeconds  Maximum seconds to wait before giving up (default 300)
     *
     * @throws ProxmoxApiException  When the VM does not obtain an IP within the allotted time
     */
    public function resolveVMIP(
        ?ProxmoxServer $server,
        string $nodeId,
        int $vmId,
        int $maxWaitSeconds = 300,
    ): string {
        $deadline = now()->addSeconds($maxWaitSeconds);

        Log::info('ProxmoxIPResolver: starting IP resolution', [
            'node_id' => $nodeId,
            'vm_id'   => $vmId,
            'timeout' => $maxWaitSeconds,
        ]);

        while (now()->isBefore($deadline)) {
            try {
                // Check that the VM is actually running first
                $vmStatus = $this->proxmoxClient->getVMStatus($nodeId, $vmId);
                $currentStatus = $vmStatus['status'] ?? 'stopped';

                if ($currentStatus !== 'running') {
                    Log::debug('ProxmoxIPResolver: VM not yet running, waiting', [
                        'status' => $currentStatus,
                        'vm_id'  => $vmId,
                    ]);
                    sleep(self::POLL_INTERVAL_SECONDS);
                    continue;
                }

                // VM is running — try to get IP from guest agent network interfaces
                $ip = $this->proxmoxClient->getVMNetworkIP($nodeId, $vmId);

                if ($ip !== null) {
                    Log::info('ProxmoxIPResolver: IP resolved', [
                        'node_id' => $nodeId,
                        'vm_id'   => $vmId,
                        'ip'      => $ip,
                    ]);

                    return $ip;
                }

                Log::debug('ProxmoxIPResolver: VM running but IP not yet assigned', [
                    'vm_id' => $vmId,
                ]);
            } catch (ProxmoxApiException $e) {
                // Guest agent not yet ready — keep polling
                Log::debug('ProxmoxIPResolver: transient error polling network', [
                    'vm_id' => $vmId,
                    'error' => $e->getMessage(),
                ]);
            }

            sleep(self::POLL_INTERVAL_SECONDS);
        }

        throw new ProxmoxApiException(
            "VM {$vmId} on node {$nodeId} did not obtain an IP address within {$maxWaitSeconds} seconds"
        );
    }
}
