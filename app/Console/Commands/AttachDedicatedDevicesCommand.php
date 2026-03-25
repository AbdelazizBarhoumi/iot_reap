<?php

namespace App\Console\Commands;

use App\Models\ProxmoxServer;
use App\Services\GatewayService;
use App\Services\ProxmoxClientFactory;
use Illuminate\Console\Command;

/**
 * Process dedicated USB device attachments for a VM.
 *
 * This command attaches all USB devices that are dedicated to a specific VM.
 * Unlike pending attachments, dedicated devices persist permanently and
 * will auto-attach every time the VM starts.
 *
 * Usage:
 *   php artisan usb:attach-dedicated --vmid=201 --node=pve01 --server=1
 *
 * Can be triggered:
 * - Manually when troubleshooting
 * - By Proxmox hook scripts when a VM starts
 * - By scheduled job that monitors VM states
 */
class AttachDedicatedDevicesCommand extends Command
{
    protected $signature = 'usb:attach-dedicated 
                            {--vmid= : The Proxmox VM ID}
                            {--node= : The Proxmox node name}
                            {--server= : The Proxmox server ID}
                            {--dry-run : Show what would be done without making changes}';

    protected $description = 'Attach all dedicated USB devices to a VM that just started';

    public function __construct(
        private readonly GatewayService $gatewayService,
        private readonly ProxmoxClientFactory $proxmoxClientFactory,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $vmid = $this->option('vmid') ? (int) $this->option('vmid') : null;
        $nodeName = $this->option('node');
        $serverId = $this->option('server') ? (int) $this->option('server') : null;
        $dryRun = $this->option('dry-run');

        if (! $vmid || ! $serverId) {
            $this->error('Both --vmid and --server are required.');

            return self::FAILURE;
        }

        $server = ProxmoxServer::find($serverId);
        if (! $server) {
            $this->error("Server with ID {$serverId} not found.");

            return self::FAILURE;
        }

        // Check if VM is running
        if (! $nodeName) {
            // Try to find node from server
            $this->warn('No node specified, attempting to find VM on server...');
            try {
                $proxmoxClient = $this->proxmoxClientFactory->make($server);
                $nodes = $proxmoxClient->getNodes();
                foreach ($nodes as $node) {
                    $vms = $proxmoxClient->getVMs($node['node']);
                    foreach ($vms as $vm) {
                        if (($vm['vmid'] ?? 0) === $vmid) {
                            $nodeName = $node['node'];
                            $this->info("Found VM {$vmid} on node {$nodeName}");
                            break 2;
                        }
                    }
                }
            } catch (\Exception $e) {
                $this->error("Failed to find VM: {$e->getMessage()}");

                return self::FAILURE;
            }
        }

        if (! $nodeName) {
            $this->error("Could not find VM {$vmid} on server {$server->name}");

            return self::FAILURE;
        }

        // Verify VM is running
        try {
            $proxmoxClient = $this->proxmoxClientFactory->make($server);
            $status = $proxmoxClient->getVMStatus($nodeName, $vmid);
            $isRunning = ($status['status'] ?? 'stopped') === 'running';

            if (! $isRunning) {
                $this->warn("VM {$vmid} is not running (status: {$status['status']}). Dedicated devices will attach when VM starts.");

                return self::SUCCESS;
            }
        } catch (\Exception $e) {
            $this->error("Failed to check VM status: {$e->getMessage()}");

            return self::FAILURE;
        }

        $this->info("Processing dedicated devices for VM {$vmid} on {$nodeName}...");

        if ($dryRun) {
            $this->warn('DRY RUN - no changes will be made.');

            $devices = \App\Models\UsbDevice::dedicatedTo($vmid, $serverId)->get();
            if ($devices->isEmpty()) {
                $this->info('No dedicated devices found for this VM.');

                return self::SUCCESS;
            }

            $this->table(
                ['ID', 'VID:PID', 'Name', 'Status', 'Gateway'],
                $devices->map(fn ($d) => [
                    $d->id,
                    $d->vid_pid,
                    $d->name,
                    $d->status->value,
                    $d->gatewayNode?->name ?? 'N/A',
                ])->toArray()
            );

            return self::SUCCESS;
        }

        // Process dedicated devices
        $result = $this->gatewayService->processDedicatedDevicesForVm($vmid, $server);

        $this->info("Result: {$result['attached']} attached, {$result['failed']} failed");

        if (! empty($result['errors'])) {
            $this->newLine();
            $this->warn('Errors:');
            foreach ($result['errors'] as $error) {
                $this->line("  - {$error}");
            }
        }

        return $result['failed'] > 0 ? self::FAILURE : self::SUCCESS;
    }
}
