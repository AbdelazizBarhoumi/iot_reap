<?php

namespace App\Models;

use App\Enums\ThreadStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Thread reply model for forum discussions.
 *
 * @property int $id
 * @property int $thread_id
 * @property string $author_id
 * @property int|null $parent_id
 * @property string $content
 * @property bool $is_answer
 * @property bool $is_flagged
 * @property int $upvote_count
 */
class ThreadReply extends Model
{
    use HasFactory;

    protected $fillable = [
        'thread_id',
        'author_id',
        'parent_id',
        'content',
        'is_answer',
        'is_flagged',
        'upvote_count',
    ];

    protected $attributes = [
        'is_answer' => false,
        'is_flagged' => false,
        'upvote_count' => 0,
    ];

    protected $casts = [
        'is_answer' => 'boolean',
        'is_flagged' => 'boolean',
        'upvote_count' => 'integer',
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // Relationships
    // ─────────────────────────────────────────────────────────────────────────

    public function thread(): BelongsTo
    {
        return $this->belongsTo(DiscussionThread::class, 'thread_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(ThreadReply::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(ThreadReply::class, 'parent_id');
    }

    public function votes(): HasMany
    {
        return $this->hasMany(ThreadVote::class, 'votable_id')
            ->where('votable_type', 'reply');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Scopes
    // ─────────────────────────────────────────────────────────────────────────

    public function scopeTopLevel($query)
    {
        return $query->whereNull('parent_id');
    }

    public function scopeAnswers($query)
    {
        return $query->where('is_answer', true);
    }

    public function scopeFlagged($query)
    {
        return $query->where('is_flagged', true);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Methods
    // ─────────────────────────────────────────────────────────────────────────

    public function markAsAnswer(): void
    {
        // Remove answer mark from other replies in the thread
        self::where('thread_id', $this->thread_id)
            ->where('is_answer', true)
            ->update(['is_answer' => false]);

        $this->update(['is_answer' => true]);

        // Mark thread as resolved
        $this->thread->update(['status' => ThreadStatus::RESOLVED]);
    }

    public function hasUpvotedBy(User $user): bool
    {
        return $this->votes()->where('user_id', $user->id)->exists();
    }
}
