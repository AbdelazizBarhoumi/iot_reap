<?php

namespace App\Http\Controllers;

use App\Http\Requests\TrainingPath\UpdateVideoProgressRequest;
use App\Http\Resources\TrainingPathResource;
use App\Http\Resources\TrainingUnitResource;
use App\Models\TrainingPath;
use App\Services\EnrollmentService;
use App\Services\TrainingPathService;
use App\Services\TrainingUnitVMAssignmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

/**
 * Controller for trainingPath browsing (student-facing).
 */
class TrainingPathController extends Controller
{
    public function __construct(
        private readonly TrainingPathService $trainingPathService,
        private readonly EnrollmentService $enrollmentService,
        private readonly TrainingUnitVMAssignmentService $assignmentService,
    ) {}

    /**
     * List all approved trainingPaths.
     */
    public function index(Request $request): JsonResponse|InertiaResponse
    {
        $category = $request->query('category');
        $search = $request->query('search');

        $trainingPaths = $this->trainingPathService->getApprovedTrainingPaths($category, $search);
        $categories = $this->trainingPathService->getCategories();

        if ($request->wantsJson()) {
            return response()->json([
                'data' => TrainingPathResource::collection($trainingPaths),
                'categories' => $categories,
            ]);
        }

        return Inertia::render('trainingPaths/index', [
            'trainingPaths' => TrainingPathResource::collection($trainingPaths),
            'categories' => $categories,
        ]);
    }

