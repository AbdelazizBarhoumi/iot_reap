<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Gateway Agent Timeout
    |--------------------------------------------------------------------------
    |
    | Maximum time in seconds to wait for a response from a gateway agent.
    |
    */
    'timeout' => (int) env('GATEWAY_TIMEOUT', 5),

    /*
    |--------------------------------------------------------------------------
    | Health Check Timeout
    |--------------------------------------------------------------------------
    |
    | Shorter timeout used when probing gateway health.
    |
    */
    'health_check_timeout' => (int) env('GATEWAY_HEALTH_TIMEOUT', 3),

    /*
    |--------------------------------------------------------------------------
    | Default Gateway Port
    |--------------------------------------------------------------------------
    |
    | TCP port the gateway REST agent listens on inside each container.
    |
    */
    'default_port' => (int) env('GATEWAY_DEFAULT_PORT', 8000),

    /*
    |--------------------------------------------------------------------------
    | Container Name Pattern
    |--------------------------------------------------------------------------
    |
    | Regex pattern used by the discovery service to identify LXC containers
    | that are USB/IP gateways. Only containers whose name matches this
    | pattern will be auto-registered as gateway nodes.
    |
    */
    'discovery_name_pattern' => env('GATEWAY_NAME_PATTERN', '/gateway/i'),

    /*
    |--------------------------------------------------------------------------
    | Device Polling Interval (seconds)
    |--------------------------------------------------------------------------
    |
    | How often the scheduler should poll gateway agents to refresh the
    | device list. Used by the scheduled command.
    |
    */
    'poll_interval' => (int) env('GATEWAY_POLL_INTERVAL', 30),

];
