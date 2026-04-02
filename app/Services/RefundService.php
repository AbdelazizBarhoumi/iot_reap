<?php

namespace App\Services;

use App\Enums\PaymentStatus;
use App\Enums\RefundStatus;
use App\Models\Payment;
use App\Models\RefundRequest;
use App\Models\User;
use App\Repositories\PaymentRepository;
use App\Repositories\RefundRepository;
use Illuminate\Support\Facades\Log;
use Stripe\Refund;
use Stripe\Stripe;

class RefundService
{
    public function __construct(
        protected PaymentRepository $paymentRepository,
        protected RefundRepository $refundRepository
    ) {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Request a refund for a payment.
     */
    public function requestRefund(User $user, Payment $payment, string $reason): RefundRequest
    {
        // Validate the payment belongs to the user
        if ($payment->user_id !== $user->id) {
            throw new \DomainException('You cannot request a refund for this payment.');
        }

        // Check for existing pending refund first (before general isRefundable check)
        if ($this->refundRepository->hasPendingForPayment($payment->id)) {
            throw new \DomainException('A refund request is already pending for this payment.');
        }

        // Validate payment is refundable
        if (! $payment->isRefundable()) {
            throw new \DomainException('This payment is not eligible for a refund.');
        }

        $refundRequest = $this->refundRepository->create([
            'payment_id' => $payment->id,
            'user_id' => $user->id,
            'status' => RefundStatus::PENDING,
            'reason' => $reason,
        ]);

        Log::info('Refund requested', [
            'refund_request_id' => $refundRequest->id,
            'payment_id' => $payment->id,
            'user_id' => $user->id,
        ]);

        return $refundRequest;
    }

    /**
     * Approve a refund request (admin action).
     */
    public function approveRefund(RefundRequest $refundRequest, ?string $adminNotes = null): RefundRequest
    {
        if (! $refundRequest->isPending()) {
            throw new \DomainException('This refund request is not pending.');
        }

        $refundRequest->approve($adminNotes);

        // Process the refund with Stripe
        return $this->processRefund($refundRequest);
    }

    /**
     * Reject a refund request (admin action).
     */
    public function rejectRefund(RefundRequest $refundRequest, string $reason): RefundRequest
    {
        if (! $refundRequest->isPending()) {
            throw new \DomainException('This refund request is not pending.');
        }

        $refundRequest->reject($reason);

        Log::info('Refund rejected', [
            'refund_request_id' => $refundRequest->id,
            'reason' => $reason,
        ]);

        // Notify the user
        $refundRequest->user->notify(new \App\Notifications\RefundRejectedNotification($refundRequest, $reason));

        return $refundRequest;
    }

    /**
     * Process approved refund via Stripe.
     */
    protected function processRefund(RefundRequest $refundRequest): RefundRequest
    {
        $payment = $refundRequest->payment;

        if (! $payment->stripe_payment_intent_id) {
            throw new \DomainException('Cannot process refund: no payment intent found.');
        }

        $refundRequest->markAsProcessing();

        try {
            $stripeRefund = Refund::create([
                'payment_intent' => $payment->stripe_payment_intent_id,
                'reason' => 'requested_by_customer',
            ]);

            $refundRequest->markAsCompleted(
                $stripeRefund->id,
                $stripeRefund->amount
            );

            // Update payment status
            $payment->update(['status' => PaymentStatus::REFUNDED]);

            // Remove enrollment
            $payment->user->enrolledCourses()->detach($payment->course_id);

            Log::info('Refund processed successfully', [
                'refund_request_id' => $refundRequest->id,
                'stripe_refund_id' => $stripeRefund->id,
                'amount' => $stripeRefund->amount,
            ]);

            // Notify the user that refund was processed
            $refundRequest->user->notify(new \App\Notifications\RefundApprovedNotification($refundRequest));
        } catch (\Stripe\Exception\ApiErrorException $e) {
            $refundRequest->markAsFailed($e->getMessage());

            Log::error('Stripe refund failed', [
                'refund_request_id' => $refundRequest->id,
                'error' => $e->getMessage(),
            ]);

            throw new \DomainException('Failed to process refund: '.$e->getMessage());
        }

        return $refundRequest->fresh();
    }

    /**
     * Get pending refund requests for admin review.
     */
    public function getPendingRefunds(int $perPage = 20): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        return $this->refundRepository->getPendingPaginated($perPage);
    }

    /**
     * Get user's refund requests.
     */
    public function getUserRefundRequests(User $user): \Illuminate\Database\Eloquent\Collection
    {
        return $this->refundRepository->getByUser($user);
    }
}
