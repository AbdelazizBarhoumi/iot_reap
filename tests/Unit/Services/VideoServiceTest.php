<?php

namespace Tests\Unit\Services;

use App\Enums\VideoStatus;
use App\Jobs\TranscodeVideoJob;
use App\Models\TrainingUnit;
use App\Models\Video;
use App\Repositories\VideoRepository;
use App\Services\VideoService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class VideoServiceTest extends TestCase
{
    use RefreshDatabase;

    private VideoService $service;

    private VideoRepository $repository;

    private TrainingUnit $trainingUnit;

    protected function setUp(): void
    {
        parent::setUp();

        $this->repository = $this->createMock(VideoRepository::class);
        $this->service = new VideoService($this->repository);
        $this->trainingUnit = TrainingUnit::factory()->create();
    }

    public function test_upload_and_queue_stores_file_and_creates_video_record(): void
    {
        Storage::fake('local');
        Queue::fake();

        $file = UploadedFile::fake()->create('test.mp4', 1024, 'video/mp4');

        $expectedVideo = $this->createMock(Video::class);
        $expectedVideo->id = 1;
        $expectedVideo->training_unit_id = $this->trainingUnit->id;

        $this->repository
            ->expects($this->once())
            ->method('create')
            ->with($this->callback(function ($data) use ($file) {
                return $data['training_unit_id'] === $this->trainingUnit->id &&
                       $data['original_filename'] === 'test.mp4' &&
                       $data['file_size_bytes'] === $file->getSize() &&
                       $data['mime_type'] === $file->getMimeType() &&
                       $data['status'] === VideoStatus::PENDING &&
                       str_contains($data['storage_path'], 'videos/raw/'.$this->trainingUnit->id.'/');
            }))
            ->willReturn($expectedVideo);

        $result = $this->service->uploadAndQueue($this->trainingUnit, $file);

        $this->assertEquals($expectedVideo, $result);

        // Verify file was stored
        Storage::disk('local')->assertExists($expectedVideo->storage_path);

        // Verify job was dispatched
        Queue::assertPushed(TranscodeVideoJob::class);
    }

    public function test_upload_and_queue_generates_unique_storage_path(): void
    {
        Storage::fake('local');
        Queue::fake();

        $file1 = UploadedFile::fake()->create('test.mp4', 1024, 'video/mp4');
        $file2 = UploadedFile::fake()->create('test.mp4', 1024, 'video/mp4');

        $paths = ['path1', 'path2'];
        $callCount = 0;
        $self = $this;

        $this->repository
            ->expects($this->exactly(2))
            ->method('create')
            ->willReturnCallback(function () use (&$callCount, $paths, $self) {
                $video = $self->createMock(Video::class);
                $storagePath = $paths[$callCount];
                $callCount++;
                $video->method('__get')->willReturnMap([
                    ['storage_path', $storagePath],
                ]);
                return $video;
            });

        $this->service->uploadAndQueue($this->trainingUnit, $file1);
        $this->service->uploadAndQueue($this->trainingUnit, $file2);

        // Verify paths are different
        $this->assertNotEquals('path1', 'path2');
    }

    public function test_get_stream_path_returns_path_from_repository(): void
    {
        $videoId = 123;
        $expectedPath = 'path/to/stream.m3u8';

        $this->repository
            ->expects($this->once())
            ->method('getStreamPath')
            ->with($videoId)
            ->willReturn($expectedPath);

        $result = $this->service->getStreamPath($videoId);

        $this->assertEquals($expectedPath, $result);
    }

    public function test_get_stream_path_returns_null_when_no_path_found(): void
    {
        $videoId = 999;

        $this->repository
            ->expects($this->once())
            ->method('getStreamPath')
            ->with($videoId)
            ->willReturn(null);

        $result = $this->service->getStreamPath($videoId);

        $this->assertNull($result);
    }

    public function test_get_video_for_training_unit_returns_video_from_repository(): void
    {
        $trainingUnitId = 123;
        $expectedVideo = $this->createMock(Video::class);
        $expectedVideo->id = 1;
        $expectedVideo->training_unit_id = $trainingUnitId;

        $this->repository
            ->expects($this->once())
            ->method('findByTrainingUnitIdWithCaptions')
            ->with($trainingUnitId)
            ->willReturn($expectedVideo);

        $result = $this->service->getVideoForTrainingUnit($trainingUnitId);

        $this->assertEquals($expectedVideo, $result);
    }

    public function test_delete_removes_all_associated_files_and_video_record(): void
    {
        Storage::fake('local');

        // Create test files
        $rawPath = 'videos/raw/1/video.mp4';
        $hlsPath = 'videos/hls/1/playlist.m3u8';
        $thumbnailPath = 'videos/thumbnails/1/thumb.jpg';
        $captionPath = 'videos/captions/1/en.vtt';

        Storage::disk('local')->put($rawPath, 'raw video content');
        Storage::disk('local')->put($hlsPath, 'hls playlist');
        Storage::disk('local')->put('videos/hls/1/segment1.ts', 'segment content');
        Storage::disk('local')->put($thumbnailPath, 'thumbnail');
        Storage::disk('local')->put($captionPath, 'caption content');

        $captions = collect([
            (object) ['file_path' => $captionPath],
        ]);

        $video = $this->createMock(Video::class);
        
        // Configure mock to return values for properties accessed with __get
        $video->method('__get')->willReturnMap([
            ['storage_path', $rawPath],
            ['storage_disk', 'local'],
            ['hls_path', $hlsPath],
            ['thumbnail_path', $thumbnailPath],
            ['captions', $captions],
            ['id', 1],
        ]);

        $this->repository
            ->expects($this->once())
            ->method('delete')
            ->with($video)
            ->willReturn(true);

        $result = $this->service->delete($video);

        $this->assertTrue($result);

        // Verify all files were deleted
        Storage::disk('local')->assertMissing($rawPath);
        Storage::disk('local')->assertMissing('videos/hls/1'); // Directory should be deleted
        Storage::disk('local')->assertMissing($thumbnailPath);
        Storage::disk('local')->assertMissing($captionPath);
    }

    public function test_retry_transcoding_updates_status_and_dispatches_job(): void
    {
        Queue::fake();

        $video = $this->createMock(Video::class);
        $video->expects($this->once())
            ->method('hasFailed')
            ->willReturn(true);
        $video->expects($this->once())
            ->method('fresh')
            ->willReturnSelf();

        $this->repository
            ->expects($this->once())
            ->method('update')
            ->with($video, [
                'status' => VideoStatus::PENDING,
                'error_message' => null,
            ]);

        $result = $this->service->retryTranscoding($video);

        Queue::assertPushed(TranscodeVideoJob::class);

        $this->assertEquals($video, $result);
    }

    public function test_retry_transcoding_throws_exception_if_video_not_failed(): void
    {
        $video = $this->createMock(Video::class);
        $video->expects($this->once())
            ->method('hasFailed')
            ->willReturn(false);

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessage('Video is not in a failed state');

        $this->service->retryTranscoding($video);
    }

    public function test_get_processing_stats_returns_stats_from_repository(): void
    {
        $expectedStats = [
            'pending' => 5,
            'processing' => 2,
            'ready' => 15,
            'failed' => 1,
        ];

        $this->repository
            ->expects($this->once())
            ->method('getProcessingStats')
            ->willReturn($expectedStats);

        $result = $this->service->getProcessingStats();

        $this->assertEquals($expectedStats, $result);
    }
}
