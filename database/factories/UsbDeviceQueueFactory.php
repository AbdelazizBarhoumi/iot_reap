<?php

namespace Database\Factories;

use App\Models\UsbDevice;
use App\Models\UsbDeviceQueue;
use App\Models\User;
use App\Models\VMSession;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UsbDeviceQueue>
 */
class UsbDeviceQueueFactory extends Factory
{
    protected $model = UsbDeviceQueue::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'usb_device_id' => UsbDevice::factory(),
            'session_id' => VMSession::factory(),
            'user_id' => User::factory(),
            'position' => $this->faker->numberBetween(1, 5),
            'queued_at' => now(),
            'notified_at' => null,
        ];
    }

    /**
     * Mark the queue entry as notified.
     */
    public function notified(): static
    {
        return $this->state(fn (array $attributes) => [
            'notified_at' => now(),
        ]);
    }

    /**
     * Set queue position.
     */
    public function position(int $position): static
    {
        return $this->state(fn (array $attributes) => [
            'position' => $position,
        ]);
    }
}
