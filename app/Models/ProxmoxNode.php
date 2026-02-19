<?php

namespace App\Models;

use App\Enums\ProxmoxNodeStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * App Proxmox node model.
 *
 * @property int $id
 * @property int|null $proxmox_server_id
 * @property string $name
 * @property string $hostname
 * @property string $api_url
 * @property ProxmoxNodeStatus $status
 * @property int $max_vms
 */
class ProxmoxNode extends Model
{
    use HasFactory;

    protected $fillable = [
        'proxmox_server_id',
        'name',
        'hostname',
        'api_url',
        'status',
        'max_vms',
    ];

    protected $casts = [
        'status' => ProxmoxNodeStatus::class,
        'max_vms' => 'integer',
    ];

    /**
     * Get the Proxmox server this node belongs to.
     */
    public function proxmoxServer(): BelongsTo
    {
        return $this->belongsTo(ProxmoxServer::class, 'proxmox_server_id');
    }

    public function vmSessions(): HasMany
    {
        return $this->hasMany(VMSession::class, 'node_id');
    }

    /**
     * Scope to count only active, non-expired VM sessions on this node.
     */
    public function scopeActiveVMs($query)
    {
        return $query->withCount([
            'vmSessions as active_vms_count' => fn($q) => $q
                ->where('status', 'active')
                ->where('expires_at', '>', now()),
        ]);
    }

    /**
     * Count active, non-expired VM sessions on this node.
     */
    public function countActiveVMs(): int
    {
        return VMSession::where('node_id', $this->id)
            ->where('status', 'active')
            ->where('expires_at', '>', now())
            ->count();
    }

    /**
     * Get available CPU considering overcommit ratio.
     *
     * For now, returns a calculated value based on max_vms and overcommit ratio.
     * In a production system, this would pull from Proxmox API.
     */
    public function getAvailableCPU(float $overcommitRatio = 2.0): int
    {
        // Assume 2 CPUs per VM as a default
        // Available = (max_vms - active_vms) * 2 CPUs * overcommit ratio
        $cpuPerVm = 2;
        $availableSlots = $this->max_vms - $this->countActiveVMs();
        return intval($availableSlots * $cpuPerVm * $overcommitRatio);
    }

    /**
     * Get available memory (in MB) considering overcommit ratio.
     *
     * For now, returns a calculated value based on max_vms and overcommit ratio.
     * In a production system, this would pull from Proxmox API.
     */
    public function getAvailableMemory(float $overcommitRatio = 1.5): int
    {
        // Assume 2048 MB per VM as a default
        // Available = (max_vms - active_vms) * 2048 MB * overcommit ratio
        $memoryPerVm = 2048;
        $availableSlots = $this->max_vms - $this->countActiveVMs();
        return intval($availableSlots * $memoryPerVm * $overcommitRatio);
    }
}
