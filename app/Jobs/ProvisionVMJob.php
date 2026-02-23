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
            $node = $session->node;

            // We no longer clone templates; assume vm_id already set on session.
            $vmId = $session->vm_id;
            if (! $vmId) {
                Log::error('ProvisionVMJob: vm_id missing, cannot provision', ['session_id' => $session->id]);
                $sessionRepository->update($session, ['status' => VMSessionStatus::FAILED]);
                return;
            }

            // Ensure VM is started just in case
            $client->startVM(nodeName: $node->name, vmid: $vmId);

            Log::info('ProvisionVMJob: ensured VM started', [
                'session_id' => $session->id,
                'vm_id' => $vmId,
            ]);

            // Update session status to provisioning (Guacamole listener will handle activation)
            $sessionRepository->update($session, [
                'status' => VMSessionStatus::PROVISIONING,
            ]);

            $freshSession = $session->fresh();
            event(new VMSessionCreated($freshSession));
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
