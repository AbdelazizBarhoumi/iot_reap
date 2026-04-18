<?php

namespace App\Services;

use App\Models\SystemAlert;
use App\Models\User;
use Illuminate\Pagination\Paginate;

/**
 * Alert Service
 * 
 * Manages system alerts (infrastructure warnings, errors, critical issues)
 */
class AlertService
{
    /**
     * Create a new alert
     */
    public function create(
        string $severity,
        string $title,
        string $description = null,
        string $source = null,
        array $metadata = []
    ): SystemAlert {
        return SystemAlert::create([
            'severity' => $severity,
            'title' => $title,
            'description' => $description,
            'source' => $source,
            'metadata' => $metadata,
        ]);
    }

    /**
     * Get all unacknowledged alerts
     */
    public function getUnacknowledged()
    {
        return SystemAlert::unacknowledged()
            ->unresolved()
            ->orderBy('severity', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get paginated alerts
     */
    public function getPaginated(int $perPage = 15, array $filters = [])
    {
        $query = SystemAlert::query();

        if ($filters['severity'] ?? null) {
            $query->where('severity', $filters['severity']);
        }

        if ($filters['source'] ?? null) {
            $query->where('source', $filters['source']);
        }

        if ($filters['status'] ?? null) {
            if ($filters['status'] === 'unacknowledged') {
                $query->unacknowledged();
            } elseif ($filters['status'] === 'acknowledged') {
                $query->where('acknowledged', true);
            }
        }

        return $query->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Acknowledge an alert
     */
    public function acknowledge(SystemAlert $alert, User $user = null): void
    {
        $alert->acknowledge($user);
    }

    /**
     * Resolve an alert
     */
    public function resolve(SystemAlert $alert): void
    {
        $alert->resolve();
    }

    /**
     * Get alert statistics
     */
    public function getStats()
    {
        return [
            'total' => SystemAlert::count(),
            'unacknowledged' => SystemAlert::unacknowledged()->count(),
            'unresolved' => SystemAlert::unresolved()->count(),
            'critical' => SystemAlert::unresolved()->where('severity', 'critical')->count(),
            'by_severity' => SystemAlert::unresolved()
                ->selectRaw('severity, COUNT(*) as count')
                ->groupBy('severity')
                ->pluck('count', 'severity'),
            'by_source' => SystemAlert::unresolved()
                ->selectRaw('source, COUNT(*) as count')
                ->groupBy('source')
                ->pluck('count', 'source'),
        ];
    }

    /**
     * Create a Proxmox node alert
     */
    public function createNodeAlert(string $nodeId, string $status, array $metadata = []): SystemAlert
    {
        $severityMap = [
            'offline' => 'critical',
            'degraded' => 'warning',
            'high_cpu' => 'warning',
            'high_memory' => 'warning',
            'disk_full' => 'critical',
        ];

        return $this->create(
            severity: $severityMap[$status] ?? 'warning',
            title: "Node Alert: {$nodeId}",
            description: "Node {$nodeId} status: {$status}",
            source: 'proxmox',
            metadata: array_merge(['node' => $nodeId, 'status' => $status], $metadata)
        );
    }

    /**
     * Create a VM alert
     */
    public function createVMAlert(string $vmId, string $status, array $metadata = []): SystemAlert
    {
        $severityMap = [
            'failed' => 'critical',
            'crashed' => 'critical',
            'paused' => 'warning',
        ];

        return $this->create(
            severity: $severityMap[$status] ?? 'info',
            title: "VM Alert: {$vmId}",
            description: "Virtual Machine {$vmId} status: {$status}",
            source: 'vm',
            metadata: array_merge(['vm_id' => $vmId, 'status' => $status], $metadata)
        );
    }
}
