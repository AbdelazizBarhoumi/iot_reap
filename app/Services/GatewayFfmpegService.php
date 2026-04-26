<?php

namespace App\Services;

use App\Models\GatewayNode;
use App\Repositories\GatewayNodeRepository;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Str;
use phpseclib3\Net\SFTP;
use phpseclib3\Net\SSH2;

/**
 * Runs FFmpeg/FFprobe either locally or on a DB-selected gateway container.
 */
class GatewayFfmpegService
{
    public function __construct(
        private readonly GatewayNodeRepository $gatewayNodeRepository,
    ) {}

    public function selectGatewayForProcessing(): ?GatewayNode
    {
        if (! $this->shouldUseGateway()) {
            return null;
        }

        return $this->gatewayNodeRepository->findPreferredForVideoProcessing();
    }

    /**
     * Get video duration in seconds.
     */
    public function probeDuration(string $sourcePath, ?GatewayNode $gatewayNode = null): int
    {
        if (! $this->shouldUseGateway()) {
            return $this->probeDurationLocallyForced($sourcePath);
        }

        return $this->runOnGatewayWithSource(
            sourcePath: $sourcePath,
            operation: function (SSH2 $ssh, SFTP $sftp, GatewayNode $node, string $remoteSource, string $remoteDir, string $hostTempDir): int {
                $ffprobe = (string) config('video.gateway.ffprobe_path', 'ffprobe');
                $command = sprintf(
                    '%s -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 %s 2>&1',
                    escapeshellcmd($ffprobe),
                    $this->quoteForRemoteShell($remoteSource)
                );

                [$ok, $output] = $this->execInGatewayContainer($ssh, $node, $command, 120);

                if (! $ok) {
                    Log::warning('Gateway FFprobe duration failed', ['output' => $output]);

                    return 0;
                }

                return (int) floor((float) trim($output));
            },
            fallback: fn () => $this->probeDurationLocallyForced($sourcePath),
            gatewayNode: $gatewayNode,
        );
    }

    /**
     * Get video resolution.
     *
     * @return array{width: int, height: int}
     */
    public function probeResolution(string $sourcePath, ?GatewayNode $gatewayNode = null): array
    {
        if (! $this->shouldUseGateway()) {
            return $this->probeResolutionLocallyForced($sourcePath);
        }

        return $this->runOnGatewayWithSource(
            sourcePath: $sourcePath,
            operation: function (SSH2 $ssh, SFTP $sftp, GatewayNode $node, string $remoteSource, string $remoteDir, string $hostTempDir): array {
                $ffprobe = (string) config('video.gateway.ffprobe_path', 'ffprobe');
                $command = sprintf(
                    '%s -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 %s 2>&1',
                    escapeshellcmd($ffprobe),
                    $this->quoteForRemoteShell($remoteSource)
                );

                [$ok, $output] = $this->execInGatewayContainer($ssh, $node, $command, 120);

                if (! $ok) {
                    Log::warning('Gateway FFprobe resolution failed', ['output' => $output]);

                    return ['width' => 1920, 'height' => 1080];
                }

                $parts = explode('x', trim($output));

                return [
                    'width' => (int) ($parts[0] ?? 1920),
                    'height' => (int) ($parts[1] ?? 1080),
                ];
            },
            fallback: fn () => $this->probeResolutionLocallyForced($sourcePath),
            gatewayNode: $gatewayNode,
        );
    }

