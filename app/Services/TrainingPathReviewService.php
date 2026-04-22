<?php

namespace App\Services;

use App\Models\TrainingPath;
use App\Models\TrainingPathReview;
use App\Models\User;
use App\Repositories\TrainingPathEnrollmentRepository;
use App\Repositories\TrainingPathReviewRepository;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

class TrainingPathReviewService
{
    private const CACHE_TTL = 3600; // 1 hour

    public function __construct(
        private TrainingPathReviewRepository $reviewRepository,
        private TrainingPathEnrollmentRepository $enrollmentRepository,
    ) {}

    /**
     * Get paginated reviews for a trainingPath.
     */
    public function getReviewsForTrainingPath(int $trainingPathId, int $perPage = 10): LengthAwarePaginator
    {
        return $this->reviewRepository->getReviewsForTrainingPath($trainingPathId, $perPage);
    }

    /**
     * Get featured reviews for a trainingPath.
     */
    public function getFeaturedReviews(int $trainingPathId, int $limit = 5): Collection
    {
        return $this->reviewRepository->getFeaturedReviews($trainingPathId, $limit);
    }

    /**
     * Get cached average rating for a trainingPath.
     */
    public function getAverageRating(int $trainingPathId): ?float
    {
        $cacheKey = "trainingPath:{$trainingPathId}:avg_rating";

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($trainingPathId) {
            return $this->reviewRepository->getAverageRating($trainingPathId);
        });
    }

    /**
     * Get review stats for a trainingPath (avg, count, distribution).
     */
    public function getReviewStats(int $trainingPathId): array
    {
        $cacheKey = "trainingPath:{$trainingPathId}:review_stats";

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($trainingPathId) {
            return [
                'average' => $this->reviewRepository->getAverageRating($trainingPathId),
                'count' => $this->reviewRepository->getReviewCount($trainingPathId),
                'distribution' => $this->reviewRepository->getRatingDistribution($trainingPathId),
            ];
        });
    }

    /**
     * Create a review for a trainingPath.
     *
     * @throws AuthorizationException
     */
    public function createReview(
        User $user,
        int $trainingPathId,
        int $rating,
        ?string $review = null,
    ): TrainingPathReview {
        // Check if user is enrolled (Admins can review without enrollment)
        if (! $user->isAdmin() && ! $this->enrollmentRepository->isEnrolled($user->id, $trainingPathId)) {
            throw new AuthorizationException('You must be enrolled to review this trainingPath.');
        }

        // Check if user already reviewed
        if ($this->reviewRepository->hasUserReviewed($trainingPathId, $user)) {
            throw new AuthorizationException('You have already reviewed this trainingPath.');
        }

        // Validate rating
        if ($rating < 1 || $rating > 5) {
            throw new \DomainException('Rating must be between 1 and 5.');
        }

        $trainingPathReview = $this->reviewRepository->create([
            'training_path_id' => $trainingPathId,
            'user_id' => $user->id,
            'rating' => $rating,
            'review' => $review,
        ]);

        // Clear cache
        $this->clearTrainingPathReviewCache($trainingPathId);

        // Update trainingPath rating
        $this->updateTrainingPathRating($trainingPathId);

        return $trainingPathReview;
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
    ): TrainingPathReview {
        $existingReview = $this->reviewRepository->find($reviewId);

        if (! $existingReview || ($existingReview->user_id !== $user->id && ! $user->isAdmin())) {
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
        $this->clearTrainingPathReviewCache($existingReview->training_path_id);

        // Update trainingPath rating
        $this->updateTrainingPathRating($existingReview->training_path_id);

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

        if (! $review || ($review->user_id !== $user->id && ! $user->isAdmin())) {
            throw new AuthorizationException('Review not found or access denied.');
        }

        $trainingPathId = $review->training_path_id;
        $result = $this->reviewRepository->delete($review);

        // Clear cache
        $this->clearTrainingPathReviewCache($trainingPathId);

        // Update trainingPath rating
        $this->updateTrainingPathRating($trainingPathId);

        return $result;
    }

    /**
     * Get user's review for a trainingPath.
     */
    public function getUserReview(int $trainingPathId, User $user): ?TrainingPathReview
    {
        return $this->reviewRepository->getUserReview($trainingPathId, $user);
    }

    /**
     * Check if user can review a trainingPath.
     */
    public function canUserReview(int $trainingPathId, User $user): bool
    {
        // Must be enrolled (or admin) and not already reviewed
        return ($user->isAdmin() || $this->enrollmentRepository->isEnrolled($user->id, $trainingPathId))
            && ! $this->reviewRepository->hasUserReviewed($trainingPathId, $user);
    }

    /**
     * Clear review cache for a trainingPath.
     */
    private function clearTrainingPathReviewCache(int $trainingPathId): void
    {
        Cache::forget("trainingPath:{$trainingPathId}:avg_rating");
        Cache::forget("trainingPath:{$trainingPathId}:review_stats");
    }

    /**
     * Update the trainingPath's cached rating.
     */
    private function updateTrainingPathRating(int $trainingPathId): void
    {
        $avgRating = $this->reviewRepository->getAverageRating($trainingPathId);
        TrainingPath::where('id', $trainingPathId)->update(['rating' => $avgRating ?? 0]);
    }
}
