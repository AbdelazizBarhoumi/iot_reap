<?php

namespace Database\Factories;

use App\Models\TrainingUnit;
use App\Models\TrainingUnitNote;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TrainingUnitNote>
 */
class TrainingUnitNoteFactory extends Factory
{
    protected $model = TrainingUnitNote::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'training_unit_id' => TrainingUnit::factory(),
            'content' => $this->faker->paragraph(),
            'timestamp_seconds' => $this->faker->optional(0.7)->numberBetween(0, 3600),
        ];
    }

    /**
     * Note with a specific timestamp.
     */
    public function atTimestamp(int $seconds): static
    {
        return $this->state(fn (array $attributes) => [
            'timestamp_seconds' => $seconds,
        ]);
    }

    /**
     * Note without timestamp.
     */
    public function withoutTimestamp(): static
    {
        return $this->state(fn (array $attributes) => [
            'timestamp_seconds' => null,
        ]);
    }
}
