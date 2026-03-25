<?php

namespace App\Console\Commands;

use App\Enums\CameraStatus;
use App\Models\Camera;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Verify camera health and update status based on stream availability.
 *
 * Checks if camera streams are actually reachable via MediaMTX HLS endpoint.
 * Cameras that are marked 'active' but have unreachable streams are marked 'inactive'.
 * Cameras that are marked 'inactive' but have reachable streams are marked 'active'.
 *
 * This prevents the UI from showing "1/1 active" when no cameras are actually working.
 *
 * Usage:
 *   php artisan camera:health-check
 *   php artisan camera:health-check --fix   # Auto-update status
 */
class CheckCameraHealthCommand extends Command
{
    protected $signature = 'camera:health-check 
                            {--fix : Automatically update camera status based on health check}
                            {--timeout=3 : HTTP timeout in seconds}';

    protected $description = 'Check if camera streams are reachable and update status accordingly';

    public function handle(): int
    {
        $cameras = Camera::with('gatewayNode')->get();

        if ($cameras->isEmpty()) {
            $this->info('No cameras configured.');

            return self::SUCCESS;
        }

        $fix = $this->option('fix');
        $timeout = (int) $this->option('timeout');

        $this->info("Checking {$cameras->count()} camera(s)...");
        $this->newLine();

        $results = [];
        $statusChanges = 0;

        foreach ($cameras as $camera) {
            $gatewayIp = $camera->gatewayNode?->ip ?? config('gateway.mediamtx_url', '192.168.50.7');
            $hlsPort = config('gateway.mediamtx_hls_port', 8888);
            $hlsUrl = "http://{$gatewayIp}:{$hlsPort}/{$camera->stream_key}/index.m3u8";

            $isReachable = $this->checkStreamReachable($hlsUrl, $timeout);
            $currentStatus = $camera->status->value;
            $expectedStatus = $isReachable ? 'active' : 'inactive';
            $statusMatch = $currentStatus === $expectedStatus;

            $results[] = [
                'id' => $camera->id,
                'name' => substr($camera->name, 0, 40),
                'current' => $currentStatus,
                'expected' => $expectedStatus,
                'match' => $statusMatch ? '✓' : '✗',
                'url' => $hlsUrl,
            ];

            // Update status if --fix is provided and status is wrong
            if ($fix && ! $statusMatch) {
                $newStatus = $isReachable ? CameraStatus::ACTIVE : CameraStatus::INACTIVE;
                $camera->update(['status' => $newStatus]);
                $statusChanges++;

                Log::info('Camera status updated by health check', [
                    'camera_id' => $camera->id,
                    'camera_name' => $camera->name,
                    'old_status' => $currentStatus,
                    'new_status' => $expectedStatus,
                    'stream_reachable' => $isReachable,
                ]);
            }
        }

        $this->table(
            ['ID', 'Name', 'Current', 'Expected', 'Match', 'Stream URL'],
            $results
        );

        $this->newLine();

        $mismatches = collect($results)->filter(fn ($r) => $r['match'] === '✗')->count();
        if ($mismatches > 0) {
            if ($fix) {
                $this->info("Updated {$statusChanges} camera status(es).");
            } else {
                $this->warn("{$mismatches} camera(s) have incorrect status. Run with --fix to update.");
            }
        } else {
            $this->info('All cameras have correct status.');
        }

        return self::SUCCESS;
    }

    /**
     * Check if a stream URL is reachable by requesting the HLS playlist.
     */
    private function checkStreamReachable(string $url, int $timeout): bool
    {
        try {
            $response = Http::timeout($timeout)->head($url);

            // HLS endpoint returns 200 if stream exists, 404 if not
            return $response->successful();
        } catch (\Exception $e) {
            return false;
        }
    }
}
