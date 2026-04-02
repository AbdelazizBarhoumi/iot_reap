<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Thread vote model for tracking upvotes on threads and replies.
 *
 * @property int $id
 * @property string $user_id
 * @property string $votable_type
 * @property int $votable_id
 * @property int $value
 */
class ThreadVote extends Model
{
    protected $fillable = [
        'user_id',
        'votable_type',
        'votable_id',
        'value',
    ];

    protected $casts = [
        'value' => 'integer',
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // Relationships
    // ─────────────────────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the votable model (thread or reply).
     */
    public function votable()
    {
        if ($this->votable_type === 'thread') {
            return $this->belongsTo(DiscussionThread::class, 'votable_id');
        }

        return $this->belongsTo(ThreadReply::class, 'votable_id');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Scopes
    // ─────────────────────────────────────────────────────────────────────────

    public function scopeForThread($query, int $threadId)
    {
        return $query->where('votable_type', 'thread')
            ->where('votable_id', $threadId);
    }

    public function scopeForReply($query, int $replyId)
    {
        return $query->where('votable_type', 'reply')
            ->where('votable_id', $replyId);
    }

    public function scopeByUser($query, string $userId)
    {
        return $query->where('user_id', $userId);
    }
}
