#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# Camera Format Diagnostics
# ═══════════════════════════════════════════════════════════════════════════════

set -e

echo "=== Camera Format Detection ==="
echo ""

for video_dev in /dev/video*; do
    if [ ! -e "$video_dev" ]; then
        continue
    fi
    
    echo "─────────────────────────────────────────"
    echo "Device: $video_dev"
    echo "─────────────────────────────────────────"
    
    # Get device info
    v4l2-ctl -d "$video_dev" --info 2>/dev/null || echo "Info not available"
    echo ""
    
    # List formats
    echo "Supported formats:"
    v4l2-ctl -d "$video_dev" --list-formats-ext 2>/dev/null | head -30
    echo ""
    
    # Get current format
    echo "Current format:"
    v4l2-ctl -d "$video_dev" --get-fmt-video 2>/dev/null || echo "Format not available"
    echo ""
    
    # Device capabilities
    echo "Capabilities:"
    v4l2-ctl -d "$video_dev" --info 2>/dev/null | grep -i "capabilities" || echo "N/A"
    echo ""
done

echo ""
echo "=== Testing FFmpeg with Different Formats ==="
echo ""
echo "For your camera, try one of these input formats with ffmpeg:"
echo ""
echo "If camera supports MJPEG:"
echo "  ffmpeg -f v4l2 -input_format mjpeg -framerate 15 -video_size 640x480 -i /dev/video0 -..."
echo ""
echo "If camera supports YUYV:"
echo "  ffmpeg -f v4l2 -input_format yuyv422 -framerate 15 -video_size 640x480 -i /dev/video0 -..."
echo ""
echo "If camera supports JPEG:"
echo "  ffmpeg -f v4l2 -input_format jpeg -framerate 15 -video_size 640x480 -i /dev/video0 -..."
echo ""
echo "Raw format (auto-detect):"
echo "  ffmpeg -f v4l2 -framerate 15 -video_size 640x480 -i /dev/video0 -..."
