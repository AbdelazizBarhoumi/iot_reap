<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;

/**
 * Service for system health monitoring.
 */
class SystemHealthService
{
    /**
     * Get overall system health status.
     *
     * @return array<string, mixed>
     */
    public function getSystemHealth(): array
    {
        $services = [
            'database' => $this->checkDatabase(),
            'cache' => $this->checkCache(),
            'queue' => $this->checkQueue(),
            'storage' => $this->checkStorage(),
        ];

        $overallStatus = $this->calculateOverallStatus($services);

        return [
            'status' => $overallStatus,
            'timestamp' => now()->toIso8601String(),
            'services' => $services,
            'metrics' => $this->getSystemMetrics(),
        ];
    }

    /**
     * Check database connectivity and latency.
     *
     * @return array<string, mixed>
     */
    public function checkDatabase(): array
    {
        $start = microtime(true);

        try {
            DB::select('SELECT 1');
            $latency = (microtime(true) - $start) * 1000;

            return [
                'status' => 'healthy',
                'latency_ms' => round($latency, 2),
                'message' => 'Database connection OK',
            ];
        } catch (\Exception $e) {
            Log::error('Database health check failed', ['error' => $e->getMessage()]);

            return [
                'status' => 'critical',
                'latency_ms' => null,
                'message' => 'Database connection failed: '.$e->getMessage(),
            ];
        }
    }

    /**
     * Check cache connectivity.
     *
     * @return array<string, mixed>
     */
    public function checkCache(): array
    {
        $start = microtime(true);
        $testKey = 'health_check_'.uniqid();

        try {
            Cache::put($testKey, 'ok', 10);
            $value = Cache::get($testKey);
            Cache::forget($testKey);

            $latency = (microtime(true) - $start) * 1000;

            if ($value === 'ok') {
                return [
                    'status' => 'healthy',
                    'latency_ms' => round($latency, 2),
                    'driver' => config('cache.default'),
                    'message' => 'Cache read/write OK',
                ];
            }

            return [
                'status' => 'warning',
                'latency_ms' => round($latency, 2),
                'driver' => config('cache.default'),
                'message' => 'Cache read/write mismatch',
            ];
        } catch (\Exception $e) {
            Log::error('Cache health check failed', ['error' => $e->getMessage()]);

            return [
                'status' => 'critical',
                'latency_ms' => null,
                'driver' => config('cache.default'),
                'message' => 'Cache failed: '.$e->getMessage(),
            ];
        }
    }

    /**
     * Check queue health.
     *
     * @return array<string, mixed>
     */
    public function checkQueue(): array
    {
        try {
            $driver = config('queue.default');

            if ($driver === 'sync') {
                return [
                    'status' => 'healthy',
                    'driver' => $driver,
                    'message' => 'Sync queue (no workers needed)',
                ];
            }

            // For Redis queue, check connection
            if ($driver === 'redis') {
                $connection = Redis::connection('default');
                $connection->ping();

                return [
                    'status' => 'healthy',
                    'driver' => $driver,
                    'message' => 'Redis queue connection OK',
                ];
            }

            // For database queue
            if ($driver === 'database') {
                $pendingJobs = DB::table('jobs')->count();
                $failedJobs = DB::table('failed_jobs')->count();

                $status = $failedJobs > 10 ? 'warning' : 'healthy';

                return [
                    'status' => $status,
                    'driver' => $driver,
                    'pending_jobs' => $pendingJobs,
                    'failed_jobs' => $failedJobs,
                    'message' => "Pending: {$pendingJobs}, Failed: {$failedJobs}",
                ];
            }

            return [
                'status' => 'unknown',
                'driver' => $driver,
                'message' => 'Unknown queue driver',
            ];
        } catch (\Exception $e) {
            Log::error('Queue health check failed', ['error' => $e->getMessage()]);

            return [
                'status' => 'critical',
                'driver' => config('queue.default'),
                'message' => 'Queue check failed: '.$e->getMessage(),
            ];
        }
    }

    /**
     * Check storage disk space.
     *
     * @return array<string, mixed>
     */
    public function checkStorage(): array
    {
        try {
            $storagePath = storage_path();
            $freeBytes = disk_free_space($storagePath);
            $totalBytes = disk_total_space($storagePath);

            if ($freeBytes === false || $totalBytes === false) {
                return [
                    'status' => 'unknown',
                    'message' => 'Unable to read disk space',
                ];
            }

            $usedPercent = round((($totalBytes - $freeBytes) / $totalBytes) * 100, 1);
            $freeGb = round($freeBytes / (1024 ** 3), 2);
            $totalGb = round($totalBytes / (1024 ** 3), 2);

            $status = match (true) {
                $usedPercent >= 95 => 'critical',
                $usedPercent >= 85 => 'warning',
                default => 'healthy',
            };

            return [
                'status' => $status,
                'used_percent' => $usedPercent,
                'free_gb' => $freeGb,
                'total_gb' => $totalGb,
                'message' => "{$usedPercent}% used ({$freeGb}GB free of {$totalGb}GB)",
            ];
        } catch (\Exception $e) {
            Log::error('Storage health check failed', ['error' => $e->getMessage()]);

            return [
                'status' => 'unknown',
                'message' => 'Storage check failed: '.$e->getMessage(),
            ];
        }
    }

    /**
     * Get system metrics.
     *
     * @return array<string, mixed>
     */
    public function getSystemMetrics(): array
    {
        $metrics = [];

        // PHP memory usage
        $memoryUsed = memory_get_usage(true);
        $memoryPeak = memory_get_peak_usage(true);
        $metrics['php_memory'] = [
            'used_mb' => round($memoryUsed / (1024 ** 2), 2),
            'peak_mb' => round($memoryPeak / (1024 ** 2), 2),
        ];

        // Active sessions count (from database)
        try {
            $activeSessions = DB::table('vm_sessions')
                ->where('status', 'active')
                ->count();
            $metrics['active_vm_sessions'] = $activeSessions;
        } catch (\Exception $e) {
            $metrics['active_vm_sessions'] = null;
        }

        // Active users (logged in within last hour)
        try {
            $activeUsers = DB::table('sessions')
                ->where('last_activity', '>=', now()->subHour()->timestamp)
                ->count();
            $metrics['active_users'] = $activeUsers;
        } catch (\Exception $e) {
            $metrics['active_users'] = null;
        }

        // Pending jobs
        try {
            $pendingJobs = DB::table('jobs')->count();
            $failedJobs = DB::table('failed_jobs')->count();
            $metrics['queue'] = [
                'pending' => $pendingJobs,
                'failed' => $failedJobs,
            ];
        } catch (\Exception $e) {
            $metrics['queue'] = null;
        }

        return $metrics;
    }

    /**
     * Calculate overall system status from service statuses.
     */
    private function calculateOverallStatus(array $services): string
    {
        $statuses = array_column($services, 'status');

        if (in_array('critical', $statuses)) {
            return 'critical';
        }

        if (in_array('warning', $statuses)) {
            return 'warning';
        }

        if (in_array('unknown', $statuses)) {
            return 'unknown';
        }

        return 'healthy';
    }
}
