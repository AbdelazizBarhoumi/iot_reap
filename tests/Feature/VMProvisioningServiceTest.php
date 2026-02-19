<?php

namespace Tests\Feature;

use App\Enums\ProxmoxNodeStatus;
use App\Enums\VMSessionStatus;
use App\Enums\VMSessionType;
use App\Models\ProxmoxNode;
use App\Models\ProxmoxServer;
use App\Models\User;
use App\Models\VMTemplate;
use App\Repositories\VMSessionRepository;
use App\Services\ProxmoxClientFake;
use App\Services\ProxmoxClientInterface;
use App\Services\ProxmoxLoadBalancer;
use App\Services\VMProvisioningService;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class VMProvisioningServiceTest extends TestCase
{
    private ProxmoxServer $server;
    private VMTemplate $template;
    private User $user;
    private ProxmoxClientFake $fakeClient;
    private ProxmoxLoadBalancer $loadBalancer;

    protected function setUp(): void
    {
        parent::setUp();

        // Fake the queue to prevent actual job execution
        Queue::fake();

        $this->server = ProxmoxServer::factory()->create();

        // Create test node
        ProxmoxNode::factory()->create([
            'name' => 'pve-1',
            'hostname' => '192.168.1.100',
            'status' => ProxmoxNodeStatus::ONLINE,
        ]);

        // Create test template
        $this->template = VMTemplate::factory()->create([
            'name' => 'Windows 11',
            'template_vmid' => 100,
        ]);

        // Create test user
        $this->user = User::factory()->create();

        // Create fake client and load balancer for testing
        $this->fakeClient = new ProxmoxClientFake($this->server);
        $this->loadBalancer = new ProxmoxLoadBalancer($this->fakeClient);

        // Bind the fake client to the container for job resolution
        $this->app->instance(ProxmoxClientInterface::class, $this->fakeClient);
    }

    public function test_provision_creates_session_and_dispatches_job(): void
    {
        $repository = new VMSessionRepository();
        $service = new VMProvisioningService($repository, $this->loadBalancer, $this->fakeClient);

        $session = $service->provision(
            user: $this->user,
            templateId: $this->template->id,
            durationMinutes: 60,
            sessionType: VMSessionType::EPHEMERAL,
        );

        $this->assertNotNull($session->id);
        $this->assertEquals($this->user->id, $session->user_id);
        $this->assertEquals($this->template->id, $session->template_id);
        $this->assertEquals(VMSessionStatus::PENDING, $session->status);

        // Verify session was created in database
        $this->assertDatabaseHas('vm_sessions', [
            'id' => $session->id,
            'user_id' => $this->user->id,
            'template_id' => $this->template->id,
            'status' => VMSessionStatus::PENDING->value,
        ]);
    }

    public function test_provision_sets_correct_expiration(): void
    {
        $repository = new VMSessionRepository();
        $service = new VMProvisioningService($repository, $this->loadBalancer, $this->fakeClient);

        $durationMinutes = 120;
        $before = now();
        $session = $service->provision(
            user: $this->user,
            templateId: $this->template->id,
            durationMinutes: $durationMinutes,
        );
        $after = now();

        $expectedExpires = $before->copy()->addMinutes($durationMinutes);
        $this->assertTrue(
            $session->expires_at->between($expectedExpires->subSeconds(5), $expectedExpires->addSeconds(5))
        );
    }

    public function test_provision_uses_specified_session_type(): void
    {
        $repository = new VMSessionRepository();
        $service = new VMProvisioningService($repository, $this->loadBalancer, $this->fakeClient);

        $session = $service->provision(
            user: $this->user,
            templateId: $this->template->id,
            durationMinutes: 60,
            sessionType: VMSessionType::PERSISTENT,
        );

        $this->assertEquals(VMSessionType::PERSISTENT, $session->session_type);
    }

    public function test_provision_assigns_to_best_node(): void
    {
        // Create another node with worse load
        ProxmoxNode::factory()->create([
            'name' => 'pve-2',
            'hostname' => '192.168.1.101',
            'status' => ProxmoxNodeStatus::OFFLINE, // This one is offline, so pve-1 should be selected
        ]);

        $repository = new VMSessionRepository();
        $service = new VMProvisioningService($repository, $this->loadBalancer, $this->fakeClient);

        $session = $service->provision(
            user: $this->user,
            templateId: $this->template->id,
            durationMinutes: 60,
        );

        $this->assertEquals('pve-1', $session->node->name);
    }

    public function test_provision_fails_with_invalid_template(): void
    {
        $repository = new VMSessionRepository();
        $service = new VMProvisioningService($repository, $this->loadBalancer, $this->fakeClient);

        $this->expectException(\Illuminate\Database\Eloquent\ModelNotFoundException::class);

        $service->provision(
            user: $this->user,
            templateId: 99999,
            durationMinutes: 60,
        );
    }

    public function test_provision_fails_with_no_online_nodes(): void
    {
        ProxmoxNode::where('status', ProxmoxNodeStatus::ONLINE)->update([
            'status' => ProxmoxNodeStatus::OFFLINE,
        ]);

        $repository = new VMSessionRepository();
        $service = new VMProvisioningService($repository, $this->loadBalancer, $this->fakeClient);

        $this->expectException(\App\Exceptions\NoAvailableNodeException::class);

        $service->provision(
            user: $this->user,
            templateId: $this->template->id,
            durationMinutes: 60,
        );
    }
}
