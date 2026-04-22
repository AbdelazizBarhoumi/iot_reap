<?php

namespace Database\Factories;

use App\Models\ProxmoxServer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProxmoxServer>
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
            'realm' => 'pam',
            'token_id' => 'PVEAPIToken=user@pam!token='.$this->faker->sha256(),
            'token_secret' => $this->faker->sha256(),
            'verify_ssl' => true,
            'is_active' => true,
            'created_by' => null,
        ];
    }
}
