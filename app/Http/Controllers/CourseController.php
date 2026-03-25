<?php

namespace App\Http\Controllers;

use App\Http\Resources\CourseResource;
use App\Http\Resources\LessonResource;
use App\Http\Resources\VMTemplateResource;
use App\Models\Course;
use App\Services\CourseService;
use App\Services\EnrollmentService;
use App\Services\LessonVMAssignmentService;
use App\Services\VMSessionQueueService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

/**
 * Controller for course browsing (student-facing).
 */
class CourseController extends Controller
{
    public function __construct(
        private readonly CourseService $courseService,
        private readonly EnrollmentService $enrollmentService,
        private readonly LessonVMAssignmentService $vmAssignmentService,
        private readonly VMSessionQueueService $queueService,
    ) {}

    /**
     * List all approved courses.
     */
    public function index(Request $request): JsonResponse|InertiaResponse
    {
        $category = $request->query('category');
        $search = $request->query('search');

        $courses = $this->courseService->getApprovedCourses($category, $search);
        $categories = $this->courseService->getCategories();

        if ($request->wantsJson()) {
            return response()->json([
                'data' => CourseResource::collection($courses),
                'categories' => $categories,
            ]);
        }

        return Inertia::render('courses/index', [
            'courses' => CourseResource::collection($courses),
            'categories' => $categories,
        ]);
    }

    /**
     * Show a course detail page.
     */
    public function show(Request $request, int $id): JsonResponse|InertiaResponse
    {
        $course = $this->courseService->getCourseWithContent($id);

        if (! $course || ! $course->isPublished()) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'Course not found'], 404);
            }
            abort(404);
        }

        $user = $request->user();
        $isEnrolled = $user ? $this->enrollmentService->isEnrolled($user, $id) : false;
        $progress = $user && $isEnrolled ? $this->enrollmentService->getCourseProgress($user, $course) : null;
        $completedLessonIds = $user ? $this->enrollmentService->getCompletedLessonIds($user, $id) : [];

        if ($request->wantsJson()) {
            return response()->json([
                'data' => new CourseResource($course),
                'is_enrolled' => $isEnrolled,
                'progress' => $progress,
                'completed_lesson_ids' => $completedLessonIds,
            ]);
        }

        return Inertia::render('courses/show', [
            'id' => (string) $id,
            'course' => new CourseResource($course),
            'isEnrolled' => $isEnrolled,
            'progress' => $progress,
            'completedLessonIds' => $completedLessonIds,
        ]);
    }

    /**
     * Show a lesson viewer page.
     */
    public function lesson(Request $request, int $courseId, int $lessonId): JsonResponse|InertiaResponse
    {
        $course = $this->courseService->getCourseWithContent($courseId);

        if (! $course || ! $course->isPublished()) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'Course not found'], 404);
            }
            abort(404);
        }

        $lesson = $course->lessons()->where('lessons.id', $lessonId)->first();

        if (! $lesson) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'Lesson not found'], 404);
            }
            abort(404);
        }

        $user = $request->user();

        // Check if user is enrolled (required for lesson access)
        if (! $user || ! $this->enrollmentService->isEnrolled($user, $courseId)) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'You must be enrolled to access this lesson'], 403);
            }
            abort(403, 'You must be enrolled to access this lesson');
        }

        $completedLessonIds = $this->enrollmentService->getCompletedLessonIds($user, $courseId);

        // Get VM template assignment and queue status for engineers
        $vmInfo = null;
        if ($lesson->vm_enabled) {
            $assignment = $this->vmAssignmentService->getApprovedAssignment($lessonId);
            if ($assignment && $assignment->vmTemplate) {
                $template = $assignment->vmTemplate;
                $queueStatus = $this->queueService->getQueueStatus($template);
                $canStart = $this->queueService->canUserStartSession($template, $user);

                $vmInfo = [
                    'template' => new VMTemplateResource($template->load(['proxmoxServer', 'node'])),
                    'queue_status' => $queueStatus,
                    'can_start' => $canStart,
                    'my_position' => $this->queueService->getQueuePosition($template->id, $user->id),
                ];
            }
        }

        if ($request->wantsJson()) {
            return response()->json([
                'course' => new CourseResource($course),
                'lesson' => new LessonResource($lesson),
                'completed_lesson_ids' => $completedLessonIds,
                'vm_info' => $vmInfo,
            ]);
        }

        return Inertia::render('courses/lesson', [
            'courseId' => (string) $courseId,
            'lessonId' => (string) $lessonId,
            'course' => new CourseResource($course),
            'lesson' => new LessonResource($lesson),
            'completedLessonIds' => $completedLessonIds,
            'vmInfo' => $vmInfo,
        ]);
    }

    /**
     * Enroll in a course.
     */
    public function enroll(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $this->enrollmentService->enroll($user, $id);

        return response()->json(['message' => 'Enrolled successfully'], 201);
    }

    /**
     * Unenroll from a course.
     */
    public function unenroll(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $this->enrollmentService->unenroll($user, $id);

        return response()->json(['message' => 'Unenrolled successfully']);
    }

    /**
     * Mark a lesson as complete.
     */
    public function markLessonComplete(Request $request, int $courseId, int $lessonId): JsonResponse
    {
        $user = $request->user();
        $this->enrollmentService->markLessonComplete($user, $lessonId);

        $course = $this->courseService->getCourseWithContent($courseId);
        $progress = $course ? $this->enrollmentService->getCourseProgress($user, $course) : null;

        return response()->json([
            'message' => 'Lesson marked complete',
            'progress' => $progress,
        ]);
    }

    /**
     * Mark a lesson as incomplete.
     */
    public function markLessonIncomplete(Request $request, int $courseId, int $lessonId): JsonResponse
    {
        $user = $request->user();
        $this->enrollmentService->markLessonIncomplete($user, $lessonId);

        $course = $this->courseService->getCourseWithContent($courseId);
        $progress = $course ? $this->enrollmentService->getCourseProgress($user, $course) : null;

        return response()->json([
            'message' => 'Lesson marked incomplete',
            'progress' => $progress,
        ]);
    }

    /**
     * Show enrolled courses for the authenticated user.
     */
    public function myCourses(Request $request): JsonResponse|InertiaResponse
    {
        $user = $request->user();
        $enrollments = $this->enrollmentService->getEnrolledCourses($user);

        // Attach progress to each enrollment
        $coursesWithProgress = $enrollments->map(function ($enrollment) use ($user) {
            $course = $enrollment->course;
            if ($course) {
                // Load modules and lessons for the course
                $course->load(['modules.lessons']);
                $progress = $this->enrollmentService->getCourseProgress($user, $course);
                $completedLessonIds = $this->enrollmentService->getCompletedLessonIds($user, $course->id);
            } else {
                $progress = ['completed' => 0, 'total' => 0, 'percentage' => 0];
                $completedLessonIds = [];
            }

            return [
                'enrollment' => $enrollment,
                'course' => $course ? new CourseResource($course) : null,
                'progress' => $progress,
                'completedLessonIds' => $completedLessonIds,
            ];
        })->filter(fn ($item) => $item['course'] !== null);

        if ($request->wantsJson()) {
            return response()->json(['data' => $coursesWithProgress->values()]);
        }

        return Inertia::render('courses/my-courses', [
            'enrollments' => $coursesWithProgress->values(),
        ]);
    }
}
