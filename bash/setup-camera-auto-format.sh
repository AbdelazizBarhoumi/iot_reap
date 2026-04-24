#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# IoT-REAP Camera Streaming Setup - Auto-Format Detection
# ═══════════════════════════════════════════════════════════════════════════════

set -e

MEDIAMTX_HOST="${MEDIAMTX_HOST:-192.168.50.6}"
MEDIAMTX_RTSP_PORT="${MEDIAMTX_RTSP_PORT:-8554}"
DEFAULT_WIDTH="${DEFAULT_WIDTH:-640}"
DEFAULT_HEIGHT="${DEFAULT_HEIGHT:-480}"
DEFAULT_FRAMERATE="${DEFAULT_FRAMERATE:-15}"

LOG_DIR="/var/log/iot-reap"
STREAMS_CONFIG="/etc/iot-reap/camera-streams.json"
SERVICE_PREFIX="iot-reap-camera"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

error() {
    echo "[ERROR] $1" >&2
    exit 1
}

# ─── Auto-Detect Camera Format ───────────────────────────────────────────────

detect_camera_format() {
    local device="$1"
    local width="$2"
    local height="$3"
    local framerate="$4"
    
    log "Detecting format for $device..."
    
    # Try formats in order of preference
    local formats=("mjpeg" "yuyv422" "jpeg" "yuv420p" "rgb24")
    
    for fmt in "${formats[@]}"; do
        log "  Trying format: $fmt"
        
        # Test with ffmpeg (timeout after 3 seconds)
        if timeout 3 ffmpeg -f v4l2 -input_format "$fmt" \
            -framerate "$framerate" \
            -video_size "${width}x${height}" \
            -i "$device" \
            -t 1 \
            -f null - \
            &>/dev/null 2>&1; then
            
            log "  ✓ Format $fmt works!"
            echo "$fmt"
            return 0
        fi
    done
    
    # If no specific format works, try auto-detect
    log "  Trying auto-detect..."
    if timeout 3 ffmpeg -f v4l2 \
        -framerate "$framerate" \
        -video_size "${width}x${height}" \
        -i "$device" \
        -t 1 \
        -f null - \
        &>/dev/null 2>&1; then
        
        log "  ✓ Auto-detect works!"
        echo ""
        return 0
    fi
    
    error "Could not detect working format for $device"
}

# ─── Generate Optimized Service ───────────────────────────────────────────────

generate_optimized_service() {
    local stream_key="$1"
    local device_path="$2"
    local width="$3"
    local height="$4"
    local framerate="$5"
    local input_format="$6"
    
    local service_name="${SERVICE_PREFIX}-${stream_key}"
    local service_file="/etc/systemd/system/${service_name}.service"
    local rtsp_url="rtsp://${MEDIAMTX_HOST}:${MEDIAMTX_RTSP_PORT}/${stream_key}"
    
    # Calculate bitrate based on resolution
    local bitrate="800k"
    if [ "$width" -le 320 ]; then
        bitrate="400k"
    elif [ "$width" -le 640 ]; then
        bitrate="800k"
    elif [ "$width" -le 1280 ]; then
        bitrate="1500k"
    fi
    
    local gop_size=$((framerate))
    
    # Build input format flag
    local input_fmt_flag=""
    if [ -n "$input_format" ]; then
        input_fmt_flag="-input_format $input_format"
    fi
    
    mkdir -p "$LOG_DIR"
    mkdir -p "$(dirname "$service_file")"
    
    cat > "$service_file" << EOF
[Unit]
Description=IoT-REAP Camera Stream: ${stream_key}
After=network.target mediamtx.service
Wants=network.target mediamtx.service

[Service]
Type=simple
ExecStart=/usr/bin/ffmpeg \\
  -fflags nobuffer -flags low_delay \\
  -f v4l2 ${input_fmt_flag} \\
  -framerate ${framerate} -video_size ${width}x${height} \\
  -i ${device_path} \\
  -c:v libx264 -preset ultrafast -tune zerolatency \\
  -g ${gop_size} -keyint_min ${gop_size} \\
  -b:v ${bitrate} -maxrate $((bitrate + 200))k -bufsize $((bitrate / 2))k \\
  -pix_fmt yuv420p \\
  -f rtsp -rtsp_transport tcp \\
  ${rtsp_url}

Restart=always
RestartSec=5
StandardOutput=append:${LOG_DIR}/${stream_key}.log
StandardError=append:${LOG_DIR}/${stream_key}.log

[Install]
WantedBy=multi-user.target
EOF

    log "Generated optimized service for $stream_key with format: ${input_format:-auto}"
}

# ─── Main ─────────────────────────────────────────────────────────────────────

start_stream_with_auto_format() {
    local stream_key="$1"
    local device_path="$2"
    local width="${3:-$DEFAULT_WIDTH}"
    local height="${4:-$DEFAULT_HEIGHT}"
    local framerate="${5:-$DEFAULT_FRAMERATE}"
    
    log "Starting stream: $stream_key"
    log "  Device: $device_path"
    log "  Resolution: ${width}x${height}"
    log "  Framerate: ${framerate}"
    
    # Detect format
    local detected_format=$(detect_camera_format "$device_path" "$width" "$height" "$framerate")
    
    # Generate and start service
    generate_optimized_service "$stream_key" "$device_path" "$width" "$height" "$framerate" "$detected_format"
    
    local service_name="${SERVICE_PREFIX}-${stream_key}"
    
    systemctl daemon-reload
    systemctl enable "${service_name}.service"
    systemctl start "${service_name}.service"
    
    sleep 3
    
    if systemctl is-active --quiet "${service_name}.service"; then
        log "✓ Stream started successfully!"
        log "  RTSP URL: rtsp://${MEDIAMTX_HOST}:${MEDIAMTX_RTSP_PORT}/${stream_key}"
        log "  Check logs: journalctl -u ${service_name} -f"
        return 0
    else
        log "✗ Failed to start stream"
        log "  Check logs: journalctl -u ${service_name} -n 50"
        return 1
    fi
}

# ─── Run ───────────────────────────────────────────────────────────────────────

if [ "$1" == "test" ]; then
    # Test mode - just detect format
    local device="${2:-/dev/video0}"
    detect_camera_format "$device" 640 480 15
elif [ $# -eq 0 ]; then
    # Interactive mode
    echo "IoT-REAP Camera Streaming Setup"
    echo ""
    echo "Usage:"
    echo "  $0 test /dev/video0              # Test camera format detection"
    echo "  $0 <stream_key> <device>         # Start streaming (auto-format)"
    echo "  $0 <stream_key> <device> <width> <height> <fps>"
    echo ""
    echo "Examples:"
    echo "  $0 test /dev/video0"
    echo "  $0 usb-gateway-11 /dev/video0"
    echo "  $0 usb-gateway-11 /dev/video0 1280 720 30"
else
    start_stream_with_auto_format "$@"
fi
