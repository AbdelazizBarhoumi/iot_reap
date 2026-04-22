#!/bin/bash
# ────────────────────────────────────────────────────────────────
# IoT-REAP — Gateway Infrastructure Container Setup Script
# ────────────────────────────────────────────────────────────────
# Provisions CT 200 (192.168.50.6) with all required services:
#   • Docker CE               — container runtime
#   • MediaMTX 1.11           — RTSP/HLS/WebRTC proxy (8554/8888/8889)
#   • Frigate NVR 0.14        — AI-powered camera recorder (5000)
#   • CUPS                    — print server (631)
#   • ser2net                 — serial-to-TCP proxy (2001)
#   • avahi-daemon            — mDNS/zero-conf discovery
#
# Usage:  bash bash/gateway-infra-setup.sh
# Tested: Debian 12 (Bookworm) LXC on Proxmox VE 8.x
# ────────────────────────────────────────────────────────────────

set -euo pipefail

# ── Colors ──────────────────────────────────────────────────────
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

LOG="/tmp/gateway-infra-setup.log"

# ── Helpers ─────────────────────────────────────────────────────
info()  { echo -e "${BLUE}[INFO]${NC}  $*"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
err()   { echo -e "${RED}[ERR]${NC}   $*"; exit 1; }

# ── Pre-flight ──────────────────────────────────────────────────
[[ $EUID -ne 0 ]] && err "Run this script as root."

GATEWAY_IP="192.168.50.6"
CURRENT_IP=$(hostname -I | awk '{print $1}')
if [[ "$CURRENT_IP" != "$GATEWAY_IP" ]]; then
    warn "Expected IP ${GATEWAY_IP}, detected ${CURRENT_IP}. Continuing anyway."
fi

info "Logging to ${LOG}"
exec > >(tee -a "$LOG") 2>&1

# ────────────────────────────────────────────────────────────────
# 1. System Update & Base Packages
# ────────────────────────────────────────────────────────────────
info "Updating system packages ..."
apt-get update -qq
apt-get upgrade -y -qq

info "Installing base dependencies ..."
apt-get install -y -qq \
    ca-certificates curl gnupg lsb-release \
    apt-transport-https software-properties-common \
    usbutils usbip jq net-tools

ok "Base packages installed."

# ────────────────────────────────────────────────────────────────
# 2. Docker CE
# ────────────────────────────────────────────────────────────────
if command -v docker &>/dev/null; then
    ok "Docker already installed: $(docker --version)"
else
    info "Installing Docker CE ..."
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/debian/gpg \
        | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
        https://download.docker.com/linux/debian $(lsb_release -cs) stable" \
        | tee /etc/apt/sources.list.d/docker.list > /dev/null

    apt-get update -qq
    apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin

    systemctl enable --now docker
    ok "Docker CE installed."
fi

# ────────────────────────────────────────────────────────────────
# 3. MediaMTX (RTSP / HLS / WebRTC proxy)
# ────────────────────────────────────────────────────────────────
MEDIAMTX_VERSION="1.11.3"
MEDIAMTX_DIR="/opt/mediamtx"

if [[ -f "${MEDIAMTX_DIR}/mediamtx" ]]; then
    ok "MediaMTX already installed at ${MEDIAMTX_DIR}."
else
    info "Installing MediaMTX ${MEDIAMTX_VERSION} ..."
    mkdir -p "${MEDIAMTX_DIR}"

    ARCH=$(dpkg --print-architecture)
    case "$ARCH" in
        amd64) MTX_ARCH="linux_amd64" ;;
        arm64) MTX_ARCH="linux_arm64v8" ;;
        armhf) MTX_ARCH="linux_armv7" ;;
        *)     err "Unsupported architecture: ${ARCH}" ;;
    esac

    curl -fsSL \
        "https://github.com/bluenviron/mediamtx/releases/download/v${MEDIAMTX_VERSION}/mediamtx_v${MEDIAMTX_VERSION}_${MTX_ARCH}.tar.gz" \
        | tar -xz -C "${MEDIAMTX_DIR}"

    ok "MediaMTX extracted to ${MEDIAMTX_DIR}."
fi

# Configure MediaMTX
cat > "${MEDIAMTX_DIR}/mediamtx.yml" <<'EOF'
# MediaMTX configuration — IoT-REAP gateway
logLevel: info
logDestinations: [stdout]

