<?php

namespace Database\Factories;

use App\Enums\ProxmoxNodeStatus;
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
        $nodeNumber = fake()->numberBetween(1, 7);

        return [
            'name' => "pve-node-{$nodeNumber}",
            'hostname' => "pve-node-{$nodeNumber}.lab.local",
            'api_url' => "https://192.168.1.1{$nodeNumber}0:8006",
            'status' => ProxmoxNodeStatus::ONLINE->value,
            'max_vms' => 50,
        ];
    }

    public function offline(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ProxmoxNodeStatus::OFFLINE->value,
        ]);
    }

    public function maintenance(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ProxmoxNodeStatus::MAINTENANCE->value,
        ]);
    }
}

