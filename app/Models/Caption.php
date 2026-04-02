<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

/**
 * Caption model for video subtitles/captions.
 *
 * @property int $id
 * @property int $video_id
 * @property string $language
 * @property string $label
 * @property string $file_path
 * @property bool $is_default
 */
class Caption extends Model
{
    use HasFactory;

    protected $fillable = [
        'video_id',
        'language',
        'label',
        'file_path',
        'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // Relationships
    // ─────────────────────────────────────────────────────────────────────────

    public function video(): BelongsTo
    {
        return $this->belongsTo(Video::class);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Accessors
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Get the URL to the caption file.
     */
    public function getUrlAttribute(): ?string
    {
        if (! $this->relationLoaded('video') || !$this->video) {
            return null;
        }
        return Storage::disk($this->video->storage_disk)->url($this->file_path);
    }

    /**
     * Get the URL to the caption file (alias for CaptionResource).
     */
    public function getFileUrlAttribute(): ?string
    {
        return $this->url;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Methods
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Get the content of the caption file.
     */
    public function getContent(): string
    {
        if (!$this->relationLoaded('video') || !$this->video) {
            throw new \RuntimeException('Video relationship not loaded');
        }
        return Storage::disk($this->video->storage_disk)->get($this->file_path);
    }

    /**
     * Update the caption file content.
     */
    public function updateContent(string $content): bool
    {
        if (!$this->relationLoaded('video') || !$this->video) {
            throw new \RuntimeException('Video relationship not loaded');
        }
        return Storage::disk($this->video->storage_disk)->put($this->file_path, $content);
    }

    /**
     * Set this caption as the default for the video.
     */
    public function setAsDefault(): void
    {
        // Remove default from other captions
        Caption::where('video_id', $this->video_id)
            ->where('id', '!=', $this->id)
            ->update(['is_default' => false]);

        $this->update(['is_default' => true]);
    }
}
