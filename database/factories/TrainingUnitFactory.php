<?php

namespace Database\Factories;

use App\Enums\TrainingUnitType;
use App\Models\TrainingPathModule;
use App\Models\TrainingUnit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TrainingUnit>
 */
class TrainingUnitFactory extends Factory
{
    protected $model = TrainingUnit::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = $this->faker->randomElement(TrainingUnitType::cases());

        return [
            'module_id' => TrainingPathModule::factory(),
            'title' => $this->faker->sentence(4),
            'type' => $type,
            'duration' => $this->faker->numberBetween(10, 60).' min',
            'content' => $this->faker->paragraphs(3, true),
            'objectives' => $this->faker->sentences(3),
            'vm_enabled' => $type === TrainingUnitType::VM_LAB,
            'video_url' => $type === TrainingUnitType::VIDEO ? $this->faker->url() : null,
            'resources' => null,
            'sort_order' => 0,
        ];
    }

    /**
     * TrainingUnit is a video.
     */
    public function video(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => TrainingUnitType::VIDEO,
            'video_url' => $this->faker->url(),
            'vm_enabled' => false,
        ]);
    }

    /**
     * TrainingUnit is reading.
     */
    public function reading(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => TrainingUnitType::READING,
            'video_url' => null,
            'vm_enabled' => false,
        ]);
    }

    /**
     * TrainingUnit is practice.
     */
    public function practice(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => TrainingUnitType::PRACTICE,
            'video_url' => null,
            'vm_enabled' => false,
        ]);
    }

    /**
     * TrainingUnit is VM lab.
     */
    public function vmLab(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => TrainingUnitType::VM_LAB,
            'video_url' => null,
            'vm_enabled' => true,
        ]);
    }
}
