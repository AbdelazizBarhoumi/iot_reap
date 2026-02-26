<?php

namespace App\Services;

use App\Models\GatewayNode;
use App\Models\ProxmoxServer;
use App\Repositories\GatewayNodeRepository;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Service for discovering USB/IP gateway containers from Proxmox.
 *
 * Queries all active Proxmox servers to discover LXC containers
 * running the USB/IP gateway agent (identified by name pattern).
 */
class GatewayDiscoveryService
{
    public function __construct(
        private readonly GatewayNodeRepository $gatewayNodeRepository,
    ) {}

    private function defaultPort(): int
    {
        return config('gateway.default_port', 8000);
    }

    private function healthTimeout(): int
    {
        return config('gateway.health_check_timeout', 3);
    }

    private function namePattern(): string
    {
        return config('gateway.discovery_name_pattern', '/gateway/i');
    }

    /**
     * Discover all gateway containers from all active Proxmox servers.
     *
     * @return Collection<int, GatewayNode>
     */
    public function discoverAll(): Collection
    {
        $discovered = collect();

        // Get all active Proxmox servers
        $servers = ProxmoxServer::where('is_active', true)->get();

        foreach ($servers as $server) {
            try {
                $gateways = $this->discoverFromServer($server);
                $discovered = $discovered->merge($gateways);
            } catch (\Exception $e) {
                Log::warning('Failed to discover gateways from Proxmox server', [
                    'server' => $server->name,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $discovered;
    }

    /**
     * Discover gateway containers from a specific Proxmox server.
     *
     * @return Collection<int, GatewayNode>
     */
    public function discoverFromServer(ProxmoxServer $server): Collection
    {
        $discovered = collect();

        // Create a ProxmoxClient for this server
        $client = new ProxmoxClient($server);

        // Get all nodes in the cluster
        $nodesData = $client->getNodes();

        foreach ($nodesData as $nodeData) {
            $nodeName = $nodeData['node'] ?? null;

            if ($nodeName === null) {
                continue;
            }

            try {
                $gateways = $this->discoverFromNode($client, $nodeName);
                $discovered = $discovered->merge($gateways);
            } catch (\Exception $e) {
                Log::warning('Failed to discover gateways from Proxmox node', [
                    'node' => $nodeName,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $discovered;
    }

    /**
     * Discover gateway containers from a specific Proxmox node.
     *
     * @return Collection<int, GatewayNode>
     */
    public function discoverFromNode(ProxmoxClientInterface $client, string $nodeName): Collection
    {
        $discovered = collect();

        // Get all LXC containers on this node
        $containers = $client->getContainers($nodeName);

        foreach ($containers as $container) {
            // Check if this is a gateway container (by name pattern)
            if (! $this->isGatewayContainer($container)) {
                continue;
            }

            // Get the container's IP address
            $ip = $client->getContainerNetworkIP($nodeName, $container['vmid']);

            if ($ip === null) {
                Log::debug('Gateway container has no IP - skipping', [
                    'node' => $nodeName,
                    'vmid' => $container['vmid'],
                    'name' => $container['name'],
                ]);
                continue;
            }

            // Create or update the gateway node
            $gateway = $this->registerGateway(
                name: $container['name'],
                ip: $ip,
                port: $this->defaultPort(),
            );

            // Check if the gateway is online
            $isOnline = $this->checkGatewayHealth($gateway);

            if ($isOnline) {
                $this->gatewayNodeRepository->markOnline($gateway);
            } else {
                $this->gatewayNodeRepository->markOffline($gateway);
            }

            // Refresh to get the updated status
            $gateway->refresh();
            $discovered->push($gateway);
        }

        return $discovered;
    }

    /**
     * Check if a container is a gateway container based on its name.
     *
     * @param array<string, mixed> $container
     */
    private function isGatewayContainer(array $container): bool
    {
        $name = $container['name'] ?? '';

        return preg_match($this->namePattern(), $name) === 1;
    }

    /**
     * Register a gateway node (create or update).
     */
    private function registerGateway(string $name, string $ip, int $port): GatewayNode
    {
        return $this->gatewayNodeRepository->firstOrCreate(
            attributes: ['ip' => $ip, 'port' => $port],
            values: ['name' => $name],
        );
    }

    /**
     * Check if a gateway is responding to health checks.
     */
    public function checkGatewayHealth(GatewayNode $gateway): bool
    {
        try {
            $response = Http::timeout($this->healthTimeout())
                ->get("{$gateway->api_url}/devices");

            return $response->successful();
        } catch (\Exception $e) {
            Log::debug('Gateway health check failed', [
                'gateway' => $gateway->name,
                'ip' => $gateway->ip,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Refresh the online status of all known gateways.
     */
    public function refreshAllGatewayStatus(): void
    {
        $gateways = $this->gatewayNodeRepository->all();

        foreach ($gateways as $gateway) {
            $isOnline = $this->checkGatewayHealth($gateway);

            if ($isOnline) {
                $this->gatewayNodeRepository->markOnline($gateway);
            } else {
                $this->gatewayNodeRepository->markOffline($gateway);
            }
        }
    }
}
