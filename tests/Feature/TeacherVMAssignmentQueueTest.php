<?php

namespace Tests\Feature;

use App\Enums\TrainingUnitType;
use App\Enums\TrainingUnitVMAssignmentStatus;
use App\Models\ProxmoxNode;
use App\Models\TrainingPath;
use App\Models\TrainingPathModule;
use App\Models\TrainingUnit;
use App\Models\TrainingUnitVMAssignment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeacherVMAssignmentQueueTest extends TestCase
{
    use RefreshDatabase;

    public function test_teacher_sees_vm_assignments_for_their_training_paths(): void
    {
        $teacher = User::factory()->teacher()->create();
        $admin = User::factory()->admin()->create();
        $node = ProxmoxNode::factory()->create();

        $trainingPath = TrainingPath::factory()
            ->approved()
            ->forInstructor($teacher)
            ->create([
                'title' => 'Industrial Automation',
            ]);

        $module = TrainingPathModule::factory()->create([
            'training_path_id' => $trainingPath->id,
            'title' => 'Automation Labs',
        ]);

        $trainingUnit = TrainingUnit::factory()->create([
            'module_id' => $module->id,
            'type' => TrainingUnitType::VM_LAB,
            'vm_enabled' => true,
            'title' => 'PLC Simulator Lab',
        ]);

        $assignment = TrainingUnitVMAssignment::create([
            'training_unit_id' => $trainingUnit->id,
            'status' => TrainingUnitVMAssignmentStatus::PENDING,
            'vm_id' => 401,
            'node_id' => $node->id,
            'vm_name' => 'PLC Simulator',
            'assigned_by' => $admin->id,
            'teacher_notes' => 'Needed for the next lab session.',
        ]);

        $response = $this->actingAs($teacher)
            ->getJson('/teaching/trainingUnit-assignments/my-assignments');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $assignment->id)
            ->assertJsonPath('data.0.trainingUnit.title', 'PLC Simulator Lab')
            ->assertJsonPath('data.0.trainingUnit.module.trainingPath.title', 'Industrial Automation')
            ->assertJsonPath('data.0.assigned_by.id', $admin->id)
            ->assertJsonPath('data.0.status', 'pending');
    }
}
