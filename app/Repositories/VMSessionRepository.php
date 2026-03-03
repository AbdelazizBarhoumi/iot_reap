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
     *
     * Filters by both status=ACTIVE and expires_at > now() to exclude
     * sessions that are technically still marked active but have passed
     * their expiration time (scheduler may not have run yet).
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
     */
    public function allUserSessions(User $user): Collection
    {
        return VMSession::where('user_id', $user->id)
            ->whereHas('proxmoxServer', fn($q) => $q->active())
            ->with(['node', 'proxmoxServer'])
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
            ->with(['node', 'proxmoxServer'])
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
     * Includes PENDING and PROVISIONING sessions that timed out
     * before they could activate (e.g. Proxmox was slow, listener failed).
     *
     * Also performs best-effort Guacamole connection cleanup for any
     * expired sessions that still have a connection ID — this prevents
     * orphaned connections in Guacamole.
     *
     * @return int Number of sessions expired
     */
    public function expireOverdueSessions(): int
    {
        // First, clean up Guacamole connections for sessions that are about to expire
        $overdueWithGuac = VMSession::whereIn('status', [
                VMSessionStatus::ACTIVE,
                VMSessionStatus::PENDING,
                VMSessionStatus::PROVISIONING,
            ])
            ->where('expires_at', '<=', now())
            ->whereNotNull('guacamole_connection_id')
            ->get();

        foreach ($overdueWithGuac as $session) {
            try {
                app(\App\Services\GuacamoleClientInterface::class)
                    ->deleteConnection((string) $session->guacamole_connection_id);
                $session->update(['guacamole_connection_id' => null]);
            } catch (\Throwable $e) {
                // Log but don't block — connection may already be gone
                \Illuminate\Support\Facades\Log::warning('Lazy expiration: Guacamole cleanup failed', [
                    'session_id' => $session->id,
                    'connection_id' => $session->guacamole_connection_id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

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
