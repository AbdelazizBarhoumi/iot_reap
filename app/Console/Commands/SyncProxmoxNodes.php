<?php

namespace App\Console\Commands;

use App\Services\ProxmoxNodeSyncService;
use Illuminate\Console\Command;

class SyncProxmoxNodes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'proxmox:sync-nodes 
                            {--server= : Specific server ID to sync (optional, syncs all if omitted)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync nodes from Proxmox servers into the database';

    /**
     * Execute the console command.
     */
    public function handle(ProxmoxNodeSyncService $syncService): int
    {
        $serverId = $this->option('server');

        if ($serverId) {
            // Sync specific server
            $server = \App\Models\ProxmoxServer::find($serverId);

            if (!$server) {
                $this->error("Server with ID {$serverId} not found.");
                return Command::FAILURE;
            }

            $this->info("Syncing nodes from server: {$server->name} ({$server->host})...");
            $result = $syncService->syncNodes($server);

            $this->displayResult($server->name, $result);

            return empty($result['errors']) ? Command::SUCCESS : Command::FAILURE;
        }

        // Sync all servers
        $this->info('Syncing nodes from all active Proxmox servers...');
        $this->newLine();

        $results = $syncService->syncAllServers();

        if (empty($results)) {
            $this->warn('No active Proxmox servers found. Register a server first.');
            return Command::SUCCESS;
        }

        $totalSynced = 0;
        $totalCreated = 0;
        $totalUpdated = 0;
        $hasErrors = false;

        foreach ($results as $serverId => $data) {
            $this->displayResult($data['name'], $data['result']);
            $totalSynced += $data['result']['synced'];
            $totalCreated += $data['result']['created'];
            $totalUpdated += $data['result']['updated'];

            if (!empty($data['result']['errors'])) {
                $hasErrors = true;
            }
        }

        $this->newLine();
        $this->info("Total: {$totalSynced} nodes synced ({$totalCreated} new, {$totalUpdated} updated)");

        return $hasErrors ? Command::FAILURE : Command::SUCCESS;
    }

    /**
     * Display sync result for a server.
     */
    private function displayResult(string $serverName, array $result): void
    {
        $this->line("Server: <comment>{$serverName}</comment>");
        $this->line("  Synced:  {$result['synced']}");
        $this->line("  Created: {$result['created']}");
        $this->line("  Updated: {$result['updated']}");

        if (!empty($result['errors'])) {
            foreach ($result['errors'] as $error) {
                $this->error("  Error: {$error}");
            }
        }

        $this->newLine();
    }
}
