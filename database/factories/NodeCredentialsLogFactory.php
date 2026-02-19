<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\NodeCredentialsLog>
 */
class NodeCredentialsLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'proxmox_server_id' => 1,
            'action' => $this->faker->randomElement(['registered', 'updated', 'tested', 'deleted']),
            'ip_address' => $this->faker->ipv4(),
            'changed_by' => null,
            'details' => null,
        ];
    }
}
