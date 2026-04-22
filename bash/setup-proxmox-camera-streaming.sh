#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# IoT-REAP Camera Streaming Setup for Proxmox Nodes
# ═══════════════════════════════════════════════════════════════════════════════
# 
# This script sets up camera streaming infrastructure on a Proxmox node.
# It enables USB cameras connected to the Proxmox host to stream via MediaMTX.
#
# Features:
# - Auto-detects USB cameras by VID/PID
# - Runs ffmpeg as systemd services for each camera
# - Supports multiple cameras with different resolutions
# - Uses MJPEG input format for USB/IP compatibility
# - Streams to MediaMTX RTSP server for HLS/WebRTC output
#
# Usage:
#   ./setup-proxmox-camera-streaming.sh
#
# Requirements:
# - Proxmox VE host with USB cameras attached
# - MediaMTX server accessible at MEDIAMTX_HOST:8554
# - Root access on the Proxmox node
#
# Environment variables (optional):
#   MEDIAMTX_HOST     - MediaMTX server IP (default: 192.168.50.6)
#   DEFAULT_WIDTH     - Default video width (default: 640)
#   DEFAULT_HEIGHT    - Default video height (default: 480)
#   DEFAULT_FRAMERATE - Default framerate (default: 15)
# ═══════════════════════════════════════════════════════════════════════════════

set -e

# ─── Configuration ─────────────────────────────────────────────────────────────

MEDIAMTX_HOST="${MEDIAMTX_HOST:-$(hostname -I | awk '{print $1}')}"
MEDIAMTX_RTSP_PORT="${MEDIAMTX_RTSP_PORT:-8554}"
DEFAULT_WIDTH="${DEFAULT_WIDTH:-640}"
DEFAULT_HEIGHT="${DEFAULT_HEIGHT:-480}"
DEFAULT_FRAMERATE="${DEFAULT_FRAMERATE:-15}"

CONFIG_DIR="/etc/iot-reap"
STREAMS_CONFIG="${CONFIG_DIR}/camera-streams.json"
LOG_DIR="/var/log/iot-reap"
SERVICE_PREFIX="iot-reap-camera"

# ─── Helper Functions ──────────────────────────────────────────────────────────

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

error() {
    echo "[ERROR] $1" >&2
    exit 1
}

