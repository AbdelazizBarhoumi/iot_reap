<?php

namespace App\Models;

use App\Enums\UsbDeviceStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;

/**
 * USB device model for USB/IP devices on gateway nodes.
 *
 * @property int $id
 * @property int $gateway_node_id
 * @property string $busid
 * @property string $vendor_id
 * @property string $product_id
 * @property string|null $serial
 * @property string $name
 * @property string|null $admin_description
 * @property bool $maintenance_mode
 * @property string|null $maintenance_notes
 * @property \DateTime|null $maintenance_until
 * @property bool $is_camera
 * @property UsbDeviceStatus $status
 * @property string|null $attached_to
 * @property string|null $attached_session_id
 * @property int|null $attached_vmid
 * @property string|null $attached_node
 * @property int|null $attached_server_id
 * @property string|null $attached_vm_ip
 * @property string|null $usbip_port
 * @property int|null $pending_vmid
 * @property string|null $pending_node
 * @property int|null $pending_server_id
 * @property string|null $pending_vm_ip
 * @property string|null $pending_vm_name
 * @property \DateTime|null $pending_since
 * @property int|null $dedicated_vmid Permanent VM assignment (survives reboots)
 * @property string|null $dedicated_node Node name for dedicated VM
 * @property int|null $dedicated_server_id Server ID for dedicated VM
 * @property bool|null $is_verified_attached Whether device attachment was verified
 * @property string|null $attachment_verification_state State of verification (verified, failed, unverifiable)
 * @property string|null $attachment_verification_reason Reason for verification state
 * @property \DateTime $created_at
 * @property \DateTime $updated_at
 */
class UsbDevice extends Model
{
    use HasFactory;

    protected $fillable = [
        'gateway_node_id',
        'busid',
        'vendor_id',
        'product_id',
        'serial',
        'name',
        'admin_description',
        'maintenance_mode',
        'maintenance_notes',
        'maintenance_until',
        'is_camera',
        'status',
        'attached_to',
        'attached_session_id',
        'attached_vmid',
        'attached_node',
        'attached_server_id',
        'attached_vm_ip',
        'usbip_port',
        'is_verified_attached',
        'attachment_verification_state',
        'attachment_verification_reason',
        'pending_vmid',
        'pending_node',
        'pending_server_id',
        'pending_vm_ip',
        'pending_vm_name',
        'pending_since',
        'dedicated_vmid',
        'dedicated_node',
        'dedicated_server_id',
    ];

    protected $casts = [
        'gateway_node_id' => 'integer',
        'is_camera' => 'boolean',
        'is_verified_attached' => 'boolean',
        'maintenance_mode' => 'boolean',
        'maintenance_until' => 'datetime',
        'status' => UsbDeviceStatus::class,
        'attached_vmid' => 'integer',
        'attached_server_id' => 'integer',
        'pending_vmid' => 'integer',
        'pending_server_id' => 'integer',
        'pending_since' => 'datetime',
        'dedicated_vmid' => 'integer',
        'dedicated_server_id' => 'integer',
    ];

    /**
     * Get the gateway node this device belongs to.
     */
    public function gatewayNode(): BelongsTo
    {
        return $this->belongsTo(GatewayNode::class);
    }

    /**
     * Get the session this device is attached to.
     */
    public function attachedSession(): BelongsTo
    {
        return $this->belongsTo(VMSession::class, 'attached_session_id');
    }

    /**
     * Get the queue entries for this device.
     */
    public function queueEntries(): HasMany
    {
        return $this->hasMany(UsbDeviceQueue::class)->orderBy('position');
    }

    /**
     * Get the reservations for this device.
     */
    public function reservations(): MorphMany
    {
        return $this->morphMany(Reservation::class, 'reservable');
    }

    /**
     * Get the camera entity created from this USB device (if any).
     */
    public function camera(): HasOne
    {
        return $this->hasOne(Camera::class);
    }

    /**
     * Check if this USB device has been converted to a Camera entity.
     */
    public function hasCamera(): bool
    {
        return $this->camera()->exists();
    }

    /**
     * Check if device is available for binding.
     */
    public function isAvailable(): bool
    {
        return $this->status === UsbDeviceStatus::AVAILABLE;
    }

    /**
     * Check if device is bound (ready for attach).
     */
    public function isBound(): bool
    {
        return $this->status === UsbDeviceStatus::BOUND;
    }

