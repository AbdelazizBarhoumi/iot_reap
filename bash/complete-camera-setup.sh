#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# IoT-REAP Camera Streaming Quick-Start
# ═══════════════════════════════════════════════════════════════════════════════
# Run this on the Proxmox HOST (not the gateway container) to:
# 1. Configure USB device passthrough to gateway container
# 2. Enter the gateway container with pct and install camera tooling
# 3. Start the camera streaming service
# ═══════════════════════════════════════════════════════════════════════════════

set -e

CT_ID="${CT_ID:-102}"
GATEWAY_IP="${GATEWAY_IP:-192.168.50.6}"
STREAM_KEY="${STREAM_KEY:-usb-gateway-51}"
DEVICE_PATH="${DEVICE_PATH:-/dev/video0}"
WIDTH="${WIDTH:-640}"
HEIGHT="${HEIGHT:-480}"
FRAMERATE="${FRAMERATE:-15}"
LXC_CONFIG="/etc/pve/lxc/${CT_ID}.conf"

echo "╔═══════════════════════════════════════════════════════════════════════════════╗"
echo "║           IoT-REAP Camera Streaming Setup                                     ║"
echo "╚═══════════════════════════════════════════════════════════════════════════════╝"

# ─── STEP 1: Configure USB Passthrough on Proxmox HOST ──────────────────────────

echo ""
echo "📍 STEP 1: Configuring USB device passthrough to LXC container (CT ${CT_ID})..."
echo ""

echo "   Cleaning leftover host camera services..."
systemctl disable --now 'iot-reap-camera-*' >/dev/null 2>&1 || true
rm -f /etc/systemd/system/iot-reap-camera-*.service
systemctl daemon-reload
echo "   ✓ Host leftovers cleaned"

if [ -f "${LXC_CONFIG}" ]; then
    cp "${LXC_CONFIG}" "${LXC_CONFIG}.bak.$(date +%s)"
    sed -i '/^lxc\.mount\.entry: \/dev\/video[0-9]\+/d' "${LXC_CONFIG}"
    sed -i '/^dev[0-9]\+: \/dev\/video[0-9]\+/d' "${LXC_CONFIG}"
fi

VIDEO_INDEX=0
for VIDEO_DEV in /dev/video*; do
    if [ ! -c "${VIDEO_DEV}" ]; then
        continue
    fi

    pct set "${CT_ID}" "-dev${VIDEO_INDEX}" "${VIDEO_DEV},gid=44,uid=0,mode=0660"
    echo "   ✓ Added ${VIDEO_DEV} as dev${VIDEO_INDEX}"
    VIDEO_INDEX=$((VIDEO_INDEX + 1))
done

if [ "${VIDEO_INDEX}" -eq 0 ]; then
    echo "   ✗ ERROR: No /dev/video* character devices found on the Proxmox host."
    exit 1
fi

echo ""
echo "🔄 Restarting gateway container..."
pct restart "${CT_ID}"

echo "⏳ Waiting 10 seconds for container to start..."
sleep 10

# ─── STEP 2: Install Dependencies in Gateway Container ────────────────────────

echo ""
echo "📍 STEP 2: Installing ffmpeg and dependencies on gateway..."
echo ""

pct exec "${CT_ID}" -- bash -lc '
set -e

CAMERA_SETUP_SCRIPT=""
if [ -f /app/bash/setup-proxmox-camera-streaming.sh ]; then
    CAMERA_SETUP_SCRIPT="/app/bash/setup-proxmox-camera-streaming.sh"
elif [ -f /etc/iot-reap/setup-proxmox-camera-streaming.sh ]; then
    CAMERA_SETUP_SCRIPT="/etc/iot-reap/setup-proxmox-camera-streaming.sh"
fi

echo "   Installing packages..."
if [ -n "${CAMERA_SETUP_SCRIPT}" ]; then
    bash "${CAMERA_SETUP_SCRIPT}" install > /dev/null
    echo "   ✓ camera API installed"
else
    apt-get update -qq
    apt-get install -y ffmpeg jq v4l-utils curl > /dev/null 2>&1
    mkdir -p /var/log/iot-reap /etc/iot-reap
    echo "   ✓ fallback packages installed"
fi

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
'

# ─── STEP 3: Start Camera Streaming Service ──────────────────────────────────

echo ""
echo "📍 STEP 3: Starting camera streaming service..."
echo ""

pct exec "${CT_ID}" -- env STREAM_KEY="${STREAM_KEY}" DEVICE_PATH="${DEVICE_PATH}" WIDTH="${WIDTH}" HEIGHT="${HEIGHT}" FRAMERATE="${FRAMERATE}" GATEWAY_IP="${GATEWAY_IP}" bash -lc '
set -e

CAMERA_SETUP_SCRIPT=""
if [ -f /app/bash/setup-proxmox-camera-streaming.sh ]; then
    CAMERA_SETUP_SCRIPT="/app/bash/setup-proxmox-camera-streaming.sh"
elif [ -f /etc/iot-reap/setup-proxmox-camera-streaming.sh ]; then
    CAMERA_SETUP_SCRIPT="/etc/iot-reap/setup-proxmox-camera-streaming.sh"
else
    echo "   ✗ ERROR: Camera setup script not found in /app/bash or /etc/iot-reap"
    exit 1
fi

echo "   Starting stream: ${STREAM_KEY} → ${DEVICE_PATH} @ ${WIDTH}x${HEIGHT} ${FRAMERATE}fps"
bash "${CAMERA_SETUP_SCRIPT}" start "${STREAM_KEY}" "${DEVICE_PATH}" "${WIDTH}" "${HEIGHT}" "${FRAMERATE}"

sleep 3

if systemctl is-active --quiet iot-reap-camera-${STREAM_KEY}; then
    echo "   ✓ Service is running (PID: $(systemctl show iot-reap-camera-${STREAM_KEY} --property=MainPID --value))"
else
    echo "   ✗ Service failed to start"
    echo ""
    echo "   Checking logs for errors:"
    journalctl -u iot-reap-camera-${STREAM_KEY} -n 20 --no-pager
    exit 1
fi

echo ""
echo "   Testing stream availability (this may take 5 seconds)..."
for i in {1..5}; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:8888/${STREAM_KEY}/index.m3u8" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        echo "   ✓ Stream is PUBLISHING and LIVE!"
        echo ""
        echo "   HLS URL: http://${GATEWAY_IP}:8888/${STREAM_KEY}/index.m3u8"
        echo "   WebRTC URL: ws://${GATEWAY_IP}:8889/${STREAM_KEY}/whep"
        exit 0
    fi
    echo "   [Attempt $i/5] HTTP $HTTP_CODE - retrying..."
    sleep 1
done

echo "   ✗ Stream not responding after 5 attempts"
echo ""
echo "   Checking ffmpeg logs:"
journalctl -u iot-reap-camera-${STREAM_KEY} -n 30 --no-pager
exit 1
'

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
echo "  • HLS stream:    curl http://${GATEWAY_IP}:8888/${STREAM_KEY}/index.m3u8"
echo "  • Gateway logs:  ssh root@${GATEWAY_IP} journalctl -u iot-reap-camera-${STREAM_KEY} -f"
echo "  • MediaMTX:      ssh root@${GATEWAY_IP} systemctl status mediamtx"
echo ""
