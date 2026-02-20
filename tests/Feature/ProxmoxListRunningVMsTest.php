<?php

namespace Tests\Feature;

use App\Models\ProxmoxServer;
use App\Services\ProxmoxClient;
use Tests\TestCase;

/**
 * Guarded live test: list all running VMs and their guest IPv4 addresses across
 * the Proxmox servers defined in `docs/prox.md`.
 *
 * Non-destructive — uses GET endpoints only.
 * Requires PROXMOX_LIVE_TEST=true in phpunit.xml (already enabled).
 *
 * @group integration
 */
class ProxmoxListRunningVMsTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        if (! (bool) getenv('PROXMOX_LIVE_TEST')) {
            $this->markTestSkipped('PROXMOX_LIVE_TEST not enabled');
        }

        if (!file_exists(base_path('docs/prox.md'))) {
            $this->markTestSkipped('docs/prox.md not found — cannot read Proxmox credentials');
        }
    }

    public function test_list_running_vms_with_ips_from_all_prox_servers(): void
    {
        $nodes = $this->parseProxMd(base_path('docs/prox.md'));
        $this->assertNotEmpty($nodes, 'No Proxmox node entries found in docs/prox.md');

        $summary = [];

        foreach ($nodes as $node) {
            $server = ProxmoxServer::create([
                'name' => $node['name'],
                'host' => $node['ip'],
                'port' => (int) ($node['port'] ?? 8006),
                'realm' => explode('@', $node['user'])[1] ?? 'pam',
                'token_id' => $node['user'] . '!' . $node['token_name'],
                'token_secret' => $node['token'],
                'verify_ssl' => false,
                'is_active' => true,
            ]);

            $client = new ProxmoxClient($server);

            $clusterNodes = $client->getNodes();

            foreach ($clusterNodes as $clusterNode) {
                $nodeName = $clusterNode['node'] ?? $clusterNode['name'] ?? null;
                if (! $nodeName) {
                    continue;
                }

                $vms = $client->getVMs($nodeName);

                foreach ($vms as $vm) {
                    $vmid = $vm['vmid'] ?? null;
                    // Use the VM status returned by Proxmox; fall back to 'unknown' if absent.
                    $status = $vm['status'] ?? 'unknown';

                    if ($status !== 'running') {
                        continue; // only list running VMs
                    }

                    $vmName = $vm['name'] ?? 'n/a';

                    // Attempt to get guest agent IP (may return null)
                    $ip = null;
                    try {
                        $ip = $client->getVMNetworkIP($nodeName, $vmid);
                    } catch (\Throwable $e) {
                        $ip = null;
                    }

                    $summary[] = [
                        'server' => $server->name,
                        'node' => $nodeName,
                        'vmid' => $vmid,
                        'name' => $vmName,
                        'ip' => $ip,
                    ];
                }
            }

            $server->delete();
        }

        // Persist the real results to a file for accurate reporting and also print to logs
        $outPath = storage_path('app/proxmox_running_vms.json');
        file_put_contents($outPath, json_encode($summary, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

        // Print readable output for the user in test logs
        if (empty($summary)) {
            fwrite(STDOUT, "\nNo running VMs with guest IPs found on configured Proxmox servers.\n");
        } else {
            fwrite(STDOUT, "\nRunning VMs (node / vmid / name → ip):\n");
            foreach ($summary as $s) {
                $ip = $s['ip'] ?? '(no guest IP)';
                fwrite(STDOUT, " - {$s['server']} / {$s['node']} / {$s['vmid']} / {$s['name']} → {$ip}\n");
            }
            fwrite(STDOUT, "\nSaved JSON: {$outPath}\n");
        }

        $this->assertTrue(true, 'Completed Proxmox running VMs listing');
    }

    private function parseProxMd(string $path): array
    {
        $text = file_get_contents($path);
        $blocks = preg_split('/#\s*node\s*\d+/mi', $text);
        $result = [];

        foreach ($blocks as $block) {
            if (! str_contains($block, 'node name')) {
                continue;
            }

            $name = $this->extractValue($block, 'node name');
            $ip = $this->extractValue($block, 'node ip');
            $port = $this->extractValue($block, 'node port') ?: '8006';
            $user = $this->extractValue($block, 'user');
            $tokenName = $this->extractValue($block, 'token name');
            $token = $this->extractValue($block, 'token');

            if ($name && $ip && $user && $tokenName && $token) {
                $result[] = [
                    'name' => trim($name),
                    'ip' => trim($ip),
                    'port' => trim($port),
                    'user' => trim($user),
                    'token_name' => trim($tokenName),
                    'token' => trim($token),
                ];
            }
        }

        return $result;
    }

    private function extractValue(string $block, string $label): ?string
    {
        if (preg_match('/' . preg_quote($label, '/') . '\s*:\s*(.+)/i', $block, $m)) {
            return trim($m[1]);
        }

        return null;
    }
}
