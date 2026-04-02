<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Services\CourseAnalyticsService;
use App\Services\RevenueService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeacherAnalyticsController extends Controller
{
    public function __construct(
        protected CourseAnalyticsService $analyticsService,
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
        $topCourses = $this->analyticsService->getTopCourses($teacher, $period, 'enrollments');

        return Inertia::render('teaching/analytics', [
            'kpis' => $kpis,
            'enrollmentChart' => $enrollmentChart,
            'revenueChart' => $revenueChart,
            'topCourses' => $topCourses,
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
     * Student roster for a course.
     */
    public function students(Request $request, Course $course): Response
    {
        $this->authorizeTeacher($course);

        $page = $request->get('page', 1);
        $roster = $this->analyticsService->getStudentRoster($course, $page);

        return Inertia::render('teaching/students', [
            'course' => [
                'id' => $course->id,
                'title' => $course->title,
            ],
            'students' => $roster['data'],
            'pagination' => $roster['meta'],
        ]);
    }

    /**
     * Completion funnel for a course.
     */
    public function funnel(Request $request, Course $course): JsonResponse
    {
        $this->authorizeTeacher($course);

        return response()->json([
            'funnel' => $this->analyticsService->getCompletionFunnel($course),
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
        $revenueByCourse = $this->revenueService->getRevenueByCourse(
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
            'revenueByCourse' => $revenueByCourse,
            'revenueChart' => $revenueChart,
            'period' => $period,
        ]);
    }

    /**
     * Download earnings CSV.
     */
    public function exportEarnings(Request $request): \Symfony\Component\HttpFoundation\StreamedResponse
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
     * Authorize that the current user owns the course.
     */
    protected function authorizeTeacher(Course $course): void
    {
        if ($course->instructor_id !== auth()->id()) {
            abort(403, 'You do not own this course.');
        }
    }
}
