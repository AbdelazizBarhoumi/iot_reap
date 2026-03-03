<?php

namespace Database\Factories;

use App\Enums\CourseLevel;
use App\Enums\CourseStatus;
use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Course>
 */
class CourseFactory extends Factory
{
    protected $model = Course::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = ['Web Development', 'Cloud & DevOps', 'Data Science', 'Cybersecurity', 'Mobile Development', 'AI & ML'];

        return [
            'title' => $this->faker->sentence(4),
            'description' => $this->faker->paragraphs(2, true),
            'instructor_id' => User::factory(),
            'thumbnail' => null,
            'category' => $this->faker->randomElement($categories),
            'level' => $this->faker->randomElement(CourseLevel::cases()),
            'duration' => $this->faker->numberBetween(10, 60) . ' hours',
            'rating' => $this->faker->randomFloat(1, 3.5, 5.0),
            'has_virtual_machine' => $this->faker->boolean(30),
            'status' => CourseStatus::DRAFT,
            'admin_feedback' => null,
        ];
    }

    /**
     * Course is approved.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => CourseStatus::APPROVED,
        ]);
    }

    /**
     * Course is pending review.
     */
    public function pendingReview(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => CourseStatus::PENDING_REVIEW,
        ]);
    }

    /**
     * Course is rejected.
     */
    public function rejected(string $feedback = 'Does not meet quality standards'): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => CourseStatus::REJECTED,
            'admin_feedback' => $feedback,
        ]);
    }

    /**
     * Course has VM labs.
     */
    public function withVirtualMachine(): static
    {
        return $this->state(fn (array $attributes) => [
            'has_virtual_machine' => true,
        ]);
    }
}
