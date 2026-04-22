<?php

namespace Database\Factories;

use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Models\TrainingPath;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'training_path_id' => TrainingPath::factory(),
            'stripe_session_id' => 'cs_'.Str::random(24),
            'stripe_payment_intent_id' => 'pi_'.Str::random(24),
            'status' => PaymentStatus::PENDING,
            'amount_cents' => $this->faker->randomElement([1990, 2990, 4990, 9990, 14990]),
            'currency' => 'USD',
            'metadata' => null,
            'paid_at' => null,
        ];
    }

    /**
     * Payment is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PaymentStatus::COMPLETED,
            'paid_at' => now(),
        ]);
    }

    /**
     * Payment completed at a specific date.
     */
    public function completedAt(\DateTimeInterface|string $date): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PaymentStatus::COMPLETED,
            'paid_at' => $date,
        ]);
    }

    /**
     * Payment is failed.
     */
    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PaymentStatus::FAILED,
        ]);
    }

    /**
     * Payment is refunded.
     */
    public function refunded(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PaymentStatus::REFUNDED,
            'paid_at' => now()->subDays(7),
        ]);
    }

    /**
     * Payment is partially refunded.
     */
    public function partiallyRefunded(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PaymentStatus::PARTIALLY_REFUNDED,
            'paid_at' => now()->subDays(7),
        ]);
    }

    /**
     * Set specific amount in cents.
     */
    public function amountCents(int $cents): static
    {
        return $this->state(fn (array $attributes) => [
            'amount_cents' => $cents,
        ]);
    }

    /**
     * Set specific amount in dollars.
     */
    public function amount(float $dollars): static
    {
        return $this->state(fn (array $attributes) => [
            'amount_cents' => (int) ($dollars * 100),
        ]);
    }

    /**
     * Assign to specific trainingPath.
     */
    public function forTrainingPath(TrainingPath $trainingPath): static
    {
        return $this->state(fn (array $attributes) => [
            'training_path_id' => $trainingPath->id,
            'amount_cents' => $trainingPath->price_cents ?? $attributes['amount_cents'],
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
}
