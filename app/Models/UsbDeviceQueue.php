<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * USB device queue model for tracking users waiting for a device.
 *
 * @property int $id
 * @property int $usb_device_id
 * @property string $session_id
 * @property string $user_id
 * @property int $position
 * @property \DateTime $queued_at
 * @property \DateTime|null $notified_at
 * @property \DateTime $created_at
 * @property \DateTime $updated_at
 */
class UsbDeviceQueue extends Model
{
    use HasFactory;

    protected $table = 'usb_device_queue';

    protected $fillable = [
        'usb_device_id',
        'session_id',
        'user_id',
        'position',
        'queued_at',
        'notified_at',
    ];

    protected $casts = [
        'usb_device_id' => 'integer',
        'position' => 'integer',
        'queued_at' => 'datetime',
        'notified_at' => 'datetime',
    ];

    /**
     * Get the USB device this queue entry is for.
     */
    public function device(): BelongsTo
    {
        return $this->belongsTo(UsbDevice::class, 'usb_device_id');
    }

    /**
     * Get the session waiting for this device.
     */
    public function session(): BelongsTo
    {
        return $this->belongsTo(VMSession::class, 'session_id');
    }

    /**
     * Get the user waiting for this device.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if user has been notified.
     */
    public function isNotified(): bool
    {
        return $this->notified_at !== null;
    }

    /**
     * Check if this is the next in line.
     */
    public function isNext(): bool
    {
        return $this->position === 1;
    }
}
