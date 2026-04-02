<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AdminAnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class AdminAnalyticsController extends Controller
{
    public function __construct(
        private readonly AdminAnalyticsService $analyticsService,
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
            'topCourses' => $this->analyticsService->getTopCourses($period),
            'revenueByCategory' => $this->analyticsService->getRevenueByCategory($period),
            'userGrowthByRole' => $this->analyticsService->getUserGrowthByRole($period),
            'recentActivity' => $this->analyticsService->getRecentActivity(),
            'systemHealth' => $this->analyticsService->getSystemHealth(),
            'period' => $period,
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
            'topCourses' => $this->analyticsService->getTopCourses($period),
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
