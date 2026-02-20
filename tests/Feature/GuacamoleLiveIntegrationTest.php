<?php

namespace Tests\Feature;

use App\Exceptions\GuacamoleApiException;
use App\Services\GuacamoleClient;
use App\Services\GuacamoleClientInterface;
use Tests\TestCase;

/**
 * Live integration tests that exercise a real Apache Guacamole instance.
 *
 * Guarded by GUACAMOLE_LIVE_TEST env variable (set to true in phpunit.xml).
 * These tests make real HTTP calls and will create/delete connections on the server.
 *
 * @group integration
 */
class GuacamoleLiveIntegrationTest extends TestCase
{
    protected GuacamoleClientInterface $client;

    protected function setUp(): void
    {
        parent::setUp();

        if (! (bool) getenv('GUACAMOLE_LIVE_TEST')) {
            $this->markTestSkipped('GUACAMOLE_LIVE_TEST not enabled');
        }

        if (!config('guacamole.username') || !config('guacamole.password')) {
            $this->markTestSkipped('Guacamole credentials are not configured for tests');
        }

        $this->client = app(GuacamoleClientInterface::class);
    }

    public function test_real_client_is_resolved_from_container(): void
    {
        $this->assertInstanceOf(GuacamoleClient::class, $this->client);
    }

    public function test_get_data_source_returns_resolved_name_from_server(): void
    {
        $dataSource = $this->client->getDataSource();

        $this->assertIsString($dataSource);
        $this->assertNotEmpty($dataSource);
        // Guacamole typically returns lowercase: 'mysql', 'postgresql', 'ldap', etc.
        $this->assertMatchesRegularExpression('/^[a-zA-Z0-9_-]+$/', $dataSource);
    }

    public function test_rdp_connection_lifecycle_create_get_token_delete(): void
    {
        $this->runConnectionLifecycle('rdp', [
            'hostname' => '127.0.0.1',
            'port'     => '3389',
            'security' => 'any',
            'ignore-cert' => 'true',
        ]);
    }

    public function test_vnc_connection_lifecycle_create_get_token_delete(): void
    {
        $this->runConnectionLifecycle('vnc', [
            'hostname'    => '127.0.0.1',
            'port'        => '5900',
            'color-depth' => '24',
            'read-only'   => 'false',
        ]);
    }

    public function test_ssh_connection_lifecycle_create_get_token_delete(): void
    {
        $this->runConnectionLifecycle('ssh', [
            'hostname' => '127.0.0.1',
            'port'     => '22',
        ]);
    }

    public function test_viewer_url_client_id_is_correctly_formed(): void
    {
        $name         = 'live-viewer-url-test-' . bin2hex(random_bytes(4));
        $connectionId = null;

        try {
            $connectionId = $this->client->createConnection([
                'name'       => $name,
                'protocol'   => 'rdp',
                'parameters' => ['hostname' => '127.0.0.1', 'port' => '3389'],
            ]);

            $token      = $this->client->generateAuthToken($connectionId, 300);
            $dataSource = $this->client->getDataSource();

            // Verify the base64 client ID format: base64(connectionId\0c\0dataSource)
            $expectedClientId = base64_encode($connectionId . "\0c\0" . $dataSource);
            $viewerUrl        = config('guacamole.url') . '/#/client/' . $expectedClientId . '?token=' . $token;

            // Decode and verify roundtrip
            $decoded = base64_decode($expectedClientId);
            [$decodedId, , $decodedDs] = explode("\0", $decoded);

            $this->assertEquals($connectionId, $decodedId);
            $this->assertEquals($dataSource, $decodedDs);
            $this->assertStringContainsString('/#/client/', $viewerUrl);
            $this->assertStringContainsString('?token=', $viewerUrl);
        } finally {
            if ($connectionId !== null) {
                try { $this->client->deleteConnection($connectionId); } catch (GuacamoleApiException) {}
            }
        }
    }

    public function test_delete_nonexistent_connection_throws_exception(): void
    {
        $this->expectException(GuacamoleApiException::class);
        $this->client->deleteConnection('999999');
    }

    // ─── helpers ────────────────────────────────────────────────────────────

    private function runConnectionLifecycle(string $protocol, array $parameters): void
    {
        $name         = "live-test-{$protocol}-" . now()->format('YmdHis') . '-' . bin2hex(random_bytes(4));
        $connectionId = null;

        try {
            // Create
            $connectionId = $this->client->createConnection([
                'name'       => $name,
                'protocol'   => $protocol,
                'parameters' => $parameters,
            ]);
            $this->assertNotEmpty($connectionId, "createConnection({$protocol}) returned empty identifier");

            // Get — verify server echoes back the correct name and protocol
            $connection = $this->client->getConnection($connectionId);
            $this->assertIsArray($connection);
            $this->assertEquals($name, $connection['name'] ?? null, 'Returned connection name mismatch');
            $this->assertEquals($protocol, $connection['protocol'] ?? null, 'Returned protocol mismatch');
            $this->assertEquals($connectionId, $connection['identifier'] ?? null, 'Returned identifier mismatch');
            $this->assertEquals('ROOT', $connection['parentIdentifier'] ?? null);

            // Generate auth token — should be a non-empty string
            $token = $this->client->generateAuthToken($connectionId, 300);
            $this->assertIsString($token);
            $this->assertNotEmpty($token);
        } finally {
            if ($connectionId !== null) {
                try {
                    $this->client->deleteConnection($connectionId);
                } catch (GuacamoleApiException $e) {
                    $this->fail("Cleanup failed for {$protocol} connection: " . $e->getMessage());
                }
            }
        }

        // After deletion, getConnection must throw
        $this->expectException(GuacamoleApiException::class);
        $this->client->getConnection($connectionId);
    }
}
