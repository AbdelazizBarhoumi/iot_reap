<?php

namespace Tests\Feature;

use App\Models\ProxmoxServer;
use App\Services\ProxmoxClient;
use Tests\TestCase;

/**
 * Live diagnostics for a real Proxmox server described in `docs/prox.md`.
 *
 * - Guarded by PROXMOX_LIVE_TEST to prevent accidental runs in CI.
 * - Non-destructive: authenticates and lists nodes / VMs only.
 *
 * Usage: set PROXMOX_LIVE_TEST=true in phpunit.xml or your environment.
 *
 * @group integration
 */
class ProxmoxLiveDiagnosticTest extends TestCase
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

    public function test_authenticate_and_list_nodes_using_docs_prox_md(): void
    {
        $nodes = $this->parseProxMd(base_path('docs/prox.md'));
        $this->assertNotEmpty($nodes, 'No Proxmox node entries found in docs/prox.md');

        foreach ($nodes as $node) {
            // Create a transient ProxmoxServer model (saved to the test DB)
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

            // Authenticate + list nodes (will throw on auth failure)
            $clusterNodes = $client->getNodes();
            $this->assertIsArray($clusterNodes, 'getNodes did not return an array');

            // Print a short summary to test output for user visibility
            fwrite(STDOUT, "\nProxmox server '{$server->name}' ({$server->host}:{$server->port}) returned " . count($clusterNodes) . " nodes.\n");

            // For each node returned by the cluster, list top 3 VMs (non-destructive)
            foreach (array_slice($clusterNodes, 0, 3) as $clusterNode) {
                $nodeName = $clusterNode['node'] ?? $clusterNode['name'] ?? null;
                if (! $nodeName) {
                    continue;
                }

                $vms = $client->getVMs($nodeName);
                $this->assertIsArray($vms);

                fwrite(STDOUT, "  Node: {$nodeName} — VMs: " . count($vms) . "\n");
                // show first VM id/name if available
                if (! empty($vms)) {
                    $first = $vms[0];
                    fwrite(STDOUT, "    - VMID: {$first['vmid']} name: " . ($first['name'] ?? '(no name)') . " status: " . ($first['status'] ?? 'unknown') . "\n");
                }
            }

            // Clean up test DB record
            $server->delete();
        }
    }

    /**
     * Parse docs/prox.md for node entries (format maintained in repo docs).
     *
     * Returns array of arrays: [name, ip, port, user, token_name, token]
     */
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
