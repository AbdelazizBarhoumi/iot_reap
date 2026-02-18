<?php

namespace App\Models;

use App\Enums\VMSessionStatus;
use App\Enums\VMSessionType;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * VM session model.
 *
 * @property string $id
 * @property int $user_id
 * @property int $template_id
 * @property int $node_id
 * @property int|null $vm_id
 * @property VMSessionStatus $status
 * @property string|null $ip_address
 * @property VMSessionType $session_type
 * @property \Illuminate\Support\Carbon $expires_at
 * @property string|null $guacamole_connection_id
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class VMSession extends Model
{
    /** @use HasFactory<\Database\Factories\VMSessionFactory> */
    use HasFactory, HasUlids;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'vm_sessions';

    /**
     * The primary key type.
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'template_id',
        'node_id',
        'vm_id',
        'status',
        'ip_address',
        'session_type',
        'expires_at',
        'guacamole_connection_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => VMSessionStatus::class,
            'session_type' => VMSessionType::class,
            'expires_at' => 'datetime',
        ];
    }

    /**
     * Get the user that owns this session.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the template for this session.
     */
    public function template(): BelongsTo
    {
        return $this->belongsTo(VMTemplate::class);
    }

    /**
     * Get the node this session runs on.
     */
    public function node(): BelongsTo
    {
        return $this->belongsTo(ProxmoxNode::class, 'node_id');
    }
}
