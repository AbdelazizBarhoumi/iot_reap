<?php

namespace Database\Seeders;

use App\Enums\ProxmoxNodeStatus;
use App\Models\ProxmoxNode;
use App\Models\User;
use App\Models\VMSession;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create test user (or use existing one)
        $testUser = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => bcrypt('password'),
                'role' => 'engineer',
            ]
        );

        // Create admin users (all roles)
        $this->call(AdminUserSeeder::class);

        // Seed 7 Proxmox nodes
        $this->seedProxmoxNodes();

        // VM templates are no longer used; seeding skipped

        // Seed 2 demo VM sessions
        $this->seedVMSessions($testUser);

        // Seed trainingPaths with modules and trainingUnits
        $this->call(TrainingPathSeeder::class);

        // Seed robots and cameras
        $this->call(CameraSeeder::class);

        // ── COMPREHENSIVE SEEDING FOR ALL MODELS ──

        // Learning & Progress
        $this->call(EnrollmentSeeder::class);
        $this->call(QuizSeeder::class);
        $this->call(ContentSeeder::class);

        // Community & Discussion
        $this->call(ForumSeeder::class);

        // Infrastructure & Hardware
        $this->call(HardwareSeeder::class);
        $this->call(ReservationSeeder::class);

        // Payments & Finance
        $this->call(PaymentSeeder::class);

        // Notifications & Alerts
        $this->call(NotificationSeeder::class);

        // Complete model coverage - all remaining models with all status variations
        $this->call(ComprehensiveModelSeeder::class);

        $this->command->info('✅ Database seeding completed with comprehensive test data for ALL 45 models!');
    }

    /**
     * Seed 7 Proxmox nodes.
     */
    private function seedProxmoxNodes(): void
    {
        $nodes = [
            ['name' => 'pve-1', 'hostname' => 'pve-1.lab.local', 'api_url' => 'https://192.168.1.101:8006', 'status' => ProxmoxNodeStatus::ONLINE],
            ['name' => 'pve-2', 'hostname' => 'pve-2.lab.local', 'api_url' => 'https://192.168.1.102:8006', 'status' => ProxmoxNodeStatus::ONLINE],
            ['name' => 'pve-3', 'hostname' => 'pve-3.lab.local', 'api_url' => 'https://192.168.1.103:8006', 'status' => ProxmoxNodeStatus::ONLINE],
            ['name' => 'pve-4', 'hostname' => 'pve-4.lab.local', 'api_url' => 'https://192.168.1.104:8006', 'status' => ProxmoxNodeStatus::ONLINE],
            ['name' => 'pve-5', 'hostname' => 'pve-5.lab.local', 'api_url' => 'https://192.168.1.105:8006', 'status' => ProxmoxNodeStatus::ONLINE],
            ['name' => 'pve-6', 'hostname' => 'pve-6.lab.local', 'api_url' => 'https://192.168.1.106:8006', 'status' => ProxmoxNodeStatus::MAINTENANCE],
            ['name' => 'pve-7', 'hostname' => 'pve-7.lab.local', 'api_url' => 'https://192.168.1.107:8006', 'status' => ProxmoxNodeStatus::OFFLINE],
        ];

        foreach ($nodes as $nodeData) {
            ProxmoxNode::factory()->create($nodeData);
        }
    }

    /**
     * Seed demo VM sessions for testing.
     */
    private function seedVMSessions(User $user): void
    {
        $node = ProxmoxNode::where('status', ProxmoxNodeStatus::ONLINE)->first();

        if ($node) {
            // Create an active demo session (using placeholder vmid)
            VMSession::factory()->active()->create([
                'user_id' => $user->id,
                'node_id' => $node->id,
                'vm_id' => 100,
            ]);

            // Create a pending demo session
            VMSession::factory()->pending()->create([
                'user_id' => $user->id,
                'node_id' => $node->id,
                'vm_id' => 101,
            ]);
        }
    }
}
