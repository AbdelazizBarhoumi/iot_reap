<?php

namespace Database\Factories;

use App\Enums\LessonType;
use App\Models\CourseModule;
use App\Models\Lesson;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Lesson>
 */
class LessonFactory extends Factory
{
    protected $model = Lesson::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = $this->faker->randomElement(LessonType::cases());
        
        return [
            'module_id' => CourseModule::factory(),
            'title' => $this->faker->sentence(4),
            'type' => $type,
            'duration' => $this->faker->numberBetween(10, 60) . ' min',
            'content' => $this->faker->paragraphs(3, true),
            'objectives' => $this->faker->sentences(3),
            'vm_enabled' => $type === LessonType::VM_LAB,
            'video_url' => $type === LessonType::VIDEO ? $this->faker->url() : null,
            'resources' => null,
            'sort_order' => 0,
        ];
    }

    /**
     * Lesson is a video.
     */
    public function video(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => LessonType::VIDEO,
            'video_url' => $this->faker->url(),
            'vm_enabled' => false,
        ]);
    }

    /**
     * Lesson is reading.
     */
    public function reading(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => LessonType::READING,
            'video_url' => null,
            'vm_enabled' => false,
        ]);
    }

    /**
     * Lesson is practice.
     */
    public function practice(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => LessonType::PRACTICE,
            'video_url' => null,
            'vm_enabled' => false,
        ]);
    }

    /**
     * Lesson is VM lab.
     */
    public function vmLab(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => LessonType::VM_LAB,
            'video_url' => null,
            'vm_enabled' => true,
        ]);
    }
}
