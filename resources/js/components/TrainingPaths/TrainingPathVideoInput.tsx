/**
 * TrainingPathVideoInput Component
 * Handles both uploaded video files and YouTube URLs for trainingPaths.
 * Allows switching between upload and YouTube modes.
 */
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertCircle,
    Check,
    CloudUpload,
    Link2,
    Loader2,
    Play,
    Trash2,
    Youtube,
} from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { VideoType } from '@/types/TrainingPath.types';
interface TrainingPathVideoInputProps {
    videoType: VideoType | null;
    videoUrl: string | null;
    onVideoChange: (type: VideoType | null, url: string | null) => void;
    onUpload?: (file: File) => Promise<string>;
    uploading?: boolean;
    error?: string;
    className?: string;
}
// Extract YouTube video ID from various URL formats
const extractYouTubeId = (url: string): string | null => {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
        /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
};
// Get YouTube embed URL
const getYouTubeEmbedUrl = (videoId: string): string => {
    return `https://www.youtube.com/embed/${videoId}`;
};
export default function TrainingPathVideoInput({
    videoType,
    videoUrl,
    onVideoChange,
    onUpload,
    uploading = false,
    error,
    className = '',
}: TrainingPathVideoInputProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [youtubeInput, setYoutubeInput] = useState('');
    const [youtubeError, setYoutubeError] = useState<string | null>(null);
    // Handle file upload
    const handleFileUpload = useCallback(async (file: File) => {
        if (!file.type.startsWith('video/')) {
            setYoutubeError('Please select a valid video file');
            return;
        }
        if (file.size > 500 * 1024 * 1024) {
            // 500MB limit
            setYoutubeError('Video file must be less than 500MB');
            return;
        }
        if (onUpload) {
            try {
                const uploadedUrl = await onUpload(file);
                onVideoChange('upload', uploadedUrl);
                setYoutubeError(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
            } catch (err) {
                setYoutubeError(err instanceof Error ? err.message : 'Upload failed');
            }
        }
    }, [onUpload, onVideoChange]);
    // Handle drag & drop
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    };
    // Handle YouTube URL submission
    const handleYouTubeSubmit = () => {
        setYoutubeError(null);
        if (!youtubeInput.trim()) {
            setYoutubeError('Please enter a YouTube URL or video ID');
            return;
        }
        const videoId = extractYouTubeId(youtubeInput.trim());
        if (!videoId) {
            setYoutubeError(
                'Invalid YouTube URL or ID. Try: youtube.com/watch?v=xxx, youtu.be/xxx, or just the video ID'
            );
            return;
        }
        const embedUrl = getYouTubeEmbedUrl(videoId);
        onVideoChange('youtube', embedUrl);
        setYoutubeInput('');
    };
    // Handle removal
    const handleRemove = () => {
        onVideoChange(null, null);
        setYoutubeError(null);
        setYoutubeInput('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };
    const hasVideo = videoType && videoUrl;
    return (
        <div className={className}>
            <Card className="border-dashed">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Play className="h-5 w-5 text-blue-500" />
                        Path Video
                    </CardTitle>
                    <CardDescription>Upload a video file or add a YouTube link</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <AnimatePresence mode="wait">
                        {hasVideo ? (
                            <motion.div
                                key="preview"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-4"
                            >
                                {/* Video Preview */}
                                <div className="border rounded-lg overflow-hidden bg-black aspect-video">
                                    {videoType === 'youtube' && videoUrl ? (
                                        <iframe
                                            src={videoUrl}
                                            title="YouTube video preview"
                                            className="w-full h-full border-0"
                                            allowFullScreen
                                            loading="lazy"
                                        />
                                    ) : (
                                        <video
                                            src={videoUrl!}
                                            controls
                                            className="w-full h-full"
                                            controlsList="nodownload"
                                        />
                                    )}
                                </div>
                                {/* Video Info */}
                                <div className="flex items-start justify-between p-3 bg-green-50 dark:bg-green-500/10 rounded-lg border border-green-200 dark:border-green-500/20">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <Check className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-green-900 dark:text-green-200">
                                                {videoType === 'youtube' ? 'YouTube Video' : 'Uploaded Video'}
                                            </p>
                                            <p className="text-xs text-green-700 dark:text-green-300 truncate">
                                                {videoUrl}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleRemove}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="input"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <Tabs defaultValue="upload" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="upload">
                                            <CloudUpload className="h-4 w-4 mr-2" />
                                            Upload
                                        </TabsTrigger>
                                        <TabsTrigger value="youtube">
                                            <Youtube className="h-4 w-4 mr-2" />
                                            YouTube
                                        </TabsTrigger>
                                    </TabsList>
                                    {/* Upload Tab */}
                                    <TabsContent value="upload" className="space-y-3">
                                        <div
                                            onDragOver={handleDragOver}
                                            onDrop={handleDrop}
                                            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition cursor-pointer"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                className="flex flex-col items-center gap-3"
                                            >
                                                {uploading ? (
                                                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                                                ) : (
                                                    <CloudUpload className="h-8 w-8 text-gray-400" />
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                                        {uploading ? 'Uploading...' : 'Drag and drop your video'}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        or click to browse
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        MP4, WebM, or MOV up to 500MB
                                                    </p>
                                                </div>
                                            </motion.div>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="video/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleFileUpload(file);
                                                }}
                                                disabled={uploading}
                                                className="hidden"
                                            />
                                        </div>
                                    </TabsContent>
                                    {/* YouTube Tab */}
                                    <TabsContent value="youtube" className="space-y-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="youtube-url">YouTube URL or Video ID</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="youtube-url"
                                                    placeholder="e.g., youtube.com/watch?v=... or just the ID"
                                                    value={youtubeInput}
                                                    onChange={(e) => {
                                                        setYoutubeInput(e.target.value);
                                                        setYoutubeError(null);
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleYouTubeSubmit();
                                                    }}
                                                    disabled={uploading}
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={handleYouTubeSubmit}
                                                    disabled={uploading || !youtubeInput.trim()}
                                                    className="flex-shrink-0"
                                                >
                                                    <Link2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {/* Error Message */}
                    <AnimatePresence>
                        {(error || youtubeError) && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg flex items-start gap-2"
                            >
                                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-red-700 dark:text-red-300">
                                    {error || youtubeError}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </div>
    );
}


