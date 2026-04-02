<?php

namespace Database\Factories;

use App\Models\Lesson;
use App\Models\LessonNote;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\LessonNote>
 */
class LessonNoteFactory extends Factory
{
    protected $model = LessonNote::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'lesson_id' => Lesson::factory(),
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
