<?php

namespace App\Services;

use App\Models\TrainingPath;
use App\Models\User;
use App\Repositories\TrainingPathStatsRepository;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class TrainingPathAnalyticsService
{
    public function __construct(
        protected TrainingPathStatsRepository $statsRepository
    ) {}

    /**
     * Get KPI summary for teacher dashboard.
     */
    public function getTeacherKPIs(User $teacher, string $period = '30d'): array
    {
        [$startDate, $endDate] = $this->getPeriodDates($period);

        $stats = $this->statsRepository->getAggregatedForTeacher(
            $teacher->id,
            $startDate->toDateString(),
            $endDate->toDateString()
        );

        // Calculate period comparison
        $previousStart = $startDate->copy()->subDays($startDate->diffInDays($endDate));
        $previousEnd = $startDate->copy()->subDay();

        $previousStats = $this->statsRepository->getAggregatedForTeacher(
            $teacher->id,
            $previousStart->toDateString(),
            $previousEnd->toDateString()
        );

        return [
            'total_students' => $this->getTotalStudents($teacher),
            'total_enrollments' => $stats['total_enrollments'],
            'enrollments_change' => $this->calculateChange($stats['total_enrollments'], $previousStats['total_enrollments']),
            'total_completions' => $stats['total_completions'],
            'completions_change' => $this->calculateChange($stats['total_completions'], $previousStats['total_completions']),
            'total_revenue' => $stats['total_revenue_cents'] / 100,
            'revenue_change' => $this->calculateChange($stats['total_revenue_cents'], $previousStats['total_revenue_cents']),
            'quiz_pass_rate' => $stats['total_quiz_attempts'] > 0
                ? round(($stats['total_quiz_passes'] / $stats['total_quiz_attempts']) * 100, 1)
                : 0,
            'avg_video_minutes' => $stats['total_active'] > 0
                ? round($stats['total_video_minutes'] / $stats['total_active'], 1)
                : 0,
            'period' => $period,
        ];
    }

    /**
     * Get enrollment chart data.
     */
    public function getEnrollmentChart(User $teacher, string $period = '30d'): array
    {
        [$startDate, $endDate] = $this->getPeriodDates($period);

        $dailyStats = $this->statsRepository->getDailyTotalsForTeacher(
            $teacher->id,
            $startDate->toDateString(),
            $endDate->toDateString()
        );

        // Fill in missing dates with zeros
        $data = [];
        $current = $startDate->copy();
        $statsMap = $dailyStats->keyBy(fn ($s) => $s->date->toDateString());

        while ($current <= $endDate) {
            $dateStr = $current->toDateString();
            $stat = $statsMap->get($dateStr);

            $data[] = [
                'date' => $dateStr,
                'enrollments' => $stat ? $stat->enrollments : 0,
                'completions' => $stat ? $stat->completions : 0,
            ];

            $current->addDay();
        }

        return $data;
    }

    /**
     * Get revenue chart data.
     */
    public function getRevenueChart(User $teacher, string $period = '30d'): array
    {
        [$startDate, $endDate] = $this->getPeriodDates($period);

        $dailyStats = $this->statsRepository->getDailyTotalsForTeacher(
            $teacher->id,
            $startDate->toDateString(),
            $endDate->toDateString()
        );

        $data = [];
        $current = $startDate->copy();
        $statsMap = $dailyStats->keyBy(fn ($s) => $s->date->toDateString());

        while ($current <= $endDate) {
            $dateStr = $current->toDateString();
            $stat = $statsMap->get($dateStr);

            $data[] = [
                'date' => $dateStr,
                'revenue' => $stat ? $stat->revenue_cents / 100 : 0,
            ];

            $current->addDay();
        }

        return $data;
    }

    /**
     * Get completion funnel for a trainingPath.
     */
    public function getCompletionFunnel(TrainingPath $trainingPath): array
    {
        $totalEnrolled = $trainingPath->students()->count();

        if ($totalEnrolled === 0) {
            return [
                ['stage' => 'Enrolled', 'count' => 0, 'percentage' => 0],
                ['stage' => 'Started', 'count' => 0, 'percentage' => 0],
                ['stage' => '25% Complete', 'count' => 0, 'percentage' => 0],
                ['stage' => '50% Complete', 'count' => 0, 'percentage' => 0],
                ['stage' => '75% Complete', 'count' => 0, 'percentage' => 0],
                ['stage' => 'Completed', 'count' => 0, 'percentage' => 0],
            ];
        }

        $totalTrainingUnits = $trainingPath->trainingUnits()->count();

        if ($totalTrainingUnits === 0) {
            return [
                ['stage' => 'Enrolled', 'count' => $totalEnrolled, 'percentage' => 100],
                ['stage' => 'Started', 'count' => 0, 'percentage' => 0],
                ['stage' => 'Completed', 'count' => 0, 'percentage' => 0],
            ];
        }

        // Get completion count for each user
        $userCompletionCounts = DB::table('training_path_enrollments')
            ->select('training_path_enrollments.id', DB::raw('COALESCE(COUNT(DISTINCT lp.id), 0) as completion_count'))
            ->where('training_path_enrollments.training_path_id', $trainingPath->id)
            ->leftJoin('users', 'training_path_enrollments.user_id', '=', 'users.id')
            ->leftJoin('training_unit_progress as lp', function ($j) use ($trainingPath) {
                $j->on('lp.user_id', '=', 'users.id')
                    ->join('training_units', 'lp.training_unit_id', '=', 'training_units.id')
                    ->join('training_path_modules', 'training_units.module_id', '=', 'training_path_modules.id')
                    ->where('training_path_modules.training_path_id', $trainingPath->id)
                    ->where('lp.completed', 1);
            })
            ->groupBy('training_path_enrollments.id')
            ->get()
            ->pluck('completion_count')
            ->toArray();

        // Calculate progression stages
        $stages = [
            ['stage' => 'Enrolled', 'threshold' => 0],
            ['stage' => 'Started', 'threshold' => 1],
            ['stage' => '25% Complete', 'threshold' => ceil($totalTrainingUnits * 0.25)],
            ['stage' => '50% Complete', 'threshold' => ceil($totalTrainingUnits * 0.50)],
            ['stage' => '75% Complete', 'threshold' => ceil($totalTrainingUnits * 0.75)],
            ['stage' => 'Completed', 'threshold' => $totalTrainingUnits],
        ];

        $result = [];
        foreach ($stages as $stage) {
            if ($stage['threshold'] === 0) {
                $count = $totalEnrolled;
            } else {
                // Count how many users have >= threshold completed trainingUnits
                $count = collect($userCompletionCounts)->filter(function ($completions) use ($stage) {
                    return $completions >= $stage['threshold'];
                })->count();
            }

            $result[] = [
                'stage' => $stage['stage'],
                'count' => $count,
                'percentage' => round(($count / $totalEnrolled) * 100, 1),
            ];
        }

        return $result;
    }

    /**
     * Get top performing trainingPaths.
     */
    public function getTopTrainingPaths(User $teacher, string $period = '30d', string $metric = 'enrollments'): array
    {
        [$startDate, $endDate] = $this->getPeriodDates($period);

        if ($metric === 'revenue') {
            $trainingPaths = $this->statsRepository->getTopTrainingPathsByRevenue(
                $teacher->id,
                $startDate->toDateString(),
                $endDate->toDateString()
            );

            return $trainingPaths->map(fn ($stat) => [
                'id' => $stat->training_path_id,
                'title' => $stat->trainingPath->title,
                'thumbnail_url' => $stat->trainingPath->thumbnail_url,
                'value' => $stat->total_revenue_cents / 100,
                'formatted_value' => '$'.number_format($stat->total_revenue_cents / 100, 2),
            ])->toArray();
        }

        $trainingPaths = $this->statsRepository->getTopTrainingPathsByEnrollments(
            $teacher->id,
            $startDate->toDateString(),
            $endDate->toDateString()
        );

        return $trainingPaths->map(fn ($stat) => [
            'id' => $stat->training_path_id,
            'title' => $stat->trainingPath->title,
            'thumbnail_url' => $stat->trainingPath->thumbnail_url,
            'value' => $stat->total_enrollments,
            'formatted_value' => number_format($stat->total_enrollments),
        ])->toArray();
    }

    /**
     * Get student roster for a trainingPath.
     */
    public function getStudentRoster(TrainingPath $trainingPath, int $page = 1, int $perPage = 20): array
    {
        $students = $trainingPath->students()
            ->withPivot(['enrolled_at'])
            ->orderBy('training_path_enrollments.enrolled_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        $totalTrainingUnits = $trainingPath->trainingUnits()->count();
        $trainingPathId = $trainingPath->id;

        return [
            'data' => $students->map(function ($student) use ($totalTrainingUnits, $trainingPathId) {
                // Calculate trainingUnit progress for student
                $completedTrainingUnits = DB::table('training_unit_progress')
                    ->join('training_units', 'training_unit_progress.training_unit_id', '=', 'training_units.id')
                    ->join('training_path_modules', 'training_units.module_id', '=', 'training_path_modules.id')
                    ->where('training_path_modules.training_path_id', $trainingPathId)
                    ->where('training_unit_progress.user_id', $student->id)
                    ->where('training_unit_progress.completed', true)
                    ->count();

                $progress = $totalTrainingUnits > 0
                    ? round(($completedTrainingUnits / $totalTrainingUnits) * 100, 1)
                    : 0;

                $isCompleted = $totalTrainingUnits > 0 && $completedTrainingUnits >= $totalTrainingUnits;

                // Get completion date (last trainingUnit completed date if all done)
                $completedAt = null;
                if ($isCompleted) {
                    $completedAt = DB::table('training_unit_progress')
                        ->join('training_units', 'training_unit_progress.training_unit_id', '=', 'training_units.id')
                        ->join('training_path_modules', 'training_units.module_id', '=', 'training_path_modules.id')
                        ->where('training_path_modules.training_path_id', $trainingPathId)
                        ->where('training_unit_progress.user_id', $student->id)
                        ->where('training_unit_progress.completed', true)
                        ->max('training_unit_progress.updated_at');
                }

                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'avatar_url' => $student->avatar_url ?? null,
                    'enrolled_at' => $student->pivot->enrolled_at,
                    'completed_at' => $completedAt,
                    'progress' => $progress,
                    'is_completed' => $isCompleted,
                ];
            })->toArray(),
            'meta' => [
                'current_page' => $students->currentPage(),
                'last_page' => $students->lastPage(),
                'per_page' => $students->perPage(),
                'total' => $students->total(),
            ],
        ];
    }

    /**
     * Get total unique students across all teacher's trainingPaths.
     */
    protected function getTotalStudents(User $teacher): int
    {
        return DB::table('training_path_enrollments')
            ->join('training_paths', 'training_path_enrollments.training_path_id', '=', 'training_paths.id')
            ->where('training_paths.instructor_id', $teacher->id)
            ->distinct('training_path_enrollments.user_id')
            ->count('training_path_enrollments.user_id');
    }

    /**
     * Calculate percentage change between two values.
     */
    protected function calculateChange(int $current, int $previous): float
    {
        if ($previous === 0) {
            return $current > 0 ? 100 : 0;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }

    /**
     * Get start and end dates for a period.
     */
    protected function getPeriodDates(string $period): array
    {
        $endDate = Carbon::today();

        return match ($period) {
            '7d' => [Carbon::today()->subDays(6), $endDate],
            '30d' => [Carbon::today()->subDays(29), $endDate],
            '90d' => [Carbon::today()->subDays(89), $endDate],
            '12m' => [Carbon::today()->subYear()->addDay(), $endDate],
            default => [Carbon::today()->subDays(29), $endDate],
        };
    }
}
