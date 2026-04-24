#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# IoT-REAP Gateway Diagnostics
# ═══════════════════════════════════════════════════════════════════════════════
# Tests everything related to the gateway: MediaMTX, ffmpeg streams, API, etc.
# Run on the gateway (192.168.50.6 or .7) to verify all services are working.
# ═══════════════════════════════════════════════════════════════════════════════

set +e

COLOR_GREEN='\033[0;32m'
COLOR_RED='\033[0;31m'
COLOR_YELLOW='\033[1;33m'
COLOR_BLUE='\033[0;34m'
NC='\033[0m' # No Color

pass() {
    echo -e "${COLOR_GREEN}✓ PASS${NC}: $1"
}

fail() {
    echo -e "${COLOR_RED}✗ FAIL${NC}: $1"
}

warn() {
    echo -e "${COLOR_YELLOW}⚠ WARN${NC}: $1"
}

info() {
    echo -e "${COLOR_BLUE}ℹ INFO${NC}: $1"
}

header() {
    echo ""
    echo "═══════════════════════════════════════════════════════════════════════════════"
    echo "  $1"
    echo "═══════════════════════════════════════════════════════════════════════════════"
}

# ─── 1. System Information ─────────────────────────────────────────────────────

header "1. System Information"

HOSTNAME=$(hostname)
IP=$(hostname -I | awk '{print $1}')
info "Hostname: $HOSTNAME"
info "IP Address: $IP"

# ─── 2. MediaMTX Service ───────────────────────────────────────────────────────

header "2. MediaMTX Streaming Server"

# Check if service is running
if systemctl is-active --quiet mediamtx; then
    pass "MediaMTX service is running"
    MEDIAMTX_PID=$(systemctl show mediamtx --property=MainPID --value)
    info "Process ID: $MEDIAMTX_PID"
else
    fail "MediaMTX service is NOT running"
    warn "Start it with: systemctl restart mediamtx"
fi

# Test API port
if timeout 2 bash -c "echo >/dev/tcp/127.0.0.1/9997" 2>/dev/null; then
    pass "MediaMTX API port 9997 is listening"
else
    fail "MediaMTX API port 9997 is NOT listening"
fi

# Test WebRTC WHEP port
if timeout 2 bash -c "echo >/dev/tcp/127.0.0.1/8889" 2>/dev/null; then
    pass "WebRTC WHEP port 8889 is listening"
else
    fail "WebRTC WHEP port 8889 is NOT listening"
fi

# Test RTSP port
if timeout 2 bash -c "echo >/dev/tcp/127.0.0.1/8554" 2>/dev/null; then
    pass "RTSP port 8554 is listening"
else
    fail "RTSP port 8554 is NOT listening"
fi

# ─── 3. Camera Capture Services ────────────────────────────────────────────────

header "3. Camera Capture Services (ffmpeg)"

# Find all camera services
CAMERA_SERVICES=$(systemctl list-units --all | grep "iot-reap-camera" | awk '{print $1}')

if [ -z "$CAMERA_SERVICES" ]; then
    warn "No camera capture services found"
else
    RUNNING_COUNT=0
    TOTAL_COUNT=0
    
    while IFS= read -r service; do
        TOTAL_COUNT=$((TOTAL_COUNT + 1))
        STREAM_KEY=$(echo "$service" | sed 's/iot-reap-camera-//g' | sed 's/\.service//g')
        
        if systemctl is-active --quiet "$service"; then
            pass "Camera stream '$STREAM_KEY' is RUNNING"
            RUNNING_COUNT=$((RUNNING_COUNT + 1))
            
            # Get process info
            PID=$(systemctl show "$service" --property=MainPID --value)
            info "  PID: $PID"
            
            # Check ffmpeg process
            if ps -p "$PID" > /dev/null 2>&1; then
                info "  ffmpeg process is alive"
            fi
        else
            fail "Camera stream '$STREAM_KEY' is STOPPED"
            info "  Start with: systemctl restart iot-reap-camera-${STREAM_KEY}"
        fi
    done <<< "$CAMERA_SERVICES"
    
    echo ""
    info "Summary: $RUNNING_COUNT/$TOTAL_COUNT camera streams running"
fi

# ─── 4. Available USB/Video Devices ────────────────────────────────────────────

header "4. Available USB/Video Devices"

VIDEO_DEVICES=$(ls -1 /dev/video* 2>/dev/null)

if [ -z "$VIDEO_DEVICES" ]; then
    fail "No /dev/video* devices found"
    warn "USB cameras may not be connected or USB forwarding not working"
else
    pass "Found video devices:"
    for device in $VIDEO_DEVICES; do
        if command -v v4l2-ctl &> /dev/null; then
            CARD_INFO=$(v4l2-ctl --device="$device" --info 2>/dev/null | grep "Card type" | cut -d':' -f2 | xargs)
            if [ -n "$CARD_INFO" ]; then
                info "  $device → $CARD_INFO"
            else
                info "  $device → (device recognized by kernel)"
            fi
        else
            info "  $device (install v4l-utils to see details)"
        fi
    done
fi

# ─── 5. Stream Diagnostics (Test each stream path) ────────────────────────────

header "5. Stream Path Availability"

# Hardcoded test paths based on expected camera names
TEST_STREAMS=(
    "usb-gateway-11"
    "usb-gateway-1"
    "usb-gateway-2"
    "camera-1"
    "camera-2"
    "rtsp"
)

AVAILABLE_COUNT=0

