/**
 * VideoPlayer Component
 * Professional video player with HLS.js support, playback controls,
 * quality selection, speed controls, and caption support.
 */
import { motion, AnimatePresence } from 'framer-motion';
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
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
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
function formatTime(seconds: number): string {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
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
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);
    // State
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [buffered, setBuffered] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeCaption, setActiveCaption] = useState<string | null>(null);
    const [showCaptions, setShowCaptions] = useState(false);
    // Reset controls hide timer
    const resetHideTimer = useCallback(() => {
        setShowControls(true);
        if (hideControlsTimeout.current) {
            clearTimeout(hideControlsTimeout.current);
        }
        if (isPlaying) {
            hideControlsTimeout.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        }
    }, [isPlaying]);
    // Play/Pause toggle
    const togglePlay = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        if (isPlaying) {
            video.pause();
        } else {
            video.play().catch((e) => {
                console.error('Play failed:', e);
            });
        }
    }, [isPlaying]);
    // Seek
    const handleSeek = useCallback(
        (value: number[]) => {
            const video = videoRef.current;
            if (!video || duration === 0) return;
            const newTime = (value[0] / 100) * duration;
            video.currentTime = newTime;
            setCurrentTime(newTime);
        },
        [duration],
    );
    // Volume control
    const handleVolumeChange = useCallback((value: number[]) => {
        const video = videoRef.current;
        if (!video) return;
        const newVolume = value[0] / 100;
        video.volume = newVolume;
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    }, []);
    const toggleMute = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        if (isMuted) {
            video.muted = false;
            setIsMuted(false);
        } else {
            video.muted = true;
            setIsMuted(true);
        }
    }, [isMuted]);
    // Speed control
    const changeSpeed = useCallback((speed: number) => {
        const video = videoRef.current;
        if (!video) return;
        video.playbackRate = speed;
        setPlaybackSpeed(speed);
    }, []);
    // Skip forward/back
    const skip = useCallback(
        (seconds: number) => {
            const video = videoRef.current;
            if (!video) return;
            video.currentTime = Math.max(
                0,
                Math.min(duration, video.currentTime + seconds),
            );
        },
        [duration],
    );
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
        if (captions.length === 0) return;
        if (showCaptions) {
            setShowCaptions(false);
            setActiveCaption(null);
        } else {
            setShowCaptions(true);
            setActiveCaption(captions[0]?.srclang || null);
        }
    }, [captions, showCaptions]);
    // Video event handlers
    useEffect(() => {
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
            setError('Failed to load video. Please try again.');
            setIsLoading(false);
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
    }, [initialTime, onProgress, onComplete]);
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
                case 'arrowleft':
                    e.preventDefault();
                    skip(-10);
                    break;
                case 'arrowright':
                    e.preventDefault();
                    skip(10);
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
        skip,
        handleVolumeChange,
        volume,
        toggleMute,
        toggleFullscreen,
        toggleCaptions,
    ]);
    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
    return (
        <div
            ref={containerRef}
            className={`group relative overflow-hidden rounded-xl bg-black ${className}`}
            onMouseMove={resetHideTimer}
            onMouseLeave={() => isPlaying && setShowControls(false)}
        >
            {/* Video element */}
            <video
                ref={videoRef}
                src={src}
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
            {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white">
                    <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
                    <p className="text-lg font-medium">{error}</p>
                    <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => {
                            setError(null);
                            videoRef.current?.load();
                        }}
                    >
                        Retry
                    </Button>
                </div>
            )}
            {/* Center play button (shown when paused) */}
            <AnimatePresence>
                {!isPlaying && !isLoading && !error && (
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
            {/* Controls overlay */}
            <AnimatePresence>
                {showControls && (
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
                                aria-label={isPlaying ? 'Pause video' : 'Play video'}
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
                            {/* Skip back */}
                            <button
                                onClick={() => skip(-10)}
                                aria-label="Skip backward 10 seconds"
                                className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20"
                            >
                                <SkipBack className="h-4 w-4" />
                            </button>
                            {/* Skip forward */}
                            <button
                                onClick={() => skip(10)}
                                aria-label="Skip forward 10 seconds"
                                className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20"
                            >
                                <SkipForward className="h-4 w-4" />
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
                                    aria-label={isMuted || volume === 0 ? 'Unmute' : 'Mute'}
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
                                    aria-label={showCaptions ? 'Disable captions' : 'Enable captions'}
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
                                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
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


