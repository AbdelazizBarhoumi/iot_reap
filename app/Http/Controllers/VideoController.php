<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCaptionRequest;
use App\Http\Requests\StoreVideoRequest;
use App\Http\Resources\CaptionResource;
use App\Http\Resources\VideoResource;
use App\Models\TrainingUnit;
use App\Models\Video;
use App\Services\CaptionService;
use App\Services\VideoService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Controller for video management (teacher-facing).
 */
class VideoController extends Controller
{
    public function __construct(
        private readonly VideoService $videoService,
        private readonly CaptionService $captionService,
    ) {}

    /**
     * Get video for a trainingUnit.
     */
    public function show(int $trainingUnitId): JsonResponse
    {
        $video = $this->videoService->getVideoForTrainingUnit($trainingUnitId);

        if (! $video) {
            return response()->json(['data' => null]);
        }

        return response()->json([
            'data' => new VideoResource($video),
        ]);
    }

    /**
     * Upload a video for a trainingUnit.
     *
     * @throws AuthorizationException
     */
    public function store(StoreVideoRequest $request, int $trainingUnitId): JsonResponse
    {
        $trainingUnit = TrainingUnit::findOrFail($trainingUnitId);

        // Verify user owns the trainingPath
        $this->authorizeTrainingUnitOwnership($trainingUnit);

        // Check if trainingUnit already has a video
        $existingVideo = $this->videoService->getVideoForTrainingUnit($trainingUnitId);
        if ($existingVideo) {
            return response()->json([
                'message' => 'TrainingUnit already has a video. Delete it first to upload a new one.',
            ], 422);
        }

        $video = $this->videoService->uploadAndQueue(
            $trainingUnit,
            $request->file('video'),
        );

        return response()->json([
            'data' => new VideoResource($video),
            'message' => 'Video uploaded successfully. Transcoding has started.',
        ], 201);
    }

    /**
     * Delete a video.
     *
     * @throws AuthorizationException
     */
    public function destroy(int $trainingUnitId): JsonResponse
    {
        $video = $this->videoService->getVideoForTrainingUnit($trainingUnitId);

        if (! $video) {
            return response()->json([
                'message' => 'No video found for this trainingUnit.',
            ], 404);
        }

        // Verify user owns the trainingPath
        $this->authorizeTrainingUnitOwnership($video->trainingUnit);

        $this->videoService->delete($video);

        return response()->json([
            'message' => 'Video deleted successfully.',
        ]);
    }

    /**
     * Retry transcoding for a failed video.
     *
     * @throws AuthorizationException
     */
    public function retry(int $trainingUnitId): JsonResponse
    {
        $video = $this->videoService->getVideoForTrainingUnit($trainingUnitId);

        if (! $video) {
            return response()->json([
                'message' => 'No video found for this trainingUnit.',
            ], 404);
        }

        // Verify user owns the trainingPath
        $this->authorizeTrainingUnitOwnership($video->trainingUnit);

        if (! $video->hasFailed()) {
            return response()->json([
                'message' => 'Video is not in a failed state.',
            ], 422);
        }

        $video = $this->videoService->retryTranscoding($video);

        return response()->json([
            'data' => new VideoResource($video),
            'message' => 'Transcoding retry has been queued.',
        ]);
    }

    /**
     * Get video transcoding status.
     */
    public function status(int $trainingUnitId): JsonResponse
    {
        $video = $this->videoService->getVideoForTrainingUnit($trainingUnitId);

        if (! $video) {
            return response()->json([
                'has_video' => false,
            ]);
        }

        return response()->json([
            'has_video' => true,
            'status' => $video->status->value,
            'is_ready' => $video->isReady(),
            'is_processing' => $video->isProcessing(),
            'has_failed' => $video->hasFailed(),
            'error_message' => $video->error_message,
            'duration_seconds' => $video->duration_seconds,
            'hls_url' => $video->isReady() ? $video->hls_url : null,
            'thumbnail_url' => $video->thumbnail_url,
        ]);
    }

