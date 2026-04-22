<?php

namespace Tests\Unit\Services;

use App\Models\TrainingPath;
use App\Models\TrainingPathEnrollment;
use App\Models\TrainingPathModule;
use App\Models\TrainingUnit;
use App\Models\User;
use App\Repositories\PaymentRepository;
use App\Repositories\TrainingPathEnrollmentRepository;
use App\Repositories\TrainingPathRepository;
use App\Repositories\TrainingUnitProgressRepository;
use App\Services\EnrollmentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EnrollmentServiceTest extends TestCase
{
    use RefreshDatabase;

    private EnrollmentService $enrollmentService;

    protected function setUp(): void
    {
        parent::setUp();
        $enrollmentRepo = app(TrainingPathEnrollmentRepository::class);
        $trainingPathRepo = app(TrainingPathRepository::class);
        $progressRepo = app(TrainingUnitProgressRepository::class);
        $paymentRepo = app(PaymentRepository::class);
        $this->enrollmentService = new EnrollmentService(
            $enrollmentRepo,
            $trainingPathRepo,
            $progressRepo,
            $paymentRepo,
        );
    }

    public function test_enroll_user_in_training_path(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create();

        $enrollment = $this->enrollmentService->enroll($user, $trainingPath->id);

        $this->assertInstanceOf(TrainingPathEnrollment::class, $enrollment);
        $this->assertEquals($user->id, $enrollment->user_id);
        $this->assertEquals($trainingPath->id, $enrollment->training_path_id);
        $this->assertDatabaseHas('training_path_enrollments', [
            'user_id' => $user->id,
            'training_path_id' => $trainingPath->id,
        ]);
    }

    public function test_cannot_enroll_twice_in_same_training_path(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create();

        $enrollment1 = $this->enrollmentService->enroll($user, $trainingPath->id);
        $enrollment2 = $this->enrollmentService->enroll($user, $trainingPath->id);

        // Should return the same enrollment (firstOrCreate behavior)
        $this->assertEquals($enrollment1->id, $enrollment2->id);
        $this->assertDatabaseCount('training_path_enrollments', 1);
    }

    public function test_check_if_user_is_enrolled(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create();
        $notEnrolledTrainingPath = TrainingPath::factory()->approved()->create();

        $this->enrollmentService->enroll($user, $trainingPath->id);

        $this->assertTrue($this->enrollmentService->isEnrolled($user, $trainingPath->id));
        $this->assertFalse($this->enrollmentService->isEnrolled($user, $notEnrolledTrainingPath->id));
    }

    public function test_get_user_enrollments(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $trainingPath1 = TrainingPath::factory()->approved()->create();
        $trainingPath2 = TrainingPath::factory()->approved()->create();
        $trainingPath3 = TrainingPath::factory()->approved()->create();

        $this->enrollmentService->enroll($user, $trainingPath1->id);
        $this->enrollmentService->enroll($user, $trainingPath2->id);
        $this->enrollmentService->enroll($otherUser, $trainingPath3->id);

        $enrollments = $this->enrollmentService->getEnrolledTrainingPaths($user);

        $this->assertCount(2, $enrollments);
        $this->assertTrue($enrollments->contains('training_path_id', $trainingPath1->id));
        $this->assertTrue($enrollments->contains('training_path_id', $trainingPath2->id));
        $this->assertFalse($enrollments->contains('training_path_id', $trainingPath3->id));
    }

    public function test_mark_training_unit_as_complete(): void
    {
        $user = User::factory()->create();
        $module = TrainingPathModule::factory()->create();
        $trainingUnit = TrainingUnit::factory()->create(['module_id' => $module->id]);

        $progress = $this->enrollmentService->markTrainingUnitComplete($user, $trainingUnit->id);

        $this->assertNotNull($progress);
        $this->assertEquals($user->id, $progress->user_id);
        $this->assertEquals($trainingUnit->id, $progress->training_unit_id);
        $this->assertDatabaseHas('training_unit_progress', [
            'user_id' => $user->id,
            'training_unit_id' => $trainingUnit->id,
        ]);
    }

    public function test_cannot_mark_completed_training_unit_twice(): void
    {
        $user = User::factory()->create();
        $module = TrainingPathModule::factory()->create();
        $trainingUnit = TrainingUnit::factory()->create(['module_id' => $module->id]);

        $progress1 = $this->enrollmentService->markTrainingUnitComplete($user, $trainingUnit->id);
        $progress2 = $this->enrollmentService->markTrainingUnitComplete($user, $trainingUnit->id);

        // Should return the same progress record (updateOrCreate behavior)
        $this->assertEquals($progress1->id, $progress2->id);
        $this->assertDatabaseCount('training_unit_progress', 1);
    }

    public function test_get_training_path_progress(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create();

        // Create 3 modules with 2 trainingUnits each = 6 total trainingUnits
        $modules = TrainingPathModule::factory()->count(3)->create(['training_path_id' => $trainingPath->id]);
        $allTrainingUnits = [];
        foreach ($modules as $module) {
            $trainingUnits = TrainingUnit::factory()->count(2)->create(['module_id' => $module->id]);
            $allTrainingUnits = array_merge($allTrainingUnits, $trainingUnits->all());
        }

        // Complete 3 out of 6 trainingUnits
        $this->enrollmentService->markTrainingUnitComplete($user, $allTrainingUnits[0]->id);
        $this->enrollmentService->markTrainingUnitComplete($user, $allTrainingUnits[1]->id);
        $this->enrollmentService->markTrainingUnitComplete($user, $allTrainingUnits[2]->id);

        $progress = $this->enrollmentService->getTrainingPathProgress($user, $trainingPath);

        $this->assertEquals(6, $progress['total']);
        $this->assertEquals(3, $progress['completed']);
        $this->assertEquals(50, $progress['percentage']);
    }

    public function test_get_completed_training_unit_ids(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->approved()->create();
        $module = TrainingPathModule::factory()->create(['training_path_id' => $trainingPath->id]);

        $trainingUnit1 = TrainingUnit::factory()->create(['module_id' => $module->id]);
        $trainingUnit2 = TrainingUnit::factory()->create(['module_id' => $module->id]);
        $trainingUnit3 = TrainingUnit::factory()->create(['module_id' => $module->id]);

        $this->enrollmentService->markTrainingUnitComplete($user, $trainingUnit1->id);
        $this->enrollmentService->markTrainingUnitComplete($user, $trainingUnit2->id);

        $completedIds = $this->enrollmentService->getCompletedTrainingUnitIds($user, $trainingPath->id);

        $this->assertCount(2, $completedIds);
        $this->assertContains($trainingUnit1->id, $completedIds);
        $this->assertContains($trainingUnit2->id, $completedIds);
        $this->assertNotContains($trainingUnit3->id, $completedIds);
    }
}
