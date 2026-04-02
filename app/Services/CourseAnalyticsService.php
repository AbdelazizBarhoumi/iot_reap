<?php

namespace App\Services;

use App\Models\Course;
use App\Models\User;
use App\Repositories\CourseStatsRepository;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class CourseAnalyticsService
{
    public function __construct(
        protected CourseStatsRepository $statsRepository
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
     * Get completion funnel for a course.
     */
    public function getCompletionFunnel(Course $course): array
    {
        $totalEnrolled = $course->students()->count();

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

        $totalLessons = $course->lessons()->count();

        if ($totalLessons === 0) {
            return [
                ['stage' => 'Enrolled', 'count' => $totalEnrolled, 'percentage' => 100],
                ['stage' => 'Started', 'count' => 0, 'percentage' => 0],
                ['stage' => 'Completed', 'count' => 0, 'percentage' => 0],
            ];
        }

        // Get completion count for each user
        $userCompletionCounts = DB::table('course_enrollments')
            ->select('course_enrollments.id', DB::raw('COALESCE(COUNT(DISTINCT lp.id), 0) as completion_count'))
            ->where('course_enrollments.course_id', $course->id)
            ->leftJoin('users', 'course_enrollments.user_id', '=', 'users.id')
            ->leftJoin('lesson_progress as lp', function ($j) use ($course) {
                $j->on('lp.user_id', '=', 'users.id')
                    ->join('lessons', 'lp.lesson_id', '=', 'lessons.id')
                    ->join('course_modules', 'lessons.module_id', '=', 'course_modules.id')
                    ->where('course_modules.course_id', $course->id)
                    ->where('lp.completed', 1);
            })
            ->groupBy('course_enrollments.id')
            ->get()
            ->pluck('completion_count')
            ->toArray();

        // Calculate progression stages
        $stages = [
            ['stage' => 'Enrolled', 'threshold' => 0],
            ['stage' => 'Started', 'threshold' => 1],
            ['stage' => '25% Complete', 'threshold' => ceil($totalLessons * 0.25)],
            ['stage' => '50% Complete', 'threshold' => ceil($totalLessons * 0.50)],
            ['stage' => '75% Complete', 'threshold' => ceil($totalLessons * 0.75)],
            ['stage' => 'Completed', 'threshold' => $totalLessons],
        ];

        $result = [];
        foreach ($stages as $stage) {
            if ($stage['threshold'] === 0) {
                $count = $totalEnrolled;
            } else {
                // Count how many users have >= threshold completed lessons
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
     * Get top performing courses.
     */
    public function getTopCourses(User $teacher, string $period = '30d', string $metric = 'enrollments'): array
    {
        [$startDate, $endDate] = $this->getPeriodDates($period);

        if ($metric === 'revenue') {
            $courses = $this->statsRepository->getTopCoursesByRevenue(
                $teacher->id,
                $startDate->toDateString(),
                $endDate->toDateString()
            );

            return $courses->map(fn ($stat) => [
                'id' => $stat->course_id,
                'title' => $stat->course->title,
                'thumbnail_url' => $stat->course->thumbnail_url,
                'value' => $stat->total_revenue_cents / 100,
                'formatted_value' => '$'.number_format($stat->total_revenue_cents / 100, 2),
            ])->toArray();
        }

        $courses = $this->statsRepository->getTopCoursesByEnrollments(
            $teacher->id,
            $startDate->toDateString(),
            $endDate->toDateString()
        );

        return $courses->map(fn ($stat) => [
            'id' => $stat->course_id,
            'title' => $stat->course->title,
            'thumbnail_url' => $stat->course->thumbnail_url,
            'value' => $stat->total_enrollments,
            'formatted_value' => number_format($stat->total_enrollments),
        ])->toArray();
    }

    /**
     * Get student roster for a course.
     */
    public function getStudentRoster(Course $course, int $page = 1, int $perPage = 20): array
    {
        $students = $course->students()
            ->withPivot(['enrolled_at'])
            ->orderBy('course_enrollments.enrolled_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        $totalLessons = $course->lessons()->count();
        $courseId = $course->id;

        return [
            'data' => $students->map(function ($student) use ($totalLessons, $courseId) {
                // Calculate lesson progress for student
                $completedLessons = DB::table('lesson_progress')
                    ->join('lessons', 'lesson_progress.lesson_id', '=', 'lessons.id')
                    ->join('course_modules', 'lessons.module_id', '=', 'course_modules.id')
                    ->where('course_modules.course_id', $courseId)
                    ->where('lesson_progress.user_id', $student->id)
                    ->where('lesson_progress.completed', true)
                    ->count();

                $progress = $totalLessons > 0
                    ? round(($completedLessons / $totalLessons) * 100, 1)
                    : 0;

                $isCompleted = $totalLessons > 0 && $completedLessons >= $totalLessons;

                // Get completion date (last lesson completed date if all done)
                $completedAt = null;
                if ($isCompleted) {
                    $completedAt = DB::table('lesson_progress')
                        ->join('lessons', 'lesson_progress.lesson_id', '=', 'lessons.id')
                        ->join('course_modules', 'lessons.module_id', '=', 'course_modules.id')
                        ->where('course_modules.course_id', $courseId)
                        ->where('lesson_progress.user_id', $student->id)
                        ->where('lesson_progress.completed', true)
                        ->max('lesson_progress.updated_at');
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
     * Get total unique students across all teacher's courses.
     */
    protected function getTotalStudents(User $teacher): int
    {
        return DB::table('course_enrollments')
            ->join('courses', 'course_enrollments.course_id', '=', 'courses.id')
            ->where('courses.instructor_id', $teacher->id)
            ->distinct('course_enrollments.user_id')
            ->count('course_enrollments.user_id');
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
