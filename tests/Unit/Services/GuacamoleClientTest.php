<?php

namespace Tests\Unit\Services;

use App\Exceptions\GuacamoleApiException;
use App\Services\GuacamoleClient;
use App\Services\GuacamoleClientFake;
use Tests\TestCase;

class GuacamoleClientTest extends TestCase
{
    public function test_fake_creates_connection(): void
    {
        $client = new GuacamoleClientFake();

        $connectionId = $client->createConnection([
            'name' => 'test-connection',
            'protocol' => 'rdp',
            'parameters' => ['hostname' => 'example.com'],
        ]);

        $this->assertNotEmpty($connectionId);
    }

    public function test_fake_generates_auth_token(): void
    {
        $client = new GuacamoleClientFake();

        $connectionId = $client->createConnection([
            'name' => 'test-connection',
            'protocol' => 'rdp',
        ]);

        $token = $client->generateAuthToken($connectionId, 300);

        $this->assertNotEmpty($token);
        $this->assertStringStartsWith('fake_token_', $token);
    }

    public function test_fake_deletes_connection(): void
    {
        $client = new GuacamoleClientFake();

        $connectionId = $client->createConnection([
            'name' => 'test-connection',
            'protocol' => 'rdp',
        ]);

        $client->deleteConnection($connectionId);

        // Verify connection is gone by attempting to get it
        $this->expectException(GuacamoleApiException::class);
        $client->getConnection($connectionId);
    }

    public function test_fake_throws_when_deleting_nonexistent_connection(): void
    {
        $client = new GuacamoleClientFake();

        $this->expectException(GuacamoleApiException::class);
        $client->deleteConnection('nonexistent-id');
    }

    public function test_fake_throws_when_generating_token_for_nonexistent_connection(): void
    {
        $client = new GuacamoleClientFake();

        $this->expectException(GuacamoleApiException::class);
        $client->generateAuthToken('nonexistent-id', 300);
    }

    public function test_fake_gets_connection_details(): void
    {
        $client = new GuacamoleClientFake();

        $connectionId = $client->createConnection([
            'name' => 'test-connection',
            'protocol' => 'rdp',
            'parameters' => ['hostname' => 'example.com'],
        ]);

        $details = $client->getConnection($connectionId);

        $this->assertEquals($connectionId, $details['identifier']);
        $this->assertEquals('test-connection', $details['name']);
        $this->assertEquals('rdp', $details['protocol']);
    }

    public function test_fake_can_simulate_failures(): void
    {
        $client = new GuacamoleClientFake();
        $client->setFailCreateConnection(true);

        $this->expectException(GuacamoleApiException::class);
        $client->createConnection(['name' => 'test']);
    }

    public function test_fake_can_be_reset(): void
    {
        $client = new GuacamoleClientFake();

        $connectionId = $client->createConnection(['name' => 'test']);
        $this->assertNotEmpty($client->getAllConnections());

        $client->resetAll();

        $this->assertEmpty($client->getAllConnections());
    }
}
