<?php

namespace Database\Factories;

use App\Models\NodeCredentialsLog;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<NodeCredentialsLog>
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
