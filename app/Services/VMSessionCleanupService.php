<?php

namespace App\Services;

use App\Repositories\VMSessionRepository;
use Illuminate\Support\Facades\Log;

/**
 * Service for VM session cleanup operations.
 *
 * Handles expiration of overdue sessions and cleanup of
 * associated resources (Guacamole connections, VMs, etc.).
 */
class VMSessionCleanupService
{
    public function __construct(
        private readonly VMSessionRepository $vmSessionRepository,
        private readonly GuacamoleClientInterface $guacamoleClient,
    ) {}

    /**
     * Expire overdue sessions and clean up associated resources.
     *
     * This method performs best-effort cleanup of Guacamole connections
     * before marking sessions as expired. Any cleanup failures are logged
     * but do not prevent the session from being expired.
     *
     * @return int Number of sessions expired
     */
    public function expireOverdueSessions(): int
    {
        // Clean up Guacamole connections for overdue sessions
        $this->cleanupGuacamoleConnections();

        // Mark all overdue sessions as expired
        $expiredCount = $this->vmSessionRepository->markOverdueAsExpired();

        if ($expiredCount > 0) {
            Log::info('VM sessions expired', ['count' => $expiredCount]);
        }

        return $expiredCount;
    }

    /**
     * Clean up Guacamole connections for overdue sessions.
     *
     * This is a best-effort operation — failures are logged but
     * do not prevent session expiration.
     */
    private function cleanupGuacamoleConnections(): void
    {
        $sessions = $this->vmSessionRepository->findOverdueWithGuacamoleConnections();

        foreach ($sessions as $session) {
            try {
                $this->guacamoleClient->deleteConnection((string) $session->guacamole_connection_id);
                $session->update(['guacamole_connection_id' => null]);

                Log::debug('Guacamole connection cleaned up', [
                    'session_id' => $session->id,
                    'connection_id' => $session->guacamole_connection_id,
                ]);
            } catch (\Throwable $e) {
                // Connection may already be gone — log but don't block
                Log::warning('Guacamole cleanup failed during expiration', [
                    'session_id' => $session->id,
                    'connection_id' => $session->guacamole_connection_id,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    /**
     * Clean up a single session's Guacamole connection.
     */
    public function cleanupSessionGuacamole(string $sessionId): bool
    {
        $session = $this->vmSessionRepository->findById($sessionId);

        if (! $session || ! $session->guacamole_connection_id) {
            return false;
        }

        try {
            $this->guacamoleClient->deleteConnection((string) $session->guacamole_connection_id);
            $session->update(['guacamole_connection_id' => null]);

            Log::info('Guacamole connection manually cleaned up', [
                'session_id' => $session->id,
            ]);

            return true;
        } catch (\Throwable $e) {
            Log::error('Manual Guacamole cleanup failed', [
                'session_id' => $session->id,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }
}
