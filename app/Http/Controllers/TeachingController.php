<?php

namespace App\Http\Controllers;

use App\Http\Requests\Course\CreateCourseRequest;
use App\Http\Requests\Course\UpdateCourseRequest;
use App\Http\Requests\Course\StoreLessonRequest;
use App\Http\Requests\Course\StoreModuleRequest;
use App\Http\Resources\CourseResource;
use App\Http\Resources\CourseModuleResource;
use App\Http\Resources\LessonResource;
use App\Models\Course;
use App\Models\CourseModule;
use App\Models\Lesson;
use App\Repositories\CourseRepository;
use App\Services\CourseService;
use App\Services\LessonService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

/**
 * Controller for teaching/course management (instructor-facing).
 */
class TeachingController extends Controller
{
    public function __construct(
        private readonly CourseService $courseService,
        private readonly LessonService $lessonService,
        private readonly CourseRepository $courseRepository,
    ) {}

    /**
     * Teaching dashboard - show instructor's courses.
     */
    public function index(Request $request): JsonResponse|InertiaResponse
    {
        $courses = $this->courseService->getCoursesByInstructor($request->user());

        // Calculate stats
        $stats = [
            'totalCourses' => $courses->count(),
            'totalStudents' => $courses->sum('student_count'),
            'avgRating' => $courses->avg('rating') ? round($courses->avg('rating'), 1) : 0,
            'totalRevenue' => '$0', // Placeholder - implement when payment system is added
        ];

        if ($request->wantsJson()) {
            return response()->json([
                'data' => CourseResource::collection($courses),
                'stats' => $stats,
            ]);
        }

        return Inertia::render('teaching/index', [
            'courses' => CourseResource::collection($courses),
            'stats' => $stats,
        ]);
    }

    /**
     * Create course form.
     */
    public function create(): InertiaResponse
    {
        return Inertia::render('teaching/create');
    }

    /**
     * Store a new course.
     */
    public function store(CreateCourseRequest $request): JsonResponse
    {
        $course = $this->courseService->createCourse(
            instructor: $request->user(),
            data: $request->validated(),
            modules: $request->validated('modules', []),
        );

        return response()->json([
            'data' => new CourseResource($course),
            'message' => 'Course created successfully',
        ], 201);
    }

    /**
     * Edit course form.
     */
    public function edit(Request $request, int $id): JsonResponse|InertiaResponse
    {
        $course = $this->courseService->getCourseWithContent($id);

        if (!$course) {
            abort(404);
        }

        // Only owner or admin can edit
        if (!$course->isOwnedBy($request->user()) && !$request->user()->isAdmin()) {
            abort(403);
        }

        if ($request->wantsJson()) {
            return response()->json(['data' => new CourseResource($course)]);
        }

        return Inertia::render('teaching/edit', [
            'id' => (string) $id,
            'course' => new CourseResource($course),
        ]);
    }

    /**
     * Update a course.
     */
    public function update(UpdateCourseRequest $request, Course $course): JsonResponse
    {
        $updated = $this->courseService->updateCourse($course, $request->validated());

        return response()->json([
            'data' => new CourseResource($updated),
            'message' => 'Course updated successfully',
        ]);
    }

    /**
     * Delete a course.
     */
    public function destroy(Request $request, Course $course): JsonResponse
    {
        // Only owner or admin can delete
        if (!$course->isOwnedBy($request->user()) && !$request->user()->isAdmin()) {
            abort(403);
        }

        $this->courseService->deleteCourse($course);

        return response()->json(['message' => 'Course deleted successfully']);
    }

    /**
     * Submit course for review.
     */
    public function submitForReview(Request $request, Course $course): JsonResponse
    {
        // Only owner can submit
        if (!$course->isOwnedBy($request->user())) {
            abort(403);
        }

        $updated = $this->courseService->submitForReview($course);

        return response()->json([
            'data' => new CourseResource($updated),
            'message' => 'Course submitted for review',
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Module Management
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Add a module to a course.
     */
    public function storeModule(StoreModuleRequest $request, Course $course): JsonResponse
    {
        // Only owner can modify
        if (!$course->isOwnedBy($request->user()) && !$request->user()->isAdmin()) {
            abort(403);
        }

        $module = $this->lessonService->addModule($course->id, $request->validated());

        return response()->json([
            'data' => new CourseModuleResource($module->load('lessons')),
            'message' => 'Module added successfully',
        ], 201);
    }

    /**
     * Update a module.
     */
    public function updateModule(StoreModuleRequest $request, Course $course, CourseModule $module): JsonResponse
    {
        if (!$course->isOwnedBy($request->user()) && !$request->user()->isAdmin()) {
            abort(403);
        }

        $updated = $this->lessonService->updateModule($module, $request->validated());

        return response()->json([
            'data' => new CourseModuleResource($updated->load('lessons')),
            'message' => 'Module updated successfully',
        ]);
    }

    /**
     * Delete a module.
     */
    public function destroyModule(Request $request, Course $course, CourseModule $module): JsonResponse
    {
        if (!$course->isOwnedBy($request->user()) && !$request->user()->isAdmin()) {
            abort(403);
        }

        $this->lessonService->deleteModule($module);

        return response()->json(['message' => 'Module deleted successfully']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Lesson Management
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Lesson edit page.
     */
    public function editLesson(Request $request, int $courseId, int $moduleId, int $lessonId): JsonResponse|InertiaResponse
    {
        $lesson = $this->lessonService->getLessonWithContext($lessonId);

        if (!$lesson || $lesson->module->course_id !== $courseId) {
            abort(404);
        }

        $course = $lesson->module->course;

        if (!$course->isOwnedBy($request->user()) && !$request->user()->isAdmin()) {
            abort(403);
        }

        if ($request->wantsJson()) {
            return response()->json([
                'lesson' => new LessonResource($lesson),
                'course' => new CourseResource($course->load('modules.lessons')),
            ]);
        }

        return Inertia::render('teaching/lesson-edit', [
            'courseId' => (string) $courseId,
            'moduleId' => (string) $moduleId,
            'lessonId' => (string) $lessonId,
            'lesson' => new LessonResource($lesson),
            'course' => new CourseResource($course->load('modules.lessons')),
        ]);
    }

    /**
     * Add a lesson to a module.
     */
    public function storeLesson(StoreLessonRequest $request, Course $course, CourseModule $module): JsonResponse
    {
        if (!$course->isOwnedBy($request->user()) && !$request->user()->isAdmin()) {
            abort(403);
        }

        $lesson = $this->lessonService->addLesson($module->id, $request->validated());

        return response()->json([
            'data' => new LessonResource($lesson),
            'message' => 'Lesson added successfully',
        ], 201);
    }

    /**
     * Update a lesson.
     */
    public function updateLesson(StoreLessonRequest $request, Course $course, CourseModule $module, Lesson $lesson): JsonResponse
    {
        if (!$course->isOwnedBy($request->user()) && !$request->user()->isAdmin()) {
            abort(403);
        }

        $updated = $this->lessonService->updateLesson($lesson, $request->validated());

        return response()->json([
            'data' => new LessonResource($updated),
            'message' => 'Lesson updated successfully',
        ]);
    }

    /**
     * Delete a lesson.
     */
    public function destroyLesson(Request $request, Course $course, CourseModule $module, Lesson $lesson): JsonResponse
    {
        if (!$course->isOwnedBy($request->user()) && !$request->user()->isAdmin()) {
            abort(403);
        }

        $this->lessonService->deleteLesson($lesson);

        return response()->json(['message' => 'Lesson deleted successfully']);
    }
}
