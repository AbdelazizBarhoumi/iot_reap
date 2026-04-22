<?php

namespace App\Http\Controllers\Admin;

use App\Enums\TrainingPathStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\TrainingPath\RejectTrainingPathRequest;
use App\Http\Resources\TrainingPathResource;
use App\Models\TrainingPath;
use App\Services\FeaturedTrainingPathsService;
use App\Services\TrainingPathService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

/**
 * Admin controller for trainingPath approvals and featured trainingPaths.
 */
class AdminTrainingPathController extends Controller
{
    public function __construct(
        private readonly TrainingPathService $trainingPathService,
        private readonly FeaturedTrainingPathsService $featuredTrainingPathsService,
    ) {}

    /**
     * List all pending trainingPaths for review.
     */
    public function index(Request $request): JsonResponse|InertiaResponse
    {
        $status = $request->string('status')->toString();
        $trainingPathsQuery = TrainingPath::query()
            ->with(['instructor', 'modules.trainingUnits'])
            ->withCount('enrollments as student_count')
            ->orderByDesc('created_at');

        if ($status !== '') {
            $trainingPathsQuery->where('status', $status);
        }

        $trainingPaths = $trainingPathsQuery->get();
        $pending = $trainingPaths->where('status', TrainingPathStatus::PENDING_REVIEW->value)->values();
        $featured = $this->featuredTrainingPathsService->getFeaturedTrainingPaths(10);

        if ($request->wantsJson()) {
            return response()->json([
                'data' => TrainingPathResource::collection($trainingPaths),
                'pending' => TrainingPathResource::collection($pending),
                'featured' => TrainingPathResource::collection($featured),
            ]);
        }

        return Inertia::render('admin/TrainingPathsPage', [
            'trainingPaths' => TrainingPathResource::collection($trainingPaths),
            'pendingTrainingPaths' => TrainingPathResource::collection($pending),
            'featuredTrainingPaths' => TrainingPathResource::collection($featured),
        ]);
    }

    /**
     * Approve a trainingPath.
     */
    public function approve(Request $request, TrainingPath $trainingPath): JsonResponse
    {
        $updated = $this->trainingPathService->approveTrainingPath($trainingPath);

        return response()->json([
            'data' => new TrainingPathResource($updated),
            'message' => 'TrainingPath approved successfully',
        ]);
    }

    /**
     * Reject a trainingPath.
     */
    public function reject(RejectTrainingPathRequest $request, TrainingPath $trainingPath): JsonResponse
    {
        $updated = $this->trainingPathService->rejectTrainingPath(
            $trainingPath,
            $request->validated('feedback')
        );

        return response()->json([
            'data' => new TrainingPathResource($updated),
            'message' => 'TrainingPath rejected',
        ]);
    }

    /**
     * Feature a trainingPath.
     */
    public function feature(Request $request, TrainingPath $trainingPath): JsonResponse
    {
        $order = $request->input('order');

        $updated = $this->featuredTrainingPathsService->featureTrainingPath(
            $trainingPath,
            $request->user(),
            $order
        );

        return response()->json([
            'data' => new TrainingPathResource($updated),
            'message' => 'TrainingPath featured successfully',
        ]);
    }

    /**
     * Unfeature a trainingPath.
     */
    public function unfeature(Request $request, TrainingPath $trainingPath): JsonResponse
    {
        $updated = $this->featuredTrainingPathsService->unfeatureTrainingPath(
            $trainingPath,
            $request->user()
        );

        return response()->json([
            'data' => new TrainingPathResource($updated),
            'message' => 'TrainingPath removed from featured',
        ]);
    }

    /**
     * Update featured trainingPaths order.
     */
    public function updateFeaturedOrder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order' => ['required', 'array'],
            'order.*' => ['required', 'integer'],
        ]);

        $this->featuredTrainingPathsService->updateFeaturedOrder(
            $validated['order'],
            $request->user()
        );

        return response()->json([
            'message' => 'Featured order updated',
        ]);
    }
}
