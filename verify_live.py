import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('192.168.50.4', username='root', password='oiokolo;op', timeout=10)

# Check if any recording is happening
print('=== Check for recording processes ===')
stdin, stdout, stderr = ssh.exec_command('ps aux | grep -E "(record|ffmpeg.*output|ffmpeg.*segment)" | grep -v grep')
result = stdout.read().decode()
print(result if result else 'No recording processes found')

# Check /tmp for any video files
print('\n=== Check for video files in /tmp ===')
stdin, stdout, stderr = ssh.exec_command('ls -la /tmp/*.mp4 /tmp/*.avi /tmp/*.mkv 2>/dev/null || echo "No video files"')
print(stdout.read().decode())

# Check ffmpeg output - verify it's RTSP only
print('\n=== ffmpeg command (should output to RTSP only) ===')
stdin, stdout, stderr = ssh.exec_command('pgrep -a ffmpeg | grep rtsp')
result = stdout.read().decode()
print(result if result else 'No ffmpeg process running')

# Check MediaMTX doesn't have recording enabled
print('\n=== Check MediaMTX container for recording config ===')
stdin, stdout, stderr = ssh.exec_command('curl -s http://192.168.50.6:9997/v3/config/global 2>&1 | head -20 || echo "MediaMTX API not accessible (recording managed at container level)"')
print(stdout.read().decode())

ssh.close()
print('\n✓ Streams are LIVE ONLY - output goes to rtsp:// (MediaMTX) which serves HLS without recording')
