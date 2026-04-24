<?php

namespace App\Console\Commands;

use App\Enums\CameraStatus;
use App\Models\Camera;
use App\Models\GatewayNode;
use App\Services\GatewayService;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Collection;
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
 *   php artisan camera:health-check --fix
 *   php artisan camera:health-check --fix --heal --cleanup-orphans
 */
class CheckCameraHealthCommand extends Command
{
    protected $signature = 'camera:health-check 
                            {--fix : Automatically update camera status based on health check}
                            {--heal : Restart active USB cameras when their stream is missing}
                            {--cleanup-orphans : Stop leftover gateway stream services that no longer map to a camera}
                            {--timeout=3 : HTTP timeout in seconds}';

    protected $description = 'Check camera stream health, recover active USB cameras, and clean orphaned stream services';

    public function __construct(
        private readonly GatewayService $gatewayService,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $fix = $this->option('fix');
        $heal = $this->option('heal');
        $cleanupOrphans = $this->option('cleanup-orphans');
        $timeout = (int) $this->option('timeout');
        $cameras = Camera::with(['gatewayNode', 'usbDevice'])->get();

        if ($cameras->isEmpty() && ! $cleanupOrphans) {
            $this->info('No cameras configured.');

            return self::SUCCESS;
        }

        if ($cameras->isEmpty()) {
            $this->info('No cameras configured in the database. Checking gateways for orphaned streams only...');
        } else {
            $this->info("Checking {$cameras->count()} camera(s)...");
        }
        $this->newLine();

        $results = [];
        $statusChanges = 0;
        $recoveries = 0;
        $pathUpdates = 0;
        $orphanCleanups = 0;

        foreach ($cameras as $camera) {
            $result = $camera->isUsbCamera()
                ? $this->checkUsbCamera($camera, (bool) $fix, (bool) $heal, $timeout)
                : $this->checkStandardCamera($camera, (bool) $fix, $timeout);

            $results[] = [
                'id' => $camera->id,
                'name' => substr($camera->name, 0, 40),
                'current' => $result['current'],
                'expected' => $result['expected'],
                'match' => $result['match'] ? '✓' : '✗',
                'action' => $result['action'],
                'stream_url' => $result['url'],
            ];

            if ($result['status_changed']) {
                $statusChanges++;
            }

            if ($result['recovered']) {
                $recoveries++;
            }

            if ($result['path_updated']) {
                $pathUpdates++;
            }
        }

        if ($heal || $cleanupOrphans) {
            $orphanCleanups = $this->cleanupOrphanStreams($cameras);
        }

        if ($results !== []) {
            $this->table(
                ['ID', 'Name', 'Current', 'Expected', 'Match', 'Action', 'Stream URL'],
                $results
            );

            $this->newLine();
        }

        $mismatches = collect($results)->filter(fn ($r) => $r['match'] === '✗')->count();

        if ($results === []) {
            $this->info('No camera rows to reconcile.');
        } elseif ($mismatches === 0) {
            $this->info('All cameras are consistent with the current gateway state.');
        } elseif ($fix || $heal) {
            $this->warn("{$mismatches} camera(s) were inconsistent before reconciliation.");
        } else {
            $this->warn("{$mismatches} camera(s) are inconsistent. Run with --fix or --heal to reconcile.");
        }

        if ($statusChanges > 0) {
            $this->info("Updated {$statusChanges} camera status(es).");
        }

        if ($recoveries > 0) {
            $this->info("Recovered {$recoveries} camera stream(s).");
        }

        if ($pathUpdates > 0) {
            $this->info("Updated {$pathUpdates} camera device path(s).");
        }

        if ($orphanCleanups > 0) {
            $this->info("Removed {$orphanCleanups} orphaned gateway stream service(s).");
        }

        return self::SUCCESS;
    }

