<?php

namespace App\Services;

use App\Models\User;
use App\Models\VMSession;
use App\Repositories\UserConnectionPreferenceRepository;
use App\Repositories\UserVMConnectionDefaultProfileRepository;
use App\Repositories\VMReservationRepository;
use App\Repositories\VMSessionRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;

/**
 * Service for VM session business logic.
 *
 * Handles VM session lifecycle, Guacamole integration, and cleanup operations.
 */
class VMSessionService
{
    public function __construct(
        private readonly VMSessionRepository $vmSessionRepository,
        private readonly VMReservationRepository $vmReservationRepository,
        private readonly GuacamoleClientInterface $guacamoleClient,
        private readonly ProxmoxClientInterface $proxmoxClient,
        private readonly TrainingUnitVMAssignmentService $trainingUnitVMAssignmentService,
        private readonly UserVMConnectionDefaultProfileRepository $vmDefaultRepository,
        private readonly UserConnectionPreferenceRepository $preferenceRepository,
    ) {}

    /**
     * Create a new VM session.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): VMSession
    {
        Log::info('Creating VM session', ['user_id' => $data['user_id'] ?? null]);

        return $this->vmSessionRepository->create($data);
    }

    /**
     * Ensure the requested VM session window does not overlap another user's approved reservation.
     */
    public function assertSessionWindowAvailable(User $user, int $nodeId, int $vmId, \DateTimeInterface $startAt, \DateTimeInterface $endAt): void
    {
        $conflict = $this->vmReservationRepository->findConflictingVmReservation($nodeId, $vmId, $startAt, $endAt);

        if (! $conflict || (string) $conflict->user_id === (string) $user->id) {
            return;
        }

        $reservedBy = $conflict->user?->name ?? 'another user';
        $until = $conflict->approved_end_at?->format('Y-m-d H:i:s');

        throw new \DomainException($until
            ? "VM is reserved by {$reservedBy} until {$until}."
            : "VM is reserved by {$reservedBy}."
        );
    }

    /**
     * Find active sessions for a user.
     */
    public function getActiveByUser(User $user): Collection
    {
        return $this->vmSessionRepository->findActiveByUser($user);
    }

    /**
     * Find active sessions for a user on active servers.
     */
    public function getActiveByUserOnActiveServers(User $user): Collection
    {
        return $this->vmSessionRepository->findActiveByUserOnActiveServers($user);
    }

    /**
     * Update a session's status and other fields.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateSession(VMSession $session, array $data): VMSession
    {
        Log::info('Updating VM session', [
            'session_id' => $session->id,
            'old_status' => $session->status?->value,
            'new_status' => $data['status'] ?? null,
        ]);

        return $this->vmSessionRepository->update($session, $data);
    }

    /**
     * Expire overdue sessions and clean up Guacamole connections.
     *
     * This method handles the business logic for session expiry:
     * 1. Find sessions with Guacamole connections that are overdue
     * 2. Clean up Guacamole connections
     * 3. Mark sessions as expired
     *
     * @return int Number of sessions expired
     */
    public function expireOverdueSessions(): int
    {
        $overdueWithConnections = $this->vmSessionRepository->findOverdueWithGuacamoleConnections();

        $cleaned = 0;
        foreach ($overdueWithConnections as $session) {
            try {
                // Clean up Guacamole connection
                if ($session->guacamole_connection_id) {
                    $this->cleanupGuacamoleConnection($session);
                }
            } catch (\Exception $e) {
                Log::error('Failed to cleanup Guacamole connection during expiry', [
                    'session_id' => $session->id,
                    'connection_id' => $session->guacamole_connection_id,
                    'error' => $e->getMessage(),
                ]);
            }
            $cleaned++;
        }

        // Mark all overdue sessions as expired (database operation only)
        $totalExpired = $this->vmSessionRepository->markOverdueAsExpired();

        Log::info('Expired overdue VM sessions', [
            'total_expired' => $totalExpired,
            'guacamole_cleaned' => $cleaned,
        ]);

        return $totalExpired;
    }

