<?php

namespace App\Repositories;

use App\Models\GatewayNode;
use Illuminate\Database\Eloquent\Collection;

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
