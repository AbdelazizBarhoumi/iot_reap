<?php

namespace App\Services;

use App\Exceptions\ProxmoxApiException;
use App\Models\ProxmoxServer;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Service for interacting with Proxmox API.
 * Handles all API calls, retries, error handling, and logging.
 */
class ProxmoxClient implements ProxmoxClientInterface
{
    private const MAX_RETRIES = 3;
    private const RETRY_DELAYS = [10, 30, 60]; // seconds
    private const TIMEOUT = 30;

    /**
     * Create a new ProxmoxClient instance.
     */
    public function __construct(
        private readonly ProxmoxServer $server,
    ) {}

    /**
     * Get all nodes in the cluster.
     *
     * @return array<string, mixed>
     *
     * @throws ProxmoxApiException
     */
    public function getNodes(): array
    {
        $response = $this->request('GET', '/nodes');

        return $response['data'] ?? [];
    }

    /**
     * Get the status of a specific node.
     *
     * @return array<string, mixed>
     *
     * @throws ProxmoxApiException
     */
    public function getNodeStatus(string $nodeName): array
    {
        $response = $this->request('GET', "/nodes/{$nodeName}/status");

        return $response['data'] ?? [];
    }

    /**
     * Clone a template to create a new VM.
     *
     * @throws ProxmoxApiException
     */
    public function cloneTemplate(int $templateVmid, string $nodeName, ?int $newVmid = null): int
    {
        $newVmid = $newVmid ?? $this->findNextAvailableVmid($nodeName);

        $response = $this->request('POST', "/nodes/{$nodeName}/qemu/{$templateVmid}/clone", [
            'newid' => $newVmid,
            'full' => 1,
        ]);

        // Wait for the clone task to complete
        $taskId = $response['data'] ?? null;
        if ($taskId) {
            $this->pollTaskCompletion($nodeName, $taskId, 120);
        }

        return $newVmid;
    }

    /**
     * Start a VM.
     *
     * @throws ProxmoxApiException
     */
    public function startVM(string $nodeName, int $vmid): bool
    {
        $response = $this->request('POST', "/nodes/{$nodeName}/qemu/{$vmid}/status/start");

        // Once started, poll until it's actually running
        $this->pollVMStatus($nodeName, $vmid, 'running', 120);

        return true;
    }

    /**
     * Stop a VM.
     *
     * @throws ProxmoxApiException
     */
    public function stopVM(string $nodeName, int $vmid): bool
    {
        $this->request('POST', "/nodes/{$nodeName}/qemu/{$vmid}/status/stop");

        return true;
    }

    /**
     * Delete a VM.
     *
     * @throws ProxmoxApiException
     */
    public function deleteVM(string $nodeName, int $vmid): bool
    {
        $this->request('DELETE', "/nodes/{$nodeName}/qemu/{$vmid}");

        return true;
    }

    /**
     * Get VM status.
     *
     * @return array<string, mixed>
     *
     * @throws ProxmoxApiException
     */
    public function getVMStatus(string $nodeName, int $vmid): array
    {
        $response = $this->request('GET', "/nodes/{$nodeName}/qemu/{$vmid}/status/current");

        return $response['data'] ?? [];
    }

    /**
     * Get all VMs on a node (running + stopped).
     *
     * @return array<int, array<string, mixed>>
     *
     * @throws ProxmoxApiException
     */
    public function getVMs(string $nodeName): array
    {
        $response = $this->request('GET', "/nodes/{$nodeName}/qemu");
        $vms = $response['data'] ?? [];

        // Enrich each VM with additional status info
        return array_map(function ($vm) use ($nodeName) {
            $vmid = $vm['vmid'] ?? 0;

            // Get detailed status for each VM
            try {
                $status = $this->getVMStatus($nodeName, $vmid);
                $vm['cpu_usage'] = isset($status['cpu']) ? round($status['cpu'] * 100, 2) : 0;
                $vm['mem_usage'] = $status['mem'] ?? 0;
                $vm['maxmem'] = $status['maxmem'] ?? 0;
                $vm['uptime'] = $status['uptime'] ?? 0;
                $vm['pid'] = $status['pid'] ?? null;
            } catch (\Throwable $e) {
                // VM might be stopped, keep basic info
                $vm['cpu_usage'] = 0;
                $vm['mem_usage'] = 0;
                $vm['maxmem'] = $vm['maxmem'] ?? 0;
                $vm['uptime'] = 0;
            }

            return $vm;
        }, $vms);
    }

