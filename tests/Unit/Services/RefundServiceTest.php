<?php

namespace Tests\Unit\Services;

use App\Enums\PaymentStatus;
use App\Enums\RefundStatus;
use App\Models\Payment;
use App\Models\RefundRequest;
use App\Models\TrainingPath;
use App\Models\User;
use App\Notifications\RefundApprovedNotification;
use App\Notifications\RefundRejectedNotification;
use App\Services\RefundService;
use DomainException;
use Illuminate\Support\Facades\Notification;
use Mockery;
use Stripe\Exception\ApiErrorException;
use Stripe\Refund as StripeRefund;
use Tests\TestCase;

class RefundServiceTest extends TestCase
{
    private RefundService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(RefundService::class);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // requestRefund() Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_creates_refund_request_successfully(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->create();
        $payment = Payment::factory()
            ->forUser($user)
            ->forTrainingPath($trainingPath)
            ->completed()
            ->create();

        $refund = $this->service->requestRefund($user, $payment, 'Not satisfied with the trainingPath');

        $this->assertInstanceOf(RefundRequest::class, $refund);
        $this->assertEquals($payment->id, $refund->payment_id);
        $this->assertEquals($user->id, $refund->user_id);
        $this->assertEquals('Not satisfied with the trainingPath', $refund->reason);
        $this->assertEquals(RefundStatus::PENDING, $refund->status);
        $this->assertDatabaseHas('refund_requests', [
            'payment_id' => $payment->id,
            'user_id' => $user->id,
            'reason' => 'Not satisfied with the trainingPath',
            'status' => RefundStatus::PENDING->value,
        ]);
    }

    public function test_validates_payment_belongs_to_user(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $payment = Payment::factory()
            ->forUser($otherUser)
            ->completed()
            ->create();

        $this->expectException(DomainException::class);
        $this->expectExceptionMessage('You cannot request a refund for this payment.');

        $this->service->requestRefund($user, $payment, 'Some reason');
    }

    public function test_rejects_refund_for_non_completed_payment(): void
    {
        $user = User::factory()->create();
        $payment = Payment::factory()
            ->forUser($user)
            ->create(['status' => PaymentStatus::PENDING]);

        $this->expectException(DomainException::class);
        $this->expectExceptionMessage('This payment is not eligible for a refund.');

        $this->service->requestRefund($user, $payment, 'Some reason');
    }

    public function test_rejects_refund_for_payment_older_than_30_days(): void
    {
        $user = User::factory()->create();
        $payment = Payment::factory()
            ->forUser($user)
            ->completedAt(now()->subDays(35))
            ->create();

        $this->expectException(DomainException::class);
        $this->expectExceptionMessage('This payment is not eligible for a refund.');

        $this->service->requestRefund($user, $payment, 'Some reason');
    }

    public function test_prevents_duplicate_refund_request(): void
    {
        $user = User::factory()->create();
        $payment = Payment::factory()
            ->forUser($user)
            ->completed()
            ->create();

        // Create first refund request
        $this->service->requestRefund($user, $payment, 'First request');

        $this->expectException(DomainException::class);
        $this->expectExceptionMessage('A refund request is already pending for this payment.');

        // Attempt duplicate
        $this->service->requestRefund($user, $payment, 'Second request');
    }

    public function test_allows_new_refund_after_previous_was_rejected(): void
    {
        $user = User::factory()->create();
        $payment = Payment::factory()
            ->forUser($user)
            ->completed()
            ->create();

        // Create and reject first refund
        RefundRequest::factory()
            ->forPayment($payment)
            ->rejected()
            ->create();

        // Should be able to create new request
        $refund = $this->service->requestRefund($user, $payment, 'New request');

        $this->assertInstanceOf(RefundRequest::class, $refund);
        $this->assertEquals(RefundStatus::PENDING, $refund->status);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // approveRefund() Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_approves_refund_and_processes_via_stripe(): void
    {
        Notification::fake();

        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->create();
        $payment = Payment::factory()
            ->forUser($user)
            ->forTrainingPath($trainingPath)
            ->completed()
            ->create(['amount_cents' => 4990]);

        $refundRequest = RefundRequest::factory()
            ->forPayment($payment)
            ->pending()
            ->create();

        // Attach user to trainingPath enrollment for detach testing
        $user->enrolledTrainingPaths()->attach($trainingPath->id);

        // Mock Stripe Refund::create
        $stripeRefundMock = Mockery::mock('alias:'.StripeRefund::class);
        $stripeRefundMock
            ->shouldReceive('create')
            ->once()
            ->with([
                'payment_intent' => $payment->stripe_payment_intent_id,
                'reason' => 'requested_by_customer',
            ])
            ->andReturn((object) [
                'id' => 're_test123',
                'amount' => 4990,
            ]);

        $result = $this->service->approveRefund($refundRequest, 'Approved per policy');

        $this->assertEquals(RefundStatus::COMPLETED, $result->status);
        $this->assertEquals('re_test123', $result->stripe_refund_id);
        $this->assertEquals(4990, $result->refund_amount_cents);
        $this->assertNotNull($result->processed_at);

        // Verify payment status updated
        $payment->refresh();
        $this->assertEquals(PaymentStatus::REFUNDED, $payment->status);

        // Verify user removed from trainingPath
        $this->assertFalse($user->enrolledTrainingPaths()->where('training_path_id', $trainingPath->id)->exists());

        // Verify notification sent
        Notification::assertSentTo($user, RefundApprovedNotification::class);
    }

    public function test_cannot_approve_non_pending_refund(): void
    {
        $refundRequest = RefundRequest::factory()->approved()->create();

        $this->expectException(DomainException::class);
        $this->expectExceptionMessage('This refund request is not pending.');

        $this->service->approveRefund($refundRequest);
    }

    public function test_cannot_approve_already_rejected_refund(): void
    {
        $refundRequest = RefundRequest::factory()->rejected()->create();

        $this->expectException(DomainException::class);
        $this->expectExceptionMessage('This refund request is not pending.');

        $this->service->approveRefund($refundRequest);
    }

    public function test_approve_fails_without_payment_intent(): void
    {
        $payment = Payment::factory()
            ->completed()
            ->create(['stripe_payment_intent_id' => null]);

        $refundRequest = RefundRequest::factory()
            ->forPayment($payment)
            ->pending()
            ->create();

        $this->expectException(DomainException::class);
        $this->expectExceptionMessage('Cannot process refund: no payment intent found.');

        $this->service->approveRefund($refundRequest);
    }

    public function test_handles_stripe_api_error_on_approve(): void
    {
        $payment = Payment::factory()->completed()->create();
        $refundRequest = RefundRequest::factory()
            ->forPayment($payment)
            ->pending()
            ->create();

        // Create an exception that extends ApiErrorException
        $exception = new class('Card declined') extends ApiErrorException {};

        $stripeRefundMock = Mockery::mock('alias:'.StripeRefund::class);
        $stripeRefundMock
            ->shouldReceive('create')
            ->once()
            ->andThrow($exception);

        $this->expectException(DomainException::class);
        $this->expectExceptionMessage('Failed to process refund: Card declined');

        $this->service->approveRefund($refundRequest);

        // Verify status changed to failed
        $refundRequest->refresh();
        $this->assertEquals(RefundStatus::FAILED, $refundRequest->status);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // rejectRefund() Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_rejects_refund_with_reason(): void
    {
        Notification::fake();

        $user = User::factory()->create();
        $refundRequest = RefundRequest::factory()
            ->forUser($user)
            ->pending()
            ->create();

        $result = $this->service->rejectRefund($refundRequest, 'Does not meet refund policy requirements');

        $this->assertEquals(RefundStatus::REJECTED, $result->status);
        $this->assertEquals('Does not meet refund policy requirements', $result->admin_notes);
        $this->assertNotNull($result->processed_at);

        Notification::assertSentTo($user, RefundRejectedNotification::class);
    }

    public function test_cannot_reject_non_pending_refund(): void
    {
        $refundRequest = RefundRequest::factory()->completed()->create();

        $this->expectException(DomainException::class);
        $this->expectExceptionMessage('This refund request is not pending.');

        $this->service->rejectRefund($refundRequest, 'Some reason');
    }

    public function test_cannot_reject_already_approved_refund(): void
    {
        $refundRequest = RefundRequest::factory()->approved()->create();

        $this->expectException(DomainException::class);
        $this->expectExceptionMessage('This refund request is not pending.');

        $this->service->rejectRefund($refundRequest, 'Some reason');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getPendingRefunds() Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_gets_pending_refunds_paginated(): void
    {
        // Create mixed status refunds
        RefundRequest::factory()->pending()->count(3)->create();
        RefundRequest::factory()->approved()->count(2)->create();
        RefundRequest::factory()->rejected()->create();
        RefundRequest::factory()->completed()->create();

        $pending = $this->service->getPendingRefunds(perPage: 10);

        $this->assertCount(3, $pending->items());
        $this->assertEquals(3, $pending->total());
        foreach ($pending as $refund) {
            $this->assertEquals(RefundStatus::PENDING, $refund->status);
        }
    }

    public function test_pending_refunds_ordered_by_oldest_first(): void
    {
        $oldest = RefundRequest::factory()
            ->pending()
            ->create(['created_at' => now()->subDays(5)]);
        $middle = RefundRequest::factory()
            ->pending()
            ->create(['created_at' => now()->subDays(2)]);
        $newest = RefundRequest::factory()
            ->pending()
            ->create(['created_at' => now()]);

        $pending = $this->service->getPendingRefunds();

        $this->assertEquals($oldest->id, $pending->items()[0]->id);
        $this->assertEquals($newest->id, $pending->items()[count($pending->items()) - 1]->id);
    }

    public function test_returns_empty_when_no_pending_refunds(): void
    {
        RefundRequest::factory()->completed()->count(3)->create();
        RefundRequest::factory()->rejected()->count(2)->create();

        $pending = $this->service->getPendingRefunds();

        $this->assertCount(0, $pending->items());
        $this->assertEquals(0, $pending->total());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getUserRefundRequests() Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_gets_user_refund_requests(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        RefundRequest::factory()->forUser($user)->count(3)->create();
        RefundRequest::factory()->forUser($otherUser)->count(2)->create();

        $requests = $this->service->getUserRefundRequests($user);

        $this->assertCount(3, $requests);
        $requests->each(fn ($r) => $this->assertEquals($user->id, $r->user_id));
    }

    public function test_user_refund_requests_ordered_by_newest_first(): void
    {
        $user = User::factory()->create();

        $oldest = RefundRequest::factory()
            ->forUser($user)
            ->create(['created_at' => now()->subDays(5)]);
        $newest = RefundRequest::factory()
            ->forUser($user)
            ->create(['created_at' => now()]);

        $requests = $this->service->getUserRefundRequests($user);

        $this->assertEquals($newest->id, $requests->first()->id);
        $this->assertEquals($oldest->id, $requests->last()->id);
    }

    public function test_returns_empty_collection_for_user_with_no_refunds(): void
    {
        $user = User::factory()->create();
        RefundRequest::factory()->count(3)->create(); // other users

        $requests = $this->service->getUserRefundRequests($user);

        $this->assertCount(0, $requests);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Edge Cases
    // ─────────────────────────────────────────────────────────────────────────

    public function test_refund_request_preserves_original_reason(): void
    {
        $user = User::factory()->create();
        $payment = Payment::factory()
            ->forUser($user)
            ->completed()
            ->create();

        $reason = "TrainingPath content didn't match description. Expected advanced topics.";
        $refund = $this->service->requestRefund($user, $payment, $reason);

        $this->assertEquals($reason, $refund->reason);

        // Fetch fresh from database
        $fromDb = RefundRequest::find($refund->id);
        $this->assertEquals($reason, $fromDb->reason);
    }

    public function test_allows_refund_at_exactly_30_days(): void
    {
        $user = User::factory()->create();
        $payment = Payment::factory()
            ->forUser($user)
            ->completedAt(now()->subDays(29))
            ->create();

        $refund = $this->service->requestRefund($user, $payment, 'At the deadline');

        $this->assertInstanceOf(RefundRequest::class, $refund);
        $this->assertEquals(RefundStatus::PENDING, $refund->status);
    }
}
