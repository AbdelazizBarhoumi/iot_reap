<?php

namespace App\Services;

use App\Enums\VMSessionStatus;
use App\Enums\VMSessionType;
use App\Jobs\CleanupVMJob;
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
     * @param  array{username?: string, password?: string}|null  $credentials
     * @param  string|null  $protocolOverride  Protocol to use instead of template default (rdp/vnc/ssh)
     * @throws \App\Exceptions\NoAvailableNodeException
     */
    public function provision(
        User $user,
        int $templateId,
        int $durationMinutes,
        VMSessionType $sessionType = VMSessionType::EPHEMERAL,
        ?array $credentials = null,
        ?string $returnSnapshot = null,
        ?string $protocolOverride = null,
    ): VMSession {
        Log::info('Starting VM provisioning', [
            'user_id' => $user->id,
            'template_id' => $templateId,
            'duration_minutes' => $durationMinutes,
            'session_type' => $sessionType->value,
            'protocol_override' => $protocolOverride,
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
            'proxmox_server_id' => $server->id,
            'node_id' => $node->id,
            'status' => VMSessionStatus::PENDING,
            'session_type' => $sessionType,
            'protocol_override' => $protocolOverride,
            'expires_at' => now()->addMinutes($durationMinutes),
            'credentials' => $credentials,
            'return_snapshot' => $returnSnapshot,
        ]);

        Log::info('Created VM session record', [
            'session_id' => $session->id,
            'node_id' => $node->id,
        ]);

        // Dispatch the provisioning job
        ProvisionVMJob::dispatch($session)
            ->onQueue('default');

        if ($sessionType === VMSessionType::EPHEMERAL) {
            // For ephemeral sessions, schedule cleanup job to run after the session expires
            // Use minutes relative from now, not an absolute datetime
            CleanupVMJob::dispatch($session)
                ->delay(now()->addMinutes($durationMinutes));
        }

        return $session;
    }
}
