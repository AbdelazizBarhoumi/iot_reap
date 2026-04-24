<?php

namespace Tests\Feature;

use App\Enums\CameraReservationStatus;
use App\Enums\CameraStatus;
use App\Enums\UsbDeviceStatus;
use App\Models\Camera;
use App\Models\CameraReservation;
use App\Models\GatewayNode;
use App\Models\Robot;
use App\Models\UsbDevice;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Feature tests for camera reservation system.
 * Mirrors USB device reservation test patterns.
 */
class CameraReservationTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private User $admin;

    private Camera $camera;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->admin = User::factory()->admin()->create();
        $this->camera = Camera::factory()->for(Robot::factory())->create();
    }

    // ────────────────────────────────────────────────────────────────────
    // User Reservation Endpoints
    // ────────────────────────────────────────────────────────────────────

    public function test_user_can_list_own_reservations(): void
    {
        CameraReservation::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'camera_id' => $this->camera->id,
        ]);

        // Other user's reservations should not appear
        CameraReservation::factory()->create(['camera_id' => $this->camera->id]);

        $response = $this->actingAs($this->user)
            ->getJson('/camera-reservations');

        $response->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_user_can_create_reservation(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/camera-reservations', [
                'camera_id' => $this->camera->id,
                'start_at' => now()->addDay()->toIso8601String(),
                'end_at' => now()->addDay()->addHours(2)->toIso8601String(),
                'purpose' => 'Testing camera feed',
            ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.camera_id', $this->camera->id);

        $this->assertDatabaseHas('reservations', [
            'reservable_type' => 'App\Models\Camera',
            'reservable_id' => $this->camera->id,
            'user_id' => $this->user->id,
            'status' => 'pending',
        ]);
    }

    public function test_user_cannot_create_conflicting_reservation(): void
    {
        $start = now()->addDay();
        $end = now()->addDay()->addHours(2);

        // Create an approved reservation
        CameraReservation::factory()->create([
            'camera_id' => $this->camera->id,
            'status' => CameraReservationStatus::APPROVED,
            'requested_start_at' => $start,
            'requested_end_at' => $end,
            'approved_start_at' => $start,
            'approved_end_at' => $end,
            'approved_by' => $this->admin->id,
        ]);

        // Try to book overlapping time
        $response = $this->actingAs($this->user)
            ->postJson('/camera-reservations', [
                'camera_id' => $this->camera->id,
                'start_at' => $start->copy()->addMinutes(30)->toIso8601String(),
                'end_at' => $end->copy()->addMinutes(30)->toIso8601String(),
            ]);

        $response->assertUnprocessable()
            ->assertJsonPath('success', false);
    }

    public function test_user_can_cancel_own_reservation(): void
    {
        $reservation = CameraReservation::factory()->create([
            'user_id' => $this->user->id,
            'camera_id' => $this->camera->id,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/camera-reservations/{$reservation->id}/cancel");

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'cancelled');
    }

    public function test_user_cannot_cancel_other_users_reservation(): void
    {
        $other = User::factory()->create();
        $reservation = CameraReservation::factory()->create([
            'user_id' => $other->id,
            'camera_id' => $this->camera->id,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/camera-reservations/{$reservation->id}/cancel");

        $response->assertForbidden();
    }

    public function test_user_can_view_own_reservation(): void
    {
        $reservation = CameraReservation::factory()->create([
            'user_id' => $this->user->id,
            'camera_id' => $this->camera->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/camera-reservations/{$reservation->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $reservation->id);
    }

    public function test_user_can_view_camera_calendar(): void
    {
        CameraReservation::factory()->count(2)->create([
            'camera_id' => $this->camera->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/camera-reservations/cameras/{$this->camera->id}/calendar");

        $response->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_user_camera_catalog_only_shows_active_cameras_with_bound_or_attached_usb(): void
    {
        $gateway = GatewayNode::factory()->online()->verified()->create();

        $boundUsb = UsbDevice::factory()->for($gateway)->bound()->create();
        $attachedUsb = UsbDevice::factory()->for($gateway)->attached()->create();
        $availableUsb = UsbDevice::factory()->for($gateway)->available()->create();

        $visibleBoundCamera = Camera::factory()->create([
            'gateway_node_id' => $gateway->id,
            'usb_device_id' => $boundUsb->id,
            'robot_id' => null,
            'status' => CameraStatus::ACTIVE,
        ]);

        $visibleAttachedCamera = Camera::factory()->create([
            'gateway_node_id' => $gateway->id,
            'usb_device_id' => $attachedUsb->id,
            'robot_id' => null,
            'status' => CameraStatus::ACTIVE,
        ]);

        Camera::factory()->create([
            'gateway_node_id' => $gateway->id,
            'usb_device_id' => $availableUsb->id,
            'robot_id' => null,
            'status' => CameraStatus::ACTIVE,
        ]);

        Camera::factory()->inactive()->create([
            'gateway_node_id' => $gateway->id,
            'usb_device_id' => $boundUsb->id,
            'robot_id' => null,
        ]);

        Camera::factory()->for(Robot::factory())->create([
            'status' => CameraStatus::ACTIVE,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/camera-reservations/cameras');

        $response->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonFragment(['id' => $visibleBoundCamera->id])
            ->assertJsonFragment(['id' => $visibleAttachedCamera->id]);

        $returnedStatuses = collect($response->json('data'))->pluck('status')->unique()->values()->all();
        $this->assertSame([CameraStatus::ACTIVE->value], $returnedStatuses);

        $returnedUsbStatuses = UsbDevice::query()
            ->whereIn('id', collect($response->json('data'))->pluck('usb_device_id')->all())
            ->pluck('status')
            ->map(fn (UsbDeviceStatus|string $status) => $status instanceof UsbDeviceStatus ? $status->value : $status)
            ->unique()
            ->values()
            ->all();

        $this->assertEmpty(array_diff($returnedUsbStatuses, [
            UsbDeviceStatus::BOUND->value,
            UsbDeviceStatus::ATTACHED->value,
        ]));
    }

    public function test_unauthenticated_user_cannot_access_reservations(): void
    {
        $this->getJson('/camera-reservations')->assertUnauthorized();
        $this->postJson('/camera-reservations')->assertUnauthorized();
    }

    public function test_validation_rejects_invalid_reservation(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/camera-reservations', [
                'camera_id' => 9999, // doesn't exist
                'start_at' => now()->subDay()->toIso8601String(), // in the past
                'end_at' => now()->subDay()->subHours(2)->toIso8601String(),
            ]);

        $response->assertUnprocessable();
    }

    // ────────────────────────────────────────────────────────────────────
    // Admin Reservation Endpoints
    // ────────────────────────────────────────────────────────────────────

    public function test_admin_can_list_cameras(): void
    {
        Camera::factory()->count(3)->for(Robot::factory())->create();

        $response = $this->actingAs($this->admin)
            ->getJson('/admin/cameras');

        $response->assertOk()
            ->assertJsonCount(4, 'data'); // 3 + 1 from setUp

        // The returned cameras should include the new flag and it defaults to false
        $response->assertJsonPath('data.0.has_active_reservation', false);
    }

    public function test_admin_can_list_pending_reservations(): void
    {
        CameraReservation::factory()->count(2)->pending()->create([
            'camera_id' => $this->camera->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/admin/cameras/reservations/pending');

        $response->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_admin_can_approve_reservation(): void
    {
        $reservation = CameraReservation::factory()->create([
            'camera_id' => $this->camera->id,
            'user_id' => $this->user->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson("/admin/cameras/reservations/{$reservation->id}/approve", [
                'admin_notes' => 'Approved for testing',
            ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'approved');

        $this->assertDatabaseHas('reservations', [
            'id' => $reservation->id,
            'status' => 'approved',
            'approved_by' => $this->admin->id,
        ]);
    }

    public function test_admin_can_approve_with_modified_schedule(): void
    {
        $reservation = CameraReservation::factory()->create([
            'camera_id' => $this->camera->id,
            'user_id' => $this->user->id,
        ]);

        $newStart = now()->addDays(2);
        $newEnd = now()->addDays(2)->addHours(3);

        $response = $this->actingAs($this->admin)
            ->postJson("/admin/cameras/reservations/{$reservation->id}/approve", [
                'approved_start_at' => $newStart->toIso8601String(),
                'approved_end_at' => $newEnd->toIso8601String(),
            ]);

        $response->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('reservations', [
            'id' => $reservation->id,
            'status' => 'approved',
        ]);
    }

    public function test_admin_can_reject_reservation(): void
    {
        $reservation = CameraReservation::factory()->create([
            'camera_id' => $this->camera->id,
            'user_id' => $this->user->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson("/admin/cameras/reservations/{$reservation->id}/reject", [
                'admin_notes' => 'Camera unavailable',
            ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'rejected');
    }

    public function test_admin_cannot_approve_non_pending_reservation(): void
    {
        $reservation = CameraReservation::factory()->create([
            'camera_id' => $this->camera->id,
            'user_id' => $this->user->id,
            'status' => CameraReservationStatus::CANCELLED,
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson("/admin/cameras/reservations/{$reservation->id}/approve");

        $response->assertUnprocessable()
            ->assertJsonPath('success', false);
    }

    public function test_admin_can_create_block(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/admin/cameras/reservations/block', [
                'camera_id' => $this->camera->id,
                'start_at' => now()->addDay()->toIso8601String(),
                'end_at' => now()->addDay()->addHours(4)->toIso8601String(),
                'notes' => 'Maintenance window',
            ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.is_admin_block', true);

        $this->assertDatabaseHas('reservations', [
            'reservable_type' => 'App\Models\Camera',
            'reservable_id' => $this->camera->id,
            'purpose' => 'Admin block',
            'priority' => 100,
        ]);
    }

    public function test_admin_can_cancel_their_block(): void
    {
        $reservation = CameraReservation::factory()->adminBlock()->create([
            'camera_id' => $this->camera->id,
            'user_id' => $this->admin->id,
            'approved_start_at' => now()->subHour(),
            'approved_end_at' => now()->addHour(),
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson("/camera-reservations/{$reservation->id}/cancel");

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'cancelled');

        $this->assertDatabaseHas('reservations', [
            'id' => $reservation->id,
            'status' => 'cancelled',
        ]);
    }

    public function test_admin_cannot_create_conflicting_block(): void
    {
        $start = now()->addDay();
        $end = $start->copy()->addHours(2);

        // Already existing approved reservation/block
        CameraReservation::factory()->create([
            'camera_id' => $this->camera->id,
            'status' => CameraReservationStatus::APPROVED,
            'requested_start_at' => $start,
            'requested_end_at' => $end,
            'approved_start_at' => $start,
            'approved_end_at' => $end,
            'approved_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson('/admin/cameras/reservations/block', [
                'camera_id' => $this->camera->id,
                'start_at' => $start->copy()->addMinutes(30)->toIso8601String(),
                'end_at' => $end->copy()->addMinutes(30)->toIso8601String(),
                'notes' => 'Another block',
            ]);

        $response->assertUnprocessable()
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Time slot conflicts with existing reservation');
    }

    public function test_admin_can_view_all_reservations(): void
    {
        CameraReservation::factory()->count(5)->create([
            'camera_id' => $this->camera->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/admin/cameras/reservations');

        $response->assertOk()
            ->assertJsonCount(5, 'data');
    }

    public function test_admin_can_filter_reservations_by_status(): void
    {
        CameraReservation::factory()->count(2)->create([
            'camera_id' => $this->camera->id,
            'status' => CameraReservationStatus::PENDING,
        ]);
        CameraReservation::factory()->create([
            'camera_id' => $this->camera->id,
            'status' => CameraReservationStatus::APPROVED,
            'approved_by' => $this->admin->id,
            'approved_start_at' => now()->addDay(),
            'approved_end_at' => now()->addDay()->addHours(2),
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/admin/cameras/reservations?status=pending');

        $response->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_admin_can_view_upcoming_reservations(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson('/admin/cameras/reservations/upcoming');

        $response->assertOk()
            ->assertJsonStructure(['active', 'upcoming']);
    }

    public function test_admin_camera_list_shows_active_flag(): void
    {
        // create a camera and an active reservation for it
        $camera = Camera::factory()->for(Robot::factory())->create();
        CameraReservation::factory()->create([
            'camera_id' => $camera->id,
            'status' => CameraReservationStatus::APPROVED,
            'approved_by' => $this->admin->id,
            'requested_start_at' => now()->subHour(),
            'requested_end_at' => now()->addHour(),
            'approved_start_at' => now()->subHour(),
            'approved_end_at' => now()->addHour(),
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/admin/cameras');

        $response->assertOk();
        // find our camera in the array
        $found = collect($response->json('data'))->firstWhere('id', $camera->id);
        $this->assertNotNull($found);
        $this->assertTrue($found['has_active_reservation']);
    }

    public function test_non_admin_cannot_access_admin_endpoints(): void
    {
        $this->actingAs($this->user)
            ->getJson('/admin/cameras')
            ->assertForbidden();

        $this->actingAs($this->user)
            ->getJson('/admin/cameras/reservations/pending')
            ->assertForbidden();
    }

    // ────────────────────────────────────────────────────────────────────
    // CameraReservation Model Tests
    // ────────────────────────────────────────────────────────────────────

    public function test_reservation_effective_schedule_uses_approved_dates(): void
    {
        $requested = now()->addDay();
        $approved = now()->addDays(2);

        $reservation = CameraReservation::factory()->create([
            'camera_id' => $this->camera->id,
            'requested_start_at' => $requested,
            'requested_end_at' => $requested->copy()->addHours(2),
            'approved_start_at' => $approved,
            'approved_end_at' => $approved->copy()->addHours(3),
            'status' => CameraReservationStatus::APPROVED,
            'approved_by' => $this->admin->id,
        ]);

        $this->assertEquals(
            $approved->format('Y-m-d H:i'),
            $reservation->effective_start->format('Y-m-d H:i')
        );
    }

    public function test_reservation_effective_schedule_falls_back_to_requested(): void
    {
        $requested = now()->addDay();

        $reservation = CameraReservation::factory()->create([
            'camera_id' => $this->camera->id,
            'requested_start_at' => $requested,
            'requested_end_at' => $requested->copy()->addHours(2),
        ]);

        $this->assertEquals(
            $requested->format('Y-m-d H:i'),
            $reservation->effective_start->format('Y-m-d H:i')
        );
    }

    public function test_reservation_overlaps_detection(): void
    {
        $start = now()->addDay();
        $end = $start->copy()->addHours(2);

        $reservation = CameraReservation::factory()->create([
            'camera_id' => $this->camera->id,
            'requested_start_at' => $start,
            'requested_end_at' => $end,
        ]);

        // Overlapping range
        $this->assertTrue($reservation->overlaps(
            $start->copy()->addMinutes(30),
            $end->copy()->addMinutes(30)
        ));

        // Non-overlapping range
        $this->assertFalse($reservation->overlaps(
            $end->copy()->addHour(),
            $end->copy()->addHours(3)
        ));
    }

    public function test_camera_has_active_reservation(): void
    {
        CameraReservation::factory()->create([
            'camera_id' => $this->camera->id,
            'status' => CameraReservationStatus::APPROVED,
            'approved_by' => $this->admin->id,
            'requested_start_at' => now()->subHour(),
            'requested_end_at' => now()->addHour(),
            'approved_start_at' => now()->subHour(),
            'approved_end_at' => now()->addHour(),
        ]);

        $this->assertTrue($this->camera->hasActiveReservation());
    }

    public function test_camera_without_active_reservation(): void
    {
        $this->assertFalse($this->camera->hasActiveReservation());
    }
}
