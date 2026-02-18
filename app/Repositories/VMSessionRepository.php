<?php

namespace App\Repositories;

use App\Enums\VMSessionStatus;
use App\Models\User;
use App\Models\VMSession;
use Illuminate\Database\Eloquent\Collection;

class VMSessionRepository
{
    /**
     * Create a new VM session.
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
        return VMSession::with(['template', 'node', 'user'])
            ->find($id);
    }

    /**
     * Find all active sessions for a user.
     */
    public function findActiveByUser(User $user): Collection
    {
        return VMSession::where('user_id', $user->id)
            ->where('status', VMSessionStatus::ACTIVE->value)
            ->with(['template', 'node'])
            ->orderByDesc('created_at')
            ->get();
    }

    /**
     * Find all sessions for a user, regardless of status.
     */
    public function findByUser(User $user): Collection
    {
        return VMSession::where('user_id', $user->id)
            ->with(['template', 'node'])
            ->orderByDesc('created_at')
            ->get();
    }

    /**
     * Find all pending sessions waiting to be provisioned.
     */
    public function findPending(): Collection
    {
        return VMSession::where('status', VMSessionStatus::PENDING->value)
            ->with(['template', 'node', 'user'])
            ->orderBy('created_at')
            ->get();
    }

    /**
     * Find all expired sessions that need cleanup.
     */
    public function findExpired(): Collection
    {
        return VMSession::whereIn('status', [
            VMSessionStatus::ACTIVE->value,
            VMSessionStatus::EXPIRING->value,
        ])
            ->where('expires_at', '<', now())
            ->with(['template', 'node', 'user'])
            ->get();
    }

    /**
     * Find all failed sessions.
     */
    public function findFailed(): Collection
    {
        return VMSession::where('status', VMSessionStatus::FAILED->value)
            ->with(['template', 'node', 'user'])
            ->get();
    }

    /**
     * Update a session's status.
     */
    public function updateStatus(VMSession $session, VMSessionStatus $status): VMSession
    {
        $session->update(['status' => $status->value]);

        return $session->fresh();
    }

    /**
     * Update a session with provisioning data after successful clone.
     */
    public function updateWithVMData(VMSession $session, int $vmId, string $ipAddress = null): VMSession
    {
        $session->update([
            'vm_id' => $vmId,
            'ip_address' => $ipAddress,
            'status' => VMSessionStatus::ACTIVE->value,
        ]);

        return $session->fresh();
    }

    /**
     * Mark a session as failed with error details.
     */
    public function markFailed(VMSession $session, string $reason): VMSession
    {
        $session->update([
            'status' => VMSessionStatus::FAILED->value,
        ]);

        // Could store reason in a separate column or in logs
        // For now, we'll just log it
        \Illuminate\Support\Facades\Log::error("VM session failed", [
            'session_id' => $session->id,
            'user_id' => $session->user_id,
            'reason' => $reason,
        ]);

        return $session->fresh();
    }

    /**
     * Delete a session and its associated VM.
     */
    public function delete(VMSession $session): bool
    {
        return $session->delete();
    }
}
