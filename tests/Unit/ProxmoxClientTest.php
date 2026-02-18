<?php

namespace Tests\Unit;

use App\Exceptions\ProxmoxApiException;
use App\Services\ProxmoxClient;
use App\Services\ProxmoxClientFake;
use Tests\TestCase;

class ProxmoxClientTest extends TestCase
{
    /**
     * Test that ProxmoxClientFake can return mocked nodes.
     */
    public function test_proxmox_client_fake_returns_nodes(): void
    {
        $fake = new ProxmoxClientFake();

        $nodes = $fake->getNodes();

        $this->assertIsArray($nodes);
        $this->assertNotEmpty($nodes);
        $this->assertArrayHasKey('node', $nodes[0]);
    }

    /**
     * Test that ProxmoxClientFake can be configured to fail.
     */
    public function test_proxmox_client_fake_can_be_configured_to_fail(): void
    {
        $fake = new ProxmoxClientFake();
        $fake->fail('Test error');

        $this->expectException(ProxmoxApiException::class);

        $fake->getNodes();
    }

    /**
     * Test that ProxmoxClientFake can return custom stubbed responses.
     */
    public function test_proxmox_client_fake_can_return_stubbed_responses(): void
    {
        $fake = new ProxmoxClientFake();
        $customVmid = 12345;

        $fake->stub('cloneTemplate', $customVmid);

        $result = $fake->cloneTemplate(100, 'node-1', '200', 'test-vm');

        $this->assertEquals($customVmid, $result);
    }

    /**
     * Test that ProxmoxClientFake can be reset.
     */
    public function test_proxmox_client_fake_can_be_reset(): void
    {
        $fake = new ProxmoxClientFake();
        $fake->fail('Test error');

        $this->expectException(ProxmoxApiException::class);
        $fake->getNodes();

        $fake->reset();

        // Should not throw after reset
        $nodes = $fake->getNodes();
        $this->assertIsArray($nodes);
    }

    /**
     * Test that ProxmoxApiException can be created from Proxmox error.
     */
    public function test_proxmox_api_exception_from_proxmox_error(): void
    {
        $exception = ProxmoxApiException::fromProxmoxError('Test error message');

        $this->assertInstanceOf(ProxmoxApiException::class, $exception);
        $this->assertStringContainsString('Test error message', $exception->getMessage());
    }

    /**
     * Test that ProxmoxApiException can be created from network error.
     */
    public function test_proxmox_api_exception_from_network_error(): void
    {
        $previous = new \Exception('Connection refused');
        $exception = ProxmoxApiException::fromNetworkError('Network error', $previous);

        $this->assertInstanceOf(ProxmoxApiException::class, $exception);
        $this->assertStringContainsString('Network error', $exception->getMessage());
    }

    /**
     * Test that ProxmoxApiException identifies retryable errors.
     */
    public function test_proxmox_api_exception_identifies_retryable_errors(): void
    {
        $retryableException = new ProxmoxApiException('Too many requests', 429);
        $nonRetryableException = new ProxmoxApiException('Not found', 404);

        $this->assertTrue($retryableException->isRetryable());
        $this->assertFalse($nonRetryableException->isRetryable());
    }
}
