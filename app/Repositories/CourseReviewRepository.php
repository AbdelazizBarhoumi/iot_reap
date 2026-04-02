<?php

namespace App\Repositories;

use App\Models\CourseReview;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class CourseReviewRepository
{
    /**
     * Get paginated reviews for a course.
     */
    public function getReviewsForCourse(int $courseId, int $perPage = 10): LengthAwarePaginator
    {
        return CourseReview::where('course_id', $courseId)
            ->with('user:id,name')
            ->newest()
            ->paginate($perPage);
    }

    /**
     * Get featured reviews for a course.
     */
    public function getFeaturedReviews(int $courseId, int $limit = 5): Collection
    {
        return CourseReview::where('course_id', $courseId)
            ->featured()
            ->with('user:id,name')
            ->newest()
            ->limit($limit)
            ->get();
    }

    /**
     * Get average rating for a course.
     */
    public function getAverageRating(int $courseId): ?float
    {
        $avg = CourseReview::where('course_id', $courseId)->avg('rating');

        return $avg !== null ? round($avg, 1) : null;
    }

    /**
     * Get review count for a course.
     */
    public function getReviewCount(int $courseId): int
    {
        return CourseReview::where('course_id', $courseId)->count();
    }

    /**
     * Get rating distribution for a course.
     */
    public function getRatingDistribution(int $courseId): array
    {
        $distribution = CourseReview::where('course_id', $courseId)
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
     * Get a user's review for a course.
     */
    public function getUserReview(int $courseId, User $user): ?CourseReview
    {
        return CourseReview::where('course_id', $courseId)
            ->where('user_id', $user->id)
            ->first();
    }

    /**
     * Check if user has reviewed a course.
     */
    public function hasUserReviewed(int $courseId, User $user): bool
    {
        return CourseReview::where('course_id', $courseId)
            ->where('user_id', $user->id)
            ->exists();
    }

    /**
     * Create a new review.
     */
    public function create(array $data): CourseReview
    {
        return CourseReview::create($data);
    }

    /**
     * Update a review.
     */
    public function update(CourseReview $review, array $data): CourseReview
    {
        $review->update($data);

        return $review->fresh();
    }

    /**
     * Delete a review.
     */
    public function delete(CourseReview $review): bool
    {
        return $review->delete();
    }

    /**
     * Find a review by ID.
     */
    public function find(int $id): ?CourseReview
    {
        return CourseReview::find($id);
    }
}