for stream in "${TEST_STREAMS[@]}"; do
    # Test path via MediaMTX API
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:9997/v3/paths/get/${stream}" 2>/dev/null)
    
    if [ "$RESPONSE" = "200" ]; then
        # Check if it has a source (is publishing)
        JSON=$(curl -s "http://127.0.0.1:9997/v3/paths/get/${stream}" 2>/dev/null)
        if echo "$JSON" | grep -q "\"source\":"; then
            pass "Stream '$stream' is PUBLISHING (via API)"
            AVAILABLE_COUNT=$((AVAILABLE_COUNT + 1))
        else
            warn "Stream '$stream' exists but is NOT publishing"
        fi
    elif [ "$RESPONSE" = "404" ]; then
        warn "Stream '$stream' path not found (404)"
    else
        warn "Stream '$stream' API check returned HTTP $RESPONSE"
    fi
done

echo ""
info "Summary: $AVAILABLE_COUNT streams are publishing"

# ─── 6. Camera Management API ──────────────────────────────────────────────────

header "6. Camera Management API"

if systemctl is-active --quiet iot-reap-camera-api; then
    pass "Camera API service is running"
    
    # Test health endpoint
    API_RESPONSE=$(curl -s http://127.0.0.1:8001/health 2>/dev/null)
    if echo "$API_RESPONSE" | grep -q "ok"; then
        pass "Camera API /health endpoint is responding"
        info "  Response: $API_RESPONSE"
    else
        fail "Camera API /health endpoint failed"
    fi
    
    # Get stream list from API
    STREAMS_JSON=$(curl -s http://127.0.0.1:8001/streams 2>/dev/null)
    if [ -n "$STREAMS_JSON" ]; then
        info "  API streams endpoint available"
    fi
else
    warn "Camera API service is NOT running"
    info "  Start with: systemctl restart iot-reap-camera-api"
fi

# ─── 7. ffmpeg Process Details ────────────────────────────────────────────────

header "7. ffmpeg Process Details"

FFMPEG_PROCESSES=$(ps aux | grep -i ffmpeg | grep -v grep)

if [ -z "$FFMPEG_PROCESSES" ]; then
    fail "No ffmpeg processes found (streams should be pushing RTSP)"
else
    pass "Found ffmpeg processes running:"
    echo "$FFMPEG_PROCESSES" | while IFS= read -r line; do
        PID=$(echo "$line" | awk '{print $2}')
        COMMAND=$(echo "$line" | awk '{$1=$2=$3=$4=$5=$6=$7=$8=$9=""; print $0}' | xargs)
        info "  PID $PID: $COMMAND" | cut -c1-100
    done
fi

# ─── 8. Systemd Journal Errors ────────────────────────────────────────────────

header "8. Recent Service Errors"

# Check MediaMTX errors
MEDIAMTX_ERRORS=$(journalctl -u mediamtx -n 20 --no-pager 2>/dev/null | grep -i "error\|fail" | head -3)
if [ -n "$MEDIAMTX_ERRORS" ]; then
    warn "MediaMTX recent errors:"
    echo "$MEDIAMTX_ERRORS" | while IFS= read -r line; do
        echo "  $line" | head -c 120
    done
else
    pass "No recent MediaMTX errors"
fi

# Check camera service errors
if systemctl is-active --quiet iot-reap-camera-*; then
    CAMERA_ERRORS=$(journalctl -S "30 minutes ago" --no-pager 2>/dev/null | grep "iot-reap-camera" | grep -i "error\|fail" | head -3)
    if [ -n "$CAMERA_ERRORS" ]; then
        warn "Camera service errors in last 30 minutes:"
        echo "$CAMERA_ERRORS" | while IFS= read -r line; do
            echo "  $line" | head -c 120
        done
    fi
fi

# ─── 9. Network Connectivity Test ──────────────────────────────────────────────

header "9. Network Connectivity"

# Test if backend can reach gateway
GATEWAY_IP=$(hostname -I | awk '{print $1}')
info "Gateway responding on: $GATEWAY_IP"

if timeout 2 bash -c "echo >/dev/tcp/127.0.0.1/8000" 2>/dev/null; then
    pass "Gateway REST API port 8000 is listening"
else
    warn "Gateway REST API port 8000 not responding"
fi

# ─── 10. Configuration Check ───────────────────────────────────────────────────

header "10. Configuration Check"

if [ -f /etc/iot-reap/camera-streams.json ]; then
    pass "Configuration file exists: /etc/iot-reap/camera-streams.json"
    info "Content: $(cat /etc/iot-reap/camera-streams.json | head -c 200)"
else
    warn "Configuration file not found: /etc/iot-reap/camera-streams.json"
fi

# ─── Summary ───────────────────────────────────────────────────────────────────

header "DIAGNOSTICS SUMMARY"

echo ""
echo "To view detailed logs:"
echo "  • MediaMTX:        journalctl -u mediamtx -n 100 --no-pager"
echo "  • Camera service:  journalctl -u iot-reap-camera-usb-gateway-11 -n 100 --no-pager"
echo "  • Camera API:      journalctl -u iot-reap-camera-api -n 50 --no-pager"
echo ""
echo "To restart services:"
echo "  • MediaMTX:        systemctl restart mediamtx"
echo "  • All cameras:     systemctl restart iot-reap-camera-*"
echo "  • Camera API:      systemctl restart iot-reap-camera-api"
echo ""
echo "To manually test a stream:"
echo "  • curl http://127.0.0.1:9997/v3/paths/get/usb-gateway-11"
echo ""
