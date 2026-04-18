<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;

/**
 * Activity Log Service
 * 
 * Manages audit trail for all system activities
 */
class ActivityLogService
{
    /**
     * Record an activity
     */
    public static function record(
        string $type,
        string $action,
        string $description,
        array $metadata = [],
        User|null $user = null,
        string $status = 'completed'
    ): ActivityLog {
        return ActivityLog::record($type, $action, $description, $metadata, $user, $status);
    }

    /**
     * Get paginated activity logs
     */
    public function getPaginated(int $perPage = 20, array $filters = [])
    {
        $query = ActivityLog::query();

        if ($filters['type'] ?? null) {
            $query->where('type', $filters['type']);
        }

        if ($filters['action'] ?? null) {
            $query->where('action', $filters['action']);
        }

        if ($filters['user_id'] ?? null) {
            $query->where('user_id', $filters['user_id']);
        }

        if ($filters['status'] ?? null) {
            $query->where('status', $filters['status']);
        }

        if ($filters['days'] ?? null) {
            $query->recent($filters['days']);
        }

        return $query->orderBy('created_at', 'desc')
            ->with('user')
            ->paginate($perPage);
    }

    /**
     * Get recent activities
     */
    public function getRecent(int $limit = 10, array $filters = [])
    {
        $query = ActivityLog::query();

        if ($filters['type'] ?? null) {
            $query->where('type', $filters['type']);
        }

        if ($filters['user_id'] ?? null) {
            $query->where('user_id', $filters['user_id']);
        }

        return $query->orderBy('created_at', 'desc')
            ->with('user')
            ->limit($limit)
            ->get();
    }

    /**
     * Get activity statistics
     */
    public function getStats(int $days = 7)
    {
        return [
            'total' => ActivityLog::recent($days)->count(),
            'by_type' => ActivityLog::recent($days)
                ->selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type'),
            'by_user' => ActivityLog::recent($days)
                ->selectRaw('user_id, COUNT(*) as count')
                ->groupBy('user_id')
                ->pluck('count', 'user_id'),
            'by_status' => ActivityLog::recent($days)
                ->selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status'),
        ];
    }

    /**
     * Record enrollment activity
     */
    public static function recordEnrollment(User $user, int $trainingPathId, string $trainingPathName): ActivityLog
    {
        return self::record(
            type: 'trainingPath',
            action: 'enrolled',
            description: "{$user->name} enrolled in {$trainingPathName}",
            metadata: ['training_path_id' => $trainingPathId, 'training_path_name' => $trainingPathName],
            user: $user
        );
    }

    /**
     * Record payment activity
     */
    public static function recordPayment(User $user, float $amount, string $description, array $metadata = []): ActivityLog
    {
        return self::record(
            type: 'payment',
            action: 'payment_received',
            description: "{$user->name} paid ${$amount}: {$description}",
            metadata: array_merge(['amount' => $amount], $metadata),
            user: $user
        );
    }

    /**
     * Record VM provisioning activity
     */
    public static function recordVMProvisioning(User $user, int $vmId, string $vmName, string $status = 'started'): ActivityLog
    {
        return self::record(
            type: 'vm',
            action: 'vm_' . $status,
            description: "{$user->name} {$status} VM {$vmName} (ID: {$vmId})",
            metadata: ['vm_id' => $vmId, 'vm_name' => $vmName],
            user: $user
        );
    }

    /**
     * Record trainingPath completion activity
     */
    public static function recordTrainingPathCompletion(User $user, int $trainingPathId, string $trainingPathName): ActivityLog
    {
        return self::record(
            type: 'trainingPath',
            action: 'completed',
            description: "{$user->name} completed {$trainingPathName}",
            metadata: ['training_path_id' => $trainingPathId, 'training_path_name' => $trainingPathName],
            user: $user
        );
    }

    /**
     * Record security event
     */
    public static function recordSecurityEvent(string $action, string $description, array $metadata = [], User|null $user = null): ActivityLog
    {
        return self::record(
            type: 'security',
            action: $action,
            description: $description,
            metadata: $metadata,
            user: $user
        );
    }
}
