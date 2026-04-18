<?php

namespace App\Repositories;

use App\Models\Article;

/**
 * Repository for Article model operations.
 */
class ArticleRepository
{
    /**
     * Find an article by trainingUnit ID.
     */
    public function findByTrainingUnitId(int $trainingUnitId): ?Article
    {
        return Article::where('training_unit_id', $trainingUnitId)->first();
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
