<?php

namespace Tests\Feature;

use App\Models\ProxmoxNode;
use App\Models\Reservation;
use App\Models\TrainingPath;
use App\Models\TrainingPathEnrollment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VMReservationTest extends TestCase
{
    use RefreshDatabase;

    public function test_engineer_can_create_vm_reservation_for_enrolled_training_path(): void
    {
        $engineer = User::factory()->engineer()->create();
        $node = ProxmoxNode::factory()->online()->create();
        $trainingPath = TrainingPath::factory()->approved()->create();

        TrainingPathEnrollment::create([
            'user_id' => $engineer->id,
            'training_path_id' => $trainingPath->id,
            'enrolled_at' => now(),
        ]);

        $response = $this->actingAs($engineer)->postJson('/vm-reservations', [
            'node_id' => $node->id,
            'vm_id' => 401,
            'vm_name' => 'Windows 11 Lab VM',
            'training_path_id' => $trainingPath->id,
            'start_at' => now()->addDay()->toIso8601String(),
            'end_at' => now()->addDay()->addHours(2)->toIso8601String(),
            'purpose' => 'Hands-on industrial networking lab',
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.training_path_id', $trainingPath->id)
            ->assertJsonPath('data.vm_id', 401);

        $this->assertDatabaseHas('reservations', [
            'reservable_type' => ProxmoxNode::class,
            'reservable_id' => $node->id,
            'target_vm_id' => 401,
            'training_path_id' => $trainingPath->id,
            'status' => 'pending',
        ]);
    }

    public function test_admin_approval_marks_first_training_path_vm_as_backup(): void
    {
        $admin = User::factory()->admin()->create();
        $engineer = User::factory()->engineer()->create();
        $node = ProxmoxNode::factory()->online()->create();
        $trainingPath = TrainingPath::factory()->approved()->create();

        $reservation = Reservation::factory()->create([
            'reservable_type' => ProxmoxNode::class,
            'reservable_id' => $node->id,
            'target_vm_id' => 501,
            'user_id' => $engineer->id,
            'training_path_id' => $trainingPath->id,
            'status' => 'pending',
            'requested_start_at' => now()->addDay(),
            'requested_end_at' => now()->addDay()->addHours(2),
        ]);

        $response = $this->actingAs($admin)
            ->postJson("/admin/vm-reservations/{$reservation->id}/approve", []);

        $response->assertOk()->assertJsonPath('success', true);

        $reservation->refresh();
        $this->assertSame('approved', $reservation->status->value);
        $this->assertTrue((bool) $reservation->is_backup_for_training_path);
    }

    public function test_admin_approval_marks_second_training_path_vm_not_backup_when_backup_exists(): void
    {
        $admin = User::factory()->admin()->create();
        $engineer = User::factory()->engineer()->create();
        $node = ProxmoxNode::factory()->online()->create();
        $trainingPath = TrainingPath::factory()->approved()->create();

        Reservation::factory()->create([
            'reservable_type' => ProxmoxNode::class,
            'reservable_id' => $node->id,
            'target_vm_id' => 601,
            'user_id' => $engineer->id,
            'training_path_id' => $trainingPath->id,
            'status' => 'approved',
            'approved_by' => $admin->id,
            'approved_start_at' => now()->addHours(1),
            'approved_end_at' => now()->addHours(3),
            'is_backup_for_training_path' => true,
        ]);

        $second = Reservation::factory()->create([
            'reservable_type' => ProxmoxNode::class,
            'reservable_id' => $node->id,
            'target_vm_id' => 602,
            'user_id' => $engineer->id,
            'training_path_id' => $trainingPath->id,
            'status' => 'pending',
            'requested_start_at' => now()->addDay(),
            'requested_end_at' => now()->addDay()->addHours(2),
        ]);

        $response = $this->actingAs($admin)
            ->postJson("/admin/vm-reservations/{$second->id}/approve", []);

        $response->assertOk()->assertJsonPath('success', true);

        $second->refresh();
        $this->assertFalse((bool) $second->is_backup_for_training_path);
    }
}
