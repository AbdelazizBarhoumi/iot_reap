<?php

namespace App\Models;

use App\Enums\ProxmoxNodeStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Proxmox node model.
 *
 * @property int $id
 * @property string $name
 * @property string $hostname
 * @property string $api_url
 * @property ProxmoxNodeStatus $status
 * @property int $max_vms
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class ProxmoxNode extends Model
{
    /** @use HasFactory<\Database\Factories\ProxmoxNodeFactory> */
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'proxmox_nodes';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'hostname',
        'api_url',
        'status',
        'max_vms',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => ProxmoxNodeStatus::class,
        ];
    }

    /**
     * Get the VM sessions on this node.
     */
    public function vmSessions(): HasMany
    {
        return $this->hasMany(VMSession::class, 'node_id');
    }
}
