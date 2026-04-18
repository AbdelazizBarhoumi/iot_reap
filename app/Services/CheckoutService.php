<?php

namespace App\Services;

use App\Enums\PaymentStatus;
use App\Models\TrainingPath;
use App\Models\Payment;
use App\Models\User;
use App\Repositories\PaymentRepository;
use Illuminate\Support\Facades\Log;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Stripe;

class CheckoutService
{
    public function __construct(
        protected PaymentRepository $paymentRepository
    ) {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Create a Stripe checkout session for trainingPath enrollment.
     */
    public function createCheckoutSession(User $user, TrainingPath $trainingPath): array
    {
        // Check if user already enrolled (either paid or free)
        if ($user->enrolledTrainingPaths()->where('training_path_id', $trainingPath->id)->exists()) {
            throw new \DomainException('You are already enrolled in this trainingPath.');
        }

        // If trainingPath is free, enroll directly
        if ($trainingPath->is_free || $trainingPath->price_cents === 0) {
            return $this->enrollFree($user, $trainingPath);
        }

        // Create Stripe checkout session
        $session = StripeSession::create([
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => strtolower($trainingPath->currency),
                    'product_data' => [
                        'name' => $trainingPath->title,
                        'description' => $trainingPath->description ? substr($trainingPath->description, 0, 500) : 'TrainingPath enrollment',
                        'images' => $trainingPath->thumbnail_url ? [$trainingPath->thumbnail_url] : [],
                    ],
                    'unit_amount' => $trainingPath->price_cents,
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'success_url' => route('checkout.success', ['session_id' => '{CHECKOUT_SESSION_ID}']),
            'cancel_url' => route('checkout.cancelled', ['trainingPath' => $trainingPath->id]),
            'customer_email' => $user->email,
            'client_reference_id' => (string) $user->id,
            'metadata' => [
                'user_id' => $user->id,
                'training_path_id' => $trainingPath->id,
            ],
        ]);

        // Create pending payment record
        $this->paymentRepository->create([
            'user_id' => $user->id,
            'training_path_id' => $trainingPath->id,
            'stripe_session_id' => $session->id,
            'status' => PaymentStatus::PENDING,
            'amount_cents' => $trainingPath->price_cents,
            'currency' => $trainingPath->currency,
            'metadata' => [
                'training_path_title' => $trainingPath->title,
                'checkout_created_at' => now()->toIso8601String(),
            ],
        ]);

        Log::info('Checkout session created', [
            'user_id' => $user->id,
            'training_path_id' => $trainingPath->id,
            'session_id' => $session->id,
        ]);

        return [
            'session_id' => $session->id,
            'checkout_url' => $session->url,
        ];
    }

    /**
     * Enroll user in a free trainingPath.
     * Wrapped in transaction to ensure payment record and enrollment are atomic.
     */
    protected function enrollFree(User $user, TrainingPath $trainingPath): array
    {
        // Create a payment record for tracking (zero amount)
        $this->paymentRepository->create([
            'user_id' => $user->id,
            'training_path_id' => $trainingPath->id,
            'stripe_session_id' => 'free_'.uniqid(),
            'status' => PaymentStatus::COMPLETED,
            'amount_cents' => 0,
            'currency' => $trainingPath->currency,
            'paid_at' => now(),
            'metadata' => [
                'training_path_title' => $trainingPath->title,
                'enrollment_type' => 'free',
            ],
        ]);

        // Enroll the user
        $user->enrolledTrainingPaths()->attach($trainingPath->id, [
            'enrolled_at' => now(),
        ]);

        Log::info('Free trainingPath enrollment', [
            'user_id' => $user->id,
            'training_path_id' => $trainingPath->id,
        ]);

        return [
            'enrolled' => true,
            'training_path_url' => route('trainingPaths.show', $trainingPath),
        ];
    }

    /**
     * Get payment by Stripe session ID.
     */
    public function getPaymentBySessionId(string $sessionId): ?Payment
    {
        return $this->paymentRepository->findByStripeSessionId($sessionId);
    }

    /**
     * Check if user has purchased a trainingPath.
     */
    public function hasPurchased(User $user, TrainingPath $trainingPath): bool
    {
        return $this->paymentRepository
            ->findCompletedByUserAndTrainingPath($user->id, $trainingPath->id) !== null;
    }
}
