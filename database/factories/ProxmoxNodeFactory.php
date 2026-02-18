<?php

namespace Database\Factories;

use App\Enums\ProxmoxNodeStatus;
use App\Models\ProxmoxNode;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProxmoxNode>
 */
class ProxmoxNodeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $nodeName = 'pve-' . $this->faker->unique()->numberBetween(1, 20);

        return [
            'name' => $nodeName,
            'hostname' => $nodeName . '.local',
            'api_url' => 'https://proxmox.example.com:8006',
            'status' => ProxmoxNodeStatus::OFFLINE->value,
            'max_vms' => 50,
        ];
    }

    /**
     * Indicate the node is online.
     */
    public function online(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ProxmoxNodeStatus::ONLINE->value,
        ]);
    }

    /**
     * Indicate the node is offline.
     */
    public function offline(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ProxmoxNodeStatus::OFFLINE->value,
        ]);
    }

    /**
     * Indicate the node is in maintenance.
     */
    public function maintenance(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ProxmoxNodeStatus::MAINTENANCE->value,
        ]);
    }
}