api: yes
apiAddress: :9997

rtsp: yes
rtspAddress: :8554

hls: yes
hlsAddress: :8888
hlsAlwaysRemux: yes

webrtc: yes
webrtcAddress: :8889
webrtcICEServers2: []
# Allow CORS from any origin so browsers can use WHEP directly if needed.
# The primary flow uses a Laravel WHEP proxy, but this allows direct access too.
webrtcAllowOrigin: "*"

paths:
  all_others:
EOF

# systemd unit
cat > /etc/systemd/system/mediamtx.service <<EOF
[Unit]
Description=MediaMTX RTSP/HLS/WebRTC Proxy
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=${MEDIAMTX_DIR}
ExecStart=${MEDIAMTX_DIR}/mediamtx ${MEDIAMTX_DIR}/mediamtx.yml
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now mediamtx
ok "MediaMTX service running on ports 8554/8888/8889."

# ────────────────────────────────────────────────────────────────
# 3b. Camera Management API and Capture Services
# ────────────────────────────────────────────────────────────────
CAMERA_SETUP_SCRIPT=""
if [[ -f /app/bash/setup-proxmox-camera-streaming.sh ]]; then
    CAMERA_SETUP_SCRIPT="/app/bash/setup-proxmox-camera-streaming.sh"
elif [[ -f /etc/iot-reap/setup-proxmox-camera-streaming.sh ]]; then
    CAMERA_SETUP_SCRIPT="/etc/iot-reap/setup-proxmox-camera-streaming.sh"
fi

if [[ -n "${CAMERA_SETUP_SCRIPT}" ]]; then
    info "Installing camera management API and capture tooling ..."
    bash "${CAMERA_SETUP_SCRIPT}" install
    ok "Camera management API installed."
else
    warn "Camera streaming installer not found at /app/bash/setup-proxmox-camera-streaming.sh or /etc/iot-reap/setup-proxmox-camera-streaming.sh"
fi

# ────────────────────────────────────────────────────────────────
# 4. Frigate NVR (Docker)
# ────────────────────────────────────────────────────────────────
FRIGATE_DIR="/opt/frigate"
mkdir -p "${FRIGATE_DIR}/config" "${FRIGATE_DIR}/storage"

if ! docker ps -a --format '{{.Names}}' | grep -q '^frigate$'; then
    info "Deploying Frigate NVR container ..."

    cat > "${FRIGATE_DIR}/config/config.yml" <<'FRIGCFG'
# Frigate NVR — IoT-REAP configuration
mqtt:
  enabled: false  # Enable once Mosquitto is configured

detectors:
  cpu1:
    type: cpu

cameras: {}
  # Add camera entries as they are registered:
  # camera_1:
  #   ffmpeg:
  #     inputs:
  #       - path: rtsp://192.168.50.6:8554/robot-1-cam
  #         roles: [detect, record]
  #   detect:
  #     width: 1280
  #     height: 720
  #     fps: 5
FRIGCFG

    docker run -d \
        --name frigate \
        --restart unless-stopped \
        --shm-size=256mb \
        -p 5000:5000 \
        -p 8971:8971 \
        -v "${FRIGATE_DIR}/config:/config" \
        -v "${FRIGATE_DIR}/storage:/media/frigate" \
        -v /etc/localtime:/etc/localtime:ro \
        ghcr.io/blakeblackshear/frigate:0.14.1

    ok "Frigate NVR running on port 5000."
else
    ok "Frigate container already exists."
fi

# ────────────────────────────────────────────────────────────────
# 5. CUPS — Print Server
# ────────────────────────────────────────────────────────────────
if dpkg -s cups &>/dev/null; then
    ok "CUPS already installed."
else
    info "Installing CUPS print server ..."
    apt-get install -y -qq cups

    # Allow remote admin and printing from lab network
    sed -i 's/^Listen localhost:631/Listen 0.0.0.0:631/' /etc/cups/cupsd.conf
    sed -i '/<Location \/>/,/<\/Location>/ s/Order allow,deny/Order allow,deny\n  Allow from 192.168.50.0\/24/' \
        /etc/cups/cupsd.conf
    sed -i '/<Location \/admin>/,/<\/Location>/ s/Order allow,deny/Order allow,deny\n  Allow from 192.168.50.0\/24/' \
        /etc/cups/cupsd.conf

    systemctl enable --now cups
    ok "CUPS running on port 631."
