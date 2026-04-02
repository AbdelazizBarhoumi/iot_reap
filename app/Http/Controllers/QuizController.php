<?php

namespace App\Http\Controllers;

use App\Http\Requests\Quiz\CreateQuestionRequest;
use App\Http\Requests\Quiz\CreateQuizRequest;
use App\Http\Requests\Quiz\SubmitQuizAttemptRequest;
use App\Http\Requests\Quiz\UpdateQuestionRequest;
use App\Http\Requests\Quiz\UpdateQuizRequest;
use App\Http\Resources\QuizAttemptResource;
use App\Http\Resources\QuizQuestionResource;
use App\Http\Resources\QuizResource;
use App\Models\Lesson;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
use App\Services\QuestionService;
use App\Services\QuizService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

/**
 * Controller for quiz management and taking.
 */
class QuizController extends Controller
{
    public function __construct(
        private readonly QuizService $quizService,
        private readonly QuestionService $questionService,
    ) {}

    // ─────────────────────────────────────────────────────────────────────────
    // Teacher: Quiz Management
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Get or create quiz for a lesson (teacher).
     */
    public function show(Request $request, int $lessonId): JsonResponse|InertiaResponse
    {
        $lesson = Lesson::findOrFail($lessonId);
        $this->authorizeTeacher($lesson);

        $quiz = $this->quizService->getQuizForLesson($lessonId);

        if ($request->wantsJson()) {
            return response()->json([
                'quiz' => $quiz ? new QuizResource($quiz) : null,
            ]);
        }

        return Inertia::render('teaching/quiz-edit', [
            'lessonId' => (string) $lessonId,
            'quiz' => $quiz ? new QuizResource($quiz) : null,
        ]);
    }

    /**
     * Create a quiz for a lesson.
     */
    public function store(CreateQuizRequest $request, int $lessonId): JsonResponse
    {
        $lesson = Lesson::findOrFail($lessonId);
        $this->authorizeTeacher($lesson);

        // Check if quiz already exists
        if ($this->quizService->getQuizForLesson($lessonId)) {
            return response()->json(['error' => 'Quiz already exists for this lesson'], 422);
        }

        $quiz = $this->quizService->create($lessonId, $request->validated());

        return response()->json([
            'message' => 'Quiz created successfully',
            'quiz' => new QuizResource($quiz->load('questions.options')),
        ], 201);
    }

    /**
     * Update a quiz.
     */
    public function update(UpdateQuizRequest $request, Quiz $quiz): JsonResponse
    {
        $this->authorizeTeacher($quiz->lesson);

        $quiz = $this->quizService->update($quiz, $request->validated());

        return response()->json([
            'message' => 'Quiz updated successfully',
            'quiz' => new QuizResource($quiz->load('questions.options')),
        ]);
    }

    /**
     * Delete a quiz.
     */
    public function destroy(Quiz $quiz): JsonResponse
    {
        $this->authorizeTeacher($quiz->lesson);

        $this->quizService->delete($quiz);

        return response()->json(['message' => 'Quiz deleted successfully']);
    }