    /**
     * Reboot a VM.
     *
     * @throws ProxmoxApiException
     */
    public function rebootVM(string $nodeName, int $vmid): bool
    {
        $this->request('POST', "/nodes/{$nodeName}/qemu/{$vmid}/status/reboot");

        return true;
    }

    /**
     * Shutdown a VM gracefully.
     *
     * @throws ProxmoxApiException
     */
    public function shutdownVM(string $nodeName, int $vmid): bool
    {
        $this->request('POST', "/nodes/{$nodeName}/qemu/{$vmid}/status/shutdown");

        return true;
    }

    /**
     * Get the DHCP-assigned IPv4 address of a running VM via the QEMU guest agent.
     * Returns null when the guest agent is unavailable or DHCP has not yet responded.
     *
     * Proxmox endpoint: GET /nodes/{node}/qemu/{vmid}/agent/network-get-interfaces
     *
     * @throws ProxmoxApiException
     */
    public function getVMNetworkIP(string $nodeName, int $vmid): ?string
    {
        $response = $this->request('GET', "/nodes/{$nodeName}/qemu/{$vmid}/agent/network-get-interfaces");
        $interfaces = $response['data']['result'] ?? [];

        foreach ($interfaces as $iface) {
            // Skip loopback
            if (($iface['name'] ?? '') === 'lo') {
                continue;
            }

            foreach ($iface['ip-addresses'] ?? [] as $addrEntry) {
                if (($addrEntry['ip-address-type'] ?? '') !== 'ipv4') {
                    continue;
                }

                $ip = $addrEntry['ip-address'] ?? '';

                // Skip link-local (169.254.x.x) and loopback (127.x.x.x)
                if (str_starts_with($ip, '169.254.') || str_starts_with($ip, '127.')) {
                    continue;
                }

                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
                    return $ip;
                }
            }
        }

