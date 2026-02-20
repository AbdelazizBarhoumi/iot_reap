<?php

/**
 * Guacamole configuration for remote desktop access.
 * Guacamole is the clientless remote desktop gateway that provides RDP/VNC/SSH access.
 */

return [
    /*
    |--------------------------------------------------------------------------
    | Guacamole Server URL
    |--------------------------------------------------------------------------
    | Public URL where Guacamole is accessible. Used to construct viewer URLs.
    | E.g., 'https://guacamole.example.com' or 'https://app.example.com/guacamole'
    */
    'url' => env('GUACAMOLE_URL', 'http://192.168.1.161:8080/guacamole'),

    /*
    |--------------------------------------------------------------------------
    | Guacamole API Authentication
    |--------------------------------------------------------------------------
    | Username and password for Guacamole REST API authentication.
    | These credentials give the backend admin access to manage connections.
    */
    'username' => env('GUACAMOLE_USERNAME'),
    'password' => env('GUACAMOLE_PASSWORD'),

    /*
    |--------------------------------------------------------------------------
    | Guacamole Data Source
    |--------------------------------------------------------------------------
    | Database backend used by Guacamole. Common options: 'MySQL', 'PostgreSQL'
    */
    'data_source' => env('GUACAMOLE_DATA_SOURCE', 'MySQL'),

    /*
    |--------------------------------------------------------------------------
    | Connection Parameters
    |--------------------------------------------------------------------------
    | Default settings for Guacamole connections.
    */
    'connection' => [
        // Timeout in minutes after which idle connections are suspended
        'idle_timeout' => env('GUACAMOLE_IDLE_TIMEOUT', 30),
        
        // Token expiration time in seconds (5 minutes)
        'token_expiration_seconds' => env('GUACAMOLE_TOKEN_EXPIRATION', 300),
    ],

    /*
    |--------------------------------------------------------------------------
    | Protocol Defaults
    |--------------------------------------------------------------------------
    | Protocol-specific default settings for RDP, VNC, SSH connections.
    */
    'protocols' => [
        'rdp' => [
            'port'          => 3389,
            // 'any' allows NLA, TLS, and classic RDP — works with any Windows/Debian VM
            // without requiring specific NLA configuration on the guest.
            'security'      => 'any',
            'ignore_cert'   => true,
            'resize_method' => 'display-update',
        ],
        'vnc' => [
            'port' => 5900,
            'read_only' => false,
        ],
        'ssh' => [
            'port' => 22,
            'read_only' => false,
        ],
    ],
];
