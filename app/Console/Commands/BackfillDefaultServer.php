<?php

namespace App\Console\Commands;

use App\Models\ProxmoxServer;
use App\Models\ProxmoxNode;
use Illuminate\Console\Command;

class BackfillDefaultServer extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'proxmox:backfill-default-server
                            {--force : Skip confirmation}';

    /**
     * The command description.
     *
     * @var string
     */
    protected $description = 'Backfill a default ProxmoxServer from config/proxmox.php for existing single-server setups';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        // Check if credentials are configured
        if (! config('proxmox.token_id') || ! config('proxmox.token_secret')) {
            $this->warn('⚠️  PROXMOX_TOKEN_ID or PROXMOX_TOKEN_SECRET is not configured in .env');
            $this->info('Please configure these credentials before running this command.');
            return self::FAILURE;
        }

        // Check if default server already exists
        $defaultServer = ProxmoxServer::where('host', config('proxmox.host'))
            ->where('port', config('proxmox.port'))
            ->first();

        if ($defaultServer) {
            $this->info("✓ Default Proxmox server already exists: {$defaultServer->name}");
            $orphanedNodes = ProxmoxNode::whereNull('proxmox_server_id')->count();
            if ($orphanedNodes > 0) {
                $this->warn("Found {$orphanedNodes} orphaned proxmox_nodes. Linking to: {$defaultServer->name}");
                if ($this->option('force') || $this->confirm('Proceed with linking orphaned nodes?')) {
                    ProxmoxNode::whereNull('proxmox_server_id')
                        ->update(['proxmox_server_id' => $defaultServer->id]);
                    $this->info("✓ Linked {$orphanedNodes} orphaned nodes");
                }
            }
            return self::SUCCESS;
        }

        // Create default server from config
        $this->info('Creating default Proxmox server from config/proxmox.php...');
        $this->table(
            ['Config Key', 'Value'],
            [
                ['Host', config('proxmox.host')],
                ['Port', config('proxmox.port')],
                ['Realm', config('proxmox.realm')],
                ['Verify SSL', config('proxmox.verify_ssl') ? 'Yes' : 'No'],
            ]
        );

        if (! $this->option('force') && ! $this->confirm('Create server with these settings?')) {
            $this->info('Cancelled.');
            return self::SUCCESS;
        }

        $defaultServer = ProxmoxServer::create([
            'name' => 'Default Cluster',
            'description' => 'Default Proxmox cluster from single-server migration',
            'host' => config('proxmox.host'),
            'port' => config('proxmox.port'),
            'realm' => config('proxmox.realm'),
            'token_id' => config('proxmox.token_id'),
            'token_secret' => config('proxmox.token_secret'),
            'verify_ssl' => config('proxmox.verify_ssl'),
            'is_active' => true,
        ]);

        $this->info("✓ Created default server: {$defaultServer->name} (ID: {$defaultServer->id})");

        // Link all orphaned nodes
        $orphanedNodes = ProxmoxNode::whereNull('proxmox_server_id')->count();
        if ($orphanedNodes > 0) {
            ProxmoxNode::whereNull('proxmox_server_id')
                ->update(['proxmox_server_id' => $defaultServer->id]);
            $this->info("✓ Linked {$orphanedNodes} orphaned proxmox_nodes to default server");
        }

        return self::SUCCESS;
    }
}
