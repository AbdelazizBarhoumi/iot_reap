<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Article model for reading lessons.
 *
 * @property int $id
 * @property int $lesson_id
 * @property array $content
 * @property int $word_count
 * @property int $estimated_read_time_minutes
 */
class Article extends Model
{
    use HasFactory;

    protected $fillable = [
        'lesson_id',
        'content',
        'word_count',
        'estimated_read_time_minutes',
    ];

    protected $casts = [
        'content' => 'array',
        'word_count' => 'integer',
        'estimated_read_time_minutes' => 'integer',
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // Relationships
    // ─────────────────────────────────────────────────────────────────────────

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Methods
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Calculate word count from TipTap JSON content.
     */
    public static function calculateWordCount(array $content): int
    {
        $text = self::extractTextFromContent($content);

        return str_word_count($text);
    }

    /**
     * Calculate estimated read time (avg 200 words per minute).
     */
    public static function calculateReadTime(int $wordCount): int
    {
        return max(1, (int) ceil($wordCount / 200));
    }

    /**
     * Extract plain text from TipTap JSON structure.
     */
    private static function extractTextFromContent(array $content): string
    {
        $text = '';

        if (isset($content['text'])) {
            $text .= $content['text'].' ';
        }

        if (isset($content['content']) && is_array($content['content'])) {
            foreach ($content['content'] as $node) {
                $text .= self::extractTextFromContent($node);
            }
        }

        return $text;
    }

    /**
     * Update word count and read time based on current content.
     *
     * @deprecated Unused - ArticleRepository handles metrics during create/update. Candidate for removal.
     */
    public function updateMetrics(): void
    {
        $this->word_count = self::calculateWordCount($this->content);
        $this->estimated_read_time_minutes = self::calculateReadTime($this->word_count);
        $this->save();
    }
}
