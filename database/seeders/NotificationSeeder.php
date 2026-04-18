<?php

namespace Database\Seeders;

use App\Enums\NotificationType;
use App\Models\Notification;
use App\Models\SystemAlert;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Seeds notifications and system alerts.
 */
class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();

        if ($users->isEmpty()) {
            $this->command->warn('No users found. Skipping notifications.');
            return;
        }

        // ── Seed user notifications ──
        foreach ($users->random(min(3, count($users))) as $user) {
            // Create 3-5 notifications per user
            for ($i = 0; $i < rand(3, 5); $i++) {
                Notification::create([
                    'user_id' => $user->id,
                    'type' => $this->randomNotificationType(),
                    'title' => $this->generateNotificationTitle(),
                    'message' => $this->generateNotificationMessage(),
                    'data' => [
                        'related_id' => rand(1, 100),
                        'action_url' => '/dashboard',
                    ],
                    'read_at' => rand(0, 1) === 1 ? now()->subDays(rand(1, 10)) : null,
                    'created_at' => now()->subDays(rand(1, 30)),
                ]);
            }
        }

        // ── Seed system alerts ──
        $alertTitles = [
            'VM Provisioning Failed',
            'Camera Connection Lost',
            'USB Device Disconnected',
            'Quota Exceeded',
            'Reservation Expiring',
            'Payment Processing Error',
            'Gateway Node Offline',
            'High Memory Usage',
        ];

        $severities = ['info', 'warning', 'error', 'critical'];

        for ($i = 0; $i < 8; $i++) {
            SystemAlert::create([
                'title' => $alertTitles[array_rand($alertTitles)],
                'severity' => $severities[array_rand($severities)],
                'description' => 'System alert ' . ($i + 1) . ' - This is a test alert.',
                'source' => ['proxmox', 'system', 'vm', 'network'][array_rand([0, 1, 2, 3])],
                'metadata' => json_encode(['trace' => 'Alert details for debugging']),
                'acknowledged' => rand(0, 1) === 1,
                'acknowledged_at' => rand(0, 1) === 1 ? now()->subDays(rand(1, 5)) : null,
                'resolved' => rand(0, 1) === 1,
                'resolved_at' => rand(0, 1) === 1 ? now()->subDays(rand(1, 10)) : null,
            ]);
        }

        $this->command->info('Seeded notifications and system alerts.');
    }

    private function randomNotificationType(): NotificationType
    {
        $types = NotificationType::cases();
        return $types[array_rand($types)];
    }

    private function generateNotificationTitle(): string
    {
        $titles = [
            'TrainingPath enrollment approved',
            'VM session ready',
            'Quiz results available',
            'New discussion reply',
            'Payment received',
            'Certificate issued',
            'Reservation confirmed',
            'System maintenance scheduled',
        ];

        return $titles[array_rand($titles)];
    }

    private function generateNotificationMessage(): string
    {
        $messages = [
            'Your request has been processed successfully.',
            'A new response to your discussion thread is available.',
            'Important update regarding your enrollment.',
            'Action required for your pending request.',
            'Congratulations! You have earned a new badge.',
            'Your reservation has been confirmed.',
            'A technical issue requires your attention.',
        ];

        return $messages[array_rand($messages)];
    }
}
