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
     * @param  array<string, mixed>  $data
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
     *
     * Filters by both status=ACTIVE and expires_at > now() to exclude
     * sessions that are technically still marked active but have passed
     * their expiration time (scheduler may not have run yet).
     *
     * @deprecated Unused - VMSession scopes handle this query directly. Candidate for removal.
     */
    public function findActiveByUser(User $user): Collection
    {
        return VMSession::where('user_id', $user->id)
            ->where('status', VMSessionStatus::ACTIVE)
            ->where('expires_at', '>', now())
            ->with(['node'])
            ->get();
    }

    /**
     * Find all sessions for a user (all statuses).
     *
     * @deprecated Unused - VMSession::where() used directly. Candidate for removal.
     */
    public function findByUser(User $user): Collection
    {
        return VMSession::where('user_id', $user->id)
            ->with(['node'])
            ->orderByDesc('created_at')
            ->get();
    }

    /**
     * Find all sessions for a user ensuring their server is active.
     *
     * Excludes sessions on inactive servers.
     *
     * @deprecated Unused - no service calls this method. Candidate for removal.
     */
    public function allUserSessions(User $user): Collection
    {
        return VMSession::where('user_id', $user->id)
            ->whereHas('proxmoxServer', fn ($q) => $q->active())
            ->with(['node', 'proxmoxServer'])
            ->orderByDesc('created_at')
            ->get();
    }

    /**
     * Find all active sessions for a user on active servers.
     *
     * @deprecated Unused - VMSessionService queries directly. Candidate for removal.
     */
    public function findActiveByUserOnActiveServers(User $user): Collection
    {
        return VMSession::where('user_id', $user->id)
            ->where('status', VMSessionStatus::ACTIVE)
            ->where('expires_at', '>', now())
            ->whereHas('proxmoxServer', fn ($q) => $q->active())
            ->with(['node', 'proxmoxServer'])
            ->get();
    }

    /**
     * Update a session's status and other fields.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(VMSession $session, array $data): VMSession
    {
        $session->update($data);

        return $session->fresh();
    }

    /**
     * Get overdue sessions that need to be expired.
     *
     * Returns sessions that are still active/pending/provisioning but have
     * passed their expiration time.
     *
     * @deprecated Unused - findOverdueWithGuacamoleConnections() is used instead. Candidate for removal.
     */
    public function findOverdueSessions(): Collection
    {
        return VMSession::whereIn('status', [
            VMSessionStatus::ACTIVE,
            VMSessionStatus::PENDING,
            VMSessionStatus::PROVISIONING,
        ])
            ->where('expires_at', '<=', now())
            ->get();
    }

    /**
     * Get overdue sessions that have Guacamole connections to clean up.
     */
    public function findOverdueWithGuacamoleConnections(): Collection
    {
        return VMSession::whereIn('status', [
            VMSessionStatus::ACTIVE,
            VMSessionStatus::PENDING,
            VMSessionStatus::PROVISIONING,
        ])
            ->where('expires_at', '<=', now())
            ->whereNotNull('guacamole_connection_id')
            ->get();
    }

    /**
     * Mark overdue sessions as expired (database-only operation).
     *
     * @return int Number of sessions expired
     */
    public function markOverdueAsExpired(): int
    {
        return VMSession::whereIn('status', [
            VMSessionStatus::ACTIVE,
            VMSessionStatus::PENDING,
            VMSessionStatus::PROVISIONING,
        ])
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
     *
     * Only counts sessions that are both status=ACTIVE and not past expires_at.
     *
     * @deprecated Unused - session limits checked via VMSession::count() directly. Candidate for removal.
     */
    public function countActiveByUser(User $user): int
    {
        return VMSession::where('user_id', $user->id)
            ->where('status', VMSessionStatus::ACTIVE)
            ->where('expires_at', '>', now())
            ->count();
    }

    /**
     * Find pending sessions (not yet started).
     *
     * @deprecated Unused - admin dashboard queries directly with scopes. Candidate for removal.
     */
    public function findPending(): Collection
    {
        return VMSession::where('status', VMSessionStatus::PENDING)
            ->with(['user', 'template', 'node'])
            ->get();
    }

    /**
     * Find sessions that failed to provision.
     *
     * @deprecated Unused - admin dashboard queries directly with scopes. Candidate for removal.
     */
    public function findFailed(): Collection
    {
        return VMSession::where('status', VMSessionStatus::FAILED)
            ->with(['user', 'template', 'node'])
            ->orderByDesc('created_at')
            ->get();
    }
}
