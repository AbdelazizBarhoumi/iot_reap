<?php

namespace Database\Factories;

use App\Enums\RefundStatus;
use App\Models\Payment;
use App\Models\RefundRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RefundRequest>
 */
class RefundRequestFactory extends Factory
{
    protected $model = RefundRequest::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'payment_id' => Payment::factory()->completed(),
            'user_id' => User::factory(),
            'status' => RefundStatus::PENDING,
            'reason' => $this->faker->sentence(),
            'admin_notes' => null,
            'stripe_refund_id' => null,
            'refund_amount_cents' => null,
            'processed_at' => null,
        ];
    }

    /**
     * Refund is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => RefundStatus::PENDING,
        ]);
    }

    /**
     * Refund is approved.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => RefundStatus::APPROVED,
            'admin_notes' => 'Approved by admin',
        ]);
    }

    /**
     * Refund is rejected.
     */
    public function rejected(string $reason = 'Request does not meet refund policy'): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => RefundStatus::REJECTED,
            'admin_notes' => $reason,
            'processed_at' => now(),
        ]);
    }

    /**
     * Refund is processing.
     */
    public function processing(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => RefundStatus::PROCESSING,
        ]);
    }

    /**
     * Refund is completed.
     */
    public function completed(int $amountCents = 2990): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => RefundStatus::COMPLETED,
            'stripe_refund_id' => 're_'.fake()->regexify('[A-Za-z0-9]{24}'),
            'refund_amount_cents' => $amountCents,
            'processed_at' => now(),
        ]);
    }

    /**
     * Refund has failed.
     */
    public function failed(string $reason = 'Stripe processing error'): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => RefundStatus::FAILED,
            'admin_notes' => $reason,
            'processed_at' => now(),
        ]);
    }

    /**
     * Assign to specific payment.
     */
    public function forPayment(Payment $payment): static
    {
        return $this->state(fn (array $attributes) => [
            'payment_id' => $payment->id,
            'user_id' => $payment->user_id,
        ]);
    }

    /**
     * Assign to specific user.
     */
    public function forUser(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $user->id,
        ]);
    }

    /**
     * Set a specific reason.
     */
    public function withReason(string $reason): static
    {
        return $this->state(fn (array $attributes) => [
            'reason' => $reason,
        ]);
    }
}
