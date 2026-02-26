<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Gateway node model for USB/IP gateway containers.
 *
 * @property int $id
 * @property string $name
 * @property string $ip
 * @property int $port
 * @property bool $online
 * @property bool $is_verified
 * @property string|null $proxmox_vmid
 * @property string|null $proxmox_node
 * @property string|null $description
 * @property \DateTime|null $last_seen_at
 * @property \DateTime $created_at
 * @property \DateTime $updated_at
 */
class GatewayNode extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'ip',
        'port',
        'online',
        'is_verified',
        'proxmox_vmid',
        'proxmox_node',
        'description',
        'last_seen_at',
    ];

    protected $casts = [
        'port' => 'integer',
        'online' => 'boolean',
        'is_verified' => 'boolean',
        'last_seen_at' => 'datetime',
    ];

    /**
     * Get the USB devices on this gateway node.
     */
    public function usbDevices(): HasMany
    {
        return $this->hasMany(UsbDevice::class);
    }

    /**
     * Get the full API URL for this gateway node.
     */
    public function getApiUrlAttribute(): string
    {
        return "http://{$this->ip}:{$this->port}";
    }

    /**
     * Scope: Get only online nodes.
     */
    public function scopeOnline($query)
    {
        return $query->where('online', true);
    }

    /**
     * Scope: Get only offline nodes.
     */
    public function scopeOffline($query)
    {
        return $query->where('online', false);
    }

    /**
     * Scope: Get only verified gateways.
     */
    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    /**
     * Scope: Get unverified gateways.
     */
    public function scopeUnverified($query)
    {
        return $query->where('is_verified', false);
    }

    /**
     * Scope: Get active gateways (online AND verified).
     */
    public function scopeActive($query)
    {
        return $query->where('online', true)->where('is_verified', true);
    }
}
