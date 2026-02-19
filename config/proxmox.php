<?php

return [
    // Proxmox cluster connection settings
    'host' => env('PROXMOX_HOST', '192.168.1.100'),
    'port' => env('PROXMOX_PORT', 8006),
    'realm' => env('PROXMOX_REALM', 'pam'),

    // API authentication - use token-based auth only
    'token_id' => env('PROXMOX_TOKEN_ID'),
    'token_secret' => env('PROXMOX_TOKEN_SECRET'),

    // SSL verification
    'verify_ssl' => env('PROXMOX_VERIFY_SSL', true),

    // Multi-server support: default server ID for single-cluster mode
    // If null, uses first active server. Set to server ID for explicit default.
    'default_server_id' => env('PROXMOX_DEFAULT_SERVER_ID', null),

    // Request timeout in seconds
    'timeout' => env('PROXMOX_TIMEOUT', 30),

    // VMID ranges for different purposes
    'template_vmid_range' => [100, 199],
    'session_vmid_range' => [200, 999],

    // Load balancing thresholds
    'node_load_threshold' => env('PROXMOX_NODE_LOAD_THRESHOLD', 0.85),

    // Retry configuration
    'retry_attempts' => env('PROXMOX_RETRY_ATTEMPTS', 3),
    'retry_delay_initial' => env('PROXMOX_RETRY_DELAY_INITIAL', 10), // seconds
    'retry_delay_multiplier' => env('PROXMOX_RETRY_DELAY_MULTIPLIER', 3),

    // Poll timeouts for async operations
    'clone_timeout' => env('PROXMOX_CLONE_TIMEOUT', 120), // seconds
    'clone_poll_interval' => env('PROXMOX_CLONE_POLL_INTERVAL', 5), // seconds

    // Node score calculation weights (must sum to 1.0)
    'node_score_weights' => [
        'ram' => 0.7,
        'cpu' => 0.3,
    ],

    // Cache configuration
    'cache_ttl' => env('PROXMOX_CACHE_TTL', 30), // seconds
];
