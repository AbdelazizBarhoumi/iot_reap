<?php

namespace App\Http\Controllers;

use App\Enums\ProxmoxNodeStatus;
use App\Models\ProxmoxNode;
use App\Models\ProxmoxServer;
use App\Services\ProxmoxClientFactory;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

/**
 * Lists VMs from Proxmox servers so engineers can browse
 * and launch sessions without managing templates via the web UI.
 */
class ProxmoxVMBrowserController extends Controller
{
    public function __construct(
        private readonly ProxmoxClientFactory $clientFactory,
    ) {}

    /**
     * GET /api/proxmox-vms
     *
     * Returns a flat list of VMs from all active servers' online nodes.
     * Lightweight — no per-VM status enrichment.
     */
    public function index(): JsonResponse
    {
        $servers = ProxmoxServer::where('is_active', true)->get();

        if ($servers->isEmpty()) {
            return response()->json([
                'data' => [],
                'message' => 'No active Proxmox servers configured.',
            ]);
        }

        $vms = [];

        foreach ($servers as $server) {
            $nodes = ProxmoxNode::where('proxmox_server_id', $server->id)
                ->where('status', ProxmoxNodeStatus::ONLINE)
                ->get();

            if ($nodes->isEmpty()) {
                continue;
            }

            try {
                $client = $this->clientFactory->make($server);

                foreach ($nodes as $node) {
                    try {
                        $nodeVMs = $client->listVMsLight($node->name);

                        foreach ($nodeVMs as $vm) {
                            $vms[] = [
                                'vmid'        => $vm['vmid'] ?? 0,
                                'name'        => $vm['name'] ?? "VM {$vm['vmid']}",
                                'status'      => $vm['status'] ?? 'unknown',
                                'maxmem'      => $vm['maxmem'] ?? 0,
                                'cpus'        => $vm['cpus'] ?? $vm['maxcpu'] ?? 1,
                                'maxdisk'     => $vm['maxdisk'] ?? 0,
                                'uptime'      => $vm['uptime'] ?? 0,
                                'is_template' => !empty($vm['template']),
                                'node_id'     => $node->id,
                                'node_name'   => $node->name,
                                'server_id'   => $server->id,
                                'server_name' => $server->name,
                            ];
                        }
                    } catch (\Throwable $e) {
                        Log::warning('Failed to list VMs for node', [
                            'node'  => $node->name,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }
            } catch (\Throwable $e) {
                Log::warning('Failed to create Proxmox client for server', [
                    'server_id' => $server->id,
                    'error'     => $e->getMessage(),
                ]);
            }
        }

        return response()->json(['data' => $vms]);
    }

    /**
     * GET /proxmox-vms/{serverId}/{nodeId}/{vmid}/snapshots
     *
     * Returns snapshots for a specific VM. Used by the launch dialog
     * so users can choose a "return to snapshot" before creating a session.
     */
    public function snapshots(int $serverId, int $nodeId, int $vmid): JsonResponse
    {
        $server = ProxmoxServer::where('is_active', true)->findOrFail($serverId);
        $node = ProxmoxNode::where('proxmox_server_id', $server->id)
            ->where('status', ProxmoxNodeStatus::ONLINE)
            ->findOrFail($nodeId);

        try {
            $client = $this->clientFactory->make($server);
            $snapshots = $client->listSnapshots($node->name, $vmid);

            return response()->json(['data' => $snapshots]);
        } catch (\Throwable $e) {
            Log::warning('Failed to list VM snapshots', [
                'server_id' => $serverId,
                'node'      => $node->name,
                'vmid'      => $vmid,
                'error'     => $e->getMessage(),
            ]);

            return response()->json(['data' => [], 'message' => 'Could not retrieve snapshots'], 200);
        }
    }
}
