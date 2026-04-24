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
     * Find all sessions for a user (all statuses).
     */
    public function findByUser(User $user): Collection
    {
        return VMSession::where('user_id', $user->id)
            ->with(['proxmoxServer', 'node'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Find active sessions for a user.
     */
    public function findActiveByUser(User $user): Collection
    {
        return VMSession::where('user_id', $user->id)
            ->whereIn('status', [
                VMSessionStatus::ACTIVE,
                VMSessionStatus::PENDING,
                VMSessionStatus::PROVISIONING,
            ])
            ->with(['proxmoxServer', 'node'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Find active sessions for a user on active/verified nodes.
     */
    public function findActiveByUserOnActiveServers(User $user): Collection
    {
        return VMSession::where('user_id', $user->id)
            ->whereIn('status', [
                VMSessionStatus::ACTIVE,
                VMSessionStatus::PENDING,
                VMSessionStatus::PROVISIONING,
            ])
            ->with(['proxmoxServer' => function ($q) {
                $q->where('is_verified', true);
            }, 'node'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Find all active/pending/provisioning sessions across all users.
     */
    public function findAllActive(): Collection
    {
        return VMSession::whereIn('status', [
            VMSessionStatus::ACTIVE,
            VMSessionStatus::PENDING,
            VMSessionStatus::PROVISIONING,
        ])
            ->with(['proxmoxServer', 'node', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Find pending sessions.
     */
    public function findPending(): Collection
    {
        return VMSession::where('status', VMSessionStatus::PENDING)
            ->with(['proxmoxServer', 'node', 'user'])
            ->orderBy('created_at')
            ->get();
    }

    /**
     * Find failed sessions.
     */
    public function findFailed(): Collection
    {
        return VMSession::where('status', VMSessionStatus::FAILED)
            ->with(['proxmoxServer', 'node', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Count active sessions for a user.
     */
    public function countActiveByUser(User $user): int
    {
        return VMSession::where('user_id', $user->id)
            ->whereIn('status', [
                VMSessionStatus::ACTIVE,
                VMSessionStatus::PENDING,
                VMSessionStatus::PROVISIONING,
            ])
            ->count();
    }
}
