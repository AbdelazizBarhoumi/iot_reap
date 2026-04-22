<?php

namespace Database\Seeders;

use App\Models\Camera;
use App\Models\Reservation;
use App\Models\UsbDevice;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Seeds camera and USB device reservations using polymorphic relationship.
 */
class ReservationSeeder extends Seeder
{
    public function run(): void
    {
        $engineers = User::where('role', 'engineer')->get();
        $cameras = Camera::all();
        $usbDevices = UsbDevice::all();

        if ($engineers->isEmpty()) {
            $this->command->warn('No engineers found. Skipping reservations.');

            return;
        }

        // Seed camera reservations
        if (! $cameras->isEmpty()) {
            foreach ($engineers->random(min(3, count($engineers))) as $engineer) {
                foreach ($cameras->random(min(3, count($cameras))) as $camera) {
                    $statuses = ['pending', 'approved', 'active', 'completed', 'cancelled'];
                    foreach ($statuses as $status) {
                        $requestedStart = now()->addDays(rand(1, 30));
                        $requestedEnd = $requestedStart->copy()->addDays(rand(1, 10));
                        $approvedStart = in_array($status, ['approved', 'active', 'completed']) ? $requestedStart : null;
                        $approvedEnd = in_array($status, ['approved', 'active', 'completed']) ? $requestedEnd : null;

                        Reservation::create([
                            'reservable_type' => Camera::class,
                            'reservable_id' => $camera->id,
                            'user_id' => $engineer->id,
                            'status' => $status,
                            'requested_start_at' => $requestedStart,
                            'requested_end_at' => $requestedEnd,
                            'approved_start_at' => $approvedStart,
                            'approved_end_at' => $approvedEnd,
                            'purpose' => $this->generatePurpose(),
                            'priority' => rand(0, 3),
                        ]);
                    }
                }
            }
        }

        // Seed USB device reservations
        if (! $usbDevices->isEmpty()) {
            foreach ($engineers->random(min(3, count($engineers))) as $engineer) {
                foreach ($usbDevices->random(min(2, count($usbDevices))) as $device) {
                    $statuses = ['pending', 'approved', 'active', 'completed', 'cancelled'];
                    foreach ($statuses as $status) {
                        $requestedStart = now()->addDays(rand(1, 30));
                        $requestedEnd = $requestedStart->copy()->addDays(rand(1, 10));
                        $approvedStart = in_array($status, ['approved', 'active', 'completed']) ? $requestedStart : null;
                        $approvedEnd = in_array($status, ['approved', 'active', 'completed']) ? $requestedEnd : null;

                        Reservation::create([
                            'reservable_type' => UsbDevice::class,
                            'reservable_id' => $device->id,
                            'user_id' => $engineer->id,
                            'status' => $status,
                            'requested_start_at' => $requestedStart,
                            'requested_end_at' => $requestedEnd,
                            'approved_start_at' => $approvedStart,
                            'approved_end_at' => $approvedEnd,
                            'purpose' => $this->generatePurpose(),
                            'priority' => rand(0, 3),
                        ]);
                    }
                }
            }
        }

        $this->command->info('Seeded camera and USB device reservations.');
    }

    private function generatePurpose(): string
    {
        $purposes = [
            'Equipment testing and validation',
            'Performance analysis',
            'Troubleshooting',
            'Production audit',
            'Security assessment',
            'Maintenance verification',
            'Quality control',
            'Integration testing',
            'System monitoring',
            'Compliance verification',
        ];

        return $purposes[array_rand($purposes)];
    }
}
