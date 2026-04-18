<?php

namespace App\Services;

use App\Models\Certificate;
use App\Models\TrainingPath;
use App\Models\TrainingPathEnrollment;
use App\Models\Payment;
use App\Models\User;
use App\Models\VMSession;
use App\Repositories\TrainingPathStatsRepository;
use App\Support\DateRangeHelper;
use Illuminate\Support\Carbon;

class AdminAnalyticsService
{
    public function __construct(
        protected TrainingPathStatsRepository $statsRepository,
        protected SystemHealthService $systemHealthService,
    ) {}

    /**
     * Get platform-wide KPIs for admin dashboard.
     */
    public function getPlatformKPIs(string $period = '30d'): array
    {
        [$startDate, $endDate] = DateRangeHelper::getPeriodDates($period);
        [$prevStartDate, $prevEndDate] = DateRangeHelper::getPreviousPeriodDates($startDate, $endDate);

        // Current period
        $currentStats = $this->getPeriodStats($startDate, $endDate);
        $previousStats = $this->getPeriodStats($prevStartDate, $prevEndDate);

        return [
            'total_users' => User::count(),
            'new_users' => $currentStats['new_users'],
            'new_users_change' => DateRangeHelper::calculatePercentageChange($currentStats['new_users'], $previousStats['new_users']),
            'total_enrollments' => $currentStats['enrollments'],
            'enrollments_change' => DateRangeHelper::calculatePercentageChange($currentStats['enrollments'], $previousStats['enrollments']),
            'total_completions' => $currentStats['completions'],
            'completions_change' => DateRangeHelper::calculatePercentageChange($currentStats['completions'], $previousStats['completions']),
            'total_revenue' => $currentStats['revenue'] / 100,
            'revenue_change' => DateRangeHelper::calculatePercentageChange($currentStats['revenue'], $previousStats['revenue']),
            'total_vm_sessions' => $currentStats['vm_sessions'],
            'vm_sessions_change' => DateRangeHelper::calculatePercentageChange($currentStats['vm_sessions'], $previousStats['vm_sessions']),
            'active_trainingPaths' => TrainingPath::where('status', 'approved')->count(),
            'certificates_issued' => $currentStats['certificates'],
            'period' => $period,
        ];
    }

    /**
     * Get stats for a date range.
     */
    protected function getPeriodStats(Carbon $startDate, Carbon $endDate): array
    {
        return [
            'new_users' => User::whereBetween('created_at', [$startDate, $endDate->endOfDay()])->count(),
            'enrollments' => TrainingPathEnrollment::whereBetween('enrolled_at', [$startDate, $endDate->endOfDay()])->count(),
            'completions' => TrainingPathEnrollment::whereNotNull('completed_at')
                ->whereBetween('completed_at', [$startDate, $endDate->endOfDay()])
                ->count(),
            'revenue' => Payment::where('status', 'completed')
                ->whereBetween('paid_at', [$startDate, $endDate->endOfDay()])
                ->sum('amount_cents') ?? 0,
            'vm_sessions' => VMSession::whereBetween('created_at', [$startDate, $endDate->endOfDay()])->count(),
            'certificates' => Certificate::whereBetween('issued_at', [$startDate, $endDate->endOfDay()])->count(),
        ];
    }

    /**
     * Get enrollment and revenue chart data.
     */
    public function getChartData(string $period = '30d'): array
    {
        [$startDate, $endDate] = DateRangeHelper::getPeriodDates($period);

        $enrollments = TrainingPathEnrollment::selectRaw('DATE(enrolled_at) as date, COUNT(*) as count')
            ->whereBetween('enrolled_at', [$startDate, $endDate->endOfDay()])
            ->groupByRaw('DATE(enrolled_at)')
            ->pluck('count', 'date')
            ->toArray();

        $revenue = Payment::selectRaw('DATE(paid_at) as date, SUM(amount_cents) as total')
            ->where('status', 'completed')
            ->whereBetween('paid_at', [$startDate, $endDate->endOfDay()])
            ->groupByRaw('DATE(paid_at)')
            ->pluck('total', 'date')
            ->toArray();

        $vmSessions = VMSession::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->whereBetween('created_at', [$startDate, $endDate->endOfDay()])
            ->groupByRaw('DATE(created_at)')
            ->pluck('count', 'date')
            ->toArray();

        // Build complete date range with zeros
        $data = [];
        $current = $startDate->copy();
        while ($current <= $endDate) {
            $dateStr = $current->toDateString();
            $data[] = [
                'date' => $dateStr,
                'enrollments' => $enrollments[$dateStr] ?? 0,
                'revenue' => isset($revenue[$dateStr]) ? $revenue[$dateStr] / 100 : 0,
                'vm_sessions' => $vmSessions[$dateStr] ?? 0,
            ];
            $current->addDay();
        }

        return $data;
    }

