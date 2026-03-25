<?php

namespace App\Http\Controllers;

use App\Http\Requests\ApproveVMAssignmentRequest;
use App\Http\Requests\AssignVMToLessonRequest;
use App\Http\Requests\RejectVMAssignmentRequest;
use App\Http\Resources\LessonVMAssignmentResource;
use App\Http\Resources\VMTemplateResource;
use App\Models\Lesson;
use App\Models\LessonVMAssignment;
use App\Models\VMTemplate;
use App\Services\LessonVMAssignmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class LessonVMAssignmentController extends Controller
{
    public function __construct(
        private LessonVMAssignmentService $assignmentService,
    ) {}

    /**
     * List pending assignments for admin review.
     */
    public function pending(Request $request): JsonResponse|Response
    {
        Gate::authorize('admin-only');

        $assignments = $this->assignmentService->getPendingAssignments();

        if ($request->wantsJson()) {
            return response()->json([
                'data' => LessonVMAssignmentResource::collection($assignments),
            ]);
        }

        return Inertia::render('admin/VMAssignmentApprovalsPage', [
            'assignments' => LessonVMAssignmentResource::collection($assignments),
        ]);
    }

    /**
     * Get available templates for assignment.
     */
    public function templates(Request $request): JsonResponse
    {
        $templates = $this->assignmentService->getAvailableTemplates();

        return response()->json([
            'data' => VMTemplateResource::collection($templates),
        ]);
    }

    /**
     * Get assignment for a specific lesson.
     */
    public function forLesson(Request $request, int $lessonId): JsonResponse
    {
        $assignment = $this->assignmentService->getApprovedAssignment($lessonId);

        return response()->json([
            'data' => $assignment ? new LessonVMAssignmentResource($assignment->load([
                'vmTemplate',
                'assignedByUser',
                'approvedByUser',
            ])) : null,
        ]);
    }

    /**
     * Assign a VM template to a lesson (teacher action).
     */
    public function store(AssignVMToLessonRequest $request): JsonResponse
    {
        $lesson = Lesson::findOrFail($request->validated('lesson_id'));
        $template = VMTemplate::findOrFail($request->validated('vm_template_id'));

        try {
            $assignment = $this->assignmentService->assignVMToLesson(
                $lesson,
                $template,
                $request->user(),
                $request->validated('teacher_notes')
            );

            return response()->json([
                'data' => new LessonVMAssignmentResource($assignment->load([
                    'lesson.module.course',
                    'vmTemplate',
                    'assignedByUser',
                ])),
                'message' => 'VM assignment submitted for admin approval.',
            ], 201);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    /**
     * Approve an assignment (admin action).
     */
    public function approve(ApproveVMAssignmentRequest $request, LessonVMAssignment $assignment): JsonResponse
    {
        try {
            $assignment = $this->assignmentService->approveAssignment(
                $assignment,
                $request->user(),
                $request->validated('admin_notes')
            );

            return response()->json([
                'data' => new LessonVMAssignmentResource($assignment),
                'message' => 'Assignment approved. VM is now available for this lesson.',
            ]);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    /**
     * Reject an assignment (admin action).
     */
    public function reject(RejectVMAssignmentRequest $request, LessonVMAssignment $assignment): JsonResponse
    {
        try {
            $assignment = $this->assignmentService->rejectAssignment(
                $assignment,
                $request->user(),
                $request->validated('admin_notes')
            );

            return response()->json([
                'data' => new LessonVMAssignmentResource($assignment),
                'message' => 'Assignment rejected.',
            ]);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    /**
     * Remove an assignment.
     */
    public function destroy(Request $request, LessonVMAssignment $assignment): JsonResponse
    {
        try {
            $this->assignmentService->removeAssignment($assignment, $request->user());

            return response()->json(['message' => 'Assignment removed successfully.']);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    /**
     * Get teacher's assignments.
     */
    public function myAssignments(Request $request): JsonResponse
    {
        $assignments = $this->assignmentService->getAssignmentsForTeacher($request->user());

        return response()->json([
            'data' => LessonVMAssignmentResource::collection($assignments),
        ]);
    }
}
