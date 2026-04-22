<?php

namespace Tests\Unit\Services;

use App\Events\CertificateIssued;
use App\Jobs\GenerateCertificatePdfJob;
use App\Models\Certificate;
use App\Models\TrainingPath;
use App\Models\TrainingPathModule;
use App\Models\TrainingUnit;
use App\Models\TrainingUnitProgress;
use App\Models\User;
use App\Repositories\CertificateRepository;
use App\Repositories\TrainingUnitProgressRepository;
use App\Services\CertificateService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CertificateServiceTest extends TestCase
{
    use RefreshDatabase;

    private CertificateService $service;

    private CertificateRepository $certificateRepository;

    private TrainingUnitProgressRepository $progressRepository;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('local');
        Queue::fake();

        $this->certificateRepository = app(CertificateRepository::class);
        $this->progressRepository = app(TrainingUnitProgressRepository::class);
        $this->service = new CertificateService(
            $this->certificateRepository,
            $this->progressRepository
        );
    }

    // =========================================================================
    // getUserCertificates() tests
    // =========================================================================

    public function test_get_user_certificates_returns_all_user_certificates(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        Certificate::factory()->count(3)->create(['user_id' => $user->id]);
        Certificate::factory()->count(2)->create(['user_id' => $otherUser->id]);

        $certificates = $this->service->getUserCertificates($user);

        $this->assertCount(3, $certificates);
        foreach ($certificates as $certificate) {
            $this->assertEquals($user->id, $certificate->user_id);
        }
    }

    public function test_get_user_certificates_returns_empty_collection_when_no_certificates(): void
    {
        $user = User::factory()->create();

        $certificates = $this->service->getUserCertificates($user);

        $this->assertCount(0, $certificates);
        $this->assertTrue($certificates->isEmpty());
    }

    public function test_get_user_certificates_loads_training_path_relationship(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->create(['title' => 'Test TrainingPath']);
        Certificate::factory()->create([
            'user_id' => $user->id,
            'training_path_id' => $trainingPath->id,
        ]);

        $certificates = $this->service->getUserCertificates($user);

        $this->assertTrue($certificates->first()->relationLoaded('trainingPath'));
        $this->assertEquals('Test TrainingPath', $certificates->first()->trainingPath->title);
    }

    // =========================================================================
    // getCertificateByHash() tests
    // =========================================================================

    public function test_get_certificate_by_hash_returns_certificate_for_valid_hash(): void
    {
        $certificate = Certificate::factory()->create(['hash' => 'valid-hash-123']);

        $result = $this->service->getCertificateByHash('valid-hash-123');

        $this->assertNotNull($result);
        $this->assertEquals($certificate->id, $result->id);
    }

    public function test_get_certificate_by_hash_returns_null_for_invalid_hash(): void
    {
        Certificate::factory()->create(['hash' => 'existing-hash']);

        $result = $this->service->getCertificateByHash('non-existent-hash');

        $this->assertNull($result);
    }

    // =========================================================================
    // getUserCertificateForTrainingPath() tests
    // =========================================================================

    public function test_get_user_certificate_for_training_path_returns_certificate(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->create();
        $certificate = Certificate::factory()->create([
            'user_id' => $user->id,
            'training_path_id' => $trainingPath->id,
        ]);

        $result = $this->service->getUserCertificateForTrainingPath($user, $trainingPath->id);

        $this->assertNotNull($result);
        $this->assertEquals($certificate->id, $result->id);
    }

    public function test_get_user_certificate_for_training_path_returns_null_when_not_found(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->create();

        $result = $this->service->getUserCertificateForTrainingPath($user, $trainingPath->id);

        $this->assertNull($result);
    }

    public function test_get_user_certificate_for_training_path_does_not_return_other_users_certificate(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $trainingPath = TrainingPath::factory()->create();

        Certificate::factory()->create([
            'user_id' => $otherUser->id,
            'training_path_id' => $trainingPath->id,
        ]);

        $result = $this->service->getUserCertificateForTrainingPath($user, $trainingPath->id);

        $this->assertNull($result);
    }

    // =========================================================================
    // canIssueCertificate() tests
    // =========================================================================

    public function test_can_issue_certificate_returns_true_when_training_path_completed_and_no_existing_certificate(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->create();
        $module = TrainingPathModule::factory()->create(['training_path_id' => $trainingPath->id]);
        $trainingUnit = TrainingUnit::factory()->create(['module_id' => $module->id]);

        // Complete all trainingUnits (100% progress)
        TrainingUnitProgress::factory()->create([
            'user_id' => $user->id,
            'training_unit_id' => $trainingUnit->id,
            'completed' => true,
            'completed_at' => now(),
        ]);

        $result = $this->service->canIssueCertificate($user, $trainingPath);

        $this->assertTrue($result);
    }

    public function test_can_issue_certificate_returns_false_when_certificate_already_exists(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->create();
        $module = TrainingPathModule::factory()->create(['training_path_id' => $trainingPath->id]);
        $trainingUnit = TrainingUnit::factory()->create(['module_id' => $module->id]);

        // Complete all trainingUnits
        TrainingUnitProgress::factory()->create([
            'user_id' => $user->id,
            'training_unit_id' => $trainingUnit->id,
            'completed' => true,
            'completed_at' => now(),
        ]);

        // Already has certificate
        Certificate::factory()->create([
            'user_id' => $user->id,
            'training_path_id' => $trainingPath->id,
        ]);

        $result = $this->service->canIssueCertificate($user, $trainingPath);

        $this->assertFalse($result);
    }

    public function test_can_issue_certificate_returns_false_when_training_path_not_completed(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->create();
        $module = TrainingPathModule::factory()->create(['training_path_id' => $trainingPath->id]);

        // Create 2 trainingUnits, complete only 1
        $trainingUnit1 = TrainingUnit::factory()->create(['module_id' => $module->id]);
        $trainingUnit2 = TrainingUnit::factory()->create(['module_id' => $module->id]);

        TrainingUnitProgress::factory()->create([
            'user_id' => $user->id,
            'training_unit_id' => $trainingUnit1->id,
            'completed' => true,
            'completed_at' => now(),
        ]);
        // trainingUnit2 not completed - only 50% progress

        $result = $this->service->canIssueCertificate($user, $trainingPath);

        $this->assertFalse($result);
    }

    public function test_can_issue_certificate_returns_false_when_no_progress(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->create();
        $module = TrainingPathModule::factory()->create(['training_path_id' => $trainingPath->id]);
        TrainingUnit::factory()->create(['module_id' => $module->id]);

        // No progress at all

        $result = $this->service->canIssueCertificate($user, $trainingPath);

        $this->assertFalse($result);
    }

    // =========================================================================
    // issueCertificate() tests
    // =========================================================================

    public function test_issue_certificate_creates_certificate_for_completed_training_path(): void
    {
        Event::fake([CertificateIssued::class]);
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->create();
        $module = TrainingPathModule::factory()->create(['training_path_id' => $trainingPath->id]);
        $trainingUnit = TrainingUnit::factory()->create(['module_id' => $module->id]);

        // Complete the trainingPath
        TrainingUnitProgress::factory()->create([
            'user_id' => $user->id,
            'training_unit_id' => $trainingUnit->id,
            'completed' => true,
            'completed_at' => now(),
        ]);

        $certificate = $this->service->issueCertificate($user, $trainingPath->id);

        $this->assertInstanceOf(Certificate::class, $certificate);
        $this->assertEquals($user->id, $certificate->user_id);
        $this->assertEquals($trainingPath->id, $certificate->training_path_id);
        $this->assertNotNull($certificate->hash);
        $this->assertEquals(64, strlen($certificate->hash));
        $this->assertNotNull($certificate->issued_at);
        $this->assertDatabaseHas('certificates', [
            'user_id' => $user->id,
            'training_path_id' => $trainingPath->id,
        ]);

        Event::assertDispatched(CertificateIssued::class, function ($event) use ($certificate) {
            return $event->certificate->id === $certificate->id;
        });
    }

    public function test_issue_certificate_dispatches_pdf_generation_job(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->create();
        $module = TrainingPathModule::factory()->create(['training_path_id' => $trainingPath->id]);
        $trainingUnit = TrainingUnit::factory()->create(['module_id' => $module->id]);

        TrainingUnitProgress::factory()->create([
            'user_id' => $user->id,
            'training_unit_id' => $trainingUnit->id,
            'completed' => true,
            'completed_at' => now(),
        ]);

        $certificate = $this->service->issueCertificate($user, $trainingPath->id);

        Queue::assertPushed(GenerateCertificatePdfJob::class, function ($job) use ($certificate) {
            return $job->certificate->id === $certificate->id;
        });
    }

    public function test_issue_certificate_loads_user_and_training_path_relationships(): void
    {
        $user = User::factory()->create(['name' => 'Test User']);
        $trainingPath = TrainingPath::factory()->create(['title' => 'Test TrainingPath']);
        $module = TrainingPathModule::factory()->create(['training_path_id' => $trainingPath->id]);
        $trainingUnit = TrainingUnit::factory()->create(['module_id' => $module->id]);

        TrainingUnitProgress::factory()->create([
            'user_id' => $user->id,
            'training_unit_id' => $trainingUnit->id,
            'completed' => true,
            'completed_at' => now(),
        ]);

        $certificate = $this->service->issueCertificate($user, $trainingPath->id);

        $this->assertTrue($certificate->relationLoaded('user'));
        $this->assertTrue($certificate->relationLoaded('trainingPath'));
        $this->assertEquals('Test User', $certificate->user->name);
        $this->assertEquals('Test TrainingPath', $certificate->trainingPath->title);
    }

    public function test_issue_certificate_generates_unique_hash(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $trainingPath = TrainingPath::factory()->create();
        $module = TrainingPathModule::factory()->create(['training_path_id' => $trainingPath->id]);
        $trainingUnit = TrainingUnit::factory()->create(['module_id' => $module->id]);

        // Complete trainingPath for both users
        TrainingUnitProgress::factory()->create([
            'user_id' => $user1->id,
            'training_unit_id' => $trainingUnit->id,
            'completed' => true,
            'completed_at' => now(),
        ]);
        TrainingUnitProgress::factory()->create([
            'user_id' => $user2->id,
            'training_unit_id' => $trainingUnit->id,
            'completed' => true,
            'completed_at' => now(),
        ]);

        $cert1 = $this->service->issueCertificate($user1, $trainingPath->id);
        $cert2 = $this->service->issueCertificate($user2, $trainingPath->id);

        $this->assertNotEquals($cert1->hash, $cert2->hash);
    }

    public function test_issue_certificate_throws_exception_when_training_path_not_completed(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->create();
        $module = TrainingPathModule::factory()->create(['training_path_id' => $trainingPath->id]);
        TrainingUnit::factory()->create(['module_id' => $module->id]);

        // No progress

        $this->expectException(AuthorizationException::class);
        $this->expectExceptionMessage('Cannot issue certificate. TrainingPath not completed or already issued.');

        $this->service->issueCertificate($user, $trainingPath->id);
    }

    public function test_issue_certificate_throws_exception_when_certificate_already_exists(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->create();
        $module = TrainingPathModule::factory()->create(['training_path_id' => $trainingPath->id]);
        $trainingUnit = TrainingUnit::factory()->create(['module_id' => $module->id]);

        TrainingUnitProgress::factory()->create([
            'user_id' => $user->id,
            'training_unit_id' => $trainingUnit->id,
            'completed' => true,
            'completed_at' => now(),
        ]);

        // Already has certificate
        Certificate::factory()->create([
            'user_id' => $user->id,
            'training_path_id' => $trainingPath->id,
        ]);

        $this->expectException(AuthorizationException::class);

        $this->service->issueCertificate($user, $trainingPath->id);
    }

    // =========================================================================
    // verifyCertificate() tests
    // =========================================================================

    public function test_verify_certificate_returns_certificate_for_valid_hash(): void
    {
        $certificate = Certificate::factory()->create(['hash' => 'verify-hash-abc']);

        $result = $this->service->verifyCertificate('verify-hash-abc');

        $this->assertNotNull($result);
        $this->assertEquals($certificate->id, $result->id);
        $this->assertTrue($result->relationLoaded('user'));
        $this->assertTrue($result->relationLoaded('trainingPath'));
    }

    public function test_verify_certificate_returns_null_for_invalid_hash(): void
    {
        Certificate::factory()->create(['hash' => 'real-hash']);

        $result = $this->service->verifyCertificate('fake-hash');

        $this->assertNull($result);
    }

    public function test_verify_certificate_returns_null_for_empty_hash(): void
    {
        Certificate::factory()->create();

        $result = $this->service->verifyCertificate('');

        $this->assertNull($result);
    }

    // =========================================================================
    // getCertificatePdfPath() tests
    // =========================================================================

    public function test_get_certificate_pdf_path_returns_full_path_when_pdf_exists(): void
    {
        $pdfPath = 'certificates/test-hash.pdf';
        $certificate = Certificate::factory()->create(['pdf_path' => $pdfPath]);

        $result = $this->service->getCertificatePdfPath($certificate);

        $expectedPath = storage_path("app/{$pdfPath}");
        $this->assertEquals($expectedPath, $result);
    }

    public function test_get_certificate_pdf_path_returns_null_when_no_pdf(): void
    {
        $certificate = Certificate::factory()->create(['pdf_path' => null]);

        $result = $this->service->getCertificatePdfPath($certificate);

        $this->assertNull($result);
    }

    // =========================================================================
    // Edge cases & integration scenarios
    // =========================================================================

    public function test_multiple_training_paths_can_have_separate_certificates(): void
    {
        $user = User::factory()->create();

        $trainingPath1 = TrainingPath::factory()->create();
        $module1 = TrainingPathModule::factory()->create(['training_path_id' => $trainingPath1->id]);
        $trainingUnit1 = TrainingUnit::factory()->create(['module_id' => $module1->id]);

        $trainingPath2 = TrainingPath::factory()->create();
        $module2 = TrainingPathModule::factory()->create(['training_path_id' => $trainingPath2->id]);
        $trainingUnit2 = TrainingUnit::factory()->create(['module_id' => $module2->id]);

        // Complete both trainingPaths
        TrainingUnitProgress::factory()->create([
            'user_id' => $user->id,
            'training_unit_id' => $trainingUnit1->id,
            'completed' => true,
            'completed_at' => now(),
        ]);
        TrainingUnitProgress::factory()->create([
            'user_id' => $user->id,
            'training_unit_id' => $trainingUnit2->id,
            'completed' => true,
            'completed_at' => now(),
        ]);

        $cert1 = $this->service->issueCertificate($user, $trainingPath1->id);
        $cert2 = $this->service->issueCertificate($user, $trainingPath2->id);

        $this->assertNotEquals($cert1->id, $cert2->id);
        $this->assertEquals($trainingPath1->id, $cert1->training_path_id);
        $this->assertEquals($trainingPath2->id, $cert2->training_path_id);

        $userCertificates = $this->service->getUserCertificates($user);
        $this->assertCount(2, $userCertificates);
    }

    public function test_training_path_with_multiple_modules_requires_all_training_units_completed(): void
    {
        $user = User::factory()->create();
        $trainingPath = TrainingPath::factory()->create();

        $module1 = TrainingPathModule::factory()->create(['training_path_id' => $trainingPath->id]);
        $trainingUnit1 = TrainingUnit::factory()->create(['module_id' => $module1->id]);
        $trainingUnit2 = TrainingUnit::factory()->create(['module_id' => $module1->id]);

        $module2 = TrainingPathModule::factory()->create(['training_path_id' => $trainingPath->id]);
        $trainingUnit3 = TrainingUnit::factory()->create(['module_id' => $module2->id]);

        // Complete only trainingUnits in module 1
        TrainingUnitProgress::factory()->create([
            'user_id' => $user->id,
            'training_unit_id' => $trainingUnit1->id,
            'completed' => true,
            'completed_at' => now(),
        ]);
        TrainingUnitProgress::factory()->create([
            'user_id' => $user->id,
            'training_unit_id' => $trainingUnit2->id,
            'completed' => true,
            'completed_at' => now(),
        ]);
        // trainingUnit3 not completed

        $this->assertFalse($this->service->canIssueCertificate($user, $trainingPath));

        // Now complete trainingUnit3
        TrainingUnitProgress::factory()->create([
            'user_id' => $user->id,
            'training_unit_id' => $trainingUnit3->id,
            'completed' => true,
            'completed_at' => now(),
        ]);

        $this->assertTrue($this->service->canIssueCertificate($user, $trainingPath));
    }
}
