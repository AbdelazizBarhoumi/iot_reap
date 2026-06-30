<?php

namespace Database\Seeders;

use App\Models\ProxmoxServer;
use Illuminate\Database\Seeder;

class ProxmoxServerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ProxmoxServer::forceCreate([
            'name' => 'local-node-1',
            'description' => 'Primary Proxmox node',
            'host' => '192.168.50.3',
            'port' => '8006',
            'realm' => 'pam',
            'token_id' => 'PVEAPIToken=user@pam!token=local-node-1',
            'token_secret' => '247d433d-6eb0-444b-9770-c7686028c3dc',
            'verify_ssl' => false,
            'is_active' => true,
            'max_vms_per_node' => 5,
            'max_concurrent_sessions' => 20,
            'cpu_overcommit_ratio' => 2.00,
            'memory_overcommit_ratio' => 1.50,
        ]);
    }
}
