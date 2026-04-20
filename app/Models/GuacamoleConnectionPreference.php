<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Stores a user's saved Guacamole connection parameters for a given protocol.
 * Users can create multiple named profiles per protocol (e.g., "Work RDP", "Home RDP").
 * Each profile can be marked as default for its protocol.
 *
 * @property int $id
 * @property string $user_id
 * @property string $vm_session_type Protocol key: 'rdp', 'vnc', or 'ssh'
 * @property string $profile_name User-defined profile name
 * @property bool $is_default Whether this is the default profile for the protocol
 * @property array<string, mixed> $parameters JSON-encoded connection settings
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
        'profile_name',
        'is_default',
        'parameters',
    ];

    protected function casts(): array
    {
        return [
            'parameters' => 'array',
            'is_default' => 'boolean',
        ];
    }

    /**
     * Ensure parameters are always properly decoded.
     * Handles cases where JSON was double-encoded in the database.
     */
    protected function getParametersAttribute($value)
    {
        if ($value === null) {
            return [];
        }
        
        // If value is a string, decode it
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            // If the decoded value is a string (double-encoded), decode again
            if (is_string($decoded)) {
                return json_decode($decoded, true) ?? [];
            }
            return $decoded ?? [];
        }
        
        return $value ?? [];
    }

    /**
     * The user these preferences belong to.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
