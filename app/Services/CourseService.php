<?php

namespace App\Services;

use App\Enums\CourseStatus;
use App\Models\Course;
use App\Models\User;
use App\Repositories\CourseModuleRepository;
use App\Repositories\CourseRepository;
use App\Repositories\LessonRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Service for course management.
 */
class CourseService
{
    public function __construct(
        private readonly CourseRepository $courseRepository,
        private readonly CourseModuleRepository $moduleRepository,
        private readonly LessonRepository $lessonRepository,
        private readonly CourseCacheService $cacheService,
    ) {}

    /**
     * Get all approved courses for browsing (cached for 15 minutes).
     */
    public function getApprovedCourses(?string $category = null, ?string $search = null): Collection
    {
        if ($search) {
            return $this->courseRepository->searchApproved($search);
        }

        if ($category) {
            return $this->cacheService->rememberApprovedByCategory(
                $category,
                fn () => $this->courseRepository->findApprovedByCategory($category)
            );
        }

        return $this->cacheService->rememberApprovedCourses(
            fn () => $this->courseRepository->findApproved()
        );
    }

    /**
     * Get all available categories (cached for 1 hour).
     *
     * @return array<string>
     */
    public function getCategories(): array
    {
        return $this->cacheService->rememberCategories(
            fn () => $this->courseRepository->getCategories()
        );
    }

    /**
     * Get a course by ID with full content (cached for 30 minutes).
     */
    public function getCourseWithContent(int $id): ?Course
    {
        return $this->cacheService->rememberCourseContent(
            $id,
            fn () => $this->courseRepository->findByIdWithContent($id)
        );
    }

    /**
     * Get courses by instructor.
     */
    public function getCoursesByInstructor(User $user): Collection
    {
        return $this->courseRepository->findByInstructor($user);
    }

    /**
     * Create a new course with modules and lessons.
     *
     * @param  array<string, mixed>  $data  Course data
     * @param  array<array<string, mixed>>  $modules  Module data with lessons
     */
    public function createCourse(User $instructor, array $data, array $modules = []): Course
    {
        // Process thumbnail
        $thumbnailPath = $this->processThumbnail($data['thumbnail'] ?? null);

        // Create the course
        $course = $this->courseRepository->create([
            'title' => $data['title'],
            'description' => $data['description'] ?? '',
            'instructor_id' => $instructor->id,
            'thumbnail' => $thumbnailPath,
            'category' => $data['category'] ?? 'General',
            'level' => $data['level'] ?? 'Beginner',
            'duration' => $data['duration'] ?? null,
            'has_virtual_machine' => false,
            'status' => CourseStatus::DRAFT,
        ]);

        Log::info('Course created', [
            'course_id' => $course->id,
            'instructor_id' => $instructor->id,
        ]);

        // Create modules and lessons
        $hasVm = false;
        foreach ($modules as $sortOrder => $moduleData) {
            $module = $this->moduleRepository->create([
                'course_id' => $course->id,
                'title' => $moduleData['title'] ?? 'Untitled Module',
                'sort_order' => $sortOrder,
            ]);

            foreach (($moduleData['lessons'] ?? []) as $lessonOrder => $lessonData) {
                $vmEnabled = $lessonData['vm_enabled'] ?? $lessonData['vmEnabled'] ?? false;
                if ($vmEnabled) {
                    $hasVm = true;
                }

                $this->lessonRepository->create([
                    'module_id' => $module->id,
                    'title' => $lessonData['title'] ?? 'Untitled Lesson',
                    'type' => $lessonData['type'] ?? 'video',
                    'duration' => $lessonData['duration'] ?? null,
                    'content' => $lessonData['content'] ?? null,
                        'objectives' => $lessonData['objectives'] ?? null,
                        'vm_enabled' => $vmEnabled,
                        'video_url' => $lessonData['video_url'] ?? null,
                        'resources' => $lessonData['resources'] ?? null,
                        'sort_order' => $lessonOrder,
                    ]);
                }
            }

        // Update has_virtual_machine flag
        if ($hasVm) {
            $course->update(['has_virtual_machine' => true]);
        }

        return $course->fresh(['modules.lessons']);
    }

    /**
     * Update a course.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateCourse(Course $course, array $data): Course
    {
        $oldCategory = $course->category;

        if (isset($data['thumbnail'])) {
            $data['thumbnail'] = $this->processThumbnail($data['thumbnail']);
        }

        $this->courseRepository->update($course, $data);

        // Refresh VM flag
        $course->refreshHasVirtualMachine();

        // Invalidate course caches (handle category change)
        if (isset($data['category']) && $data['category'] !== $oldCategory) {
            $this->cacheService->invalidateCourseWithOldCategory($course, $oldCategory);
        } else {
            $this->cacheService->invalidateCourse($course);
        }

        Log::info('Course updated', ['course_id' => $course->id]);

        return $course->fresh(['modules.lessons']);
    }

    /**
     * Delete a course.
     */
    public function deleteCourse(Course $course): bool
    {
        Log::info('Deleting course', ['course_id' => $course->id]);

        // Invalidate caches before deletion (while we still have course data)
        $this->cacheService->invalidateCourse($course);

        return $this->courseRepository->delete($course);
    }

