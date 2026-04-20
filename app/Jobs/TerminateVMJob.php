<?php

namespace App\Jobs;

use App\Enums\UsbDeviceStatus;
use App\Enums\VMSessionStatus;
use App\Models\VMSession;
use App\Services\AdminAlertService;
use App\Services\CameraService;
use App\Services\GatewayService;
use App\Services\GuacamoleClientInterface;
use App\Services\ProxmoxClientInterface;
use App\Services\UsbDeviceQueueService;
use Carbon\Carbon;
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
    use Dispatchable, InteractsWithQueue, Queueable;

    public $tries = 3;

    public $backoff = [10, 30, 60]; // seconds

    private bool $stopVm = false;

    private ?string $returnSnapshot = null; // not readonly so we can default to null

    private ?string $scheduledForExpiry = null; // for auto-expire jobs

    /**
     * Create a new job instance.
     *
     * By default the underlying VM is left powered on when the session ends.
     * The optional `$stopVm` flag exists only for legacy workflows or when an
     * administrator explicitly requests that the guest be powered off or
     * removed.  Internally we always serialize this value so the property is
     * initialized after the job is unserialized by the queue worker.
     *
     * @param bool $stopVm Whether to stop/delete the VM (default: false)
     * @param string|null $returnSnapshot Snapshot name to revert to before stopping
     * @param string|null $scheduledForExpiry Original expiry timestamp for auto-expire jobs
     */
    public function __construct(
        private readonly VMSession $session,
        bool $stopVm = false,
        ?string $returnSnapshot = null,
        ?string $scheduledForExpiry = null,
    ) {
        // default values ensure a job pulled from an older queue payload
        // remains valid even if the constructor wasn’t executed during
        // deserialization.  This guards against the typed property exception we
        // saw in the logs when stopVm was accessed before initialization.
        $this->stopVm = $stopVm;
        $this->returnSnapshot = $returnSnapshot;
        $this->scheduledForExpiry = $scheduledForExpiry;
    }

    /**
     * Execute the job.
     */
    public function handle(
        GuacamoleClientInterface $guacamoleClient,
        ProxmoxClientInterface $proxmoxClient,
        GatewayService $gatewayService,
        UsbDeviceQueueService $queueService,
        CameraService $cameraService,
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
                VMSessionStatus::TERMINATED,
                VMSessionStatus::FAILED,
            ])) {
                Log::info('Session already expired/failed, skipping termination', [
                    'session_id' => $session->id,
                    'status' => $session->status->value,
                ]);

                return;
            }

            // If this is an auto-expire job (has scheduledForExpiry), check if
            // the session was extended. If expires_at changed, skip — a new
            // auto-expire job will handle it.
            if ($this->scheduledForExpiry !== null) {
                $scheduledTime = Carbon::parse($this->scheduledForExpiry);
                /** @var Carbon $expiresAt */
                $expiresAt = $session->expires_at;

                if ($expiresAt->gt($scheduledTime)) {
                    Log::info('Session was extended, skipping auto-expire job', [
                        'session_id' => $session->id,
                        'scheduled_for' => $this->scheduledForExpiry,
                        'current_expires_at' => $expiresAt->toIso8601String(),
                    ]);

                    return;
                }
            }

            // Step 1: Delete Guacamole connection (ALWAYS do this first)
            $this->deleteGuacamoleConnection($session, $guacamoleClient);

            // Step 1.1: Release any camera controls owned by this session
            $this->releaseCameraControls($session, $cameraService);

            // Step 1.5: Detach and cleanup USB devices
            $this->cleanupUsbDevices($session, $gatewayService, $queueService);

            // Only proceed with VM operations if we have a VM ID
            if ($session->vm_id) {
                // Step 2: Revert to snapshot if requested
                // Use explicitly provided snapshot, or the one stored on the session
                $snapshotToRevert = $this->returnSnapshot ?? $session->return_snapshot;
                if ($snapshotToRevert) {
                    $this->revertSnapshot($session, $proxmoxClient, $snapshotToRevert);
                }

                // Step 3: Stop or delete the VM
                if ($this->stopVm) {
                    $this->stopVM($session, $proxmoxClient);
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
        if (! $session->guacamole_connection_id) {
            Log::info('No Guacamole connection to delete', [
                'session_id' => $session->id,
            ]);

            return;
        }

        try {
            $client->deleteConnection((string) $session->guacamole_connection_id);

            Log::info('Guacamole connection deleted', [
                'session_id' => $session->id,
                'connection_id' => $session->guacamole_connection_id,
            ]);

            // Clear the connection ID to prevent retry issues
            $session->update(['guacamole_connection_id' => null]);
        } catch (Throwable $e) {
            // Check if connection was already deleted (404)
            if (str_contains($e->getMessage(), '404') || str_contains($e->getMessage(), 'Not found')) {
                Log::info('Guacamole connection already deleted', [
                    'session_id' => $session->id,
                    'connection_id' => $session->guacamole_connection_id,
                ]);
                // Clear the connection ID since it no longer exists
                $session->update(['guacamole_connection_id' => null]);

                return; // Continue with VM cleanup
            }

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
     * Detach and cleanup USB devices attached to this session.
     *
     * This ensures devices are properly released when a session ends,
     * and queued users are notified about device availability.
     */
    private function cleanupUsbDevices(
        VMSession $session,
        GatewayService $gatewayService,
        UsbDeviceQueueService $queueService,
    ): void {
        $attachedDevices = $session->attachedDevices()->get();

        if ($attachedDevices->isEmpty()) {
            Log::info('No USB devices to cleanup', [
                'session_id' => $session->id,
            ]);

            return;
        }

        Log::info('Cleaning up USB devices for terminated session', [
            'session_id' => $session->id,
            'device_count' => $attachedDevices->count(),
        ]);

        foreach ($attachedDevices as $device) {
            try {
                // Attempt graceful detach via gateway service
                $gatewayService->detachFromVm($device);

                Log::info('USB device detached during session cleanup', [
                    'device_id' => $device->id,
                    'session_id' => $session->id,
                ]);

                // Process queue - notify next user in line
                $queueService->processQueueOnDetach($device);
            } catch (Throwable $e) {
                // If detach fails (VM already stopped, network issue, etc.),
                // force-mark device as bound so it's available for others
                Log::warning('Failed to gracefully detach USB device, forcing bound state', [
                    'device_id' => $device->id,
                    'session_id' => $session->id,
                    'error' => $e->getMessage(),
                ]);

                $device->update([
                    'status' => UsbDeviceStatus::BOUND,
                    'attached_session_id' => null,
                    'attached_to' => null,
                    'attached_vm_ip' => null,
                    'usbip_port' => null,
                ]);

                // Still process the queue even on force-release
                $queueService->processQueueOnDetach($device);
            }
        }
    }

    /**
     * Revert the VM to a specific snapshot.
     */
    private function revertSnapshot(
        VMSession $session,
        ProxmoxClientInterface $client,
        string $snapshotName,
    ): void {
        try {
            Log::info('Reverting VM to snapshot', [
                'session_id' => $session->id,
                'vm_id' => $session->vm_id,
                'snapshot_name' => $snapshotName,
            ]);

            $client->revertSnapshot(
                nodeName: $session->node->name,
                vmid: $session->vm_id,
                snapshotName: $snapshotName,
            );

            Log::info('VM reverted to snapshot', [
                'session_id' => $session->id,
                'snapshot_name' => $snapshotName,
            ]);
        } catch (Throwable $e) {
            Log::warning('Failed to revert to snapshot', [
                'session_id' => $session->id,
                'snapshot_name' => $snapshotName,
                'error' => $e->getMessage(),
            ]);

            // Don't rethrow - snapshot failure shouldn't prevent VM cleanup
            // The VM can still be stopped even if snapshot revert fails
        }
    }

    /**
     * Stop the VM without deleting it.
     *
     * Since all sessions now retain their underlying VM, the job only needs
     * to issue a stop call and log the action. Any snapshot revert logic has
     * already been handled separately if requested.
     */
    private function releaseCameraControls(VMSession $session, CameraService $cameraService): void
    {
        $released = $cameraService->releaseAllForSession($session->id);

        if ($released > 0) {
            Log::info('Released camera controls for terminated session', [
                'session_id' => $session->id,
                'released_count' => $released,
            ]);
        }
    }

    private function stopVM(
        VMSession $session,
        ProxmoxClientInterface $client,
    ): void {
        try {
            $client->stopVM(
                nodeName: $session->node->name,
                vmid: $session->vm_id,
            );

            Log::info('VM stopped (no deletion)', [
                'session_id' => $session->id,
                'vm_id' => $session->vm_id,
            ]);
        } catch (Throwable $e) {
            Log::error('Failed to stop VM', [
                'session_id' => $session->id,
                'vm_id' => $session->vm_id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Determine whether the job should stop the VM.
     *
     * Exposed primarily for tests so they can assert on the argument passed
     * to the constructor without poking at private properties.
     */
    public function shouldStopVm(): bool
    {
        return $this->stopVm;
    }

    /**
     * Get the session being terminated.
     *
     * Exposed primarily for tests so they can assert on the session passed
     * to the constructor.
     */
    public function getSession(): VMSession
    {
        return $this->session;
    }

    /**
     * Wait for a VM to reach stopped state.
     */
    private function waitForVMStopped(
        ProxmoxClientInterface $client,
        string $nodeName,
        int $vmid,
        int $timeoutSeconds
    ): void {
        $startTime = time();
        $checkInterval = 2; // seconds

        while (time() - $startTime < $timeoutSeconds) {
            try {
                $status = $client->getVMStatus($nodeName, $vmid);
                // Proxmox returns status in the 'status' key of the response array
                $vmState = $status['status'] ?? null;
                if ($vmState === 'stopped') {
                    Log::info('VM stopped successfully', [
                        'vmid' => $vmid,
                        'elapsed_seconds' => time() - $startTime,
                    ]);

                    return;
                }
            } catch (Throwable $e) {
                // VM might not exist anymore, which is fine
                Log::warning('Could not get VM status', [
                    'vmid' => $vmid,
                    'error' => $e->getMessage(),
                ]);
            }

            sleep($checkInterval);
        }

        Log::warning('VM did not stop within timeout, proceeding anyway', [
            'vmid' => $vmid,
            'timeout_seconds' => $timeoutSeconds,
        ]);
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

        $session = $this->session->fresh();

        try {
            app(CameraService::class)->releaseAllForSession($session->id);
        } catch (Throwable $releaseException) {
            Log::warning('Failed to release camera controls after job failure', [
                'session_id' => $session->id,
                'error' => $releaseException->getMessage(),
            ]);
        }

        // Still mark as expired even if termination failed
        $session->update(['status' => VMSessionStatus::EXPIRED]);

        // Alert admin about failed termination
        app(AdminAlertService::class)->alertVMTerminationFailed($session, $e);
    }
}
