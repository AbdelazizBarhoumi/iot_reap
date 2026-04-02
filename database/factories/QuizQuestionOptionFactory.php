<?php

namespace Database\Factories;

use App\Models\QuizQuestion;
use App\Models\QuizQuestionOption;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<QuizQuestionOption>
 */
class QuizQuestionOptionFactory extends Factory
{
    protected $model = QuizQuestionOption::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'question_id' => QuizQuestion::factory(),
            'option_text' => $this->faker->sentence(3),
            'is_correct' => false,
            'sort_order' => 0,
        ];
    }

    /**
     * Correct option.
     */
    public function correct(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_correct' => true,
        ]);
    }

    /**
     * Incorrect option.
     */
    public function incorrect(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_correct' => false,
        ]);
    }

    /**
     * Option with specific text.
     */
    public function withText(string $text): static
    {
        return $this->state(fn (array $attributes) => [
            'option_text' => $text,
        ]);
    }

    /**
     * Option with specific sort order.
     */
    public function withSortOrder(int $order): static
    {
        return $this->state(fn (array $attributes) => [
            'sort_order' => $order,
        ]);
    }
}
