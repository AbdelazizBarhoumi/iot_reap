<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Course\RejectCourseRequest;
use App\Http\Resources\CourseResource;
use App\Models\Course;
use App\Services\CourseService;
use App\Services\FeaturedCoursesService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

/**
 * Admin controller for course approvals and featured courses.
 */
class AdminCourseController extends Controller
{
    public function __construct(
        private readonly CourseService $courseService,
        private readonly FeaturedCoursesService $featuredCoursesService,
    ) {}

    /**
     * List all pending courses for review.
     */
    public function index(Request $request): JsonResponse|InertiaResponse
    {
        $pending = $this->courseService->getPendingCourses();
        $featured = $this->featuredCoursesService->getFeaturedCourses(10);

        if ($request->wantsJson()) {
            return response()->json([
                'data' => CourseResource::collection($pending),
                'featured' => CourseResource::collection($featured),
            ]);
        }

        return Inertia::render('admin/CoursesPage', [
            'pendingCourses' => CourseResource::collection($pending),
            'featuredCourses' => CourseResource::collection($featured),
        ]);
    }

    /**
     * Approve a course.
     */
    public function approve(Request $request, Course $course): JsonResponse
    {
        $updated = $this->courseService->approveCourse($course);

        return response()->json([
            'data' => new CourseResource($updated),
            'message' => 'Course approved successfully',
        ]);
    }

    /**
     * Reject a course.
     */
    public function reject(RejectCourseRequest $request, Course $course): JsonResponse
    {
        $updated = $this->courseService->rejectCourse(
            $course,
            $request->validated('feedback')
        );

        return response()->json([
            'data' => new CourseResource($updated),
            'message' => 'Course rejected',
        ]);
    }

    /**
     * Feature a course.
     */
    public function feature(Request $request, Course $course): JsonResponse
    {
        $order = $request->input('order');

        $updated = $this->featuredCoursesService->featureCourse(
            $course,
            $request->user(),
            $order
        );

        return response()->json([
            'data' => new CourseResource($updated),
            'message' => 'Course featured successfully',
        ]);
    }

    /**
     * Unfeature a course.
     */
    public function unfeature(Request $request, Course $course): JsonResponse
    {
        $updated = $this->featuredCoursesService->unfeatureCourse(
            $course,
            $request->user()
        );

        return response()->json([
            'data' => new CourseResource($updated),
            'message' => 'Course removed from featured',
        ]);
    }

    /**
     * Update featured courses order.
     */
    public function updateFeaturedOrder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order' => ['required', 'array'],
            'order.*' => ['required', 'integer'],
        ]);

        $this->featuredCoursesService->updateFeaturedOrder(
            $validated['order'],
            $request->user()
        );

        return response()->json([
            'message' => 'Featured order updated',
        ]);
    }
}
