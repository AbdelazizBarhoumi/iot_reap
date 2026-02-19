<?php

namespace App\Services;

use App\Enums\ProxmoxNodeStatus;
use App\Models\ProxmoxNode;
use App\Models\ProxmoxServer;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Service for synchronizing Proxmox nodes from server API.
 * Discovers nodes via API and creates/updates database records.
 */
class ProxmoxNodeSyncService
{
    private const TIMEOUT = 15;

    /**
     * Sync nodes from a Proxmox server.
     * Creates new nodes, updates existing ones, marks offline.
     *
     * @return array{synced: int, created: int, updated: int, errors: array}
     */
    public function syncNodes(ProxmoxServer $server): array
    {
        $result = [
            'synced' => 0,
            'created' => 0,
            'updated' => 0,
            'errors' => [],
        ];

        try {
            // Get nodes from Proxmox API
            $nodesData = $this->fetchNodesFromApi($server);

            if ($nodesData === null) {
                $result['errors'][] = 'Failed to fetch nodes from Proxmox API';
                return $result;
            }

            // Track which nodes we've seen (to mark missing ones as offline)
            $seenNodeNames = [];

            foreach ($nodesData as $nodeInfo) {
                $nodeName = $nodeInfo['node'] ?? null;
                if (!$nodeName) {
                    continue;
                }

                $seenNodeNames[] = $nodeName;

                // Map Proxmox status to our enum
                $status = $this->mapStatus($nodeInfo['status'] ?? 'unknown');

                // Find or create node
                $node = ProxmoxNode::where('name', $nodeName)->first();

                if ($node) {
                    // Update existing node
                    $node->update([
                        'proxmox_server_id' => $server->id,
                        'status' => $status,
                        'hostname' => $server->host,
                        'api_url' => "https://{$server->host}:{$server->port}/api2/json",
                    ]);
                    $result['updated']++;
                } else {
                    // Create new node
                    ProxmoxNode::create([
                        'name' => $nodeName,
                        'hostname' => $server->host,
                        'api_url' => "https://{$server->host}:{$server->port}/api2/json",
                        'status' => $status,
                        'max_vms' => 50,
                        'proxmox_server_id' => $server->id,
                    ]);
                    $result['created']++;
                }
                $result['synced']++;
            }

            // Mark nodes not seen as offline (only for this server)
            ProxmoxNode::where('proxmox_server_id', $server->id)
                ->whereNotIn('name', $seenNodeNames)
                ->update(['status' => ProxmoxNodeStatus::OFFLINE]);

            Log::info('ProxmoxNodeSyncService: Nodes synced', [
                'server_id' => $server->id,
                'server_name' => $server->name,
                'synced' => $result['synced'],
                'created' => $result['created'],
                'updated' => $result['updated'],
            ]);

        } catch (\Exception $e) {
            Log::error('ProxmoxNodeSyncService: Sync failed', [
                'server_id' => $server->id,
                'error' => $e->getMessage(),
            ]);
            $result['errors'][] = $e->getMessage();
        }

        return $result;
    }

    /**
     * Sync nodes for all active servers.
     *
     * @return array<int, array>
     */
    public function syncAllServers(): array
    {
        $results = [];

        $servers = ProxmoxServer::where('is_active', true)->get();

        foreach ($servers as $server) {
            $results[$server->id] = [
                'name' => $server->name,
                'result' => $this->syncNodes($server),
            ];
        }

        return $results;
    }

    /**
     * Fetch nodes from Proxmox API.
     *
     * @return array|null
     */
    private function fetchNodesFromApi(ProxmoxServer $server): ?array
    {
        try {
            $url = "https://{$server->host}:{$server->port}/api2/json/nodes";
            $tokenAuth = "{$server->token_id}={$server->token_secret}";

            $httpClient = Http::withHeaders([
                'Authorization' => "PVEAPIToken={$tokenAuth}",
            ])->timeout(self::TIMEOUT);

            if (!$server->verify_ssl) {
                $httpClient = $httpClient->withoutVerifying();
            }

            $response = $httpClient->get($url);

            if (!$response->successful()) {
                Log::warning('ProxmoxNodeSyncService: API request failed', [
                    'server_id' => $server->id,
                    'status' => $response->status(),
                ]);
                return null;
            }

            return $response->json('data', []);

        } catch (\Exception $e) {
            Log::error('ProxmoxNodeSyncService: API exception', [
                'server_id' => $server->id,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Map Proxmox status string to our enum.
     */
    private function mapStatus(string $proxmoxStatus): ProxmoxNodeStatus
    {
        return match (strtolower($proxmoxStatus)) {
            'online' => ProxmoxNodeStatus::ONLINE,
            'offline' => ProxmoxNodeStatus::OFFLINE,
            'maintenance' => ProxmoxNodeStatus::MAINTENANCE,
            default => ProxmoxNodeStatus::OFFLINE,
        };
    }
}
