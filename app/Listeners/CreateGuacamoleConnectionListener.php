<?php

namespace App\Listeners;

use App\Events\VMSessionActivated;
use App\Enums\VMSessionStatus;
use App\Exceptions\GuacamoleApiException;
use App\Exceptions\ProxmoxApiException;
use App\Services\GuacamoleClientInterface;
use App\Services\GuacamoleConnectionParamsBuilder;
use App\Services\ProxmoxClientInterface;
use App\Services\ProxmoxIPResolver;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

/**
 * Creates a Guacamole connection when a VM session is activated.
 *
 * Flow:
 *  1. Check whether the VM is already running via ProxmoxClient::getVMStatus().
 *  2. If stopped: start it via ProxmoxClient::startVM().
 *  3. Resolve DHCP-assigned IP via ProxmoxIPResolver (polls every 2 s, timeout 5 min).
 *  4. Persist the resolved IP to vm_sessions.ip_address.
 *  5. Build Guacamole connection params — VM IP as hostname + user's saved preferences.
 *  6. Create connection in Guacamole, store connection_id in vm_sessions.
 *  7. Mark session status as 'active'.
 *
 * Implements ShouldQueue — runs asynchronously so provisioning does not block the HTTP request.
 */
class CreateGuacamoleConnectionListener implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * Seconds to wait before retrying.
     *
     * @var array<int>
     */
    public array $backoff = [30, 60, 120];

    public function __construct(
        private readonly GuacamoleClientInterface $guacamoleClient,
        private readonly ProxmoxClientInterface $proxmoxClient,
        private readonly ProxmoxIPResolver $ipResolver,
        private readonly GuacamoleConnectionParamsBuilder $paramsBuilder,
    ) {}

    /**
     * Handle the VMSessionActivated event.
     */
    public function handle(VMSessionActivated $event): void
    {
        $session = $event->session->fresh(['template', 'user', 'node', 'proxmoxServer']);

        // Sanity check — vm_id must be set before this listener is invoked
        if ($session->vm_id === null) {
            Log::error('CreateGuacamoleConnectionListener: vm_id is null, cannot activate session', [
                'session_id' => $session->id,
            ]);
            $session->update(['status' => VMSessionStatus::FAILED]);

            return;
        }

        // If another attempt already created a connection, do not create a duplicate
        if ($session->guacamole_connection_id !== null) {
            Log::info('CreateGuacamoleConnectionListener: connection already exists, skipping', [
                'session_id'    => $session->id,
                'connection_id' => $session->guacamole_connection_id,
            ]);

            return;
        }

        $nodeName = $session->node->name;
        $vmId     = $session->vm_id;

        try {
            // ── Step 1: check current VM status ────────────────────────────────
            $vmStatus      = $this->proxmoxClient->getVMStatus($nodeName, $vmId);
            $currentStatus = $vmStatus['status'] ?? 'stopped';

            Log::info('CreateGuacamoleConnectionListener: VM status check', [
                'session_id' => $session->id,
                'vm_id'      => $vmId,
                'status'     => $currentStatus,
            ]);

            // ── Step 2: start VM if still stopped ──────────────────────────────
            if ($currentStatus !== 'running') {
                Log::info('CreateGuacamoleConnectionListener: starting stopped VM', [
                    'session_id' => $session->id,
                    'vm_id'      => $vmId,
                    'node'       => $nodeName,
                ]);

                $this->proxmoxClient->startVM($nodeName, $vmId);
            } else {
                Log::info('CreateGuacamoleConnectionListener: VM already running, skipping startVM()', [
                    'session_id' => $session->id,
                    'vm_id'      => $vmId,
                ]);
            }

            // ── Step 3: resolve DHCP-assigned IP (polls until available) ───────
            $ipAddress = $this->ipResolver->resolveVMIP(
                server:         $session->proxmoxServer,
                nodeId:         $nodeName,
                vmId:           $vmId,
                maxWaitSeconds: 300,
            );

            // ── Step 4: persist resolved IP ────────────────────────────────────
            $session->update(['ip_address' => $ipAddress]);
            $session->refresh();

            Log::info('CreateGuacamoleConnectionListener: VM IP resolved and stored', [
                'session_id' => $session->id,
                'vm_id'      => $vmId,
                'ip_address' => $ipAddress,
            ]);

            // ── Step 5: build connection params (user prefs + sensible defaults) ─
            $params = $this->paramsBuilder->buildParams($session, $session->user);

            // ── Step 6: create connection in Guacamole ─────────────────────────
            $connectionId = $this->guacamoleClient->createConnection($params);

            // ── Step 7: persist connection ID and mark session active ──────────
            $session->update([
                'guacamole_connection_id' => $connectionId,
                'status'                  => VMSessionStatus::ACTIVE,
            ]);

            Log::info('CreateGuacamoleConnectionListener: session active with Guacamole connection', [
                'session_id'    => $session->id,
                'connection_id' => $connectionId,
                'ip_address'    => $ipAddress,
                'protocol'      => $session->template->protocol->value,
                'user_id'       => $session->user_id,
            ]);

            // TODO: Broadcast VMSessionReady via Laravel Echo with vm_ip_address
            // event(new VMSessionReady($session));

        } catch (ProxmoxApiException $e) {
            $this->handleFailure($session, 'Proxmox error during VM start or IP resolution', $e);
        } catch (GuacamoleApiException $e) {
            $this->handleFailure($session, 'Guacamole error creating connection', $e);
        } catch (\Exception $e) {
            $this->handleFailure($session, 'Unexpected error in session activation', $e);
        }
    }

    /**
     * Mark session as failed, log the error, and release the queue job.
     */
    private function handleFailure($session, string $context, \Throwable $e): void
    {
        // Mark session failed and log the error
        $session->update(['status' => VMSessionStatus::FAILED]);

        Log::error("CreateGuacamoleConnectionListener: {$context}", [
            'session_id' => $session->id,
            'user_id'    => $session->user_id,
            'vm_id'      => $session->vm_id,
            'error'      => $e->getMessage(),
        ]);

        // Notify admins so ops can investigate (non-blocking)
        try {
            $admins = \App\Models\User::where('role', \App\Enums\UserRole::ADMIN->value)->get();
            if ($admins->isNotEmpty()) {
                \Illuminate\Support\Facades\Notification::send(
                    $admins,
                    new \App\Notifications\SessionActivationFailed($session, $context, $e->getMessage())
                );
            }
        } catch (\Throwable $notifyEx) {
            // Swallow notification errors but log them — do not mask original failure
            Log::error('Failed to notify admins about session activation failure', [
                'session_id' => $session->id,
                'error' => $notifyEx->getMessage(),
            ]);
        }

        $this->fail($e);
    }
}
