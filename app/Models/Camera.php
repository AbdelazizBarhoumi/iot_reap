<?php

namespace App\Models;

use App\Enums\CameraStatus;
use App\Enums\CameraType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * Camera model — represents a camera physically attached to a robot.
 *
 * @property int $id
 * @property int $robot_id
 * @property string $name
 * @property string $stream_key
 * @property string $source_url
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
        'name',
        'stream_key',
        'source_url',
        'type',
        'status',
        'ptz_capable',
        'recording_enabled',
        'detection_enabled',
    ];

    protected $casts = [
        'type' => CameraType::class,
        'status' => CameraStatus::class,
        'ptz_capable' => 'boolean',
        'recording_enabled' => 'boolean',
        'detection_enabled' => 'boolean',
    ];

    /**
     * Get the robot this camera belongs to.
     */
    public function robot(): BelongsTo
    {
        return $this->belongsTo(Robot::class);
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
}
