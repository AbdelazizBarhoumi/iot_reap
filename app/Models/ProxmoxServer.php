<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Proxmox server/cluster model.
 *
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property string $host
 * @property int $port
 * @property string $token_id
 * @property string $token_secret
 * @property bool $is_active
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
        'token_id',
        'token_secret',
        'is_active',
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
            'is_active' => 'boolean',
            'token_id' => 'encrypted',
            'token_secret' => 'encrypted',
        ];
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
