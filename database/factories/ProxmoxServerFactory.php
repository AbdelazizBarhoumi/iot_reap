<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProxmoxServer>
 */
class ProxmoxServerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->words(2, true),
            'description' => $this->faker->sentence(),
            'host' => $this->faker->ipv4(),
            'port' => 8006,
            'token_id' => 'user@pam!test',
            'token_secret' => $this->faker->sha256(),
            'is_active' => true,
        ];
    }
}
