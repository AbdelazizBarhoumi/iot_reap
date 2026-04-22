<?php

namespace Database\Factories;

use App\Models\DailyTrainingPathStats;
use App\Models\TrainingPath;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DailyTrainingPathStats>
 */
class DailyTrainingPathStatsFactory extends Factory
{
    protected $model = DailyTrainingPathStats::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // Note: training_path_id MUST be provided explicitly since it's a required foreign key
            'date' => $this->faker->dateTimeBetween('-30 days', 'now')->format('Y-m-d'),
            'enrollments' => $this->faker->numberBetween(0, 20),
            'completions' => $this->faker->numberBetween(0, 10),
            'active_students' => $this->faker->numberBetween(0, 50),
            'training_units_viewed' => $this->faker->numberBetween(0, 200),
            'video_minutes_watched' => $this->faker->numberBetween(0, 5000),
            'quiz_attempts' => $this->faker->numberBetween(0, 30),
            'quiz_passes' => $this->faker->numberBetween(0, 25),
            'revenue_cents' => $this->faker->numberBetween(0, 50000),
        ];
    }

    /**
     * Stats for a specific trainingPath.
     */
    public function forTrainingPath(int $trainingPathId): static
    {
        return $this->state(fn (array $attributes) => [
            'training_path_id' => $trainingPathId,
        ]);
    }

    /**
     * Stats for a specific date.
     */
    public function forDate(string $date): static
    {
        return $this->state(fn (array $attributes) => [
            'date' => $date,
        ]);
    }

    /**
     * Stats with zero enrollments.
     */
    public function noEnrollments(): static
    {
        return $this->state(fn (array $attributes) => [
            'enrollments' => 0,
            'completions' => 0,
            'active_students' => 0,
            'revenue_cents' => 0,
        ]);
    }

    /**
     * Stats with high quiz pass rate.
     */
    public function highQuizPassRate(): static
    {
        return $this->state(fn (array $attributes) => [
            'quiz_attempts' => 100,
            'quiz_passes' => 95,
        ]);
    }
}