    /**
     * Transcode a single HLS quality variant.
     *
     * @param  array{resolution: string, bitrate: string, maxrate: string, bufsize: string}  $preset
     */
    public function transcodeQuality(
        string $sourcePath,
        string $outputPath,
        string $quality,
        array $preset,
        int $timeout,
        ?GatewayNode $gatewayNode = null,
    ): void {
        if (! $this->shouldUseGateway()) {
            $this->transcodeQualityLocallyForced($sourcePath, $outputPath, $quality, $preset, $timeout);

            return;
        }

        $this->runOnGatewayWithSource(
            sourcePath: $sourcePath,
            operation: function (SSH2 $ssh, SFTP $sftp, GatewayNode $node, string $remoteSource, string $remoteDir, string $hostTempDir) use ($outputPath, $quality, $preset, $timeout): void {
                [$width, $height] = explode('x', $preset['resolution']);
                $vf = "scale={$width}:{$height}:force_original_aspect_ratio=decrease,pad={$width}:{$height}:(ow-iw)/2:(oh-ih)/2";

                $remoteQualityDir = "{$remoteDir}/{$quality}";
                [$created, $mkdirOutput] = $this->execInGatewayContainer(
                    $ssh,
                    $node,
                    'mkdir -p '.$this->quoteForRemoteShell($remoteQualityDir),
                    60,
                );
                if (! $created) {
                    throw new \RuntimeException("Failed to create remote {$quality} output directory on gateway: {$mkdirOutput}");
                }

                $remotePlaylist = "{$remoteQualityDir}/stream.m3u8";
                $remoteSegments = "{$remoteQualityDir}/stream_%03d.ts";
                $ffmpeg = (string) config('video.gateway.ffmpeg_path', 'ffmpeg');

                $command = sprintf(
                    '%s -i %s -vf %s -c:v libx264 -preset medium -b:v %s -maxrate %s -bufsize %s -c:a aac -b:a 128k -ar 44100 -hls_time 10 -hls_playlist_type vod -hls_segment_filename %s -y %s 2>&1',
                    escapeshellcmd($ffmpeg),
                    $this->quoteForRemoteShell($remoteSource),
                    $this->quoteForRemoteShell($vf),
                    $this->quoteForRemoteShell($preset['bitrate']),
                    $this->quoteForRemoteShell($preset['maxrate']),
                    $this->quoteForRemoteShell($preset['bufsize']),
                    $this->quoteForRemoteShell($remoteSegments),
                    $this->quoteForRemoteShell($remotePlaylist),
                );

                [$ok, $remoteOutput] = $this->execInGatewayContainer($ssh, $node, $command, $timeout);

                if (! $ok) {
                    throw new \RuntimeException("Gateway FFmpeg transcoding failed for {$quality}: {$remoteOutput}");
                }

                $this->downloadRemoteQualityOutputs(
                    $ssh,
                    $sftp,
                    $node,
                    $hostTempDir,
                    $remoteDir,
                    $quality,
                    $outputPath,
                );
            },
            fallback: function () use ($sourcePath, $outputPath, $quality, $preset, $timeout): void {
                $this->transcodeQualityLocallyForced($sourcePath, $outputPath, $quality, $preset, $timeout);
            },
            gatewayNode: $gatewayNode,
        );
    }

    /**
     * Generate a thumbnail image.
     */
    public function generateThumbnail(
        string $sourcePath,
        string $outputPath,
        float $timestamp,
        int $timeout,
        ?GatewayNode $gatewayNode = null,
    ): void {
        if (! $this->shouldUseGateway()) {
            $this->generateThumbnailLocallyForced($sourcePath, $outputPath, $timestamp, $timeout);

            return;
        }

        $this->runOnGatewayWithSource(
            sourcePath: $sourcePath,
            operation: function (SSH2 $ssh, SFTP $sftp, GatewayNode $node, string $remoteSource, string $remoteDir, string $hostTempDir) use ($outputPath, $timestamp, $timeout): void {
                $remoteThumb = "{$remoteDir}/thumbnail.jpg";
                $ffmpeg = (string) config('video.gateway.ffmpeg_path', 'ffmpeg');

                $command = sprintf(
                    '%s -ss %s -i %s -vframes 1 -vf %s -q:v 2 -y %s 2>&1',
                    escapeshellcmd($ffmpeg),
                    $this->quoteForRemoteShell((string) $timestamp),
                    $this->quoteForRemoteShell($remoteSource),
                    $this->quoteForRemoteShell('scale=640:-1'),
                    $this->quoteForRemoteShell($remoteThumb),
                );

                [$ok, $remoteOutput] = $this->execInGatewayContainer($ssh, $node, $command, $timeout);

                if (! $ok) {
                    throw new \RuntimeException("Gateway FFmpeg thumbnail generation failed: {$remoteOutput}");
                }

                $this->pullFileFromGatewayContainer($ssh, $sftp, $node, $remoteThumb, $outputPath, $hostTempDir);
            },
            fallback: function () use ($sourcePath, $outputPath, $timestamp, $timeout): void {
                $this->generateThumbnailLocallyForced($sourcePath, $outputPath, $timestamp, $timeout);
            },
            gatewayNode: $gatewayNode,
        );
    }

    private function shouldUseGateway(): bool
    {
        $mode = (string) config('video.ffmpeg_execution.mode', 'auto');

        if ($mode === 'local') {
            return false;
        }

        if ($mode === 'gateway') {
            return true;
        }

        if (! $this->hasGatewayCredentialsConfigured()) {
            return false;
        }

        return $this->gatewayNodeRepository->hasGatewayForVideoProcessing();
    }

