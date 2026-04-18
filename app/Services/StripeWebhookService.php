<?php

namespace App\Services;

use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Repositories\PaymentRepository;
use Illuminate\Support\Facades\Log;
use Stripe\Event;
use Stripe\Stripe;
use Stripe\Webhook;

class StripeWebhookService
{
    public function __construct(
        protected PaymentRepository $paymentRepository
    ) {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Verify and parse webhook payload.
     */
    public function constructEvent(string $payload, string $signature): Event
    {
        return Webhook::constructEvent(
            $payload,
            $signature,
            config('services.stripe.webhook_secret')
        );
    }

    /**
     * Handle Stripe webhook event.
     */
    public function handleEvent(Event $event): void
    {
        match ($event->type) {
            'checkout.session.completed' => $this->handleCheckoutSessionCompleted($event),
            'checkout.session.expired' => $this->handleCheckoutSessionExpired($event),
            'payment_intent.payment_failed' => $this->handlePaymentFailed($event),
            'charge.refunded' => $this->handleChargeRefunded($event),
            default => Log::info('Unhandled Stripe event', ['type' => $event->type]),
        };
    }

    /**
     * Handle successful checkout session.
     */
    protected function handleCheckoutSessionCompleted(Event $event): void
    {
        $session = $event->data->object;

        $payment = $this->paymentRepository->findByStripeSessionId($session->id);

        if (! $payment) {
            Log::warning('Payment not found for completed checkout session', [
                'session_id' => $session->id,
            ]);

            return;
        }

        if ($payment->status === PaymentStatus::COMPLETED) {
            Log::info('Payment already completed, skipping', [
                'payment_id' => $payment->id,
            ]);

            return;
        }

        // Mark payment as completed
        $payment->markAsCompleted($session->payment_intent);

        // Enroll the user in the trainingPath
        $this->enrollUser($payment);

        Log::info('Checkout completed and user enrolled', [
            'payment_id' => $payment->id,
            'user_id' => $payment->user_id,
            'training_path_id' => $payment->training_path_id,
        ]);
    }

    /**
     * Handle expired checkout session.
     */
    protected function handleCheckoutSessionExpired(Event $event): void
    {
        $session = $event->data->object;

        $payment = $this->paymentRepository->findByStripeSessionId($session->id);

        if ($payment && $payment->status === PaymentStatus::PENDING) {
            $payment->markAsFailed();

            Log::info('Checkout session expired', [
                'payment_id' => $payment->id,
            ]);
        }
    }

    /**
     * Handle failed payment.
     */
    protected function handlePaymentFailed(Event $event): void
    {
        $paymentIntent = $event->data->object;

        $payment = $this->paymentRepository->findByStripePaymentIntentId($paymentIntent->id);

        if ($payment) {
            $payment->markAsFailed();

            Log::warning('Payment failed', [
                'payment_id' => $payment->id,
                'error' => $paymentIntent->last_payment_error?->message ?? 'Unknown error',
            ]);
        }
    }

    /**
     * Handle refund.
     */
    protected function handleChargeRefunded(Event $event): void
    {
        $charge = $event->data->object;

        $payment = $this->paymentRepository->findByStripePaymentIntentId($charge->payment_intent);

        if (! $payment) {
            Log::warning('Payment not found for refund', [
                'payment_intent' => $charge->payment_intent,
            ]);

            return;
        }

        $refundedAmount = $charge->amount_refunded;
        $originalAmount = $charge->amount;

        // Update payment status based on refund amount
        if ($refundedAmount >= $originalAmount) {
            $payment->update(['status' => PaymentStatus::REFUNDED]);
            // Remove enrollment
            $this->unenrollUser($payment);
        } else {
            $payment->update(['status' => PaymentStatus::PARTIALLY_REFUNDED]);
        }

        Log::info('Payment refunded via Stripe', [
            'payment_id' => $payment->id,
            'refunded_amount' => $refundedAmount,
            'original_amount' => $originalAmount,
        ]);
    }

    /**
     * Enroll user in trainingPath after successful payment.
     */
    protected function enrollUser(Payment $payment): void
    {
        $user = $payment->user;
        $trainingPath = $payment->trainingPath;

        if (! $user->enrolledTrainingPaths()->where('training_path_id', $trainingPath->id)->exists()) {
            $user->enrolledTrainingPaths()->attach($trainingPath->id, [
                'enrolled_at' => now(),
            ]);
        }
    }

    /**
     * Remove user enrollment (for refunds).
     */
    protected function unenrollUser(Payment $payment): void
    {
        $payment->user->enrolledTrainingPaths()->detach($payment->training_path_id);
    }
}
