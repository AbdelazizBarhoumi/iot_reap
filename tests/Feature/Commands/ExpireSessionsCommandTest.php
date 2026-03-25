<?php

namespace Tests\Feature\Commands;

use App\Enums\VMSessionStatus;
use App\Jobs\TerminateVMJob;
use App\Models\ProxmoxNode;
use App\Models\ProxmoxServer;
use App\Models\User;
use App\Models\VMSession;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class ExpireSessionsCommandTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private ProxmoxServer $server;

    private ProxmoxNode $node;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->server = ProxmoxServer::factory()->create(['is_active' => true]);
        $this->node = ProxmoxNode::factory()->create([
            'proxmox_server_id' => $this->server->id,
        ]);
    }

    public function test_expires_overdue_active_sessions(): void
    {
        Queue::fake();

        // Create an overdue session (expired 5 minutes ago)
        $overdueSession = VMSession::factory()->create([
            'user_id' => $this->user->id,
            'proxmox_server_id' => $this->server->id,
            'node_id' => $this->node->id,
            'vm_id' => 100,
            'status' => VMSessionStatus::ACTIVE,
            'expires_at' => now()->subMinutes(5),
        ]);

        $this->artisan('sessions:expire')
            ->expectsOutput('Found 1 overdue session(s).')
            ->assertSuccessful();

        Queue::assertPushed(TerminateVMJob::class, function ($job) use ($overdueSession) {
            return $job->getSession()->id === $overdueSession->id;
        });
    }

    public function test_does_not_expire_future_sessions(): void
    {
        Queue::fake();

        // Create a session that expires in the future
        VMSession::factory()->create([
            'user_id' => $this->user->id,
            'proxmox_server_id' => $this->server->id,
            'node_id' => $this->node->id,
            'vm_id' => 100,
            'status' => VMSessionStatus::ACTIVE,
            'expires_at' => now()->addHour(),
        ]);

        $this->artisan('sessions:expire')
            ->expectsOutput('No overdue sessions to expire.')
            ->assertSuccessful();

        Queue::assertNotPushed(TerminateVMJob::class);
    }

    public function test_does_not_expire_already_expired_sessions(): void
    {
        Queue::fake();

        // Create a session that is already marked as expired
        VMSession::factory()->create([
            'user_id' => $this->user->id,
            'proxmox_server_id' => $this->server->id,
            'node_id' => $this->node->id,
            'vm_id' => 100,
            'status' => VMSessionStatus::EXPIRED,
            'expires_at' => now()->subMinutes(5),
        ]);

        $this->artisan('sessions:expire')
            ->expectsOutput('No overdue sessions to expire.')
            ->assertSuccessful();

        Queue::assertNotPushed(TerminateVMJob::class);
    }

    public function test_dry_run_does_not_dispatch_jobs(): void
    {
        Queue::fake();

        // Create an overdue session
        $overdueSession = VMSession::factory()->create([
            'user_id' => $this->user->id,
            'proxmox_server_id' => $this->server->id,
            'node_id' => $this->node->id,
            'vm_id' => 100,
            'status' => VMSessionStatus::ACTIVE,
            'expires_at' => now()->subMinutes(5),
        ]);

        $this->artisan('sessions:expire', ['--dry-run' => true])
            ->expectsOutput('Found 1 overdue session(s).')
            ->expectsOutput('DRY RUN — no changes will be made.')
            ->assertSuccessful();

        Queue::assertNotPushed(TerminateVMJob::class);

        // Session should still be active
        $overdueSession->refresh();
        $this->assertSame(VMSessionStatus::ACTIVE, $overdueSession->status);
    }

    public function test_handles_multiple_overdue_sessions(): void
    {
        Queue::fake();

        // Create multiple overdue sessions
        $session1 = VMSession::factory()->create([
            'user_id' => $this->user->id,
            'proxmox_server_id' => $this->server->id,
            'node_id' => $this->node->id,
            'vm_id' => 100,
            'status' => VMSessionStatus::ACTIVE,
            'expires_at' => now()->subMinutes(10),
        ]);

        $session2 = VMSession::factory()->create([
            'user_id' => $this->user->id,
            'proxmox_server_id' => $this->server->id,
            'node_id' => $this->node->id,
            'vm_id' => 101,
            'status' => VMSessionStatus::ACTIVE,
            'expires_at' => now()->subMinutes(5),
        ]);

        // Also create one that shouldn't be expired
        VMSession::factory()->create([
            'user_id' => $this->user->id,
            'proxmox_server_id' => $this->server->id,
            'node_id' => $this->node->id,
            'vm_id' => 102,
            'status' => VMSessionStatus::ACTIVE,
            'expires_at' => now()->addHour(),
        ]);

        $this->artisan('sessions:expire')
            ->expectsOutput('Found 2 overdue session(s).')
            ->expectsOutput('Dispatched cleanup for 2 session(s).')
            ->assertSuccessful();

        Queue::assertPushed(TerminateVMJob::class, 2);
    }
}
