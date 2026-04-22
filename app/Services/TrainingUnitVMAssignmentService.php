<?php

namespace App\Services;

use App\Enums\ProxmoxNodeStatus;
use App\Enums\TrainingUnitVMAssignmentStatus;
use App\Enums\UserRole;
use App\Models\ProxmoxNode;
use App\Models\ProxmoxServer;
use App\Models\TrainingUnit;
use App\Models\TrainingUnitVMAssignment;
use App\Models\User;
use App\Repositories\TrainingUnitVMAssignmentRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class TrainingUnitVMAssignmentService
{
    private const VM_LIST_CACHE_TTL = 60; // seconds

    public function __construct(
        private TrainingUnitVMAssignmentRepository $assignmentRepository,
        private ProxmoxClientFactory $clientFactory,
    ) {}

    /**
     * Get all pending assignments for admin review.
     */
    public function getPendingAssignments(): Collection
    {
        return $this->assignmentRepository->findPending();
    }

    /**
     * Get the approved VM assignment for a trainingUnit.
     */
    public function getApprovedAssignment(int $trainingUnitId): ?TrainingUnitVMAssignment
    {
        return $this->assignmentRepository->findApprovedForTrainingUnit($trainingUnitId);
    }

    /**
     * Assign a Proxmox VM to a trainingUnit (teacher action).
     *
     * @param  int  $vmId  Proxmox VMID
     * @param  int  $nodeId  ProxmoxNode ID
     * @param  string  $vmName  VM name for display
     */
    public function assignVMToTrainingUnit(
        TrainingUnit $trainingUnit,
        int $vmId,
        int $nodeId,
        string $vmName,
        User $teacher,
        ?string $notes = null
    ): TrainingUnitVMAssignment {
        // Check if trainingUnit already has an active assignment
        if ($this->assignmentRepository->hasActiveAssignment($trainingUnit->id)) {
            throw new \RuntimeException('This trainingUnit already has a pending or approved VM assignment.');
        }

        // Verify teacher owns the trainingPath
        $trainingPath = $trainingUnit->module->trainingPath;
        if ($trainingPath->instructor_id !== $teacher->id && ! $teacher->isAdmin()) {
            throw new \RuntimeException('You do not have permission to assign VMs to this trainingUnit.');
        }

        // Verify the node exists and is online
        $node = ProxmoxNode::where('id', $nodeId)
            ->where('status', ProxmoxNodeStatus::ONLINE)
            ->first();

        if (! $node) {
            throw new \RuntimeException('Selected node is not available (may be offline).');
        }

        return $this->assignmentRepository->create([
            'training_unit_id' => $trainingUnit->id,
            'vm_id' => $vmId,
            'node_id' => $nodeId,
            'vm_name' => $vmName,
            'assigned_by' => $teacher->id,
            'status' => TrainingUnitVMAssignmentStatus::PENDING,
            'teacher_notes' => $notes,
        ]);
    }

    /**
     * Approve an assignment (admin action).
     */
    public function approveAssignment(
        TrainingUnitVMAssignment $assignment,
        User $admin,
        ?string $notes = null
    ): TrainingUnitVMAssignment {
        if (! $assignment->isPending()) {
            throw new \RuntimeException('Only pending assignments can be approved.');
        }

        $assignment->approve($admin, $notes);

        return $assignment->fresh(['trainingUnit', 'node', 'approvedByUser']);
    }

    /**
     * Reject an assignment (admin action).
     */
    public function rejectAssignment(
        TrainingUnitVMAssignment $assignment,
        User $admin,
        ?string $notes = null
    ): TrainingUnitVMAssignment {
        if (! $assignment->isPending()) {
            throw new \RuntimeException('Only pending assignments can be rejected.');
        }

        if (! $notes) {
            throw new \RuntimeException('Rejection requires a reason/notes.');
        }

        $assignment->reject($admin, $notes);

        return $assignment->fresh(['trainingUnit', 'node', 'approvedByUser']);
    }

    /**
     * Remove an assignment (teacher can remove their pending, admin can remove any).
     */
    public function removeAssignment(TrainingUnitVMAssignment $assignment, User $user): bool
    {
        // Teachers can only remove pending assignments they created
        if (! $user->isAdmin()) {
            if ($assignment->assigned_by !== $user->id) {
                throw new \RuntimeException('You can only remove assignments you created.');
            }
            if (! $assignment->isPending()) {
                throw new \RuntimeException('You can only remove pending assignments. Contact admin for approved assignments.');
            }
        }

        // If removing approved assignment, also disable VM on trainingUnit
        if ($assignment->isApproved()) {
            $assignment->trainingUnit->update(['vm_enabled' => false]);
        }

        return $this->assignmentRepository->delete($assignment);
    }

    /**
     * Get available VMs from all active Proxmox servers.
     * This replaces the old getAvailableTemplates() method.
     *
     * @return array<int, array{vmid: int, name: string, status: string, node_id: int, node_name: string, server_id: int, server_name: string}>
     */
    public function getAvailableVMs(): array
    {
        $servers = ProxmoxServer::where('is_active', true)->get();

        if ($servers->isEmpty()) {
            return [];
        }

        $vms = [];

        foreach ($servers as $server) {
            if (! $server instanceof ProxmoxServer) {
                continue;
            }

            $nodes = ProxmoxNode::where('proxmox_server_id', $server->id)
                ->where('status', ProxmoxNodeStatus::ONLINE)
                ->get();

            foreach ($nodes as $node) {
                $cacheKey = "training_unit_vm_browser:{$server->id}:{$node->name}";

                $nodeVMs = Cache::remember($cacheKey, self::VM_LIST_CACHE_TTL, function () use ($server, $node) {
                    try {
                        $client = $this->clientFactory->make($server);

                        return $client->listVMsLight($node->name);
                    } catch (\Throwable $e) {
                        Log::warning('Failed to list VMs for trainingUnit assignment', [
                            'node' => $node->name,
                            'error' => $e->getMessage(),
                        ]);

                        return [];
                    }
                });

                foreach ($nodeVMs as $vm) {
                    // Skip templates in the list
                    if (! empty($vm['template'])) {
                        continue;
                    }

                    $vms[] = [
                        'vmid' => $vm['vmid'] ?? 0,
                        'name' => $vm['name'] ?? "VM {$vm['vmid']}",
                        'status' => $vm['status'] ?? 'unknown',
                        'node_id' => $node->id,
                        'node_name' => $node->name,
                        'server_id' => $server->id,
                        'server_name' => $server->name,
                    ];
                }
            }
        }

        return $vms;
    }

    /**
     * Get assignments for a teacher's trainingPaths.
     */
    public function getAssignmentsForTeacher(User $teacher): Collection
    {
        return $this->assignmentRepository->findByTeacher($teacher->id);
    }

    /**
     * Get the VM info a user can access for a trainingUnit.
     * Returns null if not enrolled, no approved assignment, or trainingUnit not VM-enabled.
     *
     * @return array{vm_id: int, node_id: int, vm_name: string|null}|null
     */
    public function getAccessibleVMForTrainingUnit(int $trainingUnitId, User $user): ?array
    {
        $trainingUnit = TrainingUnit::with('module.trainingPath.enrollments')->findOrFail($trainingUnitId);

        // Check if user is enrolled in the trainingPath
        $isEnrolled = $trainingUnit->module->trainingPath->enrollments()
            ->where('user_id', $user->id)
            ->exists();

        if (! $isEnrolled && ! $user->isAdmin() && ! $user->hasRole(UserRole::TEACHER)) {
            return null;
        }

        // Get the approved assignment
        $assignment = $this->assignmentRepository->findApprovedForTrainingUnit($trainingUnitId);

        if (! $assignment) {
            return null;
        }

        return [
            'vm_id' => $assignment->vm_id,
            'node_id' => $assignment->node_id,
            'vm_name' => $assignment->vm_name,
        ];
    }
}
