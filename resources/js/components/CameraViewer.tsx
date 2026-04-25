/**
 * CameraViewer — WebRTC-first video player.
 * Sprint 4 — Camera streaming (low-latency)
 *
 * Uses WebRTC via WHEP proxy (avoids CORS — SDP exchange goes through Laravel).
 * The actual media stream flows directly from MediaMTX to the browser (peer-to-peer).
 */
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

interface CameraViewerProps {
    camera: Camera;
    /** Session ID — needed to build the WHEP proxy URL */
    sessionId: string;
    /** Whether the session is active (streaming only allowed when true) */
    sessionIsActive?: boolean;
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
    sessionIsActive = true,
    resolutions,
    onResolutionChange,
    changingResolution,
}: CameraViewerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const [streamError, setStreamError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const containerRef = useRef<HTMLDivElement>(null);

    // WHEP proxy through Laravel backend — avoids CORS issues with direct MediaMTX access
    const whepProxyUrl = `/sessions/${sessionId}/cameras/${camera.id}/whep`;

    // ─── Cleanup helpers ─────────────────────────────────────
    const cleanupWebRTC = useCallback(() => {
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, []);

    // ─── WebRTC via WHEP (proxied through backend) ────────
    const startWebRTC = useCallback(async (): Promise<
        (() => void) | undefined
    > => {
        const video = videoRef.current;
        if (!video) return undefined;

        cleanupWebRTC();
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
                    console.warn('[CameraViewer] WebRTC connection failed');
                    setStreamError(true);
                    setErrorMessage('WebRTC connection failed');
                    cleanupWebRTC();
                }
            };

            // Create offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            // Wait for ICE gathering to complete before sending the offer.
            const localDescription = await new Promise<RTCSessionDescription>(
                (resolve, reject) => {
                    if (pc.iceGatheringState === 'complete') {
                        resolve(pc.localDescription!);
                        return;
                    }
                    const timeout = setTimeout(() => {
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

            // Send offer to WHEP proxy
            const response = await fetch(whepProxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/sdp',
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

            // Timeout: if no track received within 8s
            const timeout = setTimeout(() => {
                if (!connected) {
                    console.warn('[CameraViewer] WebRTC timeout');
                    setStreamError(true);
                    setErrorMessage('Connection timeout');
                    cleanupWebRTC();
                }
            }, 8000);

            return () => clearTimeout(timeout);
        } catch (error) {
            console.warn('[CameraViewer] WebRTC setup failed:', error);
            setStreamError(true);
            setErrorMessage(
                error instanceof Error ? error.message : 'WebRTC setup failed',
            );
            cleanupWebRTC();
            return undefined;
        }
    }, [whepProxyUrl, cleanupWebRTC]);

    // ─── Start stream ────────────────────────────────────────
    useEffect(() => {
        if (!sessionIsActive) {
            setStreamError(true);
            setIsLoading(false);
            setErrorMessage('Session is not active');
            return;
        }

        if (camera.status !== 'active') {
            setStreamError(true);
            setIsLoading(false);
            setErrorMessage('Camera is not active');
            return;
        }

        let cleanup: (() => void) | undefined;
        const promise = startWebRTC();
        promise.then((fn) => {
            cleanup = fn;
        });

        return () => {
            cleanup?.();
            cleanupWebRTC();
        };
    }, [
        camera.status,
        camera.stream_key,
        sessionIsActive,
        startWebRTC,
        cleanupWebRTC,
    ]);

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

    const isSessionInactive = !sessionIsActive;
    const isCameraInactive = camera.status !== 'active';

    // ─── Stream error state ──────────────────────────────────
    if (streamError) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 bg-muted/50 p-8">
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    {isSessionInactive || isCameraInactive ? (
                        <Video className="h-8 w-8 text-muted-foreground" />
                    ) : (
                        <WifiOff className="h-8 w-8 text-muted-foreground" />
                    )}
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                    {isSessionInactive
                        ? 'Session not active'
                        : isCameraInactive
                          ? 'Camera is inactive'
                          : 'Stream connection failed'}
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
                {sessionIsActive && camera.status === 'active' && (
                    <button
                        onClick={() => {
                            setStreamError(false);
                            setIsLoading(true);
                            startWebRTC();
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
                            Connecting (WebRTC)...
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
            {/* Bottom-left: camera name */}
            <div className="absolute bottom-2 left-2 flex items-center gap-2">
                <div className="rounded bg-black/60 px-2 py-1">
                    <span className="text-xs font-medium text-white">
                        {camera.name}
                    </span>
                </div>
                <div className="rounded bg-green-600/80 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">
                    LIVE
                </div>
                <div className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-gray-300">
                    {resLabel}
                </div>
            </div>
            {/* Top-right: controls */}
            <div className="absolute top-2 right-2 flex items-center gap-1">
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
