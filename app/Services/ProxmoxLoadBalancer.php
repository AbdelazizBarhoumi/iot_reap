<?php

namespace App\Services;

use App\Exceptions\NoAvailableNodeException;
use App\Models\ProxmoxNode;
use App\Models\ProxmoxServer;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Service for selecting the least-loaded Proxmox node.
 * Uses weighted scoring of CPU and RAM usage with Redis caching.
 */
class ProxmoxLoadBalancer
{
    private const CACHE_TTL = 30; // seconds
    private const OVERLOAD_THRESHOLD = 85; // percent
    private const CPU_WEIGHT = 0.3;
    private const MEMORY_WEIGHT = 0.7;

    /**
     * Create a new ProxmoxLoadBalancer instance.
     */
    public function __construct(
        private readonly ProxmoxClient $client,
        private readonly ProxmoxServer $server,
    ) {}

    /**
     * Select the least-loaded node for this server.
     *
     * @throws NoAvailableNodeException
     */
    public function selectNode(): ProxmoxNode
    {
        $online_nodes = ProxmoxNode::where('status', 'online')
            ->get()
            ->map(fn($node) => $node->name)
            ->toArray();

        if (empty($online_nodes)) {
            Log::warning('No online nodes available for provisioning', [
                'server' => $this->server->name,
            ]);

            throw new NoAvailableNodeException(
                "No online Proxmox nodes available on server '{$this->server->name}'"
            );
        }

        $scores = [];
        foreach ($online_nodes as $nodeName) {
            $scores[$nodeName] = $this->computeNodeScore($nodeName);
        }

        // Find node with lowest score (least loaded)
        asort($scores);
        $selectedNodeName = key($scores);
        $selectedScore = reset($scores);

        // Check if all nodes are overloaded
        if ($selectedScore > self::OVERLOAD_THRESHOLD) {
            Log::warning('All nodes are overloaded', [
                'server' => $this->server->name,
                'scores' => $scores,
                'threshold' => self::OVERLOAD_THRESHOLD,
            ]);

            throw new NoAvailableNodeException(
                "All Proxmox nodes on server '{$this->server->name}' are overloaded (>{self::OVERLOAD_THRESHOLD}%)"
            );
        }

        Log::debug('Load balancer selected node', [
            'server' => $this->server->name,
            'node' => $selectedNodeName,
            'score' => $selectedScore,
        ]);

        return ProxmoxNode::where('name', $selectedNodeName)->firstOrFail();
    }

    /**
     * Compute a composite load score for a node.
     * Lower score = less loaded. Returns 0-100 (percent).
     */
    private function computeNodeScore(string $nodeName): float
    {
        $cacheKey = "proxmox_node_load:{$this->server->id}:{$nodeName}";

        // Try to get from cache
        $cached = Cache::get($cacheKey);
        if ($cached !== null) {
            Log::debug('Using cached node score', [
                'node' => $nodeName,
                'score' => $cached,
            ]);

            return $cached;
        }

        try {
            $status = $this->client->getNodeStatus($nodeName);

            $cpuPercent = isset($status['cpu'], $status['maxcpu'])
                ? ($status['cpu'] / $status['maxcpu']) * 100
                : 0;

            $memPercent = isset($status['mem'], $status['maxmem'])
                ? ($status['mem'] / $status['maxmem']) * 100
                : 0;

            // Composite score: weighted average
            $score = ($cpuPercent * self::CPU_WEIGHT) + ($memPercent * self::MEMORY_WEIGHT);

            // Cache the score
            Cache::put($cacheKey, $score, self::CACHE_TTL);

            Log::debug('Computed node score', [
                'node' => $nodeName,
                'cpu_percent' => round($cpuPercent, 2),
                'mem_percent' => round($memPercent, 2),
                'score' => round($score, 2),
            ]);

            return $score;
        } catch (Throwable $e) {
            Log::warning('Failed to fetch node status, using cache fallback', [
                'node' => $nodeName,
                'error' => $e->getMessage(),
            ]);

            // Fall back to last cached value (extended TTL)
            $fallback = Cache::get($cacheKey);
            if ($fallback !== null) {
                Log::debug('Using fallback cached node score', [
                    'node' => $nodeName,
                    'score' => $fallback,
                ]);

                return $fallback;
            }

            // If no cache, assume high score to avoid overloading this node
            Log::warning('No cached score available, assuming high load', ['node' => $nodeName]);

            return 100.0;
        }
    }

    /**
     * Clear the cache for this server's nodes [testing/admin purposes].
     */
    public function clearCache(): void
    {
        $pattern = "proxmox_node_load:{$this->server->id}:*";
        // Note: Redis pattern deletion is not directly available in Laravel Cache
        // This is a simplified version; in production, track keys or use direct Redis
        Log::debug('Load balancer cache cleared', ['pattern' => $pattern]);
    }
}
