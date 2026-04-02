<?php

namespace App\Services;

use App\Enums\PaymentStatus;
use App\Models\User;
use App\Repositories\PaymentRepository;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class RevenueService
{
    public function __construct(
        protected PaymentRepository $paymentRepository
    ) {}

    /**
     * Get total lifetime revenue for a teacher.
     */
    public function getTotalRevenue(User $teacher): float
    {
        return $this->paymentRepository->getRevenueByTeacher($teacher->id) / 100;
    }

    /**
     * Get revenue by date range.
     */
    public function getRevenueByDateRange(User $teacher, string $startDate, string $endDate): array
    {
        $data = $this->paymentRepository->getRevenueByDateRange(
            $teacher->id,
            $startDate,
            $endDate
        );

        // Fill in missing dates
        $result = [];
        $current = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);
        $dataMap = $data->keyBy('date');

        while ($current <= $end) {
            $dateStr = $current->toDateString();
            $dayData = $dataMap->get($dateStr);

            $result[] = [
                'date' => $dateStr,
                'revenue' => $dayData ? $dayData->revenue_cents / 100 : 0,
                'sales_count' => $dayData ? $dayData->sales_count : 0,
            ];

            $current->addDay();
        }

        return $result;
    }

    /**
     * Get revenue breakdown by course.
     */
    public function getRevenueByCourse(User $teacher, ?string $startDate = null, ?string $endDate = null): array
    {
        $query = DB::table('payments')
            ->select('courses.id', 'courses.title', 'courses.thumbnail')
            ->selectRaw('SUM(payments.amount_cents) as total_revenue_cents')
            ->selectRaw('COUNT(*) as sales_count')
            ->join('courses', 'payments.course_id', '=', 'courses.id')
            ->where('courses.instructor_id', $teacher->id)
            ->where('payments.status', PaymentStatus::COMPLETED->value);

        if ($startDate && $endDate) {
            $query->whereBetween('payments.paid_at', [$startDate, $endDate]);
        }

        $courses = $query
            ->groupBy('courses.id', 'courses.title', 'courses.thumbnail')
            ->orderByDesc('total_revenue_cents')
            ->get();

        return $courses->map(fn ($course) => [
            'id' => $course->id,
            'title' => $course->title,
            'thumbnail_url' => $course->thumbnail,
            'revenue' => $course->total_revenue_cents / 100,
            'sales_count' => $course->sales_count,
        ])->toArray();
    }

    /**
     * Get earnings summary for teacher.
     */
    public function getEarningsSummary(User $teacher, string $period = '30d'): array
    {
        $endDate = Carbon::today();
        $startDate = match ($period) {
            '7d' => Carbon::today()->subDays(6),
            '30d' => Carbon::today()->subDays(29),
            '90d' => Carbon::today()->subDays(89),
            '12m' => Carbon::today()->subYear()->addDay(),
            default => Carbon::today()->subDays(29),
        };

        $currentRevenue = $this->getRevenueBetweenDates($teacher, $startDate, $endDate);

        // Previous period for comparison
        $periodDays = $startDate->diffInDays($endDate);
        $previousStart = $startDate->copy()->subDays($periodDays + 1);
        $previousEnd = $startDate->copy()->subDay();
        $previousRevenue = $this->getRevenueBetweenDates($teacher, $previousStart, $previousEnd);

        $change = $previousRevenue > 0
            ? round((($currentRevenue - $previousRevenue) / $previousRevenue) * 100, 1)
            : ($currentRevenue > 0 ? 100 : 0);

        return [
            'total_revenue' => $currentRevenue,
            'previous_revenue' => $previousRevenue,
            'change_percentage' => $change,
            'period' => $period,
            'start_date' => $startDate->toDateString(),
            'end_date' => $endDate->toDateString(),
        ];
    }

    /**
     * Generate CSV export of earnings.
     */
    public function generateEarningsCSV(User $teacher, string $startDate, string $endDate): string
    {
        $payments = DB::table('payments')
            ->select([
                'payments.id',
                'courses.title as course_title',
                'users.name as student_name',
                'users.email as student_email',
                'payments.amount_cents',
                'payments.currency',
                'payments.paid_at',
            ])
            ->join('courses', 'payments.course_id', '=', 'courses.id')
            ->join('users', 'payments.user_id', '=', 'users.id')
            ->where('courses.instructor_id', $teacher->id)
            ->where('payments.status', PaymentStatus::COMPLETED->value)
            ->whereBetween('payments.paid_at', [$startDate, $endDate])
            ->orderBy('payments.paid_at', 'desc')
            ->get();

        $csv = "Transaction ID,Course,Student Name,Student Email,Amount,Currency,Date\n";

        foreach ($payments as $payment) {
            $csv .= sprintf(
                "%d,\"%s\",\"%s\",%s,%.2f,%s,%s\n",
                $payment->id,
                str_replace('"', '""', $payment->course_title),
                str_replace('"', '""', $payment->student_name),
                $payment->student_email,
                $payment->amount_cents / 100,
                $payment->currency,
                Carbon::parse($payment->paid_at)->toDateTimeString()
            );
        }

        return $csv;
    }

    /**
     * Get revenue between two dates.
     */
    protected function getRevenueBetweenDates(User $teacher, Carbon $start, Carbon $end): float
    {
        $revenue = DB::table('payments')
            ->join('courses', 'payments.course_id', '=', 'courses.id')
            ->where('courses.instructor_id', $teacher->id)
            ->where('payments.status', PaymentStatus::COMPLETED->value)
            ->whereBetween('payments.paid_at', [$start->toDateString(), $end->toDateString()])
            ->sum('payments.amount_cents');

        return $revenue / 100;
    }
}
