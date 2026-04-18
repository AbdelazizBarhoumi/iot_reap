<?php

namespace App\Services;

use App\Models\TrainingPath;
use App\Models\TrainingUnit;
use App\Models\User;
use App\Repositories\TrainingPathEnrollmentRepository;
use App\Repositories\TrainingPathRepository;
use App\Repositories\TrainingUnitRepository;
use Illuminate\Support\Facades\Cache;

/**
 * Centralized service for checking trainingPath and trainingUnit access.
 *
 * Consolidates all access control logic to prevent scattered checks
 * across controllers, services, and models.
 */
class CheckTrainingPathAccessService
{
    private const CACHE_TTL = 3600; // 1 hour

    public function __construct(
        private readonly TrainingPathEnrollmentRepository $enrollmentRepository,
        private readonly TrainingPathRepository $trainingPathRepository,
        private readonly TrainingUnitRepository $trainingUnitRepository,
    ) {}

    /**
     * Check if a user can access a trainingPath.
     *
     * Access is granted if:
     * 1. The trainingPath is free
     * 2. The user is enrolled
     * 3. The user is the instructor
     */
    public function canAccessTrainingPath(User $user, int $trainingPathId): bool
    {
        $trainingPath = $this->getTrainingPath($trainingPathId);

        if (! $trainingPath || ! $trainingPath->isPublished()) {
            return false;
        }

        // Instructor always has access
        if ($trainingPath->isOwnedBy($user)) {
            return true;
        }

        // Free trainingPaths are accessible to all authenticated users
        if ($this->isFree($trainingPathId)) {
            return true;
        }

        // Check enrollment
        return $this->isEnrolled($user, $trainingPathId);
    }

    /**
     * Check if a user can access a specific trainingUnit.
     *
     * Access is granted if:
     * 1. The trainingUnit is a preview trainingUnit
     * 2. The trainingPath is free
     * 3. The user is enrolled in the trainingPath
     * 4. The user is the instructor
     */
    public function canAccessTrainingUnit(User $user, int $trainingUnitId): bool
    {
        $trainingUnit = $this->getTrainingUnit($trainingUnitId);

        if (! $trainingUnit) {
            return false;
        }

        $trainingPath = $trainingUnit->module->trainingPath;

        // Check if trainingUnit is a preview (first trainingUnit in first module)
        if ($this->isPreviewTrainingUnit($trainingUnit)) {
            return true;
        }

        return $this->canAccessTrainingPath($user, $trainingPath->id);
    }

    /**
     * Check if a user can start a VM session for a trainingUnit.
     *
     * Requires trainingPath access AND:
     * - TrainingUnit has VM enabled
     * - TrainingUnit has an approved VM assignment
     */
    public function canAccessTrainingUnitVM(User $user, int $trainingUnitId): bool
    {
        $trainingUnit = $this->getTrainingUnit($trainingUnitId);

        if (! $trainingUnit) {
            return false;
        }

        // Must have trainingPath access
        $trainingPath = $trainingUnit->module->trainingPath;
        if (! $this->canAccessTrainingPath($user, $trainingPath->id)) {
            return false;
        }

        // TrainingUnit must have VM enabled and approved assignment
        return $trainingUnit->vm_enabled && $trainingUnit->hasApprovedVM();
    }

    /**
     * Check if a user is enrolled in a trainingPath (cached).
     */
    public function isEnrolled(User $user, int $trainingPathId): bool
    {
        return Cache::remember(
            $this->enrollmentCacheKey($user, $trainingPathId),
            self::CACHE_TTL,
            fn () => $this->enrollmentRepository->isEnrolled($user->id, $trainingPathId)
        );
    }

    /**
     * Check if a trainingPath is free.
     */
    public function isFree(int $trainingPathId): bool
    {
        $trainingPath = $this->getTrainingPath($trainingPathId);

        return $trainingPath && ($trainingPath->is_free || $trainingPath->price_cents === 0);
    }

