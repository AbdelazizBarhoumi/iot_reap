<?php

namespace Database\Factories;

use App\Enums\VMSessionStatus;
use App\Enums\VMSessionType;
use App\Models\VMSession;
use App\Models\VMTemplate;
use App\Models\ProxmoxNode;
use App\Models\User;
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
            'ip_address' => null,
            'session_type' => VMSessionType::EPHEMERAL->value,
            'expires_at' => now()->addHours(2),
            'guacamole_connection_id' => null,
        ];
    }

    /**
     * Indicate the session is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => VMSessionStatus::ACTIVE->value,
            'vm_id' => $this->faker->numberBetween(200, 999),
            'ip_address' => $this->faker->ipv4(),
            'guacamole_connection_id' => 'conn-' . $this->faker->uuid(),
        ]);
    }

    /**
     * Indicate the session is expired.
     */
    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => VMSessionStatus::EXPIRED->value,
            'expires_at' => now()->subHours(1),
        ]);
    }

    /**
     * Indicate the session failed to provision.
     */
    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => VMSessionStatus::FAILED->value,
        ]);
    }

    /**
     * Indicate the session is persistent.
     */
    public function persistent(): static
    {
        return $this->state(fn (array $attributes) => [
            'session_type' => VMSessionType::PERSISTENT->value,
            'expires_at' => now()->addDays(30),
        ]);
    }
}
