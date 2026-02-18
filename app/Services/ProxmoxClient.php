<?php

namespace App\Services;

use App\Exceptions\ProxmoxApiException;
use GuzzleHttp\Client as HttpClient;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ProxmoxClient implements ProxmoxClientInterface
{
    private HttpClient $httpClient;

    private string $baseUrl;

    private string $tokenId;

    private string $tokenSecret;

    private bool $verifySsl;

    private int $timeout;

    public function __construct()
    {
        $this->baseUrl = 'https://' . config('proxmox.host') . ':' . config('proxmox.port') . '/api2/json';
        $this->tokenId = config('proxmox.token_id');
        $this->tokenSecret = config('proxmox.token_secret');
        $this->verifySsl = config('proxmox.verify_ssl', true);
        $this->timeout = config('proxmox.timeout', 30);

        $this->httpClient = new HttpClient([
            'base_uri' => $this->baseUrl,
            'timeout' => $this->timeout,
            'verify' => $this->verifySsl,
        ]);
    }

    /**
     * Get all nodes in the cluster.
     *
     * @throws ProxmoxApiException
     */
    public function getNodes(): array
    {
        return $this->get('/nodes');
    }

    /**
     * Get status and statistics for a specific node.
     *
     * @throws ProxmoxApiException
     */
    public function getNodeStatus(string $node): array
    {
        return $this->get("/nodes/{$node}/status");
    }

    /**
     * Clone a VM template to create a new VM.
     *
     * @throws ProxmoxApiException
     */
    public function cloneTemplate(int $templateVmid, string $node, string $newVmid, string $newName = null): int
    {
        $data = [
            'newid' => $newVmid,
            'name' => $newName ?? "clone-{$newVmid}",
        ];

        $result = $this->post("/nodes/{$node}/qemu/{$templateVmid}/clone", $data);

        // The clone operation returns a task ID; we need to get the actual VMID
        if (isset($result['data'])) {
            return (int) $newVmid;
        }

        throw ProxmoxApiException::fromProxmoxError('Clone operation failed to return expected data', $result);
    }

    /**
     * Start a VM.
     *
     * @throws ProxmoxApiException
     */
    public function startVM(string $node, int $vmid): void
    {
        $this->post("/nodes/{$node}/qemu/{$vmid}/status/start", []);
    }

    /**
     * Stop a VM gracefully.
     *
     * @throws ProxmoxApiException
     */
    public function stopVM(string $node, int $vmid): void
    {
        $this->post("/nodes/{$node}/qemu/{$vmid}/status/stop", []);
    }

    /**
     * Delete a VM.
     *
     * @throws ProxmoxApiException
     */
    public function deleteVM(string $node, int $vmid): void
    {
        $this->delete("/nodes/{$node}/qemu/{$vmid}");
    }

    /**
     * Get the status of a VM.
     *
     * @throws ProxmoxApiException
     */
    public function getVMStatus(string $node, int $vmid): array
    {
        return $this->get("/nodes/{$node}/qemu/{$vmid}/status/current");
    }

    /**
     * Get current VM stats (CPU, memory, network).
     *
     * @throws ProxmoxApiException
     */
    public function getVMStats(string $node, int $vmid): array
    {
        return $this->get("/nodes/{$node}/qemu/{$vmid}/status/current");
    }

    /**
     * Perform a GET request with retry logic.
     *
     * @throws ProxmoxApiException
     */
    private function get(string $endpoint): array
    {
        return $this->request('GET', $endpoint);
    }

    /**
     * Perform a POST request with retry logic.
     *
     * @throws ProxmoxApiException
     */
    private function post(string $endpoint, array $data): mixed
    {
        return $this->request('POST', $endpoint, $data);
    }

    /**
     * Perform a DELETE request with retry logic.
     *
     * @throws ProxmoxApiException
     */
    private function delete(string $endpoint): void
    {
        $this->request('DELETE', $endpoint);
    }

    /**
     * Execute HTTP request with exponential backoff retry logic.
     *
     * @throws ProxmoxApiException
     */
    private function request(string $method, string $endpoint, array $data = []): mixed
    {
        $maxAttempts = config('proxmox.retry_attempts', 3);
        $delayInitial = config('proxmox.retry_delay_initial', 10);
        $delayMultiplier = config('proxmox.retry_delay_multiplier', 3);

        $lastException = null;

        for ($attempt = 1; $attempt <= $maxAttempts; $attempt++) {
            try {
                $startTime = microtime(true);

                $options = [
                    'headers' => $this->getAuthHeaders(),
                ];

                if (! empty($data)) {
                    $options['form_params'] = $data;
                }

                $response = $this->httpClient->request($method, $endpoint, $options);
                $duration = microtime(true) - $startTime;

                $body = json_decode($response->getBody()->getContents(), true);

                Log::debug("Proxmox API request", [
                    'method' => $method,
                    'endpoint' => $endpoint,
                    'attempt' => $attempt,
                    'duration' => round($duration, 3),
                ]);

                // Check for errors in response (Proxmox returns 200 with errors in body)
                if (isset($body['errors']) || isset($body['error'])) {
                    throw ProxmoxApiException::fromProxmoxError(
                        $body['error'] ?? $body['errors'],
                        $body
                    );
                }

                return $body['data'] ?? $body;

            } catch (GuzzleException $e) {
                $lastException = $e;

                $statusCode = $e->getResponse()?->getStatusCode();
                $isRetryable = $statusCode && in_array($statusCode, [429, 503, 504, 408]);

                if (! $isRetryable || $attempt === $maxAttempts) {
                    Log::error("Proxmox API failed after {$maxAttempts} attempts", [
                        'method' => $method,
                        'endpoint' => $endpoint,
                        'status_code' => $statusCode,
                        'error' => $e->getMessage(),
                    ]);

                    throw ProxmoxApiException::fromNetworkError(
                        $e->getMessage(),
                        $e
                    );
                }

                // Exponential backoff before retry
                $delay = $delayInitial * pow($delayMultiplier, $attempt - 1);
                Log::warning("Proxmox API attempt {$attempt} failed, retrying in {$delay}s", [
                    'status_code' => $statusCode,
                ]);
                sleep($delay);

            } catch (ProxmoxApiException $e) {
                $lastException = $e;

                if (! $e->isRetryable() || $attempt === $maxAttempts) {
                    throw $e;
                }

                // Exponential backoff before retry
                $delay = $delayInitial * pow($delayMultiplier, $attempt - 1);
                Log::warning("Proxmox API attempt {$attempt} failed, retrying in {$delay}s");
                sleep($delay);
            }
        }

        throw $lastException ?? ProxmoxApiException::fromNetworkError('Unknown error');
    }

    /**
     * Get authorization headers for Proxmox API.
     */
    private function getAuthHeaders(): array
    {
        return [
            'Authorization' => "PVEAPIToken={$this->tokenId}:{$this->tokenSecret}",
        ];
    }
}
