<?php

namespace Tests\Feature;

use App\Enums\UsbDeviceStatus;
use App\Enums\UsbReservationStatus;
use App\Enums\VMSessionStatus;
use App\Models\GatewayNode;
use App\Models\ProxmoxNode;
use App\Models\ProxmoxServer;
use App\Models\UsbDevice;
use App\Models\UsbDeviceQueue;
use App\Models\UsbDeviceReservation;
use App\Models\User;
use App\Models\VMSession;
use App\Services\GatewayService;
use App\Services\ProxmoxClientFake;
use App\Services\ProxmoxClientFactory;
use App\Services\ProxmoxClientInterface;
use Illuminate\Support\Facades\Http;
use Mockery;
use Tests\TestCase;

/**
 * Feature tests for session-scoped USB hardware operations.
 *
 * Routes:
 *  - GET    /sessions/{session}/hardware                     (get session hardware summary)
 *  - POST   /sessions/{session}/hardware/devices/{device}/attach
 *  - POST   /sessions/{session}/hardware/devices/{device}/detach
 *  - POST   /sessions/{session}/hardware/devices/{device}/queue/join
 *  - POST   /sessions/{session}/hardware/devices/{device}/queue/leave
 */
class SessionHardwareTest extends TestCase
{
    private User $user;
    private User $otherUser;
    private VMSession $session;
    private GatewayNode $gateway;
    private ProxmoxServer $proxmoxServer;
    private ProxmoxNode $proxmoxNode;
    private ProxmoxClientFake $fakeProxmoxClient;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->engineer()->create();
        $this->otherUser = User::factory()->engineer()->create();
        
        $this->gateway = GatewayNode::factory()->online()->verified()->create();
        
        // Create Proxmox server and node for guest agent operations
        $this->proxmoxServer = ProxmoxServer::factory()->create();
        $this->proxmoxNode = ProxmoxNode::factory()->create(['name' => 'pve-test']);
        
        $this->session = VMSession::factory()
            ->for($this->user)
            ->active()
            ->create([
                'proxmox_server_id' => $this->proxmoxServer->id,
                'node_id' => $this->proxmoxNode->id,
                'vm_id' => 200,
            ]);

        // Set up the fake ProxmoxClient
        $this->fakeProxmoxClient = new ProxmoxClientFake();
        
        $this->app->bind(ProxmoxClientInterface::class, fn() => $this->fakeProxmoxClient);
        
        $mockFactory = Mockery::mock(ProxmoxClientFactory::class);
        $mockFactory->shouldReceive('make')
            ->andReturn($this->fakeProxmoxClient);
        $mockFactory->shouldReceive('makeDefault')
            ->andReturn($this->fakeProxmoxClient);
        $mockFactory->shouldReceive('makeForServerId')
            ->andReturn($this->fakeProxmoxClient);
        
        $this->app->instance(ProxmoxClientFactory::class, $mockFactory);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    // ─── GET /sessions/{session}/hardware ─────────────────────────────────────

    public function test_user_can_get_session_hardware_summary(): void
    {
        $device = UsbDevice::factory()
            ->for($this->gateway)
            ->available()
            ->create();

        $response = $this->actingAs($this->user)
            ->getJson("/sessions/{$this->session->id}/hardware");

        $response->assertOk();
        $response->assertJsonStructure([
            'data' => [
                'attached_devices',
                'queue_entries',
                'available_devices',
            ],
        ]);
    }

    public function test_user_cannot_access_other_users_session_hardware(): void
    {
        $response = $this->actingAs($this->otherUser)
            ->getJson("/sessions/{$this->session->id}/hardware");

        $response->assertForbidden();
    }

    // ─── POST /sessions/{session}/hardware/devices/{device}/attach ─────────────

    public function test_user_can_attach_available_device_to_session(): void
    {
        $device = UsbDevice::factory()
            ->for($this->gateway)
            ->bound()
            ->create(['busid' => '1-1']);

        // stub gateway endpoints so attach verification passes
        Http::fake([
            "http://{$this->gateway->ip}:8000/health" => Http::response([], 200),
            "http://{$this->gateway->ip}:8000/devices" => Http::response([
                'devices' => [['busid' => '1-1']],
            ], 200),
            "http://{$this->gateway->ip}:8000/devices/exported" => Http::response([
                'devices' => [['busid' => '1-1']],
            ], 200),
            "http://{$this->gateway->ip}:8000/*" => Http::response([], 200),
        ]);

        // The fake ProxmoxClient will return success for usbip attach by default
        $this->fakeProxmoxClient->clearExecHistory();

        $response = $this->actingAs($this->user)
            ->postJson("/sessions/{$this->session->id}/hardware/devices/{$device->id}/attach");

        $response->assertOk();
        $response->assertJson(['success' => true]);

        $device->refresh();
        $this->assertEquals($this->session->id, $device->attached_session_id);
        
        // Verify the command was executed via guest agent
        $this->fakeProxmoxClient->assertCommandExecuted('usbip attach');
    }