    /**
     * Submit a course for review.
     */
    public function submitForReview(Course $course): Course
    {
        if ($course->status !== CourseStatus::DRAFT && $course->status !== CourseStatus::REJECTED) {
            throw new \DomainException('Course is not in a submittable state');
        }

        Log::info('Course submitted for review', ['course_id' => $course->id]);

        // Status change logic moved from repository to service
        return $this->courseRepository->update($course, [
            'status' => CourseStatus::PENDING_REVIEW,
            'admin_feedback' => null,
        ]);
    }

    /**
     * Approve a course (admin only).
     */
    public function approveCourse(Course $course): Course
    {
        if ($course->status !== CourseStatus::PENDING_REVIEW) {
            throw new \DomainException('Course is not pending review');
        }

        Log::info('Course approved', ['course_id' => $course->id]);

        // Status change logic moved from repository to service
        $course = $this->courseRepository->update($course, [
            'status' => CourseStatus::APPROVED,
            'admin_feedback' => null,
        ]);

        // Invalidate caches - course is now visible in approved lists
        $this->cacheService->invalidateCourse($course);

        // Notify the teacher that their course was approved
        $course->instructor->notify(new \App\Notifications\CourseApprovedNotification($course));

        return $course;
    }

    /**
     * Reject a course (admin only).
     */
    public function rejectCourse(Course $course, string $feedback): Course
    {
        if ($course->status !== CourseStatus::PENDING_REVIEW) {
            throw new \DomainException('Course is not pending review');
        }

        Log::info('Course rejected', [
            'course_id' => $course->id,
            'feedback' => $feedback,
        ]);

        // Status change logic moved from repository to service
        $updated = $this->courseRepository->update($course, [
            'status' => CourseStatus::REJECTED,
            'admin_feedback' => $feedback,
        ]);

        // Invalidate cache in case course was previously approved
        $this->cacheService->invalidateCourse($updated);

        // Notify the teacher that their course was rejected
        $updated->instructor->notify(new \App\Notifications\CourseRejectedNotification($updated, $feedback));

        return $updated;
    }

    /**
     * Get all courses pending review (admin only).
     */
    public function getPendingCourses(): Collection
    {
        return $this->courseRepository->findPendingReview();
    }

    /**
     * Archive a course (soft-delete).
     *
     * Archived courses are hidden from public listings but data is preserved.
     * Only owners and admins can archive courses.
     */
    public function archiveCourse(Course $course): Course
    {
        if ($course->status === CourseStatus::ARCHIVED) {
            throw new \DomainException('Course is already archived');
        }

        Log::info('Course archived', ['course_id' => $course->id]);

        $course->update([
            'status' => CourseStatus::ARCHIVED,
            'is_featured' => false,
            'featured_order' => null,
            'featured_at' => null,
        ]);

        // Invalidate caches - course should no longer appear in listings
        $this->cacheService->invalidateCourse($course);

        return $course->fresh();
    }

    /**
     * Restore an archived course to draft status.
     */
    public function restoreCourse(Course $course): Course
    {
        if ($course->status !== CourseStatus::ARCHIVED) {
            throw new \DomainException('Course is not archived');
        }

        Log::info('Course restored from archive', ['course_id' => $course->id]);

        $course->update(['status' => CourseStatus::DRAFT]);

        return $course->fresh();
    }

    /**
     * Save a base64 encoded image to storage and return the URL,
     * or return the original URL if it's already one.
     */
    private function processThumbnail(?string $thumbnail): ?string
    {
        if (empty($thumbnail)) {
            Log::debug('processThumbnail: thumbnail is empty');

            return null;
        }

        Log::debug('processThumbnail: received thumbnail', [
            'length' => strlen($thumbnail),
            'starts_with' => substr($thumbnail, 0, 50),
        ]);

        // If it's a base64 string
        if (preg_match('/^data:image\/(\w+);base64,/', $thumbnail, $type)) {
            $extension = strtolower($type[1]); // jpg, png, gif, jpeg

            if (! in_array($extension, ['jpg', 'jpeg', 'gif', 'png', 'webp'])) {
                Log::warning('Unsupported image type in base64 thumbnail', ['type' => $extension]);

                return null;
            }

            // Extract the base64 content
            $encodedImage = substr($thumbnail, strpos($thumbnail, ',') + 1);
            $encodedImage = str_replace(' ', '+', $encodedImage);
            $thumbnailData = base64_decode($encodedImage);

            if ($thumbnailData === false) {
                Log::error('Failed to decode base64 thumbnail');

                return null;
            }

            $fileName = 'course_thumbnails/'.Str::uuid().'.'.$extension;

            Storage::disk('public')->put($fileName, $thumbnailData);

            $url = Storage::url($fileName);
            Log::info('processThumbnail: saved thumbnail', ['url' => $url]);

            return $url;
        }

        Log::debug('processThumbnail: returning as-is (not base64)', ['thumbnail' => $thumbnail]);

        // If it's just a file path/URL or something else, return it as is
        return $thumbnail;
    }
}
