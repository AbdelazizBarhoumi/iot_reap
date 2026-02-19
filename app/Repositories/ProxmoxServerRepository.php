<?php

namespace App\Repositories;

use App\Models\ProxmoxNode;
use App\Models\ProxmoxServer;
use Illuminate\Database\Eloquent\Collection;

/**
 * Repository for Proxmox server queries.
 * Provides methods for finding and filtering Proxmox servers.
 */
class ProxmoxServerRepository
{
    /**
     * Find all active Proxmox servers.
     *
     * @return Collection<int, ProxmoxServer>
     */
    public function findActive(): Collection
    {
        return ProxmoxServer::where('is_active', true)
            ->with('nodes')
            ->orderBy('name')
            ->get();
    }

    /**
     * Find a Proxmox server by ID.
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function findById(int $id): ProxmoxServer
    {
        return ProxmoxServer::with('nodes')
            ->findOrFail($id);
    }

    /**
     * Find the Proxmox server that a node belongs to.
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function findByNode(ProxmoxNode $node): ProxmoxServer
    {
        return ProxmoxServer::findOrFail($node->proxmox_server_id);
    }

    /**
     * Find the default Proxmox server for single-server mode.
     * Falls back to first active server if default_server_id not set.
     */
    public function findDefault(): ?ProxmoxServer
    {
        $defaultServerId = config('proxmox.default_server_id');

        if ($defaultServerId) {
            return ProxmoxServer::find($defaultServerId);
        }

        return ProxmoxServer::where('is_active', true)
            ->orderBy('created_at')
            ->first();
    }

    /**
     * Get all servers with online node counts.
     *
     * @return Collection<int, ProxmoxServer>
     */
    public function findActiveWithNodeStats(): Collection
    {
        return ProxmoxServer::where('is_active', true)
            ->with([
                'nodes' => fn($query) => $query->where('status', 'online'),
            ])
            ->get()
            ->map(fn($server) => $server->setAttribute('online_node_count', $server->nodes->count()));
    }
}
