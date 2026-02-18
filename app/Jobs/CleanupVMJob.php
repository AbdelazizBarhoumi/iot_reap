<?php

namespace App\Jobs;

use App\Enums\VMSessionStatus;
use App\Models\ProxmoxServer;
use App\Models\VMSession;
use App\Services\ProxmoxClient;
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
    use Dispatchable, Queueable, InteractsWithQueue;

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
    public function handle(ProxmoxServer $server): void
    {
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
            if (!$session->vm_id) {
                Log::warning('No VM ID for session, cannot cleanup', [
                    'session_id' => $session->id,
                ]);

                $session->update(['status' => VMSessionStatus::EXPIRED]);

                return;
            }

            // Delete the VM
            $client = new ProxmoxClient($server);
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
}