    /**
     * Check if device is attached to a VM.
     */
    public function isAttached(): bool
    {
        return $this->status === UsbDeviceStatus::ATTACHED;
    }

    /**
     * Check if the device has an active reservation blocking it.
     */
    public function hasActiveReservation(): bool
    {
        return $this->reservations()
            ->whereIn('status', ['approved', 'active'])
            ->where('approved_start_at', '<=', now())
            ->where('approved_end_at', '>=', now())
            ->exists();
    }

    /**
     * Check if the user can attach this device.
     * Device must be bound and not reserved by someone else.
     */
    public function canAttach(string $userId): bool
    {
        if (! $this->isBound()) {
            return false;
        }

        // Check for active reservations by others
        $activeReservation = $this->reservations()
            ->whereIn('status', ['approved', 'active'])
            ->where('approved_start_at', '<=', now())
            ->where('approved_end_at', '>=', now())
            ->first();

        if ($activeReservation && $activeReservation->user_id !== $userId) {
            return false;
        }

        return true;
    }

    /**
     * Scope: Get only available devices.
     */
    public function scopeAvailable($query)
    {
        return $query->where('status', UsbDeviceStatus::AVAILABLE);
    }

    /**
     * Scope: Get only bound devices.
     */
    public function scopeBound($query)
    {
        return $query->where('status', UsbDeviceStatus::BOUND);
    }

    /**
     * Scope: Get only attached devices.
     */
    public function scopeAttached($query)
    {
        return $query->where('status', UsbDeviceStatus::ATTACHED);
    }

    /**
     * Scope: Get only disconnected devices.
     */
    public function scopeDisconnected($query)
    {
        return $query->where('status', UsbDeviceStatus::DISCONNECTED);
    }

    /**
     * Scope: Get only camera devices.
     */
    public function scopeCameras($query)
    {
        return $query->where('is_camera', true);
    }

    /**
     * Scope: Get only non-camera devices (regular USB devices).
     */
    public function scopeNonCameras($query)
    {
        return $query->where('is_camera', false);
    }

    /**
     * Scope: Get devices in maintenance.
     */
    public function scopeInMaintenance($query)
    {
        return $query->where('maintenance_mode', true)
            ->where(function ($q) {
                $q->whereNull('maintenance_until')
                    ->orWhere('maintenance_until', '>', now());
            });
    }

    /**
     * Check if device is currently in maintenance.
     */
    public function isInMaintenance(): bool
    {
        if (! $this->maintenance_mode) {
            return false;
        }

        if ($this->maintenance_until === null) {
            return true;
        }

        return $this->maintenance_until->getTimestamp() > now()->getTimestamp();
    }

    /**
     * Set maintenance mode.
     */
    public function setMaintenance(string $notes, ?\DateTime $until = null): void
    {
        $this->maintenance_mode = true;
        $this->maintenance_notes = $notes;
        $this->maintenance_until = $until;
        $this->save();
    }

    /**
     * Clear maintenance mode.
     */
    public function clearMaintenance(): void
    {
        $this->maintenance_mode = false;
        $this->maintenance_notes = null;
        $this->maintenance_until = null;
        $this->save();
    }

    /**
     * Check if device is disconnected (physically unplugged while attached).
     */
    public function isDisconnected(): bool
    {
        return $this->status === UsbDeviceStatus::DISCONNECTED;
    }

    /**
     * Scope: Get devices from verified gateways only.
     */
    public function scopeFromVerifiedGateways($query)
    {
        return $query->whereHas('gatewayNode', fn ($q) => $q->verified());
    }

    /**
     * Get the pending Proxmox server relationship.
     */
    public function pendingServer(): BelongsTo
    {
        return $this->belongsTo(ProxmoxServer::class, 'pending_server_id');
    }

    /**
     * Get the Proxmox server this device is attached to.
     */
    public function attachedServer(): BelongsTo
    {
        return $this->belongsTo(ProxmoxServer::class, 'attached_server_id');
    }

    /**
     * Check if device has a pending attachment.
     */
    public function hasPendingAttachment(): bool
    {
        return $this->status === UsbDeviceStatus::PENDING_ATTACH
            && $this->pending_vmid !== null
            && $this->pending_node !== null
            && $this->pending_server_id !== null;
    }

    /**
     * Check if device is pending attach.
     */
    public function isPendingAttach(): bool
    {
        return $this->status === UsbDeviceStatus::PENDING_ATTACH;
    }

