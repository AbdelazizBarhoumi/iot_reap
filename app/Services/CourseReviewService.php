<?php

namespace App\Services;

use App\Models\Course;
use App\Models\CourseReview;
use App\Models\User;
use App\Repositories\CourseEnrollmentRepository;
use App\Repositories\CourseReviewRepository;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

class CourseReviewService
{
    private const CACHE_TTL = 3600; // 1 hour

    public function __construct(
        private CourseReviewRepository $reviewRepository,
        private CourseEnrollmentRepository $enrollmentRepository,
    ) {}

    /**
     * Get paginated reviews for a course.
     */
    public function getReviewsForCourse(int $courseId, int $perPage = 10): LengthAwarePaginator
    {
        return $this->reviewRepository->getReviewsForCourse($courseId, $perPage);
    }

    /**
     * Get featured reviews for a course.
     */
    public function getFeaturedReviews(int $courseId, int $limit = 5): Collection
    {
        return $this->reviewRepository->getFeaturedReviews($courseId, $limit);
    }

    /**
     * Get cached average rating for a course.
     */
    public function getAverageRating(int $courseId): ?float
    {
        $cacheKey = "course:{$courseId}:avg_rating";

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($courseId) {
            return $this->reviewRepository->getAverageRating($courseId);
        });
    }

    /**
     * Get review stats for a course (avg, count, distribution).
     */
    public function getReviewStats(int $courseId): array
    {
        $cacheKey = "course:{$courseId}:review_stats";

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($courseId) {
            return [
                'average' => $this->reviewRepository->getAverageRating($courseId),
                'count' => $this->reviewRepository->getReviewCount($courseId),
                'distribution' => $this->reviewRepository->getRatingDistribution($courseId),
            ];
        });
    }

    /**
     * Create a review for a course.
     *
     * @throws AuthorizationException
     */
    public function createReview(
        User $user,
        int $courseId,
        int $rating,
        ?string $review = null,
    ): CourseReview {
        // Check if user is enrolled
        if (! $this->enrollmentRepository->isEnrolled($user, $courseId)) {
            throw new AuthorizationException('You must be enrolled to review this course.');
        }

        // Check if user already reviewed
        if ($this->reviewRepository->hasUserReviewed($courseId, $user)) {
            throw new AuthorizationException('You have already reviewed this course.');
        }

        // Validate rating
        if ($rating < 1 || $rating > 5) {
            throw new \DomainException('Rating must be between 1 and 5.');
        }

        $courseReview = $this->reviewRepository->create([
            'course_id' => $courseId,
            'user_id' => $user->id,
            'rating' => $rating,
            'review' => $review,
        ]);

        // Clear cache
        $this->clearCourseReviewCache($courseId);

        // Update course rating
        $this->updateCourseRating($courseId);

        return $courseReview;
    }

    /**
     * Update a review.
     *
     * @throws AuthorizationException
     */
    public function updateReview(
        User $user,
        int $reviewId,
        int $rating,
        ?string $review = null,
    ): CourseReview {
        $existingReview = $this->reviewRepository->find($reviewId);

        if (! $existingReview || $existingReview->user_id !== $user->id) {
            throw new AuthorizationException('Review not found or access denied.');
        }

        // Validate rating
        if ($rating < 1 || $rating > 5) {
            throw new \DomainException('Rating must be between 1 and 5.');
        }

        $updatedReview = $this->reviewRepository->update($existingReview, [
            'rating' => $rating,
            'review' => $review,
        ]);

        // Clear cache
        $this->clearCourseReviewCache($existingReview->course_id);

        // Update course rating
        $this->updateCourseRating($existingReview->course_id);

        return $updatedReview;
    }

    /**
     * Delete a review.
     *
     * @throws AuthorizationException
     */
    public function deleteReview(User $user, int $reviewId): bool
    {
        $review = $this->reviewRepository->find($reviewId);

        if (! $review || $review->user_id !== $user->id) {
            throw new AuthorizationException('Review not found or access denied.');
        }

        $courseId = $review->course_id;
        $result = $this->reviewRepository->delete($review);

        // Clear cache
        $this->clearCourseReviewCache($courseId);

        // Update course rating
        $this->updateCourseRating($courseId);

        return $result;
    }

    /**
     * Get user's review for a course.
     */
    public function getUserReview(int $courseId, User $user): ?CourseReview
    {
        return $this->reviewRepository->getUserReview($courseId, $user);
    }

    /**
     * Check if user can review a course.
     */
    public function canUserReview(int $courseId, User $user): bool
    {
        // Must be enrolled and not already reviewed
        return $this->enrollmentRepository->isEnrolled($user, $courseId)
            && ! $this->reviewRepository->hasUserReviewed($courseId, $user);
    }

    /**
     * Clear review cache for a course.
     */
    private function clearCourseReviewCache(int $courseId): void
    {
        Cache::forget("course:{$courseId}:avg_rating");
        Cache::forget("course:{$courseId}:review_stats");
    }

    /**
     * Update the course's cached rating.
     */
    private function updateCourseRating(int $courseId): void
    {
        $avgRating = $this->reviewRepository->getAverageRating($courseId);
        Course::where('id', $courseId)->update(['rating' => $avgRating ?? 0]);
    }
}
