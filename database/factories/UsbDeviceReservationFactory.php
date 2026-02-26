<?php

namespace Database\Factories;

use App\Enums\UsbReservationStatus;
use App\Models\UsbDevice;
use App\Models\UsbDeviceReservation;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\Sequence;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UsbDeviceReservation>
 */
class UsbDeviceReservationFactory extends Factory
{
    protected $model = UsbDeviceReservation::class;

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
            'usb_device_id' => UsbDevice::factory(),
            'user_id' => User::factory(),
            'status' => UsbReservationStatus::PENDING,
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
            'status' => UsbReservationStatus::PENDING,
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
                'status' => UsbReservationStatus::APPROVED,
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
            'status' => UsbReservationStatus::REJECTED,
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
                'status' => UsbReservationStatus::ACTIVE,
                'approved_start_at' => $approvedStart,
                'approved_end_at' => $approvedEnd,
                'approved_by' => User::factory()->admin(),
            ];
        });
    }

    /**
     * Configure as completed status.
     */
    public function completed(): static
    {
        return $this->state(function (array $attributes) {
            $approvedStart = Carbon::now()->subHours(4);
            $approvedEnd = Carbon::now()->subHour();

            return [
                'status' => UsbReservationStatus::COMPLETED,
                'approved_start_at' => $approvedStart,
                'approved_end_at' => $approvedEnd,
                'approved_by' => User::factory()->admin(),
            ];
        });
    }

    /**
     * Configure as cancelled status.
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => UsbReservationStatus::CANCELLED,
        ]);
    }

    /**
     * Configure as an admin block (not a user reservation).
     */
    public function adminBlock(): static
    {
        return $this->state(function (array $attributes) {
            $approvedStart = Carbon::now()->addDay();
            $approvedEnd = $approvedStart->copy()->addHours(4);

            return [
                'status' => UsbReservationStatus::APPROVED,
                'approved_start_at' => $approvedStart,
                'approved_end_at' => $approvedEnd,
                'approved_by' => User::factory()->admin(),
                'purpose' => 'Admin block',
                'priority' => 100,
            ];
        });
    }
}
