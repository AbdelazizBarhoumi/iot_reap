<?php

namespace App\Models;

use App\Enums\ThreadStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Discussion thread model for forum functionality.
 *
 * @property int $id
 * @property int|null $lesson_id
 * @property int $course_id
 * @property string $author_id
 * @property string $title
 * @property string $content
 * @property ThreadStatus $status
 * @property bool $is_pinned
 * @property bool $is_locked
 * @property bool $is_flagged
 * @property int $view_count
 * @property int $reply_count
 * @property int $upvote_count
 * @property \Carbon\Carbon|null $last_reply_at
 * @property string|null $last_reply_by
 */
class DiscussionThread extends Model
{
    use HasFactory;

    protected $fillable = [
        'lesson_id',
        'course_id',
        'author_id',
        'title',
        'content',
        'status',
        'is_pinned',
        'is_locked',
        'is_flagged',
        'view_count',
        'reply_count',
        'upvote_count',
        'last_reply_at',
        'last_reply_by',
    ];

    protected $attributes = [
        'is_pinned' => false,
        'is_locked' => false,
        'is_flagged' => false,
        'view_count' => 0,
        'reply_count' => 0,
        'upvote_count' => 0,
    ];

    protected $casts = [
        'status' => ThreadStatus::class,
        'is_pinned' => 'boolean',
        'is_locked' => 'boolean',
        'is_flagged' => 'boolean',
        'view_count' => 'integer',
        'reply_count' => 'integer',
        'upvote_count' => 'integer',
        'last_reply_at' => 'datetime',
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // Relationships
    // ─────────────────────────────────────────────────────────────────────────

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function lastReplyAuthor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'last_reply_by');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(ThreadReply::class, 'thread_id');
    }

    public function votes(): HasMany
    {
        return $this->hasMany(ThreadVote::class, 'votable_id')
            ->where('votable_type', 'thread');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Scopes
    // ─────────────────────────────────────────────────────────────────────────

    public function scopeForCourse($query, int $courseId)
    {
        return $query->where('course_id', $courseId);
    }

    public function scopeForLesson($query, int $lessonId)
    {
        return $query->where('lesson_id', $lessonId);
    }

    public function scopeOpen($query)
    {
        return $query->where('status', ThreadStatus::OPEN);
    }

    public function scopeResolved($query)
    {
        return $query->where('status', ThreadStatus::RESOLVED);
    }

    public function scopePinned($query)
    {
        return $query->where('is_pinned', true);
    }

    public function scopeNotLocked($query)
    {
        return $query->where('is_locked', false);
    }

    public function scopeFlagged($query)
    {
        return $query->where('is_flagged', true);
    }

    public function scopeUnanswered($query)
    {
        return $query->where('reply_count', 0)->where('status', ThreadStatus::OPEN);
    }

    public function scopeByAuthor($query, string $authorId)
    {
        return $query->where('author_id', $authorId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Methods
    // ─────────────────────────────────────────────────────────────────────────

    public function incrementViews(): void
    {
        $this->increment('view_count');
    }

    public function updateReplyStats(ThreadReply $reply): void
    {
        $this->update([
            'reply_count' => $this->replies()->count(),
            'last_reply_at' => $reply->created_at,
            'last_reply_by' => $reply->author_id,
        ]);
    }

    public function canReply(): bool
    {
        return ! $this->is_locked;
    }

    public function hasUpvotedBy(User $user): bool
    {
        return $this->votes()->where('user_id', $user->id)->exists();
    }
}
