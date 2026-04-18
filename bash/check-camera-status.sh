#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# Quick Camera Streaming Status Check
# ═══════════════════════════════════════════════════════════════════════════════

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║    IoT-REAP Camera Streaming Status Check                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# ─── Check FFmpeg Process ──────────────────────────────────────────────────────

echo "1️⃣  FFmpeg Service Status"
echo "─────────────────────────────────────────────────────────────────"

STREAM_KEY="${1:-usb-gateway-11}"
SERVICE_NAME="iot-reap-camera-${STREAM_KEY}"

if systemctl is-active --quiet "$SERVICE_NAME"; then
    echo "✓ Service is RUNNING"
    
    # Get PID and memory
    local pid=$(systemctl show -p MainPID --value "$SERVICE_NAME")
    local memory=$(ps -p "$pid" -o rss= 2>/dev/null || echo "N/A")
    local cpu=$(ps -p "$pid" -o %cpu= 2>/dev/null || echo "N/A")
    
    echo "  PID: $pid"
    echo "  Memory: ${memory}K"
    echo "  CPU%: $cpu"
else
    echo "✗ Service is STOPPED"
    echo "  Start with: systemctl start $SERVICE_NAME"
fi
echo ""

# ─── Check Device ──────────────────────────────────────────────────────────────

echo "2️⃣  USB Camera Device Status"
echo "─────────────────────────────────────────────────────────────────"

if [ ! -e "/dev/video0" ]; then
    echo "✗ /dev/video0 NOT FOUND"
    echo "  Available devices:"
    ls /dev/video* 2>/dev/null || echo "  None found!"
else
    echo "✓ /dev/video0 exists"
    
    # Check if readable
    if [ -r "/dev/video0" ]; then
        echo "✓ /dev/video0 is readable"
        
        # Get device info
        local info=$(v4l2-ctl -d /dev/video0 --info 2>/dev/null | grep "Card type" | cut -d':' -f2- | xargs)
        echo "  Device: $info"
    else
        echo "✗ /dev/video0 is NOT readable"
        echo "  Check device permissions"
    fi
fi
echo ""

# ─── Check MediaMTX Connection ────────────────────────────────────────────────

echo "3️⃣  MediaMTX Streaming Server"
echo "─────────────────────────────────────────────────────────────────"

MEDIAMTX_HOST="${MEDIAMTX_HOST:-192.168.50.6}"

if timeout 2 curl -s -I "http://${MEDIAMTX_HOST}:8888/" &>/dev/null; then
    echo "✓ MediaMTX is ACCESSIBLE at http://${MEDIAMTX_HOST}:8888"
    
    # Check if stream is publishing
    if timeout 2 curl -s "http://${MEDIAMTX_HOST}:8888/${STREAM_KEY}/index.m3u8" &>/dev/null; then
        echo "✓ Stream '${STREAM_KEY}' is PUBLISHING"
        
        # Check manifest
        local manifest=$(curl -s "http://${MEDIAMTX_HOST}:8888/${STREAM_KEY}/video1_stream.m3u8")
        local segment_count=$(echo "$manifest" | grep -c "EXTINF" || echo "0")
        echo "  Segments in playlist: $segment_count"
    else
        echo "✗ Stream '${STREAM_KEY}' is NOT publishing"
        echo "  Expected: http://${MEDIAMTX_HOST}:8888/${STREAM_KEY}/index.m3u8"
        echo "  Action: Check ffmpeg logs - 'journalctl -u $SERVICE_NAME -n 50'"
    fi
else
    echo "✗ MediaMTX is NOT accessible"
    echo "  Troubleshooting:"
    echo "  - Check network connectivity to ${MEDIAMTX_HOST}"
    echo "  - Check MediaMTX is running: systemctl status mediamtx"
fi
echo ""

# ─── Check FFmpeg Logs ─────────────────────────────────────────────────────────

echo "4️⃣  Recent FFmpeg Logs (Last 5 lines)"
echo "─────────────────────────────────────────────────────────────────"

LOG_FILE="/var/log/iot-reap/${STREAM_KEY}.log"

if [ -f "$LOG_FILE" ]; then
    tail -5 "$LOG_FILE"
    echo ""
    echo "Full logs: journalctl -u $SERVICE_NAME -f"
else
    echo "✓ No error logs yet (good sign)"
fi
echo ""

# ─── Diagnostics ──────────────────────────────────────────────────────────────

echo "5️⃣  Quick Diagnostics"
echo "─────────────────────────────────────────────────────────────────"

if systemctl is-active --quiet "$SERVICE_NAME" && \
   [ -e "/dev/video0" ] && \
   [ -r "/dev/video0" ] && \
   timeout 2 curl -s "http://${MEDIAMTX_HOST}:8888/${STREAM_KEY}/index.m3u8" &>/dev/null; then
    echo "✓✓✓ ALL SYSTEMS GO! Stream should be working."
    echo ""
    echo "Browser test:"
    echo "  HLS:  http://your-app/sessions/{id}/cameras/8/hls"
    echo "  WHEP: http://your-app/sessions/{id}/cameras/8/whep"
else
    echo "⚠️  Issues detected. Running quick fix..."
    echo ""
    echo "Fix procedure:"
    echo "  1. Run diagnostic: bash /app/bash/diagnose-camera-formats.sh"
    echo "  2. Check format: bash /app/bash/setup-camera-auto-format.sh test /dev/video0"
    echo "  3. Restart: bash /app/bash/setup-camera-auto-format.sh ${STREAM_KEY} /dev/video0"
    echo "  4. Re-check: bash $0 ${STREAM_KEY}"
fi
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║ For more help: Read CAMERA_STREAMING_TROUBLESHOOTING.md        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
