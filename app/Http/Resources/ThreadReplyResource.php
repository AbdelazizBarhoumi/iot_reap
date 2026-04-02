<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API resource for thread reply.
 */
class ThreadReplyResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'threadId' => (string) $this->thread_id,
            'content' => $this->content,
            'author' => new ThreadAuthorResource($this->whenLoaded('author')),
            'upvotes' => $this->upvote_count,
            'hasUpvoted' => $this->has_upvoted ?? false,
            'isAnswer' => $this->is_answer,
            'isFlagged' => $this->is_flagged,
            'parentId' => $this->parent_id ? (string) $this->parent_id : null,
            'replies' => ThreadReplyResource::collection($this->whenLoaded('children')),
            'createdAt' => $this->created_at->toIso8601String(),
            'updatedAt' => $this->updated_at->toIso8601String(),
        ];
    }
}
