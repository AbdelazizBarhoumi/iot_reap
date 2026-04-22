<?php

namespace App\Http\Controllers;

use App\Http\Resources\ActivityLogResource;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

/**
 * Activity Log Controller
 * 
 * Admin API for viewing activity logs
 */
class ActivityLogController extends Controller
{
    public function __construct(
        protected ActivityLogService $activityLogService
    ) {}

    /**
     * Get all activity logs (paginated)
     */
    public function index(Request $request): JsonResponse|InertiaResponse
    {
        Gate::authorize('admin-only');

        if (! $request->wantsJson()) {
            return Inertia::render('admin/ActivityLogsPage');
        }

        $activities = $this->activityLogService->getPaginated(
            perPage: $request->input('per_page', 20),
            filters: $request->only(['type', 'action', 'user_id', 'status', 'days'])
        );

        return response()->json([
            'data' => ActivityLogResource::collection($activities->items()),
            'meta' => [
                'current_page' => $activities->currentPage(),
                'last_page' => $activities->lastPage(),
                'total' => $activities->total(),
                'per_page' => $activities->perPage(),
            ],
        ]);
    }

    /**
     * Get recent activity logs
     */
    public function recent(Request $request): JsonResponse
    {
        Gate::authorize('admin-only');

        $limit = $request->input('limit', 10);
        $activities = $this->activityLogService->getRecent($limit, $request->only(['type', 'user_id']));

        return response()->json([
            'data' => ActivityLogResource::collection($activities),
        ]);
    }

    /**
     * Get activity statistics
     */
    public function stats(Request $request): JsonResponse
    {
        Gate::authorize('admin-only');

        $days = $request->input('days', 7);
        $stats = $this->activityLogService->getStats($days);

        return response()->json($stats);
    }

    /**
     * Get activity by user
     */
    public function userActivity(Request $request): JsonResponse
    {
        Gate::authorize('admin-only');

        $userId = $request->input('user_id');
        if (!$userId) {
            return response()->json(['error' => 'user_id is required'], 400);
        }

        $activities = $this->activityLogService->getPaginated(
            perPage: $request->input('per_page', 20),
            filters: array_merge($request->only(['type', 'action', 'status']), ['user_id' => $userId])
        );

        return response()->json([
            'data' => ActivityLogResource::collection($activities->items()),
            'meta' => [
                'current_page' => $activities->currentPage(),
                'last_page' => $activities->lastPage(),
                'total' => $activities->total(),
                'per_page' => $activities->perPage(),
            ],
        ]);
    }
}
