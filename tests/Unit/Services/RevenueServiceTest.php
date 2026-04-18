<?php

namespace Tests\Unit\Services;

use App\Enums\PaymentStatus;
use App\Models\TrainingPath;
use App\Models\Payment;
use App\Models\User;
use App\Services\RevenueService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class RevenueServiceTest extends TestCase
{
    use RefreshDatabase;

    private RevenueService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(RevenueService::class);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getTotalRevenue Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_calculates_total_lifetime_revenue_for_teacher(): void
    {
        $teacher = User::factory()->teacher()->create();
        $trainingPath = TrainingPath::factory()->create([
            'instructor_id' => $teacher->id,
            'price_cents' => 9900,
        ]);

        Payment::factory()
            ->count(3)
            ->completed()
            ->amountCents(9900)
            ->forTrainingPath($trainingPath)
            ->create();

        $total = $this->service->getTotalRevenue($teacher);

        $this->assertEquals(297.00, $total);
    }

    public function test_returns_zero_when_teacher_has_no_payments(): void
    {
        $teacher = User::factory()->teacher()->create();
        TrainingPath::factory()->create(['instructor_id' => $teacher->id]);

        $total = $this->service->getTotalRevenue($teacher);

        $this->assertEquals(0, $total);
    }

    public function test_excludes_pending_payments_from_total_revenue(): void
    {
        $teacher = User::factory()->teacher()->create();
        $trainingPath = TrainingPath::factory()->create(['instructor_id' => $teacher->id]);

        Payment::factory()
            ->amountCents(5000)
            ->forTrainingPath($trainingPath)
            ->create(['status' => PaymentStatus::PENDING]);

        Payment::factory()
            ->completed()
            ->amountCents(5000)
            ->forTrainingPath($trainingPath)
            ->create();

        $total = $this->service->getTotalRevenue($teacher);

        $this->assertEquals(50.00, $total);
    }

    public function test_excludes_failed_payments_from_total_revenue(): void
    {
        $teacher = User::factory()->teacher()->create();
        $trainingPath = TrainingPath::factory()->create(['instructor_id' => $teacher->id]);

        Payment::factory()
            ->failed()
            ->amountCents(5000)
            ->forTrainingPath($trainingPath)
            ->create();

        Payment::factory()
            ->completed()
            ->amountCents(5000)
            ->forTrainingPath($trainingPath)
            ->create();

        $total = $this->service->getTotalRevenue($teacher);

        $this->assertEquals(50.00, $total);
    }

    public function test_excludes_refunded_payments_from_total_revenue(): void
    {
        $teacher = User::factory()->teacher()->create();
        $trainingPath = TrainingPath::factory()->create(['instructor_id' => $teacher->id]);

        Payment::factory()
            ->refunded()
            ->amountCents(5000)
            ->forTrainingPath($trainingPath)
            ->create();

        Payment::factory()
            ->completed()
            ->amountCents(5000)
            ->forTrainingPath($trainingPath)
            ->create();

        $total = $this->service->getTotalRevenue($teacher);

        $this->assertEquals(50.00, $total);
    }

    public function test_only_includes_revenue_from_teachers_own_trainingPaths(): void
    {
        $teacher = User::factory()->teacher()->create();
        $otherTeacher = User::factory()->teacher()->create();

        $ownTrainingPath = TrainingPath::factory()->create(['instructor_id' => $teacher->id]);
        $otherTrainingPath = TrainingPath::factory()->create(['instructor_id' => $otherTeacher->id]);

        Payment::factory()
            ->completed()
            ->amountCents(9900)
            ->forTrainingPath($ownTrainingPath)
            ->create();

        Payment::factory()
            ->completed()
            ->amountCents(4900)
            ->forTrainingPath($otherTrainingPath)
            ->create();

        $total = $this->service->getTotalRevenue($teacher);

        $this->assertEquals(99.00, $total);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getRevenueByDateRange Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_calculates_revenue_by_date_range(): void
    {
        $teacher = User::factory()->teacher()->create();
        $trainingPath = TrainingPath::factory()->create(['instructor_id' => $teacher->id]);

        Payment::factory()
            ->completedAt('2024-01-15')
            ->amountCents(9900)
            ->forTrainingPath($trainingPath)
            ->create();

        Payment::factory()
            ->completedAt('2024-01-15')
            ->amountCents(4900)
            ->forTrainingPath($trainingPath)
            ->create();

        Payment::factory()
            ->completedAt('2024-01-17')
            ->amountCents(2900)
            ->forTrainingPath($trainingPath)
            ->create();

        $result = $this->service->getRevenueByDateRange($teacher, '2024-01-15', '2024-01-17');

        $this->assertCount(3, $result);
        $this->assertEquals('2024-01-15', $result[0]['date']);
        $this->assertEquals(148.00, $result[0]['revenue']);
        $this->assertEquals(2, $result[0]['sales_count']);
        $this->assertEquals('2024-01-16', $result[1]['date']);
        $this->assertEquals(0, $result[1]['revenue']);
        $this->assertEquals(0, $result[1]['sales_count']);
        $this->assertEquals('2024-01-17', $result[2]['date']);
        $this->assertEquals(29.00, $result[2]['revenue']);
        $this->assertEquals(1, $result[2]['sales_count']);
    }

    public function test_fills_missing_dates_with_zero_revenue(): void
    {
        $teacher = User::factory()->teacher()->create();
        $trainingPath = TrainingPath::factory()->create(['instructor_id' => $teacher->id]);

        Payment::factory()
            ->completedAt('2024-01-01')
            ->amountCents(5000)
            ->forTrainingPath($trainingPath)
            ->create();

        $result = $this->service->getRevenueByDateRange($teacher, '2024-01-01', '2024-01-03');

        $this->assertCount(3, $result);
        $this->assertEquals(50.00, $result[0]['revenue']);
        $this->assertEquals(0, $result[1]['revenue']);
        $this->assertEquals(0, $result[2]['revenue']);
    }

    public function test_returns_all_zeros_for_empty_date_range(): void
    {
        $teacher = User::factory()->teacher()->create();
        TrainingPath::factory()->create(['instructor_id' => $teacher->id]);

        $result = $this->service->getRevenueByDateRange($teacher, '2024-01-01', '2024-01-03');

        $this->assertCount(3, $result);
        foreach ($result as $day) {
            $this->assertEquals(0, $day['revenue']);
            $this->assertEquals(0, $day['sales_count']);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getRevenueByTrainingPath Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_calculates_revenue_breakdown_by_trainingPath(): void
    {
        $teacher = User::factory()->teacher()->create();

        $trainingPath1 = TrainingPath::factory()->create([
            'instructor_id' => $teacher->id,
            'title' => 'Laravel Basics',
            'price_cents' => 9900,
        ]);

        $trainingPath2 = TrainingPath::factory()->create([
            'instructor_id' => $teacher->id,
            'title' => 'Advanced Laravel',
            'price_cents' => 19900,
        ]);

        Payment::factory()
            ->count(2)
            ->completed()
            ->amountCents(9900)
            ->forTrainingPath($trainingPath1)
            ->create();

        Payment::factory()
            ->completed()
            ->amountCents(19900)
            ->forTrainingPath($trainingPath2)
            ->create();

        $result = $this->service->getRevenueByTrainingPath($teacher);

        $this->assertCount(2, $result);
        // Ordered by revenue descending
        $this->assertEquals($trainingPath2->id, $result[0]['id']);
        $this->assertEquals('Advanced Laravel', $result[0]['title']);
        $this->assertEquals(199.00, $result[0]['revenue']);
        $this->assertEquals(1, $result[0]['sales_count']);

        $this->assertEquals($trainingPath1->id, $result[1]['id']);
        $this->assertEquals('Laravel Basics', $result[1]['title']);
        $this->assertEquals(198.00, $result[1]['revenue']);
        $this->assertEquals(2, $result[1]['sales_count']);
    }

    public function test_filters_revenue_by_training_path_with_date_range(): void
    {
        $teacher = User::factory()->teacher()->create();
        $trainingPath = TrainingPath::factory()->create(['instructor_id' => $teacher->id]);

        Payment::factory()
            ->completedAt('2024-01-10')
            ->amountCents(5000)
            ->forTrainingPath($trainingPath)
            ->create();

        Payment::factory()
            ->completedAt('2024-01-20')
            ->amountCents(5000)
            ->forTrainingPath($trainingPath)
            ->create();

        $result = $this->service->getRevenueByTrainingPath($teacher, '2024-01-15', '2024-01-25');

        $this->assertCount(1, $result);
        $this->assertEquals(50.00, $result[0]['revenue']);
        $this->assertEquals(1, $result[0]['sales_count']);
    }

    public function test_excludes_non_completed_payments_from_training_path_revenue(): void
    {
        $teacher = User::factory()->teacher()->create();
        $trainingPath = TrainingPath::factory()->create(['instructor_id' => $teacher->id]);

        Payment::factory()
            ->completed()
            ->amountCents(5000)
            ->forTrainingPath($trainingPath)
            ->create();

        Payment::factory()
            ->failed()
            ->amountCents(5000)
            ->forTrainingPath($trainingPath)
            ->create();

        Payment::factory()
            ->amountCents(5000)
            ->forTrainingPath($trainingPath)
            ->create(['status' => PaymentStatus::PENDING]);

        $result = $this->service->getRevenueByTrainingPath($teacher);

        $this->assertCount(1, $result);
        $this->assertEquals(50.00, $result[0]['revenue']);
        $this->assertEquals(1, $result[0]['sales_count']);
    }

    public function test_returns_empty_array_when_no_training_path_sales(): void
    {
        $teacher = User::factory()->teacher()->create();
        TrainingPath::factory()->create(['instructor_id' => $teacher->id]);

        $result = $this->service->getRevenueByTrainingPath($teacher);

        $this->assertIsArray($result);
        $this->assertEmpty($result);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getEarningsSummary Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_calculates_earnings_summary_for_30_days(): void
    {
        Carbon::setTestNow('2024-02-15');

        $teacher = User::factory()->teacher()->create();
        $trainingPath = TrainingPath::factory()->create(['instructor_id' => $teacher->id]);

        // Current period: 2024-01-17 to 2024-02-15 (30 days)
        Payment::factory()
            ->completedAt('2024-02-10')
            ->amountCents(10000)
            ->forTrainingPath($trainingPath)
            ->create();

        // Previous period: 2024-12-18 to 2024-01-16
        Payment::factory()
            ->completedAt('2024-01-05')
            ->amountCents(5000)
            ->forTrainingPath($trainingPath)
            ->create();

        $result = $this->service->getEarningsSummary($teacher, '30d');

        $this->assertEquals(100.00, $result['total_revenue']);
        $this->assertEquals(50.00, $result['previous_revenue']);
        $this->assertEquals(100.0, $result['change_percentage']);
        $this->assertEquals('30d', $result['period']);

        Carbon::setTestNow();
    }

    public function test_calculates_earnings_summary_for_7_days(): void
    {
        Carbon::setTestNow('2024-02-15');

        $teacher = User::factory()->teacher()->create();
        $trainingPath = TrainingPath::factory()->create(['instructor_id' => $teacher->id]);

        Payment::factory()
            ->completedAt('2024-02-14')
            ->amountCents(7500)
            ->forTrainingPath($trainingPath)
            ->create();

        $result = $this->service->getEarningsSummary($teacher, '7d');

        $this->assertEquals(75.00, $result['total_revenue']);
        $this->assertEquals('7d', $result['period']);
        $this->assertEquals('2024-02-09', $result['start_date']);
        $this->assertEquals('2024-02-15', $result['end_date']);

        Carbon::setTestNow();
    }

    public function test_calculates_positive_change_percentage(): void
    {
        Carbon::setTestNow('2024-02-15');

        $teacher = User::factory()->teacher()->create();
        $trainingPath = TrainingPath::factory()->create(['instructor_id' => $teacher->id]);

        // Current period
        Payment::factory()
            ->completedAt('2024-02-10')
            ->amountCents(15000)
            ->forTrainingPath($trainingPath)
            ->create();

        // Previous period
        Payment::factory()
            ->completedAt('2024-01-05')
            ->amountCents(10000)
            ->forTrainingPath($trainingPath)
            ->create();

        $result = $this->service->getEarningsSummary($teacher, '30d');

        $this->assertEquals(50.0, $result['change_percentage']);

        Carbon::setTestNow();
    }

    public function test_calculates_negative_change_percentage(): void
    {
        Carbon::setTestNow('2024-02-15');

        $teacher = User::factory()->teacher()->create();
        $trainingPath = TrainingPath::factory()->create(['instructor_id' => $teacher->id]);

        // Current period: less revenue
        Payment::factory()
            ->completedAt('2024-02-10')
            ->amountCents(5000)
            ->forTrainingPath($trainingPath)
            ->create();

        // Previous period: more revenue
        Payment::factory()
            ->completedAt('2024-01-05')
            ->amountCents(10000)
            ->forTrainingPath($trainingPath)
            ->create();

        $result = $this->service->getEarningsSummary($teacher, '30d');

        $this->assertEquals(-50.0, $result['change_percentage']);

        Carbon::setTestNow();
    }

    public function test_returns_100_percent_change_when_previous_period_is_zero(): void
    {
        Carbon::setTestNow('2024-02-15');

        $teacher = User::factory()->teacher()->create();
        $trainingPath = TrainingPath::factory()->create(['instructor_id' => $teacher->id]);

        Payment::factory()
            ->completedAt('2024-02-10')
            ->amountCents(10000)
            ->forTrainingPath($trainingPath)
            ->create();

        $result = $this->service->getEarningsSummary($teacher, '30d');

        $this->assertEquals(100, $result['change_percentage']);

        Carbon::setTestNow();
    }

    public function test_returns_zero_change_when_both_periods_are_zero(): void
    {
        Carbon::setTestNow('2024-02-15');

        $teacher = User::factory()->teacher()->create();
        TrainingPath::factory()->create(['instructor_id' => $teacher->id]);

        $result = $this->service->getEarningsSummary($teacher, '30d');

        $this->assertEquals(0, $result['total_revenue']);
        $this->assertEquals(0, $result['previous_revenue']);
        $this->assertEquals(0, $result['change_percentage']);

        Carbon::setTestNow();
    }

    public function test_earnings_summary_supports_12_month_period(): void
    {
        Carbon::setTestNow('2024-12-15');

        $teacher = User::factory()->teacher()->create();
        $trainingPath = TrainingPath::factory()->create(['instructor_id' => $teacher->id]);

        Payment::factory()
            ->completedAt('2024-06-15')
            ->amountCents(50000)
            ->forTrainingPath($trainingPath)
            ->create();

        $result = $this->service->getEarningsSummary($teacher, '12m');

        $this->assertEquals(500.00, $result['total_revenue']);
        $this->assertEquals('12m', $result['period']);

        Carbon::setTestNow();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // generateEarningsCSV Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_generates_csv_export_with_correct_headers(): void
    {
        $teacher = User::factory()->teacher()->create();
        $trainingPath = TrainingPath::factory()->create(['instructor_id' => $teacher->id]);

        $csv = $this->service->generateEarningsCSV($teacher, '2024-01-01', '2024-01-31');

        $this->assertStringContainsString(
            'Transaction ID,TrainingPath,Student Name,Student Email,Amount,Currency,Date',
            $csv
        );
    }

    public function test_generates_csv_with_payment_data(): void
    {
        $teacher = User::factory()->teacher()->create();
        $student = User::factory()->create(['name' => 'John Doe', 'email' => 'john@example.com']);
        $trainingPath = TrainingPath::factory()->create([
            'instructor_id' => $teacher->id,
            'title' => 'Test TrainingPath',
        ]);

        $payment = Payment::factory()
            ->completedAt('2024-01-15 10:30:00')
            ->amountCents(9900)
            ->forTrainingPath($trainingPath)
            ->forUser($student)
            ->create();

        $csv = $this->service->generateEarningsCSV($teacher, '2024-01-01', '2024-01-31');

        $this->assertStringContainsString($payment->id.',', $csv);
        $this->assertStringContainsString('"Test TrainingPath"', $csv);
        $this->assertStringContainsString('"John Doe"', $csv);
        $this->assertStringContainsString('john@example.com', $csv);
        $this->assertStringContainsString('99.00', $csv);
        $this->assertStringContainsString('USD', $csv);
    }

    public function test_csv_escapes_quotes_in_training_path_title(): void
    {
        $teacher = User::factory()->teacher()->create();
        $trainingPath = TrainingPath::factory()->create([
            'instructor_id' => $teacher->id,
            'title' => 'Learn "Advanced" Techniques',
        ]);

        Payment::factory()
            ->completedAt('2024-01-15')
            ->forTrainingPath($trainingPath)
            ->create();

        $csv = $this->service->generateEarningsCSV($teacher, '2024-01-01', '2024-01-31');

        $this->assertStringContainsString('"Learn ""Advanced"" Techniques"', $csv);
    }

    public function test_csv_only_includes_payments_in_date_range(): void
    {
        $teacher = User::factory()->teacher()->create();
        $trainingPath = TrainingPath::factory()->create(['instructor_id' => $teacher->id]);

        Payment::factory()
            ->completedAt('2024-01-10')
            ->amountCents(5000)
            ->forTrainingPath($trainingPath)
            ->create();

        Payment::factory()
            ->completedAt('2024-02-10')
            ->amountCents(7500)
            ->forTrainingPath($trainingPath)
            ->create();

        $csv = $this->service->generateEarningsCSV($teacher, '2024-01-01', '2024-01-31');

        $this->assertStringContainsString('50.00', $csv);
        $this->assertStringNotContainsString('75.00', $csv);
    }

    public function test_csv_excludes_non_completed_payments(): void
    {
        $teacher = User::factory()->teacher()->create();
        $trainingPath = TrainingPath::factory()->create(['instructor_id' => $teacher->id]);

        Payment::factory()
            ->completed()
            ->amountCents(5000)
            ->forTrainingPath($trainingPath)
            ->create(['paid_at' => '2024-01-15']);

        Payment::factory()
            ->failed()
            ->amountCents(7500)
            ->forTrainingPath($trainingPath)
            ->create();

        $csv = $this->service->generateEarningsCSV($teacher, '2024-01-01', '2024-01-31');

        $lines = explode("\n", trim($csv));
        $this->assertCount(2, $lines); // Header + 1 payment
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Edge Cases
    // ─────────────────────────────────────────────────────────────────────────

    public function test_handles_multiple_training_paths_with_varying_prices(): void
    {
        $teacher = User::factory()->teacher()->create();

        $trainingPaths = collect([
            TrainingPath::factory()->create(['instructor_id' => $teacher->id, 'price_cents' => 1990]),
            TrainingPath::factory()->create(['instructor_id' => $teacher->id, 'price_cents' => 4990]),
            TrainingPath::factory()->create(['instructor_id' => $teacher->id, 'price_cents' => 9990]),
        ]);

        foreach ($trainingPaths as $trainingPath) {
            Payment::factory()
                ->completed()
                ->amountCents($trainingPath->price_cents)
                ->forTrainingPath($trainingPath)
                ->create();
        }

        $total = $this->service->getTotalRevenue($teacher);

        $this->assertEquals(169.70, $total);
    }

    public function test_handles_large_number_of_payments(): void
    {
        $teacher = User::factory()->teacher()->create();
        $trainingPath = TrainingPath::factory()->create(['instructor_id' => $teacher->id]);

        Payment::factory()
            ->count(100)
            ->completed()
            ->amountCents(1000)
            ->forTrainingPath($trainingPath)
            ->create();

        $total = $this->service->getTotalRevenue($teacher);

        $this->assertEquals(1000.00, $total);
    }

    public function test_handles_fractional_cents_correctly(): void
    {
        $teacher = User::factory()->teacher()->create();
        $trainingPath = TrainingPath::factory()->create(['instructor_id' => $teacher->id]);

        Payment::factory()
            ->completed()
            ->amountCents(1)
            ->forTrainingPath($trainingPath)
            ->create();

        $total = $this->service->getTotalRevenue($teacher);

        $this->assertEquals(0.01, $total);
    }

    public function test_teacher_with_no_training_paths_has_zero_revenue(): void
    {
        $teacher = User::factory()->teacher()->create();

        $total = $this->service->getTotalRevenue($teacher);

        $this->assertEquals(0, $total);
    }
}