    /**
     * Clean up Guacamole connection for a session.
     */
    public function cleanupGuacamoleConnection(VMSession $session): void
    {
        if (! $session->guacamole_connection_id) {
            return;
        }

        try {
            Log::info('Cleaning up Guacamole connection', [
                'session_id' => $session->id,
                'connection_id' => $session->guacamole_connection_id,
            ]);

            // Delete Guacamole connection
            $this->guacamoleClient->deleteConnection($session->guacamole_connection_id);

            // Clear the connection ID from the session
            $this->vmSessionRepository->update($session, [
                'guacamole_connection_id' => null,
            ]);

            Log::info('Guacamole connection cleaned up successfully', [
                'session_id' => $session->id,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to cleanup Guacamole connection', [
                'session_id' => $session->id,
                'connection_id' => $session->guacamole_connection_id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Create Guacamole connection for a session.
     *
     * @param  array<string, mixed>  $connectionParams
     */
    public function createGuacamoleConnection(VMSession $session, array $connectionParams): string
    {
        try {
            Log::info('Creating Guacamole connection for session', [
                'session_id' => $session->id,
            ]);

            $connectionId = $this->guacamoleClient->createConnection([
                'name' => "session-{$session->id}",
                'protocol' => $connectionParams['protocol'] ?? 'rdp',
                'parameters' => $connectionParams,
            ]);

            // Update session with connection ID
            $this->vmSessionRepository->update($session, [
                'guacamole_connection_id' => $connectionId,
            ]);

            Log::info('Guacamole connection created successfully', [
                'session_id' => $session->id,
                'connection_id' => $connectionId,
            ]);

            return $connectionId;
        } catch (\Exception $e) {
            Log::error('Failed to create Guacamole connection', [
                'session_id' => $session->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Count active sessions for a user.
     */
    public function countActiveByUser(User $user): int
    {
        return $this->vmSessionRepository->countActiveByUser($user);
    }

    /**
     * Delete a session and clean up external resources.
     */
    public function deleteSession(VMSession $session): bool
    {
        Log::info('Deleting VM session', ['session_id' => $session->id]);

        // Clean up Guacamole connection first
        if ($session->guacamole_connection_id) {
            try {
                $this->cleanupGuacamoleConnection($session);
            } catch (\Exception $e) {
                Log::warning('Failed to cleanup Guacamole connection during deletion', [
                    'session_id' => $session->id,
                    'error' => $e->getMessage(),
                ]);
                // Continue with deletion even if Guacamole cleanup fails
            }
        }

        return $this->vmSessionRepository->delete($session);
    }

    /**
     * Get sessions by user (all statuses).
     */
    public function getSessionsByUser(User $user): Collection
    {
        return $this->vmSessionRepository->findByUser($user);
    }

    /**
     * Get pending sessions.
     */
    public function getPendingSessions(): Collection
    {
        return $this->vmSessionRepository->findPending();
    }

    /**
     * Get failed sessions.
     */
    public function getFailedSessions(): Collection
    {
        return $this->vmSessionRepository->findFailed();
    }

    /**
     * Resolve admin-defined per-VM launch overrides for a lesson training unit launch.
     *
     * Ensures the user is launching the exact approved/access-granted VM for the
     * training unit and, when configured, forces the admin per-VM default profile
     * credentials for this protocol.
     *
     * @return array{connection_profile_name: string|null, credentials: array{username?: string, password?: string}}
     */
    public function resolveTrainingUnitLaunchOverrides(
        User $user,
        int $trainingUnitId,
        int $nodeId,
        int $vmId,
        string $protocol,
    ): array {
        $accessibleVm = $this->trainingUnitVMAssignmentService->getAccessibleVMForTrainingUnit($trainingUnitId, $user);

        if (! $accessibleVm) {
            throw new \DomainException('You cannot launch a VM for this training unit.');
        }

        if ((int) ($accessibleVm['vm_id'] ?? 0) !== $vmId || (int) ($accessibleVm['node_id'] ?? 0) !== $nodeId) {
            throw new \DomainException('Requested VM does not match the approved training unit assignment.');
        }

        $adminVmDefault = $this->vmDefaultRepository->findGlobalDefault($vmId, $protocol);

        if (! $adminVmDefault) {
            return [
                'connection_profile_name' => null,
                'credentials' => [],
            ];
        }

        $credentials = [];

        $adminPreference = $this->preferenceRepository->findByProfile(
            $adminVmDefault->user,
            $protocol,
            $adminVmDefault->preferred_profile_name,
        );

        if ($adminPreference && is_array($adminPreference->parameters)) {
            if (! empty($adminPreference->parameters['username']) && is_string($adminPreference->parameters['username'])) {
                $credentials['username'] = $adminPreference->parameters['username'];
            }
            if (! empty($adminPreference->parameters['password']) && is_string($adminPreference->parameters['password'])) {
                $credentials['password'] = $adminPreference->parameters['password'];
            }
        }

        return [
            'connection_profile_name' => $adminVmDefault->preferred_profile_name,
            'credentials' => $credentials,
        ];
    }
}
