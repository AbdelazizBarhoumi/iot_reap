<?php

namespace App\Models;

use App\Enums\VMSessionProtocol;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * VM Template model — represents a reusable VM configuration from Proxmox.
 *
 * @property int $id
 * @property int $proxmox_server_id
 * @property int $node_id
 * @property int $vmid
 * @property string $name
 * @property string|null $description
 * @property string $os_type
 * @property VMSessionProtocol $protocol
 * @property string|null $admin_description
 * @property bool $maintenance_mode
 * @property string|null $maintenance_notes
 * @property \DateTime|null $maintenance_until
 * @property bool $is_active
 * @property \DateTime $created_at
 * @property \DateTime $updated_at
 */
class VMTemplate extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     * Explicitly set because Laravel's snake_case conversion produces "v_m_templates"
     * instead of the intended "vm_templates".
     */
    protected $table = 'vm_templates';

    protected $fillable = [
        'proxmox_server_id',
        'node_id',
        'vmid',
        'name',
        'description',
        'os_type',
        'protocol',
        'admin_description',
        'maintenance_mode',
        'maintenance_notes',
        'maintenance_until',
        'is_active',
    ];

    protected $casts = [
        'proxmox_server_id' => 'integer',
        'node_id' => 'integer',
        'vmid' => 'integer',
        'protocol' => VMSessionProtocol::class,
        'maintenance_mode' => 'boolean',
        'maintenance_until' => 'datetime',
        'is_active' => 'boolean',
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // Relationships
    // ─────────────────────────────────────────────────────────────────────────

    public function proxmoxServer(): BelongsTo
    {
        return $this->belongsTo(ProxmoxServer::class);
    }

    public function node(): BelongsTo
    {
        return $this->belongsTo(ProxmoxNode::class, 'node_id');
    }

    public function lessonAssignments(): HasMany
    {
        return $this->hasMany(LessonVMAssignment::class);
    }

    public function queueEntries(): HasMany
    {
        return $this->hasMany(VMSessionQueue::class)->orderBy('position');
    }

    public function activeSessions(): HasMany
    {
        return $this->hasMany(VMSession::class, 'vm_id', 'vmid')
            ->where('proxmox_server_id', $this->proxmox_server_id)
            ->whereIn('status', ['pending', 'provisioning', 'active']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Scopes
    // ─────────────────────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeAvailable($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->where('maintenance_mode', false)
                    ->orWhere(function ($q2) {
                        $q2->where('maintenance_mode', true)
                            ->whereNotNull('maintenance_until')
                            ->where('maintenance_until', '<', now());
                    });
            });
    }

    public function scopeInMaintenance($query)
    {
        return $query->where('maintenance_mode', true)
            ->where(function ($q) {
                $q->whereNull('maintenance_until')
                    ->orWhere('maintenance_until', '>', now());
            });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helper Methods
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Check if the template is currently in maintenance.
     */
    public function isInMaintenance(): bool
    {
        if (! $this->maintenance_mode) {
            return false;
        }

        if ($this->maintenance_until === null) {
            return true;
        }

        return $this->maintenance_until->isFuture();
    }

    /**
     * Check if the template is available for new sessions.
     */
    public function isAvailable(): bool
    {
        return $this->is_active && ! $this->isInMaintenance();
    }

    /**
     * Check if there's an active session using this template.
     */
    public function hasActiveSession(): bool
    {
        return VMSession::where('vm_id', $this->vmid)
            ->where('proxmox_server_id', $this->proxmox_server_id)
            ->whereIn('status', ['pending', 'provisioning', 'active'])
            ->exists();
    }

    /**
     * Get the current active session for this template (if any).
     */
    public function getCurrentSession(): ?VMSession
    {
        return VMSession::where('vm_id', $this->vmid)
            ->where('proxmox_server_id', $this->proxmox_server_id)
            ->whereIn('status', ['pending', 'provisioning', 'active'])
            ->with('user')
            ->first();
    }

    /**
     * Get queue position for a user.
     */
    public function getQueuePositionFor(string $userId): ?int
    {
        $entry = $this->queueEntries()->where('user_id', $userId)->first();

        return $entry?->position;
    }

    /**
     * Get estimated wait time based on queue position and average session duration.
     */
    public function getEstimatedWaitMinutes(int $position): int
    {
        $currentSession = $this->getCurrentSession();
        $baseWait = 0;

        if ($currentSession && $currentSession->expires_at) {
            $baseWait = max(0, now()->diffInMinutes($currentSession->expires_at, false));
        }

        // Assume 60 minutes average session for queued users ahead
        $queueWait = ($position - 1) * 60;

        return $baseWait + $queueWait;
    }

    /**
     * Set maintenance mode.
     */
    public function setMaintenance(string $notes, ?\DateTime $until = null): void
    {
        $this->maintenance_mode = true;
        $this->maintenance_notes = $notes;
        $this->maintenance_until = $until;
        $this->save();
    }

    /**
     * Clear maintenance mode.
     */
    public function clearMaintenance(): void
    {
        $this->maintenance_mode = false;
        $this->maintenance_notes = null;
        $this->maintenance_until = null;
        $this->save();
    }
}
