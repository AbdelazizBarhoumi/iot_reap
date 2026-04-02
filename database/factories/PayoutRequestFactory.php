<?php

namespace Database\Factories;

use App\Enums\PayoutStatus;
use App\Models\PayoutRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PayoutRequest>
 */
class PayoutRequestFactory extends Factory
{
    protected $model = PayoutRequest::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'amount_cents' => fake()->numberBetween(5000, 100000),
            'currency' => 'USD',
            'status' => PayoutStatus::PENDING,
            'payout_method' => 'stripe',
            'payout_details' => null,
            'stripe_transfer_id' => null,
            'approved_by' => null,
            'approved_at' => null,
            'processed_at' => null,
            'completed_at' => null,
            'admin_notes' => null,
            'rejection_reason' => null,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PayoutStatus::PENDING,
        ]);
    }

    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PayoutStatus::APPROVED,
            'approved_by' => User::factory()->admin(),
            'approved_at' => now(),
        ]);
    }

    public function processing(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PayoutStatus::PROCESSING,
            'approved_by' => User::factory()->admin(),
            'approved_at' => now()->subHour(),
            'processed_at' => now(),
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PayoutStatus::COMPLETED,
            'approved_by' => User::factory()->admin(),
            'approved_at' => now()->subHours(2),
            'processed_at' => now()->subHour(),
            'completed_at' => now(),
            'stripe_transfer_id' => 'tr_'.fake()->uuid(),
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PayoutStatus::REJECTED,
            'approved_by' => User::factory()->admin(),
            'approved_at' => now(),
            'rejection_reason' => fake()->sentence(),
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PayoutStatus::FAILED,
            'approved_by' => User::factory()->admin(),
            'approved_at' => now()->subHours(2),
            'processed_at' => now()->subHour(),
            'admin_notes' => 'Stripe error: '.fake()->sentence(),
        ]);
    }

    public function forTeacher(User $teacher): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $teacher->id,
        ]);
    }

    public function withAmount(int $amountCents): static
    {
        return $this->state(fn (array $attributes) => [
            'amount_cents' => $amountCents,
        ]);
    }
}
