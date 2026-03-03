<?php

namespace App\Services;

use App\Enums\CourseStatus;
use App\Models\Course;
use App\Models\User;
use App\Repositories\CourseRepository;
use App\Repositories\CourseModuleRepository;
use App\Repositories\LessonRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Service for course management.
 */
class CourseService
{
    public function __construct(
        private readonly CourseRepository $courseRepository,
        private readonly CourseModuleRepository $moduleRepository,
        private readonly LessonRepository $lessonRepository,
    ) {}

    /**
     * Get all approved courses for browsing.
     */
    public function getApprovedCourses(?string $category = null, ?string $search = null): Collection
    {
        if ($search) {
            return $this->courseRepository->searchApproved($search);
        }

        if ($category) {
            return $this->courseRepository->findApprovedByCategory($category);
        }

        return $this->courseRepository->findApproved();
    }

    /**
     * Get all available categories.
     *
     * @return array<string>
     */
    public function getCategories(): array
    {
        return $this->courseRepository->getCategories();
    }

    /**
     * Get a course by ID with full content.
     */
    public function getCourseWithContent(int $id): ?Course
    {
        return $this->courseRepository->findByIdWithContent($id);
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
     * @param array<string, mixed> $data Course data
     * @param array<array<string, mixed>> $modules Module data with lessons
     */
    public function createCourse(User $instructor, array $data, array $modules = []): Course
    {
        return DB::transaction(function () use ($instructor, $data, $modules) {
            // Create the course
            $course = $this->courseRepository->create([
                'title' => $data['title'],
                'description' => $data['description'] ?? '',
                'instructor_id' => $instructor->id,
                'thumbnail' => $data['thumbnail'] ?? null,
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
        });
    }

    /**
     * Update a course.
     *
     * @param array<string, mixed> $data
     */
    public function updateCourse(Course $course, array $data): Course
    {
        $this->courseRepository->update($course, $data);

        // Refresh VM flag
        $course->refreshHasVirtualMachine();

        Log::info('Course updated', ['course_id' => $course->id]);

        return $course->fresh(['modules.lessons']);
    }

    /**
     * Delete a course.
     */
    public function deleteCourse(Course $course): bool
    {
        Log::info('Deleting course', ['course_id' => $course->id]);

        return $this->courseRepository->delete($course);
    }

    /**
     * Submit a course for review.
     */
    public function submitForReview(Course $course): Course
    {
        if ($course->status !== CourseStatus::DRAFT && $course->status !== CourseStatus::REJECTED) {
            throw new \InvalidArgumentException('Course is not in a submittable state');
        }

        Log::info('Course submitted for review', ['course_id' => $course->id]);

        return $this->courseRepository->submitForReview($course);
    }

    /**
     * Approve a course (admin only).
     */
    public function approveCourse(Course $course): Course
    {
        if ($course->status !== CourseStatus::PENDING_REVIEW) {
            throw new \InvalidArgumentException('Course is not pending review');
        }

        Log::info('Course approved', ['course_id' => $course->id]);

        return $this->courseRepository->approve($course);
    }

    /**
     * Reject a course (admin only).
     */
    public function rejectCourse(Course $course, string $feedback): Course
    {
        if ($course->status !== CourseStatus::PENDING_REVIEW) {
            throw new \InvalidArgumentException('Course is not pending review');
        }

        Log::info('Course rejected', [
            'course_id' => $course->id,
            'feedback' => $feedback,
        ]);

        return $this->courseRepository->reject($course, $feedback);
    }

    /**
     * Get all courses pending review (admin only).
     */
    public function getPendingCourses(): Collection
    {
        return $this->courseRepository->findPendingReview();
    }
}
