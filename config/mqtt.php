<?php

return [
    /*
    |--------------------------------------------------------------------------
    | MQTT Broker Connection
    |--------------------------------------------------------------------------
    |
    | Connection details for the MQTT broker (Mosquitto) used for
    | robot communication and camera PTZ control.
    |
    */
    'host' => env('MQTT_HOST', '192.168.50.6'),
    'port' => (int) env('MQTT_PORT', 1883),
    'username' => env('MQTT_USERNAME'),
    'password' => env('MQTT_PASSWORD'),
    'client_id' => env('MQTT_CLIENT_ID', 'iot-reap-laravel'),

    /*
    |--------------------------------------------------------------------------
    | TLS/SSL Settings
    |--------------------------------------------------------------------------
    */
    'tls_enabled' => (bool) env('MQTT_TLS_ENABLED', false),
    'tls_ca_file' => env('MQTT_TLS_CA_FILE'),

    /*
    |--------------------------------------------------------------------------
    | Connection Settings
    |--------------------------------------------------------------------------
    */
    'keep_alive' => (int) env('MQTT_KEEP_ALIVE', 60),
    'connect_timeout' => (int) env('MQTT_CONNECT_TIMEOUT', 5),
    'socket_timeout' => (int) env('MQTT_SOCKET_TIMEOUT', 5),

    /*
    |--------------------------------------------------------------------------
    | Topic Prefixes
    |--------------------------------------------------------------------------
    |
    | Base topic prefixes for different message types.
    |
    */
    'topics' => [
        'robot_command' => 'robot/{robot_id}/command',
        'robot_telemetry' => 'robot/{robot_id}/telemetry',
        'camera_command' => 'robot/{robot_id}/camera/command',
        'camera_ptz' => 'robot/{robot_id}/camera/ptz',
    ],

    /*
    |--------------------------------------------------------------------------
    | PTZ Control Settings
    |--------------------------------------------------------------------------
    */
    'ptz' => [
        'default_step' => 10,       // Default step size for PTZ movement
        'max_step' => 90,           // Maximum step size
        'command_timeout' => 5,     // Seconds to wait for PTZ command ack
    ],
];
