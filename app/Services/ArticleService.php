<?php

namespace App\Services;

use App\Models\Article;
use App\Models\Lesson;
use App\Repositories\ArticleRepository;
use Illuminate\Support\Facades\Log;

/**
 * Service for article (reading lesson) management.
 */
class ArticleService
{
    public function __construct(
        private readonly ArticleRepository $articleRepository,
    ) {}

    /**
     * Create a new article for a lesson.
     *
     * @param  array<string, mixed>  $content  TipTap JSON content
     */
    public function create(int $lessonId, array $content): Article
    {
        Log::info('Creating article', ['lesson_id' => $lessonId]);

        // Calculate word count and read time (business logic)
        $wordCount = $this->calculateWordCount($content);
        $readTime = $this->calculateReadTime($wordCount);

        return $this->articleRepository->create([
            'lesson_id' => $lessonId,
            'content' => $content,
            'word_count' => $wordCount,
            'estimated_read_time_minutes' => $readTime,
        ]);
    }

    /**
     * Update an article's content.
     *
     * @param  array<string, mixed>  $content  TipTap JSON content
     */
    public function update(Article $article, array $content): Article
    {
        Log::info('Updating article', ['article_id' => $article->id]);

        // Calculate word count and read time (business logic)
        $wordCount = $this->calculateWordCount($content);
        $readTime = $this->calculateReadTime($wordCount);

        return $this->articleRepository->update($article, [
            'content' => $content,
            'word_count' => $wordCount,
            'estimated_read_time_minutes' => $readTime,
        ]);
    }

    /**
     * Delete an article.
     */
    public function delete(Article $article): bool
    {
        Log::info('Deleting article', ['article_id' => $article->id]);

        return $this->articleRepository->delete($article);
    }

    /**
     * Get article for a lesson.
     */
    public function getArticleForLesson(int $lessonId): ?Article
    {
        return $this->articleRepository->findByLessonId($lessonId);
    }

    /**
     * Create or update article for a lesson.
     *
     * @param  array<string, mixed>  $content  TipTap JSON content
     */
    public function upsert(int $lessonId, array $content): Article
    {
        $existing = $this->articleRepository->findByLessonId($lessonId);

        if ($existing) {
            return $this->update($existing, $content);
        }

        return $this->create($lessonId, $content);
    }

    /**
     * Calculate word count from TipTap JSON content.
     *
     * @param  array<string, mixed>  $content  TipTap JSON content
     */
    private function calculateWordCount(array $content): int
    {
        // Use the model's existing method but move the call to service
        return Article::calculateWordCount($content);
    }

    /**
     * Calculate estimated read time based on word count.
     *
     * Uses standard reading speed of 200 words per minute.
     */
    private function calculateReadTime(int $wordCount): int
    {
        // Use the model's existing method but move the call to service
        return Article::calculateReadTime($wordCount);
    }
}
