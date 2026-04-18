#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# IoT-REAP Camera Streaming Quick-Start
# ═══════════════════════════════════════════════════════════════════════════════
# Run this on the Proxmox HOST (not the gateway container) to:
# 1. Configure USB device passthrough to gateway container
# 2. SSH to gateway and install ffmpeg
# 3. Start the camera streaming service
# ═══════════════════════════════════════════════════════════════════════════════

set -e

echo "╔═══════════════════════════════════════════════════════════════════════════════╗"
echo "║           IoT-REAP Camera Streaming Setup                                     ║"
echo "╚═══════════════════════════════════════════════════════════════════════════════╝"

# ─── STEP 1: Configure USB Passthrough on Proxmox HOST ──────────────────────────

echo ""
echo "📍 STEP 1: Configuring USB device passthrough to LXC container (CT 102)..."
echo ""

# Add USB device passthrough for all 4 video devices
pct set 102 -dev0 '/dev/video0,cgroup=1'
echo "   ✓ Added /dev/video0"

pct set 102 -dev1 '/dev/video1,cgroup=1'
echo "   ✓ Added /dev/video1"

pct set 102 -dev2 '/dev/video2,cgroup=1'
echo "   ✓ Added /dev/video2"

pct set 102 -dev3 '/dev/video3,cgroup=1'
echo "   ✓ Added /dev/video3"

echo ""
echo "🔄 Restarting gateway container..."
pct restart 102

echo "⏳ Waiting 10 seconds for container to start..."
sleep 10

# ─── STEP 2: SSH to Gateway and Install Dependencies ───────────────────────────

echo ""
echo "📍 STEP 2: Installing ffmpeg and dependencies on gateway..."
echo ""

ssh root@192.168.50.6 << 'GATEWAY_COMMANDS'
set -e

echo "   Installing packages..."
apt-get update -qq
apt-get install -y ffmpeg jq v4l-utils curl > /dev/null 2>&1
echo "   ✓ ffmpeg installed"

echo "   Creating log directory..."
mkdir -p /var/log/iot-reap
echo "   ✓ /var/log/iot-reap ready"

echo "   Verifying USB cameras are accessible..."
if [ -e /dev/video0 ]; then
    echo "   ✓ /dev/video0 found"
else
    echo "   ✗ ERROR: /dev/video0 not found!"
    ls -la /dev/video* 2>/dev/null || echo "   No video devices!"
    exit 1
fi

echo ""
echo "   All dependencies installed successfully!"
GATEWAY_COMMANDS

# ─── STEP 3: Start Camera Streaming Service ──────────────────────────────────

echo ""
echo "📍 STEP 3: Starting camera streaming service..."
echo ""

ssh root@192.168.50.6 << 'GATEWAY_START'
set -e

echo "   Starting stream: usb-gateway-11 → /dev/video0 @ 640x480 15fps"
bash /app/setup-proxmox-camera-streaming.sh start usb-gateway-11 /dev/video0 640 480 15

# Wait for service to stabilize
sleep 3

# Check if it's running
if systemctl is-active --quiet iot-reap-camera-usb-gateway-11; then
    echo "   ✓ Service is running (PID: $(systemctl show iot-reap-camera-usb-gateway-11 --property=MainPID --value))"
else
    echo "   ✗ Service failed to start"
    echo ""
    echo "   Checking logs for errors:"
    journalctl -u iot-reap-camera-usb-gateway-11 -n 20 --no-pager
    exit 1
fi

echo ""
echo "   Testing stream availability (this may take 5 seconds)..."
for i in {1..5}; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:8888/usb-gateway-11/index.m3u8" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        echo "   ✓ Stream is PUBLISHING and LIVE!"
        echo ""
        echo "   HLS URL: http://192.168.50.6:8888/usb-gateway-11/index.m3u8"
        echo "   WebRTC URL: ws://192.168.50.6:8889/usb-gateway-11/whep"
        exit 0
    fi
    echo "   [Attempt $i/5] HTTP $HTTP_CODE - retrying..."
    sleep 1
done

echo "   ✗ Stream not responding after 5 attempts"
echo ""
echo "   Checking ffmpeg logs:"
journalctl -u iot-reap-camera-usb-gateway-11 -n 30 --no-pager
exit 1
GATEWAY_START

# ─── SUCCESS ──────────────────────────────────────────────────────────────────

echo ""
echo "╔═══════════════════════════════════════════════════════════════════════════════╗"
echo "║                        ✓ SETUP COMPLETE                                      ║"
echo "╚═══════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo ""
echo "1. Create a new VM session in your app"
echo "2. Navigate to the session camera view"
echo "3. The camera should stream automatically (WebRTC → HLS fallback)"
echo ""
echo "Testing:"
echo "  • HLS stream:    curl http://192.168.50.6:8888/usb-gateway-11/index.m3u8"
echo "  • Gateway logs:  ssh root@192.168.50.6 journalctl -u iot-reap-camera-usb-gateway-11 -f"
echo "  • MediaMTX:      ssh root@192.168.50.6 systemctl status mediamtx"
echo ""
