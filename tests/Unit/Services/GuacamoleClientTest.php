<?php

namespace Tests\Unit\Services;

use App\Exceptions\GuacamoleApiException;
use App\Services\GuacamoleClient;
use App\Services\GuacamoleClientFake;
use Illuminate\Support\Facades\Http;
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

    public function test_real_client_retries_after_403_token_failure(): void
    {
        // simulate first createConnection attempt failing with 403,
        // then succeeding after a fresh auth token is fetched.
        Http::fakeSequence()
            // initial auth request
            ->push(['authToken' => 'first-token', 'dataSource' => 'mysql'], 200)
            // connection creation returns 403 permission denied
            ->push(['message' => 'Permission Denied'], 403)
            // second auth request after clearing token
            ->push(['authToken' => 'second-token', 'dataSource' => 'mysql'], 200)
            // successful connection creation
            ->push(['identifier' => 'new-id'], 200);

        $client = new GuacamoleClient();
        $result = $client->createConnection(['name' => 'retry-test', 'protocol' => 'rdp']);

        $this->assertEquals('new-id', $result);

        // confirm that two auth requests were triggered
        $this->assertCount(2, Http::recorded(function ($request) {
            return str_contains($request->url(), '/api/tokens');
        }));
    }

    public function test_generate_auth_token_retry_on_403(): void
    {
        Http::fakeSequence()
            // initial auth request returns 403 directly when generateAuthToken is called;
            // since generateAuthToken uses withAuthRetry which calls getAuthToken,
            // the failing response will trigger a retry.
            ->push([], 403)
            ->push(['authToken' => 'renewed', 'dataSource' => 'mysql'], 200);

        $client = new GuacamoleClient();
        $token = $client->generateAuthToken('whatever', 100);

        $this->assertEquals('renewed', $token);
    }
}
