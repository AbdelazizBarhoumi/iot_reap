<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProxmoxNodeResource;
use App\Models\ProxmoxNode;
use App\Models\ProxmoxServer;
use App\Services\ProxmoxClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Controller for admin Proxmox node management.
 * Provides node listing with real-time stats.
 */
class ProxmoxNodeController extends Controller
{
    /**
     * Get all nodes with real-time stats.
     */
    public function index(): JsonResponse
    {
        $nodes = ProxmoxNode::all();

        // Get the primary Proxmox server for API calls
        $server = ProxmoxServer::where('is_active', true)->first();

        $resources = $nodes->map(function (ProxmoxNode $node) use ($server) {
            $resource = new ProxmoxNodeResource($node);

            if ($server) {
                $stats = $this->getNodeStats($server, $node->name);
                $resource->setStats($stats);
            }

            return $resource;
        });

        return response()->json([
            'data' => $resources,
        ]);
    }

    /**
     * Get real-time stats for a node (with 30s caching).
     *
     * @return array<string, mixed>
     */
    private function getNodeStats(ProxmoxServer $server, string $nodeName): array
    {
        $cacheKey = "admin_node_stats:{$server->id}:{$nodeName}";

        return Cache::remember($cacheKey, 30, function () use ($server, $nodeName) {
            try {
                $client = new ProxmoxClient($server);
                $status = $client->getNodeStatus($nodeName);

                $cpuPercent = isset($status['cpu']) ? round($status['cpu'] * 100, 2) : 0;
                $ramUsedMb = isset($status['mem']) ? round($status['mem'] / 1024 / 1024) : 0;
                $ramTotalMb = isset($status['maxmem']) ? round($status['maxmem'] / 1024 / 1024) : 0;
                $uptime = $status['uptime'] ?? 0;

                return [
                    'cpu_percent' => $cpuPercent,
                    'ram_used_mb' => $ramUsedMb,
                    'ram_total_mb' => $ramTotalMb,
                    'uptime_seconds' => $uptime,
                ];
            } catch (Throwable $e) {
                Log::warning('Failed to fetch node stats', [
                    'node' => $nodeName,
                    'error' => $e->getMessage(),
                ]);

                return [
                    'cpu_percent' => 0,
                    'ram_used_mb' => 0,
                    'ram_total_mb' => 0,
                    'uptime_seconds' => 0,
                ];
            }
        });
    }
}
