<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Course\RejectCourseRequest;
use App\Http\Resources\CourseResource;
use App\Models\Course;
use App\Services\CourseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

/**
 * Admin controller for course approvals.
 */
class AdminCourseController extends Controller
{
    public function __construct(
        private readonly CourseService $courseService,
    ) {}

    /**
     * List all pending courses for review.
     */
    public function index(Request $request): JsonResponse|InertiaResponse
    {
        $pending = $this->courseService->getPendingCourses();

        if ($request->wantsJson()) {
            return response()->json([
                'data' => CourseResource::collection($pending),
            ]);
        }

        return Inertia::render('admin/CoursesPage', [
            'pendingCourses' => CourseResource::collection($pending),
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
}