    /**
     * Scope: Get pending attachment devices.
     */
    public function scopePendingAttach($query)
    {
        return $query->where('status', UsbDeviceStatus::PENDING_ATTACH);
    }

    /**
     * Clear pending attachment data.
     */
    public function clearPendingAttachment(): void
    {
        $this->pending_vmid = null;
        $this->pending_node = null;
        $this->pending_server_id = null;
        $this->pending_vm_ip = null;
        $this->pending_vm_name = null;
        $this->pending_since = null;
        $this->save();
    }

    /**
     * Get the dedicated Proxmox server relationship.
     */
    public function dedicatedServer(): BelongsTo
    {
        return $this->belongsTo(ProxmoxServer::class, 'dedicated_server_id');
    }

    /**
     * Check if device is dedicated to a specific VM (permanent assignment).
     */
    public function isDedicated(): bool
    {
        return $this->dedicated_vmid !== null
            && $this->dedicated_node !== null
            && $this->dedicated_server_id !== null;
    }

    /**
     * Check if device is dedicated to a specific VM ID.
     */
    public function isDedicatedTo(int $vmid, int $serverId): bool
    {
        return $this->dedicated_vmid === $vmid
            && $this->dedicated_server_id === $serverId;
    }

    /**
     * Check if the device belongs to a specific VM context.
     */
    public function isAttachedToVmContext(?int $vmid, ?string $nodeName, ?int $serverId): bool
    {
        if ($vmid === null || $nodeName === null || $serverId === null) {
            return false;
        }

        return (int) $this->attached_vmid === (int) $vmid
            && (string) $this->attached_node === (string) $nodeName
            && (int) $this->attached_server_id === (int) $serverId;
    }

    /**
     * Check if the device belongs to the session's VM context.
     */
    public function isAttachedToSessionVm(VMSession $session): bool
    {
        $session->loadMissing('node');

        return $this->isAttachedToVmContext(
            vmid: $session->vm_id,
            nodeName: $session->node?->name,
            serverId: $session->proxmox_server_id,
        );
    }

    /**
     * Set dedicated VM assignment (device will auto-attach when VM starts).
     */
    public function setDedicatedVm(int $vmid, string $nodeName, int $serverId): void
    {
        $this->dedicated_vmid = $vmid;
        $this->dedicated_node = $nodeName;
        $this->dedicated_server_id = $serverId;
        $this->save();
    }

    /**
     * Clear dedicated VM assignment.
     */
    public function clearDedicatedVm(): void
    {
        $this->dedicated_vmid = null;
        $this->dedicated_node = null;
        $this->dedicated_server_id = null;
        $this->save();
    }

    /**
     * Scope: Get devices dedicated to a specific VM.
     */
    public function scopeDedicatedTo($query, int $vmid, int $serverId)
    {
        return $query->where('dedicated_vmid', $vmid)
            ->where('dedicated_server_id', $serverId);
    }

    /**
     * Get unique VID:PID identifier (used for reliable device matching).
     * This is more reliable than busid which can change with port.
     */
    public function getVidPidAttribute(): string
    {
        return strtolower("{$this->vendor_id}:{$this->product_id}");
    }

    /**
     * Check if a VID:PID combination indicates a camera device.
     *
     * Compares against known camera patterns in config/gateway.php.
     * Supports exact matches and wildcard patterns (e.g., '0c45:*').
     */
    public static function isKnownCamera(string $vendorId, string $productId): bool
    {
        $patterns = config('gateway.camera_vid_pids', []);
        $vidPid = strtolower("{$vendorId}:{$productId}");
        $vendorOnly = strtolower("{$vendorId}:*");

        foreach ($patterns as $pattern) {
            $pattern = strtolower($pattern);

            // Exact match
            if ($pattern === $vidPid) {
                return true;
            }

            // Vendor wildcard match (e.g., '0c45:*')
            if ($pattern === $vendorOnly) {
                return true;
            }

            // Wildcard pattern check
            if (str_contains($pattern, '*')) {
                $regex = '/^'.str_replace('*', '.*', preg_quote($pattern, '/')).'$/';
                if (preg_match($regex, $vidPid)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Check if this device can be bound/attached to VMs.
     * Camera devices cannot be bound to VMs.
     */
    public function canBeAttachedToVm(): bool
    {
        return ! $this->is_camera;
    }
}
