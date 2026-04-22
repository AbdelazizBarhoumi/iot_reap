<?php

namespace App\Http\Controllers;

use App\Http\Resources\SystemAlertResource;
use App\Models\SystemAlert;
use App\Services\AlertService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

/**
 * Alert Controller
 * 
 * Admin API for managing system alerts
 */
class AlertController extends Controller
{
    public function __construct(
        protected AlertService $alertService
    ) {}

    /**
     * Get all alerts (paginated)
     */
    public function index(Request $request): JsonResponse|InertiaResponse
    {
        Gate::authorize('admin-only');

        if (! $request->wantsJson()) {
            return Inertia::render('admin/AlertsPage');
        }

        $alerts = $this->alertService->getPaginated(
            perPage: $request->input('per_page', 15),
            filters: $request->only(['severity', 'source', 'status'])
        );

        return response()->json([
            'data' => SystemAlertResource::collection($alerts->items()),
            'meta' => [
                'current_page' => $alerts->currentPage(),
                'last_page' => $alerts->lastPage(),
                'total' => $alerts->total(),
                'per_page' => $alerts->perPage(),
            ],
        ]);
    }

    /**
     * Get unacknowledged alerts
     */
    public function unacknowledged(): JsonResponse
    {
        Gate::authorize('admin-only');

        $alerts = $this->alertService->getUnacknowledged();

        return response()->json([
            'data' => SystemAlertResource::collection($alerts),
        ]);
    }

    /**
     * Get alert statistics
     */
    public function stats(): JsonResponse
    {
        Gate::authorize('admin-only');

        $stats = $this->alertService->getStats();

        return response()->json($stats);
    }

    /**
     * Acknowledge an alert
     */
    public function acknowledge(SystemAlert $alert): JsonResponse
    {
        Gate::authorize('admin-only');

        $this->alertService->acknowledge($alert, auth('web')->user());

        return response()->json([
            'message' => 'Alert acknowledged successfully',
            'data' => new SystemAlertResource($alert->refresh()),
        ]);
    }

    /**
     * Acknowledge all unacknowledged alerts
     */
    public function acknowledgeAll(): JsonResponse
    {
        Gate::authorize('admin-only');

        SystemAlert::unacknowledged()->each(function (SystemAlert $alert) {
            $this->alertService->acknowledge($alert, auth('web')->user());
        });

        return response()->json([
            'message' => 'All alerts acknowledged successfully',
        ]);
    }

    /**
     * Resolve an alert
     */
    public function resolve(SystemAlert $alert): JsonResponse
    {
        Gate::authorize('admin-only');

        $this->alertService->resolve($alert);

        return response()->json([
            'message' => 'Alert resolved successfully',
            'data' => new SystemAlertResource($alert->refresh()),
        ]);
    }

    /**
     * Delete an alert
     */
    public function destroy(SystemAlert $alert): JsonResponse
    {
        Gate::authorize('admin-only');

        $alert->delete();

        return response()->json([
            'message' => 'Alert deleted successfully',
        ]);
    }
}
