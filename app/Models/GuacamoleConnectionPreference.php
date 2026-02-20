<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Stores a user's saved Guacamole connection parameters for a given protocol.
 * This is the "Edit Connection" saved form — applied whenever the user connects
 * to a VM of that protocol type.
 *
 * @property int $id
 * @property string $user_id
 * @property string $vm_session_type  Protocol key: 'rdp', 'vnc', or 'ssh'
 * @property array<string, mixed> $parameters  JSON-encoded connection settings
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class GuacamoleConnectionPreference extends Model
{
    use HasFactory;

    protected $table = 'guacamole_connection_preferences';

    protected $fillable = [
        'user_id',
        'vm_session_type',
        'parameters',
    ];

    protected function casts(): array
    {
        return [
            'parameters' => 'array',
        ];
    }

    /**
     * The user these preferences belong to.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
