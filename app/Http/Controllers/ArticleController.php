<?php

namespace App\Http\Controllers;

use App\Http\Requests\Quiz\UpsertArticleRequest;
use App\Http\Resources\ArticleResource;
use App\Models\Lesson;
use App\Services\ArticleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

/**
 * Controller for article (reading lesson) management.
 */
class ArticleController extends Controller
{
    public function __construct(
        private readonly ArticleService $articleService,
    ) {}

    /**
     * Get article for a lesson.
     */
    public function show(Request $request, int $lessonId): JsonResponse|InertiaResponse
    {
        $lesson = Lesson::findOrFail($lessonId);
        $article = $this->articleService->getArticleForLesson($lessonId);

        if ($request->wantsJson()) {
            return response()->json([
                'article' => $article ? new ArticleResource($article) : null,
            ]);
        }

        // For Inertia, return to the lesson page with article data
        return Inertia::render('teaching/article-edit', [
            'lessonId' => (string) $lessonId,
            'article' => $article ? new ArticleResource($article) : null,
        ]);
    }

    /**
     * Create or update article for a lesson (teacher).
     */
    public function upsert(UpsertArticleRequest $request, int $lessonId): JsonResponse
    {
        $lesson = Lesson::findOrFail($lessonId);
        $this->authorizeTeacher($lesson);

        $article = $this->articleService->upsert($lessonId, $request->input('content'));

        return response()->json([
            'message' => 'Article saved successfully',
            'article' => new ArticleResource($article),
        ]);
    }

    /**
     * Delete article for a lesson (teacher).
     */
    public function destroy(int $lessonId): JsonResponse
    {
        $lesson = Lesson::findOrFail($lessonId);
        $this->authorizeTeacher($lesson);

        $article = $this->articleService->getArticleForLesson($lessonId);

        if (! $article) {
            return response()->json(['error' => 'Article not found'], 404);
        }

        $this->articleService->delete($article);

        return response()->json(['message' => 'Article deleted successfully']);
    }

    /**
     * Get article for reading (student view).
     */
    public function read(Request $request, int $lessonId): JsonResponse
    {
        $article = $this->articleService->getArticleForLesson($lessonId);

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

    private function authorizeTeacher(Lesson $lesson): void
    {
        $user = auth()->user();
        $course = $lesson->module->course;

        if (! $course->isOwnedBy($user) && ! $user->hasRole('admin')) {
            abort(403, 'You do not have permission to manage this article');
        }
    }
}
