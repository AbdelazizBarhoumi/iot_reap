<?php

namespace Database\Seeders;

use App\Enums\NotificationType;
use App\Models\ActivityLog;
use App\Models\Camera;
use App\Models\CameraSessionControl;
use App\Models\Caption;
use App\Models\TrainingPath;
use App\Models\TrainingPathEnrollment;
use App\Models\DailyTrainingPathStats;
use App\Models\GuacamoleConnectionPreference;
use App\Models\TrainingUnit;
use App\Models\TrainingUnitProgress;
use App\Models\TrainingUnitVMAssignment;
use App\Models\NodeCredentialsLog;
use App\Models\ProxmoxNode;
use App\Models\ProxmoxServer;
use App\Models\Search;
use App\Models\StripeWebhook;
use App\Models\SystemAlert;
use App\Models\UsbDevice;
use App\Models\UsbDeviceQueue;
use App\Models\User;
use App\Models\Video;
use App\Models\VMSession;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Comprehensive seeder for all remaining models with complete status variations.
 * Ensures every model has test data covering all enums/statuses.
 */
class ComprehensiveModelSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🔄 Seeding all remaining models with comprehensive test data...');

        $this->seedActivityLogs();
        $this->seedCameraSessionControls();
        $this->seedCaptions();
        $this->seedDailyTrainingPathStats();
        $this->seedGuacamoleConnectionPreferences();
        $this->seedTrainingUnitProgress();
        $this->seedTrainingUnitVMAssignments();
        $this->seedNodeCredentialsLogs();
        $this->seedSearchRecords();
        $this->seedStripeWebhooks();
        $this->seedSystemAlerts();
        $this->seedUsbDeviceQueues();

        $this->command->info('✅ All models seeded with complete status coverage!');
    }

    /**
     * Seed activity logs with various action types.
     */
    private function seedActivityLogs(): void
    {
        $users = User::all();
        $actions = [
            'vm.created' => 'VM Session Created',
            'vm.deleted' => 'VM Session Deleted',
            'camera.reserved' => 'Camera Reserved',
            'camera.released' => 'Camera Released',
            'usb.attached' => 'USB Device Attached',
            'usb.detached' => 'USB Device Detached',
            'trainingPath.enrolled' => 'TrainingPath Enrolled',
            'quiz.submitted' => 'Quiz Submitted',
            'payment.processed' => 'Payment Processed',
            'login' => 'User Login',
            'logout' => 'User Logout',
        ];

        foreach ($users->random(min(5, count($users))) as $user) {
            foreach ($actions as $actionType => $description) {
                ActivityLog::create([
                    'user_id' => $user->id,
                    'type' => explode('.', $actionType)[0],
                    'action' => $actionType,
                    'description' => $description,
                    'ip_address' => fake()->ipv4(),
                    'metadata' => json_encode(['model_type' => $this->getModelTypeFromAction($actionType), 'model_id' => rand(1, 100)]),
                    'status' => 'completed',
                ]);
            }
        }

        $this->command->info('✓ ActivityLog seeded (' . count($actions) . ' action types × ' . min(5, count($users)) . ' users)');
    }

    /**
     * Seed camera session controls with different control states.
     */
    private function seedCameraSessionControls(): void
    {
        $cameras = Camera::all();
        $vmSessions = VMSession::all();

        if ($cameras->isEmpty() || $vmSessions->isEmpty()) {
            $this->command->warn('⚠ Skipping camera session controls (missing cameras or VM sessions)');
            return;
        }

        foreach ($cameras->random(min(3, count($cameras))) as $camera) {
            // Create one with released_at = null (active)
            CameraSessionControl::firstOrCreate(
                ['camera_id' => $camera->id, 'released_at' => null],
                [
                    'session_id' => $vmSessions->random()->id,
                    'acquired_at' => now()->subHours(rand(1, 24)),
                ]
            );
            
            // Create two with released_at set (historical)
            for ($i = 0; $i < 2; $i++) {
                CameraSessionControl::create([
                    'camera_id' => $camera->id,
                    'session_id' => $vmSessions->random()->id,
                    'acquired_at' => now()->subDays(rand(1, 7))->subHours(rand(0, 23)),
                    'released_at' => now()->subDays(rand(0, 6))->subHours(rand(0, 23)),
                ]);
            }
        }

        $this->command->info('✓ CameraSessionControl seeded (' . (min(3, count($cameras)) * 3) . ' records)');
    }

    /**
     * Seed captions for videos with different languages/formats.
     */
    private function seedCaptions(): void
    {
        $videos = Video::all();

        if ($videos->isEmpty()) {
            $this->command->warn('⚠ Skipping captions (missing videos)');
            return;
        }

        $languages = ['en', 'es', 'fr', 'de', 'ar', 'zh', 'ja'];

        foreach ($videos->random(min(5, count($videos))) as $video) {
            foreach (array_slice($languages, 0, rand(2, 4)) as $lang) {
                Caption::firstOrCreate(
                    ['video_id' => $video->id, 'language' => $lang],
                    [
                        'label' => $lang === 'en' ? 'English' : ($lang === 'es' ? 'Spanish' : ucfirst($lang)),
                        'file_path' => "/videos/{$video->id}/captions/{$lang}.vtt",
                        'is_default' => $lang === 'en',
                    ]
                );
            }
        }

        $this->command->info('✓ Caption seeded (' . min(5, count($videos)) . ' videos with multiple languages)');
    }

    /**
     * Seed daily trainingPath stats with various metrics.
     */
    private function seedDailyTrainingPathStats(): void
    {
        $trainingPaths = TrainingPath::all();

        if ($trainingPaths->isEmpty()) {
            $this->command->warn('⚠ Skipping daily trainingPath stats (missing trainingPaths)');
            return;
        }

        foreach ($trainingPaths->random(min(5, count($trainingPaths))) as $trainingPath) {
            for ($i = 0; $i < 30; $i++) {
                DailyTrainingPathStats::create([
                    'training_path_id' => $trainingPath->id,
                    'date' => now()->subDays($i)->toDateString(),
                    'enrollments' => rand(10, 100),
                    'completions' => rand(1, 50),
                    'active_students' => rand(5, 80),
                    'training_units_viewed' => rand(10, 100),
                    'video_minutes_watched' => rand(100, 1000),
                    'quiz_attempts' => rand(5, 50),
                    'quiz_passes' => rand(1, 40),
                    'revenue_cents' => rand(50000, 500000),
                ]);
            }
        }

        $this->command->info('✓ DailyTrainingPathStats seeded (30 days × ' . min(5, count($trainingPaths)) . ' trainingPaths)');
    }

    /**
     * Seed Guacamole connection preferences with different protocols.
     */
    private function seedGuacamoleConnectionPreferences(): void
    {
        $users = User::where('role', 'engineer')->get();

        if ($users->isEmpty()) {
            $this->command->warn('⚠ Skipping Guacamole preferences (missing engineers)');
            return;
        }

        $sessionTypes = ['rdp', 'vnc', 'ssh'];

        foreach ($users->random(min(5, count($users))) as $user) {
            foreach ($sessionTypes as $sessionType) {
                GuacamoleConnectionPreference::firstOrCreate(
                    ['user_id' => $user->id, 'vm_session_type' => $sessionType],
                    [
                        'profile_name' => ucfirst($sessionType) . ' Profile',
                        'is_default' => $sessionType === 'rdp',
                        'parameters' => json_encode([
                            'color_depth' => '24-bit',
                            'console_audio' => true,
                            'disable_audio' => false,
                            'enable_printing' => true,
                            'font_name' => 'monospace',
                            'font_size' => 12,
                        ]),
                    ]
                );
            }
        }

        $this->command->info('✓ GuacamoleConnectionPreference seeded (' . count($sessionTypes) . ' protocols × ' . min(5, count($users)) . ' users)');
    }

    /**
     * Seed trainingUnit progress with all status variations.
     * Note: EnrollmentSeeder already seeds trainingUnit progress, so this just adds additional status variations
     */
    private function seedTrainingUnitProgress(): void
    {
        $enrollments = TrainingPathEnrollment::with('trainingPath', 'user')->get();
        $trainingUnits = TrainingUnit::all();

        if ($enrollments->isEmpty() || $trainingUnits->isEmpty()) {
            $this->command->warn('⚠ Skipping trainingUnit progress (missing enrollments or trainingUnits)');
            return;
        }

        $statuses = ['not_started', 'in_progress', 'completed', 'paused'];
        $count = 0;

        foreach ($enrollments->random(min(5, count($enrollments))) as $enrollment) {
            foreach ($trainingUnits->random(min(5, count($trainingUnits))) as $trainingUnit) {
                $status = $statuses[array_rand($statuses)];
                
                $existing = \App\Models\TrainingUnitProgress::where('user_id', $enrollment->user_id)
                    ->where('training_unit_id', $trainingUnit->id)
                    ->first();
                
                if (!$existing) {
                    \App\Models\TrainingUnitProgress::create([
                        'user_id' => $enrollment->user_id,
                        'training_unit_id' => $trainingUnit->id,
                        'status' => $status,
                        'progress_percentage' => $status === 'completed' ? 100 : rand(0, 100),
                        'started_at' => $status !== 'not_started' ? now()->subDays(rand(1, 30)) : null,
                        'completed_at' => $status === 'completed' ? now()->subDays(rand(0, 30)) : null,
                        'time_spent_seconds' => rand(0, 3600),
                    ]);
                    $count++;
                }
            }
        }

        $this->command->info('✓ TrainingUnitProgress seeded (' . $count . ' additional records with status variations)');
    }

    /**
     * Seed trainingUnit VM assignments with different assignment statuses.
     */
    private function seedTrainingUnitVMAssignments(): void
    {
        $trainingUnits = TrainingUnit::all();

        if ($trainingUnits->isEmpty()) {
            $this->command->warn('⚠ Skipping trainingUnit VM assignments (missing trainingUnits)');
            return;
        }

        $statuses = ['pending', 'approved', 'rejected'];

        foreach ($trainingUnits->random(min(5, count($trainingUnits))) as $trainingUnit) {
            foreach ($statuses as $status) {
                TrainingUnitVMAssignment::firstOrCreate(
                    ['training_unit_id' => $trainingUnit->id, 'status' => $status],
                    [
                        'template_id' => $status === 'approved' ? rand(1, 10) : null,
                        'is_direct_vm' => rand(0, 1) === 1,
                        'teacher_notes' => "Notes for VM assignment: $status status",
                        'admin_feedback' => $status === 'rejected' ? 'Please review requirements' : null,
                    ]
                );
            }
        }

        $this->command->info('✓ TrainingUnitVMAssignment seeded (' . count($statuses) . ' status variations)');
    }

    /**
     * Seed node credentials logs with audit trail.
     */
    private function seedNodeCredentialsLogs(): void
    {
        $proxmoxServers = ProxmoxServer::all();
        $users = User::where('role', 'admin')->orWhere('role', 'engineer')->get();

        if ($proxmoxServers->isEmpty() || $users->isEmpty()) {
            $this->command->warn('⚠ Skipping node credentials logs (missing servers or users)');
            return;
        }

        $actions = ['registered', 'updated', 'tested', 'deleted'];

        foreach ($proxmoxServers->random(min(3, count($proxmoxServers))) as $server) {
            foreach ($actions as $action) {
                NodeCredentialsLog::create([
                    'proxmox_server_id' => $server->id,
                    'action' => $action,
                    'ip_address' => fake()->ipv4(),
                    'changed_by' => $users->random()->id,
                    'details' => json_encode([
                        'reason' => 'Routine rotation',
                        'credential_type' => ['api_token', 'ssh_key'][array_rand([0, 1])],
                        'server' => $server->name,
                    ]),
                ]);
            }
        }

        $this->command->info('✓ NodeCredentialsLog seeded (' . count($actions) . ' action types)');
    }

    /**
     * Seed search records for auditing search behavior.
     */
    private function seedSearchRecords(): void
    {
        $users = User::all();

        if ($users->isEmpty()) {
            $this->command->warn('⚠ Skipping search records (missing users)');
            return;
        }

        $searchTerms = [
            'Linux tutorial',
            'Industrial automation',
            'Robot programming',
            'Network configuration',
            'IoT sensors',
            'Cloud computing',
            'Cybersecurity',
            'MQTT protocol',
            'Proxmox setup',
            'Remote desktop',
        ];

        foreach ($users->random(min(5, count($users))) as $user) {
            foreach ($searchTerms as $term) {
                Search::create([
                    'user_id' => $user->id,
                    'query' => $term,
                    'results_count' => rand(1, 100),
                    'ip_address' => fake()->ipv4(),
                    'user_agent' => fake()->userAgent(),
                ]);
            }
        }

        $this->command->info('✓ Search seeded (' . count($searchTerms) . ' search terms)');
    }

    /**
     * Seed Stripe webhook records with all event types.
     */
    private function seedStripeWebhooks(): void
    {
        $eventTypes = [
            'payment_intent.created',
            'payment_intent.succeeded',
            'payment_intent.payment_failed',
            'customer.created',
            'customer.updated',
            'invoice.created',
            'invoice.payment_succeeded',
            'invoice.payment_failed',
            'charge.refunded',
            'customer.subscription.created',
            'customer.subscription.updated',
            'customer.subscription.deleted',
        ];

        foreach ($eventTypes as $eventType) {
            StripeWebhook::create([
                'stripe_event_id' => 'evt_' . Str::random(32),
                'event_type' => $eventType,
                'payload' => [
                    'id' => 'evt_' . Str::random(32),
                    'type' => $eventType,
                    'created' => now()->timestamp,
                    'data' => [
                        'object' => [
                            'id' => 'pi_' . Str::random(32),
                            'amount' => rand(1000, 50000),
                            'currency' => 'usd',
                        ],
                    ],
                ],
                'processed' => rand(0, 1) === 1,
                'processed_at' => rand(0, 1) === 1 ? now()->subDays(rand(0, 30)) : null,
            ]);
        }

        $this->command->info('✓ StripeWebhook seeded (' . count($eventTypes) . ' Stripe event types)');
    }

    /**
     * Seed system alerts with different severity levels.
     */
    private function seedSystemAlerts(): void
    {
        $severities = ['info', 'warning', 'error', 'critical'];
        $sources = ['proxmox', 'system', 'vm', 'network'];
        $alertTitles = [
            'VM Provisioning Failed',
            'Camera Connection Lost',
            'Network Latency High',
            'Proxmox Node Offline',
            'Disk Space Low',
            'Memory Usage Critical',
            'VM Session Expired',
            'Certificate Expiring Soon',
            'Authentication Failure',
            'Payment Processing Failed',
        ];

        foreach ($alertTitles as $title) {
            foreach ($severities as $severity) {
                SystemAlert::create([
                    'title' => "$title ($severity)",
                    'description' => "System alert: $title with severity level $severity",
                    'severity' => $severity,
                    'source' => $sources[array_rand($sources)],
                    'metadata' => [
                        'error_code' => 'ERR_' . rand(1000, 9999),
                        'retry_count' => rand(0, 5),
                    ],
                    'acknowledged' => rand(0, 1) === 1,
                    'acknowledged_at' => rand(0, 1) === 1 ? now()->subDays(rand(0, 30)) : null,
                    'resolved' => rand(0, 1) === 1,
                    'resolved_at' => rand(0, 1) === 1 ? now()->subDays(rand(0, 30)) : null,
                ]);
            }
        }

        $this->command->info('✓ SystemAlert seeded (' . count($alertTitles) . ' titles × ' . count($severities) . ' severities)');
    }

    /**
     * Seed USB device queue with various queue states.
     */
    private function seedUsbDeviceQueues(): void
    {
        $usbDevices = UsbDevice::all();
        $vmSessions = VMSession::all();
        $users = User::where('role', 'engineer')->get();

        if ($usbDevices->isEmpty() || $vmSessions->isEmpty() || $users->isEmpty()) {
            $this->command->warn('⚠ Skipping USB device queue (missing devices, sessions, or users)');
            return;
        }

        $position = 1;
        foreach ($usbDevices->random(min(3, count($usbDevices))) as $device) {
            // Create queues with different sessions to avoid unique constraint violations
            $sessionsToUse = $vmSessions->random(min(3, count($vmSessions)));
            
            foreach ($sessionsToUse as $session) {
                UsbDeviceQueue::firstOrCreate(
                    ['usb_device_id' => $device->id, 'session_id' => $session->id],
                    [
                        'user_id' => $users->random()->id,
                        'position' => $position,
                        'queued_at' => now()->subDays(rand(0, 30)),
                        'notified_at' => $position === 1 ? now()->subDays(rand(0, 30)) : null,
                    ]
                );
                $position++;
            }
        }

        $this->command->info('✓ UsbDeviceQueue seeded (queue positions for USB devices)');
    }

    /**
     * Helper: Get model type from action string.
     */
    private function getModelTypeFromAction(string $action): string
    {
        return match (true) {
            str_contains($action, 'vm') => 'VMSession',
            str_contains($action, 'camera') => 'Camera',
            str_contains($action, 'usb') => 'UsbDevice',
            str_contains($action, 'trainingPath') => 'TrainingPath',
            str_contains($action, 'quiz') => 'Quiz',
            str_contains($action, 'payment') => 'Payment',
            default => 'User',
        };
    }
}
