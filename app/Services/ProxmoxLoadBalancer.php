<?php

namespace App\Services;

use App\Exceptions\ProxmoxApiException;
use App\Models\ProxmoxNode;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ProxmoxLoadBalancer
{
    private const CACHE_KEY_PREFIX = 'proxmox_node_load_';

    public function __construct(
        private readonly ProxmoxClientInterface $proxmoxClient,
    ) {
    }

    /**
     * Select the least-loaded online node.
     *
     * @throws ProxmoxApiException|\Exception
     */
    public function selectNode(): ProxmoxNode
    {
        $candidateNodes = ProxmoxNode::where('status', 'online')
            ->orderBy('name')
            ->get();

        if ($candidateNodes->isEmpty()) {
            throw new \Exception('No online Proxmox nodes available');
        }

        $nodeScores = [];

        foreach ($candidateNodes as $node) {
            try {
                $score = $this->getNodeLoad($node);
                $nodeScores[$node->id] = [
                    'node' => $node,
                    'score' => $score,
                ];

                Log::debug("Node load calculated", [
                    'node' => $node->name,
                    'score' => round($score, 2),
                ]);
            } catch (ProxmoxApiException $e) {
                Log::warning("Could not calculate load for node {$node->name}", [
                    'error' => $e->getMessage(),
                ]);
            }
        }

        if (empty($nodeScores)) {
            throw new \Exception('Could not calculate load for any online nodes');
        }

        // Find the node with the lowest score
        uasort($nodeScores, fn ($a, $b) => $a['score'] <=> $b['score']);
        $selectedNodeId = array_key_first($nodeScores);

        $selectedData = $nodeScores[$selectedNodeId];
        $selectedNode = $selectedData['node'];

        // Check if the selected node is overloaded
        $loadThreshold = config('proxmox.node_load_threshold', 0.85);
        if ($selectedData['score'] > $loadThreshold) {
            Log::warning("Selected node is near capacity", [
                'node' => $selectedNode->name,
                'load_score' => round($selectedData['score'], 2),
                'threshold' => $loadThreshold,
            ]);

            throw new \Exception(
                "All Proxmox nodes are above {$loadThreshold} load threshold. "
                . "Cannot provision new VMs at this time."
            );
        }

        Log::info("Node selected for provisioning", [
            'node' => $selectedNode->name,
            'load_score' => round($selectedData['score'], 2),
        ]);

        return $selectedNode;
    }

    /**
     * Calculate the load score for a node (0.0 = idle, 1.0 = fully loaded).
     * Score = (RAM weight * RAM usage) + (CPU weight * CPU usage)
     *
     * @throws ProxmoxApiException
     */
    public function getNodeLoad(ProxmoxNode $node): float
    {
        $cacheKey = self::CACHE_KEY_PREFIX . $node->id;
        $cacheTtl = config('proxmox.cache_ttl', 30);

        return Cache::remember($cacheKey, $cacheTtl, function () use ($node) {
            try {
                $status = $this->proxmoxClient->getNodeStatus($node->name);
            } catch (ProxmoxApiException $e) {
                Log::error("Failed to get node status for load calculation", [
                    'node' => $node->name,
                    'error' => $e->getMessage(),
                ]);

                throw $e;
            }

            $ramUsagePercent = 0.0;
            if (isset($status['maxmem'], $status['mem']) && $status['maxmem'] > 0) {
                $ramUsagePercent = $status['mem'] / $status['maxmem'];
            }

            $cpuUsagePercent = 0.0;
            if (isset($status['maxcpu'], $status['cpu']) && $status['maxcpu'] > 0) {
                $cpuUsagePercent = $status['cpu'] / $status['maxcpu'];
            }

            $weights = config('proxmox.node_score_weights', [
                'ram' => 0.7,
                'cpu' => 0.3,
            ]);

            $score = ($weights['ram'] * $ramUsagePercent) + ($weights['cpu'] * $cpuUsagePercent);

            return min($score, 1.0); // Clamp between 0 and 1
        });
    }

    /**
     * Clear the cache for a specific node.
     */
    public function clearNodeCache(ProxmoxNode $node): void
    {
        Cache::forget(self::CACHE_KEY_PREFIX . $node->id);
    }

    /**
     * Clear the cache for all nodes.
     */
    public function clearAllCache(): void
    {
        // Get all cached keys and remove them
        $pattern = self::CACHE_KEY_PREFIX . '*';
        Cache::flush(); // Laravel doesn't provide a pattern-based forget, so we flush if using file/array drivers
    }
}
