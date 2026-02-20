<?php

namespace Tests\Feature;

use App\Services\GuacamoleClient;
use App\Services\GuacamoleClientInterface;
use Tests\TestCase;

/**
 * Create a temporary Guacamole connection to a real VM and return a viewer URL.
 * Guarded by GUACAMOLE_LIVE_TEST; non-destructive (creates a connection but does not delete it).
 * @group integration
 */
class OpenGuacamoleConnectionForVMTest extends TestCase
{
    public function setUp(): void
    {
        parent::setUp();

        if (! (bool) getenv('GUACAMOLE_LIVE_TEST')) {
            $this->markTestSkipped('GUACAMOLE_LIVE_TEST not enabled');
        }

        if (!config('guacamole.username') || !config('guacamole.password')) {
            $this->markTestSkipped('Guacamole admin credentials are not configured');
        }
    }

    public function test_create_connection_and_return_viewer_url_for_local_node_1_vmid_100(): void
    {
        /** @var GuacamoleClientInterface $client */
        $client = app(GuacamoleClientInterface::class);
        $this->assertInstanceOf(GuacamoleClient::class, $client);

        $ip = '192.168.100.166';
        $protocol = 'rdp';
        $name = 'ad-hoc-session-' . now()->format('YmdHis');

        // Credentials provided by user during the session
        $username = 'abdulazeezbrhomi';
        $password = 'oiokolo;op';

        $params = [
            'name' => $name,
            'protocol' => $protocol,
            'parameters' => [
                'hostname' => $ip,
                'port' => '3389',
                'username' => $username,
                'password' => $password,
                'ignore-cert' => 'true',
            ],
        ];

        $connectionId = $client->createConnection($params);
        $this->assertNotEmpty($connectionId);

        $token = $client->generateAuthToken($connectionId, (int) config('guacamole.connection.token_expiration_seconds', 300));
        $this->assertNotEmpty($token);

        $dataSource = $client->getDataSource();
        $clientId = base64_encode($connectionId . "\0c\0" . $dataSource);
        $viewerUrl = config('guacamole.url') . '/#/client/' . $clientId . '?token=' . $token;

        // Print URL for user
        fwrite(STDOUT, "\nGuacamole viewer URL:\n{$viewerUrl}\n");

        // Keep the connection (do not delete) so user can use it immediately
        $this->assertTrue(true);
    }

    public function test_create_connection_with_rdp_encryption_mode(): void
    {
        /** @var GuacamoleClientInterface $client */
        $client = app(GuacamoleClientInterface::class);
        $this->assertInstanceOf(GuacamoleClient::class, $client);

        $ip = '192.168.100.166';
        $protocol = 'rdp';
        $name = 'ad-hoc-rdp-encrypted-' . now()->format('YmdHis');

        // Use same ad-hoc credentials supplied earlier
        $username = 'abdelazeezbrhomi';
        $password = 'oiokolo;op';

        $params = [
            'name' => $name,
            'protocol' => $protocol,
            'parameters' => [
                'hostname' => $ip,
                'port' => '3389',
                'username' => $username,
                'password' => $password,
                // Explicitly request RDP encryption mode
                'security' => 'rdp',
                'ignore-cert' => 'false',
            ],
        ];

        $connectionId = $client->createConnection($params);
        $this->assertNotEmpty($connectionId);

        $token = $client->generateAuthToken($connectionId, (int) config('guacamole.connection.token_expiration_seconds', 300));
        $this->assertNotEmpty($token);

        $dataSource = $client->getDataSource();
        $clientId = base64_encode($connectionId . "\0c\0" . $dataSource);
        $viewerUrl = config('guacamole.url') . '/#/client/' . $clientId . '?token=' . $token;

        fwrite(STDOUT, "\nGuacamole viewer URL (RDP encryption mode):\n{$viewerUrl}\n");

        $this->assertTrue(true);
    }
}
