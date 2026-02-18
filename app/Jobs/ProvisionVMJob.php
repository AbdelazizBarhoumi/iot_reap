<?php

namespace App\Jobs;

use App\Enums\VMSessionStatus;
use App\Exceptions\ProxmoxApiException;
use App\Models\VMSession;
use App\Repositories\VMSessionRepository;
use App\Services\ProxmoxClientInterface;
use App\Services\VMProvisioningService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ProvisionVMJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The maximum number of unhandled exceptions to allow before failing.
     */
    public int $maxExceptions = 3;

    /**
     * Indicate if the job should be marked as failed on timeout.
     */
    public bool $failOnTimeout = true;

    public function __construct(
        public readonly VMSession $session,
    ) {
        $this->onQueue('default');
    }

    /**
     * Get the middleware the job should pass through.
     */
    public function middleware(): array
    {
        return [
            new WithoutOverlapping("provision_vm_{$this->session->id}"),
        ];
    }

    /**
     * Execute the job.
     *
     * @throws \Exception
     */
    public function handle(
        ProxmoxClientInterface $proxmoxClient,
        VMProvisioningService $provisioningService,
        VMSessionRepository $sessionRepository,
    ): void {
        try {
            Log::info("Starting VM provisioning job", [
                'session_id' => $this->session->id,
                'template_id' => $this->session->template_id,
                'node_id' => $this->session->node_id,
            ]);

            // Refresh the session from database
            $session = $this->session->fresh();

            // Update status to provisioning
            $sessionRepository->updateStatus($session, VMSessionStatus::PROVISIONING);

            // Generate a new VMID in the session range
            $newVmid = $this->generateSessionVMID();

            // Clone the template
            Log::info("Cloning VM template", [
                'session_id' => $session->id,
                'template_vmid' => $session->template->template_vmid,
                'new_vmid' => $newVmid,
                'node' => $session->node->name,
            ]);

            $proxmoxClient->cloneTemplate(
                templateVmid: $session->template->template_vmid,
                node: $session->node->name,
                newVmid: (string) $newVmid,
                newName: "session-{$session->id}",
            );

            // Store the VMID in the session
            $session->update(['vm_id' => $newVmid]);

            // Poll until VM is running
            Log::info("Waiting for VM to start", [
                'session_id' => $session->id,
                'vm_id' => $newVmid,
            ]);

            $isRunning = $provisioningService->pollVMStatus($session, 'running');

            if (! $isRunning) {
                throw new \Exception("VM did not reach 'running' state within timeout period");
            }

            // VM is now running, update session status to active
            $sessionRepository->updateStatus($session, VMSessionStatus::ACTIVE);

            Log::info("VM provisioning completed successfully", [
                'session_id' => $session->id,
                'vm_id' => $newVmid,
                'node' => $session->node->name,
            ]);

            // Dispatch cleanup job (commented out until CleanupVMJob is created)
            // $durationMinutes = now()->diffInMinutes($session->expires_at);
            // CleanupVMJob::dispatch($session)->delay(now()->addMinutes($durationMinutes));

        } catch (ProxmoxApiException $e) {
            $this->handleProxmoxException($e, $sessionRepository);
        } catch (\Exception $e) {
            $this->handleException($e, $sessionRepository);
        }
    }

    /**
     * Handle Proxmox API exceptions.
     */
    private function handleProxmoxException(
        ProxmoxApiException $e,
        VMSessionRepository $sessionRepository,
    ): void {
        Log::error("Proxmox API error during provisioning", [
            'session_id' => $this->session->id,
            'error' => $e->getMessage(),
            'attempt' => $this->attempts(),
        ]);

        // If this is the final attempt, mark the session as failed
        if ($this->attempts() >= $this->tries) {
            $sessionRepository->markFailed($this->session, $e->getMessage());
            $this->notifyAdminOfFailure($e->getMessage());
        }

        // Rethrow to trigger retry
        throw $e;
    }

    /**
     * Handle general exceptions.
     */
    private function handleException(
        \Exception $e,
        VMSessionRepository $sessionRepository,
    ): void {
        Log::error("Error during VM provisioning", [
            'session_id' => $this->session->id,
            'error' => $e->getMessage(),
            'attempt' => $this->attempts(),
        ]);

        // If this is the final attempt, mark the session as failed
        if ($this->attempts() >= $this->tries) {
            $sessionRepository->markFailed($this->session, $e->getMessage());
            $this->notifyAdminOfFailure($e->getMessage());
        }

        // Rethrow to trigger retry
        throw $e;
    }

    /**
     * Notify admin of provisioning failure.
     */
    private function notifyAdminOfFailure(string $error): void
    {
        try {
            Log::warning("VM provisioning failed after {$this->tries} attempts", [
                'session_id' => $this->session->id,
                'user_id' => $this->session->user_id,
                'error' => $error,
            ]);

            // TODO: Send email to admin
            // Mail::to(config('mail.admin_address'))
            //     ->send(new VMProvisioningFailedMail($this->session, $error));
        } catch (\Exception $e) {
            Log::error("Failed to notify admin of VM provisioning failure", [
                'session_id' => $this->session->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Generate a new VMID in the session range.
     */
    private function generateSessionVMID(): int
    {
        [$min, $max] = config('proxmox.session_vmid_range', [200, 999]);

        // For now, use a simple strategy: find the highest existing VMID and increment
        // In production, consider using a more robust allocation strategy
        $highestVmid = VMSession::whereNotNull('vm_id')
            ->max('vm_id') ?? $min - 1;

        $newVmid = $highestVmid + 1;

        if ($newVmid > $max) {
            throw new \Exception("VMID range exhausted: no available IDs between {$min} and {$max}");
        }

        return $newVmid;
    }
}
