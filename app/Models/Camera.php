<?php

namespace App\Models;

use App\Enums\CameraReservationStatus;
use App\Enums\CameraStatus;
use App\Enums\CameraType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * Camera model — represents a camera that can be:
 * 1. Attached to a robot (robot_id set, gateway_node_id null)
 * 2. A USB webcam from a gateway node (gateway_node_id set, robot_id null)
 *
 * @property int $id
 * @property int|null $robot_id
 * @property int|null $gateway_node_id
 * @property int|null $usb_device_id
 * @property string $name
 * @property string $stream_key
 * @property string $source_url
 * @property int $stream_width
 * @property int $stream_height
 * @property int $stream_framerate
 * @property string $stream_input_format
 * @property CameraType $type
 * @property CameraStatus $status
 * @property bool $ptz_capable
 * @property bool $recording_enabled
 * @property bool $detection_enabled
 */
class Camera extends Model
{
    use HasFactory;

    protected $fillable = [
        'robot_id',
        'gateway_node_id',
        'usb_device_id',
        'name',
        'stream_key',
        'source_url',
        'stream_width',
        'stream_height',
        'stream_framerate',
        'stream_input_format',
        'type',
        'status',
        'ptz_capable',
        'recording_enabled',
        'detection_enabled',
    ];

    protected $casts = [
        'type' => CameraType::class,
        'status' => CameraStatus::class,
        'stream_width' => 'integer',
        'stream_height' => 'integer',
        'stream_framerate' => 'integer',
        'ptz_capable' => 'boolean',
        'recording_enabled' => 'boolean',
        'detection_enabled' => 'boolean',
    ];

    /**
     * Get the robot this camera belongs to (if it's a robot camera).
     */
    public function robot(): BelongsTo
    {
        return $this->belongsTo(Robot::class);
    }

    /**
     * Get the gateway node this camera belongs to (if it's a USB camera).
     */
    public function gatewayNode(): BelongsTo
    {
        return $this->belongsTo(GatewayNode::class);
    }

    /**
     * Get the USB device this camera was created from (if applicable).
     */
    public function usbDevice(): BelongsTo
    {
        return $this->belongsTo(UsbDevice::class);
    }

    /**
     * Check if this is a USB camera from a gateway.
     */
    public function isUsbCamera(): bool
    {
        return $this->gateway_node_id !== null && $this->usb_device_id !== null;
    }

    /**
     * Check if this is a robot camera.
     */
    public function isRobotCamera(): bool
    {
        return $this->robot_id !== null;
    }

    /**
     * Get the source name (robot name or gateway name).
     */
    public function getSourceNameAttribute(): string
    {
        if ($this->robot_id) {
            return $this->robot?->name ?? 'Unknown Robot';
        }
        if ($this->gateway_node_id) {
            return $this->gatewayNode?->name ?? 'Unknown Gateway';
        }
        return 'Unknown';
    }

    /**
     * Get human-readable resolution label.
     */
    public function getResolutionLabel(): string
    {
        $width = $this->stream_width ?? 640;
        $height = $this->stream_height ?? 480;
        
        $labels = [
            '320x240' => '240p (Low)',
            '640x480' => '480p (SD)',
            '800x600' => '600p',
            '1280x720' => '720p (HD)',
            '1920x1080' => '1080p (Full HD)',
        ];
        
        return $labels["{$width}x{$height}"] ?? "{$width}x{$height}";
    }

    /**
     * Available resolution presets for USB cameras.
     */
    public static function getAvailableResolutions(): array
    {
        return [
            ['width' => 320, 'height' => 240, 'label' => '240p (Low)', 'recommended_framerate' => 30],
            ['width' => 640, 'height' => 480, 'label' => '480p (SD)', 'recommended_framerate' => 15],
            ['width' => 800, 'height' => 600, 'label' => '600p', 'recommended_framerate' => 15],
            ['width' => 1280, 'height' => 720, 'label' => '720p (HD)', 'recommended_framerate' => 10],
            ['width' => 1920, 'height' => 1080, 'label' => '1080p (Full HD)', 'recommended_framerate' => 10],
        ];
    }

    /**
     * Get all control records for this camera.
     */
    public function sessionControls(): HasMany
    {
        return $this->hasMany(CameraSessionControl::class);
    }

    /**
     * Get the currently active control (unreleased).
     */
    public function activeControl(): HasOne
    {
        return $this->hasOne(CameraSessionControl::class)
            ->whereNull('released_at');
    }

    /**
     * Check if this camera is currently controlled by any session.
     */
    public function isControlled(): bool
    {
        return $this->activeControl()->exists();
    }

    /**
     * Check if this camera is controlled by a specific session.
     */
    public function isControlledBySession(string $sessionId): bool
    {
        return $this->sessionControls()
            ->where('session_id', $sessionId)
            ->whereNull('released_at')
            ->exists();
    }

    /**
     * Get all reservations for this camera.
     */
    public function reservations(): HasMany
    {
        return $this->hasMany(CameraReservation::class);
    }

    /**
     * Check if this camera has any active or approved reservation right now.
     */
    public function hasActiveReservation(): bool
    {
        $now = now();

        return $this->reservations()
            ->whereIn('status', [
                CameraReservationStatus::APPROVED->value,
                CameraReservationStatus::ACTIVE->value,
            ])
            ->whereNotNull('approved_start_at')
            ->where('approved_start_at', '<=', $now)
            ->where('approved_end_at', '>=', $now)
            ->exists();
    }

    /**
     * Get the currently active reservation (if any).
     */
    public function activeReservation(): HasOne
    {
        $now = now();

        return $this->hasOne(CameraReservation::class)
            ->whereIn('status', [
                CameraReservationStatus::APPROVED->value,
                CameraReservationStatus::ACTIVE->value,
            ])
            ->whereNotNull('approved_start_at')
            ->where('approved_start_at', '<=', $now)
            ->where('approved_end_at', '>=', $now);
    }
}
