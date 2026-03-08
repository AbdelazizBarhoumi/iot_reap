"""Fix camera stream service and enable MediaMTX API."""
import paramiko
import time

PROXMOX_HOST = '192.168.101.1'
PROXMOX_USER = 'root'
PROXMOX_PASS = 'oiokolo;op'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(PROXMOX_HOST, username=PROXMOX_USER, password=PROXMOX_PASS, timeout=10)
print("[OK] Connected to Proxmox node")

def run(cmd, timeout=15):
    print(f"\n--- CMD: {cmd[:100]}... ---" if len(cmd) > 100 else f"\n--- CMD: {cmd} ---")
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    if out: print(out)
    if err: print(f"STDERR: {err}")
    if not out and not err: print("(no output)")
    return out

# 1. Check the start script that's failing
print("\n" + "="*60 + "\n  Step 1: Check the camera stream start script\n" + "="*60)
run("cat /usr/local/bin/start-camera-stream.sh 2>&1")
run("cat /etc/systemd/system/camera-stream.service 2>&1")

# 2. Kill the old orphan ffmpeg and check if video device works
print("\n" + "="*60 + "\n  Step 2: Kill orphan ffmpeg, test video device\n" + "="*60)
run("kill 217099 2>&1; sleep 1; ps aux | grep ffmpeg | grep -v grep || echo 'No more ffmpeg'")
run("v4l2-ctl --list-devices 2>&1")
run("v4l2-ctl -d /dev/video0 --list-formats-ext 2>&1 | head -30")

# 3. Enable MediaMTX API on the gateway container
print("\n" + "="*60 + "\n  Step 3: Enable MediaMTX API\n" + "="*60)
run("pct exec 103 -- sed -i 's/^api: no/api: yes/' /opt/mediamtx.yml 2>&1")
run("pct exec 103 -- grep '^api:' /opt/mediamtx.yml 2>&1")
run("pct exec 103 -- systemctl restart mediamtx 2>&1")
time.sleep(3)
run("pct exec 103 -- systemctl is-active mediamtx 2>&1")
run("pct exec 103 -- curl -s http://127.0.0.1:9997/v3/paths/list 2>&1")

# 4. Start ffmpeg manually on the Proxmox host to push to MediaMTX
print("\n" + "="*60 + "\n  Step 4: Start ffmpeg manually to push stream\n" + "="*60)
ffmpeg_cmd = (
    "nohup ffmpeg -f v4l2 -input_format mjpeg -framerate 15 -video_size 640x480 "
    "-i /dev/video0 "
    "-c:v libx264 -preset ultrafast -tune zerolatency -g 15 "
    "-f rtsp -rtsp_transport tcp "
    "rtsp://192.168.50.6:8554/usb-gateway-2-11 "
    "> /tmp/ffmpeg-camera.log 2>&1 &"
)
run(ffmpeg_cmd)
time.sleep(5)
run("ps aux | grep ffmpeg | grep -v grep")
run("tail -20 /tmp/ffmpeg-camera.log 2>&1")

# 5. Check if the stream is now visible in MediaMTX
print("\n" + "="*60 + "\n  Step 5: Check stream in MediaMTX\n" + "="*60)
run("pct exec 103 -- curl -s http://127.0.0.1:9997/v3/paths/list 2>&1")

# 6. Test HLS and WHEP from inside the container
print("\n" + "="*60 + "\n  Step 6: Test HLS and WHEP endpoints\n" + "="*60)
time.sleep(3)
run("pct exec 103 -- curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8888/usb-gateway-2-11/index.m3u8 2>&1")
run("pct exec 103 -- curl -s -w '\\n%{http_code}' -X POST -H 'Content-Type: application/sdp' -d 'v=0' http://127.0.0.1:8889/usb-gateway-2-11/whep 2>&1")

# 7. Test from the dev machine (externally)
print("\n" + "="*60 + "\n  Step 7: Test from external (dev machine)\n" + "="*60)

ssh.close()
print("\n[DONE]")
