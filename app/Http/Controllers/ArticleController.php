<?php

namespace App\Http\Controllers;

use App\Http\Requests\Quiz\UpsertArticleRequest;
use App\Http\Resources\ArticleResource;
use App\Models\TrainingUnit;
use App\Services\ArticleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

/**
 * Controller for article (reading trainingUnit) management.
 */
class ArticleController extends Controller
{
    public function __construct(
        private readonly ArticleService $articleService,
    ) {}

    /**
     * Get article for a trainingUnit.
     */
    public function show(Request $request, int $trainingUnitId): JsonResponse|InertiaResponse
    {
        $trainingUnit = TrainingUnit::findOrFail($trainingUnitId);
        $article = $this->articleService->getArticleForTrainingUnit($trainingUnitId);

        if ($request->wantsJson()) {
            return response()->json([
                'article' => $article ? new ArticleResource($article) : null,
            ]);
        }

        // For Inertia, return to the trainingUnit page with article data
        return Inertia::render('teaching/article-edit', [
            'trainingUnitId' => (string) $trainingUnitId,
            'article' => $article ? new ArticleResource($article) : null,
        ]);
    }

    /**
     * Create or update article for a trainingUnit (teacher).
     */
    public function upsert(UpsertArticleRequest $request, int $trainingUnitId): JsonResponse
    {
        $trainingUnit = TrainingUnit::findOrFail($trainingUnitId);
        $this->authorizeTeacher($trainingUnit);

        $article = $this->articleService->upsert($trainingUnitId, $request->input('content'));

        return response()->json([
            'message' => 'Article saved successfully',
            'article' => new ArticleResource($article),
        ]);
    }

    /**
     * Delete article for a trainingUnit (teacher).
     */
    public function destroy(int $trainingUnitId): JsonResponse
    {
        $trainingUnit = TrainingUnit::findOrFail($trainingUnitId);
        $this->authorizeTeacher($trainingUnit);

        $article = $this->articleService->getArticleForTrainingUnit($trainingUnitId);

        if (! $article) {
            return response()->json(['error' => 'Article not found'], 404);
        }

        $this->articleService->delete($article);

        return response()->json(['message' => 'Article deleted successfully']);
    }

    /**
     * Get article for reading (student view).
     */
    public function read(Request $request, int $trainingUnitId): JsonResponse
    {
        $article = $this->articleService->getArticleForTrainingUnit($trainingUnitId);

        if (! $article) {
            return response()->json(['error' => 'Article not found'], 404);
        }

        return response()->json([
            'article' => new ArticleResource($article),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Authorization Helper
    // ─────────────────────────────────────────────────────────────────────────

    private function authorizeTeacher(TrainingUnit $trainingUnit): void
    {
        $user = auth()->user();
        $trainingPath = $trainingUnit->module->trainingPath;

        if (! $trainingPath->isOwnedBy($user) && ! $user->hasRole('admin')) {
            abort(403, 'You do not have permission to manage this article');
        }
    }
}
