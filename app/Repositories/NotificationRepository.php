<?php

namespace App\Repositories;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * Repository for notification database access.
 */
class NotificationRepository
{
    /**
     * Create a new notification.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Notification
    {
        return Notification::create($data);
    }

    /**
     * Find a notification by ID for a specific user.
     */
    public function findByIdForUser(string $id, string $userId): ?Notification
    {
        return Notification::forUser($userId)->find($id);
    }

    /**
     * Get paginated notifications for a user.
     */
    public function getPaginatedForUser(
        User $user,
        int $perPage = 20,
        ?bool $unreadOnly = null,
    ): LengthAwarePaginator {
        $query = Notification::forUser($user->id)
            ->orderByRaw('CASE WHEN read_at IS NULL THEN 0 ELSE 1 END')
            ->orderByDesc('created_at');

        if ($unreadOnly === true) {
            $query->unread();
        } elseif ($unreadOnly === false) {
            $query->read();
        }

        return $query->paginate($perPage);
    }

    /**
     * Get recent notifications for a user.
     */
    public function getRecentForUser(User $user, int $limit = 10): Collection
    {
        return Notification::forUser($user->id)
            ->orderByRaw('CASE WHEN read_at IS NULL THEN 0 ELSE 1 END')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }

    /**
     * Count unread notifications for a user.
     */
    public function countUnreadForUser(User $user): int
    {
        return Notification::forUser($user->id)->unread()->count();
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead(Notification $notification): Notification
    {
        $notification->markAsRead();

        return $notification->fresh();
    }

    /**
     * Mark multiple notifications as read.
     *
     * @param  array<string>  $ids
     */
    public function markManyAsRead(array $ids, string $userId): int
    {
        return Notification::forUser($userId)
            ->whereIn('id', $ids)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    /**
     * Mark all notifications as read for a user.
     */
    public function markAllAsReadForUser(User $user): int
    {
        return Notification::forUser($user->id)
            ->unread()
            ->update(['read_at' => now()]);
    }

    /**
     * Delete a notification.
     */
    public function delete(Notification $notification): bool
    {
        return $notification->delete();
    }
}
