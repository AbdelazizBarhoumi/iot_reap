<?php

namespace App\Jobs;

use App\Enums\UsbDeviceStatus;
use App\Enums\VMSessionStatus;
use App\Models\VMSession;
use App\Services\GatewayService;
use App\Services\ProxmoxClientInterface;
use App\Services\UsbDeviceQueueService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Queue job for cleaning up an expired VM session.
 * Deletes the VM from Proxmox and marks the session as expired.
 */
class CleanupVMJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable;

    public $tries = 3;

    public $backoff = [10, 30, 60]; // seconds

    /**
     * Create a new job instance.
     */
    public function __construct(
        private readonly VMSession $session,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(
        ProxmoxClientInterface $client,
        GatewayService $gatewayService,
        UsbDeviceQueueService $queueService,
    ): void {
        Log::info('Starting CleanupVMJob', [
            'session_id' => $this->session->id,
        ]);

        try {
            $session = $this->session->fresh();

            // If session already expired or failed, skip cleanup
            if (in_array($session->status, [
                VMSessionStatus::EXPIRED,
                VMSessionStatus::FAILED,
            ])) {
                Log::info('Session already expired/failed, skipping cleanup', [
                    'session_id' => $session->id,
                    'status' => $session->status->value,
                ]);

                return;
            }

            // Only cleanup if we have a VM ID
            if (! $session->vm_id) {
                Log::warning('No VM ID for session, cannot cleanup', [
                    'session_id' => $session->id,
                ]);

                $session->update(['status' => VMSessionStatus::EXPIRED]);

                return;
            }

            // Step 0: Cleanup any attached USB devices first
            $this->cleanupUsbDevices($session, $gatewayService, $queueService);

            // Delete the VM
            $client->deleteVM(
                nodeName: $session->node->name,
                vmid: $session->vm_id,
            );

            Log::info('Successfully deleted VM', [
                'session_id' => $session->id,
                'vm_id' => $session->vm_id,
            ]);

            // Mark session as expired
            $session->update(['status' => VMSessionStatus::EXPIRED]);

            Log::info('VM session cleanup completed', [
                'session_id' => $session->id,
            ]);
        } catch (Throwable $e) {
            Log::warning('Error during VM cleanup', [
                'session_id' => $this->session->id,
                'attempt' => $this->attempts(),
                'error' => $e->getMessage(),
            ]);

            throw $e; // Will trigger retry
        }
    }

    /**
     * Handle job failure after all retries.
     */
    public function failed(Throwable $e): void
    {
        Log::error('CleanupVMJob failed after all retries', [
            'session_id' => $this->session->id,
            'error' => $e->getMessage(),
        ]);

        // Still mark as expired even if cleanup failed
        $session = $this->session->fresh();
        $session->update(['status' => VMSessionStatus::EXPIRED]);

        // TODO: Alert admin about orphaned VM
    }

    /**
     * Detach and cleanup USB devices attached to this session.
     */
    private function cleanupUsbDevices(
        VMSession $session,
        GatewayService $gatewayService,
        UsbDeviceQueueService $queueService,
    ): void {
        $attachedDevices = $session->attachedDevices()->get();

        if ($attachedDevices->isEmpty()) {
            return;
        }

        Log::info('Cleaning up USB devices before VM deletion', [
            'session_id' => $session->id,
            'device_count' => $attachedDevices->count(),
        ]);

        foreach ($attachedDevices as $device) {
            try {
                $gatewayService->detachFromVm($device);
                $queueService->processQueueOnDetach($device);
            } catch (Throwable $e) {
                // Force-mark as bound if detach fails
                Log::warning('Force-releasing USB device during cleanup', [
                    'device_id' => $device->id,
                    'error' => $e->getMessage(),
                ]);

                $device->update([
                    'status' => UsbDeviceStatus::BOUND,
                    'attached_session_id' => null,
                    'attached_to' => null,
                    'attached_vm_ip' => null,
                    'usbip_port' => null,
                ]);

                $queueService->processQueueOnDetach($device);
            }
        }
    }
}
