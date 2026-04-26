<?php

namespace Database\Factories;

use App\Models\GatewayNode;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<GatewayNode>
 */
class GatewayNodeFactory extends Factory
{
    protected $model = GatewayNode::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        static $nodeCounter = 1;

        $nodeNumber = $nodeCounter++;

        return [
            'name' => "gateway-{$nodeNumber}",
            'ip' => '192.168.50.'.(5 + $nodeNumber),
            'port' => 8000,
            'online' => true,
            'proxmox_host' => null,
            'proxmox_node' => null,
            'proxmox_vmid' => null,
            'last_seen_at' => now(),
        ];
    }

    /**
     * Configure node as offline.
     */
    public function offline(): static
    {
        return $this->state(fn (array $attributes) => [
            'online' => false,
            'last_seen_at' => now()->subMinutes(10),
        ]);
    }

    /**
     * Configure node as online.
     */
    public function online(): static
    {
        return $this->state(fn (array $attributes) => [
            'online' => true,
            'last_seen_at' => now(),
        ]);
    }

    /**
     * Configure with custom port.
     */
    public function withPort(int $port): static
    {
        return $this->state(fn (array $attributes) => [
            'port' => $port,
        ]);
    }

    /**
     * Configure node as verified.
     */
    public function verified(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_verified' => true,
        ]);
    }

    /**
     * Configure node as unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_verified' => false,
        ]);
    }

    /**
     * Configure with Proxmox camera API URL.
     */
    public function withCameraApi(string $url): static
    {
        return $this->state(fn (array $attributes) => [
            'proxmox_camera_api_url' => $url,
        ]);
    }

    /**
     * Configure node for pct-based video processing.
     */
    public function forVideoProcessing(string $host, string $node, int|string $vmid): static
    {
        return $this->state(fn (array $attributes) => [
            'proxmox_host' => $host,
            'proxmox_node' => $node,
            'proxmox_vmid' => (string) $vmid,
        ]);
    }
}
