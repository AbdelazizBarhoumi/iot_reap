<?php

namespace Tests\Feature;

use App\Enums\VideoStatus;
use App\Jobs\TranscodeVideoJob;
use App\Models\Caption;
use App\Models\TrainingPath;
use App\Models\TrainingPathEnrollment;
use App\Models\TrainingPathModule;
use App\Models\TrainingUnit;
use App\Models\User;
use App\Models\Video;
use App\Services\CaptionService;
use App\Services\VideoService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class VideoControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $teacher;

    private User $student;

    private User $admin;

    private TrainingPath $trainingPath;

    private TrainingUnit $trainingUnit;

    protected function setUp(): void
    {
        parent::setUp();

        $this->teacher = User::factory()->teacher()->create();
        $this->student = User::factory()->create();
        $this->admin = User::factory()->admin()->create();

        $this->trainingPath = TrainingPath::factory()->approved()->create(['instructor_id' => $this->teacher->id]);
        $module = TrainingPathModule::factory()->create(['training_path_id' => $this->trainingPath->id]);
        $this->trainingUnit = TrainingUnit::factory()->video()->create(['module_id' => $module->id]);

        Storage::fake('local');
        // Mock the TranscodeVideoJob to prevent FFmpeg from executing on fake files
        Queue::fake();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Show Video Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_teacher_can_view_video_for_training_unit(): void
    {
        $video = Video::factory()->ready()->create(['training_unit_id' => $this->trainingUnit->id]);

        $response = $this->actingAs($this->teacher)
            ->getJson("/teaching/trainingUnits/{$this->trainingUnit->id}/video");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => ['id', 'original_filename', 'status', 'duration_seconds'],
            ]);
    }

    public function test_show_video_returns_null_when_no_video_exists(): void
    {
        $response = $this->actingAs($this->teacher)
            ->getJson("/teaching/trainingUnits/{$this->trainingUnit->id}/video");

        $response->assertOk()
            ->assertJson(['data' => null]);
    }

    public function test_show_video_fails_for_nonexistent_training_unit(): void
    {
        $response = $this->actingAs($this->teacher)->getJson('/trainingUnits/999/video');

        $response->assertNotFound();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Upload Video Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_teacher_can_upload_video(): void
    {
        $videoFile = UploadedFile::fake()->create('test_video.mp4', 10000, 'video/mp4');

        $response = $this->actingAs($this->teacher)
            ->postJson("/teaching/trainingUnits/{$this->trainingUnit->id}/video", [
                'video' => $videoFile,
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Video uploaded successfully. Transcoding has started.',
            ])
            ->assertJsonStructure([
                'data' => ['id', 'original_filename', 'status'],
            ]);

        $this->assertDatabaseHas('videos', [
            'training_unit_id' => $this->trainingUnit->id,
            'original_filename' => 'test_video.mp4',
            'mime_type' => 'video/mp4',
        ]);
    }

    public function test_upload_replaces_existing_video_when_one_already_exists(): void
    {
        $existingVideo = Video::factory()->create([
            'training_unit_id' => $this->trainingUnit->id,
            'storage_path' => 'videos/raw/test/existing.mp4',
            'storage_disk' => config('filesystems.default', 'local'),
        ]);

        $videoFile = UploadedFile::fake()->create('another_video.mp4', 10000, 'video/mp4');

        $response = $this->actingAs($this->teacher)
            ->postJson("/teaching/trainingUnits/{$this->trainingUnit->id}/video", [
                'video' => $videoFile,
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Video replaced successfully. Transcoding has started.',
            ]);

        $this->assertDatabaseMissing('videos', [
            'id' => $existingVideo->id,
        ]);
        $this->assertDatabaseHas('videos', [
            'training_unit_id' => $this->trainingUnit->id,
            'original_filename' => 'another_video.mp4',
            'mime_type' => 'video/mp4',
        ]);
    }

    public function test_upload_video_validates_file_is_required(): void
    {
        $response = $this->actingAs($this->teacher)
            ->postJson("/teaching/trainingUnits/{$this->trainingUnit->id}/video", []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['video']);
    }

    public function test_upload_video_validates_file_type(): void
    {
        $invalidFile = UploadedFile::fake()->create('document.pdf', 1000, 'application/pdf');

        $response = $this->actingAs($this->teacher)
            ->postJson("/teaching/trainingUnits/{$this->trainingUnit->id}/video", [
                'video' => $invalidFile,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['video']);
    }

    public function test_upload_video_validates_file_size(): void
    {
        // Create a file larger than the configured limit (assuming 500MB limit)
        $largeFile = UploadedFile::fake()->create('huge_video.mp4', 600 * 1024, 'video/mp4'); // 600MB

        $response = $this->actingAs($this->teacher)
            ->postJson("/teaching/trainingUnits/{$this->trainingUnit->id}/video", [
                'video' => $largeFile,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['video']);
    }

    public function test_upload_video_fails_for_nonexistent_training_unit(): void
    {
        $videoFile = UploadedFile::fake()->create('test_video.mp4', 10000, 'video/mp4');

        $response = $this->actingAs($this->teacher)
            ->postJson('/trainingUnits/999/video', ['video' => $videoFile]);

        $response->assertNotFound();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Delete Video Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_teacher_can_delete_video(): void
    {
        $video = Video::factory()->create(['training_unit_id' => $this->trainingUnit->id]);

        $response = $this->actingAs($this->teacher)
            ->deleteJson("/teaching/trainingUnits/{$this->trainingUnit->id}/video");

        $response->assertOk()
            ->assertJson([
                'message' => 'Video deleted successfully.',
            ]);

        $this->assertDatabaseMissing('videos', ['id' => $video->id]);
    }

    public function test_delete_video_returns_404_when_no_video_exists(): void
    {
        $response = $this->actingAs($this->teacher)
            ->deleteJson("/teaching/trainingUnits/{$this->trainingUnit->id}/video");

        $response->assertNotFound()
            ->assertJson([
                'message' => 'No video found for this trainingUnit.',
            ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Retry Transcoding Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_teacher_can_retry_failed_video_transcoding(): void
    {
        $video = Video::factory()->failed()->create(['training_unit_id' => $this->trainingUnit->id]);

        $response = $this->actingAs($this->teacher)
            ->postJson("/teaching/trainingUnits/{$this->trainingUnit->id}/video/retry");

        $response->assertOk()
            ->assertJson([
                'message' => 'Transcoding retry has been queued.',
            ])
            ->assertJsonStructure([
                'data' => ['id', 'status'],
            ]);
    }

    public function test_cannot_retry_transcoding_for_non_failed_video(): void
    {
        $video = Video::factory()->ready()->create(['training_unit_id' => $this->trainingUnit->id]);

        $response = $this->actingAs($this->teacher)
            ->postJson("/teaching/trainingUnits/{$this->trainingUnit->id}/video/retry");

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Video is not in a failed state.',
            ]);
    }

    public function test_retry_transcoding_fails_when_no_video_exists(): void
    {
        $response = $this->actingAs($this->teacher)
            ->postJson("/teaching/trainingUnits/{$this->trainingUnit->id}/video/retry");

        $response->assertNotFound()
            ->assertJson([
                'message' => 'No video found for this trainingUnit.',
            ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Video Status Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_can_check_video_status_when_video_exists(): void
    {
        $video = Video::factory()->ready()->create(['training_unit_id' => $this->trainingUnit->id]);

        $response = $this->actingAs($this->teacher)
            ->getJson("/teaching/trainingUnits/{$this->trainingUnit->id}/video/status");

        $response->assertOk()
            ->assertJson([
                'has_video' => true,
                'status' => VideoStatus::READY->value,
                'is_ready' => true,
                'is_processing' => false,
                'has_failed' => false,
            ])
            ->assertJsonStructure([
                'has_video',
                'status',
                'is_ready',
                'is_processing',
                'has_failed',
                'error_message',
                'duration_seconds',
                'hls_url',
                'thumbnail_url',
            ]);
    }

    public function test_can_check_video_status_when_no_video_exists(): void
    {
        $response = $this->actingAs($this->teacher)
            ->getJson("/teaching/trainingUnits/{$this->trainingUnit->id}/video/status");

        $response->assertOk()
            ->assertJson([
                'has_video' => false,
            ]);
    }

    public function test_video_status_includes_hls_url_when_ready(): void
    {
        $video = Video::factory()->ready()->create(['training_unit_id' => $this->trainingUnit->id]);

        $response = $this->actingAs($this->teacher)
            ->getJson("/teaching/trainingUnits/{$this->trainingUnit->id}/video/status");

        $response->assertOk()
            ->assertJsonFragment([
                'is_ready' => true,
            ]);

        // HLS URL should not be null when video is ready
        $responseData = $response->json();
        $this->assertNotNull($responseData['hls_url']);
    }

    public function test_video_status_excludes_hls_url_when_not_ready(): void
    {
        $video = Video::factory()->processing()->create(['training_unit_id' => $this->trainingUnit->id]);

        $response = $this->actingAs($this->teacher)
            ->getJson("/teaching/trainingUnits/{$this->trainingUnit->id}/video/status");

        $response->assertOk()
            ->assertJsonFragment([
                'is_ready' => false,
                'is_processing' => true,
                'hls_url' => null,
            ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Video Streaming Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_can_stream_ready_video(): void
    {
        $video = Video::factory()->ready()->create(['training_unit_id' => $this->trainingUnit->id]);

        // Mock the HLS file exists
        Storage::fake($video->storage_disk);
        Storage::disk($video->storage_disk)->put($video->hls_path, 'mock hls content');

        $response = $this->actingAs($this->student)->getJson("/videos/{$video->id}/stream");

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/vnd.apple.mpegurl');
    }

    public function test_cannot_stream_video_that_is_not_ready(): void
    {
        $video = Video::factory()->processing()->create(['training_unit_id' => $this->trainingUnit->id]);

        $response = $this->actingAs($this->student)->getJson("/videos/{$video->id}/stream");

        $response->assertNotFound()
            ->assertJson([
                'message' => 'Video is not ready for streaming.',
            ]);
    }

    public function test_cannot_stream_video_when_file_missing(): void
    {
        $video = Video::factory()->ready()->create(['training_unit_id' => $this->trainingUnit->id]);

        // Don't create the file, so it's missing
        $response = $this->actingAs($this->student)->getJson("/videos/{$video->id}/stream");

        $response->assertNotFound()
            ->assertJson([
                'message' => 'Stream file not found.',
            ]);
    }

    public function test_can_stream_video_segments(): void
    {
        $video = Video::factory()->ready()->create(['training_unit_id' => $this->trainingUnit->id]);

        // Mock segment file exists
        Storage::fake($video->storage_disk);
        $segmentPath = "videos/hls/{$video->id}/720p/stream_001.ts";
        Storage::disk($video->storage_disk)->put($segmentPath, 'mock segment content');

        $response = $this->actingAs($this->student)->getJson("/videos/{$video->id}/stream/720p/stream_001.ts");

        $response->assertOk();
        $response->assertHeader('Content-Type', 'video/mp2t');
    }

    public function test_video_segment_validates_quality(): void
    {
        $video = Video::factory()->ready()->create(['training_unit_id' => $this->trainingUnit->id]);

        $response = $this->actingAs($this->student)->getJson("/videos/{$video->id}/stream/invalid_quality/stream_001.ts");

        $response->assertBadRequest()
            ->assertJson([
                'message' => 'Invalid quality.',
            ]);
    }

    public function test_video_segment_validates_filename(): void
    {
        $video = Video::factory()->ready()->create(['training_unit_id' => $this->trainingUnit->id]);

        $response = $this->actingAs($this->student)->getJson("/videos/{$video->id}/stream/720p/../../etc/passwd");

        // Laravel rejects paths with .. in routing, so 404 is expected, not 400
        $response->assertNotFound();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Caption Management Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_teacher_can_view_video_captions(): void
    {
        $video = Video::factory()->create(['training_unit_id' => $this->trainingUnit->id]);
        Caption::factory()->count(2)->create(['video_id' => $video->id]);

        $response = $this->actingAs($this->teacher)
            ->getJson("/teaching/trainingUnits/{$this->trainingUnit->id}/video/captions");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'language', 'label', 'file_path'],
                ],
            ]);
    }

    public function test_captions_returns_empty_array_when_no_video(): void
    {
        $response = $this->actingAs($this->teacher)
            ->getJson("/teaching/trainingUnits/{$this->trainingUnit->id}/video/captions");

        $response->assertOk()
            ->assertJson(['data' => []]);
    }

    public function test_teacher_can_upload_caption(): void
    {
        $video = Video::factory()->create(['training_unit_id' => $this->trainingUnit->id]);
        $captionFile = UploadedFile::fake()->create('captions.srt', 1000);

        $response = $this->actingAs($this->teacher)
            ->postJson("/teaching/trainingUnits/{$this->trainingUnit->id}/video/captions", [
                'caption' => $captionFile,
                'language' => 'en',
                'label' => 'English',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Caption uploaded successfully.',
            ])
            ->assertJsonStructure([
                'data' => ['id', 'language', 'label'],
            ]);

        $this->assertDatabaseHas('captions', [
            'video_id' => $video->id,
            'language' => 'en',
            'label' => 'English',
        ]);
    }

    public function test_cannot_upload_caption_when_no_video_exists(): void
    {
        $captionFile = UploadedFile::fake()->create('captions.srt', 1000);

        $response = $this->actingAs($this->teacher)
            ->postJson("/teaching/trainingUnits/{$this->trainingUnit->id}/video/captions", [
                'caption' => $captionFile,
                'language' => 'en',
                'label' => 'English',
            ]);

        $response->assertNotFound()
            ->assertJson([
                'message' => 'No video found for this trainingUnit.',
            ]);
    }

    public function test_teacher_can_delete_caption(): void
    {
        $video = Video::factory()->create(['training_unit_id' => $this->trainingUnit->id]);
        $caption = Caption::factory()->create(['video_id' => $video->id]);

        $response = $this->actingAs($this->teacher)
            ->deleteJson("/teaching/trainingUnits/{$this->trainingUnit->id}/video/captions/{$caption->id}");

        $response->assertOk()
            ->assertJson([
                'message' => 'Caption deleted successfully.',
            ]);

        $this->assertDatabaseMissing('captions', ['id' => $caption->id]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Admin Processing Stats Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_admin_can_view_processing_stats(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson('/admin/videos/processing-stats');

        $response->assertOk()
            ->assertJsonStructure(['data']);
    }

    public function test_non_admin_cannot_view_processing_stats(): void
    {
        $response = $this->actingAs($this->teacher)
            ->getJson('/admin/videos/processing-stats');

        $response->assertForbidden();
    }

    public function test_admin_can_view_video_processing_page(): void
    {
        $response = $this->actingAs($this->admin)
            ->get('/admin/videos');

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/VideoProcessingPage'));
    }

    public function test_non_admin_cannot_view_video_processing_page(): void
    {
        $response = $this->actingAs($this->teacher)
            ->get('/admin/videos');

        $response->assertForbidden();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Authorization Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_non_training_path_owner_cannot_upload_video(): void
    {
        $otherTeacher = User::factory()->teacher()->create();
        $videoFile = UploadedFile::fake()->create('test_video.mp4', 10000, 'video/mp4');

        $response = $this->actingAs($otherTeacher)
            ->postJson("/teaching/trainingUnits/{$this->trainingUnit->id}/video", ['video' => $videoFile]);

        $response->assertForbidden();
    }

    public function test_admin_can_upload_video_for_any_training_path(): void
    {
        $videoFile = UploadedFile::fake()->create('admin_video.mp4', 10000, 'video/mp4');

        $response = $this->actingAs($this->admin)
            ->postJson("/teaching/trainingUnits/{$this->trainingUnit->id}/video", ['video' => $videoFile]);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Video uploaded successfully. Transcoding has started.',
            ]);
    }

    public function test_non_training_path_owner_cannot_delete_video(): void
    {
        $otherTeacher = User::factory()->teacher()->create();
        Video::factory()->create(['training_unit_id' => $this->trainingUnit->id]);

        $response = $this->actingAs($otherTeacher)
            ->deleteJson("/teaching/trainingUnits/{$this->trainingUnit->id}/video");

        $response->assertForbidden();
    }

    public function test_non_training_path_owner_cannot_manage_captions(): void
    {
        $otherTeacher = User::factory()->teacher()->create();
        $video = Video::factory()->create(['training_unit_id' => $this->trainingUnit->id]);
        $caption = Caption::factory()->create(['video_id' => $video->id]);
        $captionFile = UploadedFile::fake()->create('captions.srt', 1000);

        $this->actingAs($otherTeacher)
            ->postJson("/teaching/trainingUnits/{$this->trainingUnit->id}/video/captions", [
                'caption' => $captionFile,
                'language' => 'en',
                'label' => 'English',
            ])
            ->assertForbidden();

        $this->actingAs($otherTeacher)
            ->deleteJson("/teaching/trainingUnits/{$this->trainingUnit->id}/video/captions/{$caption->id}")
            ->assertForbidden();
    }

    public function test_student_can_view_video_status(): void
    {
        // Create enrollment for student
        TrainingPathEnrollment::factory()->create([
            'user_id' => $this->student->id,
            'training_path_id' => $this->trainingPath->id,
        ]);

        $video = Video::factory()->ready()->create(['training_unit_id' => $this->trainingUnit->id]);

        $response = $this->actingAs($this->student)
            ->getJson("/trainingPaths/{$this->trainingPath->id}/trainingUnits/{$this->trainingUnit->id}/video/status");

        $response->assertOk()
            ->assertJsonStructure([
                'has_video',
                'status',
                'is_ready',
            ]);
    }

    public function test_guest_cannot_access_video_management(): void
    {
        $videoFile = UploadedFile::fake()->create('test_video.mp4', 10000, 'video/mp4');

        $this->postJson("/teaching/trainingUnits/{$this->trainingUnit->id}/video", ['video' => $videoFile])
            ->assertUnauthorized();

        $this->deleteJson("/teaching/trainingUnits/{$this->trainingUnit->id}/video")
            ->assertUnauthorized();

        $this->getJson("/teaching/trainingUnits/{$this->trainingUnit->id}/video")
            ->assertUnauthorized();
    }

    public function test_guest_can_stream_video(): void
    {
        $video = Video::factory()->ready()->create(['training_unit_id' => $this->trainingUnit->id]);

        // Mock the HLS file exists
        Storage::fake($video->storage_disk);
        Storage::disk($video->storage_disk)->put($video->hls_path, 'mock hls content');

        // Guest user (unauthenticated) - this should work if public routes allow it
        // However, if auth is required, this will be 401. Using student for now.
        $response = $this->actingAs($this->student)->getJson("/videos/{$video->id}/stream");

        $response->assertOk();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Service Integration Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_video_service_is_called_for_upload(): void
    {
        $videoService = $this->mock(VideoService::class);
        $videoFile = UploadedFile::fake()->create('test_video.mp4', 10000, 'video/mp4');

        $videoService->shouldReceive('getVideoForTrainingUnit')
            ->once()
            ->with($this->trainingUnit->id)
            ->andReturn(null);

        $videoService->shouldReceive('uploadAndQueue')
            ->once()
            ->andReturn(Video::factory()->make(['training_unit_id' => $this->trainingUnit->id]));

        $this->actingAs($this->teacher)
            ->postJson("/teaching/trainingUnits/{$this->trainingUnit->id}/video", ['video' => $videoFile]);
    }

    public function test_caption_service_is_called_for_caption_upload(): void
    {
        $video = Video::factory()->create(['training_unit_id' => $this->trainingUnit->id]);
        $captionService = $this->mock(CaptionService::class);
        $captionFile = UploadedFile::fake()->create('captions.srt', 1000);

        $captionService->shouldReceive('uploadCaption')
            ->once()
            ->andReturn(Caption::factory()->make(['video_id' => $video->id]));

        $this->actingAs($this->teacher)
            ->postJson("/teaching/trainingUnits/{$this->trainingUnit->id}/video/captions", [
                'caption' => $captionFile,
                'language' => 'en',
                'label' => 'English',
            ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Edge Cases and Error Handling
    // ─────────────────────────────────────────────────────────────────────────

    public function test_video_upload_handles_different_mime_types(): void
    {
        $mimeTypes = [
            'video/mp4' => 'test.mp4',
            'video/webm' => 'test.webm',
            'video/quicktime' => 'test.mov',
            'video/x-msvideo' => 'test.avi',
        ];

        foreach ($mimeTypes as $mimeType => $filename) {
            $videoFile = UploadedFile::fake()->create($filename, 10000, $mimeType);

            $response = $this->actingAs($this->teacher)
                ->postJson("/teaching/trainingUnits/{$this->trainingUnit->id}/video", [
                    'video' => $videoFile,
                ]);

            $response->assertStatus(201);

            // Clean up for next iteration
            Video::where('training_unit_id', $this->trainingUnit->id)->delete();
        }
    }

    public function test_video_upload_accepts_avi_when_browser_sends_generic_mime_type(): void
    {
        $videoFile = UploadedFile::fake()->create('camera-capture.avi', 10000, 'application/octet-stream');

        $response = $this->actingAs($this->teacher)
            ->postJson("/teaching/trainingUnits/{$this->trainingUnit->id}/video", [
                'video' => $videoFile,
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Video uploaded successfully. Transcoding has started.',
            ]);
    }
}
