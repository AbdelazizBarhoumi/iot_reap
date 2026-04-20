<?php

namespace Tests\Feature;

use App\Enums\UsbDeviceStatus;
use App\Models\GatewayNode;
use App\Models\UsbDevice;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Mockery;
use Tests\TestCase;

/**
 * Feature tests for USB/IP Hardware Gateway API.
 *
 * Routes:
 *  - GET    /hardware              (list all nodes with devices)
 *  - GET    /hardware/devices      (list all devices)
 *  - POST   /hardware/refresh      (refresh all nodes)
 *  - POST   /hardware/nodes/{node}/refresh (refresh single node)
 *  - POST   /hardware/devices/{device}/bind
 *  - POST   /hardware/devices/{device}/unbind
 *  - POST   /hardware/devices/{device}/attach
 *  - POST   /hardware/devices/{device}/detach
 *  - POST   /admin/hardware/nodes        (create node, admin only)
 *  - DELETE /admin/hardware/nodes/{node} (delete node, admin only)
 */
class HardwareGatewayTest extends TestCase
{
    private User $user;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->engineer()->create();
        $this->admin = User::factory()->admin()->create();
    }

    // ─── GET /hardware ────────────────────────────────────────────────────────

    public function test_user_can_list_gateway_nodes(): void
    {
        $node = GatewayNode::factory()->online()->create(['name' => 'gateway-1']);
        UsbDevice::factory()->count(3)->for($node)->create();

        $response = $this->actingAs($this->user)
            ->getJson('/hardware');

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.name', 'gateway-1');
        $response->assertJsonPath('data.0.online', true);
        $response->assertJsonCount(3, 'data.0.devices');
    }

    public function test_user_gets_empty_list_when_no_nodes(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/hardware');

        $response->assertOk();
        $response->assertJsonCount(0, 'data');
    }

    public function test_unauthenticated_user_cannot_list_nodes(): void
    {
        $response = $this->getJson('/hardware');
        $response->assertUnauthorized();
    }

    // ─── GET /hardware/devices ────────────────────────────────────────────────

    public function test_user_can_list_all_devices(): void
    {
        $node1 = GatewayNode::factory()->create();
        $node2 = GatewayNode::factory()->create();
        UsbDevice::factory()->for($node1)->create(['name' => 'Device 1']);
        UsbDevice::factory()->for($node2)->create(['name' => 'Device 2']);

        $response = $this->actingAs($this->user)
            ->getJson('/hardware/devices');

        $response->assertOk();
        $response->assertJsonCount(2, 'data');
    }

    // ─── POST /hardware/refresh ───────────────────────────────────────────────

    public function test_user_can_refresh_all_nodes(): void
    {
        $node = GatewayNode::factory()->create(['ip' => '192.168.50.6']);

        // Mock HTTP response from gateway agent
        Http::fake([
            'http://192.168.50.6:8000/devices' => Http::response([
                'devices' => [
                    ['busid' => '1-1', 'vendor_id' => '04e8', 'product_id' => '6860', 'name' => 'Samsung Galaxy'],
                ],
            ], 200),
        ]);

        $response = $this->actingAs($this->user)
            ->postJson('/hardware/refresh');

        $response->assertOk();
        $response->assertJson(['success' => true]);
        $response->assertJsonStructure(['summary' => ['nodes_checked', 'nodes_online', 'devices_found']]);

        // Verify device was created
        $this->assertDatabaseHas('usb_devices', [
            'gateway_node_id' => $node->id,
            'busid' => '1-1',
            'name' => 'Samsung Galaxy',
        ]);
    }

    public function test_refresh_node_failure_marks_offline(): void
    {
        $node = GatewayNode::factory()->online()->create(['ip' => '192.168.50.6']);

        // simulate gateway not responding (timeout / 500)
        Http::fake([
            'http://192.168.50.6:8000/devices' => Http::response('', 500),
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/hardware/nodes/{$node->id}/refresh");

        $response->assertStatus(502);
        $response->assertJson(['success' => false]);

        $node->refresh();
        $this->assertFalse($node->online);
    }

    // ─── POST /hardware/devices/{device}/bind ─────────────────────────────────

    public function test_user_can_bind_available_device(): void
    {
        $node = GatewayNode::factory()->create(['ip' => '192.168.50.6']);
        $device = UsbDevice::factory()->for($node)->available()->create(['busid' => '1-1']);

        Http::fake([
            'http://192.168.50.6:8000/bind' => Http::response(['success' => true], 200),
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/hardware/devices/{$device->id}/bind");

        $response->assertOk();
        $response->assertJson(['success' => true]);

        $device->refresh();
        $this->assertEquals(UsbDeviceStatus::BOUND, $device->status);
    }

    public function test_cannot_bind_already_bound_device(): void
    {
        $node = GatewayNode::factory()->create();
        $device = UsbDevice::factory()->for($node)->bound()->create();

        $response = $this->actingAs($this->user)
            ->postJson("/hardware/devices/{$device->id}/bind");

        $response->assertUnprocessable();
        $response->assertJson(['success' => false]);
    }

    // ─── POST /hardware/devices/{device}/unbind ───────────────────────────────

    public function test_user_can_unbind_bound_device(): void
    {
        $node = GatewayNode::factory()->create(['ip' => '192.168.50.6']);
        $device = UsbDevice::factory()->for($node)->bound()->create(['busid' => '1-1']);

        Http::fake([
            'http://192.168.50.6:8000/unbind' => Http::response(['success' => true], 200),
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/hardware/devices/{$device->id}/unbind");

        $response->assertOk();
        $response->assertJson(['success' => true]);

        $device->refresh();
        $this->assertEquals(UsbDeviceStatus::AVAILABLE, $device->status);
    }

    public function test_cannot_unbind_attached_device(): void
    {
        $node = GatewayNode::factory()->create();
        $device = UsbDevice::factory()->for($node)->attached()->create();

        $response = $this->actingAs($this->user)
            ->postJson("/hardware/devices/{$device->id}/unbind");

        $response->assertUnprocessable();
        $response->assertJsonPath('message', 'Cannot unbind attached device. Detach it first.');
    }

    /**
     * Unbind should be idempotent: if gateway reports device is already unbound,
     * sync the database state and return success.
     */
    public function test_unbind_is_idempotent_when_device_already_unbound_on_gateway(): void
    {
        $node = GatewayNode::factory()->create(['ip' => '192.168.50.6']);
        $device = UsbDevice::factory()->for($node)->bound()->create(['busid' => '1-1']);

        // Gateway returns 400 because device is not actually bound
        Http::fake([
            'http://192.168.50.6:8000/unbind' => Http::response([
                'detail' => 'usbip: error: device is not bound to usbip-host driver',
            ], 400),
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/hardware/devices/{$device->id}/unbind");

        $response->assertOk();
        $response->assertJson(['success' => true]);

        $device->refresh();
        $this->assertEquals(UsbDeviceStatus::AVAILABLE, $device->status);
    }

    /**
     * Bind should be idempotent: if gateway reports device is already bound,
     * sync the database state and return success.
     */
    public function test_bind_is_idempotent_when_device_already_bound_on_gateway(): void
    {
        $node = GatewayNode::factory()->create(['ip' => '192.168.50.6']);
        $device = UsbDevice::factory()->for($node)->available()->create(['busid' => '1-1']);

        // Gateway returns 400 because device is already bound
        Http::fake([
            'http://192.168.50.6:8000/bind' => Http::response([
                'detail' => 'usbip: error: device on busid 1-1 is already bound to usbip-host',
            ], 400),
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/hardware/devices/{$device->id}/bind");

        $response->assertOk();
        $response->assertJson(['success' => true]);

        $device->refresh();
        $this->assertEquals(UsbDeviceStatus::BOUND, $device->status);
    }

    /**
     * When the discovery service itself throws an exception the controller
     * should catch it, log it, and return a 500 JSON response so the
     * frontend can display an error rather than bubbling an uncaught error.
     */
    public function test_discover_gateways_handles_service_exception(): void
    {
        $this->actingAs($this->admin);

        $mock = Mockery::mock(\App\Services\GatewayDiscoveryService::class);
        $mock->shouldReceive('discoverAll')->once()->andThrow(new \Exception('boom'));
        $this->app->instance(\App\Services\GatewayDiscoveryService::class, $mock);

        $response = $this->postJson('/admin/hardware/discover');
        $response->assertStatus(500);
        $response->assertJson(['success' => false]);
        $response->assertJsonPath('message', 'Failed to discover gateways: boom');
    }

    public function test_admin_can_discover_gateways_and_load_devices(): void
    {
        $this->actingAs($this->admin);

        $node = GatewayNode::factory()->online()->create(['name' => 'gateway-1']);
        UsbDevice::factory()->for($node)->create(['busid' => '1-1']);

        $mock = Mockery::mock(\App\Services\GatewayDiscoveryService::class);
        $mock->shouldReceive('discoverAll')
            ->once()
            ->andReturn(collect([$node]));
        $this->app->instance(\App\Services\GatewayDiscoveryService::class, $mock);

        $response = $this->postJson('/admin/hardware/discover');

        $response->assertOk();
        $response->assertJson(['success' => true]);
        $response->assertJsonPath('discovered_count', 1);
        $response->assertJsonPath('gateways.0.name', 'gateway-1');
        $response->assertJsonCount(1, 'gateways.0.devices');
    }

    // ─── POST /hardware/devices/{device}/attach ───────────────────────────────

    public function test_user_can_attach_bound_device_to_vm(): void
    {
        $node = GatewayNode::factory()->create(['ip' => '192.168.50.6']);
        $device = UsbDevice::factory()->for($node)->bound()->create(['busid' => '1-1']);

        Http::fake([
            'http://192.168.50.6:8000/attach' => Http::response(['success' => true, 'port' => '00'], 200),
            'http://192.168.50.6:8000/health' => Http::response([], 200),
            // return the bound device so verifyDeviceState passes
            'http://192.168.50.6:8000/devices' => Http::response([
                'devices' => [
                    ['busid' => '1-1', 'vendor_id' => '1234', 'product_id' => '5678', 'name' => 'Test'],
                ],
            ], 200),
            // exported list should contain the busid so isDeviceExportable returns true
            'http://192.168.50.6:8000/devices/exported' => Http::response(['output' => '1-1'], 200),
        ]);

        // include vmid/node/server_id because validation requires them when no session_id is present
        $server = \App\Models\ProxmoxServer::factory()->create();

        // mock ProxmoxClientFactory so that the VM is considered running and guest-agent commands succeed
        $proxmoxClientMock = Mockery::mock(\App\Services\ProxmoxClientInterface::class)
            ->shouldIgnoreMissing();
        $proxmoxClientMock->shouldReceive('getVMStatus')->andReturn(['status' => 'running']);
        $proxmoxClientMock->shouldReceive('getGuestOsType')->andReturn('linux');
        
        // execInVmAndWait is used by executeUsbipCommand for both attach and port commands
        // When called with 'port' command, return output with port info so port verification works
        $proxmoxClientMock->shouldReceive('execInVmAndWait')->andReturnUsing(function ($nodeName, $vmid, $command) {
            if (str_contains($command, 'port')) {
                // Return port listing output for Linux 'usbip port' command
                return [
                    'exitcode' => 0,
                    'success' => true,
                    'out-data' => "Port 00:  <Unassigned>\n    busid: 1-1\n",
                    'err-data' => '',
                ];
            }
            // For attach command, just return success
            return [
                'exitcode' => 0,
                'success' => true,
                'out-data' => '',
                'err-data' => '',
            ];
        });

        $factoryMock = Mockery::mock(\App\Services\ProxmoxClientFactory::class);
        $factoryMock->shouldReceive('make')->andReturn($proxmoxClientMock);
        $this->app->instance(\App\Services\ProxmoxClientFactory::class, $factoryMock);

        $response = $this->actingAs($this->user)
            ->postJson("/hardware/devices/{$device->id}/attach", [
                'vm_ip' => '192.168.50.100',
                'vm_name' => 'Windows-VM-1',
                'vmid' => 42,
                'node' => 'pve1',
                'server_id' => $server->id,
            ]);

        $response->assertOk();
        $response->assertJson(['success' => true]);

        $device->refresh();
        $this->assertEquals(UsbDeviceStatus::ATTACHED, $device->status);
        $this->assertEquals('Windows-VM-1', $device->attached_to);
        $this->assertEquals('192.168.50.100', $device->attached_vm_ip);
    }

    public function test_cannot_attach_available_device(): void
    {
        $node = GatewayNode::factory()->create();
        $device = UsbDevice::factory()->for($node)->available()->create();

        $server = \App\Models\ProxmoxServer::factory()->create();
        $response = $this->actingAs($this->user)
            ->postJson("/hardware/devices/{$device->id}/attach", [
                'vm_ip' => '192.168.50.100',
                'vm_name' => 'Test-VM',
                'vmid' => 7,
                'node' => 'pve1',
                'server_id' => $server->id,
            ]);

        $response->assertUnprocessable();
        $response->assertJsonPath('message', 'Device must be bound before attaching');
    }

    public function test_attach_requires_vm_ip_or_session(): void
    {
        $node = GatewayNode::factory()->create();
        $device = UsbDevice::factory()->for($node)->bound()->create();

        $response = $this->actingAs($this->user)
            ->postJson("/hardware/devices/{$device->id}/attach", []);

        $response->assertUnprocessable();
    }

    // ─── POST /hardware/devices/{device}/detach ───────────────────────────────

    public function test_user_can_detach_attached_device(): void
    {
        $node = GatewayNode::factory()->create(['ip' => '192.168.50.6']);
        $device = UsbDevice::factory()->for($node)->attached()->create(['busid' => '1-1']);

        Http::fake([
            'http://192.168.50.6:8000/detach' => Http::response(['success' => true], 200),
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/hardware/devices/{$device->id}/detach");

        $response->assertOk();
        $response->assertJson(['success' => true]);

        $device->refresh();
        $this->assertEquals(UsbDeviceStatus::BOUND, $device->status);
        $this->assertNull($device->attached_to);
    }

    public function test_cannot_detach_unattached_device(): void
    {
        $node = GatewayNode::factory()->create();
        $device = UsbDevice::factory()->for($node)->bound()->create();

        $response = $this->actingAs($this->user)
            ->postJson("/hardware/devices/{$device->id}/detach");

        $response->assertUnprocessable();
        $response->assertJsonPath('message', 'Device is not attached to any VM');
    }

    // ─── Admin: POST /admin/hardware/nodes ────────────────────────────────────

    public function test_admin_can_create_gateway_node(): void
    {
        Http::fake([
            'http://192.168.50.10:8000/health' => Http::response([], 200),
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson('/admin/hardware/nodes', [
                'name' => 'gateway-new',
                'ip' => '192.168.50.10',
                'port' => 8000,
            ]);

        $response->assertCreated();
        $response->assertJson(['success' => true]);
        $response->assertJsonPath('node.name', 'gateway-new');

        $this->assertDatabaseHas('gateway_nodes', [
            'name' => 'gateway-new',
            'ip' => '192.168.50.10',
        ]);
    }

    public function test_non_admin_cannot_create_gateway_node(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/admin/hardware/nodes', [
                'name' => 'gateway-new',
                'ip' => '192.168.50.10',
            ]);

        $response->assertForbidden();
    }

    public function test_create_node_validates_ip(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/admin/hardware/nodes', [
                'name' => 'gateway-new',
                'ip' => 'not-an-ip',
            ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['ip']);
    }

    // ─── Admin: DELETE /admin/hardware/nodes/{node} ───────────────────────────

    public function test_admin_can_delete_gateway_node(): void
    {
        $node = GatewayNode::factory()->create();

        $response = $this->actingAs($this->admin)
            ->deleteJson("/admin/hardware/nodes/{$node->id}");

        $response->assertOk();
        $response->assertJson(['success' => true]);

        $this->assertDatabaseMissing('gateway_nodes', ['id' => $node->id]);
    }

    public function test_non_admin_cannot_delete_gateway_node(): void
    {
        $node = GatewayNode::factory()->create();

        $response = $this->actingAs($this->user)
            ->deleteJson("/admin/hardware/nodes/{$node->id}");

        $response->assertForbidden();

        $this->assertDatabaseHas('gateway_nodes', ['id' => $node->id]);
    }

    public function test_deleting_node_cascades_to_devices(): void
    {
        $node = GatewayNode::factory()->create();
        $device = UsbDevice::factory()->for($node)->create();

        $this->actingAs($this->admin)
            ->deleteJson("/admin/hardware/nodes/{$node->id}");

        $this->assertDatabaseMissing('usb_devices', ['id' => $device->id]);
    }

    // ─── Gateway Agent Error Handling ─────────────────────────────────────────

    public function test_bind_handles_gateway_error(): void
    {
        $node = GatewayNode::factory()->create(['ip' => '192.168.50.6']);
        $device = UsbDevice::factory()->for($node)->available()->create(['busid' => '1-1']);

        Http::fake([
            'http://192.168.50.6:8000/bind' => Http::response(['detail' => 'Device busy'], 500),
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/hardware/devices/{$device->id}/bind");

        $response->assertStatus(502);
        $response->assertJson(['success' => false]);
    }

    public function test_refresh_marks_node_offline_on_timeout(): void
    {
        $node = GatewayNode::factory()->online()->create(['ip' => '192.168.50.6']);

        Http::fake([
            'http://192.168.50.6:8000/*' => function () {
                throw new \Illuminate\Http\Client\ConnectionException('Connection timed out');
            },
        ]);

        $this->actingAs($this->user)
            ->postJson("/hardware/nodes/{$node->id}/refresh");

        $node->refresh();
        $this->assertFalse($node->online);
    }
}
