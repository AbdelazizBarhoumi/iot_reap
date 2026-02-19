<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Audit log for Proxmox server credential changes.
 *
 * @property int $id
 * @property int $proxmox_server_id
 * @property string $action
 * @property string|null $ip_address
 * @property string|null $changed_by
 * @property array|null $details
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class NodeCredentialsLog extends Model
{
    use HasFactory;

    protected $table = 'node_credentials_log';

    protected $fillable = [
        'proxmox_server_id',
        'action',
        'ip_address',
        'changed_by',
        'details',
    ];

    protected $casts = [
        'details' => 'json',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the Proxmox server associated with this log entry.
     */
    public function proxmoxServer(): BelongsTo
    {
        return $this->belongsTo(ProxmoxServer::class, 'proxmox_server_id');
    }

    /**
     * Get the user who made the change.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
