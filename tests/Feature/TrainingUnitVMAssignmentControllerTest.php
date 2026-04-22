<?php

namespace Tests\Feature;

use App\Enums\TrainingUnitVMAssignmentStatus;
use App\Models\ProxmoxNode;
use App\Models\TrainingPath;
use App\Models\TrainingPathModule;
use App\Models\TrainingUnit;
use App\Models\TrainingUnitVMAssignment;
use App\Models\User;
use App\Services\TrainingUnitVMAssignmentService;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class TrainingUnitVMAssignmentControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $teacher;

    private User $engineer;

    private TrainingUnit $trainingUnit;

    private ProxmoxNode $node;

    private $assignmentServiceMock;

    protected function setUp(): void
    {
        parent::setUp();

        $this->teacher = User::factory()->teacher()->create();
        $this->engineer = User::factory()->engineer()->create();
        $trainingPath = TrainingPath::factory()->approved()->create([
            'instructor_id' => $this->teacher->id,
        ]);
        $module = TrainingPathModule::factory()->create([
            'training_path_id' => $trainingPath->id,
        ]);
        $this->trainingUnit = TrainingUnit::factory()->create([
            'module_id' => $module->id,
        ]);
        $this->node = ProxmoxNode::factory()->create();

        $this->assignmentServiceMock = Mockery::mock(
            TrainingUnitVMAssignmentService::class,
        );
        $this->app->instance(
            TrainingUnitVMAssignmentService::class,
            $this->assignmentServiceMock,
        );
    }

    public function test_teacher_can_view_available_vms(): void
    {
        $this->assignmentServiceMock
            ->shouldReceive('getAvailableVMs')
            ->once()
            ->andReturn([
                [
                    'vmid' => 101,
                    'name' => 'Ubuntu Lab',
                    'status' => 'running',
                    'node_id' => $this->node->id,
                    'node_name' => $this->node->name,
                    'server_id' => 1,
                    'server_name' => 'Primary Cluster',
                ],
            ]);

        $response = $this->actingAs($this->teacher)
            ->getJson('/teaching/trainingUnit-assignments/available-vms');

        $response->assertOk()
            ->assertJsonPath('data.0.vmid', 101)
            ->assertJsonPath('data.0.node_id', $this->node->id);
    }

    public function test_teacher_can_submit_vm_assignment(): void
    {
        $assignment = TrainingUnitVMAssignment::create([
            'training_unit_id' => $this->trainingUnit->id,
            'status' => TrainingUnitVMAssignmentStatus::PENDING,
            'vm_id' => 101,
            'node_id' => $this->node->id,
            'vm_name' => 'Ubuntu Lab',
            'assigned_by' => $this->teacher->id,
            'teacher_notes' => 'Please approve this VM for the lab.',
        ])->load([
            'trainingUnit.module.trainingPath',
            'node',
            'assignedByUser',
        ]);

        $this->assignmentServiceMock
            ->shouldReceive('assignVMToTrainingUnit')
            ->once()
            ->withArgs(function (
                TrainingUnit $trainingUnit,
                int $vmId,
                int $nodeId,
                string $vmName,
                User $teacher,
                ?string $notes,
            ) {
                return $trainingUnit->is($this->trainingUnit)
                    && $vmId === 101
                    && $nodeId === $this->node->id
                    && $vmName === 'Ubuntu Lab'
                    && $teacher->is($this->teacher)
                    && $notes === 'Please approve this VM for the lab.';
            })
            ->andReturn($assignment);

        $response = $this->actingAs($this->teacher)
            ->postJson('/teaching/trainingUnit-assignments', [
                'training_unit_id' => $this->trainingUnit->id,
                'vm_id' => 101,
                'node_id' => $this->node->id,
                'vm_name' => 'Ubuntu Lab',
                'teacher_notes' => 'Please approve this VM for the lab.',
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.training_unit_id', $this->trainingUnit->id)
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('message', 'VM assignment submitted for admin approval.');
    }

    public function test_teacher_can_view_their_vm_assignments(): void
    {
        $assignment = TrainingUnitVMAssignment::create([
            'training_unit_id' => $this->trainingUnit->id,
            'status' => TrainingUnitVMAssignmentStatus::APPROVED,
            'vm_id' => 202,
            'node_id' => $this->node->id,
            'vm_name' => 'Windows Lab',
            'assigned_by' => $this->teacher->id,
        ])->load(['trainingUnit.module.trainingPath', 'node']);

        $this->assignmentServiceMock
            ->shouldReceive('getAssignmentsForTeacher')
            ->once()
            ->with($this->teacher)
            ->andReturn(new EloquentCollection([$assignment]));

        $response = $this->actingAs($this->teacher)
            ->getJson('/teaching/trainingUnit-assignments/my-assignments');

        $response->assertOk()
            ->assertJsonPath('data.0.training_unit_id', $this->trainingUnit->id)
            ->assertJsonPath('data.0.status', 'approved')
            ->assertJsonPath('data.0.trainingUnit.title', $this->trainingUnit->title);
    }

    public function test_teacher_can_view_assignment_status_for_a_training_unit(): void
    {
        $assignment = TrainingUnitVMAssignment::create([
            'training_unit_id' => $this->trainingUnit->id,
            'status' => TrainingUnitVMAssignmentStatus::APPROVED,
            'vm_id' => 303,
            'node_id' => $this->node->id,
            'vm_name' => 'PLC Simulator',
            'assigned_by' => $this->teacher->id,
        ])->load(['node', 'assignedByUser', 'approvedByUser']);

        $this->assignmentServiceMock
            ->shouldReceive('getApprovedAssignment')
            ->once()
            ->with($this->trainingUnit->id)
            ->andReturn($assignment);

        $response = $this->actingAs($this->teacher)
            ->getJson("/teaching/trainingUnits/{$this->trainingUnit->id}/vm-assignment");

        $response->assertOk()
            ->assertJsonPath('data.training_unit_id', $this->trainingUnit->id)
            ->assertJsonPath('data.vm_id', 303);
    }

    public function test_teacher_can_remove_their_pending_vm_assignment(): void
    {
        $assignment = TrainingUnitVMAssignment::create([
            'training_unit_id' => $this->trainingUnit->id,
            'status' => TrainingUnitVMAssignmentStatus::PENDING,
            'vm_id' => 101,
            'node_id' => $this->node->id,
            'vm_name' => 'Ubuntu Lab',
            'assigned_by' => $this->teacher->id,
        ]);

        $this->assignmentServiceMock
            ->shouldReceive('removeAssignment')
            ->once()
            ->withArgs(function (
                TrainingUnitVMAssignment $receivedAssignment,
                User $teacher,
            ) use ($assignment) {
                return $receivedAssignment->is($assignment)
                    && $teacher->is($this->teacher);
            })
            ->andReturnTrue();

        $response = $this->actingAs($this->teacher)
            ->deleteJson("/teaching/trainingUnit-assignments/{$assignment->id}");

        $response->assertOk()
            ->assertJsonPath('message', 'Assignment removed successfully.');
    }

    public function test_non_teacher_cannot_access_teacher_vm_assignment_endpoints(): void
    {
        $this->actingAs($this->engineer)
            ->getJson('/teaching/trainingUnit-assignments/available-vms')
            ->assertForbidden();

        $this->actingAs($this->engineer)
            ->postJson('/teaching/trainingUnit-assignments', [
                'training_unit_id' => $this->trainingUnit->id,
                'vm_id' => 101,
                'node_id' => $this->node->id,
                'vm_name' => 'Ubuntu Lab',
            ])
            ->assertForbidden();

        $this->actingAs($this->engineer)
            ->getJson('/teaching/trainingUnit-assignments/my-assignments')
            ->assertForbidden();
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
