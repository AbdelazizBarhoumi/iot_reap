<?php

namespace Database\Seeders;

use App\Enums\ProxmoxNodeStatus;
use App\Models\ProxmoxNode;
use App\Models\User;
use App\Models\VMTemplate;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create test user
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // Create admin user
        $this->call(\Database\Seeders\AdminUserSeeder::class);

        // Seed 7 Proxmox nodes
        $this->seedProxmoxNodes();

        // Seed 3 VM templates (Windows 11, Ubuntu 22.04, Kali Linux)
        $this->seedVMTemplates();
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
     * Seed Windows 11, Ubuntu 22.04, and Kali Linux templates.
     */
    private function seedVMTemplates(): void
    {
        VMTemplate::factory()->windows11()->create();
        VMTemplate::factory()->ubuntu2204()->create();
        VMTemplate::factory()->kaliLinux()->create();
    }
}
