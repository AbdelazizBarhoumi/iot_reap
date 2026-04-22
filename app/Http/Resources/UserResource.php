<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin User
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
            'teacher_approved_at' => $this->teacher_approved_at?->toISOString(),
            'teacher_approved_by' => $this->teacher_approved_by,
            'is_teacher_approved' => $this->isTeacherApproved(),
            'requires_teacher_approval' => $this->isTeacher(),
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
            'training_path_enrollments' => $this->whenLoaded('trainingPathEnrollments', fn () => TrainingPathEnrollmentResource::collection($this->trainingPathEnrollments)
            ),
            'vm_sessions' => $this->whenLoaded('vmSessions', fn () => VMSessionResource::collection($this->vmSessions)
            ),
        ];
    }
}
