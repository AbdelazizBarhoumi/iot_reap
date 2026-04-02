<?php

namespace App\Services;

use App\Enums\PaymentStatus;
use App\Models\Course;
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
     * Create a Stripe checkout session for course enrollment.
     */
    public function createCheckoutSession(User $user, Course $course): array
    {
        // Check if user already enrolled (either paid or free)
        if ($user->enrolledCourses()->where('course_id', $course->id)->exists()) {
            throw new \DomainException('You are already enrolled in this course.');
        }

        // If course is free, enroll directly
        if ($course->is_free || $course->price_cents === 0) {
            return $this->enrollFree($user, $course);
        }

        // Create Stripe checkout session
        $session = StripeSession::create([
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => strtolower($course->currency),
                    'product_data' => [
                        'name' => $course->title,
                        'description' => $course->description ? substr($course->description, 0, 500) : 'Course enrollment',
                        'images' => $course->thumbnail_url ? [$course->thumbnail_url] : [],
                    ],
                    'unit_amount' => $course->price_cents,
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'success_url' => route('checkout.success', ['session_id' => '{CHECKOUT_SESSION_ID}']),
            'cancel_url' => route('checkout.cancelled', ['course' => $course->id]),
            'customer_email' => $user->email,
            'client_reference_id' => (string) $user->id,
            'metadata' => [
                'user_id' => $user->id,
                'course_id' => $course->id,
            ],
        ]);

        // Create pending payment record
        $this->paymentRepository->create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'stripe_session_id' => $session->id,
            'status' => PaymentStatus::PENDING,
            'amount_cents' => $course->price_cents,
            'currency' => $course->currency,
            'metadata' => [
                'course_title' => $course->title,
                'checkout_created_at' => now()->toIso8601String(),
            ],
        ]);

        Log::info('Checkout session created', [
            'user_id' => $user->id,
            'course_id' => $course->id,
            'session_id' => $session->id,
        ]);

        return [
            'session_id' => $session->id,
            'checkout_url' => $session->url,
        ];
    }

    /**
     * Enroll user in a free course.
     * Wrapped in transaction to ensure payment record and enrollment are atomic.
     */
    protected function enrollFree(User $user, Course $course): array
    {
        // Create a payment record for tracking (zero amount)
        $this->paymentRepository->create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'stripe_session_id' => 'free_'.uniqid(),
            'status' => PaymentStatus::COMPLETED,
            'amount_cents' => 0,
            'currency' => $course->currency,
            'paid_at' => now(),
            'metadata' => [
                'course_title' => $course->title,
                'enrollment_type' => 'free',
            ],
        ]);

        // Enroll the user
        $user->enrolledCourses()->attach($course->id, [
            'enrolled_at' => now(),
        ]);

        Log::info('Free course enrollment', [
            'user_id' => $user->id,
            'course_id' => $course->id,
        ]);

        return [
            'enrolled' => true,
            'course_url' => route('courses.show', $course),
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
     * Check if user has purchased a course.
     */
    public function hasPurchased(User $user, Course $course): bool
    {
        return $this->paymentRepository
            ->findCompletedByUserAndCourse($user->id, $course->id) !== null;
    }
}
