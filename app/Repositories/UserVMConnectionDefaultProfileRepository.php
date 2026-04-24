<?php

namespace App\Repositories;

use App\Models\User;
use App\Models\UserVMConnectionDefaultProfile;
use Illuminate\Database\Eloquent\Collection;

/**
 * Repository for per-VM connection default profiles.
 * Stores which connection profile a user prefers for a specific VM and protocol.
 */
class UserVMConnectionDefaultProfileRepository
{
    /**
     * Find the default profile for a user + VM + protocol combination.
     * Fallback to any admin-defined default for this VM if the user hasn't set one.
     * Returns null when no per-VM default is set by user or admin.
     */
    public function findPerVMDefault(\App\Models\User $user, int $vmId, string $protocol): ?UserVMConnectionDefaultProfile
    {
        // 1. Try user's own preferred profile for this VM
        $userDefault = UserVMConnectionDefaultProfile::where('user_id', $user->id)
            ->where('vm_id', $vmId)
            ->where('vm_session_protocol', $protocol)
            ->first();

        if ($userDefault) {
            return $userDefault;
        }

        return $this->findGlobalDefault($vmId, $protocol);
    }

    /**
     * Find an admin-defined default for this VM + protocol.
     */
    public function findGlobalDefault(int $vmId, string $protocol): ?UserVMConnectionDefaultProfile
    {
        return UserVMConnectionDefaultProfile::whereHas('user', function ($query) {
            $query->where('role', \App\Enums\UserRole::ADMIN->value);
        })
            ->where('vm_id', $vmId)
            ->where('vm_session_protocol', $protocol)
            ->orderBy('updated_at', 'desc')
            ->first();
    }

    /**
     * Set or update the preferred profile for a user + VM + protocol combination.
     */
    public function setPerVMDefault(
        User $user,
        int $vmId,
        string $protocol,
        string $profileName,
    ): UserVMConnectionDefaultProfile {
        return UserVMConnectionDefaultProfile::updateOrCreate(
            [
                'user_id' => $user->id,
                'vm_id' => $vmId,
                'vm_session_protocol' => $protocol,
            ],
            [
                'preferred_profile_name' => $profileName,
            ]
        );
    }

    /**
     * Delete the per-VM default for a user + VM + protocol combination.
     */
    public function deletePerVMDefault(User $user, int $vmId, string $protocol): bool
    {
        return UserVMConnectionDefaultProfile::where('user_id', $user->id)
            ->where('vm_id', $vmId)
            ->where('vm_session_protocol', $protocol)
            ->delete() > 0;
    }

    /**
     * Find all per-VM defaults for a user (all VMs + protocols).
     */
    public function findAllByUser(User $user): Collection
    {
        return UserVMConnectionDefaultProfile::where('user_id', $user->id)
            ->orderBy('vm_id')
            ->orderBy('vm_session_protocol')
            ->get();
    }

    /**
     * Find all per-VM defaults for a user + VM (all protocols).
     */
    public function findAllByUserAndVM(User $user, int $vmId): Collection
    {
        return UserVMConnectionDefaultProfile::where('user_id', $user->id)
            ->where('vm_id', $vmId)
            ->orderBy('vm_session_protocol')
            ->get();
    }
}
