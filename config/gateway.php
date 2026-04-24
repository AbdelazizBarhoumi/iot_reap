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

    /*
    |--------------------------------------------------------------------------
    | Infrastructure Container IP
    |--------------------------------------------------------------------------
    |
    | Static IP of the LXC container (CT 200) that hosts all infrastructure
    | services: MediaMTX, Frigate, CUPS, ser2net, avahi-daemon, Docker.
    |
    */
    'infrastructure_ip' => env('GATEWAY_INFRASTRUCTURE_IP', '192.168.50.6'),

    /*
    |--------------------------------------------------------------------------
    | MediaMTX Streaming Server
    |--------------------------------------------------------------------------
    |
    | Connection details for the MediaMTX RTSP/HLS/WebRTC streaming server
    | running on the gateway. Cameras proxy their streams through MediaMTX.
    |
    */
    'mediamtx_url' => env('MEDIAMTX_URL', '192.168.50.6'),
    'mediamtx_rtsp_port' => (int) env('MEDIAMTX_RTSP_PORT', 8554),
    'mediamtx_hls_port' => (int) env('MEDIAMTX_HLS_PORT', 8888),
    'mediamtx_webrtc_port' => (int) env('MEDIAMTX_WEBRTC_PORT', 8889),
    'mediamtx_api_port' => (int) env('MEDIAMTX_API_PORT', 9997),
    'camera_api_port' => (int) env('GATEWAY_CAMERA_API_PORT', 8001),

    /*
    |--------------------------------------------------------------------------
    | Frigate NVR
    |--------------------------------------------------------------------------
    |
    | Frigate is the network video recorder providing AI-powered object
    | detection on camera feeds. Runs as a Docker container on the gateway.
    |
    */
    'frigate_url' => env('FRIGATE_URL', 'http://192.168.50.6'),
    'frigate_port' => (int) env('FRIGATE_PORT', 5000),

    /*
    |--------------------------------------------------------------------------
    | CUPS Print Server
    |--------------------------------------------------------------------------
    |
    | Common UNIX Printing System for shared printer access from VMs.
    |
    */
    'cups_url' => env('CUPS_URL', 'https://192.168.50.6'),
    'cups_port' => (int) env('CUPS_PORT', 631),

    /*
    |--------------------------------------------------------------------------
    | ser2net — Serial Port to Network Proxy
    |--------------------------------------------------------------------------
    |
    | Exposes physical serial ports (RS-232/485) over TCP so VMs and
    | remote sessions can interact with serial devices transparently.
    |
    */
    'ser2net_port' => (int) env('SER2NET_PORT', 2001),

    /*
    |--------------------------------------------------------------------------
    | Avahi / mDNS
    |--------------------------------------------------------------------------
    |
    | Whether the avahi-daemon is enabled on the gateway for zero-conf
    | service discovery on the local network.
    |
    */
    'avahi_enabled' => (bool) env('GATEWAY_AVAHI_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | USB Camera Detection
    |--------------------------------------------------------------------------
    |
    | Known USB camera VID:PID patterns. These devices are classified as
    | cameras and handled separately - they cannot be bound/attached to VMs.
    | Patterns support wildcards: * matches any value.
    |
    | Format: 'vendor_id:product_id' or 'vendor_id:*' for all products
    |
    */
    'camera_vid_pids' => [
        // Microdia PC Camera / JIELI (common webcam chips)
        '0c45:6536',    // Microdia USB 2.0 Camera (the Microdia device)
        '0c45:*',       // All Microdia devices (commonly webcams)

        // Logitech webcams
        '046d:082c',    // Logitech HD Webcam C615
        '046d:0825',    // Logitech Webcam C270
        '046d:082d',    // Logitech HD Pro Webcam C920
        '046d:0843',    // Logitech Webcam C930e

        // Microsoft webcams
        '045e:0810',    // Microsoft LifeCam HD-3000
        '045e:0779',    // Microsoft LifeCam HD-5000

        // Generic UVC cameras (USB Video Class)
        // These often have class code 0e (video)
    ],

    /*
    |--------------------------------------------------------------------------
    | Camera USB Class Codes
    |--------------------------------------------------------------------------
    |
    | USB device class codes that indicate a camera/video device.
    | Class 0e = Video, Subclass 01 = Video Control
    |
    */
    'camera_usb_classes' => [
        '0e',           // USB Video Class (UVC)
    ],

];
