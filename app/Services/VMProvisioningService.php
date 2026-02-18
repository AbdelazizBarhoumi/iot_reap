<?php

namespace App\Services;

use App\Enums\VMSessionStatus;
use App\Enums\VMSessionType;
use App\Jobs\ProvisionVMJob;
use App\Models\ProxmoxServer;
use App\Models\User;
use App\Models\VMSession;
use App\Models\VMTemplate;
use App\Repositories\VMSessionRepository;
use Illuminate\Support\Facades\Log;

/**
 * Service for provisioning new VM sessions.
 * Orchestrates node selection, session creation, and job dispatch.
 */
class VMProvisioningService
{
    /**
     * Create a new VMProvisioningService instance.
     */
    public function __construct(
        private readonly VMSessionRepository $sessionRepository,
        private readonly ProxmoxLoadBalancer $loadBalancer,
        private readonly ProxmoxClientInterface $proxmoxClient,
    ) {}

    /**
     * Provision a new VM session for a user.
     *
     * @throws \App\Exceptions\NoAvailableNodeException
     */
    public function provision(
        User $user,
        int $templateId,
        int $durationMinutes,
        VMSessionType $sessionType = VMSessionType::EPHEMERAL,
    ): VMSession {
        Log::info('Starting VM provisioning', [
            'user_id' => $user->id,
            'template_id' => $templateId,
            'duration_minutes' => $durationMinutes,
            'session_type' => $sessionType->value,
        ]);

        // Validate template exists
        $template = VMTemplate::findOrFail($templateId);

        // Use configured/active Proxmox server
        $server = ProxmoxServer::where('is_active', true)->firstOrFail();

        // Use injected load balancer (it uses the injected Proxmox client)
        $node = $this->loadBalancer->selectNode($server);

        // Create the session record in pending status
        $session = $this->sessionRepository->create([
            'user_id' => $user->id,
            'template_id' => $template->id,
            'node_id' => $node->id,
            'status' => VMSessionStatus::PENDING,
            'session_type' => $sessionType,
            'expires_at' => now()->addMinutes($durationMinutes),
        ]);

        Log::info('Created VM session record', [
            'session_id' => $session->id,
            'node_id' => $node->id,
        ]);

        // Dispatch the provisioning job
        ProvisionVMJob::dispatch($session)
            ->onQueue('default');

        if ($sessionType === VMSessionType::EPHEMERAL) {
            // For ephemeral sessions, schedule cleanup job for when it expires
            CleanupVMJob::dispatch($session)
                ->delay($session->expires_at);
        }

        return $session;
    }
}
