<?php

namespace App\Http\Controllers;

use App\Models\TrainingPath;
use App\Services\RevenueService;
use App\Services\TrainingPathAnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TeacherAnalyticsController extends Controller
{
    public function __construct(
        protected TrainingPathAnalyticsService $analyticsService,
        protected RevenueService $revenueService
    ) {}

    /**
     * Teacher analytics dashboard.
     */
    public function index(Request $request): Response
    {
        $teacher = $request->user();
        $period = $request->get('period', '30d');

        $kpis = $this->analyticsService->getTeacherKPIs($teacher, $period);
        $enrollmentChart = $this->analyticsService->getEnrollmentChart($teacher, $period);
        $revenueChart = $this->analyticsService->getRevenueChart($teacher, $period);
        $topTrainingPaths = $this->analyticsService->getTopTrainingPaths($teacher, $period, 'enrollments');

        return Inertia::render('teaching/analytics', [
            'kpis' => $kpis,
            'enrollmentChart' => $enrollmentChart,
            'revenueChart' => $revenueChart,
            'topTrainingPaths' => $topTrainingPaths,
            'period' => $period,
        ]);
    }

    /**
     * Get KPIs as JSON (for period switching).
     */
    public function kpis(Request $request): JsonResponse
    {
        $teacher = $request->user();
        $period = $request->get('period', '30d');

        return response()->json([
            'kpis' => $this->analyticsService->getTeacherKPIs($teacher, $period),
        ]);
    }

    /**
     * Get enrollment chart data.
     */
    public function enrollmentChart(Request $request): JsonResponse
    {
        $teacher = $request->user();
        $period = $request->get('period', '30d');

        return response()->json([
            'data' => $this->analyticsService->getEnrollmentChart($teacher, $period),
        ]);
    }

    /**
     * Get revenue chart data.
     */
    public function revenueChart(Request $request): JsonResponse
    {
        $teacher = $request->user();
        $period = $request->get('period', '30d');

        return response()->json([
            'data' => $this->analyticsService->getRevenueChart($teacher, $period),
        ]);
    }

    /**
     * Student roster for a trainingPath.
     */
    public function students(Request $request, TrainingPath $trainingPath): Response
    {
        $this->authorizeTeacher($trainingPath);

        $page = $request->get('page', 1);
        $roster = $this->analyticsService->getStudentRoster($trainingPath, $page);

        return Inertia::render('teaching/students', [
            'trainingPath' => [
                'id' => $trainingPath->id,
                'title' => $trainingPath->title,
            ],
            'students' => $roster['data'],
            'pagination' => $roster['meta'],
        ]);
    }

    /**
     * Completion funnel for a trainingPath.
     */
    public function funnel(Request $request, TrainingPath $trainingPath): JsonResponse
    {
        $this->authorizeTeacher($trainingPath);

        return response()->json([
            'funnel' => $this->analyticsService->getCompletionFunnel($trainingPath),
        ]);
    }

    /**
     * Earnings page.
     */
    public function earnings(Request $request): Response
    {
        $teacher = $request->user();
        $period = $request->get('period', '30d');

        $summary = $this->revenueService->getEarningsSummary($teacher, $period);
        $revenueByTrainingPath = $this->revenueService->getRevenueByTrainingPath(
            $teacher,
            $summary['start_date'],
            $summary['end_date']
        );
        $revenueChart = $this->revenueService->getRevenueByDateRange(
            $teacher,
            $summary['start_date'],
            $summary['end_date']
        );

        return Inertia::render('teaching/earnings', [
            'summary' => $summary,
            'revenueByTrainingPath' => $revenueByTrainingPath,
            'revenueChart' => $revenueChart,
            'period' => $period,
        ]);
    }

    /**
     * Download earnings CSV.
     */
    public function exportEarnings(Request $request): StreamedResponse
    {
        $teacher = $request->user();
        $startDate = $request->get('start_date', now()->subDays(30)->toDateString());
        $endDate = $request->get('end_date', now()->toDateString());

        $csv = $this->revenueService->generateEarningsCSV($teacher, $startDate, $endDate);

        return response()->streamDownload(function () use ($csv) {
            echo $csv;
        }, 'earnings-'.now()->format('Y-m-d').'.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }

    /**
     * Authorize that the current user owns the trainingPath.
     */
    protected function authorizeTeacher(TrainingPath $trainingPath): void
    {
        if ($trainingPath->instructor_id !== auth()->id()) {
            abort(403, 'You do not own this trainingPath.');
        }
    }
}
