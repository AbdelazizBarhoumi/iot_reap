/**
 * VideoUpload Component
 * Professional video upload component with drag-and-drop,
 * progress tracking, and preview functionality.
 */
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertCircle,
    Check,
    CloudUpload,
    File,
    Film,
    Loader2,
    Trash2,
    Upload,
    X,
} from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
interface VideoUploadProps {
    onUpload?: (file: File) => Promise<string>;
    onRemove?: () => void;
    value?: string;
    maxSizeMB?: number;
    acceptedFormats?: string[];
    className?: string;
}
interface UploadState {
    status: 'idle' | 'uploading' | 'processing' | 'complete' | 'error';
    progress: number;
    error?: string;
    file?: File;
    previewUrl?: string;
}
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};
export default function VideoUpload({
    onUpload,
    onRemove,
    value,
    maxSizeMB = 500,
    acceptedFormats = [
        'video/mp4',
        'video/webm',
        'video/quicktime',
        'video/x-msvideo',
    ],
    className = '',
}: VideoUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoPreviewRef = useRef<HTMLVideoElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadState, setUploadState] = useState<UploadState>({
        status: value ? 'complete' : 'idle',
        progress: 0,
        previewUrl: value,
    });
    const [videoDuration, setVideoDuration] = useState<number | null>(null);
    const validateFile = useCallback(
        (file: File): string | null => {
            if (!acceptedFormats.includes(file.type)) {
                return `Invalid file type. Accepted formats: ${acceptedFormats.map((f) => f.split('/')[1]).join(', ')}`;
            }
            const maxSizeBytes = maxSizeMB * 1024 * 1024;
            if (file.size > maxSizeBytes) {
                return `File too large. Maximum size: ${maxSizeMB}MB`;
            }
            return null;
        },
        [acceptedFormats, maxSizeMB],
    );
    const handleFile = useCallback(
        async (file: File) => {
            const error = validateFile(file);
            if (error) {
                setUploadState({
                    status: 'error',
                    progress: 0,
                    error,
                });
                return;
            }
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setUploadState({
                status: 'uploading',
                progress: 0,
                file,
                previewUrl,
            });
            // Simulate upload progress (in real app, use actual upload progress)
            if (onUpload) {
                try {
                    // Simulate progress
                    const progressInterval = setInterval(() => {
                        setUploadState((prev) => {
                            if (prev.progress >= 90) {
                                clearInterval(progressInterval);
                                return prev;
                            }
                            return { ...prev, progress: prev.progress + 10 };
                        });
                    }, 200);
                    setUploadState((prev) => ({
                        ...prev,
                        status: 'uploading',
                        progress: 0,
                    }));
                    // Actual upload
                    const url = await onUpload(file);
                    clearInterval(progressInterval);
                    // Processing phase
                    setUploadState((prev) => ({
                        ...prev,
                        status: 'processing',
                        progress: 95,
                    }));
                    // Simulate processing time
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    setUploadState({
                        status: 'complete',
                        progress: 100,
                        file,
                        previewUrl: url || previewUrl,
                    });
                } catch (err) {
                    setUploadState({
                        status: 'error',
                        progress: 0,
                        error:
                            err instanceof Error
                                ? err.message
                                : 'Upload failed',
                        file,
                    });
                }
            } else {
                // No upload handler - just show preview
                setUploadState({
                    status: 'complete',
                    progress: 100,
                    file,
                    previewUrl,
                });
            }
        },
        [onUpload, validateFile],
    );
    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) {
                handleFile(file);
            }
        },
        [handleFile],
    );
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);
    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);
    const handleFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                handleFile(file);
            }
        },
        [handleFile],
    );
    const handleRemove = useCallback(() => {
        if (
            uploadState.previewUrl &&
            uploadState.previewUrl.startsWith('blob:')
        ) {
            URL.revokeObjectURL(uploadState.previewUrl);
        }
        setUploadState({ status: 'idle', progress: 0 });
        setVideoDuration(null);
        onRemove?.();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [uploadState.previewUrl, onRemove]);
    const handleVideoLoaded = useCallback(() => {
        const video = videoPreviewRef.current;
        if (video) {
            setVideoDuration(video.duration);
        }
    }, []);
    const { status, progress, error, file, previewUrl } = uploadState;
    return (
        <div className={className}>
            <input
                ref={fileInputRef}
                type="file"
                accept={acceptedFormats.join(',')}
                onChange={handleFileSelect}
                className="hidden"
            />
            <AnimatePresence mode="wait">
                {status === 'idle' && (
                    <motion.div
                        key="dropzone"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onClick={() => fileInputRef.current?.click()}
                            className={`relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-all duration-200 ${
                                isDragging
                                    ? 'scale-[1.02] border-primary bg-primary/10'
                                    : 'border-muted-foreground/30 bg-muted/30 hover:border-primary/50 hover:bg-muted/50'
                            } `}
                        >
                            <div className="flex flex-col items-center justify-center px-8 py-16">
                                <motion.div
                                    animate={{
                                        y: isDragging ? -10 : 0,
                                        scale: isDragging ? 1.1 : 1,
                                    }}
                                    className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10"
                                >
                                    <CloudUpload
                                        className={`h-10 w-10 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`}
                                    />
                                </motion.div>
                                <p className="mb-2 text-lg font-medium text-foreground">
                                    {isDragging
                                        ? 'Drop your video here'
                                        : 'Upload Video'}
                                </p>
                                <p className="mb-4 text-center text-sm text-muted-foreground">
                                    Drag and drop or click to browse
                                </p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Film className="h-3.5 w-3.5" />
                                        MP4, WebM, MOV
                                    </span>
                                    <span>•</span>
                                    <span>Max {maxSizeMB}MB</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
                {(status === 'uploading' || status === 'processing') && (
                    <motion.div
                        key="uploading"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <Card className="overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    {/* Video preview thumbnail */}
                                    <div className="h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-muted">
                                        {previewUrl ? (
                                            <video
                                                src={previewUrl}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <Film className="h-8 w-8 text-muted-foreground/50" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="mb-1 flex items-center gap-2">
                                            <File className="h-4 w-4 text-muted-foreground" />
                                            <p className="truncate text-sm font-medium text-foreground">
                                                {file?.name || 'video.mp4'}
                                            </p>
                                        </div>
                                        <p className="mb-3 text-xs text-muted-foreground">
                                            {file
                                                ? formatFileSize(file.size)
                                                : ''}
                                            {status === 'processing' &&
                                                ' • Processing video...'}
                                        </p>
                                        <div className="space-y-2">
                                            <Progress
                                                value={progress}
                                                className="h-2"
                                            />
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="flex items-center gap-2 text-muted-foreground">
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                    {status === 'uploading'
                                                        ? 'Uploading...'
                                                        : 'Processing...'}
                                                </span>
                                                <span className="font-medium text-foreground">
                                                    {progress}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleRemove}
                                        className="shrink-0 text-muted-foreground hover:text-destructive"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
                {status === 'complete' && (
                    <motion.div
                        key="complete"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <Card className="overflow-hidden">
                            {/* Video preview */}
                            <div className="relative aspect-video bg-black">
                                <video
                                    ref={videoPreviewRef}
                                    src={previewUrl}
                                    onLoadedMetadata={handleVideoLoaded}
                                    className="h-full w-full object-contain"
                                    controls
                                />
                                {/* Success badge */}
                                <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-green-500/90 px-3 py-1.5 text-xs font-medium text-white">
                                    <Check className="h-3.5 w-3.5" />
                                    Uploaded
                                </div>
                            </div>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                                            <Film className="h-5 w-5 text-green-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">
                                                {file?.name || 'Video uploaded'}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                {file && (
                                                    <span>
                                                        {formatFileSize(
                                                            file.size,
                                                        )}
                                                    </span>
                                                )}
                                                {videoDuration && (
                                                    <>
                                                        <span>•</span>
                                                        <span>
                                                            {formatDuration(
                                                                videoDuration,
                                                            )}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                        >
                                            <Upload className="mr-2 h-4 w-4" />
                                            Replace
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleRemove}
                                            className="text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
                {status === 'error' && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <Card className="border-destructive/50 bg-destructive/5">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
                                        <AlertCircle className="h-6 w-6 text-destructive" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="mb-1 text-sm font-medium text-destructive">
                                            Upload Failed
                                        </p>
                                        <p className="mb-3 text-sm text-muted-foreground">
                                            {error ||
                                                'An error occurred while uploading the video.'}
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setUploadState({
                                                    status: 'idle',
                                                    progress: 0,
                                                });
                                            }}
                                        >
                                            Try Again
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}


