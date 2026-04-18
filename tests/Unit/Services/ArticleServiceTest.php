<?php

namespace Tests\Unit\Services;

use App\Models\Article;
use App\Models\TrainingUnit;
use App\Services\ArticleService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ArticleServiceTest extends TestCase
{
    use RefreshDatabase;

    private ArticleService $articleService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->articleService = app(ArticleService::class);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Create
    // ─────────────────────────────────────────────────────────────────────────

    public function test_creates_article_with_word_count(): void
    {
        $trainingUnit = TrainingUnit::factory()->reading()->create();

        $content = $this->makeTipTapContent(['Hello world this is a test']);

        $article = $this->articleService->create($trainingUnit->id, $content);

        $this->assertInstanceOf(Article::class, $article);
        $this->assertEquals($trainingUnit->id, $article->training_unit_id);
        $this->assertEquals(6, $article->word_count);
        $this->assertEquals(1, $article->estimated_read_time_minutes);
        $this->assertDatabaseHas('articles', [
            'training_unit_id' => $trainingUnit->id,
            'word_count' => 6,
        ]);
    }

    public function test_creates_article_with_empty_content(): void
    {
        $trainingUnit = TrainingUnit::factory()->reading()->create();

        $content = ['type' => 'doc', 'content' => []];

        $article = $this->articleService->create($trainingUnit->id, $content);

        $this->assertEquals(0, $article->word_count);
        $this->assertEquals(1, $article->estimated_read_time_minutes);
    }

    public function test_creates_article_with_nested_tiptap_structure(): void
    {
        $trainingUnit = TrainingUnit::factory()->reading()->create();

        $content = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'heading',
                    'content' => [
                        ['type' => 'text', 'text' => 'Introduction'],
                    ],
                ],
                [
                    'type' => 'paragraph',
                    'content' => [
                        ['type' => 'text', 'text' => 'First paragraph '],
                        ['type' => 'text', 'text' => 'with bold text.', 'marks' => [['type' => 'bold']]],
                    ],
                ],
                [
                    'type' => 'bulletList',
                    'content' => [
                        [
                            'type' => 'listItem',
                            'content' => [
                                [
                                    'type' => 'paragraph',
                                    'content' => [
                                        ['type' => 'text', 'text' => 'Item one'],
                                    ],
                                ],
                            ],
                        ],
                        [
                            'type' => 'listItem',
                            'content' => [
                                [
                                    'type' => 'paragraph',
                                    'content' => [
                                        ['type' => 'text', 'text' => 'Item two'],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $article = $this->articleService->create($trainingUnit->id, $content);

        // "Introduction" + "First paragraph with bold text." + "Item one" + "Item two"
        // = 1 + 5 + 2 + 2 = 10 words
        $this->assertEquals(10, $article->word_count);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Update
    // ─────────────────────────────────────────────────────────────────────────

    public function test_updates_article_and_recalculates_word_count(): void
    {
        $article = Article::factory()->create();
        $originalWordCount = $article->word_count;

        $newContent = $this->makeTipTapContent([
            'This is updated content with more words than before.',
            'Adding another paragraph with additional text.',
        ]);

        $updated = $this->articleService->update($article, $newContent);

        // Verify word count was recalculated based on new content
        $expectedWordCount = Article::calculateWordCount($newContent);
        $this->assertNotEquals($originalWordCount, $updated->word_count);
        $this->assertEquals($expectedWordCount, $updated->word_count);
        $this->assertDatabaseHas('articles', [
            'id' => $article->id,
            'word_count' => $expectedWordCount,
        ]);
    }

    public function test_updates_article_to_empty_content(): void
    {
        $article = Article::factory()->create();
        $this->assertGreaterThan(0, $article->word_count);

        $emptyContent = ['type' => 'doc', 'content' => []];

        $updated = $this->articleService->update($article, $emptyContent);

        $this->assertEquals(0, $updated->word_count);
        $this->assertEquals(1, $updated->estimated_read_time_minutes);
    }

    public function test_updates_estimated_read_time_for_long_content(): void
    {
        $article = Article::factory()->create();

        // Create content with ~600 words (should be 3 minutes)
        $words = array_fill(0, 600, 'word');
        $longText = implode(' ', $words);
        $content = $this->makeTipTapContent([$longText]);

        $updated = $this->articleService->update($article, $content);

        $this->assertEquals(600, $updated->word_count);
        $this->assertEquals(3, $updated->estimated_read_time_minutes);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Delete
    // ─────────────────────────────────────────────────────────────────────────

    public function test_deletes_article(): void
    {
        $article = Article::factory()->create();
        $articleId = $article->id;

        $result = $this->articleService->delete($article);

        $this->assertTrue($result);
        $this->assertDatabaseMissing('articles', ['id' => $articleId]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Get Article For TrainingUnit
    // ─────────────────────────────────────────────────────────────────────────

    public function test_gets_article_for_trainingUnit(): void
    {
        $trainingUnit = TrainingUnit::factory()->reading()->create();
        $article = Article::factory()->create(['training_unit_id' => $trainingUnit->id]);

        $found = $this->articleService->getArticleForTrainingUnit($trainingUnit->id);

        $this->assertNotNull($found);
        $this->assertEquals($article->id, $found->id);
    }

    public function test_returns_null_for_training_unit_without_article(): void
    {
        $trainingUnit = TrainingUnit::factory()->reading()->create();

        $found = $this->articleService->getArticleForTrainingUnit($trainingUnit->id);

        $this->assertNull($found);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Upsert
    // ─────────────────────────────────────────────────────────────────────────

    public function test_upsert_creates_article_when_none_exists(): void
    {
        $trainingUnit = TrainingUnit::factory()->reading()->create();
        $content = $this->makeTipTapContent(['New article content here']);

        $article = $this->articleService->upsert($trainingUnit->id, $content);

        $this->assertInstanceOf(Article::class, $article);
        $this->assertEquals($trainingUnit->id, $article->training_unit_id);
        $this->assertEquals(4, $article->word_count);
        $this->assertDatabaseHas('articles', [
            'training_unit_id' => $trainingUnit->id,
        ]);
    }

    public function test_upsert_updates_article_when_exists(): void
    {
        $trainingUnit = TrainingUnit::factory()->reading()->create();
        $existingArticle = Article::factory()->create(['training_unit_id' => $trainingUnit->id]);
        $originalWordCount = $existingArticle->word_count;

        $newContent = $this->makeTipTapContent(['Completely different content now']);

        $article = $this->articleService->upsert($trainingUnit->id, $newContent);

        $this->assertEquals($existingArticle->id, $article->id);
        $this->assertNotEquals($originalWordCount, $article->word_count);
        $this->assertEquals(4, $article->word_count);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Word Count Calculation (via Article Model)
    // ─────────────────────────────────────────────────────────────────────────

    public function test_calculates_word_count_from_simple_tiptap(): void
    {
        $content = $this->makeTipTapContent(['Hello world']);

        $wordCount = Article::calculateWordCount($content);

        $this->assertEquals(2, $wordCount);
    }

    public function test_calculates_word_count_from_multiple_paragraphs(): void
    {
        $content = $this->makeTipTapContent([
            'First paragraph text.',
            'Second paragraph text.',
        ]);

        $wordCount = Article::calculateWordCount($content);

        $this->assertEquals(6, $wordCount);
    }

    public function test_calculates_word_count_from_empty_content(): void
    {
        $content = ['type' => 'doc', 'content' => []];

        $wordCount = Article::calculateWordCount($content);

        $this->assertEquals(0, $wordCount);
    }

    public function test_calculates_word_count_from_deeply_nested_content(): void
    {
        $content = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'blockquote',
                    'content' => [
                        [
                            'type' => 'paragraph',
                            'content' => [
                                ['type' => 'text', 'text' => 'Quoted text here'],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $wordCount = Article::calculateWordCount($content);

        $this->assertEquals(3, $wordCount);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Read Time Calculation
    // ─────────────────────────────────────────────────────────────────────────

    public function test_calculates_read_time_minimum_one_minute(): void
    {
        $readTime = Article::calculateReadTime(0);
        $this->assertEquals(1, $readTime);

        $readTime = Article::calculateReadTime(50);
        $this->assertEquals(1, $readTime);

        $readTime = Article::calculateReadTime(199);
        $this->assertEquals(1, $readTime);
    }

    public function test_calculates_read_time_rounds_up(): void
    {
        // 201 words = 1.005 minutes = 2 minutes (rounded up)
        $readTime = Article::calculateReadTime(201);
        $this->assertEquals(2, $readTime);

        // 400 words = 2 minutes exactly
        $readTime = Article::calculateReadTime(400);
        $this->assertEquals(2, $readTime);

        // 1000 words = 5 minutes
        $readTime = Article::calculateReadTime(1000);
        $this->assertEquals(5, $readTime);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Create a TipTap JSON structure from an array of paragraph texts.
     *
     * @param  array<string>  $paragraphs
     * @return array<string, mixed>
     */
    private function makeTipTapContent(array $paragraphs): array
    {
        $content = [];
        foreach ($paragraphs as $text) {
            $content[] = [
                'type' => 'paragraph',
                'content' => [
                    ['type' => 'text', 'text' => $text],
                ],
            ];
        }

        return [
            'type' => 'doc',
            'content' => $content,
        ];
    }
}
