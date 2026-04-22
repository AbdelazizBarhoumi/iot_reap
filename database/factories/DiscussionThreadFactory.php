<?php

namespace Database\Factories;

use App\Enums\ThreadStatus;
use App\Models\DiscussionThread;
use App\Models\TrainingPath;
use App\Models\TrainingUnit;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DiscussionThread>
 */
class DiscussionThreadFactory extends Factory
{
    protected $model = DiscussionThread::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'training_unit_id' => TrainingUnit::factory(),
            'training_path_id' => TrainingPath::factory(),
            'author_id' => User::factory(),
            'title' => fake()->sentence(6),
            'content' => fake()->paragraphs(3, true),
            'status' => ThreadStatus::OPEN,
            'is_pinned' => false,
            'is_locked' => false,
            'is_flagged' => false,
            'view_count' => fake()->numberBetween(0, 100),
            'reply_count' => 0,
            'upvote_count' => fake()->numberBetween(0, 50),
            'last_reply_at' => null,
            'last_reply_by' => null,
        ];
    }

    /**
     * Make the thread pinned.
     */
    public function pinned(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_pinned' => true,
            'status' => ThreadStatus::PINNED,
        ]);
    }

    /**
     * Make the thread locked.
     */
    public function locked(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_locked' => true,
            'status' => ThreadStatus::LOCKED,
        ]);
    }

    /**
     * Make the thread flagged.
     */
    public function flagged(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_flagged' => true,
        ]);
    }

    /**
     * Thread with replies.
     */
    public function withReplies(int $count = 3): static
    {
        return $this->state(fn (array $attributes) => [
            'reply_count' => $count,
            'last_reply_at' => now()->subMinutes(fake()->numberBetween(1, 60)),
            'last_reply_by' => User::factory()->create()->id,
        ]);
    }

    /**
     * Thread without a trainingUnit (trainingPath-level).
     */
    public function trainingPathLevel(): static
    {
        return $this->state(fn (array $attributes) => [
            'training_unit_id' => null,
        ]);
    }
}
