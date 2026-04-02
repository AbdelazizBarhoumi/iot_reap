<?php

namespace Tests\Unit\Services;

use App\Enums\PayoutStatus;
use App\Models\PayoutRequest;
use App\Models\User;
use App\Notifications\PayoutApprovedNotification;
use App\Notifications\PayoutRejectedNotification;
use App\Services\PayoutService;
use App\Services\RevenueService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Mockery;
use Mockery\MockInterface;
use Stripe\Transfer;
use Tests\TestCase;

class PayoutServiceTest extends TestCase
{
    use RefreshDatabase;

    private PayoutService $service;

    private MockInterface $revenueServiceMock;

    protected function setUp(): void
    {
        parent::setUp();

        $this->revenueServiceMock = Mockery::mock(RevenueService::class);
        $this->app->instance(RevenueService::class, $this->revenueServiceMock);

        $this->service = app(PayoutService::class);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getPendingPayouts Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_gets_pending_payouts(): void
    {
        PayoutRequest::factory()->count(2)->pending()->create();
        PayoutRequest::factory()->completed()->create();
        PayoutRequest::factory()->rejected()->create();

        $pending = $this->service->getPendingPayouts();

        $this->assertCount(2, $pending);
        $pending->each(fn ($request) => $this->assertEquals(PayoutStatus::PENDING, $request->status));
    }

    public function test_pending_payouts_ordered_by_oldest_first(): void
    {
        $oldRequest = PayoutRequest::factory()->pending()->create([
            'created_at' => now()->subDays(5),
        ]);
        $newRequest = PayoutRequest::factory()->pending()->create([
            'created_at' => now(),
        ]);

        $pending = $this->service->getPendingPayouts();

        $this->assertEquals($oldRequest->id, $pending->first()->id);
        $this->assertEquals($newRequest->id, $pending->last()->id);
    }

    public function test_pending_payouts_includes_user_relation(): void
    {
        PayoutRequest::factory()->pending()->create();

        $pending = $this->service->getPendingPayouts();

        $this->assertTrue($pending->first()->relationLoaded('user'));
    }

    public function test_pending_payouts_returns_paginated_result(): void
    {
        PayoutRequest::factory()->count(25)->pending()->create();

        $pending = $this->service->getPendingPayouts(perPage: 10);

        $this->assertCount(10, $pending);
        $this->assertEquals(25, $pending->total());
        $this->assertEquals(3, $pending->lastPage());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // approvePayout Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_approves_pending_payout_request(): void
    {
        Notification::fake();

        $admin = User::factory()->admin()->create();
        $request = PayoutRequest::factory()->pending()->create();

        $approved = $this->service->approvePayout($request, $admin);

        $this->assertEquals(PayoutStatus::APPROVED, $approved->status);
    }

    public function test_records_admin_who_approved(): void
    {
        Notification::fake();

        $admin = User::factory()->admin()->create();
        $request = PayoutRequest::factory()->pending()->create();

        $approved = $this->service->approvePayout($request, $admin);

        $this->assertEquals($admin->id, $approved->approved_by);
    }

    public function test_sets_approved_at_timestamp(): void
    {
        Notification::fake();

        $admin = User::factory()->admin()->create();
        $request = PayoutRequest::factory()->pending()->create();

        $this->travel(5)->minutes();
        $approved = $this->service->approvePayout($request, $admin);

        $this->assertNotNull($approved->approved_at);
        $this->assertTrue($approved->approved_at->isToday());
    }

    public function test_stores_admin_notes_on_approval(): void
    {
        Notification::fake();

        $admin = User::factory()->admin()->create();
        $request = PayoutRequest::factory()->pending()->create();
        $notes = 'Verified teacher identity and earnings.';

        $approved = $this->service->approvePayout($request, $admin, $notes);

        $this->assertEquals($notes, $approved->admin_notes);
    }

    public function test_sends_notification_on_approval(): void
    {
        Notification::fake();

        $teacher = User::factory()->teacher()->create();
        $admin = User::factory()->admin()->create();
        $request = PayoutRequest::factory()->forTeacher($teacher)->pending()->create();

        $this->service->approvePayout($request, $admin);

        Notification::assertSentTo($teacher, PayoutApprovedNotification::class);
    }

    public function test_throws_exception_when_approving_non_pending_request(): void
    {
        $admin = User::factory()->admin()->create();
        $request = PayoutRequest::factory()->completed()->create();

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessage('Only pending requests can be approved.');

        $this->service->approvePayout($request, $admin);
    }

    public function test_cannot_approve_already_rejected_request(): void
    {
        $admin = User::factory()->admin()->create();
        $request = PayoutRequest::factory()->rejected()->create();

        $this->expectException(\DomainException::class);

        $this->service->approvePayout($request, $admin);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // rejectPayout Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_rejects_pending_payout_request(): void
    {
        Notification::fake();

        $admin = User::factory()->admin()->create();
        $request = PayoutRequest::factory()->pending()->create();
        $reason = 'Insufficient earnings verification.';

        $rejected = $this->service->rejectPayout($request, $admin, $reason);

        $this->assertEquals(PayoutStatus::REJECTED, $rejected->status);
        $this->assertEquals($reason, $rejected->rejection_reason);
    }

    public function test_rejection_records_admin_and_timestamp(): void
    {
        Notification::fake();

        $admin = User::factory()->admin()->create();
        $request = PayoutRequest::factory()->pending()->create();

        $rejected = $this->service->rejectPayout($request, $admin, 'Invalid bank details');

        $this->assertEquals($admin->id, $rejected->approved_by);
        $this->assertNotNull($rejected->approved_at);
    }

    public function test_sends_rejection_notification(): void
    {
        Notification::fake();

        $teacher = User::factory()->teacher()->create();
        $admin = User::factory()->admin()->create();
        $request = PayoutRequest::factory()->forTeacher($teacher)->pending()->create();

        $this->service->rejectPayout($request, $admin, 'Reason for rejection');

        Notification::assertSentTo($teacher, PayoutRejectedNotification::class);
    }

    public function test_throws_exception_when_rejecting_non_pending_request(): void
    {
        $admin = User::factory()->admin()->create();
        $request = PayoutRequest::factory()->approved()->create();

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessage('Only pending requests can be rejected.');

        $this->service->rejectPayout($request, $admin, 'Too late');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // processPayout Tests (Stripe Transfer)
    // ─────────────────────────────────────────────────────────────────────────

    public function test_processes_approved_payout_via_stripe(): void
    {
        $teacher = User::factory()->teacher()->create([
            'stripe_connect_account_id' => 'acct_test_teacher_123',
        ]);
        $request = PayoutRequest::factory()
            ->forTeacher($teacher)
            ->approved()
            ->withAmount(10000)
            ->create();

        // Mock Stripe Transfer
        $transferMock = Mockery::mock('alias:'.Transfer::class);
        $transferMock->shouldReceive('create')
            ->once()
            ->with(Mockery::on(function ($args) use ($request, $teacher) {
                return $args['amount'] === 10000
                    && $args['currency'] === 'usd'
                    && $args['destination'] === 'acct_test_teacher_123'
                    && $args['metadata']['payout_request_id'] === $request->id
                    && $args['metadata']['teacher_id'] === $teacher->id;
            }))
            ->andReturn((object) ['id' => 'tr_test_transfer_123']);

        $processed = $this->service->processPayout($request);

        $this->assertEquals(PayoutStatus::COMPLETED, $processed->status);
        $this->assertEquals('tr_test_transfer_123', $processed->stripe_transfer_id);
        $this->assertNotNull($processed->completed_at);
    }

    public function test_throws_when_processing_non_approved_payout(): void
    {
        $request = PayoutRequest::factory()->pending()->create();

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessage('Only approved payouts can be processed.');

        $this->service->processPayout($request);
    }

    public function test_throws_when_teacher_has_no_stripe_account(): void
    {
        $teacher = User::factory()->teacher()->create([
            'stripe_connect_account_id' => null,
        ]);
        $request = PayoutRequest::factory()
            ->forTeacher($teacher)
            ->approved()
            ->create();

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessage('Teacher has not connected their Stripe account.');

        $this->service->processPayout($request);
    }

    public function test_marks_payout_as_failed_on_stripe_error(): void
    {
        $teacher = User::factory()->teacher()->create([
            'stripe_connect_account_id' => 'acct_test_teacher_456',
        ]);
        $request = PayoutRequest::factory()
            ->forTeacher($teacher)
            ->approved()
            ->create();

        // Mock Stripe Transfer to throw error
        $transferMock = Mockery::mock('alias:'.Transfer::class);
        $transferMock->shouldReceive('create')
            ->once()
            ->andThrow(new \Stripe\Exception\InvalidRequestException('Insufficient funds'));

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessage('Payout failed: Insufficient funds');

        try {
            $this->service->processPayout($request);
        } finally {
            $request->refresh();
            $this->assertEquals(PayoutStatus::FAILED, $request->status);
            $this->assertStringContainsString('Stripe error:', $request->admin_notes);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // requestPayout Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_creates_payout_request(): void
    {
        $teacher = User::factory()->teacher()->create();

        $this->revenueServiceMock
            ->shouldReceive('getTotalRevenue')
            ->with($teacher)
            ->andReturn(500.00); // $500 total earnings

        $request = $this->service->requestPayout($teacher, 10000); // $100

        $this->assertInstanceOf(PayoutRequest::class, $request);
        $this->assertEquals($teacher->id, $request->user_id);
        $this->assertEquals(10000, $request->amount_cents);
        $this->assertEquals(PayoutStatus::PENDING, $request->status);
    }

    public function test_throws_when_amount_below_minimum(): void
    {
        $teacher = User::factory()->teacher()->create();

        $this->revenueServiceMock
            ->shouldReceive('getTotalRevenue')
            ->andReturn(1000.00);

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessage('Minimum payout amount is $50');

        $this->service->requestPayout($teacher, 4999); // $49.99
    }

    public function test_throws_when_amount_exceeds_available_balance(): void
    {
        $teacher = User::factory()->teacher()->create();

        $this->revenueServiceMock
            ->shouldReceive('getTotalRevenue')
            ->with($teacher)
            ->andReturn(100.00); // $100 total

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessage('Requested amount exceeds available balance.');

        $this->service->requestPayout($teacher, 15000); // $150 requested
    }

    public function test_throws_when_teacher_has_pending_request(): void
    {
        $teacher = User::factory()->teacher()->create();
        PayoutRequest::factory()->forTeacher($teacher)->pending()->create([
            'amount_cents' => 5000,
        ]);

        $this->revenueServiceMock
            ->shouldReceive('getTotalRevenue')
            ->andReturn(500.00);

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessage('You already have a pending payout request.');

        $this->service->requestPayout($teacher, 10000);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getAvailableBalance Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_calculates_available_balance_correctly(): void
    {
        $teacher = User::factory()->teacher()->create();

        // Teacher has $500 total revenue
        $this->revenueServiceMock
            ->shouldReceive('getTotalRevenue')
            ->with($teacher)
            ->andReturn(500.00);

        // $100 already paid out
        PayoutRequest::factory()
            ->forTeacher($teacher)
            ->completed()
            ->withAmount(10000)
            ->create();

        // $50 pending
        PayoutRequest::factory()
            ->forTeacher($teacher)
            ->pending()
            ->withAmount(5000)
            ->create();

        $balance = $this->service->getAvailableBalance($teacher);

        // $500 - $100 - $50 = $350 = 35000 cents
        $this->assertEquals(35000, $balance);
    }

    public function test_available_balance_never_negative(): void
    {
        $teacher = User::factory()->teacher()->create();

        $this->revenueServiceMock
            ->shouldReceive('getTotalRevenue')
            ->with($teacher)
            ->andReturn(50.00); // $50 total

        // Already paid out more (edge case from historical data)
        PayoutRequest::factory()
            ->forTeacher($teacher)
            ->completed()
            ->withAmount(10000)
            ->create();

        $balance = $this->service->getAvailableBalance($teacher);

        $this->assertEquals(0, $balance);
    }

    public function test_available_balance_excludes_failed_payouts(): void
    {
        $teacher = User::factory()->teacher()->create();

        $this->revenueServiceMock
            ->shouldReceive('getTotalRevenue')
            ->with($teacher)
            ->andReturn(200.00);

        // Failed payout should NOT be deducted
        PayoutRequest::factory()
            ->forTeacher($teacher)
            ->failed()
            ->withAmount(10000)
            ->create();

        $balance = $this->service->getAvailableBalance($teacher);

        // Full $200 available since failed payouts don't count
        $this->assertEquals(20000, $balance);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getTeacherPayouts Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_gets_all_payouts_for_teacher(): void
    {
        $teacher = User::factory()->teacher()->create();
        $otherTeacher = User::factory()->teacher()->create();

        PayoutRequest::factory()->forTeacher($teacher)->count(3)->create();
        PayoutRequest::factory()->forTeacher($otherTeacher)->count(2)->create();

        $payouts = $this->service->getTeacherPayouts($teacher);

        $this->assertCount(3, $payouts);
        $payouts->each(fn ($p) => $this->assertEquals($teacher->id, $p->user_id));
    }

    public function test_teacher_payouts_ordered_by_newest_first(): void
    {
        $teacher = User::factory()->teacher()->create();

        $old = PayoutRequest::factory()
            ->forTeacher($teacher)
            ->create(['created_at' => now()->subWeek()]);
        $new = PayoutRequest::factory()
            ->forTeacher($teacher)
            ->create(['created_at' => now()]);

        $payouts = $this->service->getTeacherPayouts($teacher);

        $this->assertEquals($new->id, $payouts->first()->id);
        $this->assertEquals($old->id, $payouts->last()->id);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
