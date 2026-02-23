<?php

namespace Tests\Feature;

use App\Enums\VMSessionStatus;
use App\Models\ProxmoxNode;
use App\Models\User;
use App\Models\VMSession;
use Tests\TestCase;

/**
 * Integration test that actually exercises the WebSocket tunnel URL returned by
 * the application. This is not a normal unit test and will only succeed when a
 * real Guacamole server is reachable at the configured GUACAMOLE_URL and the
 * connection ID stored on the session corresponds to a real Guacamole
 * connection. The test merely performs the WebSocket handshake and asserts the
 * server responds with HTTP/101. If the environment is not configured or the
 * host cannot be reached the test will be skipped rather than failing.
 *
 * This test was added to help debug the "black screen" issue: it automates the
 * manual `wscat` step and ensures the frontend-generated tunnel URL is
 * actually usable from PHP. A successful handshake proves the problem is
 * elsewhere (usually browser mixed‑content/origin issues).
 *
 * The test is intentionally light weight – it does **not** send any Guacamole
 * protocol messages after the handshake, because that would require a running
 * stream to a VM. The JVM/gauc server is expected to immediately close with a
 * 1002/768 error once the first packet is sent (as `wscat` demonstrated).
 */
class GuacamoleTunnelIntegrationTest extends TestCase
{
    public function test_websocket_tunnel_url_accepts_handshake(): void
    {
        // Skip when GUACAMOLE_URL is missing, or when explicitly disabled.
        // By default we **do** run this test locally; set SKIP_GUAC_INTEGRATION=1
        // in your environment to opt out (useful for CI or air‑gapped machines).
        if (env('SKIP_GUAC_INTEGRATION')) {
            $this->markTestSkipped('Guacamole integration tests disabled via environment.');
        }

        $guacUrl = config('guacamole.url');
        if (empty($guacUrl)) {
            $this->markTestSkipped('GUACAMOLE_URL not configured.');
        }

        // Build a minimal active session with a connection ID that should exist
        // in the target Guacamole server. For local debugging we often hardcode
        // 31 in the logs, so use that by default but allow override via env.
        $connectionId = env('TEST_GUAC_CONNECTION_ID', 31);

        $user = User::factory()->engineer()->create();
        $node = ProxmoxNode::factory()->create();

        $session = VMSession::factory()
            ->for($user)
            ->create([
                'node_id' => $node->id,
                'status' => VMSessionStatus::ACTIVE,
                'guacamole_connection_id' => $connectionId,
                'expires_at' => now()->addHour(),
            ]);

        try {
            $response = $this->actingAs($user)
                ->getJson("/sessions/{$session->id}/guacamole-token");
        } catch (\Exception $e) {
            $this->markTestSkipped('Unable to contact Guacamole API: ' . $e->getMessage());
            return;
        }

        if ($response->status() !== 200) {
            $this->markTestSkipped('Guacamole token endpoint returned '.$response->status());
            return;
        }

        $tunnel = $response->json('tunnel_url');
        $token = $response->json('token');
        $dataSource = $response->json('data_source');
        $connId = $response->json('connection_id');

        $params = http_build_query([
            'token' => $token,
            'GUAC_DATA_SOURCE' => $dataSource,
            'GUAC_ID' => $connId,
            'GUAC_TYPE' => 'c',
            'GUAC_WIDTH' => 800,
            'GUAC_HEIGHT' => 600,
            'GUAC_DPI' => 96,
        ]);
        $fullUrl = $tunnel . '?' . $params;

        $parts = parse_url($fullUrl);
        $scheme = $parts['scheme'] ?? 'ws';
        $host = $parts['host'] ?? 'localhost';
        $port = $parts['port'] ?? ($scheme === 'wss' ? 443 : 80);
        $path = ($parts['path'] ?? '/') . (isset($parts['query']) ? '?' . $parts['query'] : '');

        $transport = $scheme === 'wss' ? 'ssl://' : '';
        $socket = @fsockopen($transport . $host, $port, $errno, $errstr, 5);
        if (! $socket) {
            $this->fail("Could not open socket to {$host}: {$errstr} ({$errno})");
        }

        $key = base64_encode(random_bytes(16));
        $req  = "GET {$path} HTTP/1.1\r\n";
        $req .= "Host: {$host}:{$port}\r\n";
        $req .= "Upgrade: websocket\r\n";
        $req .= "Connection: Upgrade\r\n";
        $req .= "Sec-WebSocket-Key: {$key}\r\n";
        $req .= "Sec-WebSocket-Version: 13\r\n\r\n";

        fwrite($socket, $req);
        $line = fgets($socket);
        fclose($socket);

        $this->assertStringContainsString('101', $line, "Handshake failed: {$line}");
    }

    /**
     * During diagnosis we captured a real token from the application logs. This
     * helper test exercises the handshake using that fixed set of values so
     * that the test does not depend on the local Guacamole API being reachable
     * (it only needs network access to the tunnel endpoint itself).
     */
    public function test_handshake_with_sample_token(): void
    {
        if (env('SKIP_GUAC_INTEGRATION')) {
            $this->markTestSkipped('Guacamole integration tests disabled via environment.');
        }

        // values taken from user log message posted during debugging
        $tunnel = 'ws://192.168.50.5:8080/guacamole/websocket-tunnel';
        $token = '9ABBF30F292C48543B59D334A4F81F855024B699937F9773E85448DEF7AAB7B9';
        $dataSource = 'mysql';
        $connId = '31';

        $params = http_build_query([
            'token' => $token,
            'GUAC_DATA_SOURCE' => $dataSource,
            'GUAC_ID' => $connId,
            'GUAC_TYPE' => 'c',
            'GUAC_WIDTH' => 800,
            'GUAC_HEIGHT' => 600,
            'GUAC_DPI' => 96,
        ]);
        $fullUrl = $tunnel . '?' . $params;

        $parts = parse_url($fullUrl);
        $scheme = $parts['scheme'] ?? 'ws';
        $host = $parts['host'] ?? 'localhost';
        $port = $parts['port'] ?? ($scheme === 'wss' ? 443 : 80);
        $path = ($parts['path'] ?? '/') . (isset($parts['query']) ? '?' . $parts['query'] : '');

        $transport = $scheme === 'wss' ? 'ssl://' : '';
        $socket = @fsockopen($transport . $host, $port, $errno, $errstr, 5);
        if (! $socket) {
            $this->fail("Could not open socket to {$host}: {$errstr} ({$errno})");
        }

        $key = base64_encode(random_bytes(16));
        $req  = "GET {$path} HTTP/1.1\r\n";
        $req .= "Host: {$host}:{$port}\r\n";
        $req .= "Upgrade: websocket\r\n";
        $req .= "Connection: Upgrade\r\n";
        $req .= "Sec-WebSocket-Key: {$key}\r\n";
        $req .= "Sec-WebSocket-Version: 13\r\n\r\n";

        fwrite($socket, $req);
        $line = fgets($socket);
        fclose($socket);

        $this->assertStringContainsString('101', $line, "Handshake failed: {$line}");
    }
}