    /**
     * Get top trainingPaths by enrollments.
     */
    public function getTopTrainingPaths(string $period = '30d', int $limit = 5): array
    {
        [$startDate, $endDate] = DateRangeHelper::getPeriodDates($period);

        return TrainingPath::select(['training_paths.id', 'training_paths.title', 'training_paths.thumbnail', 'training_paths.instructor_id'])
            ->selectRaw('COUNT(training_path_enrollments.id) as enrollment_count')
            ->with('instructor')
            ->leftJoin('training_path_enrollments', 'training_paths.id', '=', 'training_path_enrollments.training_path_id')
            ->whereBetween('training_path_enrollments.enrolled_at', [$startDate, $endDate->endOfDay()])
            ->where('training_paths.status', 'approved')
            ->groupBy(['training_paths.id', 'training_paths.title', 'training_paths.thumbnail', 'training_paths.instructor_id'])
            ->orderByDesc('enrollment_count')
            ->limit($limit)
            ->get()
            ->map(fn ($trainingPath) => [
                'id' => $trainingPath->id,
                'title' => $trainingPath->title,
                'thumbnail_url' => $trainingPath->thumbnail_url,
                'enrollments' => $trainingPath->enrollment_count,
                'instructor' => $trainingPath->instructor?->name ?? 'Unknown',
            ])
            ->toArray();
    }

    /**
     * Get revenue breakdown by trainingPath.
     */
    public function getRevenueByCategory(string $period = '30d'): array
    {
        [$startDate, $endDate] = DateRangeHelper::getPeriodDates($period);

        return Payment::selectRaw('training_paths.category, SUM(payments.amount_cents) as total')
            ->join('training_paths', 'payments.training_path_id', '=', 'training_paths.id')
            ->where('payments.status', 'completed')
            ->whereBetween('payments.paid_at', [$startDate, $endDate->endOfDay()])
            ->groupBy('training_paths.category')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => [
                'category' => $row->category ?? 'Uncategorized',
                'revenue' => $row->total / 100,
            ])
            ->toArray();
    }

    /**
     * Get user registration trend by role.
     */
    public function getUserGrowthByRole(string $period = '30d'): array
    {
        [$startDate, $endDate] = DateRangeHelper::getPeriodDates($period);

        return User::selectRaw('role, COUNT(*) as count')
            ->whereBetween('created_at', [$startDate, $endDate->endOfDay()])
            ->groupBy('role')
            ->pluck('count', 'role')
            ->toArray();
    }

    /**
     * Get recent activity feed.
     */
    public function getRecentActivity(int $limit = 10): array
    {
        $activities = collect();

        // Recent enrollments
        $enrollments = TrainingPathEnrollment::with(['user', 'trainingPath'])
            ->latest('enrolled_at')
            ->limit($limit)
            ->get()
            ->map(fn ($e) => [
                'type' => 'enrollment',
                'message' => "{$e->user?->name} enrolled in {$e->trainingPath?->title}",
                'timestamp' => $e->enrolled_at,
            ]);

        // Recent payments
        $payments = Payment::with(['user', 'trainingPath'])
            ->where('status', 'completed')
            ->latest('paid_at')
            ->limit($limit)
            ->get()
            ->map(fn ($p) => [
                'type' => 'payment',
                'message' => "{$p->user?->name} purchased {$p->trainingPath?->title}",
                'amount' => $p->amount_cents / 100,
                'timestamp' => $p->paid_at,
            ]);

        // Recent VM sessions
        $vmSessions = VMSession::with('user')
            ->latest('created_at')
            ->limit($limit)
            ->get()
            ->map(fn ($s) => [
                'type' => 'vm_session',
                'message' => "{$s->user?->name} started a VM session",
                'timestamp' => $s->created_at,
            ]);

        return $activities
            ->merge($enrollments)
            ->merge($payments)
            ->merge($vmSessions)
            ->sortByDesc('timestamp')
            ->take($limit)
            ->values()
            ->toArray();
    }

    /**
     * Get system health metrics.
     */
    public function getSystemHealth(): array
    {
        $activeVMSessions = VMSession::where('status', 'active')->count();

        // Get detailed system health from SystemHealthService
        $systemHealth = $this->systemHealthService->getSystemHealth();

        return [
            'status' => $systemHealth['status'],
            'active_vm_sessions' => $activeVMSessions,
            'queued_sessions' => 0, // VM session queue is not available
            'pending_trainingPaths' => TrainingPath::where('status', 'pending_review')->count(),
            'suspended_users' => User::whereNotNull('suspended_at')->count(),
            'services' => $systemHealth['services'],
            'metrics' => $systemHealth['metrics'],
            'timestamp' => $systemHealth['timestamp'],
        ];
    }
}
