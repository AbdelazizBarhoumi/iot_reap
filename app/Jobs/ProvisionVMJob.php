<?php

namespace App\Jobs;

use App\Enums\VMSessionStatus;
use App\Events\VMSessionCreated;
use App\Events\VMSessionActivated;
use App\Exceptions\ProxmoxApiException;
use App\Models\VMSession;
use App\Repositories\VMSessionRepository;
use App\Services\ProxmoxClientInterface;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * Queue job for provisioning a VM.
 * Implements retry logic with exponential backoff.
 */
class ProvisionVMJob implements ShouldQueue
{
    use Dispatchable, Queueable, InteractsWithQueue;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     *
     * @var array<int, int>
     */
    public array $backoff = [10, 30, 60];

    /**
     * Create a new job instance.
     */
    public function __construct(
        private readonly VMSession $session,
    ) {}

    /**
     * Get the middleware the job should pass through.
     *
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [new WithoutOverlapping("provision-session-{$this->session->id}")];
    }

    /**
     * Execute the job.
     *
     * @throws ProxmoxApiException
     */
    public function handle(
        VMSessionRepository $sessionRepository,
        ProxmoxClientInterface $client,
    ): void {
        Log::info('Starting ProvisionVMJob', [
            'session_id' => $this->session->id,
            'attempt' => $this->attempts(),
        ]);

        try {
            // Refresh the session to ensure we have latest data
            $session = $this->session->fresh();
            $template = $session->template;
            $node = $session->node;

            // Clone the template VM
            $vmId = $client->cloneTemplate(
                templateVmid: $template->template_vmid,
                nodeName: $node->name,
            );

            Log::info('Successfully cloned template VM', [
                'session_id' => $session->id,
                'vm_id' => $vmId,
                'node' => $node->name,
            ]);

            // Start the VM
            $client->startVM(nodeName: $node->name, vmid: $vmId);

            Log::info('Successfully started VM', [
                'session_id' => $session->id,
                'vm_id' => $vmId,
            ]);

            // Update session as active
            $sessionRepository->update($session, [
                'vm_id' => $vmId,
                'status' => VMSessionStatus::ACTIVE,
                'ip_address' => '0.0.0.0', // TODO: Get actual IP from Proxmox or Guacamole
            ]);

            Log::info('VM provisioning successful', [
                'session_id' => $session->id,
                'vm_id' => $vmId,
                'status' => VMSessionStatus::ACTIVE->value,
            ]);

            // Refresh session from DB to get updated state
            $freshSession = $session->fresh();

            // Emit VMSessionCreated event for downstream processors (notifications, etc.)
            event(new VMSessionCreated($freshSession));

            // Emit VMSessionActivated event to trigger Guacamole connection creation
            event(new VMSessionActivated($freshSession));
        } catch (ProxmoxApiException $e) {
            Log::warning('Proxmox API error during provisioning', [
                'session_id' => $this->session->id,
                'attempt' => $this->attempts(),
                'error' => $e->getMessage(),
            ]);

            throw $e; // Will trigger retry via ShouldQueue
        } catch (Throwable $e) {
            Log::error('Unexpected error during provisioning', [
                'session_id' => $this->session->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(Throwable $e): void
    {
        Log::error('ProvisionVMJob failed after all retries', [
            'session_id' => $this->session->id,
            'error' => $e->getMessage(),
        ]);

        // Mark session as failed
        $session = $this->session->fresh();
        $session->update(['status' => VMSessionStatus::FAILED]);

        // TODO: Notify admin via email
        // Mail::to(config('app.admin_email'))
        //     ->send(new VMProvisioningFailedMail($session, $e));
    }
}
