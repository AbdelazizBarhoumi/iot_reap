<?php

namespace Database\Seeders;

use App\Models\ProxmoxNode;
use App\Models\User;
use App\Models\VMSession;
use App\Models\VMTemplate;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // default admin
        $this->call(\Database\Seeders\AdminUserSeeder::class);

        // Seed 7 Proxmox nodes
        ProxmoxNode::factory()
            ->count(7)
            ->online()
            ->create();

        // Seed 3 VM templates
        $windows11 = VMTemplate::factory()->windows11()->create();
        $ubuntu = VMTemplate::factory()->ubuntu2204()->create();
        $kali = VMTemplate::factory()->kaliLinux()->create();

        // Seed 2 demo sessions
        $user = User::where('email', 'test@example.com')->first();
        $node = ProxmoxNode::first();

        VMSession::factory()
            ->for($user)
            ->for($windows11, 'template')
            ->for($node, 'node')
            ->active()
            ->create();

        VMSession::factory()
            ->for($user)
            ->for($ubuntu, 'template')
            ->for($node, 'node')
            ->create();
    }
}
