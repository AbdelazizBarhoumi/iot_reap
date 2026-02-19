<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Proxmox server/cluster model.
 *
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property string $host
 * @property int $port
 * @property string $realm
 * @property string $token_id
 * @property string $token_secret
 * @property bool $verify_ssl
 * @property bool $is_active
 * @property string|null $created_by
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class ProxmoxServer extends Model
{
    /** @use HasFactory<\Database\Factories\ProxmoxServerFactory> */
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'proxmox_servers';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'description',
        'host',
        'port',
        'realm',
        'token_id',
        'token_secret',
        'verify_ssl',
        'is_active',
        'created_by',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'port' => 'integer',
            'verify_ssl' => 'boolean',
            'is_active' => 'boolean',
            'token_id' => 'encrypted',
            'token_secret' => 'encrypted',
        ];
    }

    /**
     * Get the user who created this server.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the Proxmox nodes associated with this server.
     */
    public function nodes(): HasMany
    {
        return $this->hasMany(ProxmoxNode::class, 'proxmox_server_id');
    }

    /**
     * Get the VM sessions associated with this server.
     */
    public function vmSessions(): HasMany
    {
        return $this->hasMany(VMSession::class, 'proxmox_server_id');
    }

    /**
     * Get the credential change logs for this server.
     */
    public function credentialLogs(): HasMany
    {
        return $this->hasMany(NodeCredentialsLog::class, 'proxmox_server_id');
    }

    /**
     * Get the full API URL for this Proxmox server.
     */
    public function getApiUrl(): string
    {
        $protocol = 'https';
        return "{$protocol}://{$this->host}:{$this->port}/api2/json";
    }
}
