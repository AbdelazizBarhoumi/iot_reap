<?php

namespace Tests\Feature\Admin;

use App\Models\NodeCredentialsLog;
use App\Models\ProxmoxNode;
use App\Models\ProxmoxServer;
use App\Models\User;
use App\Services\ProxmoxConnection;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Feature tests for ProxmoxServerController.
 * Tests admin endpoints for registering, updating, testing, and deleting Proxmox servers.
 */
class ProxmoxServerControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $engineer;

    protected function setUp(): void
    {
        parent::setUp();

        // Create admin and engineer users
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->engineer = User::factory()->create(['role' => 'engineer']);

        // Mock the ProxmoxConnection service
        $this->mock(ProxmoxConnection::class, function ($mock) {
            $mock->shouldReceive('testConnection')->andReturn([
                'success' => true,
                'nodes' => [
                    ['node' => 'node1', 'status' => 'online', 'uptime' => 1000],
                    ['node' => 'node2', 'status' => 'online', 'uptime' => 1000],
                ],
            ]);
        });
    }

    // ===== INDEX ENDPOINT =====

    /**
     * Admin can list all Proxmox servers.
     */
    public function test_admin_can_list_proxmox_servers(): void
    {
        $servers = ProxmoxServer::factory(3)->create(['created_by' => $this->admin->id]);

        $response = $this->actingAs($this->admin)
            ->getJson('/admin/proxmox-servers');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'host', 'port', 'is_active', 'created_at'],
                ],
            ])
            ->assertJsonCount(3, 'data');
    }

    /**
     * Engineer cannot list Proxmox servers (admin only).
     */
    public function test_engineer_cannot_list_proxmox_servers(): void
    {
        ProxmoxServer::factory(3)->create();

        $response = $this->actingAs($this->engineer)
            ->getJson('/admin/proxmox-servers');

        $response->assertForbidden();
    }

    /**
     * Unauthenticated user cannot list servers.
     */
    public function test_unauthenticated_cannot_list_proxmox_servers(): void
    {
        $response = $this->getJson('/admin/proxmox-servers');

        $response->assertUnauthorized();
    }

    // ===== SHOW ENDPOINT =====

    /**
     * Admin can view a single Proxmox server.
     */
    public function test_admin_can_view_single_proximoxserver(): void
    {
        $server = ProxmoxServer::factory()->create(['created_by' => $this->admin->id]);

        $response = $this->actingAs($this->admin)
            ->getJson("/admin/proxmox-servers/{$server->id}");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'id', 'name', 'host', 'port', 'realm', 'is_active',
                    'created_by_user', 'api_url', 'created_at',
                ],
            ])
            ->assertJsonPath('data.id', $server->id)
            ->assertJsonPath('data.name', $server->name);
    }

    /**
     * Credentials are not exposed in server resource.
     */
    public function test_server_resource_excludes_credentials(): void
    {
        $server = ProxmoxServer::factory()->create(['created_by' => $this->admin->id]);

        $response = $this->actingAs($this->admin)
            ->getJson("/admin/proxmox-servers/{$server->id}");

        $response->assertOk()
            ->assertJsonMissing(['token_id' => $server->token_id])
            ->assertJsonMissing(['token_secret' => $server->token_secret]);
    }

    // ===== STORE ENDPOINT (CREATE) =====

    /**
     * Admin can register a new Proxmox server with valid credentials.
     */
    public function test_admin_can_register_proxmox_server(): void
    {
        $payload = [
            'name' => 'Production Cluster',
            'description' => 'Main production Proxmox cluster',
            'host' => '192.168.1.100',
            'port' => 8006,
            'realm' => 'pam',
            'token_id' => 'root@pam!api-token=abc123def456',
            'token_secret' => 'ffffffffffffffffffffffffffffffffffffffff',
            'verify_ssl' => true,
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/admin/proxmox-servers', $payload);

        $response->assertCreated()
            ->assertJsonStructure([
                'data' => ['id', 'name', 'host', 'is_active'],
            ])
            ->assertJsonPath('message', 'Proxmox server registered successfully');

        // Verify server record exists and model decrypts host/port
        $this->assertDatabaseHas('proxmox_servers', [
            'name' => 'Production Cluster',
            'is_active' => true,
        ]);

        $server = ProxmoxServer::where('name', 'Production Cluster')->first();
        $this->assertEquals('192.168.1.100', $server->host);
        $this->assertEquals(8006, $server->port);
    }

    /**
     * Credentials are encrypted before database insert.
     */
    public function test_credentials_encrypted_on_save(): void
    {
        $tokenId = 'root@pam!api-token=xyz789abc123';
        $tokenSecret = 'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

        $payload = [
            'name' => 'Test Cluster',
            'host' => '192.168.1.50',
            'port' => 8006,
            'token_id' => $tokenId,
            'token_secret' => $tokenSecret,
            'verify_ssl' => true,
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/admin/proxmox-servers', $payload);

        $response->assertCreated();

        // Verify the server is retrievable with decrypted credentials
        $server = ProxmoxServer::latest()->first();
        $this->assertEquals($tokenId, $server->token_id);
        $this->assertEquals($tokenSecret, $server->token_secret);

        // Verify stored value is different (encrypted)
        $this->assertNotEquals(
            $tokenId,
            $server->getAttributes()['token_id'] ?? null
        );
    }

    /**
     * Connection test is performed before saving.
     */
    public function test_connection_tested_before_save(): void
    {
        $this->mock(ProxmoxConnection::class, function ($mock) {
            $mock->shouldReceive('testConnection')
                ->once()
                ->andReturn(['success' => true]);
        });

        $payload = [
            'name' => 'Test Server',
            'host' => '192.168.1.100',
            'port' => 8006,
            'token_id' => 'test@pam!token=abc',
            'token_secret' => 'ffffffffffffffffffffffffffffffffffffffff',
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/admin/proxmox-servers', $payload);

        $response->assertCreated();
    }

    /**
     * Invalid credentials are rejected (connection test fails).
     */
    public function test_rejects_invalid_credentials(): void
    {
        $this->mock(ProxmoxConnection::class, function ($mock) {
            $mock->shouldReceive('testConnection')
                ->andReturn([
                    'success' => false,
                    'error' => 'HTTP 401 - Unauthorized',
                ]);
        });

        $payload = [
            'name' => 'Bad Server',
            'host' => '192.168.1.100',
            'port' => 8006,
            'token_id' => 'invalid@pam!token=bad',
            'token_secret' => 'ffffffffffffffffffffffffffffffffffffffff',
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/admin/proxmox-servers', $payload);

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Connection test failed');

        $this->assertDatabaseMissing('proxmox_servers', ['name' => 'Bad Server']);
    }

    /**
     * Duplicate server names are rejected.
     */
    public function test_rejects_duplicate_server_name(): void
    {
        ProxmoxServer::factory()->create(['name' => 'Primary Cluster']);

        $payload = [
            'name' => 'Primary Cluster',
            'host' => '192.168.1.100',
            'port' => 8006,
            'token_id' => 'root@pam!token=abc',
            'token_secret' => 'ffffffffffffffffffffffffffffffffffffffff',
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/admin/proxmox-servers', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    /**
     * Registration is logged in audit table.
     */
    public function test_registration_logged_in_credentials_log(): void
    {
        $payload = [
            'name' => 'Logged Server',
            'host' => '192.168.1.100',
            'port' => 8006,
            'token_id' => 'root@pam!token=abc',
            'token_secret' => 'ffffffffffffffffffffffffffffffffffffffff',
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/admin/proxmox-servers', $payload);

        $response->assertCreated();

        $server = ProxmoxServer::where('name', 'Logged Server')->first();

        $this->assertDatabaseHas('node_credentials_log', [
            'proxmox_server_id' => $server->id,
            'action' => 'registered',
            'changed_by' => $this->admin->id,
        ]);
    }

    /**
     * Engineer cannot register servers (admin only).
     */
    public function test_engineer_cannot_register_server(): void
    {
        $payload = [
            'name' => 'Engineer Attempt',
            'host' => '192.168.1.100',
            'port' => 8006,
            'token_id' => 'root@pam!token=abc',
            'token_secret' => 'ffffffffffffffffffffffffffffffffffffffff',
        ];

        $response = $this->actingAs($this->engineer)
            ->postJson('/admin/proxmox-servers', $payload);

        $response->assertForbidden();
    }

    // ===== UPDATE ENDPOINT (PATCH) =====

    /**
     * Admin can update a Proxmox server.
     */
    public function test_admin_can_update_server(): void
    {
        $server = ProxmoxServer::factory()->create();

        $payload = [
            'name' => 'Updated Name',
            'description' => 'New description',
            'is_active' => false,
        ];

        $response = $this->actingAs($this->admin)
            ->patchJson("/admin/proxmox-servers/{$server->id}", $payload);

        $response->assertOk();

        $server->refresh();
        $this->assertEquals('Updated Name', $server->name);
        $this->assertEquals('New description', $server->description);
        $this->assertFalse($server->is_active);
    }

    /**
     * Re-encrypts tokens on update.
     */
    public function test_tokens_reencrypted_on_update(): void
    {
        $server = ProxmoxServer::factory()->create();
        $oldEncryptedSecretValue = $server->getAttributes()['token_secret'];

        $newTokenSecret = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';

        $payload = [
            'token_secret' => $newTokenSecret,
        ];

        $response = $this->actingAs($this->admin)
            ->patchJson("/admin/proxmox-servers/{$server->id}", $payload);

        $response->assertOk();

        $server->refresh();
        $this->assertEquals($newTokenSecret, $server->token_secret);

        // Verify encrypted value changed (token_secret was updated)
        $this->assertNotEquals(
            $oldEncryptedSecretValue,
            $server->getAttributes()['token_secret'] ?? null
        );
    }

    /**
     * Update is logged in audit table.
     */
    public function test_update_logged_in_credentials_log(): void
    {
        $server = ProxmoxServer::factory()->create(['name' => 'Original Name']);

        $payload = [
            'name' => 'Updated Name',
        ];

        $response = $this->actingAs($this->admin)
            ->patchJson("/admin/proxmox-servers/{$server->id}", $payload);

        $response->assertOk();

        $this->assertDatabaseHas('node_credentials_log', [
            'proxmox_server_id' => $server->id,
            'action' => 'updated',
            'changed_by' => $this->admin->id,
        ]);
    }

    // ===== DELETE ENDPOINT (DESTROY) =====

    /**
     * Admin can delete a server without nodes.
     */
    public function test_admin_can_delete_server_without_nodes(): void
    {
        $server = ProxmoxServer::factory()->create();

        $response = $this->actingAs($this->admin)
            ->deleteJson("/admin/proxmox-servers/{$server->id}");

        $response->assertOk()
            ->assertJsonPath('message', 'Proxmox server deleted successfully');

        $this->assertDatabaseMissing('proxmox_servers', ['id' => $server->id]);
    }

    /**
     * Delete prevented if server has associated nodes (422).
     */
    public function test_delete_prevented_if_server_has_nodes(): void
    {
        $server = ProxmoxServer::factory()->create();
        ProxmoxNode::factory(2)->create(['proxmox_server_id' => $server->id]);

        $response = $this->actingAs($this->admin)
            ->deleteJson("/admin/proxmox-servers/{$server->id}");

        $response->assertStatus(422)
            ->assertJsonPath('nodes_count', 2)
            ->assertJsonStructure(['nodes' => ['*' => ['id', 'name', 'hostname']]]);

        $this->assertDatabaseHas('proxmox_servers', ['id' => $server->id]);
    }

    /**
     * Delete with force flag orphans nodes.
     */
    public function test_delete_with_force_orphans_nodes(): void
    {
        $server = ProxmoxServer::factory()->create();
        $nodes = ProxmoxNode::factory(2)->create(['proxmox_server_id' => $server->id]);

        $response = $this->actingAs($this->admin)
            ->deleteJson("/admin/proxmox-servers/{$server->id}?force=true");

        $response->assertOk();

        $this->assertDatabaseMissing('proxmox_servers', ['id' => $server->id]);

        // Verify nodes are orphaned (proxmox_server_id set to NULL)
        foreach ($nodes as $node) {
            $node->refresh();
            $this->assertNull($node->proxmox_server_id);
        }
    }

    /**
     * Deletion is logged in audit table.
     */
    public function test_deletion_logged_in_credentials_log(): void
    {
        $server = ProxmoxServer::factory()->create();
        $serverId = $server->id;

        $response = $this->actingAs($this->admin)
            ->deleteJson("/admin/proxmox-servers/{$server->id}");

        $response->assertOk();

        // After deletion, proxmox_server_id is set to NULL via onDelete('set null')
        // but the audit log entry should still exist
        $this->assertDatabaseHas('node_credentials_log', [
            'proxmox_server_id' => null,
            'action' => 'deleted',
            'changed_by' => $this->admin->id,
        ]);
    }

    // ===== TEST ENDPOINT =====

    /**
     * Admin can test a connection without saving.
     */
    public function test_admin_can_test_connection(): void
    {
        $payload = [
            'name' => 'Test Name (not saved)',
            'host' => '192.168.1.100',
            'port' => 8006,
            'token_id' => 'test@pam!token=abc',
            'token_secret' => 'ffffffffffffffffffffffffffffffffffffffff',
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/admin/proxmox-servers/test', $payload);

        $response->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonStructure(['ok', 'message', 'nodes']);

        // Verify server was NOT saved
        $this->assertDatabaseMissing('proxmox_servers', ['name' => 'Test Name (not saved)']);
    }

    /**
     * Test endpoint returns nodes on success.
     */
    public function test_test_endpoint_returns_nodes(): void
    {
        $payload = [
            'name' => 'Temp',
            'host' => '192.168.1.100',
            'port' => 8006,
            'token_id' => 'test@pam!token=abc',
            'token_secret' => 'ffffffffffffffffffffffffffffffffffffffff',
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/admin/proxmox-servers/test', $payload);

        $response->assertOk()
            ->assertJsonCount(2, 'nodes');
    }

    /**
     * Test endpoint shows error on connection failure.
     */
    public function test_test_endpoint_shows_error_on_failure(): void
    {
        $this->mock(ProxmoxConnection::class, function ($mock) {
            $mock->shouldReceive('testConnection')
                ->andReturn([
                    'success' => false,
                    'error' => 'Connection timeout',
                ]);
        });

        $payload = [
            'name' => 'Bad',
            'host' => '192.168.1.999',
            'port' => 8006,
            'token_id' => 'test@pam!token=bad',
            'token_secret' => 'ffffffffffffffffffffffffffffffffffffffff',
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/admin/proxmox-servers/test', $payload);

        $response->assertStatus(422)
            ->assertJsonPath('ok', false)
            ->assertJsonPath('error', 'Connection timeout');
    }

    // ===== PUBLIC ACTIVE ENDPOINT =====

    /**
     * Authenticated user can get active servers for UI dropdown.
     */
    public function test_engineer_can_get_active_servers(): void
    {
        $active = ProxmoxServer::factory(2)->create(['is_active' => true]);
        $inactive = ProxmoxServer::factory()->create(['is_active' => false]);

        $response = $this->actingAs($this->engineer)
            ->getJson('/api/proxmox-servers/active');

        $response->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name'],
                ],
            ])
            ->assertJsonMissing(['host']);

        // Verify only active servers returned
        $ids = $response->json('data.*.id');
        $this->assertContains($active[0]->id, $ids);
        $this->assertContains($active[1]->id, $ids);
        $this->assertNotContains($inactive->id, $ids);
    }

    /**
     * Public endpoint does not expose credentials.
     */
    public function test_active_servers_endpoint_excludes_credentials(): void
    {
        ProxmoxServer::factory()->create(['is_active' => true]);

        $response = $this->actingAs($this->engineer)
            ->getJson('/api/proxmox-servers/active');

        $response->assertOk()
            ->assertJsonMissing(['token_id'])
            ->assertJsonMissing(['token_secret']);
    }

    /**
     * Unauthenticated user cannot access active servers endpoint.
     */
    public function test_unauthenticated_cannot_access_active_servers(): void
    {
        $response = $this->getJson('/api/proxmox-servers/active');

        $response->assertUnauthorized();
    }

    /**
     * Empty list returned when no servers are active.
     */
    public function test_active_servers_returns_empty_when_none_active(): void
    {
        ProxmoxServer::factory(3)->create(['is_active' => false]);

        $response = $this->actingAs($this->engineer)
            ->getJson('/api/proxmox-servers/active');

        $response->assertOk()
            ->assertJsonCount(0, 'data');
    }

    // ===== MULTI-SERVER FLOW =====

    /**
     * Full workflow: register 2 servers, test connections, manage.
     */
    public function test_multi_server_registration_workflow(): void
    {
        // Register first server
        $payload1 = [
            'name' => 'Primary Cluster',
            'host' => '192.168.1.100',
            'port' => 8006,
            'token_id' => 'primary@pam!token',
            'token_secret' => 'ffffffffffffffffffffffffffffffffffffffff',
        ];

        $response1 = $this->actingAs($this->admin)
            ->postJson('/admin/proxmox-servers', $payload1);

        $response1->assertCreated();
        $server1Id = $response1->json('data.id');

        // Register second server
        $payload2 = [
            'name' => 'DR Cluster',
            'host' => '192.168.2.100',
            'port' => 8006,
            'token_id' => 'dr@pam!token',
            'token_secret' => 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        ];

        $response2 = $this->actingAs($this->admin)
            ->postJson('/admin/proxmox-servers', $payload2);

        $response2->assertCreated();
        $server2Id = $response2->json('data.id');

        // Verify both servers exist
        $response = $this->actingAs($this->admin)
            ->getJson('/admin/proxmox-servers');

        $response->assertOk()
            ->assertJsonCount(2, 'data');

        // Verify engineer can see both for selection
        $response = $this->actingAs($this->engineer)
            ->getJson('/api/proxmox-servers/active');

        $response->assertOk()
            ->assertJsonCount(2, 'data');

        // Deactivate first server
        $response = $this->actingAs($this->admin)
            ->patchJson("/admin/proxmox-servers/{$server1Id}", ['is_active' => false]);

        $response->assertOk();

        // Engineer now sees only active (second) server
        $response = $this->actingAs($this->engineer)
            ->getJson('/api/proxmox-servers/active');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }
}
