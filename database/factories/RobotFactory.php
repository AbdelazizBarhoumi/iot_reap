<?php

namespace Database\Factories;

use App\Models\Robot;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Robot>
 */
class RobotFactory extends Factory
{
    protected $model = Robot::class;

    public function definition(): array
    {
        $name = $this->faker->unique()->word().'-bot';

        return [
            'name' => ucfirst($name),
            'identifier' => 'robot-'.$this->faker->unique()->slug(2),
            'description' => $this->faker->sentence(),
            'status' => 'online',
            'ip_address' => $this->faker->localIpv4(),
        ];
    }

    /**
     * Robot is online.
     */
    public function online(): static
    {
        return $this->state(fn () => ['status' => 'online']);
    }

    /**
     * Robot is offline.
     */
    public function offline(): static
    {
        return $this->state(fn () => ['status' => 'offline']);
    }
}
