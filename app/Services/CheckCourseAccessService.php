<?php

namespace App\Services;

use App\Models\Course;
use App\Models\Lesson;
use App\Models\User;
use App\Repositories\CourseEnrollmentRepository;
use App\Repositories\CourseRepository;
use App\Repositories\LessonRepository;
use Illuminate\Support\Facades\Cache;

/**
 * Centralized service for checking course and lesson access.
 *
 * Consolidates all access control logic to prevent scattered checks
 * across controllers, services, and models.
 */
class CheckCourseAccessService
{
    private const CACHE_TTL = 3600; // 1 hour

    public function __construct(
        private readonly CourseEnrollmentRepository $enrollmentRepository,
        private readonly CourseRepository $courseRepository,
        private readonly LessonRepository $lessonRepository,
    ) {}

    /**
     * Check if a user can access a course.
     *
     * Access is granted if:
     * 1. The course is free
     * 2. The user is enrolled
     * 3. The user is the instructor
     */
    public function canAccessCourse(User $user, int $courseId): bool
    {
        $course = $this->getCourse($courseId);

        if (! $course || ! $course->isPublished()) {
            return false;
        }

        // Instructor always has access
        if ($course->isOwnedBy($user)) {
            return true;
        }

        // Free courses are accessible to all authenticated users
        if ($this->isFree($courseId)) {
            return true;
        }

        // Check enrollment
        return $this->isEnrolled($user, $courseId);
    }

    /**
     * Check if a user can access a specific lesson.
     *
     * Access is granted if:
     * 1. The lesson is a preview lesson
     * 2. The course is free
     * 3. The user is enrolled in the course
     * 4. The user is the instructor
     */
    public function canAccessLesson(User $user, int $lessonId): bool
    {
        $lesson = $this->getLesson($lessonId);

        if (! $lesson) {
            return false;
        }

        $course = $lesson->module->course;

        // Check if lesson is a preview (first lesson in first module)
        if ($this->isPreviewLesson($lesson)) {
            return true;
        }

        return $this->canAccessCourse($user, $course->id);
    }

    /**
     * Check if a user can start a VM session for a lesson.
     *
     * Requires course access AND:
     * - Lesson has VM enabled
     * - Lesson has an approved VM assignment
     */
    public function canAccessLessonVM(User $user, int $lessonId): bool
    {
        $lesson = $this->getLesson($lessonId);

        if (! $lesson) {
            return false;
        }

        // Must have course access
        $course = $lesson->module->course;
        if (! $this->canAccessCourse($user, $course->id)) {
            return false;
        }

        // Lesson must have VM enabled and approved assignment
        return $lesson->vm_enabled && $lesson->hasApprovedVM();
    }

    /**
     * Check if a user is enrolled in a course (cached).
     */
    public function isEnrolled(User $user, int $courseId): bool
    {
        return Cache::remember(
            $this->enrollmentCacheKey($user, $courseId),
            self::CACHE_TTL,
            fn () => $this->enrollmentRepository->isEnrolled($user->id, $courseId)
        );
    }

    /**
     * Check if a course is free.
     */
    public function isFree(int $courseId): bool
    {
        $course = $this->getCourse($courseId);

        return $course && ($course->is_free || $course->price_cents === 0);
    }

    /**
     * Check if a lesson is a preview lesson (accessible without enrollment).
     *
     * Preview lessons are the first lesson of the first module.
     */
    public function isPreviewLesson(Lesson $lesson): bool
    {
        $module = $lesson->module;

        // Check if this is the first module
        $isFirstModule = $module->course->modules()
            ->orderBy('sort_order')
            ->first()?->id === $module->id;

        if (! $isFirstModule) {
            return false;
        }

        // Check if this is the first lesson in the module (sort_order = 1)
        return $lesson->sort_order === 1;
    }

    /**
     * Assert that user can access a course, throwing exception if not.
     *
     * @throws \DomainException If access is denied
     */
    public function assertCanAccessCourse(User $user, int $courseId): void
    {
        if (! $this->canAccessCourse($user, $courseId)) {
            throw new \DomainException('You do not have access to this course');
        }
    }

    /**
     * Assert that user can access a lesson, throwing exception if not.
     *
     * @throws \DomainException If access is denied
     */
    public function assertCanAccessLesson(User $user, int $lessonId): void
    {
        if (! $this->canAccessLesson($user, $lessonId)) {
            throw new \DomainException('You do not have access to this lesson');
        }
    }

    /**
     * Assert that user can access a lesson's VM, throwing exception if not.
     *
     * @throws \DomainException If access is denied
     */
    public function assertCanAccessLessonVM(User $user, int $lessonId): void
    {
        if (! $this->canAccessLessonVM($user, $lessonId)) {
            throw new \DomainException('You do not have access to this lesson\'s virtual machine');
        }
    }

    /**
     * Invalidate enrollment cache for a user and course.
     */
    public function invalidateEnrollmentCache(User $user, int $courseId): void
    {
        Cache::forget($this->enrollmentCacheKey($user, $courseId));
    }

    /**
     * Get access summary for a course from a user's perspective.
     *
     * @return array{can_access: bool, reason: string, is_enrolled: bool, is_free: bool, is_instructor: bool}
     */
    public function getAccessSummary(User $user, int $courseId): array
    {
        $course = $this->getCourse($courseId);

        if (! $course) {
            return [
                'can_access' => false,
                'reason' => 'Course not found',
                'is_enrolled' => false,
                'is_free' => false,
                'is_instructor' => false,
            ];
        }

        $isInstructor = $course->isOwnedBy($user);
        $isFree = $this->isFree($courseId);
        $isEnrolled = $this->isEnrolled($user, $courseId);
        $canAccess = $isInstructor || $isFree || $isEnrolled;

        $reason = match (true) {
            $isInstructor => 'You are the course instructor',
            $isFree => 'This course is free',
            $isEnrolled => 'You are enrolled in this course',
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

    private function getCourse(int $courseId): ?Course
    {
        return $this->courseRepository->findById($courseId);
    }

    private function getLesson(int $lessonId): ?Lesson
    {
        return $this->lessonRepository->findById($lessonId);
    }

    private function enrollmentCacheKey(User $user, int $courseId): string
    {
        return "access:user:{$user->id}:course:{$courseId}";
    }
}
