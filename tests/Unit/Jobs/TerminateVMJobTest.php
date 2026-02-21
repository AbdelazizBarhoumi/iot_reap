<?php

namespace Tests\Unit\Jobs;

use App\Enums\VMSessionStatus;
use App\Enums\VMSessionType;
use App\Jobs\TerminateVMJob;
use App\Models\ProxmoxNode;
use App\Models\ProxmoxServer;
use App\Models\User;
use App\Models\VMSession;
use App\Models\VMTemplate;
use App\Services\GuacamoleClientFake;
use App\Services\GuacamoleClientInterface;
use App\Services\ProxmoxClientFake;
use App\Services\ProxmoxClientInterface;
use Tests\TestCase;

/**
 * Unit tests for session termination job.
 * Tests the order of operations: Guacamole delete first, then VM cleanup.
 */
class TerminateVMJobTest extends TestCase
{
    private User $user;
    private VMSession $session;
    private ProxmoxClientFake $proxmoxClient;
    private GuacamoleClientFake $guacamoleClient;

    protected function setUp():void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        $server = ProxmoxServer::factory()->create();
        $node = ProxmoxNode::factory()->create();
        $template = VMTemplate::factory()->create();

        $this->proxmoxClient = new ProxmoxClientFake($server);
        $this->guacamoleClient = new GuacamoleClientFake();

        // Pre-register a VM in the fake client for testing
        $this->proxmoxClient->registerVM($node->name, 100, 'running');

        // Pre-create a Guacamole connection for testing
        $connId = $this->guacamoleClient->createConnection([
            'name' => 'test-connection',
            'protocol' => 'rdp',
        ]);

        $this->session = VMSession::factory()->create([
            'user_id' => $this->user->id,
            'template_id' => $template->id,
            'node_id' => $node->id,
            'status' => VMSessionStatus::ACTIVE,
            'session_type' => VMSessionType::EPHEMERAL,
            'vm_id' => 100,
            'guacamole_connection_id' => $connId,
            'expires_at' => now()->addHours(1),
        ]);

