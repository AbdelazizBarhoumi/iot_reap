/**
 * CameraViewer — WebRTC-first video player with HLS fallback.
 * Sprint 4 — Camera streaming (low-latency)
 *
 * Priority order:
 * 1. WebRTC via WHEP proxy (avoids CORS — SDP exchange goes through Laravel)
 * 2. HLS.js fallback (4-15s latency, broad compatibility)
 *
 * The WHEP proxy route: POST /sessions/{sessionId}/cameras/{cameraId}/whep
 * forwards the SDP offer to MediaMTX and returns the SDP answer.
 * The actual media stream flows directly from MediaMTX to the browser (peer-to-peer).
 */
import Hls from 'hls.js';
import {
    AlertCircle,
    Maximize2,
    Minimize2,
    Settings,
    Video,
    WifiOff,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Camera, CameraResolutionPreset } from '@/types/camera.types';
type StreamMode = 'webrtc' | 'hls';
interface CameraViewerProps {
    camera: Camera;
    /** Session ID — needed to build the WHEP proxy URL */
    sessionId: string;
    /** Available resolution presets from API */
    resolutions?: CameraResolutionPreset[];
    /** Called when user picks a new resolution */
    onResolutionChange?: (preset: CameraResolutionPreset | 'auto') => void;
    /** Whether resolution change is in progress */
    changingResolution?: boolean;
}
export function CameraViewer({
    camera,
    sessionId,
    resolutions,
    onResolutionChange,
    changingResolution,
}: CameraViewerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const [mode, setMode] = useState<StreamMode>('webrtc');
    const [streamError, setStreamError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const containerRef = useRef<HTMLDivElement>(null);
    // Use proxied URLs to avoid CORS/network issues with direct gateway access
    // HLS proxy goes through Laravel backend
    const hlsUrl = `/sessions/${sessionId}/cameras/${camera.id}/hls`;
    // WHEP proxy through Laravel backend — avoids CORS issues with direct MediaMTX access
    const whepProxyUrl = `/sessions/${sessionId}/cameras/${camera.id}/whep`;
    // ─── Cleanup helpers ─────────────────────────────────────
    const cleanupWebRTC = useCallback(() => {
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }
    }, []);
    const cleanupHLS = useCallback(() => {
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }
    }, []);
    // ─── WebRTC via WHEP (proxied through backend) ────────
    const startWebRTC = useCallback(async (): Promise<
        (() => void) | undefined
    > => {
        const video = videoRef.current;
        if (!video) return undefined;
        cleanupWebRTC();
        cleanupHLS();
        setIsLoading(true);
        setStreamError(false);
        setErrorMessage('');
        try {
            const pc = new RTCPeerConnection({
                iceServers: [], // MediaMTX on LAN — no STUN needed
            });
            pcRef.current = pc;
            // MediaMTX sends video+audio; we only need to receive
            pc.addTransceiver('video', { direction: 'recvonly' });
            pc.addTransceiver('audio', { direction: 'recvonly' });
            let connected = false;
            pc.ontrack = (event) => {
                if (event.streams.length > 0) {
                    video.srcObject = event.streams[0];
                    video.play().catch(() => {
                        // Autoplay blocked — user must interact
                    });
                    connected = true;
                    setIsLoading(false);
                    setStreamError(false);
                }
            };
            pc.oniceconnectionstatechange = () => {
                if (
                    pc.iceConnectionState === 'failed' ||
                    pc.iceConnectionState === 'disconnected'
                ) {
                    // WebRTC failed — fall back to HLS
                    console.warn(
                        '[CameraViewer] WebRTC connection failed, falling back to HLS',
                    );
                    cleanupWebRTC();
                    setMode('hls');
                }
            };
            // Create offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            // Wait for ICE gathering to complete before sending the offer.
            // With iceServers: [] (no STUN), this should complete almost instantly
            // since only host candidates are gathered.
            const localDescription = await new Promise<RTCSessionDescription>(
                (resolve, reject) => {
                    if (pc.iceGatheringState === 'complete') {
                        resolve(pc.localDescription!);
                        return;
                    }
                    const timeout = setTimeout(() => {
                        // Proceed with whatever we have after 2s
                        if (pc.localDescription) {
                            resolve(pc.localDescription);
                        } else {
                            reject(new Error('ICE gathering timed out'));
                        }
                    }, 2000);
                    pc.onicegatheringstatechange = () => {
                        if (pc.iceGatheringState === 'complete') {
                            clearTimeout(timeout);
                            resolve(pc.localDescription!);
                        }
                    };
                },
            );
            // Send offer to WHEP proxy (same-origin, no CORS issues)
            // The proxy forwards it to MediaMTX and returns the SDP answer
            const response = await fetch(whepProxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/sdp',
                    // Include CSRF token for Laravel
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '',
                    ),
                    Accept: 'application/sdp',
                },
                body: localDescription.sdp,
                credentials: 'same-origin',
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(
                    `WHEP proxy failed: ${response.status} — ${errorText}`,
                );
            }
            const answerSdp = await response.text();
            await pc.setRemoteDescription(
                new RTCSessionDescription({ type: 'answer', sdp: answerSdp }),
            );
            // Timeout: if no track received within 8s, fallback
            const timeout = setTimeout(() => {
                if (!connected) {
                    console.warn(
                        '[CameraViewer] WebRTC timeout, falling back to HLS',
                    );
                    cleanupWebRTC();
                    setMode('hls');
                }
            }, 8000);
            return () => clearTimeout(timeout);
        } catch (error) {
            console.warn('[CameraViewer] WebRTC setup failed:', error);
            cleanupWebRTC();
            setMode('hls');
            return undefined;
        }
    }, [whepProxyUrl, cleanupWebRTC, cleanupHLS]);
    // ─── HLS fallback ───────────────────────────────────────
    const startHLS = useCallback((): (() => void) | undefined => {
        const video = videoRef.current;
        if (!video) return undefined;
        cleanupWebRTC();
        cleanupHLS();
        setIsLoading(true);
        setStreamError(false);
        setErrorMessage('');
        let connected = false;
        const handleCanPlay = () => {
            connected = true;
            setIsLoading(false);
            setStreamError(false);
        };
        const handleError = () => {
            setIsLoading(false);
            setStreamError(true);
            setErrorMessage('Stream unavailable — camera may be offline');
        };
        if (Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                // Reduce HLS latency as much as possible
                liveSyncDurationCount: 1,
                liveMaxLatencyDurationCount: 3,
                liveDurationInfinity: true,
                // Include credentials for Laravel session auth
                xhrSetup: (xhr, _url) => {
                    xhr.withCredentials = true;
                    // Add XSRF token for Laravel CSRF protection
                    const xsrfToken =
                        document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1];
                    if (xsrfToken) {
                        xhr.setRequestHeader(
                            'X-XSRF-TOKEN',
                            decodeURIComponent(xsrfToken),
                        );
                    }
                },
            });
            hlsRef.current = hls;
            hls.loadSource(hlsUrl);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log(
                    '[CameraViewer] HLS manifest parsed, starting playback',
                );
                video.play().catch((e) => {
                    console.warn('[CameraViewer] Autoplay blocked:', e.message);
                });
            });
            hls.on(Hls.Events.FRAG_LOADED, () => {
                if (!connected) {
                    console.log('[CameraViewer] HLS first fragment loaded');
                }
            });
            hls.on(Hls.Events.ERROR, (_event, data) => {
                console.error(
                    '[CameraViewer] HLS error:',
                    data.type,
                    data.details,
                    data.fatal ? '(fatal)' : '',
                );
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.log(
                                '[CameraViewer] Attempting to recover from network error',
                            );
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.log(
                                '[CameraViewer] Attempting to recover from media error',
                            );
                            hls.recoverMediaError();
                            break;
                        default:
                            handleError();
                            break;
                    }
                }
            });
            video.addEventListener('canplay', handleCanPlay);
            video.addEventListener('error', handleError);
            const timeout = setTimeout(() => {
                if (!connected) handleError();
            }, 15000);
            return () => {
                hls.destroy();
                hlsRef.current = null;
                video.removeEventListener('canplay', handleCanPlay);
                video.removeEventListener('error', handleError);
                clearTimeout(timeout);
            };
        }
        // Safari: native HLS
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = hlsUrl;
            video.load();
            video.addEventListener('canplay', handleCanPlay);
            video.addEventListener('error', handleError);
            const timeout = setTimeout(() => {
                if (!connected) handleError();
            }, 15000);
            return () => {
                video.removeEventListener('canplay', handleCanPlay);
                video.removeEventListener('error', handleError);
                clearTimeout(timeout);
            };
        }
        handleError();
        setErrorMessage('Browser does not support video playback');
        return undefined;
    }, [hlsUrl, cleanupWebRTC, cleanupHLS]);
    // ─── Start stream based on mode ──────────────────────────
    useEffect(() => {
        if (camera.status !== 'active') {
            setStreamError(true);
            setIsLoading(false);
            setErrorMessage('Camera is not active');
            return;
        }
        let cleanup: (() => void) | undefined;
        if (mode === 'webrtc') {
            // startWebRTC is async
            const promise = startWebRTC();
            promise.then((fn) => {
                cleanup = fn;
            });
        } else {
            cleanup = startHLS();
        }
        return () => {
            cleanup?.();
            cleanupWebRTC();
            cleanupHLS();
        };
    }, [mode, camera.status, camera.stream_key, startWebRTC, startHLS, cleanupWebRTC, cleanupHLS]);
    // ─── Fullscreen toggle ───────────────────────────────────
    const toggleFullscreen = useCallback(() => {
        if (!containerRef.current) return;
        if (document.fullscreenElement) {
            document.exitFullscreen();
            setIsFullscreen(false);
        } else {
            containerRef.current.requestFullscreen();
            setIsFullscreen(true);
        }
    }, []);
    // ─── Resolution label ────────────────────────────────────
    const currentRes = camera.stream_settings;
    const resLabel = `${currentRes.width}x${currentRes.height}@${currentRes.framerate}fps`;
    // ─── Stream error state ──────────────────────────────────
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
                        ? 'Stream connecting...'
                        : 'Camera is inactive'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                    {camera.name} — {resLabel}
                </p>
                {errorMessage && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-destructive">
                        <AlertCircle className="h-3 w-3" />
                        {errorMessage}
                    </p>
                )}
                {camera.status === 'active' && (
                    <button
                        onClick={() => {
                            setStreamError(false);
                            setIsLoading(true);
                            setMode('webrtc');
                        }}
                        className="mt-3 rounded bg-primary px-3 py-1 text-xs text-primary-foreground hover:bg-primary/80"
                    >
                        Retry
                    </button>
                )}
            </div>
        );
    }
    return (
        <div
            ref={containerRef}
            className="relative overflow-hidden rounded-lg bg-black"
        >
            {/* Loading overlay */}
            {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80">
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                        <p className="text-xs text-muted-foreground">
                            {mode === 'webrtc'
                                ? 'Connecting (WebRTC)...'
                                : 'Buffering (HLS)...'}
                        </p>
                    </div>
                </div>
            )}
            {/* Resolution change overlay */}
            {changingResolution && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80">
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
                        <p className="text-xs text-blue-400">
                            Changing resolution...
                        </p>
                    </div>
                </div>
            )}
            {/* Video element */}
            <video
                ref={videoRef}
                className="h-full w-full object-contain"
                autoPlay
                muted
                playsInline
                controls
                style={{ minHeight: '240px', maxHeight: '720px' }}
            />
            {/* Bottom-left: camera name + mode badge */}
            <div className="absolute bottom-2 left-2 flex items-center gap-2">
                <div className="rounded bg-black/60 px-2 py-1">
                    <span className="text-xs font-medium text-white">
                        {camera.name}
                    </span>
                </div>
                <div
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                        mode === 'webrtc'
                            ? 'bg-green-600/80 text-white'
                            : 'bg-yellow-600/80 text-white'
                    }`}
                >
                    {mode === 'webrtc' ? 'LIVE' : 'HLS'}
                </div>
                <div className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-gray-300">
                    {resLabel}
                </div>
            </div>
            {/* Top-right: controls */}
            <div className="absolute top-2 right-2 flex items-center gap-1">
                {/* Stream mode toggle */}
                <button
                    onClick={() =>
                        setMode(mode === 'webrtc' ? 'hls' : 'webrtc')
                    }
                    title={
                        mode === 'webrtc'
                            ? 'Switch to HLS (higher latency)'
                            : 'Switch to WebRTC (lower latency)'
                    }
                    className="rounded bg-black/60 p-1.5 text-white/80 hover:bg-black/80 hover:text-white"
                >
                    <span className="text-[10px] font-bold">
                        {mode === 'webrtc' ? 'HLS' : 'RTC'}
                    </span>
                </button>
                {/* Resolution settings */}
                {resolutions &&
                    resolutions.length > 0 &&
                    onResolutionChange && (
                        <div className="relative">
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="rounded bg-black/60 p-1.5 text-white/80 hover:bg-black/80 hover:text-white"
                                title="Stream quality"
                            >
                                <Settings className="h-3.5 w-3.5" />
                            </button>
                            {showSettings && (
                                <div className="absolute top-full right-0 z-30 mt-1 w-48 rounded-md bg-gray-900/95 p-1 shadow-xl">
                                    <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase">
                                        Quality
                                    </div>
                                    {/* Auto option */}
                                    <button
                                        onClick={() => {
                                            onResolutionChange('auto');
                                            setShowSettings(false);
                                        }}
                                        className="flex w-full items-center justify-between rounded px-2 py-1.5 text-xs text-white hover:bg-white/10"
                                    >
                                        <span>Auto</span>
                                        <span className="text-[10px] text-gray-400">
                                            Best for your connection
                                        </span>
                                    </button>
                                    {/* Manual presets */}
                                    {resolutions.map((preset) => {
                                        const isCurrent =
                                            preset.width === currentRes.width &&
                                            preset.height === currentRes.height;
                                        return (
                                            <button
                                                key={`${preset.width}x${preset.height}`}
                                                onClick={() => {
                                                    onResolutionChange(preset);
                                                    setShowSettings(false);
                                                }}
                                                className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-xs hover:bg-white/10 ${
                                                    isCurrent
                                                        ? 'text-blue-400'
                                                        : 'text-white'
                                                }`}
                                            >
                                                <span>
                                                    {preset.label}
                                                    {isCurrent && ' (current)'}
                                                </span>
                                                <span className="text-[10px] text-gray-400">
                                                    {
                                                        preset.recommended_framerate
                                                    }
                                                    fps
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                {/* Fullscreen */}
                <button
                    onClick={toggleFullscreen}
                    className="rounded bg-black/60 p-1.5 text-white/80 hover:bg-black/80 hover:text-white"
                    title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                >
                    {isFullscreen ? (
                        <Minimize2 className="h-3.5 w-3.5" />
                    ) : (
                        <Maximize2 className="h-3.5 w-3.5" />
                    )}
                </button>
            </div>
        </div>
    );
}


