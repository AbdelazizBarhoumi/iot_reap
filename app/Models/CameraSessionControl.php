<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Tracks which session currently controls a camera.
 * Only one active (unreleased) control per camera at a time.
 *
 * @property int $id
 * @property int $camera_id
 * @property string $session_id
 * @property \DateTime $acquired_at
 * @property \DateTime|null $released_at
 */
class CameraSessionControl extends Model
{
    use HasFactory;

    protected $fillable = [
        'camera_id',
        'session_id',
        'acquired_at',
        'released_at',
    ];

    protected $casts = [
        'acquired_at' => 'datetime',
        'released_at' => 'datetime',
    ];

    /**
     * Get the camera being controlled.
     */
    public function camera(): BelongsTo
    {
        return $this->belongsTo(Camera::class);
    }

    /**
     * Get the session that holds the control.
     */
    public function session(): BelongsTo
    {
        return $this->belongsTo(VMSession::class, 'session_id');
    }
}
