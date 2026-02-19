<?php

namespace App\Repositories;

use App\Models\ProxmoxNode;
use App\Models\ProxmoxServer;
use Illuminate\Database\Eloquent\Collection;

/**
 * Repository for Proxmox node queries.
 * Provides methods for finding and filtering Proxmox nodes.
 */
class ProxmoxNodeRepository
{
    /**
     * Find all active nodes for a given server.
     *
     * @return Collection<int, ProxmoxNode>
     */
    public function findActiveByServer(ProxmoxServer $server): Collection
    {
        return ProxmoxNode::where('proxmox_server_id', $server->id)
            ->where('status', 'online')
            ->with('vmSessions')
            ->orderBy('name')
            ->get();
    }

    /**
     * Find a node by ID.
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function findById(int $id): ProxmoxNode
    {
        return ProxmoxNode::with(['proxmoxServer', 'vmSessions'])
            ->findOrFail($id);
    }

    /**
     * List all active nodes with resource statistics.
     *
     * Includes active VM counts and available resource calculations.
     *
     * @return Collection<int, ProxmoxNode>
     */
    public function listWithResourceStats(): Collection
    {
        return ProxmoxNode::where('status', 'online')
            ->with(['proxmoxServer', 'vmSessions' => fn($q) => $q
                ->where('status', 'active')
                ->where('expires_at', '>', now())
            ])
            ->get()
            ->map(function (ProxmoxNode $node) {
                // Calculate resource stats for each node
                $node->setAttribute('active_vms', $node->countActiveVMs());
                $server = $node->proxmoxServer;
                if ($server) {
                    $node->setAttribute('available_cpu', $node->getAvailableCPU($server->cpu_overcommit_ratio));
                    $node->setAttribute('available_memory', $node->getAvailableMemory($server->memory_overcommit_ratio));
                }
                return $node;
            });
    }

    /**
     * Find nodes that can accommodate a new VM.
     *
     * Filters by server capacity and resource availability.
     *
     * @return Collection<int, ProxmoxNode>
     */
    public function findCapableNodes(ProxmoxServer $server, int $requiredCpu = 2, int $requiredMemory = 2048): Collection
    {
        return ProxmoxNode::where('proxmox_server_id', $server->id)
            ->where('status', 'online')
            ->with('vmSessions')
            ->get()
            ->filter(fn(ProxmoxNode $node) => $server->canProvisionsMore($node, $requiredCpu, $requiredMemory));
    }

    /**
     * Get all nodes for a server.
     *
     * @return Collection<int, ProxmoxNode>
     */
    public function findByServer(ProxmoxServer $server): Collection
    {
        return ProxmoxNode::where('proxmox_server_id', $server->id)
            ->with('vmSessions')
            ->orderBy('name')
            ->get();
    }
}
