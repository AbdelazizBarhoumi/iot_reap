<?php

namespace App\Repositories;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class UserRepository
{
    public function create(array $data): User
    {
        return User::create($data);
    }

    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function findById(string $id): ?User
    {
        return User::find($id);
    }

    public function all(): Collection
    {
        return User::all();
    }

    /**
     * Get paginated users with filters.
     */
    public function getPaginated(
        int $perPage = 15,
        ?string $search = null,
        ?UserRole $role = null,
        ?string $status = null,
        string $sortBy = 'created_at',
        string $sortDirection = 'desc',
    ): LengthAwarePaginator {
        $query = User::query();

        // Search by name or email
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($role) {
            $query->where('role', $role);
        }

        // Filter by status
        if ($status) {
            if ($status === 'suspended') {
                $query->whereNotNull('suspended_at');
            } elseif ($status === 'active') {
                $query->whereNull('suspended_at');
            } elseif ($status === 'pending_teacher_approval') {
                $query->where('role', UserRole::TEACHER->value)
                    ->whereNull('teacher_approved_at')
                    ->whereNull('suspended_at');
            }
        }

        // Sorting
        $query->orderBy($sortBy, $sortDirection);

        return $query->paginate($perPage);
    }

    /**
     * Get user with related data.
     */
    public function findWithDetails(string $id): ?User
    {
        return User::with(['trainingPathEnrollments.trainingPath', 'vmSessions' => function ($q) {
            $q->latest()->limit(10);
        }])->find($id);
    }

    /**
     * Update user.
     */
    public function update(User $user, array $data): User
    {
        $user->update($data);

        return $user->fresh();
    }

    /**
     * Suspend user.
     */
    public function suspend(User $user): User
    {
        $user->update(['suspended_at' => now()]);

        return $user->fresh();
    }

    /**
     * Unsuspend user.
     */
    public function unsuspend(User $user): User
    {
        $user->update(['suspended_at' => null]);

        return $user->fresh();
    }

    /**
     * Count users by role.
     */
    public function countByRole(): array
    {
        return User::selectRaw('role, COUNT(*) as count')
            ->groupBy('role')
            ->pluck('count', 'role')
            ->toArray();
    }

    /**
     * Get recently active users.
     */
    public function getRecentlyActive(int $limit = 10): Collection
    {
        return User::whereNotNull('last_login_at')
            ->orderBy('last_login_at', 'desc')
            ->limit($limit)
            ->get();
    }
}
