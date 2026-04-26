/**
 * VideoPlayer Component
 * Professional video player with HLS.js support, playback controls,
 * quality selection, speed controls, and caption support.
 */
import { motion, AnimatePresence } from 'framer-motion';
import Hls from 'hls.js';
import {
    AlertCircle,
    Captions,
    CaptionsOff,
    Check,
    Loader2,
    Maximize,
    Minimize,
    Pause,
    Play,
    Settings,
    Volume2,
    VolumeX,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';

interface Caption {
    label: string;
    srclang: string;
    src: string;
}

interface VideoPlayerProps {
    src: string;
    poster?: string;
    title?: string;
    captions?: Caption[];
    autoPlay?: boolean;
    onProgress?: (progress: number, duration: number) => void;
    onComplete?: () => void;
    initialTime?: number;
    className?: string;
}

const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

interface QualityOption {
    bitrate: number;
    height: number;
    label: string;
    levelIndex: number;
    width: number;
}

function formatTime(seconds: number): string {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatQualityLabel(height?: number, width?: number): string {
    if (height && height > 0) {
        return `${height}p`;
    }

    if (width && width > 0) {
        return `${width}w`;
    }

    return 'Unknown';
}

function buildQualityOptions(
    levels: Array<{
        bitrate?: number;
        height?: number;
        width?: number;
    }>,
): QualityOption[] {
    return levels
        .map((level, index) => ({
            bitrate: level.bitrate ?? 0,
            height: level.height ?? 0,
            label: formatQualityLabel(level.height, level.width),
            levelIndex: index,
            width: level.width ?? 0,
        }))
        .sort(
            (a, b) =>
                b.height - a.height ||
                b.width - a.width ||
                b.bitrate - a.bitrate,
        );
}

const getYouTubeId = (url: string) => {
    const trimmedUrl = url.trim();
    // Support:
    // - https://www.youtube.com/watch?v=ID
    // - https://youtu.be/ID
    // - https://www.youtube.com/embed/ID
    // - https://www.youtube-nocookie.com/embed/ID
    // - https://m.youtube.com/watch?v=ID
    const regExp =
        /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|e\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|[&]v(?:i)?=))([^#&?]*).*/;
    const match = trimmedUrl.match(regExp);
    const id = match && match[1].length === 11 ? match[1] : null;
    console.log('[VideoPlayer] YouTube ID extraction:', {
        url: trimmedUrl,
        id,
        match: !!match,
    });
    return id;
};

export default function VideoPlayer({
    src,
    poster,
    title,
    captions = [],
    autoPlay = false,
    onProgress,
    onComplete,
    initialTime = 0,
    className = '',
}: VideoPlayerProps) {
    useEffect(() => {
        console.log('[VideoPlayer] Rendering with src:', src);
    }, [src]);

    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);
    const hlsRef = useRef<Hls | null>(null);

    // State
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [buffered, setBuffered] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const isYouTube = /youtube\.com|youtu\.be|youtube-nocookie\.com/.test(src);
    const [showControls, setShowControls] = useState(true);
    const [isLoading, setIsLoading] = useState(!isYouTube);
    const [error, setError] = useState<string | null>(null);
    const [activeCaption, setActiveCaption] = useState<string | null>(null);
    const [showCaptions, setShowCaptions] = useState(false);
    const [qualityOptions, setQualityOptions] = useState<QualityOption[]>([]);
    const [selectedQualityLevel, setSelectedQualityLevel] = useState(-1);
    const [prevSrc, setPrevSrc] = useState(src);

    if (src !== prevSrc) {
        setPrevSrc(src);
        setIsLoading(!isYouTube);
        setQualityOptions([]);
        setSelectedQualityLevel(-1);
    }

    const youtubeId = isYouTube ? getYouTubeId(src) : null;
    const isHLS = src.toLowerCase().includes('.m3u8');
    const selectedQualityLabel = useMemo(() => {
        if (selectedQualityLevel < 0) {
            return 'Auto';
        }

        return (
            qualityOptions.find(
                (option) => option.levelIndex === selectedQualityLevel,
            )?.label ?? 'Auto'
        );
    }, [qualityOptions, selectedQualityLevel]);

    // Reset controls hide timer
    const resetHideTimer = useCallback(() => {
        if (isYouTube) return;
        setShowControls(true);
        if (hideControlsTimeout.current) {
            clearTimeout(hideControlsTimeout.current);
        }
        if (isPlaying) {
            hideControlsTimeout.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        }
    }, [isPlaying, isYouTube]);

    // Play/Pause toggle
    const togglePlay = useCallback(() => {
        if (isYouTube) return;
        const video = videoRef.current;
        if (!video) return;
        if (isPlaying) {
            video.pause();
        } else {
            video.play().catch((e) => {
                console.error('Play failed:', e);
            });
        }
    }, [isPlaying, isYouTube]);

    // Seek
    const handleSeek = useCallback(
        (value: number[]) => {
            if (isYouTube) return;
            const video = videoRef.current;
            if (!video || duration === 0) return;
            const newTime = (value[0] / 100) * duration;
            video.currentTime = newTime;
            setCurrentTime(newTime);
        },
        [duration, isYouTube],
    );

    // Volume control
    const handleVolumeChange = useCallback(
        (value: number[]) => {
            if (isYouTube) return;
            const video = videoRef.current;
            if (!video) return;
            const newVolume = value[0] / 100;
            video.volume = newVolume;
            setVolume(newVolume);
            setIsMuted(newVolume === 0);
        },
        [isYouTube],
    );

    const toggleMute = useCallback(() => {
        if (isYouTube) return;
        const video = videoRef.current;
        if (!video) return;
        if (isMuted) {
            video.muted = false;
            setIsMuted(false);
        } else {
            video.muted = true;
            setIsMuted(true);
        }
    }, [isMuted, isYouTube]);

    // Speed control
    const changeSpeed = useCallback(
        (speed: number) => {
            if (isYouTube) return;
            const video = videoRef.current;
            if (!video) return;
            video.playbackRate = speed;
            setPlaybackSpeed(speed);
        },
        [isYouTube],
    );

    const changeQuality = useCallback((levelIndex: number) => {
        const hls = hlsRef.current;

        if (!hls) {
            return;
        }

        hls.currentLevel = levelIndex;
        hls.nextLevel = levelIndex;
        setSelectedQualityLevel(levelIndex);
    }, []);

    // Fullscreen toggle
    const toggleFullscreen = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;
        if (!isFullscreen) {
            if (container.requestFullscreen) {
                container.requestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }, [isFullscreen]);

    // Caption toggle
    const toggleCaptions = useCallback(() => {
        if (isYouTube || captions.length === 0) return;
        if (showCaptions) {
            setShowCaptions(false);
            setActiveCaption(null);
        } else {
            setShowCaptions(true);
            setActiveCaption(captions[0]?.srclang || null);
        }
    }, [captions, showCaptions, isYouTube]);

    // HLS initialization
    useEffect(() => {
        if (isYouTube || !isHLS || !videoRef.current) return;

        const video = videoRef.current;

        if (Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
            });
            hlsRef.current = hls;
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                setQualityOptions(buildQualityOptions(hls.levels));
                setSelectedQualityLevel(-1);
                if (autoPlay) {
                    video.play().catch(console.error);
                }
            });
            hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
                setSelectedQualityLevel(hls.autoLevelEnabled ? -1 : data.level);
            });
            hls.on(Hls.Events.ERROR, (_event, data) => {
                if (data.fatal) {
                    setError('Failed to load HLS stream.');
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [src, isHLS, isYouTube, autoPlay]);

    useEffect(() => {
        if (isYouTube) {
            return;
        }

        const video = videoRef.current;
        if (!video) {
            return;
        }

        video.playbackRate = playbackSpeed;
    }, [isYouTube, playbackSpeed, src]);

    // Video event handlers
    useEffect(() => {
        if (isYouTube) {
            return;
        }

        const video = videoRef.current;
        if (!video) return;

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);
            onProgress?.(video.currentTime, video.duration);
        };
        const handleDurationChange = () => setDuration(video.duration);
        const handleLoadedData = () => {
            setIsLoading(false);
            setDuration(video.duration);
            if (initialTime > 0) {
                video.currentTime = initialTime;
            }
        };
        const handleWaiting = () => setIsLoading(true);
        const handlePlaying = () => setIsLoading(false);
        const handleError = () => {
            if (!isHLS) {
                setError('Failed to load video. Please try again.');
                setIsLoading(false);
            }
        };
        const handleEnded = () => {
            setIsPlaying(false);
            onComplete?.();
        };
        const handleProgress = () => {
            if (video.buffered.length > 0) {
                const bufferedEnd = video.buffered.end(
                    video.buffered.length - 1,
                );
                setBuffered((bufferedEnd / video.duration) * 100);
            }
        };

        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('durationchange', handleDurationChange);
        video.addEventListener('loadeddata', handleLoadedData);
        video.addEventListener('waiting', handleWaiting);
        video.addEventListener('playing', handlePlaying);
        video.addEventListener('error', handleError);
        video.addEventListener('ended', handleEnded);
        video.addEventListener('progress', handleProgress);

        return () => {
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('durationchange', handleDurationChange);
            video.removeEventListener('loadeddata', handleLoadedData);
            video.removeEventListener('waiting', handleWaiting);
            video.removeEventListener('playing', handlePlaying);
            video.removeEventListener('error', handleError);
            video.removeEventListener('ended', handleEnded);
            video.removeEventListener('progress', handleProgress);
        };
    }, [initialTime, onProgress, onComplete, isYouTube, isHLS]);

    // Fullscreen change handler
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener(
                'fullscreenchange',
                handleFullscreenChange,
            );
        };
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        if (isYouTube) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement
            )
                return;
            switch (e.key.toLowerCase()) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'arrowup':
                    e.preventDefault();
                    handleVolumeChange([Math.min(100, volume * 100 + 10)]);
                    break;
                case 'arrowdown':
                    e.preventDefault();
                    handleVolumeChange([Math.max(0, volume * 100 - 10)]);
                    break;
                case 'm':
                    e.preventDefault();
                    toggleMute();
                    break;
                case 'f':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case 'c':
                    e.preventDefault();
                    toggleCaptions();
                    break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        togglePlay,
        handleVolumeChange,
        volume,
        toggleMute,
        toggleFullscreen,
        toggleCaptions,
        isYouTube,
    ]);

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div
            ref={containerRef}
            className={`group relative aspect-video w-full overflow-hidden rounded-xl bg-black ${className}`}
            onMouseMove={resetHideTimer}
            onMouseLeave={() => isPlaying && setShowControls(false)}
        >
            {/* Video element or YouTube iframe */}
            {isYouTube && youtubeId ? (
                <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=${autoPlay ? 1 : 0}&rel=0&modestbranding=1&origin=${window.location.origin}&enablejsapi=1`}
                    className="h-full w-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    onLoad={() => setIsLoading(false)}
                />
            ) : (
                <video
                    ref={videoRef}
                    src={isHLS ? undefined : src}
                    poster={poster}
                    autoPlay={autoPlay}
                    className="h-full w-full object-contain"
                    onClick={togglePlay}
                    playsInline
                >
                    {captions.map((caption) => (
                        <track
                            key={caption.srclang}
                            kind="captions"
                            label={caption.label}
                            srcLang={caption.srclang}
                            src={caption.src}
                            default={activeCaption === caption.srclang}
                        />
                    ))}
                </video>
            )}

            {/* Loading overlay */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/50"
                    >
                        <Loader2 className="h-12 w-12 animate-spin text-white" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error overlay */}
            {error && !isYouTube && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white">
                    <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
                    <p className="text-lg font-medium">{error}</p>
                    <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => {
                            setError(null);
                            if (isHLS && hlsRef.current) {
                                hlsRef.current.loadSource(src);
                            } else {
                                videoRef.current?.load();
                            }
                        }}
                    >
                        Retry
                    </Button>
                </div>
            )}

            {/* Center play button (shown when paused) - Hidden for YouTube */}
            <AnimatePresence>
                {!isYouTube && !isPlaying && !isLoading && !error && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={togglePlay}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-colors hover:bg-white/30">
                            <Play
                                className="ml-1 h-10 w-10 text-white"
                                fill="white"
                            />
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Controls overlay - Hidden for YouTube */}
            <AnimatePresence>
                {!isYouTube && showControls && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pt-20 pb-4"
                    >
                        {/* Title */}
                        {title && (
                            <p className="mb-3 truncate text-sm font-medium text-white">
                                {title}
                            </p>
                        )}

                        {/* Progress bar */}
                        <div
                            ref={progressRef}
                            className="group/progress relative mb-4 h-1 cursor-pointer rounded-full bg-white/30"
                        >
                            {/* Buffered */}
                            <div
                                className="absolute h-full rounded-full bg-white/40"
                                style={{ width: `${buffered}%` }}
                            />
                            {/* Progress */}
                            <div
                                className="absolute h-full rounded-full bg-primary"
                                style={{ width: `${progressPercent}%` }}
                            />
                            {/* Slider */}
                            <Slider
                                value={[progressPercent]}
                                max={100}
                                step={0.1}
                                onValueChange={handleSeek}
                                className="absolute inset-0 cursor-pointer opacity-0"
                            />
                            {/* Scrubber */}
                            <div
                                className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-primary opacity-0 shadow-lg transition-opacity group-hover/progress:opacity-100"
                                style={{
                                    left: `calc(${progressPercent}% - 6px)`,
                                }}
                            />
                        </div>

                        {/* Controls row */}
                        <div className="flex items-center gap-2">
                            {/* Play/Pause */}
                            <button
                                onClick={togglePlay}
                                aria-label={
                                    isPlaying ? 'Pause video' : 'Play video'
                                }
                                className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20"
                            >
                                {isPlaying ? (
                                    <Pause className="h-5 w-5" fill="white" />
                                ) : (
                                    <Play
                                        className="ml-0.5 h-5 w-5"
                                        fill="white"
                                    />
                                )}
                            </button>

                            {/* Time */}
                            <span className="ml-2 font-mono text-sm text-white">
                                {formatTime(currentTime)} /{' '}
                                {formatTime(duration)}
                            </span>

                            <div className="flex-1" />

                            {/* Volume */}
                            <div className="group/volume flex items-center gap-2">
                                <button
                                    onClick={toggleMute}
                                    aria-label={
                                        isMuted || volume === 0
                                            ? 'Unmute'
                                            : 'Mute'
                                    }
                                    className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20"
                                >
                                    {isMuted || volume === 0 ? (
                                        <VolumeX className="h-4 w-4" />
                                    ) : (
                                        <Volume2 className="h-4 w-4" />
                                    )}
                                </button>
                                <div className="w-0 overflow-hidden transition-all duration-200 group-hover/volume:w-20">
                                    <Slider
                                        value={[isMuted ? 0 : volume * 100]}
                                        max={100}
                                        step={1}
                                        onValueChange={handleVolumeChange}
                                        className="w-20"
                                    />
                                </div>
                            </div>

                            {/* Captions */}
                            {captions.length > 0 && (
                                <button
                                    onClick={toggleCaptions}
                                    aria-label={
                                        showCaptions
                                            ? 'Disable captions'
                                            : 'Enable captions'
                                    }
                                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                                        showCaptions
                                            ? 'bg-white/20 text-primary'
                                            : 'text-white hover:bg-white/20'
                                    }`}
                                >
                                    {showCaptions ? (
                                        <Captions className="h-4 w-4" />
                                    ) : (
                                        <CaptionsOff className="h-4 w-4" />
                                    )}
                                </button>
                            )}

                            {/* Settings */}
                            {isHLS && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            aria-label="Video quality"
                                            className="rounded-full px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-white/20"
                                        >
                                            Resolution: {selectedQualityLabel}
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="w-40"
                                    >
                                        <DropdownMenuLabel>
                                            Resolution
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => changeQuality(-1)}
                                            className="flex items-center justify-between"
                                        >
                                            <span>Auto</span>
                                            {selectedQualityLevel === -1 && (
                                                <Check className="h-4 w-4 text-primary" />
                                            )}
                                        </DropdownMenuItem>
                                        {qualityOptions.length === 0 && (
                                            <DropdownMenuItem disabled>
                                                {Hls.isSupported()
                                                    ? 'Loading stream qualities...'
                                                    : 'Manual selection unavailable'}
                                            </DropdownMenuItem>
                                        )}
                                        {qualityOptions.map((option) => (
                                            <DropdownMenuItem
                                                key={option.levelIndex}
                                                onClick={() =>
                                                    changeQuality(
                                                        option.levelIndex,
                                                    )
                                                }
                                                className="flex items-center justify-between"
                                            >
                                                <span>{option.label}</span>
                                                {selectedQualityLevel ===
                                                    option.levelIndex && (
                                                    <Check className="h-4 w-4 text-primary" />
                                                )}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}

                            {/* Settings */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        aria-label="Settings"
                                        className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20"
                                    >
                                        <Settings className="h-4 w-4" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-48"
                                >
                                    <DropdownMenuLabel>
                                        Playback Speed
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {playbackSpeeds.map((speed) => (
                                        <DropdownMenuItem
                                            key={speed}
                                            onClick={() => changeSpeed(speed)}
                                            className="flex items-center justify-between"
                                        >
                                            <span>
                                                {speed === 1
                                                    ? 'Normal'
                                                    : `${speed}x`}
                                            </span>
                                            {playbackSpeed === speed && (
                                                <Check className="h-4 w-4 text-primary" />
                                            )}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Fullscreen */}
                            <button
                                onClick={toggleFullscreen}
                                aria-label={
                                    isFullscreen
                                        ? 'Exit fullscreen'
                                        : 'Enter fullscreen'
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20"
                            >
                                {isFullscreen ? (
                                    <Minimize className="h-4 w-4" />
                                ) : (
                                    <Maximize className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
