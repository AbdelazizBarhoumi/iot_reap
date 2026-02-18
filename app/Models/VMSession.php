<?php

namespace App\Models;

use App\Enums\VMSessionStatus;
use App\Enums\VMSessionType;
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
 * @property int $node_id
 * @property int|null $vm_id
 * @property VMSessionStatus $status
 * @property VMSessionType $session_type
 * @property string|null $ip_address
 * @property int|null $guacamole_connection_id
 * @property \DateTime $expires_at
 */
class VMSession extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'user_id',
        'template_id',
        'node_id',
        'vm_id',
        'status',
        'session_type',
        'ip_address',
        'guacamole_connection_id',
        'expires_at',
    ];

    protected $casts = [
        'status' => VMSessionStatus::class,
        'session_type' => VMSessionType::class,
        'expires_at' => 'datetime',
        'template_id' => 'integer',
        'node_id' => 'integer',
        'vm_id' => 'integer',
        'guacamole_connection_id' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(VMTemplate::class);
    }

    public function node(): BelongsTo
    {
        return $this->belongsTo(ProxmoxNode::class);
    }
}
