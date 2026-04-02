<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\User
 */
class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Safely access potentially missing attributes
        $attrs = $this->getAttributes();
        
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role->value,
            'role_label' => $this->role->label(),
            'email_verified_at' => $this->email_verified_at?->toISOString(),
            'two_factor_enabled' => ! is_null($this->two_factor_confirmed_at),
            'suspended_at' => $this->suspended_at?->toISOString(),
            'suspended_reason' => $this->suspended_reason,
            'is_suspended' => $this->isSuspended(),
            'last_login_at' => isset($attrs['last_login_at']) && $attrs['last_login_at'] ? $this->last_login_at?->toISOString() : null,
            'last_login_ip' => $this->when($request->user()?->isAdmin(), $attrs['last_login_ip'] ?? null),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            // Include relations when loaded
            'course_enrollments' => $this->whenLoaded('courseEnrollments', fn () => CourseEnrollmentResource::collection($this->courseEnrollments)
            ),
            'vm_sessions' => $this->whenLoaded('vmSessions', fn () => VMSessionResource::collection($this->vmSessions)
            ),
        ];
    }
}
