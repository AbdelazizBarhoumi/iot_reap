<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AdminAnalyticsService;
use App\Services\AlertService;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class AdminAnalyticsController extends Controller
{
    public function __construct(
        private readonly AdminAnalyticsService $analyticsService,
        private readonly AlertService $alertService,
        private readonly ActivityLogService $activityLogService,
    ) {}

    /**
     * Admin dashboard with platform analytics.
     */
    public function dashboard(Request $request): JsonResponse|InertiaResponse
    {
        $period = $request->string('period', '30d')->toString();

        $data = [
            'kpis' => $this->analyticsService->getPlatformKPIs($period),
            'chartData' => $this->analyticsService->getChartData($period),
            'topTrainingPaths' => $this->analyticsService->getTopTrainingPaths($period),
            'revenueByCategory' => $this->analyticsService->getRevenueByCategory($period),
            'userGrowthByRole' => $this->analyticsService->getUserGrowthByRole($period),
            'recentActivity' => $this->analyticsService->getRecentActivity(),
            'systemHealth' => $this->analyticsService->getSystemHealth(),
            'period' => $period,
            // Add alerts and activity logs for monitoring components
            'alerts' => $this->alertService->getUnacknowledged(),
            'activityLogs' => $this->activityLogService->getRecent(10),
        ];

        if ($request->wantsJson()) {
            return response()->json($data);
        }

        return Inertia::render('admin/DashboardPage', $data);
    }

    /**
     * Get updated KPIs only (for period change).
     */
    public function kpis(Request $request): JsonResponse
    {
        $period = $request->string('period', '30d')->toString();

        return response()->json([
            'kpis' => $this->analyticsService->getPlatformKPIs($period),
            'chartData' => $this->analyticsService->getChartData($period),
            'topTrainingPaths' => $this->analyticsService->getTopTrainingPaths($period),
        ]);
    }

    /**
     * Get system health metrics.
     */
    public function health(): JsonResponse
    {
        return response()->json([
            'health' => $this->analyticsService->getSystemHealth(),
        ]);
    }
}
