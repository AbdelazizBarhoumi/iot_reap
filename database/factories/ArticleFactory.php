<?php

namespace Database\Factories;

use App\Models\Article;
use App\Models\Lesson;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Article>
 */
class ArticleFactory extends Factory
{
    protected $model = Article::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $content = $this->generateTipTapContent($this->faker->paragraphs(3));
        $wordCount = Article::calculateWordCount($content);

        return [
            'lesson_id' => Lesson::factory()->reading(),
            'content' => $content,
            'word_count' => $wordCount,
            'estimated_read_time_minutes' => Article::calculateReadTime($wordCount),
        ];
    }

    /**
     * Generate TipTap JSON structure from paragraphs.
     *
     * @param  array<string>  $paragraphs
     * @return array<string, mixed>
     */
    private function generateTipTapContent(array $paragraphs): array
    {
        $content = [];
        foreach ($paragraphs as $paragraph) {
            $content[] = [
                'type' => 'paragraph',
                'content' => [
                    ['type' => 'text', 'text' => $paragraph],
                ],
            ];
        }

        return [
            'type' => 'doc',
            'content' => $content,
        ];
    }

    /**
     * Article with specific word count.
     */
    public function withWordCount(int $wordCount): static
    {
        // Generate content that approximates the target word count
        $wordsPerParagraph = 50;
        $paragraphCount = max(1, (int) ceil($wordCount / $wordsPerParagraph));
        $paragraphs = $this->faker->paragraphs($paragraphCount);

        return $this->state(fn (array $attributes) => [
            'content' => $this->generateTipTapContent($paragraphs),
            'word_count' => $wordCount,
            'estimated_read_time_minutes' => Article::calculateReadTime($wordCount),
        ]);
    }

    /**
     * Article with empty content.
     */
    public function empty(): static
    {
        return $this->state(fn (array $attributes) => [
            'content' => ['type' => 'doc', 'content' => []],
            'word_count' => 0,
            'estimated_read_time_minutes' => 1,
        ]);
    }
}