        return null;
    }

    /**
     * Execute an HTTP request to the Proxmox API with retry logic.
     *
     * @param array<string, mixed> $data
     *
     * @return array<string, mixed>
     *
     * @throws ProxmoxApiException
     */
    private function request(string $method, string $endpoint, array $data = []): array
    {
        $url = $this->server->getApiUrl() . $endpoint;
        $tokenAuth = "{$this->server->token_id}={$this->server->token_secret}";

        Log::debug("ProxmoxClient request", [
            'method' => $method,
            'endpoint' => $endpoint,
            'server' => $this->server->name,
        ]);

        for ($attempt = 0; $attempt < self::MAX_RETRIES; $attempt++) {
            try {
                $http = Http::withHeaders([
                    'Authorization' => "PVEAPIToken={$tokenAuth}",
                ])
                    ->timeout(self::TIMEOUT)
                    ->withoutVerifying(); // Ignore self-signed certs

                // Use asForm for POST/PUT/DELETE requests
                if (in_array($method, ['POST', 'PUT', 'DELETE'])) {
                    $http = $http->asForm();
                }

                // Execute the request with data for POST/PUT, without for GET/DELETE
                $response = match (strtoupper($method)) {
                    'GET' => $http->get($url, $data),
                    'POST' => $http->post($url, $data),
                    'PUT' => $http->put($url, $data),
                    'DELETE' => $http->delete($url, $data),
                    default => throw new ProxmoxApiException("Unsupported HTTP method: {$method}"),
                };

                if (!$response->successful()) {
                    throw new ProxmoxApiException(
                        "Proxmox API error: {$response->status()} - {$response->body()}"
                    );
                }

                return $response->json();
            } catch (Throwable $e) {
                $isTransient = $this->isTransientError($e);

                Log::debug("ProxmoxClient attempt failed", [
                    'attempt' => $attempt + 1,
                    'max_retries' => self::MAX_RETRIES,
                    'error' => $e->getMessage(),
                    'transient' => $isTransient,
                ]);

                // If not transient or this is the last attempt, throw immediately
                if (!$isTransient || $attempt === self::MAX_RETRIES - 1) {
                    throw new ProxmoxApiException(
                        "Failed to call Proxmox API at {$endpoint}: {$e->getMessage()}",
                        previous: $e
                    );
                }

                // Wait before retrying
                $delay = self::RETRY_DELAYS[$attempt];
                Log::debug("ProxmoxClient retrying", ['delay_seconds' => $delay]);
                sleep($delay);
            }
        }

        throw new ProxmoxApiException("Proxmox API request failed after " . self::MAX_RETRIES . " attempts");
    }

    /**
     * Check if an error is transient (should trigger a retry).
     */
    private function isTransientError(Throwable $e): bool
    {
        $message = strtolower($e->getMessage());

        // Connection timeouts are transient
        if (str_contains($message, 'timeout') || str_contains($message, 'connection')) {
            return true;
        }

        // HTTP 5XX errors are transient
        if (str_contains($message, '50') || str_contains($message, '503')) {
            return true;
        }

        return false;
    }

    /**
     * Poll a task until it completes.
     *
     * @throws ProxmoxApiException
     */
    private function pollTaskCompletion(string $nodeName, string $taskId, int $timeoutSeconds): void
    {
        $endTime = now()->addSeconds($timeoutSeconds);

        while (now()->isBefore($endTime)) {
            try {
                $status = $this->request('GET', "/nodes/{$nodeName}/tasks/{$taskId}/status");
                $data = $status['data'] ?? [];

                if (($data['exitstatus'] ?? null) === 'OK') {
                    Log::debug("ProxmoxClient task completed", ['task_id' => $taskId]);

                    return;
                }

                if (!empty($data['exitstatus']) && $data['exitstatus'] !== 'OK') {
                    throw new ProxmoxApiException(
                        "Proxmox task {$taskId} failed: {$data['exitstatus']}"
                    );
                }

                // Still running, wait and retry
                sleep(5);
            } catch (ProxmoxApiException $e) {
                throw $e;
            } catch (Throwable $e) {
                Log::warning("Error polling task status", ['error' => $e->getMessage()]);
                sleep(5);
            }
        }

        throw new ProxmoxApiException("Proxmox task {$taskId} did not complete within {$timeoutSeconds} seconds");
    }

    /**
     * Poll VM status until it reaches the desired state.
     *
     * @throws ProxmoxApiException
     */
    private function pollVMStatus(string $nodeName, int $vmid, string $desiredStatus, int $timeoutSeconds): void
    {
        $endTime = now()->addSeconds($timeoutSeconds);

        while (now()->isBefore($endTime)) {
            try {
                $status = $this->getVMStatus($nodeName, $vmid);
                $currentStatus = $status['status'] ?? null;

                if ($currentStatus === $desiredStatus) {
                    Log::debug("ProxmoxClient VM reached desired status", [
                        'vmid' => $vmid,
                        'status' => $desiredStatus,
                    ]);

                    return;
                }

                // Still transitioning, wait and retry
                sleep(5);
            } catch (Throwable $e) {
                Log::warning("Error polling VM status", ['error' => $e->getMessage()]);
                sleep(5);
            }
        }

        throw new ProxmoxApiException(
            "VM {$vmid} did not reach status '{$desiredStatus}' within {$timeoutSeconds} seconds"
        );
    }

    /**
     * Find the next available VMID for the node.
     */
    private function findNextAvailableVmid(string $nodeName): int
    {
        try {
            $vms = $this->request('GET', "/nodes/{$nodeName}/qemu");
            $vmids = array_map(fn($vm) => $vm['vmid'] ?? 0, $vms['data'] ?? []);

            // Start searching from 200 (user VMs), avoid templates (100-199)
            $nextId = 200;
            while (in_array($nextId, $vmids, true)) {
                $nextId++;
            }

            Log::debug("Found next available VMID", ['node' => $nodeName, 'vmid' => $nextId]);

            return $nextId;
        } catch (Throwable $e) {
            Log::error("Failed to find next available VMID", ['error' => $e->getMessage()]);

            throw new ProxmoxApiException("Cannot determine available VMID: {$e->getMessage()}");
        }
    }
}