    private function hasGatewayCredentialsConfigured(): bool
    {
        return (string) config('video.ffmpeg_execution.gateway_ssh.username', '') !== ''
            && (string) config('video.ffmpeg_execution.gateway_ssh.password', '') !== '';
    }

    /**
     * @template T
     *
     * @param  callable(SSH2, SFTP, GatewayNode, string, string, string): T  $operation
     * @param  callable(): T  $fallback
     * @return T
     */
    private function runOnGatewayWithSource(
        string $sourcePath,
        callable $operation,
        callable $fallback,
        ?GatewayNode $gatewayNode = null,
    ): mixed {
        if (! file_exists($sourcePath)) {
            throw new \RuntimeException("Source file not found: {$sourcePath}");
        }

        try {
            $node = $this->resolveGatewayNodeOrFail($gatewayNode);
            [$ssh, $sftp] = $this->connectGatewayOrFail($node);

            $hostTempDir = '/tmp/iot-reap-video-'.Str::uuid();
            [$hostDirCreated, $hostDirOutput] = $this->execOnGatewayHost(
                $ssh,
                'mkdir -p '.$this->quoteForRemoteShell($hostTempDir),
                60,
            );
            if (! $hostDirCreated) {
                throw new \RuntimeException("Failed to create gateway host working directory: {$hostDirOutput}");
            }

            $remoteDir = $hostTempDir;
            [$containerDirCreated, $containerDirOutput] = $this->execInGatewayContainer(
                $ssh,
                $node,
                'mkdir -p '.$this->quoteForRemoteShell($remoteDir),
                60,
            );
            if (! $containerDirCreated) {
                throw new \RuntimeException("Failed to create gateway container working directory: {$containerDirOutput}");
            }

            $remoteSource = $remoteDir.'/source'.'.'.pathinfo($sourcePath, PATHINFO_EXTENSION);
            $this->pushFileToGatewayContainer($ssh, $sftp, $node, $sourcePath, $remoteSource, $hostTempDir);

            Log::info('Using DB-selected gateway for FFmpeg work', [
                'gateway_id' => $node->id,
                'gateway_name' => $node->name,
                'gateway_ip' => $node->ip,
                'proxmox_host' => $node->proxmox_host,
                'proxmox_node' => $node->proxmox_node,
                'proxmox_vmid' => $node->proxmox_vmid,
            ]);

            try {
                return $operation($ssh, $sftp, $node, $remoteSource, $remoteDir, $hostTempDir);
            } finally {
                $this->cleanupRemoteDir($ssh, $node, $hostTempDir, $remoteDir);
            }
        } catch (\Throwable $e) {
            if ((bool) config('video.ffmpeg_execution.gateway_fallback_local', true)) {
                Log::warning('Gateway FFmpeg execution failed; falling back to local binaries', [
                    'error' => $e->getMessage(),
                ]);

                return $fallback();
            }

            throw $e;
        }
    }

    private function resolveGatewayNodeOrFail(?GatewayNode $gatewayNode = null): GatewayNode
    {
        $node = $gatewayNode ?? $this->gatewayNodeRepository->findPreferredForVideoProcessing();

        if (! $node) {
            throw new \RuntimeException('No active gateway node found in database for FFmpeg execution.');
        }

        if (! $node->proxmox_host || ! $node->proxmox_node || ! $node->proxmox_vmid) {
            throw new \RuntimeException("Gateway {$node->name} is missing proxmox_host, proxmox_node, or proxmox_vmid in database.");
        }

        return $node;
    }

    /**
     * @return array{SSH2, SFTP}
     */
    private function connectGatewayOrFail(GatewayNode $node): array
    {
        $port = (int) config('video.ffmpeg_execution.gateway_ssh.port', 22);
        $timeout = (int) config('video.ffmpeg_execution.gateway_ssh.timeout_seconds', 30);
        $username = (string) config('video.ffmpeg_execution.gateway_ssh.username');
        $password = (string) config('video.ffmpeg_execution.gateway_ssh.password');
        $host = (string) $node->proxmox_host;

        $ssh = new SSH2($host, $port, $timeout);
        if (! $ssh->login($username, $password)) {
            throw new \RuntimeException("SSH login failed for Proxmox host {$host}:{$port} while targeting gateway {$node->name}.");
        }

        $ssh->setTimeout($timeout);

        $sftp = new SFTP($host, $port, $timeout);
        if (! $sftp->login($username, $password)) {
            throw new \RuntimeException("SFTP login failed for Proxmox host {$host}:{$port} while targeting gateway {$node->name}.");
        }

        return [$ssh, $sftp];
    }

