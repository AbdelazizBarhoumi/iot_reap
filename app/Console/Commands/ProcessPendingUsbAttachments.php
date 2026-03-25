<?php

namespace App\Console\Commands;

use App\Exceptions\GatewayApiException;
use App\Models\UsbDevice;
use App\Repositories\UsbDeviceRepository;
use App\Services\GatewayService;
use App\Services\ProxmoxClientFactory;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

/**
 * Process pending USB device attachments.
 *
 * This command checks all USB devices with pending attachment status
 * and attempts to attach them to their target VMs if the VMs are now running.
 *
 * Can be run manually or scheduled to run periodically:
 * - In console/kernel.php: $schedule->command('usb:process-pending')->everyMinute();
 */
class ProcessPendingUsbAttachments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'usb:process-pending 
                            {--vmid= : Only process devices pending for this VM ID}
                            {--server= : Only process devices pending for this server ID}
                            {--dry-run : Show what would be done without making changes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process USB devices waiting to be attached to VMs that were not running';

    public function __construct(
        private readonly UsbDeviceRepository $deviceRepository,
        private readonly GatewayService $gatewayService,
        private readonly ProxmoxClientFactory $proxmoxClientFactory,
    ) {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $vmid = $this->option('vmid') ? (int) $this->option('vmid') : null;
        $serverId = $this->option('server') ? (int) $this->option('server') : null;
        $dryRun = $this->option('dry-run');

        // Get pending devices, optionally filtered
        $pendingDevices = $this->getPendingDevices($vmid, $serverId);

        if ($pendingDevices->isEmpty()) {
            $this->info('No pending USB attachments found.');

            return self::SUCCESS;
        }

        $this->info("Found {$pendingDevices->count()} pending USB attachment(s).");

        if ($dryRun) {
            $this->warn('DRY RUN - no changes will be made.');
        }

        $attached = 0;
        $stillPending = 0;
        $failed = 0;

        foreach ($pendingDevices as $device) {
            $this->processDevice($device, $dryRun, $attached, $stillPending, $failed);
        }

        $this->newLine();
        $this->info("Summary: {$attached} attached, {$stillPending} still pending (VM not running), {$failed} failed");

        return $failed > 0 ? self::FAILURE : self::SUCCESS;
    }

    /**
     * Get pending devices, optionally filtered.
     */
    private function getPendingDevices(?int $vmid, ?int $serverId)
    {
        $query = UsbDevice::pendingAttach()->with(['gatewayNode', 'pendingServer']);

        if ($vmid !== null) {
            $query->where('pending_vmid', $vmid);
        }

        if ($serverId !== null) {
            $query->where('pending_server_id', $serverId);
        }

        return $query->get();
    }

    /**
     * Process a single pending device.
     */
    private function processDevice(UsbDevice $device, bool $dryRun, int &$attached, int &$stillPending, int &$failed): void
    {
        $vmid = $device->pending_vmid;
        $node = $device->pending_node;
        $server = $device->pendingServer;
        $vmName = $device->pending_vm_name ?? 'pending-attach';
        $vmIp = $device->pending_vm_ip;

        if (! $server) {
            $this->error("  Device {$device->id} ({$device->busid}): Missing server reference, clearing pending state.");
            if (! $dryRun) {
                $this->deviceRepository->clearPendingAttach($device);
            }
            $failed++;

            return;
        }

        $this->line("  Processing device {$device->id} ({$device->busid}) -> VM {$vmid} on {$node}...");

        // Check if VM is now running
        try {
            $proxmoxClient = $this->proxmoxClientFactory->make($server);
            $vmStatus = $proxmoxClient->getVMStatus($node, $vmid);
            $isRunning = ($vmStatus['status'] ?? 'stopped') === 'running';
        } catch (\Exception $e) {
            $this->warn("    Could not check VM status: {$e->getMessage()}");
            $stillPending++;

            return;
        }

        if (! $isRunning) {
            $this->comment("    VM {$vmid} is still not running. Keeping pending.");
            $stillPending++;

            return;
        }

        // VM is running - try to attach
        if ($dryRun) {
            $this->info("    [DRY RUN] Would attach device to VM {$vmid}");
            $attached++;

            return;
        }

        try {
            // Get VM IP if not stored (it may have changed)
            if (! $vmIp) {
                try {
                    $interfaces = $proxmoxClient->getVMNetworkInterfaces($node, $vmid);
                    foreach ($interfaces as $iface) {
                        foreach ($iface['ip-addresses'] ?? [] as $addr) {
                            if ($addr['ip-address-type'] === 'ipv4' && ! str_starts_with($addr['ip-address'], '127.')) {
                                $vmIp = $addr['ip-address'];
                                break 2;
                            }
                        }
                    }
                } catch (\Exception) {
                    // IP not required for attachment via guest agent
                }
            }

            $result = $this->gatewayService->attachToVmDirect(
                device: $device,
                vmid: $vmid,
                nodeName: $node,
                server: $server,
                vmIp: $vmIp ?? '0.0.0.0',
                vmName: $vmName,
                allowPending: false  // Don't re-mark as pending if it fails
            );

            if ($result['pending']) {
                // Shouldn't happen with allowPending=false, but handle anyway
                $this->warn("    Device still pending: {$result['message']}");
                $stillPending++;
            } else {
                $this->info("    Successfully attached to VM {$vmid}");
                $attached++;
            }
        } catch (GatewayApiException $e) {
            $this->error("    Failed to attach: {$e->getMessage()}");
            Log::error('Failed to process pending USB attachment', [
                'device_id' => $device->id,
                'busid' => $device->busid,
                'vmid' => $vmid,
                'error' => $e->getMessage(),
            ]);
            $failed++;
        } catch (\Exception $e) {
            $this->error("    Unexpected error: {$e->getMessage()}");
            Log::error('Unexpected error processing pending USB attachment', [
                'device_id' => $device->id,
                'error' => $e->getMessage(),
            ]);
            $failed++;
        }
    }
}
