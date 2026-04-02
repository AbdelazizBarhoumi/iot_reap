<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API resource for discussion thread.
 */
class DiscussionThreadResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'lessonId' => $this->lesson_id,
            'courseId' => $this->course_id,
            'title' => $this->title,
            'content' => $this->content,
            'author' => new ThreadAuthorResource($this->whenLoaded('author')),
            'status' => $this->status->value,
            'upvotes' => $this->upvote_count,
            'hasUpvoted' => $this->has_upvoted ?? false,
            'replyCount' => $this->reply_count,
            'viewCount' => $this->view_count,
            'lastReplyAt' => $this->last_reply_at?->toIso8601String(),
            'lastReplyBy' => $this->whenLoaded('lastReplyAuthor', fn () => new ThreadAuthorResource($this->lastReplyAuthor)),
            'isPinned' => $this->is_pinned,
            'isLocked' => $this->is_locked,
            'isFlagged' => $this->is_flagged,
            'replies' => ThreadReplyResource::collection($this->whenLoaded('replies')),
            'lesson' => $this->whenLoaded('lesson', fn () => [
                'id' => $this->lesson->id,
                'title' => $this->lesson->title,
            ]),
            'course' => $this->whenLoaded('course', fn () => [
                'id' => $this->course->id,
                'title' => $this->course->title,
            ]),
            'createdAt' => $this->created_at->toIso8601String(),
            'updatedAt' => $this->updated_at->toIso8601String(),
        ];
    }
}
