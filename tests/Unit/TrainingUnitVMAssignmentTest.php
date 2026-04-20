<?php

namespace Tests\Unit;

use App\Enums\TrainingUnitVMAssignmentStatus;
use App\Models\TrainingUnit;
use App\Models\TrainingUnitVMAssignment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TrainingUnitVMAssignmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_assignment_can_load_assigned_by_user_relation(): void
    {
        $teacher = User::factory()->create();
        $trainingUnit = TrainingUnit::factory()->create();

        $assignment = TrainingUnitVMAssignment::create([
            'training_unit_id' => $trainingUnit->id,
            'status' => TrainingUnitVMAssignmentStatus::PENDING,
            'assigned_by' => $teacher->id,
        ]);

        $assignment->load('assignedByUser');

        $this->assertNotNull($assignment->assignedByUser);
        $this->assertEquals($teacher->id, $assignment->assignedByUser->id);
    }
}
