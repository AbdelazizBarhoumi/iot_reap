<?php

namespace Tests\Unit\Services;

use App\Models\TrainingPath;
use App\Models\TrainingPathEnrollment;
use App\Models\TrainingPathModule;
use App\Models\TrainingUnit;
use App\Models\User;
use App\Services\CheckTrainingPathAccessService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class CheckTrainingPathAccessServiceTest extends TestCase
{
    use RefreshDatabase;

    private CheckTrainingPathAccessService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(CheckTrainingPathAccessService::class);
        Cache::flush();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // canAccessTrainingPath Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_allows_access_to_free_trainingPath(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create([
            'is_free' => true,
            'price_cents' => 0,
        ]);

        $this->assertTrue($this->service->canAccessTrainingPath($user, $trainingPath->id));
    }

    public function test_allows_access_to_zero_price_trainingPath(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create([
            'is_free' => false,
            'price_cents' => 0,
        ]);

        $this->assertTrue($this->service->canAccessTrainingPath($user, $trainingPath->id));
    }

    public function test_allows_access_when_enrolled(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create([
            'is_free' => false,
            'price_cents' => 2999,
        ]);

        TrainingPathEnrollment::factory()->create([
            'user_id' => $user->id,
            'training_path_id' => $trainingPath->id,
        ]);

        $this->assertTrue($this->service->canAccessTrainingPath($user, $trainingPath->id));
    }

    public function test_allows_instructor_to_access_own_trainingPath(): void
    {
        $instructor = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create([
            'instructor_id' => $instructor->id,
            'is_free' => false,
            'price_cents' => 4999,
        ]);

        $this->assertTrue($this->service->canAccessTrainingPath($instructor, $trainingPath->id));
    }

    public function test_denies_access_to_paid_training_path_without_enrollment(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create([
            'is_free' => false,
            'price_cents' => 2999,
        ]);

        $this->assertFalse($this->service->canAccessTrainingPath($user, $trainingPath->id));
    }

    public function test_denies_access_to_unpublished_trainingPath(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->create([
            'is_free' => true,
            'price_cents' => 0,
        ]); // Default is DRAFT status

        $this->assertFalse($this->service->canAccessTrainingPath($user, $trainingPath->id));
    }

    public function test_denies_access_to_nonexistent_trainingPath(): void
    {
        $user = User::factory()->create();

        $this->assertFalse($this->service->canAccessTrainingPath($user, 99999));
    }

    public function test_denies_access_to_pending_review_trainingPath(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->pendingReview()->create([
            'is_free' => true,
            'price_cents' => 0,
        ]);

        $this->assertFalse($this->service->canAccessTrainingPath($user, $trainingPath->id));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // canAccessTrainingUnit Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_allows_access_to_preview_trainingUnit(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create([
            'is_free' => false,
            'price_cents' => 2999,
        ]);

        $module = TrainingPathModule::factory()->create([
            'training_path_id' => $trainingPath->id,
            'sort_order' => 1,
        ]);

        $previewTrainingUnit = TrainingUnit::factory()->create([
            'module_id' => $module->id,
            'sort_order' => 1,
        ]);

        // User not enrolled, but first trainingUnit of first module is accessible
        $this->assertTrue($this->service->canAccessTrainingUnit($user, $previewTrainingUnit->id));
    }

    public function test_denies_access_to_non_preview_training_unit_without_enrollment(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create([
            'is_free' => false,
            'price_cents' => 2999,
        ]);

        $module = TrainingPathModule::factory()->create([
            'training_path_id' => $trainingPath->id,
            'sort_order' => 1,
        ]);

        // First trainingUnit (preview)
        TrainingUnit::factory()->create([
            'module_id' => $module->id,
            'sort_order' => 1,
        ]);

        // Second trainingUnit (not preview)
        $secondTrainingUnit = TrainingUnit::factory()->create([
            'module_id' => $module->id,
            'sort_order' => 2,
        ]);

        $this->assertFalse($this->service->canAccessTrainingUnit($user, $secondTrainingUnit->id));
    }

    public function test_allows_enrolled_user_to_access_any_trainingUnit(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create([
            'is_free' => false,
            'price_cents' => 2999,
        ]);

        $module = TrainingPathModule::factory()->create([
            'training_path_id' => $trainingPath->id,
            'sort_order' => 1,
        ]);

        $trainingUnit = TrainingUnit::factory()->create([
            'module_id' => $module->id,
            'sort_order' => 5, // Not a preview trainingUnit
        ]);

        TrainingPathEnrollment::factory()->create([
            'user_id' => $user->id,
            'training_path_id' => $trainingPath->id,
        ]);

        $this->assertTrue($this->service->canAccessTrainingUnit($user, $trainingUnit->id));
    }

    public function test_allows_instructor_to_access_any_training_unit_in_own_trainingPath(): void
    {
        $instructor = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create([
            'instructor_id' => $instructor->id,
            'is_free' => false,
            'price_cents' => 4999,
        ]);

        $module = TrainingPathModule::factory()->create([
            'training_path_id' => $trainingPath->id,
            'sort_order' => 2,
        ]);

        $trainingUnit = TrainingUnit::factory()->create([
            'module_id' => $module->id,
            'sort_order' => 5,
        ]);

        $this->assertTrue($this->service->canAccessTrainingUnit($instructor, $trainingUnit->id));
    }

    public function test_denies_access_to_nonexistent_trainingUnit(): void
    {
        $user = User::factory()->create();

        $this->assertFalse($this->service->canAccessTrainingUnit($user, 99999));
    }

    public function test_training_unit_in_second_module_is_not_preview(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create([
            'is_free' => false,
            'price_cents' => 2999,
        ]);

        // First module
        TrainingPathModule::factory()->create([
            'training_path_id' => $trainingPath->id,
            'sort_order' => 1,
        ]);

        // Second module
        $secondModule = TrainingPathModule::factory()->create([
            'training_path_id' => $trainingPath->id,
            'sort_order' => 2,
        ]);

        // First trainingUnit in second module (not a preview)
        $trainingUnit = TrainingUnit::factory()->create([
            'module_id' => $secondModule->id,
            'sort_order' => 1,
        ]);

        $this->assertFalse($this->service->canAccessTrainingUnit($user, $trainingUnit->id));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // isEnrolled Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_is_enrolled_returns_true_when_enrolled(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create();

        TrainingPathEnrollment::factory()->create([
            'user_id' => $user->id,
            'training_path_id' => $trainingPath->id,
        ]);

        $this->assertTrue($this->service->isEnrolled($user, $trainingPath->id));
    }

    public function test_is_enrolled_returns_false_when_not_enrolled(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create();

        $this->assertFalse($this->service->isEnrolled($user, $trainingPath->id));
    }

    public function test_enrollment_check_is_cached(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create();

        TrainingPathEnrollment::factory()->create([
            'user_id' => $user->id,
            'training_path_id' => $trainingPath->id,
        ]);

        // First call - should cache
        $this->service->isEnrolled($user, $trainingPath->id);

        // Check cache key exists
        $cacheKey = "access:user:{$user->id}:trainingPath:{$trainingPath->id}";
        $this->assertTrue(Cache::has($cacheKey));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // isFree Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_is_free_returns_true_for_is_free_flag(): void
    {
        $trainingPath = TrainingPath::factory()->approved()->create([
            'is_free' => true,
            'price_cents' => 2999, // Even with price set
        ]);

        $this->assertTrue($this->service->isFree($trainingPath->id));
    }

    public function test_is_free_returns_true_for_zero_price(): void
    {
        $trainingPath = TrainingPath::factory()->approved()->create([
            'is_free' => false,
            'price_cents' => 0,
        ]);

        $this->assertTrue($this->service->isFree($trainingPath->id));
    }

    public function test_is_free_returns_false_for_paid_trainingPath(): void
    {
        $trainingPath = TrainingPath::factory()->approved()->create([
            'is_free' => false,
            'price_cents' => 2999,
        ]);

        $this->assertFalse($this->service->isFree($trainingPath->id));
    }

    public function test_is_free_returns_false_for_nonexistent_trainingPath(): void
    {
        $this->assertFalse($this->service->isFree(99999));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // isPreviewTrainingUnit Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_is_preview_training_unit_for_first_training_unit_of_first_module(): void
    {
        $trainingPath = TrainingPath::factory()->approved()->create();
        $module = TrainingPathModule::factory()->create([
            'training_path_id' => $trainingPath->id,
            'sort_order' => 1,
        ]);
        $trainingUnit = TrainingUnit::factory()->create([
            'module_id' => $module->id,
            'sort_order' => 1,
        ]);

        $this->assertTrue($this->service->isPreviewTrainingUnit($trainingUnit));
    }

    public function test_is_not_preview_for_second_training_unit_of_first_module(): void
    {
        $trainingPath = TrainingPath::factory()->approved()->create();
        $module = TrainingPathModule::factory()->create([
            'training_path_id' => $trainingPath->id,
            'sort_order' => 1,
        ]);

        TrainingUnit::factory()->create([
            'module_id' => $module->id,
            'sort_order' => 1,
        ]);

        $secondTrainingUnit = TrainingUnit::factory()->create([
            'module_id' => $module->id,
            'sort_order' => 2,
        ]);

        $this->assertFalse($this->service->isPreviewTrainingUnit($secondTrainingUnit));
    }

    public function test_is_not_preview_for_first_training_unit_of_second_module(): void
    {
        $trainingPath = TrainingPath::factory()->approved()->create();

        TrainingPathModule::factory()->create([
            'training_path_id' => $trainingPath->id,
            'sort_order' => 1,
        ]);

        $secondModule = TrainingPathModule::factory()->create([
            'training_path_id' => $trainingPath->id,
            'sort_order' => 2,
        ]);

        $trainingUnit = TrainingUnit::factory()->create([
            'module_id' => $secondModule->id,
            'sort_order' => 1,
        ]);

        $this->assertFalse($this->service->isPreviewTrainingUnit($trainingUnit));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Assert Methods Tests (Exception throwing)
    // ─────────────────────────────────────────────────────────────────────────

    public function test_assert_can_access_training_path_throws_when_denied(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create([
            'is_free' => false,
            'price_cents' => 2999,
        ]);

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessage('You do not have access to this trainingPath');

        $this->service->assertCanAccessTrainingPath($user, $trainingPath->id);
    }

    public function test_assert_can_access_training_path_passes_when_allowed(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create([
            'is_free' => true,
            'price_cents' => 0,
        ]);

        // Should not throw
        $this->service->assertCanAccessTrainingPath($user, $trainingPath->id);
        $this->assertTrue(true);
    }

    public function test_assert_can_access_training_unit_throws_when_denied(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create([
            'is_free' => false,
            'price_cents' => 2999,
        ]);

        $module = TrainingPathModule::factory()->create([
            'training_path_id' => $trainingPath->id,
            'sort_order' => 1,
        ]);

        // Not a preview trainingUnit
        $trainingUnit = TrainingUnit::factory()->create([
            'module_id' => $module->id,
            'sort_order' => 2,
        ]);

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessage('You do not have access to this trainingUnit');

        $this->service->assertCanAccessTrainingUnit($user, $trainingUnit->id);
    }

    public function test_assert_can_access_training_unit_vm_throws_when_denied(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create([
            'is_free' => true,
            'price_cents' => 0,
        ]);

        $module = TrainingPathModule::factory()->create([
            'training_path_id' => $trainingPath->id,
            'sort_order' => 1,
        ]);

        // VM not enabled
        $trainingUnit = TrainingUnit::factory()->video()->create([
            'module_id' => $module->id,
            'sort_order' => 1,
        ]);

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessage("You do not have access to this trainingUnit's virtual machine");

        $this->service->assertCanAccessTrainingUnitVM($user, $trainingUnit->id);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Cache Invalidation Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_invalidate_enrollment_cache_clears_cache(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create();

        TrainingPathEnrollment::factory()->create([
            'user_id' => $user->id,
            'training_path_id' => $trainingPath->id,
        ]);

        // Populate cache
        $this->service->isEnrolled($user, $trainingPath->id);

        $cacheKey = "access:user:{$user->id}:trainingPath:{$trainingPath->id}";
        $this->assertTrue(Cache::has($cacheKey));

        // Invalidate
        $this->service->invalidateEnrollmentCache($user, $trainingPath->id);

        $this->assertFalse(Cache::has($cacheKey));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getAccessSummary Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_get_access_summary_for_instructor(): void
    {
        $instructor = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create([
            'instructor_id' => $instructor->id,
            'is_free' => false,
            'price_cents' => 4999,
        ]);

        $summary = $this->service->getAccessSummary($instructor, $trainingPath->id);

        $this->assertTrue($summary['can_access']);
        $this->assertEquals('You are the trainingPath instructor', $summary['reason']);
        $this->assertTrue($summary['is_instructor']);
        $this->assertFalse($summary['is_free']);
        $this->assertFalse($summary['is_enrolled']);
    }

    public function test_get_access_summary_for_free_trainingPath(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create([
            'is_free' => true,
            'price_cents' => 0,
        ]);

        $summary = $this->service->getAccessSummary($user, $trainingPath->id);

        $this->assertTrue($summary['can_access']);
        $this->assertEquals('This trainingPath is free', $summary['reason']);
        $this->assertFalse($summary['is_instructor']);
        $this->assertTrue($summary['is_free']);
        $this->assertFalse($summary['is_enrolled']);
    }

    public function test_get_access_summary_for_enrolled_user(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create([
            'is_free' => false,
            'price_cents' => 2999,
        ]);

        TrainingPathEnrollment::factory()->create([
            'user_id' => $user->id,
            'training_path_id' => $trainingPath->id,
        ]);

        $summary = $this->service->getAccessSummary($user, $trainingPath->id);

        $this->assertTrue($summary['can_access']);
        $this->assertEquals('You are enrolled in this trainingPath', $summary['reason']);
        $this->assertFalse($summary['is_instructor']);
        $this->assertFalse($summary['is_free']);
        $this->assertTrue($summary['is_enrolled']);
    }

    public function test_get_access_summary_for_non_enrolled_user(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create([
            'is_free' => false,
            'price_cents' => 2999,
        ]);

        $summary = $this->service->getAccessSummary($user, $trainingPath->id);

        $this->assertFalse($summary['can_access']);
        $this->assertEquals('Enrollment required', $summary['reason']);
        $this->assertFalse($summary['is_instructor']);
        $this->assertFalse($summary['is_free']);
        $this->assertFalse($summary['is_enrolled']);
    }

    public function test_get_access_summary_for_nonexistent_trainingPath(): void
    {
        $user = User::factory()->create();

        $summary = $this->service->getAccessSummary($user, 99999);

        $this->assertFalse($summary['can_access']);
        $this->assertEquals('TrainingPath not found', $summary['reason']);
        $this->assertFalse($summary['is_instructor']);
        $this->assertFalse($summary['is_free']);
        $this->assertFalse($summary['is_enrolled']);
    }
}
