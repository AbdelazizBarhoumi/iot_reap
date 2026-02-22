<?php

namespace App\Models;

use App\Enums\VMSessionStatus;
use App\Enums\VMSessionType;
use App\Enums\VMTemplateProtocol;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * App VM session model.
 *
 * @property string $id
 * @property string $user_id
 * @property int $template_id
 * @property int|null $proxmox_server_id
 * @property int $node_id
 * @property int|null $vm_id
 * @property VMSessionStatus $status
 * @property VMSessionType $session_type
 * @property string|null $protocol_override
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
        'template_id',
        'proxmox_server_id',
        'node_id',
        'vm_id',
        'status',
        'session_type',
        'protocol_override',
        'ip_address',
        'credentials',
        'return_snapshot',
        'guacamole_connection_id',
        'expires_at',
    ];

    protected $casts = [
        'status' => VMSessionStatus::class,
        'session_type' => VMSessionType::class,
        'expires_at' => 'datetime',
        'template_id' => 'integer',
        'proxmox_server_id' => 'integer',
        'node_id' => 'integer',
        'vm_id' => 'integer',
        'guacamole_connection_id' => 'integer',
        'credentials' => 'encrypted:array',
    ];

    /**
     * Get the effective protocol for this session.
     * Uses protocol_override if set, otherwise falls back to template protocol.
     */
    public function getEffectiveProtocol(): VMTemplateProtocol
    {
        if ($this->protocol_override) {
            return VMTemplateProtocol::from($this->protocol_override);
        }

        return $this->template->protocol;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(VMTemplate::class);
    }

    public function proxmoxServer(): BelongsTo
    {
        return $this->belongsTo(ProxmoxServer::class, 'proxmox_server_id');
    }

    public function node(): BelongsTo
    {
        return $this->belongsTo(ProxmoxNode::class);
    }
}
