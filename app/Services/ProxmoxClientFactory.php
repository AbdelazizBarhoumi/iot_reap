<?php

namespace App\Services;

use App\Models\ProxmoxServer;
use App\Repositories\ProxmoxServerRepository;

/**
 * Factory for creating ProxmoxClient instances.
 * Builds clients for specific servers, supporting multi-server deployments.
 */
class ProxmoxClientFactory
{
    /**
     * Create a new ProxmoxClientFactory instance.
     */
    public function __construct(
        private readonly ProxmoxServerRepository $repository,
    ) {}

    /**
     * Build a ProxmoxClient for the specified server.
     */
    public function make(ProxmoxServer $server): ProxmoxClientInterface
    {
        // Directly instantiate ProxmoxClient to avoid singleton binding issues
        // This ensures each call returns a fresh instance with the specified server
        return new ProxmoxClient($server);
    }

    /**
     * Build a ProxmoxClient for the default server (single-server mode).
     * Falls back to the first active server if no default is configured.
     *
     * @throws \RuntimeException if no server is available
     */
    public function makeDefault(): ProxmoxClientInterface
    {
        $server = $this->repository->findDefault();

        if (!$server) {
            throw new \RuntimeException(
                'No active Proxmox server configured. Register a server via admin API or set PROXMOX_DEFAULT_SERVER_ID.'
            );
        }

        return $this->make($server);
    }

    /**
     * Build a ProxmoxClient for a server by ID.
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function makeForServerId(int $serverId): ProxmoxClientInterface
    {
        $server = $this->repository->findById($serverId);

        return $this->make($server);
    }

    /**
     * Build a ProxmoxClient for the server containing the given node.
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function makeForNode(string $nodeName): ProxmoxClientInterface
    {
        $node = \App\Models\ProxmoxNode::where('name', $nodeName)->firstOrFail();
        $server = $this->repository->findByNode($node);

        return $this->make($server);
    }
}
