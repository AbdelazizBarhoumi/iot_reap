<?php

namespace App\Models;

use App\Enums\VMSessionProtocol;
use App\Enums\VMSessionStatus;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * App VM session model.
 *
 * @property string $id
 * @property string $user_id
 * @property int|null $proxmox_server_id
 * @property int $node_id
 * @property int|null $vm_id
 * @property VMSessionStatus $status
 * @property VMSessionProtocol|null $protocol
 * @property string|null $connection_profile_name
 * @property string|null $ip_address
 * @property int|null $guacamole_connection_id
 * @property \DateTime $expires_at
 */
class VMSession extends Model
{
    use HasFactory, HasUlids;

    protected $table = 'vm_sessions';

    protected $fillable = [
        'user_id',
        'proxmox_server_id',
        'node_id',
        'vm_id',
        'status',
        'protocol',
        'connection_profile_name',
        'ip_address',
        'credentials',
        'return_snapshot',
        'guacamole_connection_id',
        'expires_at',
    ];

    /**
     * Hide sensitive fields from serialization.
     * Credentials contain VM access secrets and should never be exposed via API.
     */
    protected $hidden = [
        'credentials',
    ];

    protected $casts = [
        'status' => VMSessionStatus::class,
        'expires_at' => 'datetime',
        'proxmox_server_id' => 'integer',
        'node_id' => 'integer',
        'vm_id' => 'integer',
        'connection_profile_name' => 'string',
        'guacamole_connection_id' => 'integer',
        'credentials' => 'encrypted:array',
        'protocol' => VMSessionProtocol::class,
    ];

    /**
     * Get the effective protocol for this session.
     * After the template table was removed the protocol is stored directly on
     * the session row.  There is no longer a separate "override"; the column
     * was renamed from `protocol_override` to plain `protocol` during migration.
     *
     * The value is always present when a session is created via the normal
     * provisioning flow, so this method simply casts it to the enum.  A runtime
     * exception will be thrown if somehow the column is null (indicates a bug).
     */
    public function getProtocol(): VMSessionProtocol
    {
        if (empty($this->protocol)) {
            throw new \RuntimeException("VMSession {$this->id} has no protocol set");
        }

        // The `protocol` attribute is cast to VMSessionProtocol in $casts, so we
        // can return it directly rather than constructing a new enum instance.
        return $this->protocol;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function proxmoxServer(): BelongsTo
    {
        return $this->belongsTo(ProxmoxServer::class, 'proxmox_server_id');
    }

    public function node(): BelongsTo
    {
        return $this->belongsTo(ProxmoxNode::class);
    }

    /**
     * Get the USB devices currently attached to this session.
     */
    public function attachedDevices(): HasMany
    {
        return $this->hasMany(UsbDevice::class, 'attached_session_id');
    }

    /**
     * Get the queue entries for this session (devices waiting for).
     */
    public function deviceQueueEntries(): HasMany
    {
        return $this->hasMany(UsbDeviceQueue::class, 'session_id');
    }
}
