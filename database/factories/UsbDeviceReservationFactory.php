<?php

namespace Database\Factories;

use App\Models\Reservation;
use App\Models\UsbDevice;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * DEPRECATED: This factory now delegates to ReservationFactory.
 * Use Reservation::factory()->forUsbDevice() instead.
 *
 * @extends Factory<Reservation>
 */
class UsbDeviceReservationFactory extends Factory
{
    protected $model = Reservation::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $requestedStart = Carbon::now()->addDays(rand(1, 7))->startOfHour();
        $requestedEnd = $requestedStart->copy()->addHours(rand(1, 4));

        return [
            'reservable_type' => 'App\Models\UsbDevice',
            'reservable_id' => UsbDevice::factory(),
            'user_id' => User::factory(),
            'status' => 'pending',
            'requested_start_at' => $requestedStart,
            'requested_end_at' => $requestedEnd,
            'approved_start_at' => null,
            'approved_end_at' => null,
            'approved_by' => null,
            'purpose' => $this->faker->sentence(),
            'admin_notes' => null,
            'priority' => 0,
        ];
    }

    /**
     * Configure as pending status.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'approved_start_at' => null,
            'approved_end_at' => null,
            'approved_by' => null,
        ]);
    }

    /**
     * Configure as approved status.
     */
    public function approved(): static
    {
        return $this->state(function (array $attributes) {
            $approvedStart = $attributes['requested_start_at'] ?? Carbon::now()->addDay();
            $approvedEnd = $attributes['requested_end_at'] ?? Carbon::now()->addDay()->addHours(2);

            return [
                'status' => 'approved',
                'approved_start_at' => $approvedStart,
                'approved_end_at' => $approvedEnd,
                'approved_by' => User::factory()->admin(),
            ];
        });
    }

    /**
     * Configure as rejected status.
     */
    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'rejected',
            'admin_notes' => $this->faker->sentence(),
            'approved_by' => User::factory()->admin(),
        ]);
    }

    /**
     * Configure as active status (currently in use).
     */
    public function active(): static
    {
        return $this->state(function (array $attributes) {
            $approvedStart = Carbon::now()->subHour();
            $approvedEnd = Carbon::now()->addHours(2);

            return [
                'status' => 'active',
                'approved_start_at' => $approvedStart,
                'approved_end_at' => $approvedEnd,
                'approved_by' => User::factory()->admin(),
                'actual_start_at' => $approvedStart,
            ];
        });
    }

    /**
     * Configure as completed status.
     */
    public function completed(): static
    {
        return $this->state(function (array $attributes) {
            $approvedStart = $attributes['requested_start_at'] ?? Carbon::now()->subHours(4);
            $approvedEnd = $attributes['requested_end_at'] ?? Carbon::now()->subHour();

            return [
                'status' => 'completed',
                'approved_start_at' => $approvedStart,
                'approved_end_at' => $approvedEnd,
                'approved_by' => User::factory()->admin(),
                'actual_start_at' => $approvedStart,
                'actual_end_at' => $approvedEnd,
            ];
        });
    }

    /**
     * Configure as cancelled status.
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
        ]);
    }

    /**
     * Bind reservation to a specific USB device.
     */
    public function forDevice(UsbDevice $device): static
    {
        return $this->state(fn (array $attributes) => [
            'reservable_type' => 'App\Models\UsbDevice',
            'reservable_id' => $device->id,
        ]);
    }

    /**
     * Bind reservation to a specific user.
     */
    public function forUser(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $user->id,
        ]);
    }
}
