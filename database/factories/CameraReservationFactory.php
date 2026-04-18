<?php

namespace Database\Factories;

use App\Models\Camera;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * DEPRECATED: This factory now delegates to ReservationFactory.
 * Use Reservation::factory()->forCamera() instead.
 *
 * @extends Factory<Reservation>
 */
class CameraReservationFactory extends Factory
{
    protected $model = Reservation::class;

    public function definition(): array
    {
        $start = $this->faker->dateTimeBetween('+1 day', '+7 days');
        $end = (clone $start)->modify('+2 hours');

        return [
            'reservable_type' => 'App\Models\Camera',
            'reservable_id' => Camera::factory(),
            'user_id' => User::factory(),
            'status' => 'pending',
            'requested_start_at' => $start,
            'requested_end_at' => $end,
            'purpose' => $this->faker->sentence(),
            'priority' => 0,
        ];
    }

    /**
     * Set reservation as pending.
     */
    public function pending(): static
    {
        return $this->state(fn () => ['status' => 'pending']);
    }

    /**
     * Set reservation as approved.
     */
    public function approved(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'approved',
                'approved_by' => User::factory()->admin(),
                'approved_start_at' => $attributes['requested_start_at'] ?? now(),
                'approved_end_at' => $attributes['requested_end_at'] ?? now()->addHours(2),
            ];
        });
    }

    /**
     * Set reservation as rejected.
     */
    public function rejected(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'rejected',
                'approved_by' => User::factory()->admin(),
                'admin_notes' => $this->faker->sentence(),
            ];
        });
    }

    /**
     * Set reservation as active.
     */
    public function active(): static
    {
        return $this->state(function (array $attributes) {
            $start = now()->subHour();
            $end = now()->addHour();

            return [
                'status' => 'active',
                'approved_by' => User::factory()->admin(),
                'approved_start_at' => $start,
                'approved_end_at' => $end,
                'actual_start_at' => $start,
            ];
        });
    }

    /**
     * Set reservation as completed.
     */
    public function completed(): static
    {
        return $this->state(function (array $attributes) {
            $start = now()->subHours(3);
            $end = now()->subHours(1);

            return [
                'status' => 'completed',
                'approved_by' => User::factory()->admin(),
                'approved_start_at' => $start,
                'approved_end_at' => $end,
                'actual_start_at' => $start,
                'actual_end_at' => $end,
            ];
        });
    }

    /**
     * Set reservation as cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(fn () => ['status' => 'cancelled']);
    }

    /**
     * Set reservation as an admin maintenance block.
     */
    public function adminBlock(): static
    {
        return $this->state(function () {
            $start = now()->addDay();
            $end = now()->addDay()->addHours(2);

            return [
                'status' => 'approved',
                'approved_by' => User::factory()->admin(),
                'approved_start_at' => $start,
                'approved_end_at' => $end,
                'purpose' => 'Admin block',
                'priority' => 100,
            ];
        });
    }
}
