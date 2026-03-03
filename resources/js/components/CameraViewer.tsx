/**
 * CameraViewer — HLS/WebRTC video player for a camera stream.
 * Sprint 4 — Camera streaming
 *
 * For now, shows the HLS stream URL in a native <video> element.
 * When a real MediaMTX server is running, the HLS stream will play natively.
 * In development (no actual stream), shows a placeholder with stream info.
 */

import { Video, WifiOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Camera } from '@/types/camera.types';

interface CameraViewerProps {
  camera: Camera;
}

export function CameraViewer({ camera }: CameraViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamError, setStreamError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const hlsUrl = camera.stream_urls.hls;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.src = hlsUrl;
    video.load();

    const handleCanPlay = () => {
      setIsLoading(false);
      setStreamError(false);
    };

    const handleError = () => {
      setIsLoading(false);
      setStreamError(true);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    // After 5 seconds we assume stream failed and show placeholder.
    const timeout = setTimeout(() => {
      setIsLoading(false);
      setStreamError(true);
    }, 5000);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      clearTimeout(timeout);
    };
  }, [hlsUrl]);

  // Stream unavailable placeholder
  if (streamError) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 bg-muted/50 p-8">
        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          {camera.status === 'active' ? (
            <WifiOff className="h-8 w-8 text-muted-foreground" />
          ) : (
            <Video className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          {camera.status === 'active'
            ? 'Stream connecting…'
            : 'Camera is inactive'}
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          {camera.name} — {camera.stream_key}
        </p>
        <code className="mt-2 rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
          {hlsUrl}
        </code>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-lg bg-black">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            <p className="text-xs text-muted-foreground">Loading stream…</p>
          </div>
        </div>
      )}
      <video
        ref={videoRef}
        className="h-full w-full object-contain"
        autoPlay
        muted
        playsInline
        controls
        style={{ minHeight: '240px', maxHeight: '480px' }}
      />
      {/* Overlay: camera name */}
      <div className="absolute left-2 top-2 rounded bg-black/60 px-2 py-1">
        <span className="text-xs font-medium text-white">{camera.name}</span>
      </div>
    </div>
  );
}
