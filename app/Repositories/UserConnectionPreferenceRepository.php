<?php

namespace App\Repositories;

use App\Models\GuacamoleConnectionPreference;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

/**
 * Repository for user Guacamole connection preferences.
 * Supports multiple named profiles per protocol (rdp / vnc / ssh).
 */
class UserConnectionPreferenceRepository
{
    /**
     * Find the default preferences for a user + protocol combination.
     * Returns null when the user has no default profile for this protocol.
     */
    public function findByUser(User $user, string $sessionType): ?GuacamoleConnectionPreference
    {
        return GuacamoleConnectionPreference::where('user_id', $user->id)
            ->where('vm_session_type', $sessionType)
            ->where('is_default', true)
            ->first();
    }

    /**
     * Find a specific profile by name.
     */
    public function findByProfile(User $user, string $sessionType, string $profileName): ?GuacamoleConnectionPreference
    {
        return GuacamoleConnectionPreference::where('user_id', $user->id)
            ->where('vm_session_type', $sessionType)
            ->where('profile_name', $profileName)
            ->first();
    }

    /**
     * Find all profiles for a user + protocol combination.
     */
    public function findAllByUser(User $user, string $sessionType): Collection
    {
        return GuacamoleConnectionPreference::where('user_id', $user->id)
            ->where('vm_session_type', $sessionType)
            ->orderByDesc('is_default')
            ->orderBy('profile_name')
            ->get();
    }

    /**
     * Find all profiles for a user (all protocols).
     */
    public function findAllProfilesForUser(User $user): Collection
    {
        return GuacamoleConnectionPreference::where('user_id', $user->id)
            ->orderBy('vm_session_type')
            ->orderByDesc('is_default')
            ->orderBy('profile_name')
            ->get();
    }

    /**
     * Create or update saved preferences for a user + protocol + profile combination.
     *
     * @param  array<string, mixed>  $params
     */
    public function save(
        User $user,
        string $sessionType,
        array $params,
        string $profileName = 'Default',
        bool $isDefault = false,
    ): GuacamoleConnectionPreference {
        // If setting as default, unset other defaults for this protocol
        if ($isDefault) {
            GuacamoleConnectionPreference::where('user_id', $user->id)
                ->where('vm_session_type', $sessionType)
                ->where('profile_name', '!=', $profileName)
                ->update(['is_default' => false]);
        }

        return GuacamoleConnectionPreference::updateOrCreate(
            [
                'user_id'         => $user->id,
                'vm_session_type' => $sessionType,
                'profile_name'    => $profileName,
            ],
            [
                'parameters' => $params,
                'is_default' => $isDefault,
            ]
        );
    }

    /**
     * Delete a specific profile.
     */
    public function delete(User $user, string $sessionType, string $profileName): bool
    {
        return GuacamoleConnectionPreference::where('user_id', $user->id)
            ->where('vm_session_type', $sessionType)
            ->where('profile_name', $profileName)
            ->delete() > 0;
    }

    /**
     * Set a profile as the default for its protocol.
     */
    public function setDefault(User $user, string $sessionType, string $profileName): bool
    {
        // Unset all other defaults for this protocol
        GuacamoleConnectionPreference::where('user_id', $user->id)
            ->where('vm_session_type', $sessionType)
            ->update(['is_default' => false]);

        // Set the specified profile as default
        return GuacamoleConnectionPreference::where('user_id', $user->id)
            ->where('vm_session_type', $sessionType)
            ->where('profile_name', $profileName)
            ->update(['is_default' => true]) > 0;
    }
}
