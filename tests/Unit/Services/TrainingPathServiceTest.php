<?php

namespace Tests\Unit\Services;

use App\Enums\TrainingPathStatus;
use App\Models\TrainingPath;
use App\Models\User;
use App\Repositories\TrainingPathModuleRepository;
use App\Repositories\TrainingPathRepository;
use App\Repositories\TrainingUnitRepository;
use App\Repositories\TrainingUnitVMAssignmentRepository;
use App\Services\TrainingPathCacheService;
use App\Services\TrainingPathService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class TrainingPathServiceTest extends TestCase
{
    use RefreshDatabase;

    private TrainingPathService $trainingPathService;

    private TrainingPathRepository $trainingPathRepository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->trainingPathRepository = app(TrainingPathRepository::class);
        $moduleRepository = app(TrainingPathModuleRepository::class);
        $trainingUnitRepository = app(TrainingUnitRepository::class);
        $vmAssignmentRepository = app(TrainingUnitVMAssignmentRepository::class);
        $cacheService = app(TrainingPathCacheService::class);
        $this->trainingPathService = new TrainingPathService(
            $this->trainingPathRepository,
            $moduleRepository,
            $trainingUnitRepository,
            $vmAssignmentRepository,
            $cacheService
        );
    }

    public function test_create_training_path(): void
    {
        $instructor = User::factory()->create();

        $data = [
            'title' => 'Test Training Path',
            'description' => 'Test Training Path Description',
            'category' => 'Smart Manufacturing',
            'level' => 'Beginner',
            'duration' => '40 hours',
        ];

        $trainingPath = $this->trainingPathService->createTrainingPath($instructor, $data);

        $this->assertInstanceOf(TrainingPath::class, $trainingPath);
        $this->assertEquals('Test Training Path', $trainingPath->title);
        $this->assertEquals($instructor->id, $trainingPath->instructor_id);
        $this->assertEquals(TrainingPathStatus::DRAFT, $trainingPath->status);
        $this->assertDatabaseHas('training_paths', [
            'title' => 'Test Training Path',
            'instructor_id' => $instructor->id,
            'status' => TrainingPathStatus::DRAFT->value,
        ]);
    }

    public function test_create_training_path_with_base64_thumbnail_stores_public_image(): void
    {
        Storage::fake('public');

        $instructor = User::factory()->create();

        // 1x1 PNG
        $base64Png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO5M9x8AAAAASUVORK5CYII=';

        $trainingPath = $this->trainingPathService->createTrainingPath($instructor, [
            'title' => 'Thumbnail Training Path',
            'description' => 'Path with thumbnail',
            'category' => 'Smart Manufacturing',
            'level' => 'Beginner',
            'thumbnail' => $base64Png,
        ]);

        $this->assertNotNull($trainingPath->thumbnail);
        $this->assertStringStartsWith('/storage/training_path_thumbnails/', $trainingPath->thumbnail);

        $storedPath = str_replace('/storage/', '', (string) $trainingPath->thumbnail);
        $this->assertTrue(Storage::disk('public')->exists($storedPath));
    }

    public function test_create_training_path_with_invalid_data_url_thumbnail_does_not_store_raw_data_url(): void
    {
        $instructor = User::factory()->create();

        // SVG is intentionally unsupported
        $invalidSvgDataUrl = 'data:image/svg+xml;base64,'.base64_encode('<svg xmlns="http://www.w3.org/2000/svg"></svg>');

        $trainingPath = $this->trainingPathService->createTrainingPath($instructor, [
            'title' => 'Invalid Thumbnail Training Path',
            'description' => 'Path with unsupported thumbnail format',
            'category' => 'Smart Manufacturing',
            'level' => 'Beginner',
            'thumbnail' => $invalidSvgDataUrl,
        ]);

        $this->assertNull($trainingPath->thumbnail);
    }

    public function test_update_training_path(): void
    {
        $trainingPath = TrainingPath::factory()->create(['title' => 'Original Title']);

        $updated = $this->trainingPathService->updateTrainingPath($trainingPath, [
            'title' => 'Updated Title',
            'description' => 'Updated Description',
        ]);

        $this->assertEquals('Updated Title', $updated->title);
        $this->assertEquals('Updated Description', $updated->description);
        $this->assertDatabaseHas('training_paths', [
            'id' => $trainingPath->id,
            'title' => 'Updated Title',
        ]);
    }

    public function test_delete_training_path(): void
    {
        $trainingPath = TrainingPath::factory()->create();
        $trainingPathId = $trainingPath->id;

        $this->trainingPathService->deleteTrainingPath($trainingPath);

        $this->assertDatabaseMissing('training_paths', ['id' => $trainingPathId]);
    }

    public function test_submit_for_review(): void
    {
        $trainingPath = TrainingPath::factory()->create(['status' => TrainingPathStatus::DRAFT]);

        $this->trainingPathService->submitForReview($trainingPath);

        $this->assertEquals(TrainingPathStatus::PENDING_REVIEW, $trainingPath->fresh()->status);
        $this->assertDatabaseHas('training_paths', [
            'id' => $trainingPath->id,
            'status' => TrainingPathStatus::PENDING_REVIEW->value,
        ]);
    }

    public function test_approve_training_path(): void
    {
        $trainingPath = TrainingPath::factory()->pendingReview()->create();

        $this->trainingPathService->approveTrainingPath($trainingPath);

        $this->assertEquals(TrainingPathStatus::APPROVED, $trainingPath->fresh()->status);
        $this->assertDatabaseHas('training_paths', [
            'id' => $trainingPath->id,
            'status' => TrainingPathStatus::APPROVED->value,
        ]);
    }

    public function test_reject_training_path_with_feedback(): void
    {
        $trainingPath = TrainingPath::factory()->pendingReview()->create();
        $feedback = 'Content needs improvement';

        $this->trainingPathService->rejectTrainingPath($trainingPath, $feedback);

        $trainingPath->refresh();
        $this->assertEquals(TrainingPathStatus::REJECTED, $trainingPath->status);
        $this->assertEquals($feedback, $trainingPath->admin_feedback);
        $this->assertDatabaseHas('training_paths', [
            'id' => $trainingPath->id,
            'status' => TrainingPathStatus::REJECTED->value,
            'admin_feedback' => $feedback,
        ]);
    }

    public function test_list_approved_training_paths(): void
    {
        TrainingPath::factory()->approved()->count(3)->create();
        TrainingPath::factory()->create(['status' => TrainingPathStatus::DRAFT]);
        TrainingPath::factory()->pendingReview()->create();

        $approvedTrainingPaths = $this->trainingPathService->getApprovedTrainingPaths();

        $this->assertCount(3, $approvedTrainingPaths);
        foreach ($approvedTrainingPaths as $trainingPath) {
            $this->assertEquals(TrainingPathStatus::APPROVED, $trainingPath->status);
        }
    }

    public function test_list_training_paths_by_instructor(): void
    {
        $instructor = User::factory()->create();
        $otherInstructor = User::factory()->create();

        TrainingPath::factory()->count(2)->create(['instructor_id' => $instructor->id]);
        TrainingPath::factory()->create(['instructor_id' => $otherInstructor->id]);

        $instructorTrainingPaths = $this->trainingPathService->getTrainingPathsByInstructor($instructor);

        $this->assertCount(2, $instructorTrainingPaths);
        foreach ($instructorTrainingPaths as $trainingPath) {
            $this->assertEquals($instructor->id, $trainingPath->instructor_id);
        }
    }

    public function test_list_pending_training_paths(): void
    {
        TrainingPath::factory()->pendingReview()->count(2)->create();
        TrainingPath::factory()->approved()->create();
        TrainingPath::factory()->create(['status' => TrainingPathStatus::DRAFT]);

        $pendingTrainingPaths = $this->trainingPathService->getPendingTrainingPaths();

        $this->assertCount(2, $pendingTrainingPaths);
        foreach ($pendingTrainingPaths as $trainingPath) {
            $this->assertEquals(TrainingPathStatus::PENDING_REVIEW, $trainingPath->status);
        }
    }

    public function test_search_training_paths_by_title(): void
    {
        TrainingPath::factory()->approved()->create(['title' => 'Laravel Backend Development']);
        TrainingPath::factory()->approved()->create(['title' => 'React Frontend Development']);
        TrainingPath::factory()->approved()->create(['title' => 'Python Predictive Maintenance']);

        $results = $this->trainingPathService->getApprovedTrainingPaths(search: 'Development');

        $this->assertCount(2, $results);
    }

    public function test_filter_training_paths_by_category(): void
    {
        TrainingPath::factory()->approved()->create(['category' => 'Smart Manufacturing']);
        TrainingPath::factory()->approved()->create(['category' => 'Smart Manufacturing']);
        TrainingPath::factory()->approved()->create(['category' => 'Predictive Maintenance']);

        $smartManufacturingTrainingPaths = $this->trainingPathService->getApprovedTrainingPaths(category: 'Smart Manufacturing');

        $this->assertCount(2, $smartManufacturingTrainingPaths);
        foreach ($smartManufacturingTrainingPaths as $trainingPath) {
            $this->assertEquals('Smart Manufacturing', $trainingPath->category);
        }
    }
}