fi

# ────────────────────────────────────────────────────────────────
# 6. ser2net — Serial Port to TCP Proxy
# ────────────────────────────────────────────────────────────────
if dpkg -s ser2net &>/dev/null; then
    ok "ser2net already installed."
else
    info "Installing ser2net ..."
    apt-get install -y -qq ser2net

    # Default config — devices are added when physically connected
    mkdir -p /etc/ser2net
    cat > /etc/ser2net/ser2net.yaml <<'EOF'
# ser2net — IoT-REAP serial device mapping
# Devices are added dynamically; example entry:
#
# connection: &ttyUSB0
#   accepter: tcp,2001
#   connector: serialdev,/dev/ttyUSB0,115200n81,local
#   options:
#     kickolduser: true
EOF

    systemctl enable --now ser2net
    ok "ser2net running (default port 2001)."
fi

# ────────────────────────────────────────────────────────────────
# 7. Avahi — mDNS / Zero-conf Discovery
# ────────────────────────────────────────────────────────────────
if dpkg -s avahi-daemon &>/dev/null; then
    ok "avahi-daemon already installed."
else
    info "Installing avahi-daemon ..."
    apt-get install -y -qq avahi-daemon avahi-utils libnss-mdns

    # Publish IoT-REAP gateway services
    cat > /etc/avahi/services/iot-reap-gateway.service <<'EOF'
<?xml version="1.0" standalone='no'?>
<!DOCTYPE service-group SYSTEM "avahi-service.dtd">
<service-group>
  <name>IoT-REAP Gateway</name>
  <service>
    <type>_rtsp._tcp</type>
    <port>8554</port>
    <txt-record>description=MediaMTX RTSP Proxy</txt-record>
  </service>
  <service>
    <type>_http._tcp</type>
    <port>5000</port>
    <txt-record>description=Frigate NVR</txt-record>
  </service>
  <service>
    <type>_ipp._tcp</type>
    <port>631</port>
    <txt-record>description=CUPS Print Server</txt-record>
  </service>
</service-group>
EOF

    systemctl enable --now avahi-daemon
    ok "avahi-daemon running with IoT-REAP service records."
fi

# ────────────────────────────────────────────────────────────────
# 8. Firewall (ufw) — Allow Required Ports
# ────────────────────────────────────────────────────────────────
if command -v ufw &>/dev/null; then
    info "Configuring UFW rules ..."
    ufw allow 8554/tcp comment "MediaMTX RTSP"
    ufw allow 8888/tcp comment "MediaMTX HLS"
    ufw allow 8889/tcp comment "MediaMTX WebRTC"
    ufw allow 5000/tcp comment "Frigate NVR"
    ufw allow 631/tcp  comment "CUPS"
    ufw allow 2001/tcp comment "ser2net"
    ufw allow 5353/udp comment "Avahi mDNS"
    ok "Firewall rules applied."
else
    warn "ufw not installed — skipping firewall configuration."
fi

# ────────────────────────────────────────────────────────────────
# 9. Health Check
# ────────────────────────────────────────────────────────────────
echo ""
info "Running service health checks ..."
echo "─────────────────────────────────────────"

check_service() {
    local name="$1" unit="$2"
    if systemctl is-active --quiet "$unit" 2>/dev/null; then
        echo -e "  ${GREEN}✓${NC} ${name} (${unit})"
    else
        echo -e "  ${RED}✗${NC} ${name} (${unit}) — NOT RUNNING"
    fi
}

check_docker() {
    local name="$1" container="$2"
    if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
        echo -e "  ${GREEN}✓${NC} ${name} (docker: ${container})"
    else
        echo -e "  ${RED}✗${NC} ${name} (docker: ${container}) — NOT RUNNING"
    fi
}

check_service "Docker"       "docker"
check_service "MediaMTX"     "mediamtx"
check_docker  "Frigate NVR"  "frigate"
check_service "CUPS"         "cups"
check_service "ser2net"      "ser2net"
check_service "Avahi"        "avahi-daemon"

echo "─────────────────────────────────────────"
echo ""
ok "Gateway infrastructure setup complete!"
info "Container IP: ${GATEWAY_IP}"
info "Ports: MediaMTX(8554/8888/8889), Frigate(5000), CUPS(631), ser2net(2001)"
