<?php

namespace App\Services;

use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Models\TrainingPath;
use App\Models\User;
use App\Repositories\PaymentRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Stripe;

class CheckoutService
{
    public function __construct(
        protected PaymentRepository $paymentRepository,
        protected EnrollmentService $enrollmentService
    ) {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Create a Stripe checkout session for trainingPath enrollment.
     */
    public function createCheckoutSession(User $user, TrainingPath $trainingPath): array
    {
        if (! $trainingPath->isPublished()) {
            throw new \DomainException('This training path is not available for enrollment.');
        }

        // Check if user already enrolled (either paid or free)
        if ($this->enrollmentService->isEnrolled($user, $trainingPath->id)) {
            throw new \DomainException('You are already enrolled in this trainingPath.');
        }

        // If trainingPath is free, enroll directly
        if ($trainingPath->is_free || $trainingPath->price_cents === 0) {
            return $this->enrollFree($user, $trainingPath);
        }

        // Create Stripe checkout session
        $productData = [
            'name' => $trainingPath->title,
            'description' => $trainingPath->description ? substr($trainingPath->description, 0, 500) : 'TrainingPath enrollment',
        ];

        $stripeImageUrl = $this->resolveStripeImageUrl($trainingPath->thumbnail_url);
        if ($stripeImageUrl !== null) {
            $productData['images'] = [$stripeImageUrl];
        }

        $session = StripeSession::create([
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => strtolower($trainingPath->currency),
                    'product_data' => $productData,
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
        DB::transaction(function () use ($user, $trainingPath): void {
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

            // Enroll the user via EnrollmentService to ensure cache invalidation
            $this->enrollmentService->enroll($user, $trainingPath->id);
        });

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

    /**
     * Stripe requires absolute product image URLs.
     */
    protected function resolveStripeImageUrl(?string $thumbnailUrl): ?string
    {
        if (! is_string($thumbnailUrl) || trim($thumbnailUrl) === '') {
            return null;
        }

        $thumbnailUrl = trim($thumbnailUrl);

        if (Str::startsWith($thumbnailUrl, '//')) {
            $thumbnailUrl = request()?->getScheme().':'.$thumbnailUrl;
        } elseif (Str::startsWith($thumbnailUrl, '/')) {
            $thumbnailUrl = url($thumbnailUrl);
        }

        $isValidAbsoluteUrl = filter_var($thumbnailUrl, FILTER_VALIDATE_URL) !== false
            && in_array(parse_url($thumbnailUrl, PHP_URL_SCHEME), ['http', 'https'], true);

        if (! $isValidAbsoluteUrl) {
            Log::warning('Skipping invalid Stripe product image URL', [
                'thumbnail_url' => $thumbnailUrl,
                'training_path_id' => request()?->route('trainingPath')?->id,
            ]);

            return null;
        }

        return $thumbnailUrl;
    }
}
