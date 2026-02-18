<?php

namespace Database\Factories;

use App\Enums\VMSessionStatus;
use App\Enums\VMSessionType;
use App\Models\ProxmoxNode;
use App\Models\User;
use App\Models\VMTemplate;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\VMSession>
 */
class VMSessionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'template_id' => VMTemplate::factory(),
            'node_id' => ProxmoxNode::factory(),
            'vm_id' => null,
            'status' => VMSessionStatus::PENDING->value,
            'session_type' => VMSessionType::EPHEMERAL->value,
            'ip_address' => null,
            'guacamole_connection_id' => null,
            'expires_at' => now()->addHours(4),
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => VMSessionStatus::ACTIVE->value,
            'vm_id' => fake()->unique()->numberBetween(200, 999),
            'ip_address' => fake()->ipv4(),
            'guacamole_connection_id' => fake()->numberBetween(1, 1000),
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => VMSessionStatus::PENDING->value,
            'vm_id' => null,
            'ip_address' => null,
            'guacamole_connection_id' => null,
        ]);
    }

    public function provisioning(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => VMSessionStatus::PROVISIONING->value,
            'vm_id' => fake()->unique()->numberBetween(200, 999),
            'ip_address' => null,
            'guacamole_connection_id' => null,
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => VMSessionStatus::FAILED->value,
            'vm_id' => null,
            'ip_address' => null,
            'guacamole_connection_id' => null,
        ]);
    }

    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => VMSessionStatus::EXPIRED->value,
            'vm_id' => null,
            'expires_at' => now()->subHours(2),
        ]);
    }

    public function persistent(): static
    {
        return $this->state(fn (array $attributes) => [
            'session_type' => VMSessionType::PERSISTENT->value,
            'expires_at' => now()->addDays(30),
        ]);
    }
}

