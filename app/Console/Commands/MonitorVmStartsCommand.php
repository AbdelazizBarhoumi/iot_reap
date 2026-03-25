<?php

namespace App\Console\Commands;

use App\Models\ProxmoxServer;
use App\Models\UsbDevice;
use App\Services\GatewayService;
use App\Services\ProxmoxClientFactory;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Monitor VMs and attach dedicated USB devices when they start.
 *
 * This command polls Proxmox servers to detect VMs that have recently
 * started and attaches any USB devices dedicated to them.
 *
 * Designed to run every minute via scheduler:
 *   $schedule->command('usb:monitor-vm-starts')->everyMinute();
 *
 * Uses caching to track VM states and only process VMs that have
 * transitioned from stopped to running since the last check.
 */
class MonitorVmStartsCommand extends Command
{
    protected $signature = 'usb:monitor-vm-starts
                            {--server= : Only monitor this server ID}
                            {--once : Run once instead of with state tracking}';

    protected $description = 'Monitor VMs and attach dedicated USB devices when they start';

    private const CACHE_KEY_PREFIX = 'vm_state_';

    private const CACHE_TTL = 300; // 5 minutes

    public function __construct(
        private readonly GatewayService $gatewayService,
        private readonly ProxmoxClientFactory $proxmoxClientFactory,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $serverId = $this->option('server') ? (int) $this->option('server') : null;
        $once = $this->option('once');

        $servers = $serverId
            ? ProxmoxServer::where('id', $serverId)->where('is_active', true)->get()
            : ProxmoxServer::where('is_active', true)->get();

        if ($servers->isEmpty()) {
            $this->info('No active servers to monitor.');

            return self::SUCCESS;
        }

        // Get VMs with dedicated devices
        $dedicatedVmids = UsbDevice::whereNotNull('dedicated_vmid')
            ->select('dedicated_vmid', 'dedicated_server_id')
            ->distinct()
            ->get()
            ->groupBy('dedicated_server_id');

        if ($dedicatedVmids->isEmpty()) {
            $this->info('No dedicated USB devices configured.');

            return self::SUCCESS;
        }

        $processed = 0;
        $attached = 0;

        foreach ($servers as $server) {
            $serverVmids = $dedicatedVmids->get($server->id);
            if (! $serverVmids) {
                continue;
            }

            $vmidsToCheck = $serverVmids->pluck('dedicated_vmid')->unique()->toArray();

            try {
                $client = $this->proxmoxClientFactory->make($server);
                $nodes = $client->getNodes();

                foreach ($nodes as $nodeData) {
                    $nodeName = $nodeData['node'];
                    $vms = $client->getVMs($nodeName);

                    foreach ($vms as $vm) {
                        $vmid = $vm['vmid'] ?? 0;
                        if (! in_array($vmid, $vmidsToCheck)) {
                            continue;
                        }

                        $isRunning = ($vm['status'] ?? 'stopped') === 'running';
                        $cacheKey = self::CACHE_KEY_PREFIX."{$server->id}_{$vmid}";
                        $wasRunning = Cache::get($cacheKey, false);

                        // Update state in cache
                        Cache::put($cacheKey, $isRunning, self::CACHE_TTL);

                        // VM just started (was stopped, now running)
                        if ($isRunning && ! $wasRunning && ! $once) {
                            $this->info("VM {$vmid} just started on {$nodeName}@{$server->name}");

                            $result = $this->gatewayService->processDedicatedDevicesForVm($vmid, $server);
                            $processed++;
                            $attached += $result['attached'];

                            if (! empty($result['errors'])) {
                                foreach ($result['errors'] as $error) {
                                    $this->warn("  Error: {$error}");
                                }
                            }
                        } elseif ($isRunning && $once) {
                            // With --once flag, process all running VMs
                            $this->info("Processing VM {$vmid} on {$nodeName}@{$server->name}");

                            $result = $this->gatewayService->processDedicatedDevicesForVm($vmid, $server);
                            $processed++;
                            $attached += $result['attached'];
                        }
                    }
                }
            } catch (\Exception $e) {
                $this->error("Error checking server {$server->name}: {$e->getMessage()}");
                Log::error('MonitorVmStartsCommand: Failed to check server', [
                    'server_id' => $server->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->info("Processed {$processed} VMs, attached {$attached} devices.");

        return self::SUCCESS;
    }
}
