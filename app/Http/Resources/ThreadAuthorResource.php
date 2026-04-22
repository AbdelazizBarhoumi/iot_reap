<?php

namespace App\Http\Resources;

use App\Enums\UserRole;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API resource for thread author.
 */
class ThreadAuthorResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'avatar' => $this->avatar_url ?? null,
            'role' => $this->getRole(),
            'badge' => $this->getBadge(),
        ];
    }

    private function getRole(): string
    {
        if ($this->hasRole(UserRole::ADMIN)) {
            return 'admin';
        }
        if ($this->hasRole(UserRole::TEACHER)) {
            return 'teacher';
        }

        return 'student';
    }

    private function getBadge(): ?string
    {
        if ($this->hasRole(UserRole::ADMIN)) {
            return 'Admin';
        }
        if ($this->hasRole(UserRole::TEACHER)) {
            return 'Instructor';
        }

        return null;
    }
}
