<?php

namespace Database\Factories;

use App\Models\TrainingUnit;
use App\Models\TrainingUnitProgress;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TrainingUnitProgress>
 */
class TrainingUnitProgressFactory extends Factory
{
    protected $model = TrainingUnitProgress::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'training_unit_id' => TrainingUnit::factory(),
            'completed_at' => now(),
        ];
    }
}
