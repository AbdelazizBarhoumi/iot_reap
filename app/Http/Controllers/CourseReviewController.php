<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCourseReviewRequest;
use App\Http\Resources\CourseReviewResource;
use App\Services\CourseReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseReviewController extends Controller
{
    public function __construct(
        private CourseReviewService $reviewService,
    ) {}

    /**
     * Get reviews for a course.
     */
    public function index(Request $request, int $courseId): JsonResponse
    {
        $reviews = $this->reviewService->getReviewsForCourse(
            courseId: $courseId,
            perPage: $request->integer('per_page', 10),
        );

        return response()->json([
            'data' => CourseReviewResource::collection($reviews),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
            ],
        ]);
    }

    /**
     * Get review stats for a course.
     */
    public function stats(int $courseId): JsonResponse
    {
        $stats = $this->reviewService->getReviewStats($courseId);

        return response()->json(['data' => $stats]);
    }

    /**
     * Get the authenticated user's review for a course.
     */
    public function myReview(Request $request, int $courseId): JsonResponse
    {
        $review = $this->reviewService->getUserReview($courseId, $request->user());

        if (! $review) {
            return response()->json([
                'data' => null,
                'can_review' => $this->reviewService->canUserReview($courseId, $request->user()),
            ]);
        }

        return response()->json([
            'data' => new CourseReviewResource($review),
            'can_review' => false,
        ]);
    }

    /**
     * Store a new review.
     */
    public function store(StoreCourseReviewRequest $request, int $courseId): JsonResponse
    {
        $review = $this->reviewService->createReview(
            user: $request->user(),
            courseId: $courseId,
            rating: $request->validated('rating'),
            review: $request->validated('review'),
        );

        return response()->json([
            'data' => new CourseReviewResource($review->load('user:id,name')),
            'message' => 'Review submitted successfully.',
        ], 201);
    }

    /**
     * Update a review.
     */
    public function update(StoreCourseReviewRequest $request, int $courseId, int $reviewId): JsonResponse
    {
        $review = $this->reviewService->updateReview(
            user: $request->user(),
            reviewId: $reviewId,
            rating: $request->validated('rating'),
            review: $request->validated('review'),
        );

        return response()->json([
            'data' => new CourseReviewResource($review->load('user:id,name')),
            'message' => 'Review updated successfully.',
        ]);
    }

    /**
     * Delete a review.
     */
    public function destroy(Request $request, int $courseId, int $reviewId): JsonResponse
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