device_has_video_capture() {
    local device_info="$1"
    local device_caps

    device_caps=$(printf '%s\n' "$device_info" | awk '
        /Device Caps/ { flag=1; next }
        flag && $0 !~ /^\t\t/ { flag=0 }
        flag { print }
    ')

    if [ -n "$device_caps" ]; then
        printf '%s\n' "$device_caps" | grep -q "Video Capture"
        return $?
    fi

    printf '%s\n' "$device_info" | grep -q "Video Capture"
}

if [ -d /etc/pve ] && [ -z "${ALLOW_PROXMOX_HOST_CAMERA_STREAMING:-}" ]; then
    error "Run this script inside the gateway container, not on the Proxmox host. Use bash/complete-camera-setup.sh from the host."
fi

# ─── Install Dependencies ──────────────────────────────────────────────────────

install_dependencies() {
    log "Checking dependencies..."

    local missing_packages=()

    if ! command -v ffmpeg &> /dev/null; then
        missing_packages+=("ffmpeg")
    else
        log "ffmpeg already installed: $(ffmpeg -version | head -1)"
    fi

    if ! command -v jq &> /dev/null; then
        missing_packages+=("jq")
    fi

    if ! command -v curl &> /dev/null; then
        missing_packages+=("curl")
    fi

    if ! command -v v4l2-ctl &> /dev/null; then
        missing_packages+=("v4l-utils")
    fi

    if [ "${#missing_packages[@]}" -eq 0 ]; then
        return 0
    fi

    # Fix DNS if needed (common on fresh Proxmox containers)
    if ! getent hosts deb.debian.org > /dev/null 2>&1; then
        log "Fixing DNS configuration..."
        cp /etc/resolv.conf /etc/resolv.conf.backup 2>/dev/null || true
        echo "nameserver 8.8.8.8" > /etc/resolv.conf
        echo "nameserver 8.8.4.4" >> /etc/resolv.conf
    fi

    apt-get update -qq
    apt-get install -y "${missing_packages[@]}"
}

# ─── Setup Directory Structure ─────────────────────────────────────────────────

setup_directories() {
    log "Setting up directories..."
    mkdir -p "${CONFIG_DIR}"
    mkdir -p "${LOG_DIR}"
    
    # Create default config if not exists
    if [ ! -f "${STREAMS_CONFIG}" ]; then
        echo '{"streams": []}' > "${STREAMS_CONFIG}"
    fi
}

# ─── Camera Detection Functions ────────────────────────────────────────────────

# List all video devices with their capabilities
list_cameras() {
    log "Detecting USB cameras..."
    
    local cameras=()
    for video_dev in /dev/video*; do
        if [ -e "$video_dev" ]; then
            # Get device info
            local device_info=$(v4l2-ctl --device="$video_dev" --info 2>/dev/null || echo "")
            
            # Check if it's a capture device (not metadata-only)
            if device_has_video_capture "$device_info"; then
                local card_name=$(echo "$device_info" | grep "Card type" | cut -d':' -f2 | xargs)
                local bus_info=$(echo "$device_info" | grep "Bus info" | cut -d':' -f2- | xargs)
                
                # Get supported formats
                local formats=$(v4l2-ctl --device="$video_dev" --list-formats-ext 2>/dev/null | grep -E "(MJPG|YUYV)" | head -1 || echo "unknown")
                
                echo "{\"device\": \"$video_dev\", \"name\": \"$card_name\", \"bus\": \"$bus_info\", \"formats\": \"$formats\"}"
            fi
        fi
    done
}

# Find the /dev/video device for a given VID:PID
find_device_by_vidpid() {
    local vid="$1"
    local pid="$2"
    
    for video_dev in /dev/video*; do
        if [ -e "$video_dev" ]; then
            local bus_info=$(v4l2-ctl --device="$video_dev" --info 2>/dev/null | grep "Bus info" | cut -d':' -f2- | xargs)
            
            # Bus info format: usb-0000:00:1d.0-1.1
            if [ -n "$bus_info" ]; then
                # Get the USB device path
                local usb_path="/sys/class/video4linux/$(basename $video_dev)/device"
                if [ -L "$usb_path" ]; then
                    local device_vid=$(cat $(dirname $(readlink -f "$usb_path"))/idVendor 2>/dev/null || echo "")
                    local device_pid=$(cat $(dirname $(readlink -f "$usb_path"))/idProduct 2>/dev/null || echo "")
                    
                    if [ "$device_vid" = "$vid" ] && [ "$device_pid" = "$pid" ]; then
                        # Only return capture devices, not metadata
                        if device_has_video_capture "$(v4l2-ctl --device="$video_dev" --info 2>/dev/null || true)"; then
                            echo "$video_dev"
                            return 0
                        fi
                    fi
                fi
            fi
        fi
    done
    
    return 1
}

# ─── Stream Management ─────────────────────────────────────────────────────────

# Generate systemd service for a camera stream
generate_service() {
    local stream_key="$1"
    local device_path="$2"
    local width="$3"
    local height="$4"
    local framerate="$5"
    
    local service_name="${SERVICE_PREFIX}-${stream_key}"
    local service_file="/etc/systemd/system/${service_name}.service"
    local rtsp_url="rtsp://${MEDIAMTX_HOST}:${MEDIAMTX_RTSP_PORT}/${stream_key}"
    
    # Calculate bitrate based on resolution (kbps) — balances quality vs USB/IP bandwidth
    local bitrate="1000k"
    local maxrate="1200k"
    local bufsize="500k"
    if [ "$width" -le 320 ]; then
        bitrate="400k"; maxrate="500k"; bufsize="250k"
    elif [ "$width" -le 640 ]; then
        bitrate="800k"; maxrate="1000k"; bufsize="400k"
    elif [ "$width" -le 800 ]; then
        bitrate="1200k"; maxrate="1500k"; bufsize="600k"
    elif [ "$width" -le 1280 ]; then
        bitrate="2000k"; maxrate="2500k"; bufsize="1000k"
    elif [ "$width" -le 1920 ]; then
        bitrate="3500k"; maxrate="4000k"; bufsize="1500k"
    fi

    # Keyframe interval = framerate (1 keyframe per second for low-latency seeking)
    local gop_size=${framerate}

    cat > "$service_file" << EOF
[Unit]
Description=IoT-REAP Camera Stream: ${stream_key}
After=network.target
Wants=network.target

[Service]
Type=simple
ExecStart=/usr/bin/ffmpeg \\
  -fflags nobuffer -flags low_delay \\
  -f v4l2 -input_format mjpeg \\
  -framerate ${framerate} -video_size ${width}x${height} \\
  -i ${device_path} \\
  -c:v libx264 -preset ultrafast -tune zerolatency \\
  -g ${gop_size} -keyint_min ${gop_size} \\
  -b:v ${bitrate} -maxrate ${maxrate} -bufsize ${bufsize} \\
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

    log "Generated service: ${service_name}"
}

# Start a camera stream
start_stream() {
    local stream_key="$1"
    local device_path="$2"
    local width="${3:-$DEFAULT_WIDTH}"
    local height="${4:-$DEFAULT_HEIGHT}"
    local framerate="${5:-$DEFAULT_FRAMERATE}"
    
    local service_name="${SERVICE_PREFIX}-${stream_key}"

    if [ "${stream_key}" = "api" ]; then
        error "stream key 'api' is reserved"
    fi

    setup_directories
    
    # Check if device exists
    if [ ! -e "$device_path" ]; then
        error "Device not found: $device_path"
    fi
    
    # Generate and start service
    generate_service "$stream_key" "$device_path" "$width" "$height" "$framerate"
    
    systemctl daemon-reload
    systemctl reset-failed "${service_name}.service" 2>/dev/null || true
    systemctl enable "${service_name}.service"
    systemctl restart "${service_name}.service"
    
    sleep 2
    
    if systemctl is-active --quiet "${service_name}.service"; then
        log "Stream started: ${stream_key} -> rtsp://${MEDIAMTX_HOST}:${MEDIAMTX_RTSP_PORT}/${stream_key}"
        log "HLS URL: http://${MEDIAMTX_HOST}:8888/${stream_key}/index.m3u8"
        return 0
    else
        log "Failed to start stream, check logs: journalctl -u ${service_name}"
        return 1
    fi
}

# Stop a camera stream
stop_stream() {
    local stream_key="$1"
    local service_name="${SERVICE_PREFIX}-${stream_key}"

    if [ "${stream_key}" = "api" ]; then
        error "stream key 'api' is reserved"
    fi
    
    if systemctl is-active --quiet "${service_name}.service"; then
        systemctl stop "${service_name}.service"
        systemctl disable "${service_name}.service"
        log "Stream stopped: ${stream_key}"
    else
        log "Stream not running: ${stream_key}"
    fi
    
    # Remove service file
    rm -f "/etc/systemd/system/${service_name}.service"
    systemctl daemon-reload
}

# List active streams
list_streams() {
    log "Active camera streams:"
    for service in /etc/systemd/system/${SERVICE_PREFIX}-*.service; do
        if [ -f "$service" ]; then
            local name=$(basename "$service" .service)
            if [ "$name" = "${SERVICE_PREFIX}-api" ]; then
                continue
            fi
            local status="stopped"
            if systemctl is-active --quiet "$name"; then
                status="running"
            fi
            echo "  - ${name#${SERVICE_PREFIX}-}: $status"
        fi
    done
}

# ─── API Server (Simple HTTP endpoint for Laravel) ─────────────────────────────

# This creates a simple API that Laravel can call to manage streams
create_api_service() {
    log "Creating camera management API..."
    
    # Create the API script
    cat > "${CONFIG_DIR}/camera-api.py" << 'PYTHON_EOF'
#!/usr/bin/env python3
"""
Simple HTTP API for managing camera streams.
Called by Laravel to start/stop streams on this Proxmox node.
"""
import http.server
import glob
import json
import os
import re
import socketserver
import subprocess
from pathlib import Path

PORT = 8001  # Default port for camera API
CONFIG_DIR = "/etc/iot-reap"
MEDIAMTX_RTSP_PORT = int(os.environ.get('MEDIAMTX_RTSP_PORT', '8554'))
MEDIAMTX_HLS_PORT = int(os.environ.get('MEDIAMTX_HLS_PORT', '8888'))

def gateway_host() -> str:
    result = subprocess.run(['hostname', '-I'], capture_output=True, text=True)
    host = result.stdout.strip().split(' ')[0] if result.stdout.strip() else ''

    return host or '127.0.0.1'

def parse_field(source: str, field_name: str) -> str | None:
    for line in source.splitlines():
        if ':' not in line:
            continue

        label, value = line.split(':', 1)
        if label.strip() == field_name:
            return value.strip()

    return None

def has_device_video_capture(info_output: str) -> bool:
    in_device_caps = False
    device_caps = []

    for line in info_output.splitlines():
        stripped = line.strip()

        if stripped.startswith('Device Caps'):
            in_device_caps = True
            continue

        if in_device_caps:
            if not line.startswith('\t\t'):
                break

            device_caps.append(stripped)

    if device_caps:
        return 'Video Capture' in device_caps

    return 'Video Capture' in info_output

def collect_camera_devices() -> list[dict]:
    devices = []

    for device_path in sorted(glob.glob('/dev/video*')):
        info = subprocess.run(
            ['v4l2-ctl', f'--device={device_path}', '--info'],
            capture_output=True,
            text=True,
        )

        if info.returncode != 0 or not has_device_video_capture(info.stdout):
            continue

        sysfs_interface = os.path.realpath(f"/sys/class/video4linux/{Path(device_path).name}/device")
        usb_device_root = os.path.dirname(sysfs_interface)
        interface_name = os.path.basename(sysfs_interface)

        usb_busid = None
        if interface_name:
            usb_busid = interface_name.split(':', 1)[0]

        def read_attr(name: str) -> str | None:
            try:
                with open(os.path.join(usb_device_root, name), 'r', encoding='utf-8') as handle:
                    return handle.read().strip() or None
            except OSError:
                return None

        formats = subprocess.run(
            ['v4l2-ctl', f'--device={device_path}', '--list-formats-ext'],
            capture_output=True,
            text=True,
        )

        devices.append({
            'device': device_path,
            'device_path': device_path,
            'name': parse_field(info.stdout, 'Card type'),
            'bus': parse_field(info.stdout, 'Bus info'),
            'formats': formats.stdout.strip() or None,
            'usb_busid': usb_busid,
            'vendor_id': read_attr('idVendor'),
            'product_id': read_attr('idProduct'),
            'manufacturer': read_attr('manufacturer'),
            'product': read_attr('product'),
            'serial': read_attr('serial'),
        })

    return devices

def resolve_camera_device(body: dict) -> tuple[dict | None, str | None]:
    requested_device_path = body.get('device_path')
    usb_busid = body.get('usb_busid')
    vendor_id = str(body.get('vendor_id', '')).lower() or None
    product_id = str(body.get('product_id', '')).lower() or None
    devices = collect_camera_devices()

    if requested_device_path:
        requested_match = next((device for device in devices if device['device_path'] == requested_device_path), None)
        if requested_match is not None:
            matches_bus = usb_busid is None or requested_match.get('usb_busid') == usb_busid
            matches_vid_pid = (
                vendor_id is None
                or product_id is None
                or (
                    requested_match.get('vendor_id') == vendor_id
                    and requested_match.get('product_id') == product_id
                )
            )

            if matches_bus and matches_vid_pid:
                return requested_match, None

    if usb_busid:
        bus_matches = [device for device in devices if device.get('usb_busid') == usb_busid]
        if len(bus_matches) == 1:
            return bus_matches[0], None
        if len(bus_matches) > 1:
            return None, f"multiple capture devices matched usb busid '{usb_busid}'"

    if vendor_id and product_id:
        vid_pid_matches = [
            device
            for device in devices
            if device.get('vendor_id') == vendor_id and device.get('product_id') == product_id
        ]

        if len(vid_pid_matches) == 1:
            return vid_pid_matches[0], None

        if len(vid_pid_matches) > 1:
            return None, f"multiple capture devices matched vendor/product '{vendor_id}:{product_id}'"

    if requested_device_path and os.path.exists(requested_device_path):
        return {
            'device': requested_device_path,
            'device_path': requested_device_path,
        }, None

    if len(devices) == 1:
        return devices[0], None

    identifiers = []
    if requested_device_path:
        identifiers.append(f"device_path={requested_device_path}")
    if usb_busid:
        identifiers.append(f"usb_busid={usb_busid}")
    if vendor_id and product_id:
        identifiers.append(f"vendor_id={vendor_id}")
        identifiers.append(f"product_id={product_id}")

    details = ', '.join(identifiers) if identifiers else 'no identifiers were provided'

    return None, f'no matching capture device found ({details})'

class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

class CameraAPIHandler(http.server.BaseHTTPRequestHandler):
    def _send_json(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_GET(self):
        if self.path == '/health':
            self._send_json({'status': 'ok'})
        elif self.path == '/streams':
            # List active streams
            result = subprocess.run(
                ['bash', '-c', f'for s in /etc/systemd/system/iot-reap-camera-*.service; do [ -f "$s" ] && basename "$s" .service; done | grep -v "^iot-reap-camera-api$" || true'],
                capture_output=True, text=True
            )
            streams = []
            for name in result.stdout.strip().split('\n'):
                if name:
                    stream_key = name.replace('iot-reap-camera-', '')
                    active = subprocess.run(
                        ['systemctl', 'is-active', '--quiet', name],
                        capture_output=True
                    ).returncode == 0
                    streams.append({'stream_key': stream_key, 'running': active})
            self._send_json({'streams': streams})
        elif self.path.startswith('/streams/status/'):
            # Get individual stream status
            stream_key = self.path.split('/streams/status/')[-1]
            service_name = f'iot-reap-camera-{stream_key}'
            running = subprocess.run(
                ['systemctl', 'is-active', '--quiet', service_name],
                capture_output=True
            ).returncode == 0
            
            # Get PID if running
            pid = None
            if running:
                pid_result = subprocess.run(
                    ['systemctl', 'show', service_name, '--property=MainPID', '--value'],
                    capture_output=True, text=True
                )
                pid_str = pid_result.stdout.strip()
                if pid_str and pid_str != '0':
                    pid = int(pid_str)
            
            self._send_json({
                'running': running,
                'pid': pid,
                'stream_key': stream_key,
                'rtsp_url': f'rtsp://{gateway_host()}:{MEDIAMTX_RTSP_PORT}/{stream_key}' if running else None
            })
        elif self.path == '/cameras':
            self._send_json({'devices': collect_camera_devices()})
        else:
            self._send_json({'error': 'Not found'}, 404)
    
    def do_POST(self):
        if self.path == '/streams/start':
            content_length = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(content_length).decode())
            
            stream_key = body.get('stream_key')
            width = body.get('width', 640)
            height = body.get('height', 480)
            framerate = body.get('framerate', 15)
            
            if not stream_key:
                self._send_json({'error': 'stream_key required'}, 400)
                return
            if stream_key == 'api':
                self._send_json({'error': 'stream_key \"api\" is reserved'}, 400)
                return

            resolved_device, resolution_error = resolve_camera_device(body)
            if resolved_device is None:
                self._send_json({'error': resolution_error}, 422)
                return

            device_path = resolved_device['device_path']
            
            # Start stream using the bash script
            result = subprocess.run(
                [f'{CONFIG_DIR}/setup-proxmox-camera-streaming.sh', 'start', 
                 stream_key, device_path, str(width), str(height), str(framerate)],
                capture_output=True, text=True
            )
            
            if result.returncode == 0:
                self._send_json({
                    'status': 'started',
                    'stream_key': stream_key,
                    'device_path': device_path,
                    'rtsp_url': f'rtsp://{gateway_host()}:{MEDIAMTX_RTSP_PORT}/{stream_key}',
                    'hls_url': f'http://{gateway_host()}:{MEDIAMTX_HLS_PORT}/{stream_key}/index.m3u8'
                })
            else:
                self._send_json({'error': result.stderr or result.stdout}, 500)
        
        elif self.path == '/streams/stop':
            content_length = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(content_length).decode())
            stream_key = body.get('stream_key')
            
            if not stream_key:
                self._send_json({'error': 'stream_key required'}, 400)
                return
            if stream_key == 'api':
                self._send_json({'error': 'stream_key \"api\" is reserved'}, 400)
                return
            
            result = subprocess.run(
                [f'{CONFIG_DIR}/setup-proxmox-camera-streaming.sh', 'stop', stream_key],
                capture_output=True, text=True
            )
            
            self._send_json({'status': 'stopped', 'stream_key': stream_key})
        else:
            self._send_json({'error': 'Not found'}, 404)
    
    def log_message(self, format, *args):
        pass  # Suppress default logging

if __name__ == '__main__':
    port = int(os.environ.get('CAMERA_API_PORT', PORT))
    with ReusableTCPServer(('0.0.0.0', port), CameraAPIHandler) as httpd:
        print(f'Camera API listening on port {port}')
        httpd.serve_forever()
PYTHON_EOF

    chmod +x "${CONFIG_DIR}/camera-api.py"
    
    # Create systemd service for API
    cat > "/etc/systemd/system/iot-reap-camera-api.service" << EOF
[Unit]
Description=IoT-REAP Camera Management API
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/python3 ${CONFIG_DIR}/camera-api.py
Restart=always
RestartSec=5
Environment=CAMERA_API_PORT=8001

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl enable iot-reap-camera-api.service
    systemctl restart iot-reap-camera-api.service
    
    log "Camera API started on port 8001"
}

