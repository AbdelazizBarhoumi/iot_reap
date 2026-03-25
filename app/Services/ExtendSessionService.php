<?php

namespace App\Services;

use App\Enums\VMSessionStatus;
use App\Models\VMSession;
use Illuminate\Support\Facades\Log;

/**
 * Service for extending VM session durations.
 * Handles quota validation for session extensions.
 */
class ExtendSessionService
{
    /**
     * Create a new ExtendSessionService instance.
     */
    public function __construct(
        private readonly QuotaService $quotaService,
    ) {}

    /**
     * Extend a VM session by the specified number of minutes.
     *
     * Validates user quota before extending. Updates expires_at and reschedules
     * the CleanupVMJob with the new expiration time.
     *
     * @throws \App\Exceptions\QuotaExceededException if extension would exceed quota
     */
    public function extend(VMSession $session, int $minutes): VMSession
    {
        Log::info('Extending VM session', [
            'session_id' => $session->id,
            'current_expiry' => $session->expires_at,
            'extend_minutes' => $minutes,
        ]);

        // Only allow extending active sessions that haven't passed their expiry.
        // If status is ACTIVE but expires_at has passed, the scheduler hasn't
        // cleaned it up yet — reject the extension request.
        if ($session->status !== VMSessionStatus::ACTIVE) {
            throw new \Exception(
                "Cannot extend session with status: {$session->status->value}"
            );
        }

        if ($session->expires_at && $session->expires_at->isPast()) {
            throw new \Exception(
                'Cannot extend session that has already expired. Please start a new session.'
            );
        }

        // Validate that extension won't exceed quota
        // The quota check needs to account for all active sessions + this extension
        $this->quotaService->assertExtensionNotExceeded(
            user: $session->user,
            additionalMinutes: $minutes,
        );

        // Calculate new expiration
        $newExpiresAt = $session->expires_at->addMinutes($minutes);

        Log::info('Updated session expiration', [
            'session_id' => $session->id,
            'old_expiry' => $session->expires_at,
            'new_expiry' => $newExpiresAt,
        ]);

        // Update the session
        $session->update(['expires_at' => $newExpiresAt]);
        $session->refresh();

        // No delayed job needed — lazy expiration in the controller and
        // repository handles auto-expiry when the session is next accessed.

        Log::info('VM session extended successfully', [
            'session_id' => $session->id,
            'new_expiry' => $newExpiresAt,
        ]);

        return $session;
    }
}
