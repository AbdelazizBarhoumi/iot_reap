<?php

namespace App\Models;

use App\Enums\ProxmoxNodeStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * App Proxmox node model.
 *
 * @property int $id
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

    public function vmSessions(): HasMany
    {
        return $this->hasMany(VMSession::class, 'node_id');
    }
}
