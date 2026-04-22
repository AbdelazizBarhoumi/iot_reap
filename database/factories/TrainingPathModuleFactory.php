<?php

namespace Database\Factories;

use App\Models\TrainingPath;
use App\Models\TrainingPathModule;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TrainingPathModule>
 */
class TrainingPathModuleFactory extends Factory
{
    protected $model = TrainingPathModule::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'training_path_id' => TrainingPath::factory(),
            'title' => $this->faker->sentence(3),
            'sort_order' => 0,
        ];
    }
}
