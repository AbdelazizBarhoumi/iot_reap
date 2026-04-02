<?php

namespace App\Repositories;

use App\Models\Article;

/**
 * Repository for Article model operations.
 */
class ArticleRepository
{
    /**
     * Find an article by ID.
     *
     * @deprecated Unused - findByLessonId() is used instead. Candidate for removal.
     */
    public function findById(int $id): ?Article
    {
        return Article::find($id);
    }

    /**
     * Find an article by lesson ID.
     */
    public function findByLessonId(int $lessonId): ?Article
    {
        return Article::where('lesson_id', $lessonId)->first();
    }

    /**
     * Create a new article.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Article
    {
        return Article::create($data);
    }

    /**
     * Update an article.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(Article $article, array $data): Article
    {
        $article->update($data);

        return $article->fresh();
    }

    /**
     * Delete an article.
     */
    public function delete(Article $article): bool
    {
        return $article->delete();
    }
}
