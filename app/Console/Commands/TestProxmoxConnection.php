<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class TestProxmoxConnection extends Command
{
    protected $signature = 'test:proxmox';
    protected $description = 'Test Proxmox connections';

    public function handle()
    {
        $nodes = [
            ['name' => 'local-node-1', 'host' => '192.168.1.157', 'port' => 8006, 'token_id' => 'admin@pam!local-node-1', 'token' => '247d433d-6eb0-444b-9770-c7686028c3dc'],
            ['name' => 'local-node-2', 'host' => '192.168.1.156', 'port' => 8006, 'token_id' => 'admin@pam!local-node-2', 'token' => '3f085833-ce86-484d-8f0d-919eefb52f55'],
        ];

        foreach ($nodes as $node) {
            $this->info("=== {$node['name']} ===");
            $url = "https://{$node['host']}:{$node['port']}/api2/json/nodes";
            $tokenAuth = "{$node['token_id']}={$node['token']}";

            try {
                $response = Http::withHeaders(['Authorization' => "PVEAPIToken={$tokenAuth}"])
                    ->timeout(10)->withoutVerifying()->get($url);

                if ($response->successful()) {
                    $this->line("<fg=green>✓ Status: {$response->status()}</>");
                    $data = $response->json('data', []);
                    foreach ($data as $n) {
                        $this->line("  - {$n['node']} ({$n['status']})");
                    }
                } else {
                    $this->line("<fg=red>✗ Status: {$response->status()}</>");
                }
            } catch (\Exception $e) {
                $this->line("<fg=red>✗ Error: {$e->getMessage()}</>");
            }
        }
    }
}
