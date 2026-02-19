<?php

namespace App\Services;

use App\Exceptions\NoAvailableNodeException;
use App\Models\ProxmoxNode;
use App\Models\ProxmoxServer;
use App\Repositories\ProxmoxServerRepository;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Service for selecting the best Proxmox server and node across multiple clusters.
 * Implements intelligent load distribution with fallback logic.
 */
class ProxmoxServerSelector
{
    private const CACHE_TTL = 30; // seconds
    private const OVERLOAD_THRESHOLD = 85; // percent

    /**
     * Create a new ProxmoxServerSelector instance.
     */
    public function __construct(
        private readonly ProxmoxServerRepository $serverRepository,
        private readonly ProxmoxClientFactory $clientFactory,
        private readonly ProxmoxLoadBalancer $loadBalancer,
    ) {}

    /**
     * Select the best server and node for a new VM session.
     *
     * If server is specified, uses its load balancer.
     * Otherwise, selects across all active servers (multi-server mode).
     * Within the chosen server, selects the least-loaded node.
     *
     * @throws NoAvailableNodeException
     */
    public function select(?ProxmoxServer $server = null): array
    {
        // Single-server mode explicitly requested or fallback
        if ($server !== null) {
            return $this->selectInServer($server);
        }

        // Multi-server mode: select best across all servers
        return $this->selectAcrossServers();
    }

    /**
     * Select a node within a specific Proxmox server.
     *
     * @return array{server: ProxmoxServer, node: ProxmoxNode}
     *
     * @throws NoAvailableNodeException
     */
    private function selectInServer(ProxmoxServer $server): array
    {
        Log::debug('Selecting node in specific server', [
            'server' => $server->name,
        ]);

        $client = $this->clientFactory->make($server);
        $node = $this->loadBalancer->selectNode($server);

        return [
            'server' => $server,
            'node' => $node,
        ];
    }

    /**
     * Select the best server and node across all active servers.
     * Prefers servers with more online nodes and lower overall load.
     *
     * @return array{server: ProxmoxServer, node: ProxmoxNode}
     *
     * @throws NoAvailableNodeException
     */
    private function selectAcrossServers(): array
    {
        $servers = $this->serverRepository->findActive();

        if ($servers->isEmpty()) {
            Log::error('No active Proxmox servers available');
            throw new NoAvailableNodeException('No active Proxmox servers configured.');
        }

        // Build scores for each server: prefer more online nodes
        $serverScores = [];
        foreach ($servers as $server) {
            $onlineNodeCount = $server->nodes()
                ->where('status', 'online')
                ->count();

            $serverScores[$server->id] = [
                'server' => $server,
                'online_nodes' => $onlineNodeCount,
                'score' => $onlineNodeCount, // Higher is better (more capacity)
            ];
        }

        // Sort by score descending (more nodes = faster)
        usort($serverScores, fn($a, $b) => $b['score'] <=> $a['score']);

        Log::debug('Server scores calculated', [
            'scores' => array_map(fn($s) => [
                'server' => $s['server']->name,
                'online_nodes' => $s['online_nodes'],
            ], $serverScores),
        ]);

        // Try each server in order until we find one with available capacity
        foreach ($serverScores as $scoreData) {
            $server = $scoreData['server'];

            try {
                $node = $this->selectInServer($server)['node'];

                Log::info('Selected server and node across cluster', [
                    'server' => $server->name,
                    'node' => $node->name,
                ]);

                return [
                    'server' => $server,
                    'node' => $node,
                ];
            } catch (NoAvailableNodeException $e) {
                Log::warning('Server overloaded, trying next', [
                    'server' => $server->name,
                    'error' => $e->getMessage(),
                ]);
                // Continue to next server
            }
        }

        // All servers are overloaded
        Log::error('All Proxmox servers are overloaded', [
            'server_count' => $servers->count(),
        ]);

        throw new NoAvailableNodeException(
            'All Proxmox servers are overloaded. No capacity available across ' . $servers->count() . ' clusters.'
        );
    }

    /**
     * Get load statistics across all servers for admin dashboard.
     *
     * @return array<string, mixed>
     */
    public function getLoadStats(): array
    {
        $servers = $this->serverRepository->findActive();

        $stats = [];
        foreach ($servers as $server) {
            $onlineNodes = $server->nodes()
                ->where('status', 'online')
                ->count();

            $totalVMs = $server->vmSessions()
                ->whereIn('status', ['pending', 'active', 'hibernating'])
                ->count();

            $stats[$server->name] = [
                'id' => $server->id,
                'host' => $server->host,
                'online_nodes' => $onlineNodes,
                'active_vms' => $totalVMs,
                'is_active' => $server->is_active,
            ];
        }

        return $stats;
    }
}
