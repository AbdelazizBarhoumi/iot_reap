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
            'trainingUnitId' => $this->training_unit_id,
            'trainingPathId' => $this->training_path_id,
            'title' => $this->title,
            'content' => $this->content,
            'author' => new ThreadAuthorResource($this->whenLoaded('author')),
            'status' => $this->status->value,
            'statusLabel' => $this->status->label(),
            'upvotes' => $this->upvote_count,
            'hasUpvoted' => $this->has_upvoted ?? false,
            'replyCount' => $this->reply_count,
            'viewCount' => $this->view_count,
            'lastReplyAt' => $this->last_reply_at?->toIso8601String(),
            'lastReplyBy' => $this->whenLoaded('lastReplyAuthor', fn () => new ThreadAuthorResource($this->lastReplyAuthor)),
            'isPinned' => $this->status->value === 'pinned',
            'isLocked' => $this->status->value === 'locked',
            'isFlagged' => $this->is_flagged,
            'replies' => ThreadReplyResource::collection($this->whenLoaded('replies')),
            'trainingUnit' => $this->whenLoaded('trainingUnit', fn () => [
                'id' => $this->trainingUnit->id,
                'title' => $this->trainingUnit->title,
            ]),
            'trainingPath' => $this->whenLoaded('trainingPath', fn () => [
                'id' => $this->trainingPath->id,
                'title' => $this->trainingPath->title,
            ]),
            'createdAt' => $this->created_at->toIso8601String(),
            'updatedAt' => $this->updated_at->toIso8601String(),
        ];
    }
}
