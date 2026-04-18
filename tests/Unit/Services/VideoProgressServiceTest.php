<?php

namespace Tests\Unit\Services;

use App\Models\User;
use App\Models\Video;
use App\Models\VideoProgress;
use App\Repositories\VideoProgressRepository;
use App\Services\VideoProgressService;
use Illuminate\Database\Eloquent\Collection;
use Tests\TestCase;

class VideoProgressServiceTest extends TestCase
{

    private VideoProgressService $service;

    private VideoProgressRepository $repository;

    private User $user;

    private Video $video;

    protected function setUp(): void
    {
        parent::setUp();

        $this->repository = $this->createMock(VideoProgressRepository::class);
        $this->service = new VideoProgressService($this->repository);
        $this->user = User::factory()->create();
        $this->video = $this->createMock(Video::class);
        $this->video->id = 1;
    }

    public function test_save_progress_finds_or_creates_progress_and_updates_it(): void
    {
        $seconds = 120;
        $progress = new VideoProgress([
            'user_id' => $this->user->id,
            'video_id' => $this->video->id,
            'watched_seconds' => $seconds,
        ]);
        $updatedProgress = new VideoProgress([
            'user_id' => $this->user->id,
            'video_id' => $this->video->id,
            'watched_seconds' => $seconds,
        ]);

        $this->repository
            ->expects($this->once())
            ->method('findOrCreate')
            ->with($this->user, $this->video)
            ->willReturn($progress);

        $this->repository
            ->expects($this->once())
            ->method('updateProgress')
            ->with($progress, $seconds)
            ->willReturn($updatedProgress);

        $result = $this->service->saveProgress($this->user, $this->video, $seconds);

        $this->assertEquals($updatedProgress, $result);
    }

    public function test_get_progress_returns_progress_from_repository(): void
    {
        $expectedProgress = new VideoProgress([
            'user_id' => $this->user->id,
            'video_id' => $this->video->id,
            'watched_seconds' => 60,
        ]);

        $this->repository
            ->expects($this->once())
            ->method('findByUserAndVideo')
            ->with($this->user, $this->video)
            ->willReturn($expectedProgress);

        $result = $this->service->getProgress($this->user, $this->video);

        $this->assertEquals($expectedProgress, $result);
    }

    public function test_get_progress_returns_null_when_no_progress_found(): void
    {
        $this->repository
            ->expects($this->once())
            ->method('findByUserAndVideo')
            ->with($this->user, $this->video)
            ->willReturn(null);

        $result = $this->service->getProgress($this->user, $this->video);

        $this->assertNull($result);
    }

    public function test_get_progress_position_returns_watched_seconds_from_progress(): void
    {
        $watchedSeconds = 180;
        $progress = new VideoProgress(['watched_seconds' => $watchedSeconds]);

        $this->repository
            ->expects($this->once())
            ->method('findByUserAndVideo')
            ->with($this->user, $this->video)
            ->willReturn($progress);

        $result = $this->service->getProgressPosition($this->user, $this->video);

        $this->assertEquals($watchedSeconds, $result);
    }

    public function test_get_progress_position_returns_zero_when_no_progress(): void
    {
        $this->repository
            ->expects($this->once())
            ->method('findByUserAndVideo')
            ->with($this->user, $this->video)
            ->willReturn(null);

        $result = $this->service->getProgressPosition($this->user, $this->video);

        $this->assertEquals(0, $result);
    }

    public function test_mark_as_completed_finds_or_creates_progress_and_marks_completed(): void
    {
        $progress = new VideoProgress([
            'user_id' => $this->user->id,
            'video_id' => $this->video->id,
        ]);
        $completedProgress = new VideoProgress([
            'user_id' => $this->user->id,
            'video_id' => $this->video->id,
            'completed' => true,
        ]);

        $this->repository
            ->expects($this->once())
            ->method('findOrCreate')
            ->with($this->user, $this->video)
            ->willReturn($progress);

        $this->repository
            ->expects($this->once())
            ->method('markAsCompleted')
            ->with($progress)
            ->willReturn($completedProgress);

        $result = $this->service->markAsCompleted($this->user, $this->video);

        $this->assertEquals($completedProgress, $result);
    }

    public function test_has_completed_returns_true_when_progress_is_complete(): void
    {
        $progress = $this->createMock(VideoProgress::class);
        $progress->expects($this->once())
            ->method('isComplete')
            ->willReturn(true);

        $this->repository
            ->expects($this->once())
            ->method('findByUserAndVideo')
            ->with($this->user, $this->video)
            ->willReturn($progress);

        $result = $this->service->hasCompleted($this->user, $this->video);

        $this->assertTrue($result);
    }

    public function test_has_completed_returns_false_when_no_progress(): void
    {
        $this->repository
            ->expects($this->once())
            ->method('findByUserAndVideo')
            ->with($this->user, $this->video)
            ->willReturn(null);

        $result = $this->service->hasCompleted($this->user, $this->video);

        $this->assertFalse($result);
    }

    public function test_get_completion_percentage_delegates_to_video_model(): void
    {
        $expectedPercentage = 75;

        $this->video
            ->expects($this->once())
            ->method('getCompletionPercentage')
            ->with($this->user)
            ->willReturn($expectedPercentage);

        $result = $this->service->getCompletionPercentage($this->user, $this->video);

        $this->assertEquals($expectedPercentage, $result);
    }

    public function test_reset_progress_calls_repository_reset_progress(): void
    {
        $this->repository
            ->expects($this->once())
            ->method('resetProgress')
            ->with($this->user, $this->video);

        $this->service->resetProgress($this->user, $this->video);
    }

    public function test_get_total_watch_time_for_user_returns_time_from_repository(): void
    {
        $expectedTime = 3600; // 1 hour in seconds

        $this->repository
            ->expects($this->once())
            ->method('getTotalWatchTimeForUser')
            ->with($this->user)
            ->willReturn($expectedTime);

        $result = $this->service->getTotalWatchTimeForUser($this->user);

        $this->assertEquals($expectedTime, $result);
    }

    public function test_get_completed_count_for_user_returns_count_from_repository(): void
    {
        $expectedCount = 15;

        $this->repository
            ->expects($this->once())
            ->method('getCompletedCountForUser')
            ->with($this->user)
            ->willReturn($expectedCount);

        $result = $this->service->getCompletedCountForUser($this->user);

        $this->assertEquals($expectedCount, $result);
    }

    public function test_get_progress_for_training_path_returns_mapped_progress_array(): void
    {
        $trainingPathId = 42;
        $progressRecords = new Collection([
            (object) [
                'video_id' => 1,
                'watched_seconds' => 120,
                'completed' => true,
                'percentage' => 80,
                'video' => (object) ['training_unit_id' => 10],
            ],
            (object) [
                'video_id' => 2,
                'watched_seconds' => 60,
                'completed' => false,
                'percentage' => 40,
                'video' => (object) ['training_unit_id' => 11],
            ],
        ]);

        $expectedResult = [
            [
                'video_id' => 1,
                'training_unit_id' => 10,
                'watched_seconds' => 120,
                'completed' => true,
                'percentage' => 80,
            ],
            [
                'video_id' => 2,
                'training_unit_id' => 11,
                'watched_seconds' => 60,
                'completed' => false,
                'percentage' => 40,
            ],
        ];

        $this->repository
            ->expects($this->once())
            ->method('getForUserAndTrainingPath')
            ->with($this->user, $trainingPathId)
            ->willReturn($progressRecords);

        $result = $this->service->getProgressForTrainingPath($this->user, $trainingPathId);

        $this->assertEquals($expectedResult, $result);
    }
}
