<?php

namespace App\Repositories;

use App\Models\GuacamoleConnectionPreference;
use App\Models\User;

/**
 * Repository for user Guacamole connection preferences.
 * Preferences are stored per user per protocol (rdp / vnc / ssh).
 */
class UserConnectionPreferenceRepository
{
    /**
     * Find saved preferences for a user + protocol combination.
     * Returns null when the user has never saved preferences for this protocol.
     */
    public function findByUser(User $user, string $sessionType): ?GuacamoleConnectionPreference
    {
        return GuacamoleConnectionPreference::where('user_id', $user->id)
            ->where('vm_session_type', $sessionType)
            ->first();
    }

    /**
     * Create or update saved preferences for a user + protocol combination.
     *
     * @param  array<string, mixed>  $params
     */
    public function save(User $user, string $sessionType, array $params): GuacamoleConnectionPreference
    {
        return GuacamoleConnectionPreference::updateOrCreate(
            [
                'user_id'         => $user->id,
                'vm_session_type' => $sessionType,
            ],
            [
                'parameters' => $params,
            ]
        );
    }
}