        $this->app->instance(ProxmoxClientInterface::class, $this->proxmoxClient);
        $this->app->instance(GuacamoleClientInterface::class, $this->guacamoleClient);
    }

    public function test_terminate_deletes_guacamole_connection(): void
    {
        $connectionId = (string)$this->session->guacamole_connection_id;

        $job = new TerminateVMJob(
            session: $this->session,
            stopVm: true,
            returnSnapshot: null,
        );

        $job->handle($this->guacamoleClient, $this->proxmoxClient);

        // Verify Guacamole connection was deleted (won't throw "not found" error)
        try {
            $this->guacamoleClient->getConnection($connectionId);
            $this->fail('Connection should have been deleted');
        } catch (\Exception $e) {
            $this->assertStringContainsString('not found', $e->getMessage());
        }
    }

    public function test_terminate_ephemeral_deletes_vm(): void
    {
        $this->session->update(['session_type' => VMSessionType::EPHEMERAL]);

        $job = new TerminateVMJob(
            session: $this->session,
            stopVm: true,
            returnSnapshot: null,
        );

        $job->handle($this->guacamoleClient, $this->proxmoxClient);

        // Verify VM was deleted (not found in created VMs or has null status)
        $vms = $this->proxmoxClient->getCreatedVMs();
        $nodeVMs = $vms[$this->session->node->name] ?? [];
        
        $foundVM = collect($nodeVMs)->first(fn($vm) => $vm['vmid'] === $this->session->vm_id);
        $this->assertNull($foundVM, 'Ephemeral VM should have been deleted');
    }

    public function test_terminate_persistent_stops_vm(): void
    {
        $this->session->update(['session_type' => VMSessionType::PERSISTENT]);

        $job = new TerminateVMJob(
            session: $this->session,
            stopVm: true,
            returnSnapshot: null,
        );

        $job->handle($this->guacamoleClient, $this->proxmoxClient);

        // Verify VM was stopped (still exists but status is stopped)
        $vms = $this->proxmoxClient->getCreatedVMs();
        $nodeVMs = $vms[$this->session->node->name] ?? [];
        
        $foundVM = collect($nodeVMs)->first(fn($vm) => $vm['vmid'] === $this->session->vm_id);
        $this->assertNotNull($foundVM, 'Persistent VM should still exist');
        $this->assertEquals('stopped', $foundVM['status'], 'Persistent VM should be stopped');
    }

    public function test_terminate_skips_vm_operations_when_stop_vm_false(): void
    {
        $job = new TerminateVMJob(
            session: $this->session,
            stopVm: false, // Don't stop/delete
            returnSnapshot: null,
        );

        $job->handle($this->guacamoleClient, $this->proxmoxClient);

        // Verify Guacamole was still deleted (always done first)
        $this->assertCount(0, $this->guacamoleClient->getAllConnections());

        // Verify VM was NOT deleted or stopped - should still be running
        $vms = $this->proxmoxClient->getCreatedVMs();
        $nodeVMs = $vms[$this->session->node->name] ?? [];
        
        $foundVM = collect($nodeVMs)->first(fn($vm) => $vm['vmid'] === $this->session->vm_id);
        $this->assertNotNull($foundVM, 'VM should not have been deleted');
        $this->assertEquals('running', $foundVM['status'], 'VM should still be running');
    }

    public function test_terminate_marks_session_as_expired(): void
    {
        $job = new TerminateVMJob(
            session: $this->session,
            stopVm: true,
            returnSnapshot: null,
        );

        $job->handle($this->guacamoleClient, $this->proxmoxClient);

        $this->session->refresh();
        $this->assertEquals(VMSessionStatus::EXPIRED, $this->session->status);
    }

    public function test_terminate_skips_if_session_already_expired(): void
    {
        $this->session->update(['status' => VMSessionStatus::EXPIRED]);

        $job = new TerminateVMJob(
            session: $this->session,
            stopVm: true,
            returnSnapshot: null,
        );

        // Should not throw, should skip processing
        $job->handle($this->guacamoleClient, $this->proxmoxClient);

        // Nothing should be deleted
        $this->assertCount(1, $this->guacamoleClient->getAllConnections(), 'Guacamole connection should not be deleted');
        $vms = $this->proxmoxClient->getCreatedVMs($this->session->node->name);
        $this->assertTrue(count($vms) > 0, 'VM should not be deleted');
    }

    public function test_terminate_handles_no_guacamole_connection(): void
    {
        $this->session->update(['guacamole_connection_id' => null]);

        $job = new TerminateVMJob(
            session: $this->session,
            stopVm: true,
            returnSnapshot: null,
        );

        // Should not throw, should continue to VM cleanup
        $job->handle($this->guacamoleClient, $this->proxmoxClient);

        // VM should still be cleaned up (deleted for ephemeral)
        $vms = $this->proxmoxClient->getCreatedVMs();
        $nodeVMs = $vms[$this->session->node->name] ?? [];
        
        $foundVM = collect($nodeVMs)->first(fn($vm) => $vm['vmid'] === $this->session->vm_id);
        $this->assertNull($foundVM, 'VM should have been deleted');
    }

    public function test_terminate_handles_no_vm_id(): void
    {
        $this->session->update(['vm_id' => null]);

        $job = new TerminateVMJob(
            session: $this->session,
            stopVm: true,
            returnSnapshot: null,
        );

        // Should not throw, should skip VM operations
        $job->handle($this->guacamoleClient, $this->proxmoxClient);

        // Guacamole should still be deleted
        $this->assertCount(0, $this->guacamoleClient->getAllConnections());

        // No VM operations should happen - we don't test anything about VMs
    }

    public function test_terminate_accepts_return_snapshot_parameter(): void
    {
        $snapshotName = 'snap-session-123-initial';

        $job = new TerminateVMJob(
            session: $this->session,
            stopVm: true,
            returnSnapshot: $snapshotName,
        );

        // Should not throw even though snapshot methods aren't implemented yet
        $job->handle($this->guacamoleClient, $this->proxmoxClient);

        // Should still clean up normally
        $this->assertCount(0, $this->guacamoleClient->getAllConnections());
        
        $vms = $this->proxmoxClient->getCreatedVMs();
        $nodeVMs = $vms[$this->session->node->name] ?? [];
        
        $foundVM = collect($nodeVMs)->first(fn($vm) => $vm['vmid'] === $this->session->vm_id);
        $this->assertNull($foundVM, 'Ephemeral VM should have been deleted');
    }

    public function test_guacamole_deletion_failures_prevent_vm_cleanup(): void
    {
        // Make Guacamole client throw an exception
        $failingClient = $this->createMock(GuacamoleClientInterface::class);
        $failingClient->method('deleteConnection')
                     ->willThrowException(new \Exception('Guacamole API error'));

        $this->app->instance(GuacamoleClientInterface::class, $failingClient);

        $job = new TerminateVMJob(
            session: $this->session,
            stopVm: true,
            returnSnapshot: null,
        );

        // Job should rethrow Guacamole errors
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Guacamole API error');

        $job->handle($failingClient, $this->proxmoxClient);
    }

    public function test_vm_cleanup_failures_after_guacamole_deletion(): void
    {
        // Make Proxmox client throw an exception
        $failingClient = $this->createMock(ProxmoxClientInterface::class);
        $failingClient->method('deleteVM')
                     ->willThrowException(new \Exception('Proxmox API error'));

        $job = new TerminateVMJob(
            session: $this->session,
            stopVm: true,
            returnSnapshot: null,
        );

        // Job should rethrow Proxmox errors (for retry)
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Proxmox API error');

        $job->handle($this->guacamoleClient, $failingClient);
    }
}