# ─── Main Entry Point ──────────────────────────────────────────────────────────

main() {
    local command="${1:-install}"
    
    case "$command" in
        install)
            log "Installing IoT-REAP Camera Streaming..."
            install_dependencies
            setup_directories
            create_api_service
            list_cameras
            log "Installation complete!"
            log ""
            log "To start a camera stream:"
            log "  $0 start <stream_key> <device_path> [width] [height] [framerate]"
            log ""
            log "To stop a camera stream:"
            log "  $0 stop <stream_key>"
            log ""
            log "Camera API available at: http://$(hostname -I | awk '{print $1}'):8001"
            ;;
        
        start)
            local stream_key="$2"
            local device_path="${3:-/dev/video0}"
            local width="${4:-$DEFAULT_WIDTH}"
            local height="${5:-$DEFAULT_HEIGHT}"
            local framerate="${6:-$DEFAULT_FRAMERATE}"
            
            if [ -z "$stream_key" ]; then
                error "Usage: $0 start <stream_key> [device_path] [width] [height] [framerate]"
            fi
            
            start_stream "$stream_key" "$device_path" "$width" "$height" "$framerate"
            ;;
        
        stop)
            local stream_key="$2"
            
            if [ -z "$stream_key" ]; then
                error "Usage: $0 stop <stream_key>"
            fi
            
            stop_stream "$stream_key"
            ;;
        
        list)
            list_streams
            ;;
        
        cameras)
            list_cameras
            ;;
        
        *)
            echo "Usage: $0 {install|start|stop|list|cameras}"
            echo ""
            echo "Commands:"
            echo "  install              - Install dependencies and camera API"
            echo "  start <key> [opts]   - Start a camera stream"
            echo "  stop <key>           - Stop a camera stream"
            echo "  list                 - List active streams"
            echo "  cameras              - List available cameras"
            exit 1
            ;;
    esac
}

main "$@"
