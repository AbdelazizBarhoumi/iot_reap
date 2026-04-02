<?php

namespace Tests\Unit\Services;

use App\Jobs\GenerateCertificatePdfJob;
use App\Models\Certificate;
use App\Models\Course;
use App\Models\CourseModule;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\User;
use App\Repositories\CertificateRepository;
use App\Repositories\LessonProgressRepository;
use App\Services\CertificateService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CertificateServiceTest extends TestCase
{
    use RefreshDatabase;

    private CertificateService $service;

    private CertificateRepository $certificateRepository;

    private LessonProgressRepository $progressRepository;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('local');
        Queue::fake();

        $this->certificateRepository = app(CertificateRepository::class);
        $this->progressRepository = app(LessonProgressRepository::class);
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

    public function test_get_user_certificates_loads_course_relationship(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['title' => 'Test Course']);
        Certificate::factory()->create([
            'user_id' => $user->id,
            'course_id' => $course->id,
        ]);

        $certificates = $this->service->getUserCertificates($user);

        $this->assertTrue($certificates->first()->relationLoaded('course'));
        $this->assertEquals('Test Course', $certificates->first()->course->title);
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
    // getUserCertificateForCourse() tests
    // =========================================================================

    public function test_get_user_certificate_for_course_returns_certificate(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create();
        $certificate = Certificate::factory()->create([
            'user_id' => $user->id,
            'course_id' => $course->id,
        ]);

        $result = $this->service->getUserCertificateForCourse($user, $course->id);

        $this->assertNotNull($result);
        $this->assertEquals($certificate->id, $result->id);
    }

    public function test_get_user_certificate_for_course_returns_null_when_not_found(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create();

        $result = $this->service->getUserCertificateForCourse($user, $course->id);

        $this->assertNull($result);
    }

    public function test_get_user_certificate_for_course_does_not_return_other_users_certificate(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $course = Course::factory()->create();

        Certificate::factory()->create([
            'user_id' => $otherUser->id,
            'course_id' => $course->id,
        ]);

        $result = $this->service->getUserCertificateForCourse($user, $course->id);

        $this->assertNull($result);
    }

    // =========================================================================
    // canIssueCertificate() tests
    // =========================================================================

    public function test_can_issue_certificate_returns_true_when_course_completed_and_no_existing_certificate(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create();
        $module = CourseModule::factory()->create(['course_id' => $course->id]);
        $lesson = Lesson::factory()->create(['module_id' => $module->id]);

        // Complete all lessons (100% progress)
        LessonProgress::factory()->create([
            'user_id' => $user->id,
            'lesson_id' => $lesson->id,
            'completed' => true,
            'completed_at' => now(),
        ]);

        $result = $this->service->canIssueCertificate($user, $course);

        $this->assertTrue($result);
    }

    public function test_can_issue_certificate_returns_false_when_certificate_already_exists(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create();
        $module = CourseModule::factory()->create(['course_id' => $course->id]);
        $lesson = Lesson::factory()->create(['module_id' => $module->id]);

        // Complete all lessons
        LessonProgress::factory()->create([
            'user_id' => $user->id,
            'lesson_id' => $lesson->id,
            'completed' => true,
            'completed_at' => now(),
        ]);

        // Already has certificate
        Certificate::factory()->create([
            'user_id' => $user->id,
            'course_id' => $course->id,
        ]);

        $result = $this->service->canIssueCertificate($user, $course);

        $this->assertFalse($result);
    }

    public function test_can_issue_certificate_returns_false_when_course_not_completed(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create();
        $module = CourseModule::factory()->create(['course_id' => $course->id]);

        // Create 2 lessons, complete only 1
        $lesson1 = Lesson::factory()->create(['module_id' => $module->id]);
        $lesson2 = Lesson::factory()->create(['module_id' => $module->id]);

        LessonProgress::factory()->create([
            'user_id' => $user->id,
            'lesson_id' => $lesson1->id,
            'completed' => true,
            'completed_at' => now(),
        ]);
        // lesson2 not completed - only 50% progress

        $result = $this->service->canIssueCertificate($user, $course);

        $this->assertFalse($result);
    }

    public function test_can_issue_certificate_returns_false_when_no_progress(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create();
        $module = CourseModule::factory()->create(['course_id' => $course->id]);
        Lesson::factory()->create(['module_id' => $module->id]);

        // No progress at all

        $result = $this->service->canIssueCertificate($user, $course);

        $this->assertFalse($result);
    }

    // =========================================================================
    // issueCertificate() tests
    // =========================================================================

    public function test_issue_certificate_creates_certificate_for_completed_course(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create();
        $module = CourseModule::factory()->create(['course_id' => $course->id]);
        $lesson = Lesson::factory()->create(['module_id' => $module->id]);

        // Complete the course
        LessonProgress::factory()->create([
            'user_id' => $user->id,
            'lesson_id' => $lesson->id,
            'completed' => true,
            'completed_at' => now(),
        ]);

        $certificate = $this->service->issueCertificate($user, $course->id);

        $this->assertInstanceOf(Certificate::class, $certificate);
        $this->assertEquals($user->id, $certificate->user_id);
        $this->assertEquals($course->id, $certificate->course_id);
        $this->assertNotNull($certificate->hash);
        $this->assertEquals(64, strlen($certificate->hash));
        $this->assertNotNull($certificate->issued_at);
        $this->assertDatabaseHas('certificates', [
            'user_id' => $user->id,
            'course_id' => $course->id,
        ]);
    }

    public function test_issue_certificate_dispatches_pdf_generation_job(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create();
        $module = CourseModule::factory()->create(['course_id' => $course->id]);
        $lesson = Lesson::factory()->create(['module_id' => $module->id]);

        LessonProgress::factory()->create([
            'user_id' => $user->id,
            'lesson_id' => $lesson->id,
            'completed' => true,
            'completed_at' => now(),
        ]);

        $certificate = $this->service->issueCertificate($user, $course->id);

        Queue::assertPushed(GenerateCertificatePdfJob::class, function ($job) use ($certificate) {
            return $job->certificate->id === $certificate->id;
        });
    }

    public function test_issue_certificate_loads_user_and_course_relationships(): void
    {
        $user = User::factory()->create(['name' => 'Test User']);
        $course = Course::factory()->create(['title' => 'Test Course']);
        $module = CourseModule::factory()->create(['course_id' => $course->id]);
        $lesson = Lesson::factory()->create(['module_id' => $module->id]);

        LessonProgress::factory()->create([
            'user_id' => $user->id,
            'lesson_id' => $lesson->id,
            'completed' => true,
            'completed_at' => now(),
        ]);

        $certificate = $this->service->issueCertificate($user, $course->id);

        $this->assertTrue($certificate->relationLoaded('user'));
        $this->assertTrue($certificate->relationLoaded('course'));
        $this->assertEquals('Test User', $certificate->user->name);
        $this->assertEquals('Test Course', $certificate->course->title);
    }

    public function test_issue_certificate_generates_unique_hash(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $course = Course::factory()->create();
        $module = CourseModule::factory()->create(['course_id' => $course->id]);
        $lesson = Lesson::factory()->create(['module_id' => $module->id]);

        // Complete course for both users
        LessonProgress::factory()->create([
            'user_id' => $user1->id,
            'lesson_id' => $lesson->id,
            'completed' => true,
            'completed_at' => now(),
        ]);
        LessonProgress::factory()->create([
            'user_id' => $user2->id,
            'lesson_id' => $lesson->id,
            'completed' => true,
            'completed_at' => now(),
        ]);

        $cert1 = $this->service->issueCertificate($user1, $course->id);
        $cert2 = $this->service->issueCertificate($user2, $course->id);

        $this->assertNotEquals($cert1->hash, $cert2->hash);
    }

    public function test_issue_certificate_throws_exception_when_course_not_completed(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create();
        $module = CourseModule::factory()->create(['course_id' => $course->id]);
        Lesson::factory()->create(['module_id' => $module->id]);

        // No progress

        $this->expectException(AuthorizationException::class);
        $this->expectExceptionMessage('Cannot issue certificate. Course not completed or already issued.');

        $this->service->issueCertificate($user, $course->id);
    }

    public function test_issue_certificate_throws_exception_when_certificate_already_exists(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create();
        $module = CourseModule::factory()->create(['course_id' => $course->id]);
        $lesson = Lesson::factory()->create(['module_id' => $module->id]);

        LessonProgress::factory()->create([
            'user_id' => $user->id,
            'lesson_id' => $lesson->id,
            'completed' => true,
            'completed_at' => now(),
        ]);

        // Already has certificate
        Certificate::factory()->create([
            'user_id' => $user->id,
            'course_id' => $course->id,
        ]);

        $this->expectException(AuthorizationException::class);

        $this->service->issueCertificate($user, $course->id);
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
        $this->assertTrue($result->relationLoaded('course'));
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

    public function test_multiple_courses_can_have_separate_certificates(): void
    {
        $user = User::factory()->create();

        $course1 = Course::factory()->create();
        $module1 = CourseModule::factory()->create(['course_id' => $course1->id]);
        $lesson1 = Lesson::factory()->create(['module_id' => $module1->id]);

        $course2 = Course::factory()->create();
        $module2 = CourseModule::factory()->create(['course_id' => $course2->id]);
        $lesson2 = Lesson::factory()->create(['module_id' => $module2->id]);

        // Complete both courses
        LessonProgress::factory()->create([
            'user_id' => $user->id,
            'lesson_id' => $lesson1->id,
            'completed' => true,
            'completed_at' => now(),
        ]);
        LessonProgress::factory()->create([
            'user_id' => $user->id,
            'lesson_id' => $lesson2->id,
            'completed' => true,
            'completed_at' => now(),
        ]);

        $cert1 = $this->service->issueCertificate($user, $course1->id);
        $cert2 = $this->service->issueCertificate($user, $course2->id);

        $this->assertNotEquals($cert1->id, $cert2->id);
        $this->assertEquals($course1->id, $cert1->course_id);
        $this->assertEquals($course2->id, $cert2->course_id);

        $userCertificates = $this->service->getUserCertificates($user);
        $this->assertCount(2, $userCertificates);
    }

    public function test_course_with_multiple_modules_requires_all_lessons_completed(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create();

        $module1 = CourseModule::factory()->create(['course_id' => $course->id]);
        $lesson1 = Lesson::factory()->create(['module_id' => $module1->id]);
        $lesson2 = Lesson::factory()->create(['module_id' => $module1->id]);

        $module2 = CourseModule::factory()->create(['course_id' => $course->id]);
        $lesson3 = Lesson::factory()->create(['module_id' => $module2->id]);

        // Complete only lessons in module 1
        LessonProgress::factory()->create([
            'user_id' => $user->id,
            'lesson_id' => $lesson1->id,
            'completed' => true,
            'completed_at' => now(),
        ]);
        LessonProgress::factory()->create([
            'user_id' => $user->id,
            'lesson_id' => $lesson2->id,
            'completed' => true,
            'completed_at' => now(),
        ]);
        // lesson3 not completed

        $this->assertFalse($this->service->canIssueCertificate($user, $course));

        // Now complete lesson3
        LessonProgress::factory()->create([
            'user_id' => $user->id,
            'lesson_id' => $lesson3->id,
            'completed' => true,
            'completed_at' => now(),
        ]);

        $this->assertTrue($this->service->canIssueCertificate($user, $course));
    }
}
