<?php

namespace App\Models;

use App\Enums\TrainingUnitVMAssignmentStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * VM assignment for a trainingUnit (teacher → admin approval workflow).
 *
 * Teachers select a Proxmox VM (vmid + node) for a trainingUnit, then admin approves.
 *
 * @property int $id
 * @property int $training_unit_id
 * @property TrainingUnitVMAssignmentStatus $status
 * @property int|null $vm_id Proxmox VMID
 * @property int|null $node_id FK to proxmox_nodes
 * @property string|null $vm_name Cached VM name for display
 * @property string|null $teacher_notes
 * @property string|null $admin_feedback
 * @property string|null $assigned_by ULID of teacher who assigned
 * @property string|null $approved_by ULID of admin who approved/rejected
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 *
 * @property-read TrainingUnit $trainingUnit
 * @property-read ProxmoxNode|null $node
 * @property-read User|null $assignedByUser
 * @property-read User|null $approvedByUser
 */
class TrainingUnitVMAssignment extends Model
{
    use HasFactory;

    protected $table = 'training_unit_vm_assignments';

    protected $fillable = [
        'training_unit_id',
        'status',
        'vm_id',
        'node_id',
        'vm_name',
        'teacher_notes',
        'admin_feedback',
        'assigned_by',
        'approved_by',
    ];

    protected $casts = [
        'status' => TrainingUnitVMAssignmentStatus::class,
        'vm_id' => 'integer',
        'node_id' => 'integer',
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // Relationships
    // ─────────────────────────────────────────────────────────────────────────

    public function trainingUnit(): BelongsTo
    {
        return $this->belongsTo(TrainingUnit::class);
    }

    public function node(): BelongsTo
    {
        return $this->belongsTo(ProxmoxNode::class, 'node_id');
    }

    public function assignedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function approvedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Status Helpers
    // ─────────────────────────────────────────────────────────────────────────

    public function isPending(): bool
    {
        return $this->status === TrainingUnitVMAssignmentStatus::PENDING;
    }

    public function isApproved(): bool
    {
        return $this->status === TrainingUnitVMAssignmentStatus::APPROVED;
    }

    public function isRejected(): bool
    {
        return $this->status === TrainingUnitVMAssignmentStatus::REJECTED;
    }

    public function approve(User $admin, ?string $feedback = null): self
    {
        $this->status = TrainingUnitVMAssignmentStatus::APPROVED;
        $this->approved_by = $admin->id;
        if ($feedback !== null) {
            $this->admin_feedback = $feedback;
        }
        $this->save();

        return $this;
    }

    public function reject(User $admin, string $feedback): self
    {
        $this->status = TrainingUnitVMAssignmentStatus::REJECTED;
        $this->approved_by = $admin->id;
        $this->admin_feedback = $feedback;
        $this->save();

        return $this;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Scopes
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Scope to only pending assignments.
     */
    public function scopePending($query)
    {
        return $query->where('status', TrainingUnitVMAssignmentStatus::PENDING);
    }
}

