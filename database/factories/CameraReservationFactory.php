<?php

namespace Database\Factories;

use App\Enums\CameraReservationStatus;
use App\Models\Camera;
use App\Models\CameraReservation;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CameraReservation>
 */
class CameraReservationFactory extends Factory
{
    protected $model = CameraReservation::class;

    public function definition(): array
    {
        $start = $this->faker->dateTimeBetween('+1 day', '+7 days');
        $end = (clone $start)->modify('+2 hours');

        return [
            'camera_id' => Camera::factory(),
            'user_id' => User::factory(),
            'status' => CameraReservationStatus::PENDING,
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
        return $this->state(fn () => ['status' => CameraReservationStatus::PENDING]);
    }

    /**
     * Set reservation as approved.
     */
    public function approved(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => CameraReservationStatus::APPROVED,
                'approved_by' => User::factory()->admin(),
                'approved_start_at' => $attributes['requested_start_at'],
                'approved_end_at' => $attributes['requested_end_at'],
            ];
        });
    }

    /**
     * Set reservation as active.
     */
    public function active(): static
    {
        $start = now()->subHour();
        $end = now()->addHour();

        return $this->state(fn () => [
            'status' => CameraReservationStatus::ACTIVE,
            'approved_by' => User::factory()->admin(),
            'requested_start_at' => $start,
            'requested_end_at' => $end,
            'approved_start_at' => $start,
            'approved_end_at' => $end,
            'actual_start_at' => $start,
        ]);
    }

    /**
     * Admin block reservation.
     */
    public function adminBlock(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => CameraReservationStatus::APPROVED,
                'approved_by' => $attributes['user_id'],
                'approved_start_at' => $attributes['requested_start_at'],
                'approved_end_at' => $attributes['requested_end_at'],
                'purpose' => 'Admin block',
                'priority' => 100,
            ];
        });
    }
}
