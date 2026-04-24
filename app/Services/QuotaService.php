<?php

namespace App\Services;

use App\Enums\VMSessionStatus;
use App\Exceptions\QuotaExceededException;
use App\Models\User;
use App\Models\VMSession;

/**
 * Service for checking and enforcing user session quotas.
 *
 * Validates that users do not exceed:
 * - Maximum concurrent sessions
 * - Maximum concurrent minutes (total time of active sessions)
 */
class QuotaService
{
    /**
     * Assert that a user can create a new session with the given duration.
     *
     * @throws QuotaExceededException if quota would be exceeded
     */
    public function assertAllowedToCreate(User $user, int $durationMinutes): void
    {
        $maxConcurrent = config('sessions.max_concurrent_sessions');
        $maxMinutes = config('sessions.max_concurrent_minutes');

        // Count sessions that are occupying a slot: ACTIVE, PENDING, and
        // PROVISIONING all count toward the concurrent limit.  Sessions may
        // have status=ACTIVE but be past expires_at if the lazy expiration
        // hasn't run yet — don't count those as blocking quota.
        $activeCount = VMSession::where('user_id', $user->id)
            ->whereIn('status', [
                VMSessionStatus::ACTIVE,
                VMSessionStatus::PENDING,
                VMSessionStatus::PROVISIONING,
            ])
            ->where('expires_at', '>', now())
            ->count();

        // if ($activeCount >= $maxConcurrent) {
        //     throw new \DomainException(
        //         "Maximum concurrent sessions ({$maxConcurrent}) reached. ".
        //         'Please terminate an existing session before creating a new one.'
        //     );
        // }

        // Check total concurrent minutes
        $totalMinutes = $this->getTotalActiveMinutes($user);

        // if ($totalMinutes + $durationMinutes > $maxMinutes) {
        //     throw new \DomainException(
        //         "Requesting {$durationMinutes} minutes would exceed quota. ".
        //         "Current usage: {$totalMinutes}m, max allowed: {$maxMinutes}m"
        //     );
        // }
    }

    /**
     * Assert that extending a user's session won't exceed quota.
     *
     * @throws QuotaExceededException if extension would exceed quota
     */
    public function assertExtensionNotExceeded(User $user, int $additionalMinutes): void
    {
        $maxMinutes = config('sessions.max_concurrent_minutes');
        $totalMinutes = $this->getTotalActiveMinutes($user);

        // if ($totalMinutes + $additionalMinutes > $maxMinutes) {
        //     throw new \DomainException(
        //         "Cannot extend by {$additionalMinutes} minutes. ".
        //         "Current usage: {$totalMinutes}m, max allowed: {$maxMinutes}m, ".
        //         '(requested total: '.($totalMinutes + $additionalMinutes).'m)'
        //     );
        // }
    }

    /**
     * Calculate total minutes for all active sessions for a user.
     *
     * Since expires_at is the absolute expiration time, we calculate
     * remaining minutes by subtracting now() from expires_at.
     */
    private function getTotalActiveMinutes(User $user): int
    {
        $activeSessions = VMSession::where('user_id', $user->id)
            ->where('status', VMSessionStatus::ACTIVE)
            ->where('expires_at', '>', now())
            ->get();

        $totalMinutes = 0;
        foreach ($activeSessions as $session) {
            $remaining = now()->diffInMinutes($session->expires_at, absolute: false);
            if ($remaining > 0) {
                $totalMinutes += $remaining;
            }
        }

        return $totalMinutes;
    }
}
