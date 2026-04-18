<?php

namespace App\Repositories;

use App\Models\DailyTrainingPathStats;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TrainingPathStatsRepository
{
    public function __construct(
        protected DailyTrainingPathStats $model
    ) {}

    public function upsert(int $trainingPathId, string $date, array $data): DailyTrainingPathStats
    {
        return $this->model->updateOrCreate(
            ['training_path_id' => $trainingPathId, 'date' => $date],
            $data
        );
    }

    public function getForTrainingPath(int $trainingPathId, string $startDate, string $endDate): Collection
    {
        return $this->model
            ->where('training_path_id', $trainingPathId)
            ->forDateRange($startDate, $endDate)
            ->orderBy('date')
            ->get();
    }

    public function getForTeacher(string|int $teacherId, string $startDate, string $endDate): Collection
    {
        return $this->model
            ->forTeacher($teacherId)
            ->forDateRange($startDate, $endDate)
            ->with('trainingPath:id,title')
            ->orderBy('date')
            ->get();
    }

    public function getAggregatedForTeacher(string|int $teacherId, string $startDate, string $endDate): array
    {
        // Do NOT cast to int - teacherId is a ULID string, not an integer
        
        // Use a new query builder for each aggregation to avoid state pollution
        $base = function () use ($teacherId, $startDate, $endDate) {
            return DailyTrainingPathStats::query()
                ->join('training_paths', 'daily_training_path_stats.training_path_id', '=', 'training_paths.id')
                ->where('training_paths.instructor_id', $teacherId)
                ->whereBetween('daily_training_path_stats.date', [$startDate, $endDate]);
        };

        return [
            'total_enrollments' => (int) ($base()->sum('daily_training_path_stats.enrollments') ?? 0),
            'total_completions' => (int) ($base()->sum('daily_training_path_stats.completions') ?? 0),
            'total_active' => (int) ($base()->sum('daily_training_path_stats.active_students') ?? 0),
            'total_training_units_viewed' => (int) ($base()->sum('daily_training_path_stats.training_units_viewed') ?? 0),
            'total_video_minutes' => (int) ($base()->sum('daily_training_path_stats.video_minutes_watched') ?? 0),
            'total_quiz_attempts' => (int) ($base()->sum('daily_training_path_stats.quiz_attempts') ?? 0),
            'total_quiz_passes' => (int) ($base()->sum('daily_training_path_stats.quiz_passes') ?? 0),
            'total_revenue_cents' => (int) ($base()->sum('daily_training_path_stats.revenue_cents') ?? 0),
        ];
    }

    public function getDailyTotalsForTeacher(string|int $teacherId, string $startDate, string $endDate): Collection
    {
        return DailyTrainingPathStats::query()
            ->selectRaw('
                daily_training_path_stats.date,
                SUM(daily_training_path_stats.enrollments) as enrollments,
                SUM(daily_training_path_stats.completions) as completions,
                SUM(daily_training_path_stats.active_students) as active_students,
                SUM(daily_training_path_stats.revenue_cents) as revenue_cents
            ')
            ->join('training_paths', 'daily_training_path_stats.training_path_id', '=', 'training_paths.id')
            ->where('training_paths.instructor_id', $teacherId)
            ->whereBetween('daily_training_path_stats.date', [$startDate, $endDate])
            ->groupBy('daily_training_path_stats.date')
            ->orderBy('daily_training_path_stats.date')
            ->get();
    }

    public function getTopTrainingPathsByEnrollments(string|int $teacherId, string $startDate, string $endDate, int $limit = 5): Collection
    {
        return DailyTrainingPathStats::query()
            ->select('daily_training_path_stats.training_path_id')
            ->selectRaw('SUM(daily_training_path_stats.enrollments) as total_enrollments')
            ->join('training_paths', 'daily_training_path_stats.training_path_id', '=', 'training_paths.id')
            ->where('training_paths.instructor_id', $teacherId)
            ->whereBetween('daily_training_path_stats.date', [$startDate, $endDate])
            ->groupBy('daily_training_path_stats.training_path_id')
            ->with('trainingPath:id,title,thumbnail')
            ->orderByDesc('total_enrollments')
            ->limit($limit)
            ->get();
    }

    public function getTopTrainingPathsByRevenue(string|int $teacherId, string $startDate, string $endDate, int $limit = 5): Collection
    {
        return DailyTrainingPathStats::query()
            ->select('daily_training_path_stats.training_path_id')
            ->selectRaw('SUM(daily_training_path_stats.revenue_cents) as total_revenue_cents')
            ->join('training_paths', 'daily_training_path_stats.training_path_id', '=', 'training_paths.id')
            ->where('training_paths.instructor_id', $teacherId)
            ->whereBetween('daily_training_path_stats.date', [$startDate, $endDate])
            ->groupBy('daily_training_path_stats.training_path_id')
            ->with('trainingPath:id,title,thumbnail')
            ->orderByDesc('total_revenue_cents')
            ->limit($limit)
            ->get();
    }
}
