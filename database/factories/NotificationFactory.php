<?php

namespace Database\Factories;

use App\Enums\NotificationType;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Notification>
 */
class NotificationFactory extends Factory
{
    protected $model = Notification::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'type' => fake()->randomElement(NotificationType::cases()),
            'title' => fake()->sentence(4),
            'message' => fake()->sentence(10),
            'action_url' => fake()->optional(0.7)->url(),
            'data' => null,
            'read_at' => null,
        ];
    }

    /**
     * Mark the notification as read.
     */
    public function read(): static
    {
        return $this->state(fn (array $attributes) => [
            'read_at' => now(),
        ]);
    }

    /**
     * Mark the notification as unread.
     */
    public function unread(): static
    {
        return $this->state(fn (array $attributes) => [
            'read_at' => null,
        ]);
    }

    /**
     * Set notification type to system.
     */
    public function system(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => NotificationType::SYSTEM,
        ]);
    }

    /**
     * Set notification type to announcement.
     */
    public function announcement(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => NotificationType::ANNOUNCEMENT,
        ]);
    }

    /**
     * Set notification type to course approved.
     */
    public function courseApproved(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => NotificationType::COURSE_APPROVED,
            'title' => 'Course Approved!',
            'message' => 'Your course has been approved.',
        ]);
    }

    /**
     * Set notification type to forum reply.
     */
    public function forumReply(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => NotificationType::FORUM_REPLY,
            'title' => 'New Reply to Your Post',
        ]);
    }

    /**
     * Include custom data.
     */
    public function withData(array $data): static
    {
        return $this->state(fn (array $attributes) => [
            'data' => $data,
        ]);
    }
}
