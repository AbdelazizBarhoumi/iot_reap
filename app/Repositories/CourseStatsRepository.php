<?php

namespace App\Repositories;

use App\Models\DailyCourseStats;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CourseStatsRepository
{
    public function __construct(
        protected DailyCourseStats $model
    ) {}

    public function upsert(int $courseId, string $date, array $data): DailyCourseStats
    {
        return $this->model->updateOrCreate(
            ['course_id' => $courseId, 'date' => $date],
            $data
        );
    }

    public function getForCourse(int $courseId, string $startDate, string $endDate): Collection
    {
        return $this->model
            ->where('course_id', $courseId)
            ->forDateRange($startDate, $endDate)
            ->orderBy('date')
            ->get();
    }

    public function getForTeacher(string|int $teacherId, string $startDate, string $endDate): Collection
    {
        return $this->model
            ->forTeacher($teacherId)
            ->forDateRange($startDate, $endDate)
            ->with('course:id,title')
            ->orderBy('date')
            ->get();
    }

    public function getAggregatedForTeacher(string|int $teacherId, string $startDate, string $endDate): array
    {
        // Do NOT cast to int - teacherId is a ULID string, not an integer
        
        // Use a new query builder for each aggregation to avoid state pollution
        $base = function () use ($teacherId, $startDate, $endDate) {
            return DailyCourseStats::query()
                ->join('courses', 'daily_course_stats.course_id', '=', 'courses.id')
                ->where('courses.instructor_id', $teacherId)
                ->whereBetween('daily_course_stats.date', [$startDate, $endDate]);
        };

        return [
            'total_enrollments' => (int) ($base()->sum('daily_course_stats.enrollments') ?? 0),
            'total_completions' => (int) ($base()->sum('daily_course_stats.completions') ?? 0),
            'total_active' => (int) ($base()->sum('daily_course_stats.active_students') ?? 0),
            'total_lessons_viewed' => (int) ($base()->sum('daily_course_stats.lessons_viewed') ?? 0),
            'total_video_minutes' => (int) ($base()->sum('daily_course_stats.video_minutes_watched') ?? 0),
            'total_quiz_attempts' => (int) ($base()->sum('daily_course_stats.quiz_attempts') ?? 0),
            'total_quiz_passes' => (int) ($base()->sum('daily_course_stats.quiz_passes') ?? 0),
            'total_revenue_cents' => (int) ($base()->sum('daily_course_stats.revenue_cents') ?? 0),
        ];
    }

    public function getDailyTotalsForTeacher(string|int $teacherId, string $startDate, string $endDate): Collection
    {
        return DailyCourseStats::query()
            ->selectRaw('
                daily_course_stats.date,
                SUM(daily_course_stats.enrollments) as enrollments,
                SUM(daily_course_stats.completions) as completions,
                SUM(daily_course_stats.active_students) as active_students,
                SUM(daily_course_stats.revenue_cents) as revenue_cents
            ')
            ->join('courses', 'daily_course_stats.course_id', '=', 'courses.id')
            ->where('courses.instructor_id', $teacherId)
            ->whereBetween('daily_course_stats.date', [$startDate, $endDate])
            ->groupBy('daily_course_stats.date')
            ->orderBy('daily_course_stats.date')
            ->get();
    }

    public function getTopCoursesByEnrollments(string|int $teacherId, string $startDate, string $endDate, int $limit = 5): Collection
    {
        return DailyCourseStats::query()
            ->select('daily_course_stats.course_id')
            ->selectRaw('SUM(daily_course_stats.enrollments) as total_enrollments')
            ->join('courses', 'daily_course_stats.course_id', '=', 'courses.id')
            ->where('courses.instructor_id', $teacherId)
            ->whereBetween('daily_course_stats.date', [$startDate, $endDate])
            ->groupBy('daily_course_stats.course_id')
            ->with('course:id,title,thumbnail')
            ->orderByDesc('total_enrollments')
            ->limit($limit)
            ->get();
    }

    public function getTopCoursesByRevenue(string|int $teacherId, string $startDate, string $endDate, int $limit = 5): Collection
    {
        return DailyCourseStats::query()
            ->select('daily_course_stats.course_id')
            ->selectRaw('SUM(daily_course_stats.revenue_cents) as total_revenue_cents')
            ->join('courses', 'daily_course_stats.course_id', '=', 'courses.id')
            ->where('courses.instructor_id', $teacherId)
            ->whereBetween('daily_course_stats.date', [$startDate, $endDate])
            ->groupBy('daily_course_stats.course_id')
            ->with('course:id,title,thumbnail')
            ->orderByDesc('total_revenue_cents')
            ->limit($limit)
            ->get();
    }
}
