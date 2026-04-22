<?php

namespace Database\Factories;

use App\Models\Camera;
use App\Models\Reservation;
use App\Models\UsbDevice;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Reservation>
 */
class ReservationFactory extends Factory
{
    protected $model = Reservation::class;

    public function definition(): array
    {
        $start = $this->faker->dateTimeBetween('+1 day', '+7 days');
        $end = (clone $start)->modify('+2 hours');

        // Default to camera reservation
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
     * Create a reservation for a camera.
     */
    public function forCamera(?Camera $camera = null): static
    {
        return $this->state(function (array $attributes) use ($camera) {
            return [
                'reservable_type' => 'App\Models\Camera',
                'reservable_id' => $camera?->id ?? Camera::factory(),
            ];
        });
    }

    /**
     * Create a reservation for a USB device.
     */
    public function forUsbDevice(?UsbDevice $device = null): static
    {
        return $this->state(function (array $attributes) use ($device) {
            return [
                'reservable_type' => 'App\Models\UsbDevice',
                'reservable_id' => $device?->id ?? UsbDevice::factory(),
            ];
        });
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
            $start = $this->faker->dateTimeBetween('now', '+7 days');
            $end = (clone $start)->modify('+2 hours');

            return [
                'status' => 'approved',
                'approved_by' => User::factory()->admin(),
                'approved_start_at' => $start,
                'approved_end_at' => $end,
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
     * Set reservation as rejected.
     */
    public function rejected(): static
    {
        return $this->state(fn () => [
            'status' => 'rejected',
            'approved_by' => User::factory()->admin(),
        ]);
    }

    /**
     * Set reservation as cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(fn () => [
            'status' => 'cancelled',
        ]);
    }
}
