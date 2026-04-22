<?php

namespace Database\Factories;

use App\Enums\TrainingPathLevel;
use App\Enums\TrainingPathStatus;
use App\Models\TrainingPath;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TrainingPath>
 */
class TrainingPathFactory extends Factory
{
    protected $model = TrainingPath::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = [
            'Smart Manufacturing',
            'Industrial IoT',
            'Predictive Maintenance',
            'OT Cybersecurity',
            'Robotics & Automation',
            'Edge AI & Digital Twins',
        ];

        return [
            'title' => $this->faker->sentence(4),
            'description' => $this->faker->paragraphs(2, true),
            'instructor_id' => User::factory(),  // Will be lazy-loaded; can be overridden with ->create(['instructor_id' => $id])
            'thumbnail' => null,
            'category' => $this->faker->randomElement($categories),
            'level' => $this->faker->randomElement(TrainingPathLevel::cases()),
            'duration' => $this->faker->numberBetween(10, 60).' hours',
            'rating' => $this->faker->randomFloat(1, 3.5, 5.0),
            'has_virtual_machine' => $this->faker->boolean(30),
            'status' => TrainingPathStatus::DRAFT,
            'admin_feedback' => null,
        ];
    }

    /**
     * TrainingPath belongs to a specific instructor.
     */
    public function forInstructor(User|int $instructor): static
    {
        $instructorId = $instructor instanceof User ? $instructor->id : $instructor;

        return $this->state(fn (array $attributes) => [
            'instructor_id' => $instructorId,
        ]);
    }

    /**
     * TrainingPath is approved.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => TrainingPathStatus::APPROVED,
        ]);
    }

    /**
     * TrainingPath is pending review.
     */
    public function pendingReview(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => TrainingPathStatus::PENDING_REVIEW,
        ]);
    }

    /**
     * TrainingPath is rejected.
     */
    public function rejected(string $feedback = 'Does not meet quality standards'): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => TrainingPathStatus::REJECTED,
            'admin_feedback' => $feedback,
        ]);
    }

    /**
     * TrainingPath has VM labs.
     */
    public function withVirtualMachine(): static
    {
        return $this->state(fn (array $attributes) => [
            'has_virtual_machine' => true,
        ]);
    }
}
