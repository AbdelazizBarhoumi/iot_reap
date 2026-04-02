<?php

namespace App\Http\Controllers;

use App\Enums\CameraPTZDirection;
use App\Exceptions\CameraControlConflictException;
use App\Exceptions\CameraNotControllableException;
use App\Http\Requests\CameraMoveRequest;
use App\Http\Resources\CameraResource;
use App\Models\Camera;
use App\Models\VMSession;
use App\Services\CameraService;
use App\Services\GatewayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Http;

/**
 * Controller for session camera endpoints.
 *
 * All camera operations are scoped to a VM session. The user can:
 * - View all cameras (see streams from all)
 * - Acquire/release exclusive PTZ control of one camera at a time
 * - Move a controlled camera in 4 directions (up/down/left/right)
 */
class SessionCameraController extends Controller
{
    public function __construct(
        private readonly CameraService $cameraService,
        private readonly GatewayService $gatewayService,
    ) {}

    /**
     * GET /sessions/{session}/cameras
     * List all cameras with their control state for this session.
     */
    public function index(Request $request, string $sessionId): JsonResponse
    {
        $session = $this->authorizeSession($request, $sessionId);

        $cameras = $this->cameraService->getCamerasForSession($session->id);

        return response()->json([
            'data' => CameraResource::collection($cameras),
        ]);
    }

    /**
     * GET /sessions/{session}/cameras/{camera}
     * Get a single camera with stream URLs and control state.
     */
    public function show(Request $request, string $sessionId, int $cameraId): JsonResponse
    {
        $this->authorizeSession($request, $sessionId);

        $camera = app(\App\Repositories\CameraRepository::class)->findWithControl($cameraId);

        return response()->json([
            'data' => new CameraResource($camera),
        ]);
    }

