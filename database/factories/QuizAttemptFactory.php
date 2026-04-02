<?php

namespace Database\Factories;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<QuizAttempt>
 */
class QuizAttemptFactory extends Factory
{
    protected $model = QuizAttempt::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $score = $this->faker->numberBetween(0, 100);
        $totalPoints = $this->faker->numberBetween(10, 50);
        $actualScore = ($score / 100) * $totalPoints;

        return [
            'user_id' => User::factory(),
            'quiz_id' => Quiz::factory(),
            'started_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
            'completed_at' => null,
            'score' => 0,
            'total_points' => 0,
            'percentage' => 0,
            'passed' => false,
        ];
    }

    /**
     * Completed attempt.
     */
    public function completed(): static
    {
        return $this->state(function (array $attributes) {
            $totalPoints = $this->faker->numberBetween(10, 50);
            $score = $this->faker->numberBetween(0, $totalPoints);
            $percentage = ($score / $totalPoints) * 100;

            return [
                'completed_at' => $this->faker->dateTimeBetween($attributes['started_at'], 'now'),
                'score' => $score,
                'total_points' => $totalPoints,
                'percentage' => $percentage,
                'passed' => $percentage >= 70, // Default passing score
            ];
        });
    }

    /**
     * Passed attempt.
     */
    public function passed(): static
    {
        return $this->state(function (array $attributes) {
            $totalPoints = $this->faker->numberBetween(10, 50);
            $score = $this->faker->numberBetween(35, $totalPoints); // Ensure 70%+
            $percentage = ($score / $totalPoints) * 100;

            return [
                'completed_at' => $this->faker->dateTimeBetween($attributes['started_at'], 'now'),
                'score' => $score,
                'total_points' => $totalPoints,
                'percentage' => max($percentage, 70),
                'passed' => true,
            ];
        });
    }

    /**
     * Failed attempt.
     */
    public function failed(): static
    {
        return $this->state(function (array $attributes) {
            $totalPoints = $this->faker->numberBetween(10, 50);
            $score = $this->faker->numberBetween(0, (int) ($totalPoints * 0.69)); // Less than 70%
            $percentage = ($score / $totalPoints) * 100;

            return [
                'completed_at' => $this->faker->dateTimeBetween($attributes['started_at'], 'now'),
                'score' => $score,
                'total_points' => $totalPoints,
                'percentage' => $percentage,
                'passed' => false,
            ];
        });
    }

    /**
     * In-progress attempt.
     */
    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'completed_at' => null,
            'score' => null,
            'total_points' => null,
            'percentage' => null,
            'passed' => false,
        ]);
    }

    /**
     * Attempt with specific score.
     */
    public function withScore(int $score, int $totalPoints): static
    {
        return $this->state(fn (array $attributes) => [
            'completed_at' => $this->faker->dateTimeBetween($attributes['started_at'], 'now'),
            'score' => $score,
            'total_points' => $totalPoints,
            'percentage' => ($score / $totalPoints) * 100,
            'passed' => (($score / $totalPoints) * 100) >= 70,
        ]);
    }
}
