<?php

namespace Tests\Feature;

use App\Enums\ProxmoxNodeStatus;
use App\Enums\VMSessionStatus;
use App\Models\ProxmoxNode;
use App\Models\ProxmoxServer;
use App\Models\User;
use App\Models\VMSession;
use App\Services\GuacamoleClientInterface;
use App\Services\ProxmoxClientFake;
use App\Services\ProxmoxClientInterface;
use Tests\TestCase;

class VMSessionControllerTest extends TestCase
{
    private User $user;
    private ProxmoxServer $server;
    // no template needed
    private ProxmoxNode $node;
    private ProxmoxClientFake $proxmoxFake;

    protected function setUp(): void
    {
        parent::setUp();

        // Create and bind the fake ProxmoxClient as a singleton so tests
        // can register VMs before requests.
        $this->proxmoxFake = new ProxmoxClientFake();
        $this->app->instance(ProxmoxClientInterface::class, $this->proxmoxFake);

        // Mock GuacamoleClient — the sync listener now calls it during
        // the HTTP request, so it must not hit the real Guacamole server.
        $guacMock = \Mockery::mock(GuacamoleClientInterface::class);
        $guacMock->shouldReceive('createConnection')->andReturn('fake-conn-1');
        $guacMock->shouldReceive('deleteConnection')->andReturn(null);
        $guacMock->shouldReceive('generateAuthToken')->andReturn('fake-token');
        $guacMock->shouldReceive('getConnection')->andReturn([]);
        $guacMock->shouldReceive('getDataSource')->andReturn('mysql');
        $guacMock->shouldReceive('clearAuthToken')->andReturn(null);
        $this->app->instance(GuacamoleClientInterface::class, $guacMock);

        $this->user = User::factory()->create();
        $this->server = ProxmoxServer::factory()->create();

        // Associate node with a server so controller logic can retrieve proxmox_server_id
        $this->node = ProxmoxNode::factory()->create([
            'status' => ProxmoxNodeStatus::ONLINE,
            'proxmox_server_id' => $this->server->id,
        ]);

    }

    public function test_unauthenticated_user_cannot_access_sessions(): void
    {
        $response = $this->getJson('/sessions');
        $response->assertUnauthorized();
    }

    public function test_authenticated_user_can_list_sessions(): void
    {
        $session = VMSession::factory()->create([
            'user_id' => $this->user->id,
            'node_id' => $this->node->id,
            'vm_id' => 500,
        ]);

        $response = $this->actingAs($this->user)->getJson('/sessions');

        $response->assertOk()
                 ->assertJsonStructure([
                     'data' => [
                         '*' => [
                             'id',
                             'status',
                             'protocol',
                             'node_name',
                             'expires_at',
                             'time_remaining_seconds',
                             'guacamole_url',
                         ],
                     ],
                 ]);

        $this->assertCount(1, $response->json('data'));
    }

    public function test_user_cannot_see_other_users_sessions(): void
    {
        $otherUser = User::factory()->create();

        VMSession::factory()->create([
            'user_id' => $otherUser->id,
            'node_id' => $this->node->id,
            'vm_id' => 124,
        ]);

        $response = $this->actingAs($this->user)->getJson('/sessions');

        $this->assertEmpty($response->json('data'));
    }

    public function test_redirects_when_accessing_expired_session(): void
    {
        $session = VMSession::factory()->create([
            'user_id' => $this->user->id,
            'node_id' => $this->node->id,
            'status' => VMSessionStatus::EXPIRED,
        ]);

        // browser request should be bounced to dashboard
        $response = $this->actingAs($this->user)->get('/sessions/' . $session->id);
        $response->assertRedirect(route('dashboard'));

        // XHR JSON clients should get 404 so they can handle it gracefully
        $json = $this->actingAs($this->user)->getJson('/sessions/' . $session->id);
        $json->assertNotFound();
    }

    public function test_authenticated_user_can_create_session(): void
    {
        // Register the VM in the fake so the sync listener can resolve its IP
        $this->proxmoxFake->registerVM($this->node->name, 200, 'running', '10.0.0.100');

        $response = $this->actingAs($this->user)->postJson('/sessions', [
            'vmid' => 200,
            'node_id' => $this->node->id,
            'duration_minutes' => 60,
        ]);

        if ($response->status() !== 201) {
            // provide diagnostics in case of validation/exception
            $this->fail('Create session failed with ' . $response->status()
                . ' body: ' . json_encode($response->json()));
        }

        $response->assertCreated()
                 ->assertJsonStructure([
                     'id',
                     'status',
                     'protocol',
                     'node_name',
                     'expires_at',
                     'time_remaining_seconds',
                 ]);

        // Session should be ACTIVE after synchronous activation
        $this->assertDatabaseHas('vm_sessions', [
            'user_id' => $this->user->id,
            'vm_id' => 200,
            'status' => VMSessionStatus::ACTIVE->value,
        ]);
    }

