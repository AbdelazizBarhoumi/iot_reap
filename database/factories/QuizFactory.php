<?php

namespace Database\Factories;

use App\Models\Quiz;
use App\Models\TrainingUnit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Quiz>
 */
class QuizFactory extends Factory
{
    protected $model = Quiz::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'training_unit_id' => TrainingUnit::factory()->practice(),
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->paragraph(2),
            'passing_score' => $this->faker->randomElement([60, 70, 75, 80, 85]),
            'time_limit_minutes' => $this->faker->randomElement([15, 30, 45, 60]),
            'max_attempts' => $this->faker->randomElement([null, 1, 2, 3, 5]),
            'shuffle_questions' => $this->faker->boolean(30),
            'shuffle_options' => $this->faker->boolean(50),
            'show_correct_answers' => $this->faker->boolean(70),
            'is_published' => false,
        ];
    }

    /**
     * Quiz is published.
     */
    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_published' => true,
        ]);
    }

    /**
     * Quiz is unpublished/draft.
     */
    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_published' => false,
        ]);
    }

    /**
     * Quiz with unlimited attempts.
     */
    public function unlimitedAttempts(): static
    {
        return $this->state(fn (array $attributes) => [
            'max_attempts' => null,
        ]);
    }

    /**
     * Quiz with specific max attempts.
     */
    public function withMaxAttempts(int $attempts): static
    {
        return $this->state(fn (array $attributes) => [
            'max_attempts' => $attempts,
        ]);
    }

    /**
     * Quiz with no time limit.
     */
    public function noTimeLimit(): static
    {
        return $this->state(fn (array $attributes) => [
            'time_limit_minutes' => null,
        ]);
    }

    /**
     * Quiz with specific time limit.
     */
    public function withTimeLimit(int $minutes): static
    {
        return $this->state(fn (array $attributes) => [
            'time_limit_minutes' => $minutes,
        ]);
    }

    /**
     * Quiz with specific passing score.
     */
    public function withPassingScore(int $score): static
    {
        return $this->state(fn (array $attributes) => [
            'passing_score' => $score,
        ]);
    }

    /**
     * Quiz with shuffling enabled.
     */
    public function shuffled(): static
    {
        return $this->state(fn (array $attributes) => [
            'shuffle_questions' => true,
            'shuffle_options' => true,
        ]);
    }

    /**
     * Quiz without shuffling.
     */
    public function notShuffled(): static
    {
        return $this->state(fn (array $attributes) => [
            'shuffle_questions' => false,
            'shuffle_options' => false,
        ]);
    }
}
