<?php

namespace Tests\Unit\Resources;

use App\Enums\CameraReservationStatus;
use App\Http\Resources\CameraResource;
use App\Models\Camera;
use App\Models\Reservation;
use App\Models\Robot;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CameraResourceTest extends TestCase
{
    use RefreshDatabase;

    public function test_camera_resource_includes_reservation_flag()
    {
        $camera = Camera::factory()->for(Robot::factory())->create();
        $user = User::factory()->create();

        // initially there should be no active reservation
        $resource = new CameraResource($camera);
        $array = $resource->toArray(request());
        $this->assertArrayHasKey('has_active_reservation', $array);
        $this->assertFalse($array['has_active_reservation']);
        // field always present but null when nothing active
        $this->assertArrayHasKey('active_reservation_id', $array);
        $this->assertNull($array['active_reservation_id']);

        // create an active reservation overlapping now
        $createdReservation = Reservation::factory()->forCamera($camera)->create([
            'status' => CameraReservationStatus::APPROVED->value,
            'approved_by' => $user->id,
            'requested_start_at' => now()->subHour(),
            'requested_end_at' => now()->addHour(),
            'approved_start_at' => now()->subHour(),
            'approved_end_at' => now()->addHour(),
        ]);

        $camera->refresh();
        $resource = new CameraResource($camera);
        $array = $resource->toArray(request());
        $this->assertTrue($array['has_active_reservation']);
        // reservation id should be included and match what we just created
        $this->assertEquals($createdReservation->id, $array['active_reservation_id']);
    }
}