    public function test_authenticated_user_can_create_session_with_snapshot(): void
    {
        // Register the VM in the fake so the sync listener can resolve its IP
        $this->proxmoxFake->registerVM($this->node->name, 201, 'running', '10.0.0.101');

        $response = $this->actingAs($this->user)->postJson('/sessions', [
            'vmid' => 201,
            'node_id' => $this->node->id,
            'duration_minutes' => 45,
            'return_snapshot' => 'snap-123',
        ]);

        if ($response->status() !== 201) {
            $this->fail('Create session with snapshot failed: ' . json_encode($response->json()));
        }

        $response->assertCreated();
        $this->assertDatabaseHas('vm_sessions', [
            'return_snapshot' => 'snap-123',
        ]);
    }

    public function test_create_session_requires_vmid_and_node(): void
    {
        $response = $this->actingAs($this->user)->postJson('/sessions', [
            // missing both vmid and node_id
            'duration_minutes' => 60,
        ]);

        $response->assertUnprocessable()
                 ->assertJsonValidationErrors(['vmid', 'node_id']);
    }

    public function test_create_session_validates_duration_minutes(): void
    {
        $node = ProxmoxNode::factory()->create(['status' => ProxmoxNodeStatus::ONLINE]);

        $response = $this->actingAs($this->user)->postJson('/sessions', [
            'vmid' => 999,
            'node_id' => $node->id,
            'duration_minutes' => 20, // Below minimum
        ]);

        $response->assertUnprocessable()
                 ->assertJsonValidationErrors(['duration_minutes']);
    }

    // the `use_existing` parameter has been removed; validation is handled elsewhere

    public function test_authenticated_user_can_get_session(): void
    {
        $session = VMSession::factory()->create([
            'user_id' => $this->user->id,
            'node_id' => $this->node->id,
            'vm_id' => 400,
        ]);

        $response = $this->actingAs($this->user)->getJson("/sessions/{$session->id}");

        $response->assertOk()
                 ->assertJsonStructure([
                     'id',
                     'status',
                     'protocol',
                     'node_name',
                 ]);
    }

    public function test_user_cannot_get_other_users_session(): void
    {
        $otherUser = User::factory()->create();

        $session = VMSession::factory()->create([
            'user_id' => $otherUser->id,
            'node_id' => $this->node->id,
            'vm_id' => 401,
        ]);

        $response = $this->actingAs($this->user)->getJson("/sessions/{$session->id}");

        $response->assertForbidden();
    }

    public function test_authenticated_user_can_delete_session(): void
    {
        $session = VMSession::factory()->create([
            'user_id' => $this->user->id,
            'node_id' => $this->node->id,
            'vm_id' => 402,
            'status' => VMSessionStatus::ACTIVE,
        ]);

        $response = $this->actingAs($this->user)->deleteJson("/sessions/{$session->id}");

        // Termination is now synchronous — returns 200
        $response->assertOk();

        // Session should be marked as expired after termination
        $session->refresh();
        $this->assertEquals(VMSessionStatus::EXPIRED, $session->status);
    }

    public function test_user_cannot_delete_other_users_session(): void
    {
        $otherUser = User::factory()->create();

        $session = VMSession::factory()->create([
            'user_id' => $otherUser->id,
            'node_id' => $this->node->id,
            'vm_id' => 403,
        ]);

        $response = $this->actingAs($this->user)->deleteJson("/sessions/{$session->id}");

        $response->assertForbidden();
    }

    public function test_guacamole_url_is_null_for_pending_session(): void
    {
        $session = VMSession::factory()->create([
            'user_id' => $this->user->id,
            'node_id' => $this->node->id,
            'status' => VMSessionStatus::PENDING,
        ]);

        $response = $this->actingAs($this->user)->getJson("/sessions/{$session->id}");

        $this->assertNull($response->json('guacamole_url'));
    }

    public function test_guacamole_url_is_present_for_active_session(): void
    {
        $session = VMSession::factory()->create([
            'user_id' => $this->user->id,
            'node_id' => $this->node->id,
            'status' => VMSessionStatus::ACTIVE,
        ]);

        $response = $this->actingAs($this->user)->getJson("/sessions/{$session->id}");

        $this->assertNotNull($response->json('guacamole_url'));
    }

    public function test_response_does_not_expose_internal_fields(): void
    {
        $session = VMSession::factory()->create([
            'user_id' => $this->user->id,
            'node_id' => $this->node->id,
            'vm_id' => 12345,
            'ip_address' => '192.168.1.50',
            'guacamole_connection_id' => 99999,
        ]);

        $response = $this->actingAs($this->user)->getJson("/sessions/{$session->id}");

        // vm_id, vm_ip_address and guacamole_connection_id are intentionally
        // exposed so the dashboard and session pages can display them.
        $this->assertArrayHasKey('vm_id', $response->json());
        $this->assertEquals(12345, $response->json('vm_id'));

        $this->assertArrayHasKey('vm_ip_address', $response->json());
        $this->assertArrayHasKey('guacamole_connection_id', $response->json());
        
        // Verify values are correct
        $this->assertEquals('192.168.1.50', $response->json('vm_ip_address'));
        $this->assertEquals(99999, $response->json('guacamole_connection_id'));

        // Sensitive internal fields that should NOT be exposed
        $this->assertArrayNotHasKey('credentials', $response->json());
        $this->assertArrayNotHasKey('user_id', $response->json());
        $this->assertArrayNotHasKey('proxmox_server_id', $response->json());
    }
}

