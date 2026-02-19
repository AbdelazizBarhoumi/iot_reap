<?php

namespace App\Repositories;

use App\Enums\VMSessionStatus;
use App\Models\User;
use App\Models\VMSession;
use Illuminate\Database\Eloquent\Collection;

/**
 * Repository for VM session database access.
 */
class VMSessionRepository
{
    /**
     * Create a new VM session record.
     *
     * @param array<string, mixed> $data
     */
    public function create(array $data): VMSession
    {
        return VMSession::create($data);
    }

    /**
     * Find a session by ID.
     */
    public function findById(string $id): ?VMSession
    {
        return VMSession::find($id);
    }

    /**
     * Find all active sessions for a user.
     */
    public function findActiveByUser(User $user): Collection
    {
        return VMSession::where('user_id', $user->id)
            ->where('status', VMSessionStatus::ACTIVE)
            ->with(['template', 'node'])
            ->get();
    }

    /**
     * Find all sessions for a user (all statuses).
     */
    public function findByUser(User $user): Collection
    {
        return VMSession::where('user_id', $user->id)
            ->with(['template', 'node'])
            ->orderByDesc('created_at')
            ->get();
    }

    /**
     * Find all sessions for a user ensuring their server is active.
     *
     * Excludes sessions on inactive servers.
     */
    public function allUserSessions(User $user): Collection
    {
        return VMSession::where('user_id', $user->id)
            ->whereHas('proxmoxServer', fn($q) => $q->active())
            ->with(['template', 'node', 'proxmoxServer'])
            ->orderByDesc('created_at')
            ->get();
    }

    /**
     * Find all active sessions for a user on active servers.
     */
    public function findActiveByUserOnActiveServers(User $user): Collection
    {
        return VMSession::where('user_id', $user->id)
            ->where('status', VMSessionStatus::ACTIVE)
            ->where('expires_at', '>', now())
            ->whereHas('proxmoxServer', fn($q) => $q->active())
            ->with(['template', 'node', 'proxmoxServer'])
            ->get();
    }

    /**
     * Update a session's status and other fields.
     *
     * @param array<string, mixed> $data
     */
    public function update(VMSession $session, array $data): VMSession
    {
        $session->update($data);

        return $session->fresh();
    }

    /**
     * Expire sessions that have passed their expiration time.
     *
     * @return int Number of sessions expired
     */
    public function expireOverdueSessions(): int
    {
        return VMSession::where('status', VMSessionStatus::ACTIVE)
            ->where('expires_at', '<=', now())
            ->update(['status' => VMSessionStatus::EXPIRED]);
    }

    /**
     * Delete a session.
     */
    public function delete(VMSession $session): bool
    {
        return (bool) $session->delete();
    }

    /**
     * Count active sessions for a user.
     */
    public function countActiveByUser(User $user): int
    {
        return VMSession::where('user_id', $user->id)
            ->where('status', VMSessionStatus::ACTIVE)
            ->count();
    }

    /**
     * Find pending sessions (not yet started).
     */
    public function findPending(): Collection
    {
        return VMSession::where('status', VMSessionStatus::PENDING)
            ->with(['user', 'template', 'node'])
            ->get();
    }

    /**
     * Find sessions that failed to provision.
     */
    public function findFailed(): Collection
    {
        return VMSession::where('status', VMSessionStatus::FAILED)
            ->with(['user', 'template', 'node'])
            ->orderByDesc('created_at')
            ->get();
    }
}
