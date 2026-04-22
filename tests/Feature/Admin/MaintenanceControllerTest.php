<?php

namespace Tests\Feature\Admin;

use App\Models\Camera;
use App\Models\GatewayNode;
use App\Models\UsbDevice;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class MaintenanceControllerTest extends TestCase
{
    use RefreshDatabase;
    use WithFaker;

    private User $admin;

    private GatewayNode $gateway;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create();
        $this->gateway = GatewayNode::factory()->create();
    }

    /**
     * GET /admin/maintenance - Retrieve all resources with maintenance status
     */
    public function test_admin_can_view_maintenance_page(): void
    {
        $usbDevice = UsbDevice::factory()
            ->for($this->gateway)
            ->maintenance(
                notes: 'Under repair',
                until: now()->addDays(3),
            )
            ->create();

        $camera = Camera::factory()
            ->for($this->gateway)
            ->maintenance(
                notes: 'Lens replacement',
                until: null,
            )
            ->create();

        $response = $this->actingAs($this->admin)
            ->getJson(route('admin.maintenance.index'));

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'type',
                        'id',
                        'name',
                        'description',
                        'maintenance_mode',
                        'maintenance_notes',
                        'maintenance_until',
                        'is_in_maintenance',
                        'status',
                    ],
                ],
            ]);

        // Verify USB device and camera are included
        $resources = $response->json('data');
        $this->assertCount(2, $resources);
        $this->assertTrue(
            collect($resources)
                ->some(fn ($r) => $r['type'] === 'usb_device' && $r['id'] === $usbDevice->id),
        );
        $this->assertTrue(
            collect($resources)
                ->some(fn ($r) => $r['type'] === 'camera' && $r['id'] === $camera->id),
        );
    }

    /**
     * GET /admin/maintenance - Returns HTML when HTML is accepted
     */
    public function test_maintenance_page_returns_inertia_response_for_html(): void
    {
        UsbDevice::factory()->for($this->gateway)->create();

        $response = $this->actingAs($this->admin)
            ->get(route('admin.maintenance.index'));

        $response->assertOk();
        // Should render the Inertia component with resources
        $response->assertInertia();
    }

    /**
     * GET /admin/maintenance - Non-admin cannot access
     */
    public function test_non_admin_cannot_access_maintenance(): void
    {
        $user = User::factory()->engineer()->create();

        $response = $this->actingAs($user)
            ->getJson(route('admin.maintenance.index'));

        $response->assertForbidden();
    }

    /**
     * POST /admin/maintenance/usb-devices/{device} - Enable maintenance on USB device
     */
    public function test_admin_can_set_usb_device_maintenance(): void
    {
        $device = UsbDevice::factory()->for($this->gateway)->available()->create();

        $response = $this->actingAs($this->admin)
            ->postJson(
                route('admin.maintenance.usb-devices.set', ['device' => $device->id]),
                [
                    'notes' => 'Firmware update required',
                    'until' => now()->addDays(2)->format('Y-m-d'),
                ],
            );

        $response->assertOk()
            ->assertJsonStructure([
                'message',
                'data' => [
                    'id',
                    'maintenance_mode',
                    'maintenance_notes',
                    'maintenance_until',
                ],
            ]);

        $device->refresh();
        $this->assertTrue($device->maintenance_mode);
        $this->assertEquals($device->maintenance_notes, 'Firmware update required');
        $this->assertTrue($device->isInMaintenance());
    }

    /**
     * POST /admin/maintenance/usb-devices/{device} - Notes are required
     */
    public function test_usb_device_maintenance_requires_notes(): void
    {
        $device = UsbDevice::factory()->for($this->gateway)->create();

        $response = $this->actingAs($this->admin)
            ->postJson(
                route('admin.maintenance.usb-devices.set', ['device' => $device->id]),
                ['notes' => ''],
            );

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['notes']);
    }

    /**
     * POST /admin/maintenance/usb-devices/{device} - Until date must be in future
     */
    public function test_usb_device_maintenance_until_must_be_future(): void
    {
        $device = UsbDevice::factory()->for($this->gateway)->create();

        $response = $this->actingAs($this->admin)
            ->postJson(
                route('admin.maintenance.usb-devices.set', ['device' => $device->id]),
                [
                    'notes' => 'Repair needed',
                    'until' => now()->subDays(1)->format('Y-m-d'),
                ],
            );

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['until']);
    }

    /**
     * DELETE /admin/maintenance/usb-devices/{device} - Clear maintenance on USB device
     */
    public function test_admin_can_clear_usb_device_maintenance(): void
    {
        $device = UsbDevice::factory()
            ->for($this->gateway)
            ->maintenance(notes: 'Repair', until: now()->addDays(3))
            ->create();

        $response = $this->actingAs($this->admin)
            ->deleteJson(
                route('admin.maintenance.usb-devices.clear', ['device' => $device->id]),
            );

        $response->assertOk()
            ->assertJsonStructure(['message', 'data' => ['id', 'maintenance_mode']]);

        $device->refresh();
        $this->assertFalse($device->maintenance_mode);
        $this->assertNull($device->maintenance_notes);
        $this->assertNull($device->maintenance_until);
        $this->assertFalse($device->isInMaintenance());
    }

    /**
     * POST /admin/maintenance/cameras/{camera} - Enable maintenance on camera
     */
    public function test_admin_can_set_camera_maintenance(): void
    {
        $camera = Camera::factory()->for($this->gateway)->create();

        $response = $this->actingAs($this->admin)
            ->postJson(
                route('admin.maintenance.cameras.set', ['camera' => $camera->id]),
                [
                    'notes' => 'Lens cleaning',
                    'until' => now()->addDays(1)->format('Y-m-d'),
                ],
            );

        $response->assertOk()
            ->assertJsonStructure([
                'message',
                'data' => [
                    'id',
                    'maintenance_mode',
                    'maintenance_notes',
                    'maintenance_until',
                ],
            ]);

        $camera->refresh();
        $this->assertTrue($camera->maintenance_mode);
        $this->assertEquals($camera->maintenance_notes, 'Lens cleaning');
        $this->assertTrue($camera->isInMaintenance());
    }

    /**
     * DELETE /admin/maintenance/cameras/{camera} - Clear maintenance on camera
     */
    public function test_admin_can_clear_camera_maintenance(): void
    {
        $camera = Camera::factory()
            ->for($this->gateway)
            ->maintenance(notes: 'Repair needed')
            ->create();

        $response = $this->actingAs($this->admin)
            ->deleteJson(
                route('admin.maintenance.cameras.clear', ['camera' => $camera->id]),
            );

        $response->assertOk()
            ->assertJsonStructure(['message', 'data' => ['id', 'maintenance_mode']]);

        $camera->refresh();
        $this->assertFalse($camera->maintenance_mode);
        $this->assertNull($camera->maintenance_notes);
        $this->assertNull($camera->maintenance_until);
        $this->assertFalse($camera->isInMaintenance());
    }

    /**
     * POST /admin/maintenance/description - Update resource description
     */
    public function test_admin_can_update_device_description(): void
    {
        $device = UsbDevice::factory()->for($this->gateway)->create();

        $response = $this->actingAs($this->admin)
            ->postJson(
                route('admin.maintenance.description'),
                [
                    'type' => 'usb_device',
                    'id' => $device->id,
                    'description' => 'New high-speed USB hub',
                ],
            );

        $response->assertOk()
            ->assertJsonStructure([
                'message',
                'data' => ['type', 'id', 'admin_description'],
            ]);

        $device->refresh();
        $this->assertEquals($device->admin_description, 'New high-speed USB hub');
    }

    /**
     * POST /admin/maintenance/description - Update camera description
     */
    public function test_admin_can_update_camera_description(): void
    {
        $camera = Camera::factory()->for($this->gateway)->create();

        $response = $this->actingAs($this->admin)
            ->postJson(
                route('admin.maintenance.description'),
                [
                    'type' => 'camera',
                    'id' => $camera->id,
                    'description' => 'Thermal imaging camera - Lab B',
                ],
            );

        $response->assertOk();

        $camera->refresh();
        $this->assertEquals($camera->admin_description, 'Thermal imaging camera - Lab B');
    }

    /**
     * POST /admin/maintenance/description - Description validates type
     */
    public function test_description_update_validates_resource_type(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson(
                route('admin.maintenance.description'),
                [
                    'type' => 'invalid_type',
                    'id' => 1,
                    'description' => 'Test',
                ],
            );

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['type']);
    }

    /**
     * POST /admin/maintenance/description - Description respects max length
     */
    public function test_description_update_respects_max_length(): void
    {
        $device = UsbDevice::factory()->for($this->gateway)->create();

        $response = $this->actingAs($this->admin)
            ->postJson(
                route('admin.maintenance.description'),
                [
                    'type' => 'usb_device',
                    'id' => $device->id,
                    'description' => str_repeat('a', 5001),
                ],
            );

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['description']);
    }

    /**
     * GET /admin/maintenance/in-maintenance - Retrieve resources in maintenance
     */
    public function test_admin_can_retrieve_in_maintenance_resources(): void
    {
        $inMaintenanceDevice = UsbDevice::factory()
            ->for($this->gateway)
            ->maintenance(notes: 'Repair')
            ->create();

        $availableDevice = UsbDevice::factory()
            ->for($this->gateway)
            ->available()
            ->create();

        $inMaintenanceCamera = Camera::factory()
            ->for($this->gateway)
            ->maintenance(notes: 'Lens cleaning')
            ->create();

        $response = $this->actingAs($this->admin)
            ->getJson(route('admin.maintenance.in-maintenance'));

        $response->assertOk();

        $resources = $response->json('data');
        $this->assertCount(2, $resources);

        $deviceIds = collect($resources)
            ->filter(fn ($r) => $r['type'] === 'usb_device')
            ->pluck('id')
            ->toArray();
        $this->assertContains($inMaintenanceDevice->id, $deviceIds);
        $this->assertNotContains($availableDevice->id, $deviceIds);

        $cameraIds = collect($resources)
            ->filter(fn ($r) => $r['type'] === 'camera')
            ->pluck('id')
            ->toArray();
        $this->assertContains($inMaintenanceCamera->id, $cameraIds);
    }

    /**
     * Test that maintenance automatically clears when end date is reached
     */
    public function test_device_maintenance_auto_clears_after_date(): void
    {
        $device = UsbDevice::factory()
            ->for($this->gateway)
            ->maintenance(
                notes: 'Repair',
                until: now()->yesterday(),
            )
            ->create();

        $this->assertFalse($device->isInMaintenance());
    }

    /**
     * Test that maintenance persists when end date is in future
     */
    public function test_device_maintenance_persists_until_future_date(): void
    {
        $device = UsbDevice::factory()
            ->for($this->gateway)
            ->maintenance(
                notes: 'Repair',
                until: now()->addDays(5),
            )
            ->create();

        $this->assertTrue($device->isInMaintenance());
    }

    /**
     * Test that permanent maintenance persists indefinitely
     */
    public function test_device_permanent_maintenance_persists(): void
    {
        $device = UsbDevice::factory()
            ->for($this->gateway)
            ->maintenance(notes: 'Repair', until: null)
            ->create();

        $this->assertTrue($device->isInMaintenance());

        // Should still be in maintenance after many days
        $this->travelTo(now()->addYears(1));
        $this->assertTrue($device->isInMaintenance());
    }

    /**
     * Test that non-admin cannot set maintenance
     */
    public function test_non_admin_cannot_set_device_maintenance(): void
    {
        $user = User::factory()->engineer()->create();
        $device = UsbDevice::factory()->for($this->gateway)->create();

        $response = $this->actingAs($user)
            ->postJson(
                route('admin.maintenance.usb-devices.set', ['device' => $device->id]),
                ['notes' => 'Test'],
            );

        $response->assertForbidden();
    }

    /**
     * Test that non-admin cannot clear maintenance
     */
    public function test_non_admin_cannot_clear_device_maintenance(): void
    {
        $user = User::factory()->engineer()->create();
        $device = UsbDevice::factory()
            ->for($this->gateway)
            ->maintenance(notes: 'Repair')
            ->create();

        $response = $this->actingAs($user)
            ->deleteJson(
                route('admin.maintenance.usb-devices.clear', ['device' => $device->id]),
            );

        $response->assertForbidden();
    }

    /**
     * Test that unauthenticated user cannot access maintenance endpoints
     */
    public function test_unauthenticated_user_cannot_access_maintenance(): void
    {
        $response = $this->getJson(route('admin.maintenance.index'));
        $response->assertUnauthorized();

        $device = UsbDevice::factory()->for($this->gateway)->create();

        $response = $this->postJson(
            route('admin.maintenance.usb-devices.set', ['device' => $device->id]),
            ['notes' => 'Test'],
        );
        $response->assertUnauthorized();
    }
}
