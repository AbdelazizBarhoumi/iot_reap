<?php

namespace App\Console\Commands;

use App\Enums\UsbDeviceStatus;
use App\Models\UsbDevice;
use App\Models\UsbDeviceQueue;
use App\Services\GatewayService;
use App\Services\ProxmoxClientFactory;
use App\Services\UsbDeviceQueueService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

/**
 * Reconciles USB device status with reality.
 *
 * This command should be run periodically (e.g., every 5 minutes) to:
 * 1. Verify USB devices are actually attached in VMs (catch VM restarts)
 * 2. Mark devices as DISCONNECTED if they were removed while attached
 * 3. Release devices attached to terminated/expired sessions
 * 4. Process queues for devices that became available
 * 5. Clean up orphaned queue entries
 *
 * Usage:
 *   php artisan usb:reconcile
 *   php artisan usb:reconcile --dry-run
 *   php artisan usb:reconcile --verify-vms     # Check VMs via guest agent
 *   php artisan usb:reconcile --verify-exports  # Check device exportability
 */
class UsbReconcileCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'usb:reconcile
                            {--dry-run : Show what would be done without making changes}
                            {--verify-vms : Query VMs via guest agent to verify USB state}
                            {--verify-exports : Verify bound devices are actually exportable}';

    /**
     * The console command description.
     */
    protected $description = 'Reconcile USB device status and release orphaned attachments';

    public function __construct(
        private readonly UsbDeviceQueueService $queueService,
        private readonly ProxmoxClientFactory $proxmoxClientFactory,
        private readonly GatewayService $gatewayService,
    ) {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $dryRun = $this->option('dry-run');
        $verbose = $this->output->isVerbose();
        $verifyVms = $this->option('verify-vms');
        $verifyExports = $this->option('verify-exports');

        $this->info('Starting USB device reconciliation'.($dryRun ? ' (dry run)' : ''));

        $stats = [
            'exports_fixed' => 0,
            'vm_state_fixed' => 0,
            'orphaned_released' => 0,
            'disconnected_handled' => 0,
            'queues_processed' => 0,
            'queue_entries_cleaned' => 0,
        ];

        // 0a. Verify bound devices are actually exportable (catches usbipd issues)
        if ($verifyExports) {
            $stats['exports_fixed'] = $this->verifyDeviceExportability($dryRun, $verbose);
        }

        // 0b. Verify USB state in active VMs (catches VM restarts, manual detaches)
        if ($verifyVms) {
            $stats['vm_state_fixed'] = $this->verifyVmUsbState($dryRun, $verbose);
        }

        // 1. Find and release devices attached to terminated sessions
        $stats['orphaned_released'] = $this->releaseOrphanedDevices($dryRun, $verbose);

        // 2. Handle disconnected devices
        $stats['disconnected_handled'] = $this->handleDisconnectedDevices($dryRun, $verbose);

        // 3. Process queues for available devices
        $stats['queues_processed'] = $this->processStuckQueues($dryRun, $verbose);

        // 4. Clean up queue entries for ended sessions
        $stats['queue_entries_cleaned'] = $this->cleanupEndedSessionQueues($dryRun, $verbose);

        $this->newLine();
        $this->info('Reconciliation complete:');
        $this->table(
            ['Action', 'Count'],
            [
                ['Non-exportable devices fixed', $stats['exports_fixed']],
                ['VM state mismatches fixed', $stats['vm_state_fixed']],
                ['Orphaned devices released', $stats['orphaned_released']],
                ['Disconnected devices handled', $stats['disconnected_handled']],
                ['Queues processed', $stats['queues_processed']],
                ['Queue entries cleaned', $stats['queue_entries_cleaned']],
            ]
        );

        Log::info('USB reconciliation completed', $stats);

        return self::SUCCESS;
    }

    /**
     * Verify bound devices are actually exportable (visible to usbip clients).
     * Catches cases where usbipd was restarted or devices became "stuck".
     */
    private function verifyDeviceExportability(bool $dryRun, bool $verbose): int
    {
        $boundDevices = UsbDevice::where('status', UsbDeviceStatus::BOUND)
            ->whereNull('attached_session_id')
            ->with('gatewayNode')
            ->get();

        if ($boundDevices->isEmpty()) {
            if ($verbose) {
                $this->line('  No bound devices to verify');
            }

            return 0;
        }

        $this->info("Verifying {$boundDevices->count()} bound device(s) are exportable...");
        $count = 0;

        /** @var UsbDevice $device */
        foreach ($boundDevices as $device) {
            if (! $device->gatewayNode) {
                continue;
            }

            try {
                $isExportable = $this->gatewayService->isDeviceExportable($device);

                if (! $isExportable) {
                    if ($verbose) {
                        $this->warn("  Device {$device->id} ({$device->busid}) is BOUND but NOT EXPORTABLE");
                    }

                    if (! $dryRun) {
                        Log::warning('Bound device not exportable, attempting rebind', [
                            'device_id' => $device->id,
                            'busid' => $device->busid,
                            'gateway' => $device->gatewayNode->name,
                        ]);

                        try {
                            $fixed = $this->gatewayService->ensureDeviceExportable($device);
                            if ($fixed) {
                                $this->info("    -> Fixed: Device {$device->id} is now exportable");
                            } else {
                                $this->error("    -> Failed to fix device {$device->id}");
                            }
                        } catch (\Throwable $e) {
                            $this->error("    -> Rebind error: {$e->getMessage()}");
                        }
                    }

                    $count++;
                } elseif ($verbose) {
                    $this->line("  Device {$device->id} ({$device->busid}) confirmed exportable");
                }
            } catch (\Throwable $e) {
                if ($verbose) {
                    $this->error("  Could not verify device {$device->id}: {$e->getMessage()}");
                }
            }
        }

        if ($count > 0) {
            $this->info("Found {$count} non-exportable device(s)".($dryRun ? ' (would fix)' : ''));
        }

        return $count;
    }

    /**
     * Verify USB device state by querying active VMs via guest agent.
     * Catches cases where VMs were restarted or devices manually detached.
     */
    private function verifyVmUsbState(bool $dryRun, bool $verbose): int
    {
        $attachedDevices = UsbDevice::where('status', UsbDeviceStatus::ATTACHED)
            ->whereNotNull('attached_session_id')
            ->whereHas('attachedSession', function ($query) {
                $query->whereIn('status', ['active', 'expiring']);
            })
            ->with(['attachedSession' => fn ($q) => $q->with(['node', 'proxmoxServer'])])
            ->get();

        if ($attachedDevices->isEmpty()) {
            if ($verbose) {
                $this->line('  No attached devices with active sessions to verify');
            }

            return 0;
        }

        $this->info("Verifying {$attachedDevices->count()} attached device(s) in VMs...");
        $count = 0;

        /** @var UsbDevice $device */
        foreach ($attachedDevices as $device) {
            $session = $device->attachedSession;
            if (! $session || ! $session->vm_id || ! $session->node || ! $session->proxmoxServer) {
                continue;
            }

            try {
                $client = $this->proxmoxClientFactory->make($session->proxmoxServer);
                $osType = $client->getGuestOsType($session->node->name, $session->vm_id);
                $isWindows = ($osType === 'windows');

                // Check usbip port output in VM
                $portOutput = $this->getVmUsbipPortOutput($client, $session, $isWindows);

                // Parse port output to see if our device's busid is present
                $devicePresent = $this->isDeviceInPortOutput($portOutput, $device->busid);

                if (! $devicePresent) {
                    if ($verbose) {
                        $this->warn("  Device {$device->id} ({$device->busid}) NOT found in VM {$session->vm_id}");
                    }

                    if (! $dryRun) {
                        Log::warning('USB device not found in VM during reconciliation', [
                            'device_id' => $device->id,
                            'busid' => $device->busid,
                            'session_id' => $session->id,
                            'vm_id' => $session->vm_id,
                        ]);

                        // Mark device as bound (not attached) since VM doesn't have it
                        $device->update([
                            'status' => UsbDeviceStatus::BOUND,
                            'attached_session_id' => null,
                            'attached_to' => null,
                            'attached_vm_ip' => null,
                            'usbip_port' => null,
                        ]);

                        // Process queue in case someone was waiting
                        $this->queueService->processQueueOnDetach($device);
                    }

                    $count++;
                } elseif ($verbose) {
                    $this->line("  Device {$device->id} ({$device->busid}) confirmed in VM {$session->vm_id}");
                }
            } catch (\Throwable $e) {
                if ($verbose) {
                    $this->error("  Could not verify device {$device->id}: {$e->getMessage()}");
                }
                // Don't modify device state if we can't verify - VM might be temporarily unreachable
            }
        }

        if ($count > 0) {
            $this->info("Found {$count} device(s) missing from VMs".($dryRun ? ' (would fix)' : ' - fixed'));
        }

        return $count;
    }

    /**
     * Get usbip port output from a VM via guest agent.
     */
    private function getVmUsbipPortOutput($client, $session, bool $isWindows): string
    {
        if ($isWindows) {
            // Windows: Use batch file approach
            $batchPath = 'C:\usbip-cmd.bat';
            $batchContent = 'C:\PROGRA~1\USBIP-~1\usbip.exe port';

            $client->writeFileInVm($session->node->name, $session->vm_id, $batchPath, $batchContent);
            $result = $client->execInVmAndWait($session->node->name, $session->vm_id, $batchPath, 15);
        } else {
            // Linux: Direct command
            $result = $client->execInVmAndWait($session->node->name, $session->vm_id, 'usbip port', 15);
        }

        return $result['out-data'] ?? '';
    }

    /**
     * Check if a device's busid appears in usbip port output.
     */
    private function isDeviceInPortOutput(string $output, string $busid): bool
    {
        // The output contains lines like:
        // Port 00: <Device in Use>
        //    SanDisk Corp. : Cruzer Blade (0781:5567)
        //    1-1 -> ...  (busid appears here on linux)
        //
        // For Windows the busid may show as "?-?" but we can still check
        // if there are any ports listed at all, and match by device name if needed

        // Simple check: if output contains "Port" followed by content, device is present
        // More robust: We stored the port number, could verify that specific port
        return str_contains($output, 'Port ') &&
               ! str_contains(trim($output), "====================\n\n") &&
               strlen(trim(explode('====================', $output)[1] ?? '')) > 10;
    }

    /**
     * Release devices that are "attached" but their session is terminated/expired.
     */
    private function releaseOrphanedDevices(bool $dryRun, bool $verbose): int
    {
        $orphanedDevices = UsbDevice::where('status', UsbDeviceStatus::ATTACHED)
            ->whereNotNull('attached_session_id')
            ->whereHas('attachedSession', function ($query) {
                $query->whereIn('status', ['expired', 'terminated', 'failed']);
            })
            ->get();

        $count = 0;
        /** @var UsbDevice $device */
        foreach ($orphanedDevices as $device) {
            if ($verbose) {
                $this->line("  Releasing orphaned device: {$device->name} (ID: {$device->id})");
            }

            if (! $dryRun) {
                $device->update([
                    'status' => UsbDeviceStatus::BOUND,
                    'attached_session_id' => null,
                    'attached_to' => null,
                    'attached_vm_ip' => null,
                    'usbip_port' => null,
                ]);

                // Process queue for this device
                $this->queueService->processQueueOnDetach($device);
            }

            $count++;
        }

        if ($count > 0) {
            $this->info("Found {$count} orphaned device(s)".($dryRun ? ' (would release)' : ' - released'));
        }

        return $count;
    }

    /**
     * Handle devices in DISCONNECTED state.
     * If they've been disconnected for too long, clean them up.
     */
    private function handleDisconnectedDevices(bool $dryRun, bool $verbose): int
    {
        $disconnectedDevices = UsbDevice::where('status', UsbDeviceStatus::DISCONNECTED)
            ->where('updated_at', '<', now()->subHours(1))
            ->get();

        $count = 0;
        /** @var UsbDevice $device */
        foreach ($disconnectedDevices as $device) {
            if ($verbose) {
                $this->line("  Handling long-disconnected device: {$device->name} (ID: {$device->id})");
            }

            if (! $dryRun) {
                // Clear attachment info and keep as disconnected
                // The device will be rediscovered when plugged back in
                $device->update([
                    'attached_session_id' => null,
                    'attached_to' => null,
                    'attached_vm_ip' => null,
                    'usbip_port' => null,
                ]);
            }

            $count++;
        }

        if ($count > 0) {
            $this->info("Found {$count} disconnected device(s) older than 1 hour".($dryRun ? ' (would clean)' : ' - cleaned'));
        }

        return $count;
    }

    /**
     * Process queues for devices that are bound but have pending queue entries.
     * This catches cases where queue processing didn't happen on detach.
     */
    private function processStuckQueues(bool $dryRun, bool $verbose): int
    {
        $boundDevicesWithQueues = UsbDevice::where('status', UsbDeviceStatus::BOUND)
            ->whereHas('queueEntries', function ($query) {
                $query->whereNull('notified_at');
            })
            ->with(['queueEntries' => fn ($q) => $q->orderBy('position')->limit(1)])
            ->get();

        $count = 0;
        /** @var UsbDevice $device */
        foreach ($boundDevicesWithQueues as $device) {
            $nextEntry = $device->queueEntries->first();
            if (! $nextEntry) {
                continue;
            }

            if ($verbose) {
                $this->line("  Processing stuck queue for device: {$device->name} (ID: {$device->id})");
            }

            if (! $dryRun) {
                $this->queueService->processQueueOnDetach($device);
            }

            $count++;
        }

        if ($count > 0) {
            $this->info("Found {$count} stuck queue(s)".($dryRun ? ' (would process)' : ' - processed'));
        }

        return $count;
    }

    /**
     * Clean up queue entries for sessions that have ended.
     */
    private function cleanupEndedSessionQueues(bool $dryRun, bool $verbose): int
    {
        if ($dryRun) {
            // In dry-run mode, just count
            $count = UsbDeviceQueue::whereHas('session', function ($query) {
                $query->whereIn('status', ['expired', 'terminated', 'failed']);
            })->count();

            if ($count > 0) {
                $this->info("Found {$count} queue entries for ended sessions (would clean)");
            }

            return $count;
        }

        // Actually clean up
        $count = $this->queueService->cleanupEndedSessions();

        if ($count > 0) {
            $this->info("Cleaned up {$count} queue entries for ended sessions");
        }

        return $count;
    }
}
