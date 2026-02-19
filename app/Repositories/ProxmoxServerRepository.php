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
     * Find all active Proxmox servers using the scopeActive() scope.
     *
     * @return Collection<int, ProxmoxServer>
     */
    public function findActive(): Collection
    {
        return ProxmoxServer::active()
            ->with('nodes')
            ->orderBy('name')
            ->get();
    }

    /**
     * Find an active Proxmox server by ID.
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function findActiveById(int $id): ProxmoxServer
    {
        return ProxmoxServer::active()
            ->with('nodes')
            ->findOrFail($id);
    }

    /**
     * Find a Proxmox server by ID (regardless of active status).
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
            return ProxmoxServer::active()->find($defaultServerId);
        }

        return ProxmoxServer::active()
            ->orderBy('created_at')
            ->first();
    }

    /**
     * Get all active servers with node stats and resource information.
     *
     * @return Collection<int, ProxmoxServer>
     */
    public function findActiveWithNodeStats(): Collection
    {
        return ProxmoxServer::active()
            ->with([
                'nodes' => fn($query) => $query->where('status', 'online'),
            ])
            ->get()
            ->map(function ($server) {
                $onlineNodes = $server->nodes->count();
                $totalActiveSessions = $server->vmSessions()
                    ->where('status', 'active')
                    ->where('expires_at', '>', now())
                    ->count();

                return $server
                    ->setAttribute('online_node_count', $onlineNodes)
                    ->setAttribute('active_sessions', $totalActiveSessions)
                    ->setAttribute('sessions_remaining', $server->max_concurrent_sessions - $totalActiveSessions);
            });
    }

    /**
     * Get all active servers with full resource information for admin dashboard.
     *
     * @return Collection<int, ProxmoxServer>
     */
    public function allActiveWithResourceStats(): Collection
    {
        return ProxmoxServer::active()
            ->with([
                'nodes' => fn($query) => $query->where('status', 'online'),
                'vmSessions' => fn($query) => $query
                    ->where('status', 'active')
                    ->where('expires_at', '>', now()),
            ])
            ->get()
            ->map(function ($server) {
                $activeVmsPerNode = [];
                $totalActiveVms = 0;

                foreach ($server->nodes as $node) {
                    $activeCount = $node->countActiveVMs();
                    $activeVmsPerNode[$node->id] = $activeCount;
                    $totalActiveVms += $activeCount;
                }

                return $server
                    ->setAttribute('total_active_vms', $totalActiveVms)
                    ->setAttribute('active_sessions', $server->vmSessions->count())
                    ->setAttribute('sessions_remaining', $server->max_concurrent_sessions - $server->vmSessions->count())
                    ->setAttribute('online_node_count', $server->nodes->count())
                    ->setAttribute('vms_per_node', $activeVmsPerNode);
            });
    }
}
