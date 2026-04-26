<?php

namespace App\Jobs;

use App\Events\VideoTranscodingCompleted;
use App\Events\VideoTranscodingFailed;
use App\Models\Video;
use App\Services\GatewayFfmpegService;
use App\Services\TrainingPathCacheService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

/**
 * Queue job for transcoding video to HLS format.
 * Uses FFmpeg to generate multiple quality levels (360p, 720p, 1080p).
 */
class TranscodeVideoJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     *
     * @var array<int, int>
     */
    public array $backoff = [30, 120, 300];

    /**
     * The maximum time the job can run (30 minutes).
     */
    public int $timeout = 1800;

    /**
     * Quality presets for transcoding.
     */
    private const QUALITY_PRESETS = [
        '360p' => [
            'resolution' => '640x360',
            'bitrate' => '800k',
            'maxrate' => '856k',
            'bufsize' => '1200k',
        ],
        '720p' => [
            'resolution' => '1280x720',
            'bitrate' => '2800k',
            'maxrate' => '2996k',
            'bufsize' => '4200k',
        ],
        '1080p' => [
            'resolution' => '1920x1080',
            'bitrate' => '5000k',
            'maxrate' => '5350k',
            'bufsize' => '7500k',
        ],
    ];

    /**
     * Create a new job instance.
     */
    public function __construct(
        private readonly Video $video,
    ) {}

    /**
     * Get the middleware the job should pass through.
     *
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [new WithoutOverlapping("transcode-video-{$this->video->id}")];
    }

    /**
     * Execute the job.
     */
    public function handle(
        GatewayFfmpegService $gatewayFfmpegService,
        TrainingPathCacheService $trainingPathCacheService,
    ): void {
        Log::info('Starting TranscodeVideoJob', [
            'video_id' => $this->video->id,
            'attempt' => $this->attempts(),
        ]);

        $video = $this->video->fresh();

        // Mark as processing
        $video->markAsProcessing();

        try {
            // Get source file path
            $disk = $video->storage_disk;
            $sourcePath = Storage::disk($disk)->path($video->storage_path);
            $gatewayNode = $gatewayFfmpegService->selectGatewayForProcessing();

            if (! file_exists($sourcePath)) {
                throw new \RuntimeException("Source video file not found: {$sourcePath}");
            }

            // Get video duration
            $duration = $gatewayFfmpegService->probeDuration($sourcePath, $gatewayNode);

            // Create output directory
            $outputDir = "videos/hls/{$video->id}";
            Storage::disk($disk)->makeDirectory($outputDir);
            $outputPath = Storage::disk($disk)->path($outputDir);

            // Determine available qualities based on source resolution
            $sourceResolution = $gatewayFfmpegService->probeResolution($sourcePath, $gatewayNode);
            $availableQualities = $this->determineAvailableQualities($sourceResolution);
            $video->update([
                'resolution_width' => $sourceResolution['width'] ?? null,
                'resolution_height' => $sourceResolution['height'] ?? null,
            ]);

            // Transcode each quality
            foreach ($availableQualities as $quality => $preset) {
                Log::info("Transcoding to {$quality}", ['video_id' => $this->video->id]);
                $gatewayFfmpegService->transcodeQuality($sourcePath, $outputPath, $quality, $preset, $this->timeout, $gatewayNode);
            }

            // Generate master playlist
            $this->generateMasterPlaylist($outputPath, array_keys($availableQualities));

            // Mark video as ready
            $video->markAsReady(
                hlsPath: "{$outputDir}/master.m3u8",
                qualities: array_keys($availableQualities),
                durationSeconds: $duration
            );

            // Execute thumbnail generation synchronously
            GenerateThumbnailJob::dispatchSync($video->fresh());

            // Fire event
            event(new VideoTranscodingCompleted($video->fresh()));

            $video->loadMissing('trainingUnit.module.trainingPath');
            $trainingPathCacheService->invalidateTrainingPath($video->trainingUnit->module->trainingPath);

            Log::info('Video transcoding completed', [
                'video_id' => $video->id,
                'qualities' => array_keys($availableQualities),
                'duration' => $duration,
            ]);
        } catch (Throwable $e) {
            Log::error('Video transcoding failed', [
                'video_id' => $video->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Determine available quality presets based on source resolution.
     *
     * @return array<string, array>
     */
    private function determineAvailableQualities(array $sourceResolution): array
    {
        $sourceHeight = $sourceResolution['height'];
        $available = [];

        // Always include 360p for mobile
        $available['360p'] = self::QUALITY_PRESETS['360p'];

        // Include 720p if source is at least 720p
        if ($sourceHeight >= 720) {
            $available['720p'] = self::QUALITY_PRESETS['720p'];
        }

        // Include 1080p if source is at least 1080p
        if ($sourceHeight >= 1080) {
            $available['1080p'] = self::QUALITY_PRESETS['1080p'];
        }

        return $available;
    }

    /**
     * Generate master HLS playlist.
     */
    private function generateMasterPlaylist(string $outputPath, array $qualities): void
    {
        $content = "#EXTM3U\n#EXT-X-VERSION:3\n\n";

        $bandwidths = [
            '360p' => 800000,
            '720p' => 2800000,
            '1080p' => 5000000,
        ];

        $resolutions = [
            '360p' => '640x360',
            '720p' => '1280x720',
            '1080p' => '1920x1080',
        ];

        foreach ($qualities as $quality) {
            $bandwidth = $bandwidths[$quality] ?? 1000000;
            $resolution = $resolutions[$quality] ?? '640x360';

            $content .= "#EXT-X-STREAM-INF:BANDWIDTH={$bandwidth},RESOLUTION={$resolution},NAME=\"{$quality}\"\n";
            $content .= "stream/{$quality}/stream.m3u8\n\n";
        }

        file_put_contents("{$outputPath}/master.m3u8", $content);
    }

    /**
     * Handle a job failure.
     */
    public function failed(Throwable $e): void
    {
        Log::error('TranscodeVideoJob failed after all retries', [
            'video_id' => $this->video->id,
            'error' => $e->getMessage(),
        ]);

        $video = $this->video->fresh();
        $video->markAsFailed($e->getMessage());

        event(new VideoTranscodingFailed($video, $e->getMessage()));
    }
}