    /**
     * Check if a trainingUnit is a preview trainingUnit (accessible without enrollment).
     *
     * Preview trainingUnits are the first trainingUnit of the first module.
     */
    public function isPreviewTrainingUnit(TrainingUnit $trainingUnit): bool
    {
        $module = $trainingUnit->module;

        // Check if this is the first module
        $isFirstModule = $module->trainingPath->modules()
            ->orderBy('sort_order')
            ->first()?->id === $module->id;

        if (! $isFirstModule) {
            return false;
        }

        // Check if this is the first trainingUnit in the module (sort_order = 1)
        return $trainingUnit->sort_order === 1;
    }

    /**
     * Assert that user can access a trainingPath, throwing exception if not.
     *
     * @throws \DomainException If access is denied
     */
    public function assertCanAccessTrainingPath(User $user, int $trainingPathId): void
    {
        if (! $this->canAccessTrainingPath($user, $trainingPathId)) {
            throw new \DomainException('You do not have access to this trainingPath');
        }
    }

    /**
     * Assert that user can access a trainingUnit, throwing exception if not.
     *
     * @throws \DomainException If access is denied
     */
    public function assertCanAccessTrainingUnit(User $user, int $trainingUnitId): void
    {
        if (! $this->canAccessTrainingUnit($user, $trainingUnitId)) {
            throw new \DomainException('You do not have access to this trainingUnit');
        }
    }

    /**
     * Assert that user can access a trainingUnit's VM, throwing exception if not.
     *
     * @throws \DomainException If access is denied
     */
    public function assertCanAccessTrainingUnitVM(User $user, int $trainingUnitId): void
    {
        if (! $this->canAccessTrainingUnitVM($user, $trainingUnitId)) {
            throw new \DomainException('You do not have access to this trainingUnit\'s virtual machine');
        }
    }

    /**
     * Invalidate enrollment cache for a user and trainingPath.
     */
    public function invalidateEnrollmentCache(User $user, int $trainingPathId): void
    {
        Cache::forget($this->enrollmentCacheKey($user, $trainingPathId));
    }

    /**
     * Get access summary for a trainingPath from a user's perspective.
     *
     * @return array{can_access: bool, reason: string, is_enrolled: bool, is_free: bool, is_instructor: bool}
     */
    public function getAccessSummary(User $user, int $trainingPathId): array
    {
        $trainingPath = $this->getTrainingPath($trainingPathId);

        if (! $trainingPath) {
            return [
                'can_access' => false,
                'reason' => 'TrainingPath not found',
                'is_enrolled' => false,
                'is_free' => false,
                'is_instructor' => false,
            ];
        }

        $isInstructor = $trainingPath->isOwnedBy($user);
        $isFree = $this->isFree($trainingPathId);
        $isEnrolled = $this->isEnrolled($user, $trainingPathId);
        $canAccess = $isInstructor || $isFree || $isEnrolled;

        $reason = match (true) {
            $isInstructor => 'You are the trainingPath instructor',
            $isFree => 'This trainingPath is free',
            $isEnrolled => 'You are enrolled in this trainingPath',
            default => 'Enrollment required',
        };

        return [
            'can_access' => $canAccess,
            'reason' => $reason,
            'is_enrolled' => $isEnrolled,
            'is_free' => $isFree,
            'is_instructor' => $isInstructor,
        ];
    }

    private function getTrainingPath(int $trainingPathId): ?TrainingPath
    {
        return $this->trainingPathRepository->findById($trainingPathId);
    }

    private function getTrainingUnit(int $trainingUnitId): ?TrainingUnit
    {
        return $this->trainingUnitRepository->findById($trainingUnitId);
    }

    private function enrollmentCacheKey(User $user, int $trainingPathId): string
    {
        return "access:user:{$user->id}:trainingPath:{$trainingPathId}";
    }
}
