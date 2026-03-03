    #!/bin/bash
    set -e

    echo "=== Fixing Locale ==="
    apt install -y locales
    locale-gen en_US.UTF-8
    update-locale LANG=en_US.UTF-8
    echo 'LC_ALL=en_US.UTF-8' >> /etc/environment
    export LC_ALL=en_US.UTF-8
    export LANG=en_US.UTF-8

    echo "=== System Update ==="
    apt update && apt upgrade -y
    apt install usbutils -y
    apt install python3-venv python3-full -y
    python3 -m venv /opt/fastapi-env
    pip3 install fastapi uvicorn --break-system-packages
    echo "=== Installing Base Packages ==="
    apt install -y curl wget git nano net-tools \
    usbip \
    cups cups-client cups-filters \
    ser2net \
    avahi-daemon \
    python3 python3-pip python3-venv \
    build-essential ca-certificates gnupg \
    ffmpeg

    echo "=== Creating usbipd Service ==="
    tee /etc/systemd/system/usbipd.service > /dev/null <<EOF
    [Unit]
    Description=USB/IP Daemon
    After=network.target

    [Service]
    Type=forking
    ExecStart=/usr/sbin/usbipd --daemon
    Restart=on-failure
    RestartSec=5
    User=root

    [Install]
    WantedBy=multi-user.target
    EOF

    echo "=== Configuring ser2net ==="
    tee /etc/ser2net.yaml > /dev/null <<EOF
    connection: &con1
    accepter: tcp,2001
    enable: on
    options:
        kickolduser: true
    connector: serialdev,/dev/ttyUSB0,9600n81,local
    EOF

    echo "=== Configuring CUPS ==="
    cupsctl --remote-admin --remote-any --share-printers

    echo "=== Enabling All Services ==="
    systemctl daemon-reload
    systemctl enable usbipd cups ser2net avahi-daemon
    systemctl start usbipd cups ser2net avahi-daemon

    echo "=== Installing Docker ==="
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker

    echo "=== Installing MediaMTX ==="
    cd /opt
    MEDIAMTX_VERSION="v1.9.3"
    wget -q https://github.com/bluenviron/mediamtx/releases/download/${MEDIAMTX_VERSION}/mediamtx_${MEDIAMTX_VERSION}_linux_amd64.tar.gz
    tar -xzf mediamtx_${MEDIAMTX_VERSION}_linux_amd64.tar.gz
    rm mediamtx_${MEDIAMTX_VERSION}_linux_amd64.tar.gz

    tee /etc/systemd/system/mediamtx.service > /dev/null <<EOF
    [Unit]
    Description=MediaMTX RTSP Server
    After=network.target

    [Service]
    ExecStart=/opt/mediamtx /opt/mediamtx.yml
    Restart=always
    RestartSec=5
    User=root

    [Install]
    WantedBy=multi-user.target
    EOF

    systemctl daemon-reload
    systemctl enable mediamtx
    systemctl start mediamtx

    echo "=== Installing Frigate ==="
    mkdir -p /opt/frigate/config /opt/frigate/storage

    tee /opt/frigate/config/config.yml > /dev/null <<EOF
    mqtt:
    enabled: false

    cameras:
    cam1:
        ffmpeg:
        inputs:
            - path: rtsp://localhost:8554/cam1
            roles:
                - detect
                - record
        detect:
        width: 1280
        height: 720
        fps: 5
        record:
        enabled: true
        retain:
            days: 7
    EOF

    docker run -d \
    --name frigate \
    --restart unless-stopped \
    --shm-size=64m \
    -v /opt/frigate/config:/config \
    -v /opt/frigate/storage:/media/frigate \
    -p 5000:5000 \
    -p 1935:1935 \
    ghcr.io/blakeblackshear/frigate:stable

    tee /root/agent.py > /dev/null <<'EOF'
    from fastapi import FastAPI, HTTPException
    from pydantic import BaseModel
    import subprocess
    import re

    app = FastAPI()

    # ── List all local USB devices ──────────────────────
    @app.get("/devices")
    def list_devices():
        result = subprocess.run(
            ["usbip", "list", "-l"],
            capture_output=True, text=True
        )
        devices = []
        current = {}
        for line in result.stdout.splitlines():
            busid_match = re.match(r'\s*-\s+busid\s+(\S+)\s+\((\w+):(\w+)\)', line)
            name_match  = re.match(r'\s+(\S.*)', line)
            if busid_match:
                if current:
                    devices.append(current)
                current = {
                    "busid":     busid_match.group(1),
                    "vendor_id": busid_match.group(2),
                    "product_id":busid_match.group(3),
                    "name":      ""
                }
            elif name_match and current:
                current["name"] = name_match.group(1).strip()
        if current:
            devices.append(current)
        return {"devices": devices}

    # ── List exported/shared devices ────────────────────
    @app.get("/devices/exported")
    def list_exported():
        result = subprocess.run(
            ["usbip", "list", "-l"],
            capture_output=True, text=True
        )
        return {"output": result.stdout}

    # ── Bind a device (start sharing it) ────────────────
    class BusidRequest(BaseModel):
        busid: str

    @app.post("/bind")
    def bind_device(req: BusidRequest):
        result = subprocess.run(
            ["usbip", "bind", "-b", req.busid],
            capture_output=True, text=True
        )
        if result.returncode != 0:
            raise HTTPException(status_code=400, detail=result.stderr)
        return {"status": "bound", "busid": req.busid}

    # ── Unbind a device (stop sharing it) ───────────────
    @app.post("/unbind")
    def unbind_device(req: BusidRequest):
        result = subprocess.run(
            ["usbip", "unbind", "-b", req.busid],
            capture_output=True, text=True
        )
        if result.returncode != 0:
            raise HTTPException(status_code=400, detail=result.stderr)
        return {"status": "unbound", "busid": req.busid}

    # ── Attach a remote device (client side) ────────────
    class AttachRequest(BaseModel):
        server_ip: str
        busid: str

    @app.post("/attach")
    def attach_device(req: AttachRequest):
        result = subprocess.run(
            ["usbip", "attach", "-r", req.server_ip, "-b", req.busid],
            capture_output=True, text=True
        )
        if result.returncode != 0:
            raise HTTPException(status_code=400, detail=result.stderr)
        return {"status": "attached", "busid": req.busid}

    # ── Detach a device ──────────────────────────────────
    class DetachRequest(BaseModel):
        port: str

    @app.post("/detach")
    def detach_device(req: DetachRequest):
        result = subprocess.run(
            ["usbip", "detach", "-p", req.port],
            capture_output=True, text=True
        )
        if result.returncode != 0:
            raise HTTPException(status_code=400, detail=result.stderr)
        return {"status": "detached", "port": req.port}

    # ── List currently attached ports ───────────────────
    @app.get("/ports")
    def list_ports():
        result = subprocess.run(
            ["usbip", "port"],
            capture_output=True, text=True
        )
        return {"output": result.stdout}

    # ── Health check ─────────────────────────────────────
    @app.get("/health")
    def health():
        return {"status": "ok"}

    EOF
    tee /etc/systemd/system/gateway-agent.service > /dev/null <<EOF
    [Unit]
    Description=Hardware Gateway REST Agent
    After=network.target

    [Service]
    ExecStart=/usr/bin/python3 -m uvicorn agent:app --host 0.0.0.0 --port 8000
    WorkingDirectory=/root
    Restart=always
    RestartSec=5
    User=root

    [Install]
    WantedBy=multi-user.target
    EOF

    systemctl daemon-reload
    systemctl enable gateway-agent
    systemctl start gateway-agent

    echo "=== Verifying All Services ==="
    echo ""
    echo "--- usbipd ---"
    systemctl is-active usbipd
    echo "--- cups ---"
    systemctl is-active cups
    echo "--- ser2net ---"
    systemctl is-active ser2net
    echo "--- avahi ---"
    systemctl is-active avahi-daemon
    echo "--- mediamtx ---"
    systemctl is-active mediamtx
    echo "--- docker/frigate ---"
    docker ps --format "table {{.Names}}\t{{.Status}}"

    echo ""
    echo "================================================"
    echo "  DONE — Hardware Gateway is ready"
    echo "================================================"
    echo ""
    echo "  CUPS Web UI     → http://$(hostname -I | awk '{print $1}'):631"
    echo "  Frigate UI      → http://$(hostname -I | awk '{print $1}'):5000"
    echo "  RTSP Streams    → rtsp://$(hostname -I | awk '{print $1}'):8554/STREAM-NAME"
    echo "  USB/IP Port     → $(hostname -I | awk '{print $1}'):3240"
    echo "  ser2net Port    → $(hostname -I | awk '{print $1}'):2001"
    echo ""