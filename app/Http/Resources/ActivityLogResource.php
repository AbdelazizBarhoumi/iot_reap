<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityLogResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = $this->whenLoaded('user');

        return [
            'id' => $this->id,
            'type' => $this->type,
            'action' => $this->action,
            'description' => $this->description,
            'user_id' => $this->user_id,
            'user_name' => $user?->name,
            'user_avatar' => null,
            'ip_address' => $this->ip_address,
            'metadata' => $this->metadata,
            'status' => $this->status,
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
