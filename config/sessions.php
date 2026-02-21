<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Session Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for VM session lifecycle including default durations,
    | extension limits, and quota settings.
    |
    */

    'default_duration_minutes' => env('SESSION_DEFAULT_DURATION_MINUTES', 120),
    'max_duration_minutes' => env('SESSION_MAX_DURATION_MINUTES', 480),
    'min_duration_minutes' => env('SESSION_MIN_DURATION_MINUTES', 30),

    'extension_increment_minutes' => env('SESSION_EXTENSION_INCREMENT_MINUTES', 30),
    'max_extensions_per_session' => env('SESSION_MAX_EXTENSIONS_PER_SESSION', 10),

    /*
    |--------------------------------------------------------------------------
    | Quota Settings
    |--------------------------------------------------------------------------
    |
    | Per-user concurrent session quota and time quota limits.
    |
    */

    'max_concurrent_sessions' => env('SESSION_MAX_CONCURRENT_SESSIONS', 2),
    'max_concurrent_minutes' => env('SESSION_MAX_CONCURRENT_MINUTES', 240),

];