    /**
     * Publish a quiz.
     */
    public function publish(Quiz $quiz): JsonResponse
    {
        $this->authorizeTeacher($quiz->lesson);

        try {
            $quiz = $this->quizService->publish($quiz);

            return response()->json([
                'message' => 'Quiz published successfully',
                'quiz' => new QuizResource($quiz),
            ]);
        } catch (\DomainException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    /**
     * Unpublish a quiz.
     */
    public function unpublish(Quiz $quiz): JsonResponse
    {
        $this->authorizeTeacher($quiz->lesson);

        $quiz = $this->quizService->unpublish($quiz);

        return response()->json([
            'message' => 'Quiz unpublished successfully',
            'quiz' => new QuizResource($quiz),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Teacher: Question Management
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Add a question to a quiz.
     */
    public function storeQuestion(CreateQuestionRequest $request, Quiz $quiz): JsonResponse
    {
        $this->authorizeTeacher($quiz->lesson);

        $question = $this->questionService->create(
            $quiz,
            $request->validated(),
            $request->input('options', [])
        );

        return response()->json([
            'message' => 'Question added successfully',
            'question' => new QuizQuestionResource($question->load('options')),
        ], 201);
    }

    /**
     * Update a question.
     */
    public function updateQuestion(UpdateQuestionRequest $request, QuizQuestion $question): JsonResponse
    {
        $this->authorizeTeacher($question->quiz->lesson);

        $question = $this->questionService->update(
            $question,
            $request->validated(),
            $request->input('options', [])
        );

        return response()->json([
            'message' => 'Question updated successfully',
            'question' => new QuizQuestionResource($question->load('options')),
        ]);
    }

    /**
     * Delete a question.
     */
    public function destroyQuestion(QuizQuestion $question): JsonResponse
    {
        $this->authorizeTeacher($question->quiz->lesson);

        $this->questionService->delete($question);

        return response()->json(['message' => 'Question deleted successfully']);
    }

    /**
     * Reorder questions.
     */
    public function reorderQuestions(\App\Http\Requests\Quiz\ReorderQuestionsRequest $request, Quiz $quiz): JsonResponse
    {
        $this->authorizeTeacher($quiz->lesson);

        $this->questionService->reorder($request->validated('items'));

        return response()->json(['message' => 'Questions reordered successfully']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Student: Quiz Taking
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Get quiz for taking (student view).
     */
    public function take(Request $request, int $lessonId): JsonResponse|InertiaResponse
    {
        $quiz = $this->quizService->getQuizForLesson($lessonId);

        if (! $quiz || ! $quiz->is_published) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'Quiz not found'], 404);
            }
            abort(404);
        }

        $user = $request->user();

        // Get or create in-progress attempt
        $attempt = null;
        $canAttempt = $quiz->canAttempt($user);

        if ($request->wantsJson()) {
            // Don't send correct answers to client
            return response()->json([
                'quiz' => new QuizResource($quiz),
                'can_attempt' => $canAttempt,
                'attempt_count' => $quiz->getAttemptCount($user),
                'max_attempts' => $quiz->max_attempts,
            ]);
        }

        return Inertia::render('courses/quiz', [
            'lessonId' => (string) $lessonId,
            'quiz' => new QuizResource($quiz),
            'canAttempt' => $canAttempt,
            'attemptCount' => $quiz->getAttemptCount($user),
            'maxAttempts' => $quiz->max_attempts,
        ]);
    }

    /**
     * Start a quiz attempt.
     */
    public function startAttempt(Request $request, Quiz $quiz): JsonResponse
    {
        $user = $request->user();

        try {
            $attempt = $this->quizService->startAttempt($user, $quiz);

            return response()->json([
                'message' => 'Quiz attempt started',
                'attempt' => new QuizAttemptResource($attempt),
                'quiz' => new QuizResource($quiz->load('questions.options')),
            ]);
        } catch (\InvalidArgumentException|\DomainException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    /**
     * Submit quiz attempt answers.
     */
    public function submitAttempt(SubmitQuizAttemptRequest $request, QuizAttempt $attempt): JsonResponse
    {
        $user = $request->user();

        try {
            $result = $this->quizService->submitAttempt(
                $user,
                $attempt,
                $request->input('answers')
            );

            return response()->json([
                'message' => $result['attempt']->passed ? 'Congratulations! You passed!' : 'Quiz completed',
                'attempt' => new QuizAttemptResource($result['attempt']),
                'results' => $result['results'],
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    /**
     * Get attempt history for a quiz.
     */
    public function attemptHistory(Request $request, Quiz $quiz): JsonResponse
    {
        $user = $request->user();
        $attempts = $this->quizService->getAttemptHistory($user, $quiz);

        return response()->json([
            'attempts' => QuizAttemptResource::collection($attempts),
        ]);
    }

    /**
     * Get a specific attempt with detailed results.
     */
    public function showAttempt(Request $request, QuizAttempt $attempt): JsonResponse
    {
        $user = $request->user();

        if ($attempt->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $attempt->load(['answers.question.options', 'answers.selectedOption', 'quiz']);

        return response()->json([
            'attempt' => new QuizAttemptResource($attempt),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Teacher: Quiz Statistics
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Get quiz statistics (teacher only).
     */
    public function stats(Quiz $quiz): JsonResponse
    {
        $this->authorizeTeacher($quiz->lesson);

        $stats = $this->quizService->getQuizStats($quiz);

        return response()->json(['stats' => $stats]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Authorization Helper
    // ─────────────────────────────────────────────────────────────────────────

    private function authorizeTeacher(Lesson $lesson): void
    {
        $user = auth()->user();
        $course = $lesson->module->course;

        if (! $course->isOwnedBy($user) && ! $user->hasRole('admin')) {
            abort(403, 'You do not have permission to manage this quiz');
        }
    }
}
