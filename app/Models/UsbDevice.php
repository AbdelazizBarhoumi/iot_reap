<?php

namespace App\Models;

use App\Enums\UsbDeviceStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * USB device model for USB/IP devices on gateway nodes.
 *
 * @property int $id
 * @property int $gateway_node_id
 * @property string $busid
 * @property string $vendor_id
 * @property string $product_id
 * @property string $name
 * @property UsbDeviceStatus $status
 * @property string|null $attached_to
 * @property string|null $attached_session_id
 * @property string|null $attached_vm_ip
 * @property string|null $usbip_port
 * @property int|null $pending_vmid
 * @property string|null $pending_node
 * @property int|null $pending_server_id
 * @property string|null $pending_vm_ip
 * @property string|null $pending_vm_name
 * @property \DateTime|null $pending_since
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
        'name',
        'status',
        'attached_to',
        'attached_session_id',
        'attached_vm_ip',
        'usbip_port',
        'pending_vmid',
        'pending_node',
        'pending_server_id',
        'pending_vm_ip',
        'pending_vm_name',
        'pending_since',
    ];

    protected $casts = [
        'gateway_node_id' => 'integer',
        'status' => UsbDeviceStatus::class,
        'pending_vmid' => 'integer',
        'pending_server_id' => 'integer',
        'pending_since' => 'datetime',
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
    public function reservations(): HasMany
    {
        return $this->hasMany(UsbDeviceReservation::class);
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
        if (!$this->isBound()) {
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
}
