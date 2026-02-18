<?php

namespace App\Services;

use App\Enums\VMSessionStatus;
use App\Exceptions\ProxmoxApiException;
use App\Jobs\ProvisionVMJob;
use App\Models\User;
use App\Models\VMSession;
use App\Models\VMTemplate;
use App\Repositories\VMSessionRepository;
use Illuminate\Support\Facades\Log;

class VMProvisioningService
{
    public function __construct(
        private readonly VMSessionRepository $sessionRepository,
        private readonly ProxmoxLoadBalancer $loadBalancer,
        private readonly ProxmoxClientInterface $proxmoxClient,
    ) {
    }

    /**
     * Provision a new VM session for a user.
     *
     * This method creates a pending session and dispatches an async job
     * to handle the actual VM cloning and startup.
     *
     * @throws \Exception
     */
    public function provision(
        User $user,
        int $templateId,
        int $durationMinutes,
        string $sessionType = 'ephemeral',
    ): VMSession {
        // Verify template exists
        $template = VMTemplate::find($templateId);
        if (! $template || ! $template->is_active) {
            throw new \Exception("VM template {$templateId} not found or inactive");
        }

        // Select a node for this session
        $node = $this->loadBalancer->selectNode();

        // Create the session record in pending state
        $session = $this->sessionRepository->create([
            'user_id' => $user->id,
            'template_id' => $templateId,
            'node_id' => $node->id,
            'status' => VMSessionStatus::PENDING->value,
            'session_type' => $sessionType,
            'expires_at' => now()->addMinutes($durationMinutes),
        ]);

        Log::info("VM session created", [
            'session_id' => $session->id,
            'user_id' => $user->id,
            'template_id' => $templateId,
            'node' => $node->name,
            'duration_minutes' => $durationMinutes,
        ]);

        // Dispatch the provisioning job
        ProvisionVMJob::dispatch($session);

        return $session;
    }

    /**
     * Poll a VM until it reaches the running state.
     *
     * @throws ProxmoxApiException
     */
    public function pollVMStatus(VMSession $session, string $targetStatus = 'running'): bool
    {
        $maxAttempts = ceil(config('proxmox.clone_timeout') / config('proxmox.clone_poll_interval'));
        $pollInterval = config('proxmox.clone_poll_interval', 5);

        for ($attempt = 1; $attempt <= $maxAttempts; $attempt++) {
            try {
                $status = $this->proxmoxClient->getVMStatus($session->node->name, $session->vm_id);

                Log::debug("VM status poll", [
                    'session_id' => $session->id,
                    'vm_id' => $session->vm_id,
                    'attempt' => $attempt,
                    'status' => $status['status'] ?? 'unknown',
                ]);

                if (($status['status'] ?? null) === $targetStatus) {
                    return true;
                }

                if ($attempt < $maxAttempts) {
                    sleep($pollInterval);
                }
            } catch (ProxmoxApiException $e) {
                if ($attempt === $maxAttempts) {
                    throw $e;
                }

                Log::warning("VM status poll failed, retrying", [
                    'session_id' => $session->id,
                    'vm_id' => $session->vm_id,
                    'attempt' => $attempt,
                    'error' => $e->getMessage(),
                ]);

                sleep($pollInterval);
            }
        }

        return false;
    }
}
