<?php

namespace Tests\Unit\Jobs;

use App\Enums\ProxmoxNodeStatus;
use App\Enums\VMSessionStatus;
use App\Jobs\TerminateVMJob;
use App\Models\ProxmoxNode;
use App\Models\ProxmoxServer;
use App\Models\User;
use App\Models\VMSession;
use App\Services\ProxmoxClientFake;
use Mockery;
use Tests\TestCase;

class TerminateVMJobTest extends TestCase
{
    /**
     * Verify the `$stopVm` flag survives serialization/deserialization.
     */
    public function test_stop_vm_flag_survives_serialization(): void
    {
        $session = VMSession::factory()->create();

        // Reflect to ensure default property values are set at the class level.
        // This prevents uninitialized property errors when an old payload lacking
        // the field is unserialized.
        $defaults = (new \ReflectionClass(TerminateVMJob::class))->getDefaultProperties();
        $this->assertArrayHasKey('stopVm', $defaults);
        $this->assertFalse($defaults['stopVm']);
        $this->assertArrayHasKey('returnSnapshot', $defaults);
        $this->assertNull($defaults['returnSnapshot']);

        $job = new TerminateVMJob($session); // default should be false

        $serialized   = serialize($job);
        $unserialized = unserialize($serialized);

        $this->assertInstanceOf(TerminateVMJob::class, $unserialized);
        $this->assertFalse($unserialized->shouldStopVm(), 'default flag should remain false');

        $jobWithTrue = new TerminateVMJob($session, true);
        $this->assertTrue($jobWithTrue->shouldStopVm(), 'constructor parameter respected');

        $serializedTrue   = serialize($jobWithTrue);
        $unserializedTrue = unserialize($serializedTrue);
        $this->assertTrue($unserializedTrue->shouldStopVm(), 'flag remains true after unserialize');
    }

    /**
     * The job should not stop the VM when the flag is false; the guest stays running.
     */
    public function test_handle_leaves_vm_running_when_flag_false(): void
    {
        // prepare fake Proxmox environment
        $server = ProxmoxServer::factory()->create();
        $node   = ProxmoxNode::factory()->create(['status' => ProxmoxNodeStatus::ONLINE]);

        $session = VMSession::factory()->create([
            'user_id' => User::factory()->create()->id,
            'node_id' => $node->id,
            'status'  => VMSessionStatus::ACTIVE,
            'vm_id'   => 123,
            'guacamole_connection_id' => null,
        ]);

        $client = new ProxmoxClientFake($server);
        // register and start a VM with the same ID
        $client->cloneTemplate(100, $node->name, 123);
        $client->startVM($node->name, 123);

        $guac = Mockery::mock(\App\Services\GuacamoleClientInterface::class);
        $guac->shouldReceive('deleteConnection')->never();

        $job = new TerminateVMJob($session, false);
        $job->handle($guac, $client);

        $status = $client->getVMStatus($node->name, 123);
        $this->assertSame('running', $status['status']);

        $session->refresh();
        $this->assertSame(VMSessionStatus::EXPIRED, $session->status);
    }

    /**
     * When the stop flag is true, the job should power off the VM.
     */
    public function test_handle_stops_vm_when_flag_true(): void
    {
        $server = ProxmoxServer::factory()->create();
        $node   = ProxmoxNode::factory()->create(['status' => ProxmoxNodeStatus::ONLINE]);

        $session = VMSession::factory()->create([
            'user_id' => User::factory()->create()->id,
            'node_id' => $node->id,
            'status'  => VMSessionStatus::ACTIVE,
            'vm_id'   => 456,
            'guacamole_connection_id' => null,
        ]);

        $client = new ProxmoxClientFake($server);
        $client->cloneTemplate(100, $node->name, 456);
        $client->startVM($node->name, 456);

        $guac = Mockery::mock(\App\Services\GuacamoleClientInterface::class);
        $guac->shouldReceive('deleteConnection')->never();

        $job = new TerminateVMJob($session, true);
        $job->handle($guac, $client);

        $status = $client->getVMStatus($node->name, 456);
        $this->assertSame('stopped', $status['status']);

        $session->refresh();
        $this->assertSame(VMSessionStatus::EXPIRED, $session->status);
    }
}