    /**
     * Check if a non-USB stream URL is reachable by requesting the HLS playlist.
     */
    private function checkStreamReachable(string $url, int $timeout): bool
    {
        try {
            $response = Http::timeout($timeout)->get($url);

            // HLS endpoint returns 200 if stream exists, 404 if not
            return $response->successful();
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * @return array{
     *     current: string,
     *     expected: string,
     *     match: bool,
     *     action: string,
     *     url: string,
     *     status_changed: bool,
     *     recovered: bool,
     *     path_updated: bool
     * }
     */
    private function checkStandardCamera(Camera $camera, bool $fix, int $timeout): array
    {
        $gatewayIp = $camera->gatewayNode?->ip ?? config('gateway.mediamtx_url', '192.168.50.6');
        $hlsPort = config('gateway.mediamtx_hls_port', 8888);
        $hlsUrl = "http://{$gatewayIp}:{$hlsPort}/{$camera->stream_key}/index.m3u8";

        $isReachable = $this->checkStreamReachable($hlsUrl, $timeout);
        $currentStatus = $camera->status->value;
        $expectedStatus = $isReachable ? CameraStatus::ACTIVE->value : CameraStatus::INACTIVE->value;
        $statusChanged = false;

        if ($fix && $currentStatus !== $expectedStatus) {
            $camera->update([
                'status' => $isReachable ? CameraStatus::ACTIVE : CameraStatus::INACTIVE,
            ]);

            $statusChanged = true;

            Log::info('Camera status updated by health check', [
                'camera_id' => $camera->id,
                'camera_name' => $camera->name,
                'old_status' => $currentStatus,
                'new_status' => $expectedStatus,
                'stream_reachable' => $isReachable,
            ]);
        }

        return [
            'current' => $currentStatus,
            'expected' => $expectedStatus,
            'match' => $currentStatus === $expectedStatus,
            'action' => $statusChanged ? 'status-updated' : 'checked',
            'url' => $hlsUrl,
            'status_changed' => $statusChanged,
            'recovered' => false,
            'path_updated' => false,
        ];
    }

    /**
     * @return array{
     *     current: string,
     *     expected: string,
     *     match: bool,
     *     action: string,
     *     url: string,
     *     status_changed: bool,
     *     recovered: bool,
     *     path_updated: bool
     * }
     */
    private function checkUsbCamera(Camera $camera, bool $fix, bool $heal, int $timeout): array
    {
        $camera->loadMissing(['gatewayNode', 'usbDevice']);

        if (! $camera->gatewayNode) {
            return $this->checkStandardCamera($camera, $fix, $timeout);
        }

        $currentStatus = $camera->status->value;
        $gatewayIp = $camera->gatewayNode->ip;
        $hlsPort = config('gateway.mediamtx_hls_port', 8888);
        $hlsUrl = "http://{$gatewayIp}:{$hlsPort}/{$camera->stream_key}/index.m3u8";

        $streamStatus = $this->gatewayService->getCameraStreamStatus($camera->gatewayNode, $camera->stream_key);
        $running = (bool) ($streamStatus['running'] ?? false);
        $apiAvailable = (bool) ($streamStatus['gateway_api_available'] ?? false);
        $resolvedDevicePath = $camera->usbDevice
            ? $this->gatewayService->findCaptureDeviceForUsbCamera($camera->gatewayNode, $camera->usbDevice)
            : null;

        $pathUpdated = false;
        $recovered = false;
        $statusChanged = false;
        $actions = [];

        if ($resolvedDevicePath && $fix && $camera->source_url !== $resolvedDevicePath) {
            $camera->update(['source_url' => $resolvedDevicePath]);
            $pathUpdated = true;
            $actions[] = 'device-path-updated';
        }

        if ($heal && $running && $currentStatus === CameraStatus::INACTIVE->value && $apiAvailable) {
            $this->gatewayService->stopCameraStream($camera->gatewayNode, $camera->stream_key);
            $streamStatus = $this->gatewayService->getCameraStreamStatus($camera->gatewayNode, $camera->stream_key);
            $running = (bool) ($streamStatus['running'] ?? false);
            $actions[] = 'stopped-inactive-stream';
        }

        if (
            $heal
            && ! $running
            && $currentStatus === CameraStatus::ACTIVE->value
            && $apiAvailable
            && $resolvedDevicePath !== null
        ) {
            $startResult = $this->gatewayService->startCameraStream(
                $camera->gatewayNode,
                $camera->stream_key,
                $resolvedDevicePath,
                $this->buildUsbStreamOptions($camera, $resolvedDevicePath)
            );

            if (($startResult['device_path'] ?? null) && $fix && $camera->source_url !== $startResult['device_path']) {
                $camera->update(['source_url' => $startResult['device_path']]);
                $pathUpdated = true;
                $resolvedDevicePath = $startResult['device_path'];
            }

            if ($startResult['success'] ?? false) {
                usleep(500000);
                $streamStatus = $this->gatewayService->getCameraStreamStatus($camera->gatewayNode, $camera->stream_key);
                $running = (bool) ($streamStatus['running'] ?? false);
                $recovered = $running;
                $actions[] = $running ? 'stream-restarted' : 'restart-pending';
            } else {
                $actions[] = 'restart-failed';

                Log::warning('Camera recovery start failed', [
                    'camera_id' => $camera->id,
                    'camera_name' => $camera->name,
                    'gateway_node_id' => $camera->gateway_node_id,
                    'stream_key' => $camera->stream_key,
                    'device_path' => $resolvedDevicePath,
                    'error' => $startResult['error'] ?? 'Unknown camera stream start failure',
                ]);
            }
        }

        $expectedStatus = $running ? CameraStatus::ACTIVE->value : CameraStatus::INACTIVE->value;

        if ($fix && $currentStatus !== $expectedStatus) {
            $camera->update([
                'status' => $running ? CameraStatus::ACTIVE : CameraStatus::INACTIVE,
            ]);

            $statusChanged = true;

            Log::info('USB camera status updated by health check', [
                'camera_id' => $camera->id,
                'camera_name' => $camera->name,
                'old_status' => $currentStatus,
                'new_status' => $expectedStatus,
                'stream_running' => $running,
                'resolved_device_path' => $resolvedDevicePath,
            ]);
        }

        if ($resolvedDevicePath === null) {
            $actions[] = 'device-missing';
        } elseif ($apiAvailable === false) {
            $actions[] = 'gateway-api-missing';
        } elseif ($running && empty($actions)) {
            $actions[] = 'healthy';
        } elseif (! $running && empty($actions)) {
            $actions[] = 'stream-missing';
        }

        return [
            'current' => $currentStatus,
            'expected' => $expectedStatus,
            'match' => $currentStatus === $expectedStatus,
            'action' => implode(', ', array_unique($actions)),
            'url' => $hlsUrl,
            'status_changed' => $statusChanged,
            'recovered' => $recovered,
            'path_updated' => $pathUpdated,
        ];
    }

    private function cleanupOrphanStreams(Collection $cameras): int
    {
        $cleanupCount = 0;

        $knownStreamKeysByGateway = $cameras
            ->filter(fn (Camera $camera): bool => $camera->gateway_node_id !== null)
            ->groupBy('gateway_node_id')
            ->map(fn ($group) => $group->pluck('stream_key')->filter()->unique()->values()->all());

        foreach (GatewayNode::query()->get() as $node) {
            $knownStreamKeys = $knownStreamKeysByGateway->get($node->id, []);
            $gatewayStreams = $this->gatewayService->listCameraStreams($node);

            foreach ($gatewayStreams as $stream) {
                $streamKey = $stream['stream_key'] ?? null;

                if (! is_string($streamKey) || in_array($streamKey, $knownStreamKeys, true)) {
                    continue;
                }

                $stopResult = $this->gatewayService->stopCameraStream($node, $streamKey);

                if ($stopResult['success'] ?? false) {
                    $cleanupCount++;

                    Log::info('Removed orphaned gateway camera stream', [
                        'gateway_node_id' => $node->id,
                        'gateway_node_ip' => $node->ip,
                        'stream_key' => $streamKey,
                    ]);
                }
            }
        }

        return $cleanupCount;
    }

    /**
     * @return array<string, mixed>
     */
    private function buildUsbStreamOptions(Camera $camera, string $devicePath): array
    {
        $camera->loadMissing('usbDevice');

        $options = [
            'width' => $camera->stream_width ?? 640,
            'height' => $camera->stream_height ?? 480,
            'framerate' => $camera->stream_framerate ?? 15,
            'input_format' => $camera->stream_input_format ?? 'mjpeg',
            'device_path' => $devicePath,
        ];

        if ($camera->usbDevice) {
            $options['usb_busid'] = $camera->usbDevice->busid;
            $options['vendor_id'] = $camera->usbDevice->vendor_id;
            $options['product_id'] = $camera->usbDevice->product_id;
            $options['serial'] = $camera->usbDevice->serial;
        }

        return $options;
    }
}
