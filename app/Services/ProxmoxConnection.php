<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Service for testing Proxmox server connections.
 * Validates credentials and connectivity before saving server configuration.
 */
class ProxmoxConnection
{
    private const TIMEOUT = 10;

    /**
     * Test a connection to a Proxmox server.
     * Does NOT require a ProxmoxServer model; works with raw credentials.
     *
     * @param  string  $host         The Proxmox server hostname or IP
     * @param  int     $port         The Proxmox API port (typically 8006)
     * @param  string|null  $realmPassword  Optional realm password (not API token)
     * @param  string  $tokenId      API token ID (format: user@realm!api-token-name)
     * @param  string  $tokenSecret  API token secret
     * @param  bool    $verifySsl    Whether to verify SSL certificate
     *
     * @return array<string, mixed> {success: bool, error?: string, nodes?: array}
     */
    public function testConnection(
        string $host,
        int $port,
        ?string $realmPassword = null,
        string $tokenId = '',
        string $tokenSecret = '',
        bool $verifySsl = true,
    ): array {
        try {
            $protocol = 'https';
            $url = "{$protocol}://{$host}:{$port}/api2/json/nodes";
            $token = "{$tokenId}:{$tokenSecret}";

            Log::debug('ProxmoxConnection: Testing connection', [
                'host' => $host,
                'port' => $port,
            ]);

            // Make the test request
            $response = Http::withToken($token)
                ->timeout(self::TIMEOUT)
                ->verifyPeer($verifySsl)
                ->get($url);

            // Check if successful
            if (!$response->successful()) {
                $errorBody = $response->body();
                $errorMsg = "HTTP {$response->status()}";

                if (!empty($errorBody)) {
                    // Try to extract error message from JSON
                    $json = @json_decode($errorBody, true);
                    if (is_array($json) && isset($json['error'])) {
                        $errorMsg = $json['error'];
                    }
                }

                Log::warning('ProxmoxConnection: Connection test failed', [
                    'host' => $host,
                    'status' => $response->status(),
                    'error' => $errorMsg,
                ]);

                return [
                    'success' => false,
                    'error' => $errorMsg,
                ];
            }

            // Parse and return the nodes
            $data = $response->json('data', []);
            $nodes = array_map(function ($node) {
                return [
                    'node' => $node['node'] ?? null,
                    'status' => $node['status'] ?? 'unknown',
                    'uptime' => $node['uptime'] ?? null,
                ];
            }, is_array($data) ? $data : []);

            Log::info('ProxmoxConnection: Connection test successful', [
                'host' => $host,
                'nodes_count' => count($nodes),
            ]);

            return [
                'success' => true,
                'nodes' => $nodes,
            ];
        } catch (\Exception $e) {
            $errorMsg = $e->getMessage();

            Log::warning('ProxmoxConnection: Connection test exception', [
                'host' => $host,
                'error' => $errorMsg,
            ]);

            // Provide user-friendly error messages
            if (str_contains($errorMsg, 'timeout') || str_contains($errorMsg, 'connect')) {
                $errorMsg = 'Connection timeout. Check host and port.';
            } elseif (str_contains($errorMsg, 'certificate')) {
                $errorMsg = 'SSL certificate verification failed. Try disabling SSL verification.';
            }

            return [
                'success' => false,
                'error' => $errorMsg,
            ];
        }
    }
}