    /**
     * @return array{bool, string}
     */
    private function execOnGatewayHost(SSH2 $ssh, string $command, int $timeout): array
    {
        $ssh->setTimeout($timeout);
        $output = (string) $ssh->exec('bash -lc '.$this->quoteForRemoteShell($command));
        $exit = $ssh->getExitStatus();

        return [($exit === 0 || $exit === null), trim($output)];
    }

    /**
     * @return array{bool, string}
     */
    private function execInGatewayContainer(SSH2 $ssh, GatewayNode $node, string $command, int $timeout): array
    {
        $wrapped = sprintf(
            'pct exec %s -- bash -lc %s',
            (string) $node->proxmox_vmid,
            $this->quoteForRemoteShell($command),
        );

        return $this->execOnGatewayHost($ssh, $wrapped, $timeout);
    }

    private function cleanupRemoteDir(SSH2 $ssh, GatewayNode $node, string $hostTempDir, string $remoteDir): void
    {
        try {
            $this->execInGatewayContainer($ssh, $node, 'rm -rf '.$this->quoteForRemoteShell($remoteDir), 30);
            $this->execOnGatewayHost($ssh, 'rm -rf '.$this->quoteForRemoteShell($hostTempDir), 30);
        } catch (\Throwable $e) {
            Log::debug('Failed to cleanup gateway temp directory', [
                'remote_dir' => $remoteDir,
                'host_temp_dir' => $hostTempDir,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function pushFileToGatewayContainer(
        SSH2 $ssh,
        SFTP $sftp,
        GatewayNode $node,
        string $localSourcePath,
        string $remoteContainerPath,
        string $hostTempDir,
    ): void {
        $hostSourcePath = "{$hostTempDir}/".basename($remoteContainerPath);

        if (! $sftp->put($hostSourcePath, $localSourcePath, SFTP::SOURCE_LOCAL_FILE)) {
            throw new \RuntimeException('Failed to upload source video to Proxmox host.');
        }

        [$ok, $output] = $this->execOnGatewayHost(
            $ssh,
            sprintf(
                'pct push %s %s %s',
                (string) $node->proxmox_vmid,
                $this->quoteForRemoteShell($hostSourcePath),
                $this->quoteForRemoteShell($remoteContainerPath),
            ),
            120,
        );

        if (! $ok) {
            throw new \RuntimeException("Failed to push source video into gateway container: {$output}");
        }
    }

    private function pullFileFromGatewayContainer(
        SSH2 $ssh,
        SFTP $sftp,
        GatewayNode $node,
        string $remoteContainerPath,
        string $localDestinationPath,
        string $hostTempDir,
    ): void {
        $hostPulledPath = "{$hostTempDir}/pull-".Str::uuid().'-'.basename($remoteContainerPath);

        [$ok, $output] = $this->execOnGatewayHost(
            $ssh,
            sprintf(
                'pct pull %s %s %s',
                (string) $node->proxmox_vmid,
                $this->quoteForRemoteShell($remoteContainerPath),
                $this->quoteForRemoteShell($hostPulledPath),
            ),
            120,
        );

        if (! $ok) {
            throw new \RuntimeException("Failed to pull file from gateway container: {$output}");
        }

        $localDirectory = dirname($localDestinationPath);
        if (! is_dir($localDirectory)) {
            mkdir($localDirectory, 0755, true);
        }

        if (! $sftp->get($hostPulledPath, $localDestinationPath)) {
            throw new \RuntimeException("Failed to download {$remoteContainerPath} from Proxmox host.");
        }

        $this->execOnGatewayHost($ssh, 'rm -f '.$this->quoteForRemoteShell($hostPulledPath), 30);
    }

    private function downloadRemoteQualityOutputs(
        SSH2 $ssh,
        SFTP $sftp,
        GatewayNode $node,
        string $hostTempDir,
        string $remoteDir,
        string $quality,
        string $localOutputPath,
    ): void {
        $localQualityPath = "{$localOutputPath}/{$quality}";
        if (! is_dir($localQualityPath)) {
            mkdir($localQualityPath, 0755, true);
        }

        $playlistRemote = "{$remoteDir}/{$quality}/stream.m3u8";
        $playlistLocal = "{$localQualityPath}/stream.m3u8";

        $this->pullFileFromGatewayContainer($ssh, $sftp, $node, $playlistRemote, $playlistLocal, $hostTempDir);

        [$ok, $entriesOutput] = $this->execInGatewayContainer(
            $ssh,
            $node,
            sprintf(
                "find %s -maxdepth 1 -type f -name 'stream_*.ts' -printf '%%f\n' | sort",
                $this->quoteForRemoteShell("{$remoteDir}/{$quality}")
            ),
            120,
        );
        if (! $ok) {
            throw new \RuntimeException("Failed listing remote {$quality} HLS output directory: {$entriesOutput}");
        }

        $entries = array_filter(
            array_map('trim', preg_split('/\r?\n/', $entriesOutput) ?: []),
            static fn (string $entry): bool => $entry !== '',
        );

        foreach ($entries as $entry) {
            $remoteFile = "{$remoteDir}/{$quality}/{$entry}";
            $localFile = "{$localQualityPath}/{$entry}";
            $this->pullFileFromGatewayContainer($ssh, $sftp, $node, $remoteFile, $localFile, $hostTempDir);
        }
    }

    private function quoteForRemoteShell(string $value): string
    {
        return "'".str_replace("'", "'\"'\"'", $value)."'";
    }

    private function probeDurationLocallyForced(string $sourcePath): int
    {
        $result = Process::run([
            (string) config('video.ffprobe_path', 'ffprobe'),
            '-v', 'error',
            '-show_entries', 'format=duration',
            '-of', 'default=noprint_wrappers=1:nokey=1',
            $sourcePath,
        ]);

        if ($result->failed()) {
            Log::warning('Local FFprobe duration failed', ['error' => $result->errorOutput()]);

            return 0;
        }

        return (int) floor((float) trim($result->output()));
    }

    /**
     * @return array{width: int, height: int}
     */
    private function probeResolutionLocallyForced(string $sourcePath): array
    {
        $result = Process::run([
            (string) config('video.ffprobe_path', 'ffprobe'),
            '-v', 'error',
            '-select_streams', 'v:0',
            '-show_entries', 'stream=width,height',
            '-of', 'csv=s=x:p=0',
            $sourcePath,
        ]);

        if ($result->failed()) {
            Log::warning('Local FFprobe resolution failed', ['error' => $result->errorOutput()]);

            return ['width' => 1920, 'height' => 1080];
        }

        $parts = explode('x', trim($result->output()));

        return [
            'width' => (int) ($parts[0] ?? 1920),
            'height' => (int) ($parts[1] ?? 1080),
        ];
    }

    /**
     * @param  array{resolution: string, bitrate: string, maxrate: string, bufsize: string}  $preset
     */
    private function transcodeQualityLocallyForced(string $sourcePath, string $outputPath, string $quality, array $preset, int $timeout): void
    {
        [$width, $height] = explode('x', $preset['resolution']);
        $vf = "scale={$width}:{$height}:force_original_aspect_ratio=decrease,pad={$width}:{$height}:(ow-iw)/2:(oh-ih)/2";

        $qualityOutputPath = "{$outputPath}/{$quality}";
        if (! is_dir($qualityOutputPath)) {
            mkdir($qualityOutputPath, 0755, true);
        }

        $playlistPath = "{$qualityOutputPath}/stream.m3u8";
        $segmentPath = "{$qualityOutputPath}/stream_%03d.ts";

        $result = Process::timeout($timeout)->run([
            (string) config('video.ffmpeg_path', 'ffmpeg'),
            '-i', $sourcePath,
            '-vf', $vf,
            '-c:v', 'libx264',
            '-preset', 'medium',
            '-b:v', $preset['bitrate'],
            '-maxrate', $preset['maxrate'],
            '-bufsize', $preset['bufsize'],
            '-c:a', 'aac',
            '-b:a', '128k',
            '-ar', '44100',
            '-hls_time', '10',
            '-hls_playlist_type', 'vod',
            '-hls_segment_filename', $segmentPath,
            '-y',
            $playlistPath,
        ]);

        if ($result->failed()) {
            throw new \RuntimeException("FFmpeg transcoding failed for {$quality}: ".$result->errorOutput());
        }
    }

    private function generateThumbnailLocallyForced(string $sourcePath, string $outputPath, float $timestamp, int $timeout): void
    {
        $result = Process::timeout($timeout)->run([
            (string) config('video.ffmpeg_path', 'ffmpeg'),
            '-ss', (string) $timestamp,
            '-i', $sourcePath,
            '-vframes', '1',
            '-vf', 'scale=640:-1',
            '-q:v', '2',
            '-y',
            $outputPath,
        ]);

        if ($result->failed()) {
            throw new \RuntimeException('FFmpeg thumbnail generation failed: '.$result->errorOutput());
        }
    }
}
