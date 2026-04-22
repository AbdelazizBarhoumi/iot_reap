<?php

namespace Database\Factories;

use App\Models\DiscussionThread;
use App\Models\ThreadReply;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ThreadReply>
 */
class ThreadReplyFactory extends Factory
{
    protected $model = ThreadReply::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'thread_id' => DiscussionThread::factory(),
            'author_id' => User::factory(),
            'parent_id' => null,
            'content' => fake()->paragraphs(2, true),
            'is_answer' => false,
            'is_flagged' => false,
            'upvote_count' => fake()->numberBetween(0, 20),
        ];
    }

    /**
     * Make the reply marked as answer.
     */
    public function answer(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_answer' => true,
        ]);
    }

    /**
     * Make the reply flagged.
     */
    public function flagged(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_flagged' => true,
        ]);
    }

    /**
     * Make this reply a child of another reply.
     */
    public function childOf(ThreadReply $parentReply): static
    {
        return $this->state(fn (array $attributes) => [
            'thread_id' => $parentReply->thread_id,
            'parent_id' => $parentReply->id,
        ]);
    }
}
