/**
 * Video Management API
 *
 * API functions for video upload, management, and captions.
 * Used by teachers to manage lesson videos.
 */
import axios from './client';
// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface Video {
    id: number;
    lesson_id: number;
    original_filename: string;
    status: 'pending' | 'processing' | 'ready' | 'failed';
    is_ready: boolean;
    is_processing: boolean;
    has_failed: boolean;
    error_message?: string;
    duration_seconds: number | null;
    duration_formatted?: string;
    resolution_height: number | null;
    resolution_width: number | null;
    file_size_bytes: number | null;
    file_size_formatted: string | null;
    hls_url?: string;
    thumbnail_url: string | null;
    captions?: Caption[];
    created_at: string;
    updated_at: string;
}
export interface Caption {
    id: number;
    video_id: number;
    language: string;
    label: string;
    file_url: string;
    is_default: boolean;
    created_at: string;
}
export interface VideoStatus {
    has_video: boolean;
    status?: string;
    is_ready?: boolean;
    is_processing?: boolean;
    has_failed?: boolean;
    error_message?: string | null;
    duration_seconds?: number | null;
    hls_url?: string | null;
    thumbnail_url?: string | null;
}
export interface ProcessingStats {
    pending: number;
    processing: number;
    ready: number;
    failed: number;
}
// ─────────────────────────────────────────────────────────────────────────────
// Video API
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Get video for a lesson.
 */
export async function getVideoForLesson(
    lessonId: number,
): Promise<Video | null> {
    const response = await axios.get<{ data: Video | null }>(
        `/teaching/lessons/${lessonId}/video`,
    );
    return response.data.data;
}
/**
 * Get video transcoding status.
 */
export async function getVideoStatus(lessonId: number): Promise<VideoStatus> {
    const response = await axios.get<VideoStatus>(
        `/teaching/lessons/${lessonId}/video/status`,
    );
    return response.data;
}
/**
 * Upload a video for a lesson.
 *
 * @param lessonId - The lesson ID
 * @param file - The video file
 * @param onProgress - Optional progress callback (0-100)
 */
export async function uploadVideo(
    lessonId: number,
    file: File,
    onProgress?: (progress: number) => void,
): Promise<Video> {
    const formData = new FormData();
    formData.append('video', file);
    const response = await axios.post<{ data: Video; message: string }>(
        `/teaching/lessons/${lessonId}/video`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percent = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total,
                    );
                    onProgress(percent);
                }
            },
        },
    );
    return response.data.data;
}
/**
 * Delete a video from a lesson.
 */
export async function deleteVideo(lessonId: number): Promise<void> {
    await axios.delete(`/teaching/lessons/${lessonId}/video`);
}
/**
 * Retry transcoding for a failed video.
 */
export async function retryTranscoding(lessonId: number): Promise<Video> {
    const response = await axios.post<{ data: Video; message: string }>(
        `/teaching/lessons/${lessonId}/video/retry`,
    );
    return response.data.data;
}
// ─────────────────────────────────────────────────────────────────────────────
// Caption API
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Get captions for a lesson's video.
 */
export async function getCaptions(lessonId: number): Promise<Caption[]> {
    const response = await axios.get<{ data: Caption[] }>(
        `/teaching/lessons/${lessonId}/video/captions`,
    );
    return response.data.data;
}
/**
 * Upload a caption file for a video.
 */
export async function uploadCaption(
    lessonId: number,
    file: File,
    language: string,
    label?: string,
): Promise<Caption> {
    const formData = new FormData();
    formData.append('caption', file);
    formData.append('language', language);
    if (label) {
        formData.append('label', label);
    }
    const response = await axios.post<{ data: Caption; message: string }>(
        `/teaching/lessons/${lessonId}/video/captions`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        },
    );
    return response.data.data;
}
/**
 * Delete a caption.
 */
export async function deleteCaption(
    lessonId: number,
    captionId: number,
): Promise<void> {
    await axios.delete(
        `/teaching/lessons/${lessonId}/video/captions/${captionId}`,
    );
}
// ─────────────────────────────────────────────────────────────────────────────
// Admin API
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Get video processing statistics (admin only).
 */
export async function getProcessingStats(): Promise<ProcessingStats> {
    const response = await axios.get<{ data: ProcessingStats }>(
        '/admin/videos/processing-stats',
    );
    return response.data.data;
}
// ─────────────────────────────────────────────────────────────────────────────
// Streaming Helpers
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Get the HLS stream URL for a video.
 */
export function getStreamUrl(videoId: number): string {
    return `/videos/${videoId}/stream`;
}
/**
 * Poll video status until ready or failed.
 *
 * @param lessonId - The lesson ID
 * @param intervalMs - Polling interval in milliseconds (default: 3000)
 * @param maxAttempts - Maximum polling attempts (default: 100)
 * @param onStatusChange - Optional callback when status changes
 */
export async function pollUntilReady(
    lessonId: number,
    intervalMs = 3000,
    maxAttempts = 100,
    onStatusChange?: (status: VideoStatus) => void,
): Promise<VideoStatus> {
    let attempts = 0;
    while (attempts < maxAttempts) {
        const status = await getVideoStatus(lessonId);
        if (onStatusChange) {
            onStatusChange(status);
        }
        if (status.is_ready || status.has_failed) {
            return status;
        }
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
        attempts++;
    }
    throw new Error('Polling timeout: video processing took too long');
}

