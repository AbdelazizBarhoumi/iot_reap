<?php

namespace Tests\Feature;

use App\Enums\UsbReservationStatus;
use App\Models\GatewayNode;
use App\Models\UsbDevice;
use App\Models\UsbDeviceReservation;
use App\Models\User;
use Carbon\Carbon;
use Tests\TestCase;

/**
 * Feature tests for USB device reservation system.
 *
 * User Routes:
 *  - GET    /reservations          (list user's reservations)
 *  - POST   /reservations          (create reservation request)
 *  - DELETE /reservations/{id}     (cancel reservation)
 *
 * Admin Routes:
 *  - GET    /admin/reservations         (list all reservations)
 *  - GET    /admin/reservations/pending (list pending reservations)
 *  - POST   /admin/reservations/{id}/approve
 *  - POST   /admin/reservations/{id}/reject
 *  - POST   /admin/reservations/block   (create admin block)
 */
class UsbDeviceReservationTest extends TestCase
{
    private User $user;

    private User $admin;

    private GatewayNode $gateway;

    private UsbDevice $device;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->engineer()->create();
        $this->admin = User::factory()->admin()->create();

        $this->gateway = GatewayNode::factory()->online()->verified()->create();
        $this->device = UsbDevice::factory()
            ->for($this->gateway)
            ->available()
            ->create(['name' => 'Test Device']);
    }

    // ─── GET /reservations ────────────────────────────────────────────────────

    public function test_user_can_list_their_reservations(): void
    {
        UsbDeviceReservation::factory()
            ->for($this->user)
            ->for($this->device, 'device')
            ->pending()
            ->create();

        UsbDeviceReservation::factory()
            ->for($this->user)
            ->for($this->device, 'device')
            ->approved()
            ->create();

        $response = $this->actingAs($this->user)
            ->getJson('/reservations');

        $response->assertOk();
        $response->assertJsonCount(2, 'data');
    }

    public function test_user_cannot_see_other_users_reservations(): void
    {
        $otherUser = User::factory()->engineer()->create();

        UsbDeviceReservation::factory()
            ->for($otherUser)
            ->for($this->device, 'device')
            ->pending()
            ->create();

        $response = $this->actingAs($this->user)
            ->getJson('/reservations');

        $response->assertOk();
        $response->assertJsonCount(0, 'data');
    }

    // ─── POST /reservations ───────────────────────────────────────────────────

    public function test_user_can_create_reservation_request(): void
    {
        $startTime = Carbon::now()->addDay()->startOfHour();
        $endTime = $startTime->copy()->addHours(2);

        $response = $this->actingAs($this->user)
            ->postJson('/reservations', [
                'usb_device_id' => $this->device->id,
                'start_at' => $startTime->toIso8601String(),
                'end_at' => $endTime->toIso8601String(),
                'purpose' => 'Testing device integration',
            ]);

        $response->assertCreated();
        $response->assertJson(['success' => true]);

        $this->assertDatabaseHas('usb_device_reservations', [
            'usb_device_id' => $this->device->id,
            'user_id' => $this->user->id,
            'status' => UsbReservationStatus::PENDING->value,
        ]);
    }

    public function test_user_cannot_create_overlapping_reservation(): void
    {
        $startTime = Carbon::now()->addDay()->startOfHour();
        $endTime = $startTime->copy()->addHours(2);

        // Existing approved reservation
        UsbDeviceReservation::factory()
            ->for($this->user)
            ->for($this->device, 'device')
            ->approved()
            ->create([
                'approved_start_at' => $startTime,
                'approved_end_at' => $endTime,
            ]);

        // Try to create overlapping reservation
        $response = $this->actingAs($this->user)
            ->postJson('/reservations', [
                'usb_device_id' => $this->device->id,
                'start_at' => $startTime->copy()->addMinutes(30)->toIso8601String(),
                'end_at' => $endTime->copy()->addMinutes(30)->toIso8601String(),
            ]);

        $response->assertStatus(422);
    }

    // ─── DELETE /reservations/{id} ────────────────────────────────────────────

    public function test_user_can_cancel_their_pending_reservation(): void
    {
        $reservation = UsbDeviceReservation::factory()
            ->for($this->user)
            ->for($this->device, 'device')
            ->pending()
            ->create();

        $response = $this->actingAs($this->user)
            ->postJson("/reservations/{$reservation->id}/cancel");

        $response->assertOk();

        $reservation->refresh();
        $this->assertEquals(UsbReservationStatus::CANCELLED, $reservation->status);
    }

    public function test_user_cannot_cancel_other_users_reservation(): void
    {
        $otherUser = User::factory()->engineer()->create();
        $reservation = UsbDeviceReservation::factory()
            ->for($otherUser)
            ->for($this->device, 'device')
            ->pending()
            ->create();

        $response = $this->actingAs($this->user)
            ->postJson("/reservations/{$reservation->id}/cancel");

        $response->assertForbidden();
    }

    // ─── GET /admin/reservations/pending ──────────────────────────────────────

    public function test_admin_can_list_pending_reservations(): void
    {
        UsbDeviceReservation::factory()
            ->for($this->user)
            ->for($this->device, 'device')
            ->pending()
            ->create();

        $response = $this->actingAs($this->admin)
            ->getJson('/admin/reservations/pending');

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
    }

    public function test_non_admin_cannot_access_admin_reservations(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/admin/reservations/pending');

        $response->assertForbidden();
    }

    // ─── POST /admin/reservations/{id}/approve ────────────────────────────────

    public function test_admin_can_approve_reservation(): void
    {
        $startTime = Carbon::now()->addDay()->startOfHour();
        $endTime = $startTime->copy()->addHours(2);

        $reservation = UsbDeviceReservation::factory()
            ->for($this->user)
            ->for($this->device, 'device')
            ->pending()
            ->create([
                'requested_start_at' => $startTime,
                'requested_end_at' => $endTime,
            ]);

        $response = $this->actingAs($this->admin)
            ->postJson("/admin/reservations/{$reservation->id}/approve", [
                'approved_start_at' => $startTime->toIso8601String(),
                'approved_end_at' => $endTime->toIso8601String(),
                'admin_notes' => 'Approved for testing',
            ]);

        $response->assertOk();

        $reservation->refresh();
        $this->assertEquals(UsbReservationStatus::APPROVED, $reservation->status);
        $this->assertEquals($this->admin->id, $reservation->approved_by);
    }

    // ─── POST /admin/reservations/{id}/reject ─────────────────────────────────

    public function test_admin_can_reject_reservation(): void
    {
        $reservation = UsbDeviceReservation::factory()
            ->for($this->user)
            ->for($this->device, 'device')
            ->pending()
            ->create();

        $response = $this->actingAs($this->admin)
            ->postJson("/admin/reservations/{$reservation->id}/reject", [
                'admin_notes' => 'Device needed for maintenance',
            ]);

        $response->assertOk();

        $reservation->refresh();
        $this->assertEquals(UsbReservationStatus::REJECTED, $reservation->status);
    }

    // ─── POST /admin/reservations/block ───────────────────────────────────────

    public function test_admin_can_create_device_block(): void
    {
        $startTime = Carbon::now()->addDay()->startOfHour();
        $endTime = $startTime->copy()->addHours(4);

        $response = $this->actingAs($this->admin)
            ->postJson('/admin/reservations/block', [
                'usb_device_id' => $this->device->id,
                'start_at' => $startTime->toIso8601String(),
                'end_at' => $endTime->toIso8601String(),
                'notes' => 'Maintenance window',
            ]);

        $response->assertCreated();

        $this->assertDatabaseHas('usb_device_reservations', [
            'usb_device_id' => $this->device->id,
            'priority' => 100,
            'status' => UsbReservationStatus::APPROVED->value,
        ]);
    }
}
