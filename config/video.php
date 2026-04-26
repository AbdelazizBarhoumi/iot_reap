<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Video Upload Settings
    |--------------------------------------------------------------------------
    |
    | Configuration for video file uploads.
    |
    */

    'max_upload_size_mb' => env('VIDEO_MAX_UPLOAD_SIZE_MB', 500),

    /*
    |--------------------------------------------------------------------------
    | FFmpeg Settings
    |--------------------------------------------------------------------------
    |
    | Path to FFmpeg and FFprobe binaries. If not set, assumes they are
    | available in the system PATH.
    |
    */

    'ffmpeg_path' => env('FFMPEG_PATH', 'ffmpeg'),
    'ffprobe_path' => env('FFPROBE_PATH', 'ffprobe'),
    'gateway' => [
        'ffmpeg_path' => env('GATEWAY_FFMPEG_PATH', 'ffmpeg'),
        'ffprobe_path' => env('GATEWAY_FFPROBE_PATH', 'ffprobe'),
    ],

    'ffmpeg_execution' => [
        // auto: use gateway when available, local otherwise
        // gateway: force gateway execution
        // local: force local execution
        'mode' => env('VIDEO_FFMPEG_EXECUTION_MODE', 'auto'),

        // If gateway execution fails, fallback to local ffmpeg/ffprobe.
        'gateway_fallback_local' => (bool) env('VIDEO_GATEWAY_FALLBACK_LOCAL', true),

        'gateway_ssh' => [
            'username' => env('VIDEO_GATEWAY_SSH_USERNAME', ''),
            'password' => env('VIDEO_GATEWAY_SSH_PASSWORD', ''),
            'port' => (int) env('VIDEO_GATEWAY_SSH_PORT', 22),
            'timeout_seconds' => (int) env('VIDEO_GATEWAY_SSH_TIMEOUT', 30),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Transcoding Settings
    |--------------------------------------------------------------------------
    |
    | HLS transcoding quality presets and settings.
    |
    */

    'qualities' => [
        '360p' => [
            'height' => 360,
            'video_bitrate' => '800k',
            'audio_bitrate' => '96k',
        ],
        '720p' => [
            'height' => 720,
            'video_bitrate' => '2500k',
            'audio_bitrate' => '128k',
        ],
        '1080p' => [
            'height' => 1080,
            'video_bitrate' => '5000k',
            'audio_bitrate' => '192k',
        ],
    ],

    'hls_segment_duration' => env('HLS_SEGMENT_DURATION', 10),

    /*
    |--------------------------------------------------------------------------
    | Thumbnail Settings
    |--------------------------------------------------------------------------
    |
    | Settings for video thumbnail generation.
    |
    */

    'thumbnail' => [
        'width' => 640,
        'height' => 360,
        'timestamp' => 5, // Seconds into video to capture
    ],

    /*
    |--------------------------------------------------------------------------
    | Storage Settings
    |--------------------------------------------------------------------------
    |
    | Disk configuration for video storage.
    |
    */

    'storage_disk' => env('VIDEO_STORAGE_DISK', 'local'),
];
