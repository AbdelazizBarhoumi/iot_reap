<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTrainingPathReviewRequest;
use App\Http\Resources\TrainingPathReviewResource;
use App\Services\TrainingPathReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrainingPathReviewController extends Controller
{
    public function __construct(
        private TrainingPathReviewService $reviewService,
    ) {}

    /**
     * Get reviews for a trainingPath.
     */
    public function index(Request $request, int $trainingPathId): JsonResponse
    {
        $reviews = $this->reviewService->getReviewsForTrainingPath(
            trainingPathId: $trainingPathId,
            perPage: $request->integer('per_page', 10),
        );

        return response()->json([
            'data' => TrainingPathReviewResource::collection($reviews),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
            ],
        ]);
    }

    /**
     * Get review stats for a trainingPath.
     */
    public function stats(int $trainingPathId): JsonResponse
    {
        $stats = $this->reviewService->getReviewStats($trainingPathId);

        return response()->json(['data' => $stats]);
    }

    /**
     * Get the authenticated user's review for a trainingPath.
     */
    public function myReview(Request $request, int $trainingPathId): JsonResponse
    {
        $review = $this->reviewService->getUserReview($trainingPathId, $request->user());

        if (! $review) {
            return response()->json([
                'data' => null,
                'can_review' => $this->reviewService->canUserReview($trainingPathId, $request->user()),
            ]);
        }

        return response()->json([
            'data' => new TrainingPathReviewResource($review),
            'can_review' => false,
        ]);
    }

    /**
     * Store a new review.
     */
    public function store(StoreTrainingPathReviewRequest $request, int $trainingPathId): JsonResponse
    {
        $review = $this->reviewService->createReview(
            user: $request->user(),
            trainingPathId: $trainingPathId,
            rating: $request->validated('rating'),
            review: $request->validated('review'),
        );

        return response()->json([
            'data' => new TrainingPathReviewResource($review->load('user:id,name')),
            'message' => 'Review submitted successfully.',
        ], 201);
    }

    /**
     * Update a review.
     */
    public function update(StoreTrainingPathReviewRequest $request, int $trainingPathId, int $reviewId): JsonResponse
    {
        $review = $this->reviewService->updateReview(
            user: $request->user(),
            reviewId: $reviewId,
            rating: $request->validated('rating'),
            review: $request->validated('review'),
        );

        return response()->json([
            'data' => new TrainingPathReviewResource($review->load('user:id,name')),
            'message' => 'Review updated successfully.',
        ]);
    }

    /**
     * Delete a review.
     */
    public function destroy(Request $request, int $trainingPathId, int $reviewId): JsonResponse
    {
        $this->reviewService->deleteReview(
            user: $request->user(),
            reviewId: $reviewId,
        );

        return response()->json([
            'message' => 'Review deleted successfully.',
        ]);
    }
}