    /**
     * Show a trainingPath detail page.
     */
    public function show(Request $request, int $id): JsonResponse|InertiaResponse
    {
        $trainingPath = $this->trainingPathService->getTrainingPathWithContent($id);
        $user = $request->user();

        // Allow access if trainingPath exists AND (is published OR user is the instructor OR user is admin)
        $canAccess = $trainingPath && (
            $trainingPath->isPublished() ||
            ($user && ($trainingPath->isOwnedBy($user) || $user->isAdmin()))
        );

        if (! $canAccess) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'TrainingPath not found'], 404);
            }
            abort(404);
        }

        $isEnrolled = $user ? $this->enrollmentService->isEnrolled($user, $id) : false;
        $progress = $user && $isEnrolled ? $this->enrollmentService->getTrainingPathProgress($user, $trainingPath) : null;
        $completedTrainingUnitIds = $user ? $this->enrollmentService->getCompletedTrainingUnitIds($user, $id) : [];

        if ($request->wantsJson()) {
            return response()->json([
                'data' => new TrainingPathResource($trainingPath),
                'is_enrolled' => $isEnrolled,
                'progress' => $progress,
                'completed_training_unit_ids' => $completedTrainingUnitIds,
            ]);
        }

        return Inertia::render('trainingPaths/show', [
            'id' => (string) $id,
            'trainingPath' => new TrainingPathResource($trainingPath),
            'isEnrolled' => $isEnrolled,
            'progress' => $progress,
            'completedTrainingUnitIds' => $completedTrainingUnitIds,
        ]);
    }

    /**
     * Show a trainingUnit viewer page.
     */
    public function trainingUnit(Request $request, int $trainingPathId, int $trainingUnitId): JsonResponse|InertiaResponse
    {
        $trainingPath = $this->trainingPathService->getTrainingPathWithContent($trainingPathId);

        if (! $trainingPath || ! $trainingPath->isPublished()) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'TrainingPath not found'], 404);
            }
            abort(404);
        }

        $trainingUnit = $trainingPath->trainingUnits()->where('training_units.id', $trainingUnitId)->first();

        if (! $trainingUnit) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'TrainingUnit not found'], 404);
            }
            abort(404);
        }

        $user = $request->user();

        // Check if user is enrolled (required for trainingUnit access)
        if (! $user || ! $this->enrollmentService->isEnrolled($user, $trainingPathId)) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'You must be enrolled to access this trainingUnit'], 403);
            }
            abort(403, 'You must be enrolled to access this trainingUnit');
        }

        $completedTrainingUnitIds = $this->enrollmentService->getCompletedTrainingUnitIds($user, $trainingPathId);

        // Get VM info for the trainingUnit (if available and user is enrolled)
        $vmInfo = null;
        if ($trainingUnit->vm_enabled && $user) {
            $vmInfo = $this->assignmentService->getAccessibleVMForTrainingUnit($trainingUnitId, $user);
        }

        if ($request->wantsJson()) {
            return response()->json([
                'trainingPath' => new TrainingPathResource($trainingPath),
                'trainingUnit' => new TrainingUnitResource($trainingUnit),
                'completed_training_unit_ids' => $completedTrainingUnitIds,
                'vm_info' => $vmInfo,
            ]);
        }

        return Inertia::render('trainingPaths/TrainingUnit', [
            'trainingPathId' => (string) $trainingPathId,
            'trainingUnitId' => (string) $trainingUnitId,
            'trainingPath' => new TrainingPathResource($trainingPath),
            'trainingUnit' => new TrainingUnitResource($trainingUnit),
            'completedTrainingUnitIds' => $completedTrainingUnitIds,
            'vmInfo' => $vmInfo,
        ]);
    }

    /**
     * Enroll in a trainingPath.
     */
    public function enroll(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        try {
            $this->enrollmentService->enroll($user, $id);
        } catch (\DomainException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json(['message' => 'Enrolled successfully'], 201);
    }

    /**
     * Unenroll from a trainingPath.
     */
    public function unenroll(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $this->enrollmentService->unenroll($user, $id);

        return response()->json(['message' => 'Unenrolled successfully']);
    }

    /**
     * Mark a trainingUnit as complete.
     */
    public function markTrainingUnitComplete(Request $request, int $trainingPathId, int $trainingUnitId): JsonResponse
    {
        $user = $request->user();
        $this->enrollmentService->markTrainingUnitComplete($user, $trainingUnitId);

        $trainingPath = $this->trainingPathService->getTrainingPathWithContent($trainingPathId);
        $progress = $trainingPath ? $this->enrollmentService->getTrainingPathProgress($user, $trainingPath) : null;

        return response()->json([
            'message' => 'TrainingUnit marked complete',
            'progress' => $progress,
        ]);
    }

    /**
     * Mark a trainingUnit as incomplete.
     */
    public function markTrainingUnitIncomplete(Request $request, int $trainingPathId, int $trainingUnitId): JsonResponse
    {
        $user = $request->user();
        $this->enrollmentService->markTrainingUnitIncomplete($user, $trainingUnitId);

        $trainingPath = $this->trainingPathService->getTrainingPathWithContent($trainingPathId);
        $progress = $trainingPath ? $this->enrollmentService->getTrainingPathProgress($user, $trainingPath) : null;

        return response()->json([
            'message' => 'TrainingUnit marked incomplete',
            'progress' => $progress,
        ]);
    }

    /**
     * Update video watch progress for a trainingUnit.
     */
    public function updateVideoProgress(UpdateVideoProgressRequest $request, int $trainingPathId, int $trainingUnitId): JsonResponse
    {
        $validated = $request->validated();

        $user = $request->user();
        $trainingUnitProgress = $this->enrollmentService->updateVideoProgress(
            $user,
            $trainingUnitId,
            $validated['percentage'],
            $validated['position_seconds']
        );

        $trainingPath = $this->trainingPathService->getTrainingPathWithContent($trainingPathId);
        $trainingPathProgress = $trainingPath ? $this->enrollmentService->getTrainingPathProgress($user, $trainingPath) : null;

        return response()->json([
            'message' => 'Video progress updated',
            'training_unit_progress' => [
                'video_watch_percentage' => $trainingUnitProgress->video_watch_percentage,
                'video_position_seconds' => $trainingUnitProgress->video_position_seconds,
                'completed' => $trainingUnitProgress->completed,
            ],
            'training_path_progress' => $trainingPathProgress,
        ]);
    }

    /**
     * Mark article as read for a trainingUnit.
     */
    public function markArticleRead(Request $request, int $trainingPathId, int $trainingUnitId): JsonResponse
    {
        $user = $request->user();
        $trainingUnitProgress = $this->enrollmentService->markArticleRead($user, $trainingUnitId);

        $trainingPath = $this->trainingPathService->getTrainingPathWithContent($trainingPathId);
        $trainingPathProgress = $trainingPath ? $this->enrollmentService->getTrainingPathProgress($user, $trainingPath) : null;

        return response()->json([
            'message' => 'Article marked as read',
            'training_unit_progress' => [
                'article_read' => $trainingUnitProgress->article_read,
                'completed' => $trainingUnitProgress->completed,
            ],
            'training_path_progress' => $trainingPathProgress,
        ]);
    }

    /**
     * Show enrolled trainingPaths for the authenticated user.
     */
    public function myTrainingPaths(Request $request): JsonResponse|InertiaResponse
    {
        $user = $request->user();
        $enrollments = $this->enrollmentService->getEnrolledTrainingPaths($user);

        // Attach progress to each enrollment
        $trainingPathsWithProgress = $enrollments->map(function ($enrollment) use ($user) {
            $trainingPath = $enrollment->trainingPath;
            if ($trainingPath) {
                // Load modules and trainingUnits for the trainingPath
                $trainingPath->load(['modules.trainingUnits']);
                $progress = $this->enrollmentService->getTrainingPathProgress($user, $trainingPath);
                $completedTrainingUnitIds = $this->enrollmentService->getCompletedTrainingUnitIds($user, $trainingPath->id);
            } else {
                $progress = ['completed' => 0, 'total' => 0, 'percentage' => 0];
                $completedTrainingUnitIds = [];
            }

            return [
                'enrollment' => $enrollment,
                'trainingPath' => $trainingPath ? new TrainingPathResource($trainingPath) : null,
                'progress' => $progress,
                'completedTrainingUnitIds' => $completedTrainingUnitIds,
            ];
        })->filter(fn ($item) => $item['trainingPath'] !== null);

        if ($request->wantsJson()) {
            return response()->json(['data' => $trainingPathsWithProgress->values()]);
        }

        return Inertia::render('trainingPaths/my-TrainingPaths', [
            'enrollments' => $trainingPathsWithProgress->values(),
        ]);
    }
}