    /**
     * POST /sessions/{session}/cameras/{camera}/control
     * Acquire exclusive PTZ control of a camera.
     */
    public function acquireControl(Request $request, string $sessionId, int $cameraId): JsonResponse
    {
        $session = $this->authorizeSession($request, $sessionId);

        try {
            $control = $this->cameraService->acquireControl($cameraId, $session->id);

            $camera = app(\App\Repositories\CameraRepository::class)->findWithControl($cameraId);

            return response()->json([
                'data' => new CameraResource($camera),
                'message' => 'Camera control acquired.',
            ]);
        } catch (CameraNotControllableException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (CameraControlConflictException $e) {
            return response()->json(['message' => $e->getMessage()], 409);
        }
    }

    /**
     * DELETE /sessions/{session}/cameras/{camera}/control
     * Release PTZ control of a camera.
     */
    public function releaseControl(Request $request, string $sessionId, int $cameraId): JsonResponse
    {
        $session = $this->authorizeSession($request, $sessionId);

        $released = $this->cameraService->releaseControl($cameraId, $session->id);

        if (! $released) {
            return response()->json([
                'message' => 'You do not control this camera.',
            ], 422);
        }

        $camera = app(\App\Repositories\CameraRepository::class)->findWithControl($cameraId);

        return response()->json([
            'data' => new CameraResource($camera),
            'message' => 'Camera control released.',
        ]);
    }

    /**
     * POST /sessions/{session}/cameras/{camera}/move
     * Send a PTZ move command (up/down/left/right).
     */
    public function move(CameraMoveRequest $request, string $sessionId, int $cameraId): JsonResponse
    {
        $session = $this->authorizeSession($request, $sessionId);

        $direction = CameraPTZDirection::from($request->validated('direction'));

        try {
            $this->cameraService->move($cameraId, $session->id, $direction);

            return response()->json([
                'message' => "Camera moved {$direction->value}.",
            ]);
        } catch (CameraNotControllableException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (CameraControlConflictException $e) {
            return response()->json(['message' => $e->getMessage()], 409);
        }
    }

    /**
     * GET /sessions/{session}/cameras/resolutions
     * Get available resolution presets for camera streams.
     */
    public function resolutions(Request $request, string $sessionId): JsonResponse
    {
        $this->authorizeSession($request, $sessionId);

        return response()->json([
            'data' => Camera::getAvailableResolutions(),
        ]);
    }

    /**
     * PUT /sessions/{session}/cameras/{camera}/resolution
     * Change camera stream resolution during a session.
     * Restarts the ffmpeg stream with the new settings.
     * "auto" mode picks the best resolution for the camera type.
     */
    public function changeResolution(\App\Http\Requests\Camera\ChangeResolutionRequest $request, string $sessionId, int $cameraId): JsonResponse
    {
        $session = $this->authorizeSession($request, $sessionId);

        $validated = $request->validated();

        $camera = app(\App\Repositories\CameraRepository::class)->findOrFail($cameraId);

        // Delegate to service for business logic
        $result = $this->cameraService->changeResolution($camera, $validated, $this->gatewayService);

        return response()->json([
            'data' => new CameraResource($result['camera']),
            'message' => $result['message'],
            'stream_restarted' => $result['stream_restarted'],
            'api_available' => $result['api_available'],
        ]);
    }

    /**
     * GET /sessions/{session}/cameras/{camera}/hls
     * GET /sessions/{session}/cameras/{camera}/hls/{path}
     *
     * Proxy HLS requests to MediaMTX. This allows browsers to access HLS
     * streams through Laravel, avoiding direct LAN IP access issues.
     */
    public function hlsProxy(Request $request, string $sessionId, int $cameraId, ?string $path = null): \Illuminate\Http\Response
    {
        \Illuminate\Support\Facades\Log::info('HLS proxy request received', [
            'session_id' => $sessionId,
            'camera_id' => $cameraId,
            'path' => $path,
            'user_id' => $request->user()?->id,
        ]);

        $this->authorizeSession($request, $sessionId);

        $camera = app(\App\Repositories\CameraRepository::class)->findOrFail($cameraId);
        $camera->loadMissing('gatewayNode');

        $baseHost = $camera->gatewayNode?->ip ?? config('gateway.mediamtx_url', '192.168.50.7');
        $hlsPort = config('gateway.mediamtx_hls_port', 8888);

        // Build the upstream URL
        // Default path is the m3u8 playlist
        $streamPath = $path ?? 'index.m3u8';
        $upstreamUrl = "http://{$baseHost}:{$hlsPort}/{$camera->stream_key}/{$streamPath}";

        try {
            $response = Http::timeout(10)->get($upstreamUrl);

            if (! $response->successful()) {
                return response($response->body(), $response->status())
                    ->header('Content-Type', 'text/plain');
            }

            // Determine content type based on path
            $contentType = match (true) {
                str_ends_with($streamPath, '.m3u8') => 'application/vnd.apple.mpegurl',
                str_ends_with($streamPath, '.ts') => 'video/mp2t',
                str_ends_with($streamPath, '.mp4'), str_ends_with($streamPath, '.m4s') => 'video/mp4',
                default => 'application/octet-stream',
            };

            // For m3u8 playlists, rewrite URLs to go through our proxy
            $body = $response->body();
            if (str_ends_with($streamPath, '.m3u8')) {
                // Rewrite relative URLs in playlist to use our proxy
                $proxyBase = "/sessions/{$sessionId}/cameras/{$cameraId}/hls/";

                // Rewrite segment URLs (lines that don't start with # and aren't already absolute)
                $body = preg_replace(
                    '/^(?!\/)([^#\n][^\n]*\.(?:m3u8|ts|mp4|m4s))$/m',
                    $proxyBase.'$1',
                    $body
                );

                // Rewrite EXT-X-MAP URI (init segment) - only if not already absolute
                $body = preg_replace(
                    '/(#EXT-X-MAP:URI=")(?!\/)([^"]+)(")/m',
                    '${1}'.$proxyBase.'$2$3',
                    $body
                );

                // Rewrite EXT-X-PART URI - only if not already absolute (.*? to match across commas)
                $body = preg_replace(
                    '/(#EXT-X-PART:.*?URI=")(?!\/)([^"]+\.mp4)(")/m',
                    '${1}'.$proxyBase.'$2$3',
                    $body
                );

                // Rewrite EXT-X-PRELOAD-HINT URI - only if not already absolute (.*? to match across commas)
                $body = preg_replace(
                    '/(#EXT-X-PRELOAD-HINT:.*?URI=")(?!\/)([^"]+)(")/m',
                    '${1}'.$proxyBase.'$2$3',
                    $body
                );
            }

            return response($body, 200)
                ->header('Content-Type', $contentType)
                ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
                ->header('Access-Control-Allow-Origin', '*');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('HLS proxy failed', [
                'camera_id' => $cameraId,
                'stream_key' => $camera->stream_key,
                'upstream_url' => $upstreamUrl,
                'error' => $e->getMessage(),
            ]);

            return response('HLS proxy error: '.$e->getMessage(), 502)
                ->header('Content-Type', 'text/plain');
        }
    }

    /**
     * POST /sessions/{session}/cameras/{camera}/whep
     *
     * Proxy the WebRTC WHEP handshake to MediaMTX to avoid browser CORS issues.
     * The browser sends an SDP offer, we forward it to MediaMTX's WHEP endpoint,
     * and return the SDP answer. Only the signaling is proxied — the actual
     * WebRTC media stream flows directly between MediaMTX and the browser.
     */
    public function whepProxy(Request $request, string $sessionId, int $cameraId): \Illuminate\Http\Response
    {
        $this->authorizeSession($request, $sessionId);

        $camera = app(\App\Repositories\CameraRepository::class)->findOrFail($cameraId);
        $camera->loadMissing('gatewayNode');

        // Use the camera's gateway node IP — each camera streams from its own gateway
        $baseHost = $camera->gatewayNode?->ip ?? config('gateway.mediamtx_url', '192.168.50.7');
        $webrtcPort = config('gateway.mediamtx_webrtc_port', 8889);
        $whepUrl = "http://{$baseHost}:{$webrtcPort}/{$camera->stream_key}/whep";

        $sdpOffer = $request->getContent();

        try {
            $response = Http::withBody($sdpOffer, 'application/sdp')
                ->timeout(10)
                ->post($whepUrl);

            if (! $response->successful()) {
                return response($response->body(), $response->status())
                    ->header('Content-Type', 'text/plain');
            }

            // Forward the SDP answer and relevant headers back
            $result = response($response->body(), 201)
                ->header('Content-Type', 'application/sdp');

            // Forward Location header if present (used for ICE trickling in WHEP spec)
            if ($response->header('Location')) {
                $result->header('Location', $response->header('Location'));
            }

            // Forward ETag if present
            if ($response->header('ETag')) {
                $result->header('ETag', $response->header('ETag'));
            }

            return $result;
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('WHEP proxy failed', [
                'camera_id' => $cameraId,
                'stream_key' => $camera->stream_key,
                'whep_url' => $whepUrl,
                'error' => $e->getMessage(),
            ]);

            return response('WHEP proxy error: '.$e->getMessage(), 502)
                ->header('Content-Type', 'text/plain');
        }
    }

    /**
     * Authorize that the user owns the session (or is admin).
     */
    private function authorizeSession(Request $request, string $sessionId): VMSession
    {
        $session = VMSession::findOrFail($sessionId);

        if ($session->user_id !== $request->user()->id) {
            Gate::authorize('admin-only');
        }

        return $session;
    }
}
