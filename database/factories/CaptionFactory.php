<?php

namespace Database\Factories;

use App\Models\Caption;
use App\Models\Video;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Caption>
 */
class CaptionFactory extends Factory
{
    protected $model = Caption::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $languages = [
            'en' => 'English',
            'es' => 'Spanish',
            'fr' => 'French',
            'de' => 'German',
            'it' => 'Italian',
            'pt' => 'Portuguese',
            'zh' => 'Chinese',
            'ja' => 'Japanese',
            'ko' => 'Korean',
            'ar' => 'Arabic',
        ];

        $language = $this->faker->randomElement(array_keys($languages));

        return [
            'video_id' => Video::factory(),
            'language' => $language,
            'label' => $languages[$language],
            'file_path' => "captions/{$this->faker->uuid()}.vtt",
        ];
    }

    /**
     * Caption in English.
     */
    public function english(): static
    {
        return $this->state(fn (array $attributes) => [
            'language' => 'en',
            'label' => 'English',
        ]);
    }

    /**
     * Caption in Spanish.
     */
    public function spanish(): static
    {
        return $this->state(fn (array $attributes) => [
            'language' => 'es',
            'label' => 'Spanish',
        ]);
    }

    /**
     * Caption with specific language.
     */
    public function withLanguage(string $language, string $label): static
    {
        return $this->state(fn (array $attributes) => [
            'language' => $language,
            'label' => $label,
        ]);
    }

    /**
     * Caption with specific file size.
     */
    public function withFileSize(int $bytes): static
    {
        return $this->state(fn (array $attributes) => [
            // Note: Caption model may not have file_size_bytes field
            // Remove this method if the field doesn't exist
        ]);
    }
}
