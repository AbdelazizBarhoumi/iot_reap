<?php

namespace App\Support;

use Illuminate\Support\Carbon;

/**
 * Helper class for analytics date range calculations.
 * Consolidates duplicate logic from AdminAnalyticsService and CourseAnalyticsService.
 */
final class DateRangeHelper
{
    /**
     * Get start and end dates for a period string.
     *
     * @param  string  $period  Period identifier: '7d', '30d', '90d', '12m'
     * @return array{0: Carbon, 1: Carbon} [startDate, endDate]
     */
    public static function getPeriodDates(string $period): array
    {
        $endDate = Carbon::today();

        $startDate = match ($period) {
            '7d' => Carbon::today()->subDays(6),
            '30d' => Carbon::today()->subDays(29),
            '90d' => Carbon::today()->subDays(89),
            '12m' => Carbon::today()->subYear()->addDay(),
            default => Carbon::today()->subDays(29),
        };

        return [$startDate, $endDate];
    }

    /**
     * Get previous period dates for comparison.
     *
     * @return array{0: Carbon, 1: Carbon} [prevStartDate, prevEndDate]
     */
    public static function getPreviousPeriodDates(Carbon $startDate, Carbon $endDate): array
    {
        $days = $startDate->diffInDays($endDate);
        $prevEnd = $startDate->copy()->subDay();
        $prevStart = $prevEnd->copy()->subDays($days);

        return [$prevStart, $prevEnd];
    }

    /**
     * Calculate percentage change between two values.
     */
    public static function calculatePercentageChange(int|float $current, int|float $previous): float
    {
        $current = (int) $current;
        $previous = (int) $previous;

        if ($previous === 0) {
            return $current > 0 ? 100.0 : 0.0;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }
}
