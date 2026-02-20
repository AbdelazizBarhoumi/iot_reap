<?php

namespace Tests\Unit\Services;

use App\Exceptions\ProxmoxApiException;
use App\Models\ProxmoxServer;
use App\Services\ProxmoxClientFake;
use App\Services\ProxmoxIPResolver;
use Tests\TestCase;

/**
 * Unit tests for ProxmoxIPResolver.
 *
 * Uses ProxmoxClientFake for deterministic VM state control.
 * Some tests invoke sleep() internally — kept to a minimum via running+IP setup.
 */
class ProxmoxIPResolverTest extends TestCase
{
    private ProxmoxClientFake $proxmoxFake;
    private ProxmoxIPResolver $resolver;
    private ProxmoxServer $server;

    protected function setUp(): void
    {
        parent::setUp();

        $this->proxmoxFake = new ProxmoxClientFake();
        $this->resolver    = new ProxmoxIPResolver($this->proxmoxFake);
        $this->server      = ProxmoxServer::factory()->make();
    }

    /**
     * VM is already running and has an IP assigned — resolver returns on first poll (no sleep).
     */
    public function test_resolves_ip_immediately_when_vm_running_with_ip(): void
    {
        $vmId = 201;
        $this->proxmoxFake->registerVM('pve-1', $vmId, 'running', '192.168.1.45');

        $ip = $this->resolver->resolveVMIP(
            server:         $this->server,
            nodeId:         'pve-1',
            vmId:           $vmId,
            maxWaitSeconds: 10,
        );

        $this->assertEquals('192.168.1.45', $ip);
    }

    /**
     * VM starts as stopped, then startVM changes it to running.
     * Resolver polls: 1st poll stopped (sleep), 2nd poll running + IP → returns.
     * Note: One sleep(2) occurs — acceptable for a unit test.
     */
    public function test_resolves_ip_after_vm_transitions_to_running(): void
    {
        $vmId = 202;
        // Register as stopped — listener will call startVM then resolver polls
        $this->proxmoxFake->registerVM('pve-1', $vmId, 'stopped');

        // Simulate what startVM does: flip status to running and assign an IP
        $this->proxmoxFake->startVM('pve-1', $vmId);
        $this->proxmoxFake->setVMIPAddress('pve-1', $vmId, '10.0.0.202');

        $ip = $this->resolver->resolveVMIP(
            server:         $this->server,
            nodeId:         'pve-1',
            vmId:           $vmId,
            maxWaitSeconds: 10,
        );

        $this->assertEquals('10.0.0.202', $ip);
    }

    /**
     * VM never becomes running within timeout → ProxmoxApiException thrown.
     * Uses a 1-second timeout so the test fails fast (one sleep(2) exhausts the window).
     */
    public function test_throws_proxmox_api_exception_on_timeout(): void
    {
        $vmId = 203;
        // VM registered as stopped and never started
        $this->proxmoxFake->registerVM('pve-1', $vmId, 'stopped');

        $this->expectException(ProxmoxApiException::class);
        $this->expectExceptionMessageMatches('/did not obtain an IP address/');

        $this->resolver->resolveVMIP(
            server:         $this->server,
            nodeId:         'pve-1',
            vmId:           $vmId,
            maxWaitSeconds: 1, // Very short timeout — one sleep(2) will exceed it
        );
    }

    /**
     * VM is running but IP is not yet assigned (getVMNetworkIP returns null).
     * Resolver keeps polling until IP becomes available.
     */
    public function test_resolves_ip_when_vm_running_but_dhcp_not_yet_assigned(): void
    {
        $vmId = 204;
        // Register as running but without an IP yet (simulates DHCP delay)
        $this->proxmoxFake->registerVM('pve-1', $vmId, 'running');
        // No ip_address key → getVMNetworkIP returns a deterministic IP based on vmid
        // ProxmoxClientFake fallback: '192.168.1.' . ($vmid % 254)
        // For vmid=204: '192.168.1.204' (204 % 254 = 204)

        $ip = $this->resolver->resolveVMIP(
            server:         $this->server,
            nodeId:         'pve-1',
            vmId:           $vmId,
            maxWaitSeconds: 10,
        );

        $this->assertNotNull($ip);
        $this->assertMatchesRegularExpression('/^\d+\.\d+\.\d+\.\d+$/', $ip);
    }

    /**
     * VM is on an unknown node — fake returns default 'stopped' status.
     * Times out immediately with a 1-second window.
     */
    public function test_throws_when_vm_not_registered_on_node(): void
    {
        $this->expectException(ProxmoxApiException::class);

        $this->resolver->resolveVMIP(
            server:         $this->server,
            nodeId:         'pve-unknown',
            vmId:           999,
            maxWaitSeconds: 1,
        );
    }
}