    /**
     * Stream the HLS playlist.
     */
    public function stream(int $videoId): StreamedResponse|JsonResponse
    {
        $video = Video::findOrFail($videoId);

        if (! $video->isReady() || ! $video->hls_path) {
            return response()->json([
                'message' => 'Video is not ready for streaming.',
            ], 404);
        }

        $disk = $video->storage_disk;
        $path = $video->hls_path;

        if (! Storage::disk($disk)->exists($path)) {
            return response()->json([
                'message' => 'Stream file not found.',
            ], 404);
        }

        /** @var FilesystemAdapter $diskAdapter */
        $diskAdapter = Storage::disk($disk);

        return $diskAdapter->response($path, null, [
            'Content-Type' => 'application/vnd.apple.mpegurl',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }

    /**
     * Stream an HLS segment.
     */
    public function segment(int $videoId, string $quality, string $segment): StreamedResponse|JsonResponse
    {
        $video = Video::findOrFail($videoId);

        if (! $video->isReady()) {
            return response()->json([
                'message' => 'Video is not ready for streaming.',
            ], 404);
        }

        // Validate segment filename (prevent path traversal)
        if (! preg_match('/^(stream_\d+\.ts|stream\.m3u8)$/', $segment)) {
            return response()->json([
                'message' => 'Invalid segment.',
            ], 400);
        }

        // Validate quality
        if (! in_array($quality, ['360p', '720p', '1080p'])) {
            return response()->json([
                'message' => 'Invalid quality.',
            ], 400);
        }

        $disk = $video->storage_disk;
        $path = "videos/hls/{$video->id}/{$quality}/{$segment}";

        if (! Storage::disk($disk)->exists($path)) {
            return response()->json([
                'message' => 'Segment not found.',
            ], 404);
        }

        $contentType = str_ends_with($segment, '.m3u8')
            ? 'application/vnd.apple.mpegurl'
            : 'video/mp2t';

        /** @var FilesystemAdapter $diskAdapter */
        $diskAdapter = Storage::disk($disk);

        return $diskAdapter->response($path, null, [
            'Content-Type' => $contentType,
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Caption Management
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Get captions for a video.
     */
    public function captions(int $trainingUnitId): JsonResponse
    {
        $video = $this->videoService->getVideoForTrainingUnit($trainingUnitId);

        if (! $video) {
            return response()->json(['data' => []]);
        }

        return response()->json([
            'data' => CaptionResource::collection($video->captions),
        ]);
    }

    /**
     * Upload a caption file for a video.
     *
     * @throws AuthorizationException
     */
    public function storeCaption(StoreCaptionRequest $request, int $trainingUnitId): JsonResponse
    {
        $video = $this->videoService->getVideoForTrainingUnit($trainingUnitId);

        if (! $video) {
            return response()->json([
                'message' => 'No video found for this trainingUnit.',
            ], 404);
        }

        $this->authorizeTrainingUnitOwnership($video->trainingUnit);

        $caption = $this->captionService->uploadCaption(
            $video,
            $request->file('caption'),
            $request->validated('language'),
            $request->validated('label'),
        );

        return response()->json([
            'data' => new CaptionResource($caption),
            'message' => 'Caption uploaded successfully.',
        ], 201);
    }

    /**
     * Delete a caption.
     *
     * @throws AuthorizationException
     */
    public function destroyCaption(int $trainingUnitId, int $captionId): JsonResponse
    {
        $video = $this->videoService->getVideoForTrainingUnit($trainingUnitId);

        if (! $video) {
            return response()->json([
                'message' => 'No video found for this trainingUnit.',
            ], 404);
        }

        $this->authorizeTrainingUnitOwnership($video->trainingUnit);

        $caption = $video->captions()->findOrFail($captionId);
        $this->captionService->deleteCaption($caption);

        return response()->json([
            'message' => 'Caption deleted successfully.',
        ]);
    }

    /**
     * Get processing stats (admin).
     */
    public function processingStats(Request $request): JsonResponse|InertiaResponse
    {
        Gate::authorize('admin-only');

        if (! $request->wantsJson()) {
            return Inertia::render('admin/VideoProcessingPage');
        }

        return response()->json([
            'data' => $this->videoService->getProcessingStats(),
        ]);
    }

    /**
     * Verify that the authenticated user owns the trainingPath containing the trainingUnit.
     *
     * @throws AuthorizationException
     */
    private function authorizeTrainingUnitOwnership(TrainingUnit $trainingUnit): void
    {
        $trainingPath = $trainingUnit->module->trainingPath;

        if ($trainingPath->instructor_id !== Auth::id()) {
            Gate::authorize('admin-only');
        }
    }
}