    public function test_user_cannot_attach_device_in_use_by_another(): void
    {
        $otherSession = VMSession::factory()
            ->for($this->otherUser)
            ->active()
            ->create([
                'proxmox_server_id' => $this->proxmoxServer->id,
                'node_id' => $this->proxmoxNode->id,
            ]);

        $device = UsbDevice::factory()
            ->for($this->gateway)
            ->attached()
            ->create(['attached_session_id' => $otherSession->id]);

        $response = $this->actingAs($this->user)
            ->postJson("/sessions/{$this->session->id}/hardware/devices/{$device->id}/attach");

        $response->assertStatus(422);
        $response->assertJson(['success' => false]);
    }

    // ─── POST /sessions/{session}/hardware/devices/{device}/detach ────────────

    public function test_user_can_detach_their_attached_device(): void
    {
        $device = UsbDevice::factory()
            ->for($this->gateway)
            ->attached()
            ->create([
                'attached_session_id' => $this->session->id,
                'busid' => '1-1',
                'usbip_port' => '00',
            ]);

        // The fake ProxmoxClient will return success for usbip detach by default
        $this->fakeProxmoxClient->clearExecHistory();

        $response = $this->actingAs($this->user)
            ->postJson("/sessions/{$this->session->id}/hardware/devices/{$device->id}/detach");

        $response->assertOk();
        $response->assertJson(['success' => true]);

        $device->refresh();
        $this->assertNull($device->attached_session_id);
        
        // Verify the command was executed via guest agent
        $this->fakeProxmoxClient->assertCommandExecuted('usbip detach');
    }

    // ─── POST /sessions/{session}/hardware/devices/{device}/queue/join ────────

    public function test_user_can_join_queue_for_in_use_device(): void
    {
        $otherSession = VMSession::factory()
            ->for($this->otherUser)
            ->active()
            ->create([
                'proxmox_server_id' => $this->proxmoxServer->id,
                'node_id' => $this->proxmoxNode->id,
            ]);

        $device = UsbDevice::factory()
            ->for($this->gateway)
            ->attached()
            ->create(['attached_session_id' => $otherSession->id]);

        $response = $this->actingAs($this->user)
            ->postJson("/sessions/{$this->session->id}/hardware/devices/{$device->id}/queue/join");

        $response->assertOk();
        $this->assertDatabaseHas('usb_device_queue', [
            'usb_device_id' => $device->id,
            'session_id' => $this->session->id,
        ]);
    }

    public function test_user_cannot_join_queue_twice_for_same_device(): void
    {
        $otherSession = VMSession::factory()
            ->for($this->otherUser)
            ->active()
            ->create([
                'proxmox_server_id' => $this->proxmoxServer->id,
                'node_id' => $this->proxmoxNode->id,
            ]);

        $device = UsbDevice::factory()
            ->for($this->gateway)
            ->attached()
            ->create(['attached_session_id' => $otherSession->id]);

        // Add user to queue first
        UsbDeviceQueue::create([
            'usb_device_id' => $device->id,
            'session_id' => $this->session->id,
            'user_id' => $this->user->id,
            'position' => 1,
            'queued_at' => now(),
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/sessions/{$this->session->id}/hardware/devices/{$device->id}/queue/join");

        $response->assertStatus(422);
    }

    // ─── POST /sessions/{session}/hardware/devices/{device}/queue/leave ───────

    public function test_user_can_leave_queue(): void
    {
        $device = UsbDevice::factory()
            ->for($this->gateway)
            ->attached()
            ->create();

        $queueEntry = UsbDeviceQueue::create([
            'usb_device_id' => $device->id,
            'session_id' => $this->session->id,
            'user_id' => $this->user->id,
            'position' => 1,
            'queued_at' => now(),
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/sessions/{$this->session->id}/hardware/devices/{$device->id}/queue/leave");

        $response->assertOk();
        $this->assertDatabaseMissing('usb_device_queue', ['id' => $queueEntry->id]);
    }
}
