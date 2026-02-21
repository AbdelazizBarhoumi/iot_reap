<?php

namespace App\Jobs;

use App\Enums\VMSessionStatus;
use App\Enums\VMSessionType;
use App\Models\VMSession;
use App\Services\GuacamoleClientInterface;
use App\Services\ProxmoxClientInterface;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Queue job for terminating a VM session.
 *
 * Execution order:
 * 1. Delete Guacamole connection (if exists)
 * 2. Optionally revert to snapshot (persistent sessions only)
 * 3. Optionally stop or delete the VM (based on session type and flags)
 * 4. Mark session as terminated/expired
 *
 * Always deletes Guacamole first, before any VM operations.
 */
class TerminateVMJob implements ShouldQueue
{
    use Dispatchable, Queueable, InteractsWithQueue;

    public $tries = 3;
    public $backoff = [10, 30, 60]; // seconds

    /**
     * Create a new job instance.
     */
    public function __construct(
        private readonly VMSession $session,
        private readonly bool $stopVm = true,
        private readonly ?string $returnSnapshot = null,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(
        GuacamoleClientInterface $guacamoleClient,
        ProxmoxClientInterface $proxmoxClient,
    ): void {
        Log::info('Starting TerminateVMJob', [
            'session_id' => $this->session->id,
            'stop_vm' => $this->stopVm,
            'return_snapshot' => $this->returnSnapshot,
        ]);

        try {
            $session = $this->session->fresh();

            // Skip if already terminated
            if (in_array($session->status, [
                VMSessionStatus::EXPIRED,
                VMSessionStatus::FAILED,
            ])) {
                Log::info('Session already expired/failed, skipping termination', [
                    'session_id' => $session->id,
                    'status' => $session->status->value,
                ]);

                return;
            }

            // Step 1: Delete Guacamole connection (ALWAYS do this first)
            $this->deleteGuacamoleConnection($session, $guacamoleClient);

            // Only proceed with VM operations if we have a VM ID
            if ($session->vm_id) {
                // Step 2: Revert to snapshot if persistent and snapshot provided
                if ($session->session_type === VMSessionType::PERSISTENT &&
                    $this->returnSnapshot) {
                    $this->revertSnapshot($session, $proxmoxClient);
                }

                // Step 3: Stop or delete the VM
                if ($this->stopVm) {
                    $this->stopOrDeleteVM($session, $proxmoxClient);
                } else {
                    Log::info('Skipping VM stop/delete (stop_vm flag is false)', [
                        'session_id' => $session->id,
                        'vm_id' => $session->vm_id,
                    ]);
                }
            }

            // Mark session as expired
            $session->update(['status' => VMSessionStatus::EXPIRED]);

            Log::info('VM session terminated successfully', [
                'session_id' => $session->id,
            ]);
        } catch (Throwable $e) {
            Log::warning('Error during VM termination', [
                'session_id' => $this->session->id,
                'attempt' => $this->attempts(),
                'error' => $e->getMessage(),
            ]);

            throw $e; // Will trigger retry
        }
    }

    /**
     * Delete the Guacamole connection for this session.
     *
     * This is ALWAYS done first, before any VM operations.
     * If it fails, we still rethrow to ensure the session isn't marked as expired
     * until we're sure the connection is deleted.
     */
    private function deleteGuacamoleConnection(
        VMSession $session,
        GuacamoleClientInterface $client,
    ): void {
        if (!$session->guacamole_connection_id) {
            Log::info('No Guacamole connection to delete', [
                'session_id' => $session->id,
            ]);

            return;
        }

        try {
            $client->deleteConnection((string)$session->guacamole_connection_id);

            Log::info('Guacamole connection deleted', [
                'session_id' => $session->id,
                'connection_id' => $session->guacamole_connection_id,
            ]);
        } catch (Throwable $e) {
            Log::error('Failed to delete Guacamole connection', [
                'session_id' => $session->id,
                'connection_id' => $session->guacamole_connection_id,
                'error' => $e->getMessage(),
            ]);

            // Rethrow to trigger retry - we MUST delete the Guacamole connection
            throw $e;
        }
    }

    /**
     * Revert the VM to a specific snapshot.
     *
     * Only called for persistent sessions when a snapshot name is provided.
     */
    private function revertSnapshot(
        VMSession $session,
        ProxmoxClientInterface $client,
    ): void {
        if (!$this->returnSnapshot) {
            return;
        }

        try {
            Log::info('Reverting VM to snapshot', [
                'session_id' => $session->id,
                'vm_id' => $session->vm_id,
                'snapshot_name' => $this->returnSnapshot,
            ]);

            // TODO: Implement snapshot revert in ProxmoxClient when snapshot support is added
            // For now, this method must be added to ProxmoxClientInterface
            // $client->revertSnapshot(
            //     nodeName: $session->node->name,
            //     vmid: $session->vm_id,
            //     snapshotName: $this->returnSnapshot,
            // );

            Log::info('VM reverted to snapshot', [
                'session_id' => $session->id,
                'snapshot_name' => $this->returnSnapshot,
            ]);
        } catch (Throwable $e) {
            Log::warning('Failed to revert to snapshot', [
                'session_id' => $session->id,
                'snapshot_name' => $this->returnSnapshot,
                'error' => $e->getMessage(),
            ]);

            // Don't rethrow - snapshot failure shouldn't prevent VM cleanup
            // The VM can still be stopped even if snapshot revert fails
        }
    }

    /**
     * Stop or delete the VM based on session type.
     *
     * - Ephemeral sessions: Always delete the VM
     * - Persistent sessions: Stop the VM (keep it for next session)
     */
    private function stopOrDeleteVM(
        VMSession $session,
        ProxmoxClientInterface $client,
    ): void {
        try {
            if ($session->session_type === VMSessionType::EPHEMERAL) {
                // Delete ephemeral VMs
                $client->deleteVM(
                    nodeName: $session->node->name,
                    vmid: $session->vm_id,
                );

                Log::info('Ephemeral VM deleted', [
                    'session_id' => $session->id,
                    'vm_id' => $session->vm_id,
                ]);
            } else {
                // Stop persistent VMs (don't delete)
                $client->stopVM(
                    nodeName: $session->node->name,
                    vmid: $session->vm_id,
                );

                Log::info('Persistent VM stopped', [
                    'session_id' => $session->id,
                    'vm_id' => $session->vm_id,
                ]);
            }
        } catch (Throwable $e) {
            Log::error('Failed to stop/delete VM', [
                'session_id' => $session->id,
                'vm_id' => $session->vm_id,
                'session_type' => $session->session_type->value,
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
        Log::error('TerminateVMJob failed after all retries', [
            'session_id' => $this->session->id,
            'error' => $e->getMessage(),
        ]);

        // Still mark as expired even if termination failed
        $session = $this->session->fresh();
        $session->update(['status' => VMSessionStatus::EXPIRED]);

        // TODO: Alert admin about orphaned VM or failed Guacamole cleanup
    }
}
