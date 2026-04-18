<?php

namespace App\Repositories;

use App\Models\TrainingPathReview;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class TrainingPathReviewRepository
{
    /**
     * Get paginated reviews for a trainingPath.
     */
    public function getReviewsForTrainingPath(int $trainingPathId, int $perPage = 10): LengthAwarePaginator
    {
        return TrainingPathReview::where('training_path_id', $trainingPathId)
            ->with('user:id,name')
            ->newest()
            ->paginate($perPage);
    }

    /**
     * Get featured reviews for a trainingPath.
     */
    public function getFeaturedReviews(int $trainingPathId, int $limit = 5): Collection
    {
        return TrainingPathReview::where('training_path_id', $trainingPathId)
            ->featured()
            ->with('user:id,name')
            ->newest()
            ->limit($limit)
            ->get();
    }

    /**
     * Get average rating for a trainingPath.
     */
    public function getAverageRating(int $trainingPathId): ?float
    {
        $avg = TrainingPathReview::where('training_path_id', $trainingPathId)->avg('rating');

        return $avg !== null ? round($avg, 1) : null;
    }

    /**
     * Get review count for a trainingPath.
     */
    public function getReviewCount(int $trainingPathId): int
    {
        return TrainingPathReview::where('training_path_id', $trainingPathId)->count();
    }

    /**
     * Get rating distribution for a trainingPath.
     */
    public function getRatingDistribution(int $trainingPathId): array
    {
        $distribution = TrainingPathReview::where('training_path_id', $trainingPathId)
            ->selectRaw('rating, COUNT(*) as count')
            ->groupBy('rating')
            ->pluck('count', 'rating')
            ->toArray();

        // Ensure all ratings 1-5 are present
        $result = [];
        for ($i = 5; $i >= 1; $i--) {
            $result[$i] = $distribution[$i] ?? 0;
        }

        return $result;
    }

    /**
     * Get a user's review for a trainingPath.
     */
    public function getUserReview(int $trainingPathId, User $user): ?TrainingPathReview
    {
        return TrainingPathReview::where('training_path_id', $trainingPathId)
            ->where('user_id', $user->id)
            ->first();
    }

    /**
     * Check if user has reviewed a trainingPath.
     */
    public function hasUserReviewed(int $trainingPathId, User $user): bool
    {
        return TrainingPathReview::where('training_path_id', $trainingPathId)
            ->where('user_id', $user->id)
            ->exists();
    }

    /**
     * Create a new review.
     */
    public function create(array $data): TrainingPathReview
    {
        return TrainingPathReview::create($data);
    }

    /**
     * Update a review.
     */
    public function update(TrainingPathReview $review, array $data): TrainingPathReview
    {
        $review->update($data);

        return $review->fresh();
    }

    /**
     * Delete a review.
     */
    public function delete(TrainingPathReview $review): bool
    {
        return $review->delete();
    }

    /**
     * Find a review by ID.
     */
    public function find(int $id): ?TrainingPathReview
    {
        return TrainingPathReview::find($id);
    }
}
