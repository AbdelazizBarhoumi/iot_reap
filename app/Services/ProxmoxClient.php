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

    private const RETRY_DELAYS = [2, 5, 10]; // seconds — total worst-case ~45 s, under PHP's 60 s max_execution_time

    private const TIMEOUT = 10;

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
     * @deprecated Unused - current architecture uses pre-existing VMs with snapshots instead of cloning. Candidate for removal.
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
            } catch (Throwable $e) {
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
     * List all snapshots of a VM.
     *
     * Proxmox endpoint: GET /nodes/{node}/qemu/{vmid}/snapshot
     *
     * @return array<int, array{name: string, description: string, snaptime?: int, parent?: string}>
     *
     * @throws ProxmoxApiException
     */
    public function listSnapshots(string $nodeName, int $vmid): array
    {
        $response = $this->request('GET', "/nodes/{$nodeName}/qemu/{$vmid}/snapshot");
        $snapshots = $response['data'] ?? [];

        // Filter out the 'current' pseudo-snapshot that Proxmox always returns
        return array_values(array_filter($snapshots, function ($snap) {
            return ($snap['name'] ?? '') !== 'current';
        }));
    }

    /**
     * Revert a VM to a named snapshot.
     *
     * Proxmox endpoint: POST /nodes/{node}/qemu/{vmid}/snapshot/{snapname}/rollback
     *
     * @throws ProxmoxApiException
     */
    public function revertSnapshot(string $nodeName, int $vmid, string $snapshotName): bool
    {
        $response = $this->request(
            'POST',
            "/nodes/{$nodeName}/qemu/{$vmid}/snapshot/{$snapshotName}/rollback",
        );

        // Wait for the rollback task to complete
        $taskId = $response['data'] ?? null;
        if ($taskId) {
            $this->pollTaskCompletion($nodeName, $taskId, 120);
        }

        return true;
    }

    /**
     * List VMs on a node without per-VM status enrichment (lightweight).
     * Uses only the /nodes/{node}/qemu list — no N+1 status calls.
     *
     * @return array<int, array<string, mixed>>
     *
     * @throws ProxmoxApiException
     */
    public function listVMsLight(string $nodeName): array
    {
        $response = $this->request('GET', "/nodes/{$nodeName}/qemu");

        return $response['data'] ?? [];
    }

    /**
     * Get all LXC containers on a node.
     *
     * Proxmox endpoint: GET /nodes/{node}/lxc
     *
     * @return array<int, array<string, mixed>>
     *
     * @throws ProxmoxApiException
     */
    public function getContainers(string $nodeName): array
    {
        $response = $this->request('GET', "/nodes/{$nodeName}/lxc");

        return $response['data'] ?? [];
    }

    /**
     * Get the IPv4 address of an LXC container.
     * Uses /nodes/{node}/lxc/{vmid}/interfaces endpoint.
     *
     * @return string|null The IP address or null if not available
     *
     * @throws ProxmoxApiException
     */
    public function getContainerNetworkIP(string $nodeName, int $vmid): ?string
    {
        try {
            $response = $this->request('GET', "/nodes/{$nodeName}/lxc/{$vmid}/interfaces");
            $interfaces = $response['data'] ?? [];

            foreach ($interfaces as $iface) {
                // Skip loopback
                if (($iface['name'] ?? '') === 'lo') {
                    continue;
                }

                $ip = $iface['inet'] ?? null;
                if ($ip) {
                    // Remove CIDR notation if present (e.g., "192.168.50.6/24" -> "192.168.50.6")
                    $ip = explode('/', $ip)[0];

                    // Skip link-local and loopback
                    if (str_starts_with($ip, '169.254.') || str_starts_with($ip, '127.')) {
                        continue;
                    }

                    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
                        return $ip;
                    }
                }
            }

            return null;
        } catch (Throwable $e) {
            Log::warning('Failed to get container network IP', [
                'node' => $nodeName,
                'vmid' => $vmid,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Get container configuration.
     *
     * Proxmox endpoint: GET /nodes/{node}/lxc/{vmid}/config
     *
     * @deprecated Unused - container config not needed in current architecture. Candidate for removal.
     *
     * @return array<string, mixed>
     *
     * @throws ProxmoxApiException
     */
    public function getContainerConfig(string $nodeName, int $vmid): array
    {
        $response = $this->request('GET', "/nodes/{$nodeName}/lxc/{$vmid}/config");

        return $response['data'] ?? [];
    }

    /**
     * Execute a command inside a VM via the QEMU guest agent.
     *
     * Proxmox endpoint: POST /nodes/{node}/qemu/{vmid}/agent/exec
     *
     * NOTE: The guest agent (qemu-guest-agent) must be installed and running
     * in the VM for this to work. The command runs asynchronously; use
     * getExecStatus() to poll for completion.
     *
     * @param  string  $nodeName  The node name where the VM is running
     * @param  int  $vmid  The VM ID
     * @param  string  $command  The command to execute (e.g., "usbip attach -r 192.168.1.100 -b 1-1")
     * @param  int  $timeout  Unused (kept for interface compatibility). Polling timeout is handled in execInVmAndWait.
     * @return array{pid: int} Returns the process ID of the executed command
     *
     * @throws ProxmoxApiException If guest agent is not responding or the request fails
     */
    public function execInVm(string $nodeName, int $vmid, string $command, int $timeout = 60): array
    {
        Log::debug('ProxmoxClient execInVm', [
            'node' => $nodeName,
            'vmid' => $vmid,
            'command' => $command,
        ]);

        try {
            // Proxmox agent/exec only accepts 'command' and optionally 'input-data'
            // The command is passed as a single string - Proxmox will parse it
            $response = $this->request('POST', "/nodes/{$nodeName}/qemu/{$vmid}/agent/exec", [
                'command' => $command,
            ]);

            $pid = $response['data']['pid'] ?? null;

            if ($pid === null) {
                throw new ProxmoxApiException(
                    'Guest agent did not return PID for command execution'
                );
            }

            Log::debug('ProxmoxClient execInVm started', [
                'node' => $nodeName,
                'vmid' => $vmid,
                'pid' => $pid,
            ]);

            return ['pid' => (int) $pid];
        } catch (ProxmoxApiException $e) {
            throw $e;
        } catch (Throwable $e) {
            throw new ProxmoxApiException(
                "Failed to execute command in VM via guest agent: {$e->getMessage()}",
                previous: $e
            );
        }
    }

    /**
     * Get the result of a command executed via guest agent.
     *
     * Proxmox endpoint: GET /nodes/{node}/qemu/{vmid}/agent/exec-status?pid={pid}
     *
     * @internal Used internally by execInVmAndWait(). Prefer execInVmAndWait() for external use.
     *
     * @param  string  $nodeName  The node name where the VM is running
     * @param  int  $vmid  The VM ID
     * @param  int  $pid  The process ID returned by execInVm()
     * @return array{exited: bool, exitcode?: int, out-data?: string, err-data?: string}
     *
     * @throws ProxmoxApiException If the request fails
     */
    public function getExecStatus(string $nodeName, int $vmid, int $pid): array
    {
        $response = $this->request('GET', "/nodes/{$nodeName}/qemu/{$vmid}/agent/exec-status", [
            'pid' => $pid,
        ]);

        return $response['data'] ?? [];
    }

    /**
     * Execute a command inside a VM and wait for completion.
     *
     * This is a convenience method that combines execInVm() and getExecStatus()
     * with polling until the command finishes.
     *
     * @param  string  $nodeName  The node name where the VM is running
     * @param  int  $vmid  The VM ID
     * @param  string  $command  The command to execute
     * @param  int  $timeoutSeconds  Maximum time to wait for command completion
     * @return array{exitcode: int, out-data?: string, err-data?: string, success: bool}
     *
     * @throws ProxmoxApiException If guest agent is unavailable or command execution fails
     */
    public function execInVmAndWait(string $nodeName, int $vmid, string $command, int $timeoutSeconds = 60): array
    {
        $execResult = $this->execInVm($nodeName, $vmid, $command, $timeoutSeconds);
        $pid = $execResult['pid'];

        $endTime = now()->addSeconds($timeoutSeconds);
        $pollInterval = 2; // seconds

        while (now()->isBefore($endTime)) {
            $status = $this->getExecStatus($nodeName, $vmid, $pid);

            if (! empty($status['exited'])) {
                $exitCode = $status['exitcode'] ?? -1;

                Log::debug('ProxmoxClient execInVmAndWait completed', [
                    'node' => $nodeName,
                    'vmid' => $vmid,
                    'pid' => $pid,
                    'exitcode' => $exitCode,
                    'out' => $status['out-data'] ?? '',
                    'err' => $status['err-data'] ?? '',
                ]);

                return [
                    'exitcode' => $exitCode,
                    'out-data' => $status['out-data'] ?? '',
                    'err-data' => $status['err-data'] ?? '',
                    'success' => $exitCode === 0,
                ];
            }

            sleep($pollInterval);
        }

        throw new ProxmoxApiException(
            "Command execution in VM timed out after {$timeoutSeconds} seconds"
        );
    }

    /**
     * Write a file inside a VM via the QEMU guest agent.
     *
     * Uses the Proxmox guest agent file-write endpoint to create or overwrite a file.
     * Useful for creating batch/script files that can then be executed via execInVm().
     *
     * Proxmox endpoint: POST /nodes/{node}/qemu/{vmid}/agent/file-write
     *
     * @param  string  $nodeName  The node name where the VM is running
     * @param  int  $vmid  The VM ID
     * @param  string  $filePath  The file path inside the VM
     * @param  string  $content  The content to write to the file
     *
     * @throws ProxmoxApiException If guest agent is not responding or the request fails
     */
    public function writeFileInVm(string $nodeName, int $vmid, string $filePath, string $content): void
    {
        Log::debug('ProxmoxClient writeFileInVm', [
            'node' => $nodeName,
            'vmid' => $vmid,
            'file' => $filePath,
            'content_length' => strlen($content),
        ]);

        $this->request('POST', "/nodes/{$nodeName}/qemu/{$vmid}/agent/file-write", [
            'file' => $filePath,
            'content' => $content,
        ]);

        Log::debug('ProxmoxClient writeFileInVm completed', [
            'node' => $nodeName,
            'vmid' => $vmid,
            'file' => $filePath,
        ]);
    }

    /**
     * Get the guest OS type from the QEMU guest agent.
     *
     * Queries the guest agent's get-osinfo endpoint and returns a simplified type.
     * Returns 'windows', 'linux', or 'unknown'.
     *
     * @param  string  $nodeName  The node name where the VM is running
     * @param  int  $vmid  The VM ID
     * @return string 'windows' | 'linux' | 'unknown'
     *
     * @throws ProxmoxApiException If the guest agent is not responding
     */
    public function getGuestOsType(string $nodeName, int $vmid): string
    {
        Log::debug('ProxmoxClient getGuestOsType', [
            'node' => $nodeName,
            'vmid' => $vmid,
        ]);

        try {
            $response = $this->request('GET', "/nodes/{$nodeName}/qemu/{$vmid}/agent/get-osinfo");

            $osInfo = $response['data']['result'] ?? [];

            // The Proxmox API returns various fields, including:
            // - kernel: e.g. "Windows Server 2019" or "Linux"
            // - name: e.g. "Microsoft Windows 10 Enterprise" or "Debian GNU/Linux"
            // - id: e.g. "mswindows" or "debian"
            // - version-id: e.g. "10" or "11"

            $id = strtolower($osInfo['id'] ?? '');
            $name = strtolower($osInfo['name'] ?? '');
            $kernel = strtolower($osInfo['kernel'] ?? '');

            // Check for Windows
            if (str_contains($id, 'mswindows') ||
                str_contains($id, 'windows') ||
                str_contains($name, 'windows') ||
                str_contains($kernel, 'windows')
            ) {
                Log::debug('ProxmoxClient getGuestOsType detected Windows', [
                    'node' => $nodeName,
                    'vmid' => $vmid,
                    'osInfo' => $osInfo,
                ]);

                return 'windows';
            }

            // Check for Linux (most common distributions)
            if (str_contains($id, 'debian') ||
                str_contains($id, 'ubuntu') ||
                str_contains($id, 'centos') ||
                str_contains($id, 'fedora') ||
                str_contains($id, 'rhel') ||
                str_contains($id, 'alpine') ||
                str_contains($id, 'arch') ||
                str_contains($name, 'linux') ||
                str_contains($kernel, 'linux')
            ) {
                Log::debug('ProxmoxClient getGuestOsType detected Linux', [
                    'node' => $nodeName,
                    'vmid' => $vmid,
                    'osInfo' => $osInfo,
                ]);

                return 'linux';
            }

            Log::warning('ProxmoxClient getGuestOsType could not determine OS', [
                'node' => $nodeName,
                'vmid' => $vmid,
                'osInfo' => $osInfo,
            ]);

            return 'unknown';
        } catch (ProxmoxApiException $e) {
            Log::warning('ProxmoxClient getGuestOsType failed', [
                'node' => $nodeName,
                'vmid' => $vmid,
                'error' => $e->getMessage(),
            ]);

            // Return unknown if guest agent is not available
            return 'unknown';
        }
    }

    /**
     * Execute an HTTP request to the Proxmox API with retry logic.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     *
     * @throws ProxmoxApiException
     */
    private function request(string $method, string $endpoint, array $data = []): array
    {
        $url = $this->server->getApiUrl().$endpoint;
        $tokenAuth = "{$this->server->token_id}={$this->server->token_secret}";

        Log::debug('ProxmoxClient request', [
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

                if (! $response->successful()) {
                    throw new ProxmoxApiException(
                        "Proxmox API error: {$response->status()} - {$response->body()}"
                    );
                }

                return $response->json();
            } catch (Throwable $e) {
                $isTransient = $this->isTransientError($e);

                Log::debug('ProxmoxClient attempt failed', [
                    'attempt' => $attempt + 1,
                    'max_retries' => self::MAX_RETRIES,
                    'error' => $e->getMessage(),
                    'transient' => $isTransient,
                ]);

                // If not transient or this is the last attempt, throw immediately
                if (! $isTransient || $attempt === self::MAX_RETRIES - 1) {
                    throw new ProxmoxApiException(
                        "Failed to call Proxmox API at {$endpoint}: {$e->getMessage()}",
                        previous: $e
                    );
                }

                // Wait before retrying
                $delay = self::RETRY_DELAYS[$attempt];
                Log::debug('ProxmoxClient retrying', ['delay_seconds' => $delay]);
                sleep($delay);
            }
        }

        throw new ProxmoxApiException('Proxmox API request failed after '.self::MAX_RETRIES.' attempts');
    }

    /**
     * Check if an error is transient (should trigger a retry).
     *
     * Connection-refused / unreachable errors are NOT retried because the server
     * is down and retrying will only waste time until PHP's max_execution_time is
     * exceeded.  Only request timeouts and HTTP 5xx responses are considered transient.
     */
    private function isTransientError(Throwable $e): bool
    {
        $message = strtolower($e->getMessage());

        // Guest-agent execution/argument parsing issues are deterministic
        // and retrying them only adds delay/noise.
        if (str_contains($message, 'failed to execute child process') ||
            str_contains($message, 'invalid argument')
        ) {
            return false;
        }

        // Connection refused / unreachable — server is down, don't retry
        if (str_contains($message, 'connection refused')
            || str_contains($message, 'could not resolve')
            || str_contains($message, 'network is unreachable')
            || str_contains($message, 'no route to host')
        ) {
            return false;
        }

        // Request timeouts are transient (server alive but slow)
        if (str_contains($message, 'timeout') || str_contains($message, 'timed out')) {
            return true;
        }

        // HTTP 5xx errors are transient
        if (str_contains($message, '500') || str_contains($message, '502')
            || str_contains($message, '503') || str_contains($message, '504')
        ) {
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
                    Log::debug('ProxmoxClient task completed', ['task_id' => $taskId]);

                    return;
                }

                if (! empty($data['exitstatus']) && $data['exitstatus'] !== 'OK') {
                    throw new ProxmoxApiException(
                        "Proxmox task {$taskId} failed: {$data['exitstatus']}"
                    );
                }

                // Still running, wait and retry
                sleep(5);
            } catch (ProxmoxApiException $e) {
                throw $e;
            } catch (Throwable $e) {
                Log::warning('Error polling task status', ['error' => $e->getMessage()]);
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
                    Log::debug('ProxmoxClient VM reached desired status', [
                        'vmid' => $vmid,
                        'status' => $desiredStatus,
                    ]);

                    return;
                }

                // Still transitioning, wait and retry
                sleep(5);
            } catch (Throwable $e) {
                Log::warning('Error polling VM status', ['error' => $e->getMessage()]);
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
            $vmids = array_map(fn ($vm) => $vm['vmid'] ?? 0, $vms['data'] ?? []);

            // Start searching from 200 (user VMs), avoid templates (100-199)
            $nextId = 200;
            while (in_array($nextId, $vmids, true)) {
                $nextId++;
            }

            Log::debug('Found next available VMID', ['node' => $nodeName, 'vmid' => $nextId]);

            return $nextId;
        } catch (Throwable $e) {
            Log::error('Failed to find next available VMID', ['error' => $e->getMessage()]);

            throw new ProxmoxApiException("Cannot determine available VMID: {$e->getMessage()}");
        }
    }
}
