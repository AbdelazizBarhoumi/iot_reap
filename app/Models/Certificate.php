<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Certificate model for course completion certificates.
 *
 * @property int $id
 * @property string $user_id
 * @property int $course_id
 * @property string $hash
 * @property string|null $pdf_path
 * @property \Carbon\Carbon $issued_at
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class Certificate extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'course_id',
        'hash',
        'pdf_path',
        'issued_at',
    ];

    protected $casts = [
        'issued_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the verification URL for this certificate.
     */
    public function getVerificationUrlAttribute(): string
    {
        return url("/certificates/verify/{$this->hash}");
    }

    /**
     * Get the download URL for this certificate.
     */
    public function getDownloadUrlAttribute(): string
    {
        return url("/certificates/{$this->hash}/download");
    }

    /**
     * Scope to find by verification hash.
     */
    public function scopeByHash($query, string $hash)
    {
        return $query->where('hash', $hash);
    }
}
