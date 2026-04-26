<?php

namespace App\Repositories;

use App\Models\GatewayNode;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

/**
 * Repository for Gateway node database access.
 */
class GatewayNodeRepository
{
    /**
     * Get all gateway nodes with their devices.
     */
    public function all(): Collection
    {
        return GatewayNode::with('usbDevices')->get();
    }

    /**
     * Get all online gateway nodes.
     */
    public function allOnline(): Collection
    {
        return GatewayNode::online()->with('usbDevices')->get();
    }

    /**
     * Check if at least one active gateway is ready for pct-based video processing.
     */
    public function hasGatewayForVideoProcessing(): bool
    {
        return GatewayNode::query()
            ->where('online', true)
            ->where('is_verified', true)
            ->whereNotNull('proxmox_host')
            ->whereNotNull('proxmox_node')
            ->whereNotNull('proxmox_vmid')
            ->exists();
    }

    /**
     * Get the next active gateway node for video processing using round-robin.
     */
    public function findPreferredForVideoProcessing(): ?GatewayNode
    {
        $nodes = GatewayNode::query()
            ->where('online', true)
            ->where('is_verified', true)
            ->whereNotNull('proxmox_host')
            ->whereNotNull('proxmox_node')
            ->whereNotNull('proxmox_vmid')
            ->orderBy('id')
            ->get();

        if ($nodes->isEmpty()) {
            return null;
        }

        if ($nodes->count() === 1) {
            return $nodes->first();
        }

        return Cache::lock('video_processing_gateway_round_robin_lock', 5)
            ->block(2, function () use ($nodes): GatewayNode {
                $cacheKey = 'video_processing_gateway_round_robin_index';
                $index = (int) Cache::get($cacheKey, 0);
                $node = $nodes[$index % $nodes->count()];

                Cache::forever($cacheKey, $index + 1);

                return $node;
            });
    }

    /**
     * Find a gateway node by ID.
     */
    public function findById(int $id): ?GatewayNode
    {
        return GatewayNode::find($id);
    }

    /**
     * Find a gateway node by ID with devices.
     */
    public function findByIdWithDevices(int $id): ?GatewayNode
    {
        return GatewayNode::with('usbDevices')->find($id);
    }

    /**
     * Find a gateway node by IP and port.
     */
    public function findByIpAndPort(string $ip, int $port): ?GatewayNode
    {
        return GatewayNode::where('ip', $ip)
            ->where('port', $port)
            ->first();
    }

    /**
     * Create a new gateway node.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): GatewayNode
    {
        return GatewayNode::create($data);
    }

    /**
     * Update a gateway node.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(GatewayNode $node, array $data): bool
    {
        return $node->update($data);
    }

    /**
     * Delete a gateway node.
     */
    public function delete(GatewayNode $node): bool
    {
        return $node->delete();
    }

    /**
     * Mark a node as online.
     */
    public function markOnline(GatewayNode $node): bool
    {
        return $node->update([
            'online' => true,
            'last_seen_at' => now(),
        ]);
    }

    /**
     * Mark a node as offline.
     */
    public function markOffline(GatewayNode $node): bool
    {
        return $node->update(['online' => false]);
    }

    /**
     * Find or create a gateway node by IP and port.
     *
     * @param  array<string, mixed>  $attributes
     * @param  array<string, mixed>  $values
     */
    public function firstOrCreate(array $attributes, array $values = []): GatewayNode
    {
        return GatewayNode::firstOrCreate($attributes, $values);
    }
}
