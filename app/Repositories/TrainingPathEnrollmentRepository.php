<?php

namespace App\Repositories;

use App\Models\TrainingPathEnrollment;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

/**
 * Repository for trainingPath enrollment database access.
 */
class TrainingPathEnrollmentRepository
{
    /**
     * Enroll a user in a trainingPath.
     */
    public function enroll(string $userId, int $trainingPathId): TrainingPathEnrollment
    {
        return TrainingPathEnrollment::firstOrCreate(
            ['user_id' => $userId, 'training_path_id' => $trainingPathId],
            ['enrolled_at' => now()]
        );
    }

    /**
     * Check if a user is enrolled in a trainingPath.
     */
    public function isEnrolled(string $userId, int $trainingPathId): bool
    {
        return TrainingPathEnrollment::where('user_id', $userId)
            ->where('training_path_id', $trainingPathId)
            ->exists();
    }

    /**
     * Find enrollment.
     */
    public function find(string $userId, int $trainingPathId): ?TrainingPathEnrollment
    {
        return TrainingPathEnrollment::where('user_id', $userId)
            ->where('training_path_id', $trainingPathId)
            ->first();
    }

    /**
     * Unenroll a user from a trainingPath.
     */
    public function unenroll(string $userId, int $trainingPathId): bool
    {
        return TrainingPathEnrollment::where('user_id', $userId)
            ->where('training_path_id', $trainingPathId)
            ->delete() > 0;
    }

    /**
     * Find all enrollments for a user.
     */
    public function findByUser(User $user): Collection
    {
        return TrainingPathEnrollment::where('user_id', $user->id)
            ->with(['trainingPath.instructor', 'trainingPath.modules.trainingUnits'])
            ->orderByDesc('enrolled_at')
            ->get();
    }

    /**
     * Get enrolled student count for a trainingPath.
     */
    public function getStudentCount(int $trainingPathId): int
    {
        return TrainingPathEnrollment::where('training_path_id', $trainingPathId)->count();
    }
}
