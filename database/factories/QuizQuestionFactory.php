<?php

namespace Database\Factories;

use App\Enums\QuizQuestionType;
use App\Models\Quiz;
use App\Models\QuizQuestion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<QuizQuestion>
 */
class QuizQuestionFactory extends Factory
{
    protected $model = QuizQuestion::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'quiz_id' => Quiz::factory(),
            'question' => $this->faker->sentence().'?',
            'type' => $this->faker->randomElement(QuizQuestionType::cases()),
            'points' => $this->faker->randomElement([1, 2, 5, 10]),
            'sort_order' => 0,
        ];
    }

    /**
     * Multiple choice question.
     */
    public function multipleChoice(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => QuizQuestionType::MULTIPLE_CHOICE,
        ]);
    }

    /**
     * True/false question.
     */
    public function trueFalse(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => QuizQuestionType::TRUE_FALSE,
        ]);
    }

    /**
     * Short answer question.
     */
    public function shortAnswer(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => QuizQuestionType::SHORT_ANSWER,
        ]);
    }

    /**
     * Question with specific points.
     */
    public function withPoints(int $points): static
    {
        return $this->state(fn (array $attributes) => [
            'points' => $points,
        ]);
    }

    /**
     * Question with specific sort order.
     */
    public function withSortOrder(int $order): static
    {
        return $this->state(fn (array $attributes) => [
            'sort_order' => $order,
        ]);
    }
}
