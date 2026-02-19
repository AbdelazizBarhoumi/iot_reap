<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProxmoxNodeResource;
use App\Models\ProxmoxNode;
use App\Models\ProxmoxServer;
use App\Services\ProxmoxClientFactory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Throwable;

/**
 * Controller for admin Proxmox node management.
 * Provides node listing with real-time stats and VM control.
 */
class ProxmoxNodeController extends Controller
{
    public function __construct(
        private readonly ProxmoxClientFactory $clientFactory,
    ) {}

    /**
     * Get all nodes with real-time stats.
     *
     * - Returns JSON for API/XHR requests
     * - Returns the Inertia page for normal browser visits
     */
    public function index(Request $request)
    {
        // If the client expects JSON (XHR / API), return the resource collection
        if ($request->wantsJson()) {
            $nodes = ProxmoxNode::with('proxmoxServer')->get();

            $resources = $nodes->map(function (ProxmoxNode $node) {
                $resource = new ProxmoxNodeResource($node);

                if ($node->proxmoxServer) {
                    // Do NOT call Proxmox API for servers that are inactive — keep node stats empty.
                    if ($node->proxmoxServer->is_active === false) {
                        // leave stats unset so the resource omits real-time fields
                    } else {
                        $stats = $this->getNodeStats($node->proxmoxServer, $node->name);
                        $resource->setStats($stats);
                    }
                }

                return $resource;
            });

            return response()->json([
                'data' => $resources,
            ]);
        }

        // Normal HTML request — render the Inertia React page which will fetch data client-side
        return Inertia::render('admin/NodesPage');
    }

    /**
     * Get VMs for a specific node with real-time stats.
     */
    public function getVMs(ProxmoxNode $node): JsonResponse
    {
        try {
            if (!$node->proxmoxServer) {
                return response()->json([
                    'data' => [],
                    'error' => 'Node has no associated Proxmox server',
                ], 422);
            }

            // Disallow VM listing for nodes whose server is inactive
            if ($node->proxmoxServer->is_active === false) {
                return response()->json([
                    'data' => [],
                    'error' => 'Proxmox server is inactive',
                ], 422);
            }

            $client = $this->clientFactory->make($node->proxmoxServer);
            $vms = $client->getVMs($node->name);

            return response()->json([
                'data' => $vms,
            ]);
        } catch (Throwable $e) {
            Log::error('Failed to get VMs', [
                'node_id' => $node->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'data' => [],
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Start a VM on a node.
     */
    public function startVM(ProxmoxNode $node, int $vmid): JsonResponse
    {
        try {
            if (!$node->proxmoxServer) {
                return response()->json(['error' => 'Node has no associated Proxmox server'], 422);
            }

            if ($node->proxmoxServer->is_active === false) {
                return response()->json(['error' => 'Proxmox server is inactive'], 422);
            }

            $client = $this->clientFactory->make($node->proxmoxServer);
            $client->startVM($node->name, $vmid);

            // Clear cache for this node's VMs
            Cache::forget("node_vms:{$node->proxmoxServer->id}:{$node->name}");

            return response()->json([
                'message' => "VM {$vmid} started successfully",
            ]);
        } catch (Throwable $e) {
            Log::error('Failed to start VM', [
                'node_id' => $node->id,
                'vmid' => $vmid,
                'error' => $e->getMessage(),
            ]);

            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Stop a VM on a node (hard stop).
     */
    public function stopVM(ProxmoxNode $node, int $vmid): JsonResponse
    {
        try {
            if (!$node->proxmoxServer) {
                return response()->json(['error' => 'Node has no associated Proxmox server'], 422);
            }

            if ($node->proxmoxServer->is_active === false) {
                return response()->json(['error' => 'Proxmox server is inactive'], 422);
            }

            $client = $this->clientFactory->make($node->proxmoxServer);
            $client->stopVM($node->name, $vmid);

            Cache::forget("node_vms:{$node->proxmoxServer->id}:{$node->name}");

            return response()->json([
                'message' => "VM {$vmid} stopped successfully",
            ]);
        } catch (Throwable $e) {
            Log::error('Failed to stop VM', [
                'node_id' => $node->id,
                'vmid' => $vmid,
                'error' => $e->getMessage(),
            ]);

            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Reboot a VM on a node.
     */
    public function rebootVM(ProxmoxNode $node, int $vmid): JsonResponse
    {
        try {
            if (!$node->proxmoxServer) {
                return response()->json(['error' => 'Node has no associated Proxmox server'], 422);
            }

            if ($node->proxmoxServer->is_active === false) {
                return response()->json(['error' => 'Proxmox server is inactive'], 422);
            }

            $client = $this->clientFactory->make($node->proxmoxServer);
            $client->rebootVM($node->name, $vmid);

            Cache::forget("node_vms:{$node->proxmoxServer->id}:{$node->name}");

            return response()->json([
                'message' => "VM {$vmid} rebooting",
            ]);
        } catch (Throwable $e) {
            Log::error('Failed to reboot VM', [
                'node_id' => $node->id,
                'vmid' => $vmid,
                'error' => $e->getMessage(),
            ]);

            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Shutdown a VM gracefully.
     */
    public function shutdownVM(ProxmoxNode $node, int $vmid): JsonResponse
    {
        try {
            if (!$node->proxmoxServer) {
                return response()->json(['error' => 'Node has no associated Proxmox server'], 422);
            }

            if ($node->proxmoxServer->is_active === false) {
                return response()->json(['error' => 'Proxmox server is inactive'], 422);
            }

            $client = $this->clientFactory->make($node->proxmoxServer);
            $client->shutdownVM($node->name, $vmid);

            Cache::forget("node_vms:{$node->proxmoxServer->id}:{$node->name}");

            return response()->json([
                'message' => "VM {$vmid} shutting down",
            ]);
        } catch (Throwable $e) {
            Log::error('Failed to shutdown VM', [
                'node_id' => $node->id,
                'vmid' => $vmid,
                'error' => $e->getMessage(),
            ]);

            return response()->json(['error' => $e->getMessage()], 500);
        }
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
                $client = $this->clientFactory->make($server);
                $status = $client->getNodeStatus($nodeName);

                $cpuPercent = isset($status['cpu']) ? round($status['cpu'] * 100, 2) : 0;
                
                // Handle both old-style (mem/maxmem) and new-style (memory array) responses
                if (isset($status['memory']) && is_array($status['memory'])) {
                    $ramUsedMb = round(($status['memory']['used'] ?? 0) / 1024 / 1024);
                    $ramTotalMb = round(($status['memory']['total'] ?? 0) / 1024 / 1024);
                } else {
                    $ramUsedMb = isset($status['mem']) ? round($status['mem'] / 1024 / 1024) : 0;
                    $ramTotalMb = isset($status['maxmem']) ? round($status['maxmem'] / 1024 / 1024) : 0;
                }
                
                $uptime = $status['uptime'] ?? 0;

                return [
                    'cpu_percent' => $cpuPercent,
                    'ram_used_mb' => $ramUsedMb,
                    'ram_total_mb' => $ramTotalMb,
                    'uptime_seconds' => $uptime,
                ];
            } catch (Throwable $e) {
                Log::warning('Failed to fetch node stats', [
                    'server_id' => $server->id,
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
